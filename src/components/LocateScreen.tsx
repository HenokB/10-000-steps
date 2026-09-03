import { useState } from 'react'
import type { Place, Profile } from '../types'
import { AddressInput } from './AddressInput'
import { Logo } from './Logo'

type LocateScreenProps = {
  profile: Profile
  origin: Place | null
  locating: boolean
  error: string | null
  onRetry: () => void
  onPick: (place: Place) => void
  onContinue: () => void
}

export function LocateScreen({
  profile,
  origin,
  locating,
  error,
  onRetry,
  onPick,
  onContinue,
}: LocateScreenProps) {
  const [custom, setCustom] = useState(false)

  return (
    <main className="screen">
      <Logo size="sm" />
      <h1>Where are you starting?</h1>
      <p className="lede">
        We use this as the beginning of the walk. The map will always finish at
        the place you pick next.
      </p>

      {locating ? (
        <div className="pulse-card">
          <span className="pulse" />
          Finding you on the map…
        </div>
      ) : origin ? (
        <div className="place-card current">
          <span className="kicker">Starting from</span>
          <strong>{origin.label}</strong>
          <p>{origin.address}</p>
        </div>
      ) : null}

      {error && !origin ? <p className="banner error">{error}</p> : null}

      <div className="choice-row">
        <button
          type="button"
          className="chip"
          onClick={() => onPick({ ...profile.home, label: 'Home' })}
        >
          I’m at home
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => onPick({ ...profile.work, label: 'Work' })}
        >
          I’m at work
        </button>
        <button type="button" className="chip" onClick={onRetry}>
          Use GPS
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => setCustom((open) => !open)}
        >
          Another address
        </button>
      </div>

      {custom ? (
        <AddressInput
          id="start-custom"
          label="Starting address"
          placeholder="Search for a street or place"
          value={origin?.label === 'Home' || origin?.label === 'Work' ? null : origin}
          onChange={(place) => {
            if (place) onPick({ ...place, label: place.label || 'Start' })
          }}
        />
      ) : null}

      <button className="primary" type="button" disabled={!origin} onClick={onContinue}>
        Choose where to end
      </button>
    </main>
  )
}
