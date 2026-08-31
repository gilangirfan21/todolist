import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(here, '..', '.migration.env')

export function loadMigrationEnv() {
  if (!existsSync(envPath)) {
    console.error(
      `Missing ${envPath}\nCopy supabase/.migration.env.example to supabase/.migration.env and fill in SOURCE_DB_URL / TARGET_DB_URL first.`,
    )
    process.exit(1)
  }

  const vars = {}
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    vars[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }

  for (const key of ['SOURCE_DB_URL', 'TARGET_DB_URL']) {
    if (!vars[key]) {
      console.error(`Missing ${key} in ${envPath}`)
      process.exit(1)
    }
  }

  return vars
}
