// One-shot: fix wrong relative imports in all .jsx files under src/.
// Replaces ../../api -> correct depth to reach src/api/index.js
const fs = require('fs')
const path = require('path')

const SRC = path.join(process.cwd(), 'src')

function listJsx(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listJsx(full))
    else if (/\.(jsx|js)$/.test(entry.name)) out.push(full)
  }
  return out
}

function depthFrom(file) {
  // file is under src/. Count slashes after src/.
  const rel = path.relative(SRC, file)
  const parts = rel.split(path.sep)
  return parts.length - 1 // folders above the file
}

function fixImport(stmt, prefix) {
  // turn '../../api' -> '<prefix>api'
  // turn '../../context/X' -> '<prefix>context/X'
  // turn '../../components/...' -> '<prefix>components/...'
  return stmt
    .replace(/from\s+(['"])\.\.\/\.\.\/(api|context|components|hooks|utils|styles)([^'"]*)\1/g, (_, q, p, rest) => `from ${q}${prefix}${p}${rest}${q}`)
    .replace(/from\s+(['"])\.\.\/\.\.\/\.\.\/(api|context|components|hooks|utils|styles)([^'"]*)\1/g, (_, q, p, rest) => `from ${q}${prefix}${p}${rest}${q}`)
}

let changed = 0
for (const file of listJsx(SRC)) {
  const depth = depthFrom(file)
  // src/api is at depth 1 from src/ root. So a file at depth N needs (N) "../" to reach src/,
  // and 1 more to reach src/api => (N) "../" total to src/api.
  // We want imports like "<N>../api" to point to src/api.
  // i.e. prefix = '../'.repeat(depth)
  // (because file is depth folders deep, each "../" goes up one level)
  const prefix = '../'.repeat(depth)

  const src = fs.readFileSync(file, 'utf8')
  const updated = fixImport(src, prefix)
  if (updated !== src) {
    fs.writeFileSync(file, updated, 'utf8')
    changed += 1
    console.log('fixed:', path.relative(process.cwd(), file), 'depth=', depth, 'prefix=', prefix)
  }
}
console.log('Total changed:', changed)
