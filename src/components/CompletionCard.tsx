import { useCallback, useEffect, useRef, useState } from 'react'
import { formatDistance, formatDuration, formatSteps } from '../format'
import { getStreak, recordWalk } from '../storage'
import type { WalkPlan } from '../types'

type CompletionCardProps = {
  plan: WalkPlan
  onClose: () => void
}

const CELEBRATIONS = [
  '🎉 You crushed it!',
  '🏆 Walk complete!',
  '🔥 10k warrior!',
  '💪 Look at you go!',
  '⭐ Walking legend!',
  '🌟 Nailed it!',
  '👏 Steps conquered!',
]

const FUN_FACTS = [
  'You just walked roughly the height of the Burj Khalifa — twice!',
  'That's about 400 calories burned. Nice work!',
  'Your walk covered roughly 80 city blocks.',
  'The average person sits 10 hours a day — not you!',
  'Walking 10k steps daily cuts heart disease risk by 40%.',
  'You just gave your brain a creativity boost that lasts hours.',
]

function pickRandom<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]
}

function drawCard(
  canvas: HTMLCanvasElement,
  plan: WalkPlan,
  streak: { current: number; total: number },
  seed: number,
) {
  const W = 1080
  const H = 1350
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#0d3d34')
  grad.addColorStop(0.5, '#1a6b5a')
  grad.addColorStop(1, '#0f4a3e')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // Decorative circles
  ctx.globalAlpha = 0.06
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(180, 280, 320, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(900, 1000, 280, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // Top badge
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  roundRect(ctx, W / 2 - 140, 100, 280, 48, 24)
  ctx.fill()
  ctx.font = '600 18px Outfit, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.fillText('10k steps · walk complete', W / 2, 130)

  // Celebration text
  ctx.font = '700 52px Fraunces, Georgia, serif'
  ctx.fillStyle = '#e0a84b'
  ctx.fillText(pickRandom(CELEBRATIONS, seed), W / 2, 240)

  // Big step count
  ctx.font = '700 160px Fraunces, Georgia, serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(formatSteps(plan.steps), W / 2, 440)

  ctx.font = '600 36px Outfit, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  ctx.fillText('steps walked', W / 2, 490)

  // Route info card
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  roundRect(ctx, 80, 550, W - 160, 200, 28)
  ctx.fill()

  ctx.textAlign = 'left'
  ctx.font = '500 22px Outfit, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText('FROM', 130, 600)
  ctx.font = '600 28px Outfit, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(plan.origin.label, 130, 636)

  ctx.font = '500 22px Outfit, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  ctx.fillText('TO', 130, 690)
  ctx.font = '600 28px Outfit, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(plan.destination.label, 130, 726)

  ctx.textAlign = 'right'
  ctx.font = '600 28px Outfit, sans-serif'
  ctx.fillStyle = '#e0a84b'
  ctx.fillText(formatDistance(plan.distanceM).split(' · ')[0], W - 130, 636)
  ctx.fillText(formatDuration(plan.durationS), W - 130, 726)

  // Stats row
  const statsY = 830
  const cols = [
    { label: '🔥 Streak', value: `${streak.current} day${streak.current !== 1 ? 's' : ''}` },
    { label: '🏅 Total walks', value: String(streak.total) },
    { label: '🗓️ Today', value: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
  ]
  const colW = (W - 160) / cols.length
  cols.forEach((col, i) => {
    ctx.textAlign = 'center'
    const cx = 80 + colW * i + colW / 2
    ctx.font = '500 20px Outfit, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.55)'
    ctx.fillText(col.label, cx, statsY)
    ctx.font = '700 36px Outfit, sans-serif'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(col.value, cx, statsY + 46)
  })

  // Fun fact
  ctx.textAlign = 'center'
  ctx.font = 'italic 24px Fraunces, Georgia, serif'
  ctx.fillStyle = 'rgba(255,255,255,0.65)'
  wrapText(ctx, `"${pickRandom(FUN_FACTS, seed + 3)}"`, W / 2, 990, W - 200, 34)

  // Footer branding
  ctx.font = '600 26px Outfit, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.45)'
  ctx.fillText('10k steps · tenk.walk', W / 2, H - 80)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const words = text.split(' ')
  let line = ''
  let cy = y
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, cy)
      line = word
      cy += lineH
    } else {
      line = test
    }
  }
  ctx.fillText(line, x, cy)
}

export function CompletionCard({ plan, onClose }: CompletionCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [streak, setStreak] = useState({ current: 0, total: 0 })
  const [copied, setCopied] = useState(false)
  const seed = plan.steps

  useEffect(() => {
    const s = recordWalk()
    setStreak(getStreak())
    void s
  }, [])

  useEffect(() => {
    if (canvasRef.current) {
      drawCard(canvasRef.current, plan, streak, seed)
    }
  }, [plan, streak, seed])

  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `10k-steps-${new Date().toISOString().slice(0, 10)}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }, [])

  const handleShare = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) return
      if (navigator.share) {
        await navigator.share({
          title: `I walked ${formatSteps(plan.steps)} steps!`,
          text: `Just completed a ${formatDistance(plan.distanceM)} walk with 10k steps 🚶‍♂️`,
          files: [new File([blob], '10k-steps.png', { type: 'image/png' })],
        })
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }
    } catch {
      handleDownload()
    }
  }, [plan, handleDownload])

  return (
    <div className="completion-overlay" onClick={onClose}>
      <div className="completion-modal" onClick={(e) => e.stopPropagation()}>
        <button className="completion-close" type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <canvas ref={canvasRef} className="completion-canvas" />
        <div className="completion-actions">
          <button className="primary wide" type="button" onClick={handleShare}>
            {copied ? '✓ Copied to clipboard!' : '📤 Share'}
          </button>
          <button className="ghost-btn wide" type="button" onClick={handleDownload}>
            💾 Save image
          </button>
        </div>
        <p className="completion-streak">
          🔥 {streak.current} day streak · {streak.total} total walk{streak.total !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
