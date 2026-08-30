#!/usr/bin/env node
/**
 * Download HSK1 workbook PDF from Google Drive to public/workbook.pdf
 * Run: npm run download-workbook
 */
import { createWriteStream, existsSync, statSync, mkdirSync } from 'fs'
import { get } from 'https'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const PDF_ID = '1BFN-Ebu_GxyVgV9_xBYVMjKsgTt0plLr'
const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../public')
const DEST = join(OUT_DIR, 'workbook.pdf')

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

  if (existsSync(DEST) && statSync(DEST).size > 100_000) {
    console.log(`Skip — workbook.pdf already exists (${Math.round(statSync(DEST).size / 1024 / 1024)} MB)`)
    return
  }

  console.log('Downloading HSK1 workbook PDF...')
  try {
    await downloadFile(PDF_ID, DEST)
    const size = statSync(DEST).size
    if (size < 100_000) {
      console.error('FAILED — file too small')
      process.exit(1)
    }
    console.log(`OK (${Math.round((size / 1024 / 1024) * 10) / 10} MB)`)
  } catch (err) {
    console.error(`FAILED (${err.message})`)
    process.exit(1)
  }
}

main()
