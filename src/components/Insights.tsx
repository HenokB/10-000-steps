import { insightsForWalk } from '../insights'

type InsightsProps = {
  seed?: number
}

export function Insights({ seed = 0 }: InsightsProps) {
  const items = insightsForWalk(seed)

  return (
    <section className="insights" aria-labelledby="insights-heading">
      <h2 id="insights-heading">Why 10,000 steps matter</h2>
      <ul>
        {items.map((item) => (
          <li key={item.text} className={`insight insight-${item.kind}`}>
            <p>{item.kind === 'quote' ? `“${item.text}”` : item.text}</p>
            <cite>{item.source}</cite>
          </li>
        ))}
      </ul>
    </section>
  )
}
