import { WalkArt } from './WalkArt'

export function PlanningScreen() {
  return (
    <main className="screen planning">
      <WalkArt variant="trail" />
      <h1>Aiming for 10,000 steps</h1>
      <p className="lede">
        Measuring the walking path, then stretching it until the distance
        matches your stride.
      </p>
    </main>
  )
}
