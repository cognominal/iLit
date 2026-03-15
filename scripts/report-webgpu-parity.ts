import { spawn, execFile } from 'node:child_process';
import {
  mkdtemp,
  readFile,
  rm,
  writeFile
} from 'node:fs/promises';
import { dirname, relative, resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import { pyDurationSecFor } from '../app/src/lib/ts-feature-sweep/py-duration-ms';

type PairResult = {
  scene: string;
  pyDurationSec: number;
  tsDurationSec: number | null;
  ssim: number | null;
  deltaSec: number | null;
  status: string;
  note: string;
};

type FfprobeJson = {
  format?: {
    duration?: string;
  };
};

type PlaywrightModule =
  typeof import('../app/node_modules/playwright/index.mjs');
type Browser = Awaited<ReturnType<PlaywrightModule['chromium']['launch']>>;
type BrowserContext = Awaited<ReturnType<Browser['newContext']>>;

const execFileAsync = promisify(execFile);
const PROFILE = {
  width: 1280,
  height: 720,
  fps: 30
} as const;
const REPORT_PATH = resolve(
  '/Users/cog/mine/dlx_sv',
  'WEBGPU-MP4-PARITY-REPORT.md'
);
const PY_ROOT = resolve('/Users/cog/mine/dlx_sv', 'media', 'py-mp4');
const TS_ROOT = resolve('/Users/cog/mine/dlx_sv', 'media', 'ts-mp4', 'ts-sweep');
const DEV_PORT = 4174;
const CHROME_PATH =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

function repoRootFromCwd(cwd: string): string {
  return cwd.endsWith('/app') ? resolve(cwd, '..') : cwd;
}

function parseSceneInfo(
  relPath: string
): { scriptId: string; sceneId: string } | null {
  const parts = relPath.split('/');
  if (parts.length !== 3) return null;
  const [scriptId, sceneId, file] = parts;
  if (file !== 'medres.mp4') return null;
  if (scriptId === 'dlxn') return null;
  return { scriptId, sceneId };
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
  throw new Error(`Timed out waiting for server at ${url}`);
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

async function probeDuration(path: string): Promise<number> {
  const { stdout } = await execFileAsync('ffprobe', [
    '-v',
    'error',
    '-print_format',
    'json',
    '-show_format',
    path
  ]);
  const info = JSON.parse(stdout) as FfprobeJson;
  const duration = Number(info.format?.duration ?? '0');
  return Number.isFinite(duration) ? duration : 0;
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

async function computeSsim(pyMp4: string, tsMp4: string): Promise<number | null> {
  const pyDuration = await probeDuration(pyMp4);
  const tsDuration = await probeDuration(tsMp4);
  const compareSec = Math.min(pyDuration, tsDuration);
  const proc = await execFileAsync('ffmpeg', [
    '-hide_banner',
    '-nostats',
    '-loglevel',
    'info',
    '-t',
    compareSec.toFixed(3),
    '-i',
    pyMp4,
    '-t',
    compareSec.toFixed(3),
    '-i',
    tsMp4,
    '-filter_complex',
    '[0:v]fps=12,scale=640:360:force_original_aspect_ratio=decrease,' +
      'pad=640:360:(ow-iw)/2:(oh-ih)/2:black,setsar=1[v0];' +
      '[1:v]fps=12,scale=640:360:force_original_aspect_ratio=decrease,' +
      'pad=640:360:(ow-iw)/2:(oh-ih)/2:black,setsar=1[v1];' +
      '[v0][v1]ssim=stats_file=-',
    '-an',
    '-f',
    'null',
    '-'
  ]);
  const match = proc.stderr.match(/All:([0-9.]+)/);
  return match ? Number(match[1]) : null;
}

function classify(
  ssim: number | null,
  pyDurationSec: number,
  tsDurationSec: number | null
): { status: string; note: string } {
  if (tsDurationSec === null) {
    return {
      status: 'Render failed',
      note: 'No GPU TS artifact was produced for comparison.'
    };
  }
  if (ssim === null) {
    return {
      status: 'Render failed',
      note: 'SSIM comparison failed.'
    };
  }
  const deltaSec = Math.abs(tsDurationSec - pyDurationSec);
  const relDelta = deltaSec / Math.max(pyDurationSec, 1e-6);
  if (ssim >= 0.97 && relDelta <= 0.15) {
    return {
      status: 'Strong parity',
      note: 'High frame similarity and close duration.'
    };
  }
  if (ssim >= 0.94 && relDelta <= 0.30) {
    return {
      status: 'Good parity',
      note: 'Good shared-frame match with acceptable timing drift.'
    };
  }
  if (ssim >= 0.94) {
    return {
      status: 'Visual match, timing drift',
      note: 'Frames align reasonably well, but runtime drift is large.'
    };
  }
  if (ssim >= 0.85 && relDelta <= 1.0) {
    return {
      status: 'Partial parity',
      note: 'Shared motion is recognizably similar, but not close.'
    };
  }
  return {
    status: 'Low parity',
    note: 'Large visual divergence and/or large timing drift.'
  };
}

function formatNum(value: number | null): string {
  return value === null ? 'n/a' : value.toFixed(4);
}

function formatSec(value: number | null): string {
  return value === null ? 'n/a' : value.toFixed(2);
}

function buildMarkdown(results: PairResult[]): string {
  const counts = results.reduce<Record<string, number>>((acc, result) => {
    acc[result.status] = (acc[result.status] ?? 0) + 1;
    return acc;
  }, {});

  const lines: string[] = [
    '# WebGPU MP4 Parity Report',
    '',
    '## Scope',
    '',
    'This report compares committed Python `medres.mp4` artifacts against',
    'fresh TS captures recorded from the default Three.js-backed scene',
    'route in headed Google Chrome.',
    '',
    'Date of comparison: `2026-03-14`',
    '',
    '## Method',
    '',
    '- Python source of truth: committed `media/py-mp4/**/medres.mp4`.',
    '- TS source of truth: fresh route capture from',
    '  `/ts-scenes/<script>/<scene>?capture=1&autoplay=0`.',
    '- Browser for TS capture: headed Google Chrome via Playwright.',
    '- Each TS capture was trimmed to the Python scene duration target.',
    '- Similarity metric: SSIM on a normalized `12 fps`, `640x360`',
    '  overlap window.',
    '',
    '## Summary',
    '',
    `- Scenes checked: \`${results.length}\``,
    ...Object.keys(counts)
      .sort()
      .map((status) => `- \`${status}\`: \`${counts[status]}\``),
    '',
    '## Results',
    '',
    '| Scene | Status | SSIM | Py sec | GPU TS sec | Delta sec | Note |',
    '| --- | --- | ---: | ---: | ---: | ---: | --- |'
  ];

  for (const result of results) {
    lines.push(
      `| \`${result.scene}\` | ${result.status} | ` +
        `${formatNum(result.ssim)} | ${formatSec(result.pyDurationSec)} | ` +
        `${formatSec(result.tsDurationSec)} | ` +
        `${formatSec(result.deltaSec)} | ${result.note} |`
    );
  }

  lines.push(
    '',
    '## Notes',
    '',
    '- This report is specifically for the default Three.js-backed TS',
    '  scene route.',
    '- Headed Chrome was required here because the report checks true',
    '  WebGPU parity rather than the WebGL fallback path.'
  );

  return lines.join('\n');
}

async function captureGpuTsMp4(
  context: BrowserContext,
  tempDir: string,
  scriptId: string,
  sceneId: string,
  captureSec: number
): Promise<string> {
  const page = await context.newPage();
  await page.addInitScript(() => {
    try {
      window.localStorage.clear();
      window.sessionStorage.clear();
    } catch {}
  });
  const recordingStartMs = Date.now();
  const targetUrl =
    `http://127.0.0.1:${DEV_PORT}/ts-scenes/${scriptId}/${sceneId}` +
    '?capture=1&autoplay=0';

  await page.goto(targetUrl, {
    waitUntil: 'networkidle',
    timeout: 120_000
  });
  await page.waitForSelector(
    '[data-testid="webgpu-scene-stage"][data-renderer="gpu"]',
    { timeout: 30_000 }
  );

  const captureStartSec = (Date.now() - recordingStartMs) / 1000;
  await page.evaluate(() => {
    window.dispatchEvent(new Event('ts-sweep-capture-start'));
  });
  await page.waitForTimeout(captureSec * 1000);

  const video = page.video();
  await page.close();

  const webmPath = await video?.path();
  if (!webmPath) {
    throw new Error(`No recorded GPU video for ${scriptId}/${sceneId}`);
  }
  const sourceDurationSec = await probeDuration(webmPath);
  const boundedStartSec = Math.max(
    0,
    Math.min(captureStartSec, sourceDurationSec - captureSec)
  );
  const mp4Path = join(tempDir, `${scriptId}--${sceneId}.mp4`);
  await transcodeToMp4(
    webmPath,
    mp4Path,
    PROFILE.fps,
    boundedStartSec,
    captureSec
  );
  return mp4Path;
}

async function main(): Promise<void> {
  const repoRoot = repoRootFromCwd(resolve(process.cwd()));
  const tempDir = await mkdtemp(join(tmpdir(), 'dlx-webgpu-parity-'));
  const devServer = await startDevServer(repoRoot, DEV_PORT);
  await waitForServer(`http://127.0.0.1:${DEV_PORT}/`, 30_000);
  const { chromium } = await import('../app/node_modules/playwright/index.mjs');
  const browser = await chromium.launch({
    headless: false,
    executablePath: CHROME_PATH
  });
  const context = await browser.newContext({
    viewport: {
      width: PROFILE.width,
      height: PROFILE.height
    },
    recordVideo: {
      dir: tempDir,
      size: {
        width: PROFILE.width,
        height: PROFILE.height
      }
    }
  });

  try {
    const pyArtifacts = (await Bun.$`find ${PY_ROOT} -name medres.mp4`
      .text())
      .trim()
      .split('\n')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .sort();

    const results: PairResult[] = [];
    for (const pyMp4 of pyArtifacts) {
      const rel = relative(PY_ROOT, pyMp4).replace(/\\/g, '/');
      const info = parseSceneInfo(rel);
      if (!info) continue;
      const pyDurationSec = await probeDuration(pyMp4);
      const captureSec =
        pyDurationSecFor(info.scriptId, info.sceneId) ?? pyDurationSec;
      let tsMp4: string | null = null;
      let tsDurationSec: number | null = null;
      let ssim: number | null = null;
      try {
        tsMp4 = await captureGpuTsMp4(
          context,
          tempDir,
          info.scriptId,
          info.sceneId,
          captureSec
        );
        tsDurationSec = await probeDuration(tsMp4);
        ssim = await computeSsim(pyMp4, tsMp4);
      } catch (cause) {
        console.error(`GPU capture failed for ${info.scriptId}/${info.sceneId}`);
        console.error(cause);
      }
      const summary = classify(ssim, pyDurationSec, tsDurationSec);
      results.push({
        scene: `${info.scriptId}/${info.sceneId}`,
        pyDurationSec,
        tsDurationSec,
        ssim,
        deltaSec:
          tsDurationSec === null ? null : Math.abs(tsDurationSec - pyDurationSec),
        status: summary.status,
        note: summary.note
      });
    }

    const markdown = buildMarkdown(results);
    await writeFile(REPORT_PATH, markdown, 'utf8');
    console.log(`Wrote ${REPORT_PATH}`);
  } finally {
    await context.close().catch(() => undefined);
    await browser.close().catch(() => undefined);
    await devServer.stop().catch(() => undefined);
    await rm(tempDir, { recursive: true, force: true });
  }
}

await main();
