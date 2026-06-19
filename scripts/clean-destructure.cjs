// Strip unused locals from `const { a, b } = useX()` and similar destructure
// patterns when they're the only use. We rely on a simple heuristic: if a
// destructured name is referenced exactly once (in the destructure itself),
// remove it. To be safe we only remove from `const { ... } = useHook()` style
// and verify the name is not used elsewhere.
const fs = require('fs')
const path = require('path')

const SRC = path.join(process.cwd(), 'src')

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (/\.(jsx|js)$/.test(e.name)) out.push(p)
  }
  return out
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function stripName(s) {
  // take identifier before `:`
  const colon = s.indexOf(':')
  if (colon >= 0) s = s.slice(0, colon)
  return s.replace(/\s+as\s+/, '').trim()
}

let total = 0
for (const file of walk(SRC)) {
  const src0 = fs.readFileSync(file, 'utf8')
  const next = src0.replace(/^(\s*)const\s*\{\s*([^}]+)\s*\}\s*=\s*(\w+)\s*\(\s*\)\s*;?$/gm, (full, indent, raw, hookName) => {
    const items = raw.split(',').map((s) => s.trim()).filter(Boolean)
    if (items.length <= 1) return full
    const haystack = src0
    const good = items.filter((s) => {
      const n = stripName(s)
      if (!n) return false
      // count occurrences outside this destructure
      const rest = haystack.replace(full, '')
      const re = new RegExp(`\\b${escapeRe(n)}\\b`, 'g')
      const m = rest.match(re)
      return m && m.length > 0
    })
    if (good.length === items.length) return full
    if (good.length === 0) return ''
    return `${indent}const { ${good.join(', ')} } = ${hookName}()`
  })
  if (next !== src0) {
    fs.writeFileSync(file, next, 'utf8')
    total += 1
    console.log('cleaned:', path.relative(process.cwd(), file))
  }
}
console.log('Files cleaned:', total)
