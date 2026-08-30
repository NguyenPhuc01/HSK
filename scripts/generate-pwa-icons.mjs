#!/usr/bin/env node
/** Generate PWA icons from brand design */
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createCanvas } from '@napi-rs/canvas'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public')

function roundedRect(ctx, x, y, w, h, rad) {
  ctx.beginPath()
  ctx.moveTo(x + rad, y)
  ctx.lineTo(x + w - rad, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad)
  ctx.lineTo(x + w, y + h - rad)
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h)
  ctx.lineTo(x + rad, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad)
  ctx.lineTo(x, y + rad)
  ctx.quadraticCurveTo(x, y, x + rad, y)
  ctx.closePath()
}

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const r = size * 0.21875

  const grad = ctx.createLinearGradient(0, 0, size, size)
  grad.addColorStop(0, '#2dd4bf')
  grad.addColorStop(0.45, '#0d9488')
  grad.addColorStop(1, '#065f46')

  roundedRect(ctx, 0, 0, size, size, r)
  ctx.fillStyle = grad
  ctx.fill()

  const shine = ctx.createLinearGradient(size * 0.25, size * 0.18, size * 0.62, size * 0.55)
  shine.addColorStop(0, 'rgba(255,255,255,0.28)')
  shine.addColorStop(1, 'rgba(255,255,255,0)')
  roundedRect(ctx, 0, 0, size, size, r)
  ctx.fillStyle = shine
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.22)'
  ctx.lineWidth = size * 0.039
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.arc(size / 2, size * 0.78, size * 0.25, Math.PI * 1.12, Math.PI * 1.88)
  ctx.stroke()

  ctx.strokeStyle = 'rgba(255,255,255,0.16)'
  ctx.lineWidth = size * 0.031
  ctx.beginPath()
  ctx.moveTo(size / 2, size * 0.45)
  ctx.lineTo(size / 2, size * 0.68)
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = `700 ${Math.round(size * 0.38)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('中', size / 2, size * 0.52)

  const bx = size * 0.746
  const by = size * 0.746
  const br = size * 0.145
  ctx.beginPath()
  ctx.arc(bx, by, br, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.fillStyle = '#0f766e'
  ctx.font = `800 ${Math.round(size * 0.14)}px sans-serif`
  ctx.fillText('1', bx, by + size * 0.012)

  const barW = size * 0.035
  const barGap = size * 0.058
  const baseY = size * 0.84
  const heights = [size * 0.086, size * 0.148, size * 0.195]
  const startX = size * 0.34
  heights.forEach((h, i) => {
    const x = startX + i * barGap
    roundedRect(ctx, x, baseY - h, barW, h, barW / 2)
    ctx.fillStyle = 'rgba(255,255,255,0.88)'
    ctx.fill()
  })

  return canvas.toBuffer('image/png')
}

mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'pwa-192.png'), drawIcon(192))
writeFileSync(join(outDir, 'pwa-512.png'), drawIcon(512))
writeFileSync(join(outDir, 'apple-touch-icon.png'), drawIcon(180))
console.log('PWA icons generated')
