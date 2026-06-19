// More aggressive cleanup: read the file, find every `import { a, b, c } from 'x'`,
// then for each name check if it appears outside imports. Drop if not.
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

function stripName(s) {
  return s.replace(/\s+as\s+/, '').trim()
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

let total = 0
for (const file of walk(SRC)) {
  const src0 = fs.readFileSync(file, 'utf8')
  const lines = src0.split('\n')
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const m = line.match(/^(\s*)import\s+(?:\{([^}]+)\}|(\w+))\s+from\s+(['"])([^'"]+)\4\s*;?\s*$/)
    if (!m) { out.push(line); continue }
    const [, indent, namedRaw, defName, , srcPath] = m
    // Build haystack: every other line
    const haystack = lines.slice(0, i).concat(lines.slice(i + 1)).join('\n')
    let kept = line
    if (namedRaw) {
      const items = namedRaw.split(',').map((s) => s.trim()).filter(Boolean)
      const good = items.filter((s) => {
        const n = stripName(s)
        const re = new RegExp(`\\b${escapeRe(n)}\\b`)
        return re.test(haystack)
      })
      if (good.length === 0) {
        kept = ''
      } else if (good.length !== items.length) {
        kept = `${indent}import { ${good.join(', ')} } from ${m[4]}${srcPath}${m[4]};`
      }
    } else if (defName) {
      const re = new RegExp(`\\b${escapeRe(defName)}\\b`)
      if (!re.test(haystack)) kept = ''
    }
    out.push(kept)
  }
  const next = out.join('\n')
  if (next !== src0) {
    fs.writeFileSync(file, next, 'utf8')
    total += 1
    console.log('cleaned:', path.relative(process.cwd(), file))
  }
}
console.log('Files cleaned:', total)
