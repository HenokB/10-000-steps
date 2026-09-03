import { useState } from 'react'
import { formatDistance, formatDuration, formatSteps } from '../format'
import { defaultMapsUrl, googleMapsUrl, kindCopy } from '../route'
import { TARGET_STEPS, type WalkPlan, type WalkSide } from '../types'
import { CompletionCard } from './CompletionCard'
import { Logo } from './Logo'
import { WalkMap } from './WalkMap'

type SegmentMeta = {
  label: string
  emoji: string
}

type SplitRouteScreenProps = {
  segments: SegmentMeta[]
  plans: WalkPlan[]
  onBack: () => void
  onNewWalk: () => void
}

function sideLabel(side: WalkSide): string {
  switch (side) {
    case 'left': return 'Left'
    case 'right': return 'Right'
    case 'straight': return 'Straight'
    case 'uturn': return 'U-turn'
    case 'start': return 'Start'
    case 'arrive': return 'End'
  }
}

function sideMark(side: WalkSide): string {
  switch (side) {
    case 'left': return '←'
    case 'right': return '→'
    case 'straight': return '↑'
    case 'uturn': return '↩'
    case 'start': return '●'
    case 'arrive': return '★'
  }
}

export function SplitRouteScreen({
  segments,
  plans,
  onBack,
  onNewWalk,
}: SplitRouteScreenProps) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [completed, setCompleted] = useState<boolean[]>(plans.map(() => false))
  const [showCompletion, setShowCompletion] = useState(false)

  const plan = plans[activeIdx]
  const seg = segments[activeIdx]
  const totalSteps = plans.reduce((sum, p) => sum + p.steps, 0)
  const completedSteps = plans.reduce(
    (sum, p, i) => (completed[i] ? sum + p.steps : sum),
    0,
  )
  const allDone = completed.every(Boolean)

  function markComplete(idx: number) {
    setCompleted((prev) => {
      const next = [...prev]
      next[idx] = true
      return next
    })
    const nextIncomplete = plans.findIndex(
      (_, i) => i !== idx && !completed[i],
    )
    if (nextIncomplete >= 0) {
      setActiveIdx(nextIncomplete)
    }
    if (completed.filter(Boolean).length + 1 === plans.length) {
      setShowCompletion(true)
    }
  }

  // Build a combined plan for the completion card
  const combinedPlan: WalkPlan = {
    ...plans[0],
    steps: totalSteps,
    targetSteps: TARGET_STEPS,
    distanceM: plans.reduce((s, p) => s + p.distanceM, 0),
    durationS: plans.reduce((s, p) => s + p.durationS, 0),
    destination: plans[plans.length - 1].destination,
  }

  return (
    <div className="route-layout">
      <aside className="route-panel">
        <div className="top-row">
          <button className="text-btn" type="button" onClick={onBack}>
            ← Back
          </button>
          <Logo size="sm" />
        </div>

        {/* Progress ring */}
        <div className="split-progress">
          <div className="split-progress-ring">
            <svg viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="var(--line)"
                strokeWidth="8"
              />
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="var(--moss)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - completedSteps / TARGET_STEPS)}`}
                transform="rotate(-90 60 60)"
              />
            </svg>
            <span className="split-progress-label">
              {formatSteps(completedSteps)}
              <small>/ {formatSteps(TARGET_STEPS)}</small>
            </span>
          </div>
          <p className="split-progress-text">
            {allDone
              ? '🎉 All walks complete!'
              : `${completed.filter(Boolean).length} of ${plans.length} walks done`}
          </p>
        </div>

        {/* Segment tabs */}
        <div className="split-tabs">
          {segments.map((s, i) => (
            <button
              key={i}
              type="button"
              className={`split-tab${i === activeIdx ? ' split-tab-active' : ''}${completed[i] ? ' split-tab-done' : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              <span>{s.emoji}</span>
              <strong>{s.label}</strong>
              <small>{formatSteps(plans[i].steps)} steps</small>
              {completed[i] && <span className="split-check">✓</span>}
            </button>
          ))}
        </div>

        {/* Active segment details */}
        <p className="eyebrow">
          {seg.emoji} {seg.label} · {plan.origin.label} → {plan.destination.label}
        </p>
        <h1 className="step-hero">
          {formatSteps(plan.steps)}
          <span>steps</span>
        </h1>
        <p className="route-meta">
          {formatDistance(plan.distanceM)} · {formatDuration(plan.durationS)}
        </p>
        <p className="lede tight">{kindCopy(plan.kind, plan.destination.label)}</p>

        <div className="route-actions">
          {!completed[activeIdx] && (
            <button
              className="complete-btn"
              type="button"
              onClick={() => markComplete(activeIdx)}
            >
              ✅ Complete {seg.label.toLowerCase()} walk
            </button>
          )}
          <a className="primary" href={defaultMapsUrl(plan)} target="_blank" rel="noreferrer">
            🗺️ Open in Maps
          </a>
          <a className="ghost-btn wide" href={googleMapsUrl(plan)} target="_blank" rel="noreferrer" style={{ textAlign: 'center', textDecoration: 'none' }}>
            Open in Google Maps
          </a>
          <button className="ghost-btn wide" type="button" onClick={onNewWalk}>
            New walk
          </button>
        </div>

        {/* Directions */}
        <section className="turns" aria-labelledby="directions-heading">
          <h2 id="directions-heading">Directions</h2>
          <ol>
            {plan.turnByTurn.map((step, index) => (
              <li key={`${index}-${step.distance}`} className={`turn turn-${step.side}`}>
                <span className="turn-badge" aria-hidden="true">
                  {sideMark(step.side)}
                </span>
                <div>
                  <em className="turn-side">{sideLabel(step.side)}</em>
                  <span>{step.instruction}</span>
                  <small>{step.distance}</small>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </aside>
      <WalkMap plan={plan} />
      {showCompletion && (
        <CompletionCard plan={combinedPlan} onClose={() => setShowCompletion(false)} />
      )}
    </div>
  )
}
