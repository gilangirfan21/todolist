import pg from 'pg'
import { loadMigrationEnv } from './_env.mjs'

const { SOURCE_DB_URL, TARGET_DB_URL } = loadMigrationEnv()

async function getGeneratedColumns(target, schemaName, table) {
  const { rows } = await target.query(
    `select column_name from information_schema.columns
     where table_schema = $1 and table_name = $2 and is_generated = 'ALWAYS'`,
    [schemaName, table],
  )
  return new Set(rows.map((r) => r.column_name))
}

async function copyTable(source, target, schemaName, table, { onConflict = 'id' } = {}) {
  const qualified = `${schemaName}.${table}`
  const { rows } = await source.query(`select * from ${qualified}`)
  console.log(`${qualified}: ${rows.length} row(s) in source`)
  if (rows.length === 0) return

  const generatedColumns = await getGeneratedColumns(target, schemaName, table)

  let copied = 0
  let skipped = 0
  for (const row of rows) {
    const columns = Object.keys(row).filter((c) => !generatedColumns.has(c))
    const values = columns.map((c) => row[c])
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ')
    const colList = columns.map((c) => `"${c}"`).join(', ')
    const sql = `insert into ${qualified} (${colList}) values (${placeholders}) on conflict (${onConflict}) do nothing`
    try {
      const res = await target.query(sql, values)
      if (res.rowCount > 0) copied++
      else skipped++
    } catch (err) {
      console.error(`\nFailed inserting into ${qualified}, row id=${row.id ?? '(no id)'}: ${err.message}`)
      throw err
    }
  }
  console.log(`  -> copied ${copied}, already present ${skipped}`)
}

const source = new pg.Client({ connectionString: SOURCE_DB_URL })
const target = new pg.Client({ connectionString: TARGET_DB_URL })
await source.connect()
await target.connect()

try {
  // Order matters: users before identities/categories/todos, categories before todos (FKs).
  await copyTable(source, target, 'auth', 'users')
  await copyTable(source, target, 'auth', 'identities')
  await copyTable(source, target, 'public', 'categories')
  await copyTable(source, target, 'public', 'todos')
  console.log(
    '\nData copy done. This script is safe to re-run (existing ids are skipped via ON CONFLICT DO NOTHING).' +
      '\nNext: run 03-verify.mjs, then manually log in against the TARGET project in the app to confirm auth actually works before repointing .env for good.',
  )
} finally {
  await source.end()
  await target.end()
}
