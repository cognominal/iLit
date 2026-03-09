import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

type Command = 'dev' | 'build'

type ParsedArgs =
  | { command: 'dev' }
  | { command: 'build'; target?: string; bundles?: string }
  | { command: 'help' }

function usage(): string {
  return [
    'Usage:',
    '  bun scripts/tauri.ts dev',
    '  bun scripts/tauri.ts build [--target <triple>] [--bundles <list>]',
    '',
    'Guards:',
    '  By default, build refuses to run if an explicit --target does not',
    '  match this machine OS/arch. Set DLX_ALLOW_CROSS=1 to override.',
    ''
  ].join('\n')
}

function parseArgs(argv: string[]): ParsedArgs {
  if (argv.includes('--help') || argv.includes('-h')) return { command: 'help' }

  const [command, ...rest] = argv
  if (command !== 'dev' && command !== 'build') {
    throw new Error(`Missing/invalid command.\n\n${usage()}`)
  }

  if (command === 'dev') {
    if (rest.length > 0) {
      throw new Error(`Unexpected args for dev.\n\n${usage()}`)
    }
    return { command: 'dev' }
  }

  let target: string | undefined
  let bundles: string | undefined
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i]
    if (arg === '--target') {
      const value = rest[i + 1]
      if (!value) throw new Error(`Missing value for --target.\n\n${usage()}`)
      target = value
      i += 1
      continue
    }
    if (arg === '--bundles') {
      const value = rest[i + 1]
      if (!value) throw new Error(`Missing value for --bundles.\n\n${usage()}`)
      bundles = value
      i += 1
      continue
    }
    throw new Error(`Unknown arg: ${arg}\n\n${usage()}`)
  }

  return { command: 'build', target, bundles }
}

function expectedTargetForCurrentMachine(): string | null {
  const { platform, arch } = process

  if (platform === 'darwin') {
    if (arch === 'arm64') return 'aarch64-apple-darwin'
    if (arch === 'x64') return 'x86_64-apple-darwin'
    return null
  }

  if (platform === 'linux') {
    if (arch === 'x64') return 'x86_64-unknown-linux-gnu'
    if (arch === 'arm64') return 'aarch64-unknown-linux-gnu'
    return null
  }

  if (platform === 'win32') {
    if (arch === 'x64') return 'x86_64-pc-windows-msvc'
    if (arch === 'arm64') return 'aarch64-pc-windows-msvc'
    return null
  }

  return null
}

function tauriProjectDir(): string {
  const here = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(here, '..', 'tauri-app')
}

function main(): never {
  const parsed = parseArgs(process.argv.slice(2))
  if (parsed.command === 'help') {
    console.log(usage())
    process.exit(0)
  }

  const tauriDir = tauriProjectDir()
  const args = ['tauri', parsed.command]

  if (parsed.command === 'build') {
    if (parsed.target) {
      const expected = expectedTargetForCurrentMachine()
      const allowCross = process.env.DLX_ALLOW_CROSS === '1'
      if (!expected) {
        throw new Error(
          `Unsupported platform/arch: ${process.platform}/${process.arch}`
        )
      }
      if (!allowCross && parsed.target !== expected) {
        throw new Error(
          [
            `Refusing to build for ${parsed.target}.`,
            `Expected target for this machine: ${expected}`,
            'Set DLX_ALLOW_CROSS=1 to override.'
          ].join('\n')
        )
      }
      args.push('--target', parsed.target)
    }

    if (parsed.bundles) {
      args.push('--bundles', parsed.bundles)
    }
  }

  const res = spawnSync('cargo', args, {
    cwd: tauriDir,
    stdio: 'inherit',
    env: process.env
  })

  process.exit(res.status ?? 1)
}

try {
  main()
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err)
  console.error(msg)
  process.exit(1)
}
