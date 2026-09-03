import type { Place, Profile } from '../types'
import { Logo } from './Logo'

type DestinationScreenProps = {
  profile: Profile
  origin: Place
  error: string | null
  onPick: (place: Place) => void
  onOther: () => void
  onSplit: () => void
  onBack: () => void
  onSettings: () => void
}

export function DestinationScreen({
  profile,
  origin,
  error,
  onPick,
  onOther,
  onSplit,
  onBack,
  onSettings,
}: DestinationScreenProps) {
  return (
    <main className="screen">
      <div className="top-row">
        <Logo size="sm" />
        <button className="text-btn" type="button" onClick={onSettings}>
          Settings
        </button>
      </div>
      <p className="eyebrow">Starting from {origin.label}</p>
      <h1>Where should this walk end?</h1>
      <p className="lede">
        We will draw a walking route of about 10,000 steps between here and the
        place you choose.
      </p>
      {error ? <p className="banner error">{error}</p> : null}
      <div className="destinations">
        <button
          type="button"
          className="dest-card"
          onClick={() => onPick({ ...profile.home, label: 'Home' })}
        >
          <span className="dest-icon" aria-hidden="true">
            ⌂
          </span>
          <span>
            <strong>Home</strong>
            <em>{profile.home.address}</em>
          </span>
        </button>
        <button
          type="button"
          className="dest-card"
          onClick={() => onPick({ ...profile.work, label: 'Work' })}
        >
          <span className="dest-icon" aria-hidden="true">
            ▣
          </span>
          <span>
            <strong>Work</strong>
            <em>{profile.work.address}</em>
          </span>
        </button>
        <button type="button" className="dest-card" onClick={onOther}>
          <span className="dest-icon" aria-hidden="true">
            ✶
          </span>
          <span>
            <strong>Somewhere else</strong>
            <em>A park, a cafe, a friend’s place…</em>
          </span>
        </button>
        <button type="button" className="dest-card" onClick={onSplit}>
          <span className="dest-icon" aria-hidden="true">
            ⚡
          </span>
          <span>
            <strong>Split my 10k</strong>
            <em>2 or 3 walks across the day — morning, lunch, evening.</em>
          </span>
        </button>
      </div>
      <button className="text-btn" type="button" onClick={onBack}>
        Change start
      </button>
    </main>
  )
}
