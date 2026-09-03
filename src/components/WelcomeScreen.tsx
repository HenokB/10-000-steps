import { Logo } from './Logo'
import { WalkArt } from './WalkArt'

type WelcomeScreenProps = {
  onStart: () => void
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <main className="screen welcome">
      <Logo />
      <WalkArt variant="stroll" />
      <p className="eyebrow">A walking map, not a shortcut</p>
      <h1>
        Ten thousand steps
        <br />
        to wherever you are going.
      </h1>
      <p className="lede">
        Save home and work once. Then we take where you are now, the place you
        want to end up, and draw a walking route of about 10,000 steps.
      </p>
      <blockquote className="welcome-quote">
        <p>“Walking is man’s best medicine.”</p>
        <cite>Hippocrates</cite>
      </blockquote>
      <ul className="pillars">
        <li>
          <strong>Start here</strong>
          Your live location, or a place you choose.
        </li>
        <li>
          <strong>End there</strong>
          Home, work, or anywhere else.
        </li>
        <li>
          <strong>Walk the long way</strong>
          If the direct path is short, we add a wander so it still lands near 10k.
        </li>
      </ul>
      <button className="primary" type="button" onClick={onStart}>
        Add home and work
      </button>
    </main>
  )
}
