import { useState } from 'react'
import { formatDistance, formatDuration, formatSteps } from '../format'
import { defaultMapsUrl, googleMapsUrl, kindCopy } from '../route'
import { TARGET_STEPS, type WalkPlan, type WalkSide } from '../types'
import { CompletionCard } from './CompletionCard'
import { Insights } from './Insights'
import { Logo } from './Logo'
import { WalkArt } from './WalkArt'
import { WalkMap } from './WalkMap'

type RouteScreenProps = {
  plan: WalkPlan
  error?: string | null
  onBack: () => void
  onNewWalk: () => void
  onChangeDestination: () => void
  onTryAnother: () => void
}

function sideLabel(side: WalkSide): string {
  switch (side) {
    case 'left':
      return 'Left'
    case 'right':
      return 'Right'
    case 'straight':
      return 'Straight'
    case 'uturn':
      return 'U-turn'
    case 'start':
      return 'Start'
    case 'arrive':
      return 'End'
  }
}

function sideMark(side: WalkSide): string {
  switch (side) {
    case 'left':
      return '←'
    case 'right':
      return '→'
    case 'straight':
      return '↑'
    case 'uturn':
      return '↩'
    case 'start':
      return '●'
    case 'arrive':
      return '★'
  }
}

export function RouteScreen({
  plan,
  error,
  onBack,
  onNewWalk,
  onChangeDestination,
  onTryAnother,
}: RouteScreenProps) {
  const [showCompletion, setShowCompletion] = useState(false)
  const overUnder = plan.steps - plan.targetSteps
  const delta =
    overUnder === 0
      ? 'exactly 10,000'
      : overUnder > 0
        ? `${formatSteps(overUnder)} over`
        : `${formatSteps(Math.abs(overUnder))} under`
  const accuracy = Math.min(100, Math.round((plan.steps / TARGET_STEPS) * 100))

  return (
    <div className="route-layout">
      <aside className="route-panel">
        <div className="top-row">
          <button className="text-btn" type="button" onClick={onBack}>
            ← Back
          </button>
          <Logo size="sm" />
        </div>
        <WalkArt variant="park" />
        <p className="eyebrow">
          {plan.origin.label} → {plan.destination.label}
        </p>
        <h1 className="step-hero">
          {formatSteps(plan.steps)}
          <span>steps</span>
        </h1>
        <div className="accuracy" aria-label={`${accuracy}% of 10,000 steps`}>
          <div className="accuracy-bar" style={{ width: `${accuracy}%` }} />
        </div>
        <p className="route-meta">
          {formatDistance(plan.distanceM)} · {formatDuration(plan.durationS)} ·{' '}
          {delta}
        </p>
        <p className="lede tight">{kindCopy(plan.kind, plan.destination.label)}</p>
        {error ? <p className="banner error">{error}</p> : null}
        <div className="route-actions">
          <button className="complete-btn" type="button" onClick={() => setShowCompletion(true)}>
            ✅ Complete walk
          </button>
          <a className="primary" href={defaultMapsUrl(plan)} target="_blank" rel="noreferrer">
            🗺️ Open in Maps
          </a>
          <a className="ghost-btn wide" href={googleMapsUrl(plan)} target="_blank" rel="noreferrer" style={{ textAlign: 'center', textDecoration: 'none' }}>
            Open in Google Maps
          </a>
          <button className="ghost-btn wide" type="button" onClick={onTryAnother}>
            Try another route
          </button>
          <button className="ghost-btn wide" type="button" onClick={onChangeDestination}>
            Change destination
          </button>
          <button className="ghost-btn wide" type="button" onClick={onNewWalk}>
            New walk
          </button>
        </div>
        <Insights seed={plan.steps} />
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
        <CompletionCard plan={plan} onClose={() => setShowCompletion(false)} />
      )}
    </div>
  )
}
