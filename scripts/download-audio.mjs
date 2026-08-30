#!/usr/bin/env node
/**
 * Download all HSK1 MP3 files from Google Drive to public/audio/
 * Run: npm run download-audio
 */
import { createWriteStream, existsSync, mkdirSync, statSync } from 'fs'
import { get } from 'https'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { audioManifest } from '../src/data/audioManifest.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../public/audio')

function downloadFile(id, dest) {
  return new Promise((resolve, reject) => {
    const url = `https://drive.google.com/uc?export=download&id=${id}`
    get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        get(res.headers.location, (res2) => {
          const file = createWriteStream(dest)
          res2.pipe(file)
          file.on('finish', () => file.close(() => resolve()))
          file.on('error', reject)
        }).on('error', reject)
        return
      }

      const file = createWriteStream(dest)
      res.pipe(file)
      file.on('finish', () => file.close(() => resolve()))
      file.on('error', reject)
    }).on('error', reject)
  })
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })

  let ok = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < audioManifest.length; i++) {
    const { file, id } = audioManifest[i]
    const dest = join(OUT_DIR, file)

    if (existsSync(dest) && statSync(dest).size > 1000) {
      console.log(`[${i + 1}/${audioManifest.length}] skip ${file}`)
      skipped++
      continue
    }

    process.stdout.write(`[${i + 1}/${audioManifest.length}] ${file} ... `)
    try {
      await downloadFile(id, dest)
      const size = statSync(dest).size
      if (size < 1000) {
        console.log('FAILED (file too small)')
        failed++
      } else {
        console.log(`OK (${Math.round(size / 1024)} KB)`)
        ok++
      }
    } catch (err) {
      console.log(`FAILED (${err.message})`)
      failed++
    }
  }

  console.log(`\nDone: ${ok} downloaded, ${skipped} skipped, ${failed} failed`)
  if (failed > 0) process.exit(1)
}

main()
