import { useState, type FormEvent } from 'react'
import { formatDistance } from '../format'
import { TARGET_STEPS, type Profile } from '../types'
import { Logo } from './Logo'

type SettingsScreenProps = {
  profile: Profile
  onSave: (profile: Profile) => void
  onEditPlaces: () => void
  onReset: () => void
  onBack: () => void
}

export function SettingsScreen({
  profile,
  onSave,
  onEditPlaces,
  onReset,
  onBack,
}: SettingsScreenProps) {
  const [stepLengthM, setStepLengthM] = useState(profile.stepLengthM)

  function submit(event: FormEvent) {
    event.preventDefault()
    onSave({ ...profile, stepLengthM })
  }

  return (
    <main className="screen">
      <Logo size="sm" />
      <h1>Settings</h1>
      <form className="stack" onSubmit={submit}>
        <label className="field" htmlFor="stride">
          <span className="field-label">
            Step length · {stepLengthM.toFixed(2)} m
          </span>
          <input
            id="stride"
            type="range"
            min={0.6}
            max={0.95}
            step={0.01}
            value={stepLengthM}
            onChange={(event) => setStepLengthM(Number(event.target.value))}
          />
          <span className="field-ok">
            Average adult stride is about 0.76–0.80 m. Your 10,000 steps ≈{' '}
            {formatDistance(TARGET_STEPS * stepLengthM)}.
          </span>
        </label>
        <button className="primary" type="submit">
          Save stride
        </button>
      </form>
      <div className="settings-list">
        <button type="button" onClick={onEditPlaces}>
          Edit home and work
        </button>
        <button type="button" className="danger" onClick={onReset}>
          Clear saved data
        </button>
      </div>
      <button className="text-btn" type="button" onClick={onBack}>
        Back
      </button>
    </main>
  )
}
