// `bun run check`: the same checks as the Live check page, in the terminal.
// Needs the API running (bun run dev).
const API = `http://127.0.0.1:${process.env.PORT || 4000}/api/demo`

let list
try {
  list = await (await fetch(`${API}/checks`)).json()
} catch {
  console.error('\n  The FestPass API is not running. Start it first: bun run dev\n')
  process.exit(1)
}

let passed = 0
let rule = ''
console.log('')
for (const c of list) {
  if (c.rule !== rule) console.log(`  ${(rule = c.rule)}`)
  const r = await (await fetch(`${API}/checks/${c.id}`, { method: 'POST' })).json()
  if (r.pass) passed++
  console.log(`    ${r.pass ? 'PASS' : 'FAIL'}  ${c.title}`)
  if (!r.pass) console.log(`          ${r.detail}`)
}
console.log(`\n  ${passed} / ${list.length} checks pass\n`)
process.exit(passed === list.length ? 0 : 1)
