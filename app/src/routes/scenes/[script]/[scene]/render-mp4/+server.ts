import { error, json } from '@sveltejs/kit';
import { chromium } from 'playwright';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import { findScene, findScript } from '$lib/feature-sweep/catalog';

const execFileAsync = promisify(execFile);

type ExportProfile = 'lowres' | 'medres' | 'hires';

type ProfileSpec = {
  width: number;
  height: number;
  fps: number;
  seconds: number;
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
  lowres: { width: 854, height: 480, fps: 15, seconds: 7 },
  medres: { width: 1280, height: 720, fps: 30, seconds: 7 },
  hires: { width: 1920, height: 1080, fps: 60, seconds: 7 },
};

function repoRootFromCwd(cwd: string): string {
  return basename(cwd) === 'app' ? resolve(cwd, '..') : cwd;
}

function outputPath(
  repoRoot: string,
  scriptId: string,
  sceneId: string,
  profile: ExportProfile,
): string {
  return resolve(
    repoRoot,
    'media',
    'ts-mp4',
    scriptId,
    sceneId,
    `${profile}.mp4`,
  );
}

async function transcodeToMp4(
  sourceWebm: string,
  targetMp4: string,
  fps: number,
): Promise<void> {
  await execFileAsync('ffmpeg', [
    '-y',
    '-i',
    sourceWebm,
    '-r',
    String(fps),
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    targetMp4,
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

async function probeMp4(path: string): Promise<ExportReport> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-print_format',
    'json',
    '-show_format',
    '-show_streams',
    path,
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
    sizeBytes: fs.size,
  };
}

async function thumbnailDataUrl(
  mp4Path: string,
  pngPath: string,
  atSec: number,
): Promise<string> {
  await execFileAsync('ffmpeg', [
    '-y',
    '-ss',
    atSec.toFixed(3),
    '-i',
    mp4Path,
    '-frames:v',
    '1',
    pngPath,
  ]);
  const bytes = await readFile(pngPath);
  return `data:image/png;base64,${bytes.toString('base64')}`;
}

export async function POST({ params, request }) {
  const script = findScript(params.script);
  const scene = findScene(params.script, params.scene);
  if (!script || !scene) {
    throw error(404, 'Unknown script/scene');
  }

  const body = await request.json().catch(() => ({}));
  const profile = body.profile as ExportProfile;
  if (!profile || !(profile in PROFILE_SPECS)) {
    throw error(400, 'Invalid export profile');
  }

  const spec = PROFILE_SPECS[profile];
  const repoRoot = repoRootFromCwd(process.cwd());
  const outPath = outputPath(repoRoot, params.script, params.scene, profile);
  await mkdir(dirname(outPath), { recursive: true });

  const tempDir = await mkdtemp(join(tmpdir(), 'dlx-sweep-video-'));
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: spec.width, height: spec.height },
      recordVideo: {
        dir: tempDir,
        size: { width: spec.width, height: spec.height },
      },
    });

    const page = await context.newPage();
    const sourceUrl = new URL(request.url);
    const targetUrl =
      `${sourceUrl.origin}/scenes/${params.script}/${params.scene}?capture=1`;

    await page.goto(targetUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(spec.seconds * 1000);

    const video = page.video();
    await page.close();
    await context.close();

    const webmPath = await video?.path();
    if (!webmPath) {
      throw error(500, 'TS capture failed: no recorded video file');
    }

    await transcodeToMp4(webmPath, outPath, spec.fps);
    const report = await probeMp4(outPath);
    const thumbPath = outPath.replace(/\.mp4$/, '.thumb.png');
    const seek = Math.max(0, Math.min(report.durationSec * 0.5, 2));
    const thumbnail = await thumbnailDataUrl(outPath, thumbPath, seek);
    return json({
      path: outPath,
      folderPath: dirname(outPath),
      report,
      thumbnail,
    });
  } catch (cause) {
    console.error('ts mp4 export failed', cause);
    throw error(500, 'TS MP4 export failed.');
  } finally {
    await browser.close().catch(() => undefined);
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
