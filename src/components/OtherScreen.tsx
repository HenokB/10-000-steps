import { useState } from 'react'
import type { Place } from '../types'
import { AddressInput } from './AddressInput'
import { Logo } from './Logo'

type OtherScreenProps = {
  onPick: (place: Place) => void
  onBack: () => void
}

export function OtherScreen({ onPick, onBack }: OtherScreenProps) {
  const [place, setPlace] = useState<Place | null>(null)

  return (
    <main className="screen">
      <Logo size="sm" />
      <h1>Somewhere else</h1>
      <p className="lede">
        Search for the place you want this walk to finish. We will still aim for
        about 10,000 steps on the way there.
      </p>
      <AddressInput
        id="other"
        label="End at"
        placeholder="Park, cafe, address…"
        value={place}
        onChange={setPlace}
      />
      <button
        className="primary"
        type="button"
        disabled={!place}
        onClick={() => {
          if (place) onPick({ ...place, label: place.label || place.address })
        }}
      >
        Plan this walk
      </button>
      <button className="text-btn" type="button" onClick={onBack}>
        Back
      </button>
    </main>
  )
}
