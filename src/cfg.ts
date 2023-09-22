import * as DotEnv from 'dotenv'
import { expand } from 'dotenv-expand'
import path from 'path'
import { existsSync, realpathSync } from 'fs'
import { InvalidArgumentError } from './error'

type Loglevel = 'INFO' | 'DEBUG'
export type Config = {
  REDIS_HOST: string
  REDIS_PORT: string
  LOGLEVEL: Loglevel
  TRANSCODE_CONCURRENCY: string
}

function loadEnv(): Config {
  const appDirectory = realpathSync(process.cwd())
  const resolveApp = (relativePath: string) => {
    return path.resolve(appDirectory, relativePath)
  }
  const envPath = resolveApp('config/.env')

  let cfg: Config | undefined = undefined
  /**
   * `.dev` is the base of all fields.\
   * and `.env.development` or `.env.production` will override `.dev`\
   * and you can create a `.env.local` in your local dev env, it will override previous 2 env.
   */
  const dotenvFiles: string[] = [
    `${envPath}.local`,
    `${envPath}.${process.env.NODE_ENV}`,
    envPath,
  ]

  dotenvFiles.forEach((path) => {
    if (existsSync(path)) {
      const cfg0 = DotEnv.config({ path })
      const expanded = expand(cfg0)
      if (expanded.error) throw expanded.error
      cfg = expanded.parsed as Config
    }
  })

  if (!cfg) throw new Error('failed to create cfg: still undefined')
  return cfg
}

const cfgRaw = loadEnv()

const cfg: Config = {
  ...cfgRaw,
  // derived data
} as const

/**
 * @returns the config singleton
 */
function getCfg(): Config {
  return cfg
}

function getCfgNumberProperty(
  key: keyof Config,
  type: 'integer' | 'float',
): number {
  const parseNum = type === 'integer' ? parseInt : parseFloat

  const value = getCfg()[key]
  if (!value) {
    throw new InvalidArgumentError(`ENV property: ${key} missing`)
  }
  const isNumber = !Number.isNaN(parseNum(value))
  const hasDigitDot = value.includes('.')
  if (type === 'integer' && hasDigitDot) {
    throw new InvalidArgumentError(`ENV property: ${key}: ${value} invalid for type integer`)
  }

  if (isNumber) {
    return parseNum(value)
  } else {
    throw new InvalidArgumentError(`ENV property: ${key}: ${value} invalid`)
  }
}

function getNumberEnv(key: keyof Config): number {
  return getCfgNumberProperty(key, 'integer')
}

function getStringEnv(key: keyof Config): string {
  const value = getCfg()[key]
  if (!value) throw new InvalidArgumentError(`ENV property: ${key} missing`)
  return value
}

export {
  getNumberEnv,
  getStringEnv,
  getCfg
}
