import pg from 'pg'
import { loadMigrationEnv } from './_env.mjs'

const { SOURCE_DB_URL, TARGET_DB_URL } = loadMigrationEnv()

async function inspect(label, connectionString) {
  const client = new pg.Client({ connectionString })
  await client.connect()
  console.log(`\n=== ${label} ===`)

  const tables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
    order by table_name
  `)
  console.log('public tables:', tables.rows.map((r) => r.table_name).join(', ') || '(none)')

  for (const table of ['categories', 'todos']) {
    if (tables.rows.some((r) => r.table_name === table)) {
      const count = await client.query(`select count(*)::int as n from public.${table}`)
      console.log(`  public.${table} row count:`, count.rows[0].n)
    }
  }

  const users = await client.query('select count(*)::int as n from auth.users')
  console.log('auth.users row count:', users.rows[0].n)

  await client.end()
}

await inspect('SOURCE (todolist)', SOURCE_DB_URL)
await inspect('TARGET (superapp)', TARGET_DB_URL)

console.log(
  '\nIf TARGET already has non-empty todos/categories tables from another app, stop and tell Claude before continuing — the schema/data-copy scripts assume TARGET starts either empty or with a matching, currently-empty schema.',
)
