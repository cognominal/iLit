import { error, json } from '@sveltejs/kit';
import { chromium } from 'playwright';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import { findTsScene, findTsScript } from '$lib/ts-feature-sweep/catalog';
import { pyDurationSecFor } from '$lib/ts-feature-sweep/py-duration-ms';
import { startTsRenderJob, tsRenderJobKey } from
  '$lib/ts-feature-sweep/render-jobs';
import type { RequestHandler } from './$types';

const execFileAsync = promisify(execFile);

type ExportProfile = 'lowres' | 'medres' | 'hires';

type ProfileSpec = {
  width: number;
  height: number;
  fps: number;
};

type ExportReport = {
  durationSec: number;
  width: number;
  height: number;
  fps: number;
  bitrateKbps: number;
  sizeBytes: number;
};

type FfprobeJson = {
  format?: {
    duration?: string;
    bit_rate?: string;
  };
  streams?: Array<{
    codec_type?: string;
    width?: number;
    height?: number;
    r_frame_rate?: string;
  }>;
};

const PROFILE_SPECS: Record<ExportProfile, ProfileSpec> = {
  lowres: { width: 854, height: 480, fps: 15 },
  medres: { width: 1280, height: 720, fps: 30 },
  hires: { width: 1920, height: 1080, fps: 60 }
};

function repoRootFromCwd(cwd: string): string {
  return basename(cwd) === 'app' ? resolve(cwd, '..') : cwd;
}

function outputPath(
  repoRoot: string,
  scriptId: string,
  sceneId: string,
  profile: ExportProfile
): string {
  return resolve(
    repoRoot,
    'media',
    'ts-mp4',
    'ts-sweep',
    scriptId,
    sceneId,
    `${profile}.mp4`
  );
}

async function transcodeToMp4(
  sourceWebm: string,
  targetMp4: string,
  fps: number,
  startSec: number,
  durationSec: number
): Promise<void> {
  await execFileAsync('ffmpeg', [
    '-y',
    '-ss',
    startSec.toFixed(3),
    '-i',
    sourceWebm,
    '-t',
    durationSec.toFixed(3),
    '-r',
    String(fps),
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    targetMp4
  ]);
}

function parseRate(rate: string | undefined): number {
  if (!rate) return 0;
  const [numRaw, denRaw] = rate.split('/');
  const num = Number(numRaw);
  const den = Number(denRaw ?? '1');
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
    return 0;
  }
  return num / den;
}

async function probeMediaDuration(path: string): Promise<number> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'default=nw=1:nk=1',
    path
  ]);
  const duration = Number(stdout.trim());
  return Number.isFinite(duration) ? duration : 0;
}

async function probeMp4(path: string): Promise<ExportReport> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    path
  ]);
  const info = JSON.parse(stdout) as FfprobeJson;
  const video = info.streams?.find((s) => s.codec_type === 'video');
  const fs = await stat(path);
  const bitrate = Number(info.format?.bit_rate ?? '0');
  const duration = Number(info.format?.duration ?? '0');
  return {
    durationSec: Number.isFinite(duration) ? duration : 0,
    width: video?.width ?? 0,
    height: video?.height ?? 0,
    fps: parseRate(video?.r_frame_rate),
    bitrateKbps: Number.isFinite(bitrate) ? bitrate / 1000 : 0,
    sizeBytes: fs.size
  };
}

async function thumbnailDataUrl(
  mp4Path: string,
  pngPath: string,
  atSec: number
): Promise<string> {
  await execFileAsync('ffmpeg', [
    '-y',
    '-ss',
    atSec.toFixed(3),
    '-i',
    mp4Path,
    '-frames:v',
    '1',
    pngPath
  ]);
  const bytes = await readFile(pngPath);
  return `data:image/png;base64,${bytes.toString('base64')}`;
}

async function renderTsMp4(
  scriptId: string,
  sceneId: string,
  profile: ExportProfile,
  requestUrl: string
): Promise<{
  path: string;
  folderPath: string;
  report: ExportReport;
  thumbnail: string;
}> {
  const spec = PROFILE_SPECS[profile];
  const captureSec = pyDurationSecFor(scriptId, sceneId) ?? 6;
  const repoRoot = repoRootFromCwd(process.cwd());
  const outPath = outputPath(repoRoot, scriptId, sceneId, profile);
  await mkdir(dirname(outPath), { recursive: true });

  const tempDir = await mkdtemp(join(tmpdir(), 'dlx-ts-sweep-video-'));
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: spec.width, height: spec.height },
      recordVideo: {
        dir: tempDir,
        size: { width: spec.width, height: spec.height }
      }
    });

    const page = await context.newPage();
    const recordingStartMs = Date.now();
    const sourceUrl = new URL(requestUrl);
    const targetUrl =
      `${sourceUrl.origin}/ts-scenes/${scriptId}/${sceneId}` +
      '?capture=1&autoplay=0';

    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });
    await page.waitForSelector('svg[aria-label="TS scene stage"]', {
      timeout: 30_000,
    });
    const captureStartSec = (Date.now() - recordingStartMs) / 1000;
    await page.evaluate(() => {
      window.dispatchEvent(new Event('ts-sweep-capture-start'));
    });
    await page.waitForTimeout(captureSec * 1000);

    const video = page.video();
    await page.close();
    await context.close();

    const webmPath = await video?.path();
    if (!webmPath) {
      throw error(500, 'TS sweep capture failed: no recorded video file');
    }

    const sourceDurationSec = await probeMediaDuration(webmPath);
    const boundedStartSec = Math.max(
      0,
      Math.min(captureStartSec, sourceDurationSec - captureSec)
    );
    await transcodeToMp4(
      webmPath,
      outPath,
      spec.fps,
      boundedStartSec,
      captureSec
    );
    const report = await probeMp4(outPath);
    const thumbPath = outPath.replace(/\.mp4$/, '.thumb.png');
    const seek = Math.max(0, Math.min(report.durationSec * 0.5, 2));
    const thumbnail = await thumbnailDataUrl(outPath, thumbPath, seek);
    return {
      path: outPath,
      folderPath: dirname(outPath),
      report,
      thumbnail
    };
  } catch (cause) {
    console.error('ts sweep mp4 export failed', cause);
    throw new Error('TS sweep MP4 export failed.');
  } finally {
    await browser.close().catch(() => undefined);
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}

export const POST: RequestHandler = async ({ params, request }) => {
  if (process.env.VERCEL === '1') {
    throw error(403, 'MP4 generation is disabled on read-only deployments.');
  }

  const script = findTsScript(params.script);
  const scene = findTsScene(params.script, params.scene);
  if (!script || !scene) {
    throw error(404, 'Unknown TS script/scene');
  }

  const body = await request.json().catch(() => ({}));
  const profile = body.profile as ExportProfile;
  if (!profile || !(profile in PROFILE_SPECS)) {
    throw error(400, 'Invalid export profile');
  }
  const runAsync = body.async !== false;

  if (runAsync) {
    const key = tsRenderJobKey(params.script, params.scene, profile);
    const { started } = startTsRenderJob(key, async () => {
      await renderTsMp4(params.script, params.scene, profile, request.url);
    });
    return json({
      queued: true,
      started,
      key,
    }, { status: 202 });
  }

  const result = await renderTsMp4(
    params.script,
    params.scene,
    profile,
    request.url
  );
  return json(result);
};
