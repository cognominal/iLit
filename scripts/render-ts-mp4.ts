import { spawn } from 'node:child_process';
import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import { tsScripts } from '../app/src/lib/ts-feature-sweep/catalog';

type Profile = 'lowres' | 'medres' | 'hires';

type Args = {
  scriptId: string;
  sceneId: string;
  profile: Profile;
  port: number;
};

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

const PROFILE_SPECS: Record<Profile, ProfileSpec> = {
  lowres: { width: 854, height: 480, fps: 15, seconds: 7 },
  medres: { width: 1280, height: 720, fps: 30, seconds: 7 },
  hires: { width: 1920, height: 1080, fps: 60, seconds: 7 }
};

const execFileAsync = promisify(execFile);

function repoRootFromCwd(cwd: string): string {
  return cwd.endsWith('/app') ? resolve(cwd, '..') : cwd;
}

function parseArgs(argv: string[]): Args {
  let scriptId = '';
  let sceneId = '';
  let profile: Profile = 'medres';
  let port = 4173;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const value = argv[i + 1];
    if (arg === '--script' && value) {
      scriptId = value;
      i += 1;
      continue;
    }
    if (arg === '--scene' && value) {
      sceneId = value;
      i += 1;
      continue;
    }
    if (arg === '--profile' && value) {
      if (value !== 'lowres' && value !== 'medres' && value !== 'hires') {
        throw new Error(`Invalid profile: ${value}`);
      }
      profile = value;
      i += 1;
      continue;
    }
    if (arg === '--port' && value) {
      const nextPort = Number(value);
      if (!Number.isInteger(nextPort) || nextPort <= 0) {
        throw new Error(`Invalid port: ${value}`);
      }
      port = nextPort;
      i += 1;
    }
  }

  if (!scriptId || !sceneId) {
    throw new Error(
      'Usage: bun run render:ts-mp4 --script <id> --scene <id> ' +
      '[--profile lowres|medres|hires] [--port <number>]'
    );
  }

  return { scriptId, sceneId, profile, port };
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
    path
  ]);
  const info = JSON.parse(stdout) as FfprobeJson;
  const video = info.streams?.find((stream) => stream.codec_type === 'video');
  const stats = await Bun.file(path).stat();
  const bitrate = Number(info.format?.bit_rate ?? '0');
  const duration = Number(info.format?.duration ?? '0');
  return {
    durationSec: Number.isFinite(duration) ? duration : 0,
    width: video?.width ?? 0,
    height: video?.height ?? 0,
    fps: parseRate(video?.r_frame_rate),
    bitrateKbps: Number.isFinite(bitrate) ? bitrate / 1000 : 0,
    sizeBytes: stats.size
  };
}

async function transcodeToMp4(
  sourceWebm: string,
  targetMp4: string,
  fps: number
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
    targetMp4
  ]);
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

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {}
    await Bun.sleep(250);
  }
  throw new Error(`Timed out waiting for dev server at ${url}`);
}

function startDevServer(
  repoRoot: string,
  port: number
): Promise<{ stop: () => Promise<void> }> {
  return new Promise((resolveStart, rejectStart) => {
    const child = spawn(
      'bun',
      ['run', '--cwd', 'app', 'dev', '--host', '127.0.0.1', '--port',
        String(port)],
      {
        cwd: repoRoot,
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe']
      }
    );

    let settled = false;

    const onData = (chunk: Buffer): void => {
      const text = chunk.toString();
      process.stdout.write(text);
      if (!settled && text.includes('Local:')) {
        settled = true;
        resolveStart({
          stop: async () => {
            child.kill('SIGINT');
            await new Promise<void>((resolveStop) => {
              child.once('exit', () => resolveStop());
            });
          }
        });
      }
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk.toString());
    });
    child.once('error', (cause) => {
      if (!settled) {
        settled = true;
        rejectStart(cause);
      }
    });
    child.once('exit', (code) => {
      if (!settled) {
        settled = true;
        rejectStart(new Error(`vite dev exited with code ${code ?? -1}`));
      }
    });
  });
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const script = tsScripts.find((entry) => entry.id === args.scriptId);
  if (!script) {
    throw new Error(`Unknown script id: ${args.scriptId}`);
  }
  const scene = script.scenes.find((entry) => entry.id === args.sceneId);
  if (!scene) {
    throw new Error(
      `Unknown scene id for script ${args.scriptId}: ${args.sceneId}`
    );
  }

  const spec = PROFILE_SPECS[args.profile];
  const repoRoot = repoRootFromCwd(resolve(process.cwd()));
  const outPath = resolve(
    repoRoot,
    'media',
    'ts-mp4',
    'ts-sweep',
    args.scriptId,
    args.sceneId,
    `${args.profile}.mp4`
  );
  await mkdir(dirname(outPath), { recursive: true });

  const tempDir = await mkdtemp(join(tmpdir(), 'dlx-ts-sweep-video-'));
  const devServer = await startDevServer(repoRoot, args.port);
  await waitForServer(`http://127.0.0.1:${args.port}/`, 30_000);

  const { chromium } = await import('../app/node_modules/playwright/index.mjs');
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
    const targetUrl =
      `http://127.0.0.1:${args.port}/ts-scenes/` +
      `${args.scriptId}/${args.sceneId}?capture=1`;

    await page.goto(targetUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 120_000
    });
    await page.waitForSelector('svg[aria-label="TS scene stage"]', {
      timeout: 30_000
    });
    await page.waitForTimeout(spec.seconds * 1000);

    const video = page.video();
    await page.close();
    await context.close();

    const webmPath = await video?.path();
    if (!webmPath) {
      throw new Error('TS sweep capture failed: no recorded video file');
    }

    await transcodeToMp4(webmPath, outPath, spec.fps);
    const report = await probeMp4(outPath);
    const thumbPath = outPath.replace(/\.mp4$/, '.thumb.png');
    const seek = Math.max(0, Math.min(report.durationSec * 0.5, 2));
    await thumbnailDataUrl(outPath, thumbPath, seek);

    console.log(`Saved TS MP4: ${outPath}`);
    console.log(
      `Report: ${report.width}x${report.height}, ` +
      `${report.fps.toFixed(2)} fps, ${report.durationSec.toFixed(2)} sec`
    );
  } finally {
    await browser.close().catch(() => undefined);
    await devServer.stop().catch(() => undefined);
    await rm(tempDir, { recursive: true, force: true });
  }
}

main().catch((cause) => {
  const message = cause instanceof Error ? cause.message : String(cause);
  console.error(message);
  process.exit(1);
});
