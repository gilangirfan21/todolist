import pg from 'pg'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { loadMigrationEnv } from './_env.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const schemaPath = resolve(here, '..', 'schema.sql')

const { TARGET_DB_URL } = loadMigrationEnv()

const POLICIES = [
  ['select own categories', 'categories'],
  ['insert own categories', 'categories'],
  ['update own categories', 'categories'],
  ['delete own categories', 'categories'],
  ['select own todos', 'todos'],
  ['insert own todos', 'todos'],
  ['update own todos', 'todos'],
  ['delete own todos', 'todos'],
]

const client = new pg.Client({ connectionString: TARGET_DB_URL })
await client.connect()

console.log('Dropping existing policies (if any) so this script is safe to re-run...')
const { rows: existingTables } = await client.query(`
  select table_name from information_schema.tables where table_schema = 'public'
`)
const tableNames = new Set(existingTables.map((r) => r.table_name))
for (const [name, table] of POLICIES) {
  if (tableNames.has(table)) {
    await client.query(`drop policy if exists "${name}" on ${table}`)
  }
}

console.log('Applying supabase/schema.sql to TARGET (superapp)...')
const schema = readFileSync(schemaPath, 'utf8')
await client.query(schema)

console.log('Schema applied.')
await client.end()
