import sharp from 'sharp'

/** Nền trắng hoặc đen (ảnh AI thường export nền đen) */
function isBg(r, g, b, a) {
  if (a < 8) return true
  const avg = (r + g + b) / 3
  const isWhite = avg > 245 && r > 238 && g > 238 && b > 232
  const isBlack = avg < 42 && r < 55 && g < 55 && b < 55
  return isWhite || isBlack
}

async function removeBackground(input, output) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })

  const { width, height, channels } = info
  const visited = new Uint8Array(width * height)
  const queue = []

  const idx = (x, y) => (y * width + x) * channels
  const mark = (x, y) => {
    const i = y * width + x
    if (visited[i]) return
    const p = idx(x, y)
    if (!isBg(data[p], data[p + 1], data[p + 2], data[p + 3])) return
    visited[i] = 1
    queue.push([x, y])
  }

  for (let x = 0; x < width; x++) {
    mark(x, 0)
    mark(x, height - 1)
  }
  for (let y = 0; y < height; y++) {
    mark(0, y)
    mark(width - 1, y)
  }

  while (queue.length) {
    const [x, y] = queue.pop()
    data[idx(x, y) + 3] = 0
    if (x > 0) mark(x - 1, y)
    if (x < width - 1) mark(x + 1, y)
    if (y > 0) mark(x, y - 1)
    if (y < height - 1) mark(x, y + 1)
  }

  const out = Buffer.from(data)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x
      if (visited[i]) continue
      const p = idx(x, y)
      if (out[p + 3] === 0) continue

      let nearBg = 0
      for (const [nx, ny] of [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]) {
        if (visited[ny * width + nx]) nearBg++
      }
      if (nearBg === 0) continue

      const r = data[p]
      const g = data[p + 1]
      const b = data[p + 2]
      const avg = (r + g + b) / 3

      if (avg < 55) {
        const darkness = Math.min(255, (55 - avg) * 5)
        out[p + 3] = Math.max(0, out[p + 3] - darkness * (nearBg / 2))
      } else {
        const whiteness = Math.min(255, ((r + g + b) / 3 - 200) * 4)
        out[p + 3] = Math.max(0, 255 - whiteness * (nearBg / 2))
      }
    }
  }

  await sharp(out, { raw: { width, height, channels } })
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(output)

  console.log(`✓ ${output}`)
}

const args = process.argv.slice(2)
if (args.length < 2) {
  console.error('Usage: node scripts/process-tree-png.mjs <input.png> <output.png>')
  process.exit(1)
}

await removeBackground(args[0], args[1])
