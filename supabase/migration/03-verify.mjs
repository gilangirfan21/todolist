import pg from 'pg'
import { loadMigrationEnv } from './_env.mjs'

const { SOURCE_DB_URL, TARGET_DB_URL } = loadMigrationEnv()

const TABLES = [
  ['auth', 'users'],
  ['auth', 'identities'],
  ['public', 'categories'],
  ['public', 'todos'],
]

const source = new pg.Client({ connectionString: SOURCE_DB_URL })
const target = new pg.Client({ connectionString: TARGET_DB_URL })
await source.connect()
await target.connect()

let allMatch = true
for (const [schemaName, table] of TABLES) {
  const qualified = `${schemaName}.${table}`
  const [{ rows: s }, { rows: t }] = await Promise.all([
    source.query(`select count(*)::int as n from ${qualified}`),
    target.query(`select count(*)::int as n from ${qualified}`),
  ])
  const match = s[0].n === t[0].n
  allMatch = allMatch && match
  console.log(`${qualified}: source=${s[0].n} target=${t[0].n} ${match ? 'OK' : 'MISMATCH'}`)
}

console.log('\nSpot-checking one todo row resolves its category_id/user_id on TARGET...')
const { rows: sample } = await target.query(`
  select t.id, t.title, t.user_id, t.category_id,
         (u.id is not null) as user_exists,
         (t.category_id is null or c.id is not null) as category_ok
  from public.todos t
  left join auth.users u on u.id = t.user_id
  left join public.categories c on c.id = t.category_id
  limit 5
`)
console.table(sample)

await source.end()
await target.end()

console.log(allMatch ? '\nAll row counts match.' : '\nSome row counts do not match - investigate before proceeding.')
