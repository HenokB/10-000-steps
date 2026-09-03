import { useState } from 'react'
import { TARGET_STEPS, type Place, type Profile } from '../types'
import { AddressInput } from './AddressInput'
import { Logo } from './Logo'

export type SplitSegment = {
  label: string
  emoji: string
  steps: number
  destination: Place
}

type SplitSetupScreenProps = {
  profile: Profile
  error?: string | null
  onPlan: (segments: SplitSegment[]) => void
  onBack: () => void
}

const PRESETS = [
  {
    label: '2 walks',
    segments: [
      { label: 'Morning', emoji: '🌅', fraction: 0.5 },
      { label: 'Evening', emoji: '🌇', fraction: 0.5 },
    ],
  },
  {
    label: '3 walks',
    segments: [
      { label: 'Morning', emoji: '🌅', fraction: 0.4 },
      { label: 'Lunch', emoji: '☀️', fraction: 0.3 },
      { label: 'Evening', emoji: '🌇', fraction: 0.3 },
    ],
  },
]

export function SplitSetupScreen({
  profile,
  error,
  onPlan,
  onBack,
}: SplitSetupScreenProps) {
  const [presetIdx, setPresetIdx] = useState(0)
  const preset = PRESETS[presetIdx]
  const [destinations, setDestinations] = useState<(Place | null)[]>(
    preset.segments.map(() => null),
  )

  function switchPreset(idx: number) {
    setPresetIdx(idx)
    setDestinations(PRESETS[idx].segments.map(() => null))
  }

  function setDest(index: number, place: Place | null) {
    setDestinations((prev) => {
      const next = [...prev]
      next[index] = place
      return next
    })
  }

  const allSet = destinations.every((d) => d !== null)

  function submit() {
    if (!allSet) return
    const segments: SplitSegment[] = preset.segments.map((seg, i) => ({
      label: seg.label,
      emoji: seg.emoji,
      steps: Math.round(TARGET_STEPS * seg.fraction),
      destination: destinations[i]!,
    }))
    onPlan(segments)
  }

  return (
    <main className="screen">
      <Logo size="sm" />
      <h1>Split your 10k</h1>
      <p className="lede">
        Break your 10,000 steps across the day. Pick how many walks and where
        each one should end.
      </p>

      {error ? <p className="banner error">{error}</p> : null}

      <div className="choice-row">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            type="button"
            className={`chip${i === presetIdx ? ' chip-active' : ''}`}
            onClick={() => switchPreset(i)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="split-segments">
        {preset.segments.map((seg, i) => {
          const steps = Math.round(TARGET_STEPS * seg.fraction)
          return (
            <div key={`${presetIdx}-${i}`} className="split-segment">
              <div className="split-segment-header">
                <span className="split-emoji">{seg.emoji}</span>
                <div>
                  <strong>{seg.label}</strong>
                  <span className="split-steps">
                    ~{steps.toLocaleString()} steps
                  </span>
                </div>
              </div>
              <div className="split-dest-row">
                <button
                  type="button"
                  className={`chip${destinations[i]?.label === 'Home' ? ' chip-active' : ''}`}
                  onClick={() =>
                    setDest(i, { ...profile.home, label: 'Home' })
                  }
                >
                  ⌂ Home
                </button>
                <button
                  type="button"
                  className={`chip${destinations[i]?.label === 'Work' ? ' chip-active' : ''}`}
                  onClick={() =>
                    setDest(i, { ...profile.work, label: 'Work' })
                  }
                >
                  ▣ Work
                </button>
              </div>
              <AddressInput
                id={`split-dest-${presetIdx}-${i}`}
                label={`${seg.label} destination`}
                placeholder="Or search a different place…"
                value={
                  destinations[i]?.label === 'Home' ||
                  destinations[i]?.label === 'Work'
                    ? null
                    : destinations[i]
                }
                onChange={(place) => {
                  if (place) setDest(i, place)
                }}
              />
              {destinations[i] && (
                <span className="field-ok">
                  ✓ {destinations[i]!.label} — {destinations[i]!.address}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <button
        className="primary"
        type="button"
        disabled={!allSet}
        onClick={submit}
      >
        Plan all walks
      </button>
      <button className="text-btn" type="button" onClick={onBack}>
        Back
      </button>
    </main>
  )
}
