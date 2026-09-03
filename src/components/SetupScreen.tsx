import { useState, type FormEvent } from 'react'
import { DEFAULT_STEP_LENGTH_M, type Place, type Profile } from '../types'
import { AddressInput } from './AddressInput'
import { Logo } from './Logo'

type SetupScreenProps = {
  initial?: Profile | null
  onSave: (profile: Profile) => void
  onBack?: () => void
}

export function SetupScreen({ initial, onSave, onBack }: SetupScreenProps) {
  const [home, setHome] = useState<Place | null>(initial?.home ?? null)
  const [work, setWork] = useState<Place | null>(initial?.work ?? null)

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!home || !work) return
    onSave({
      home: { ...home, label: 'Home' },
      work: { ...work, label: 'Work' },
      stepLengthM: initial?.stepLengthM ?? DEFAULT_STEP_LENGTH_M,
    })
  }

  return (
    <main className="screen">
      <Logo size="sm" />
      <h1>Home and work</h1>
      <p className="lede">
        These are the two places you will walk toward most days. Search, pick a
        suggestion, then pin it.
      </p>
      <form className="stack" onSubmit={submit}>
        <AddressInput
          id="home"
          label="Home"
          placeholder="Your home address"
          value={home}
          onChange={setHome}
        />
        <AddressInput
          id="work"
          label="Work"
          placeholder="Your work address"
          value={work}
          onChange={setWork}
        />
        <button className="primary" type="submit" disabled={!home || !work}>
          Save places
        </button>
        {onBack ? (
          <button className="text-btn" type="button" onClick={onBack}>
            Back
          </button>
        ) : null}
      </form>
    </main>
  )
}
