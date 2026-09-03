export type Insight = {
  kind: 'quote' | 'stat'
  text: string
  source: string
}

export const WALK_INSIGHTS: Insight[] = [
  {
    kind: 'quote',
    text: 'Walking is man’s best medicine.',
    source: 'Hippocrates',
  },
  {
    kind: 'quote',
    text: 'An early-morning walk is a blessing for the whole day.',
    source: 'Henry David Thoreau',
  },
  {
    kind: 'stat',
    text: 'Compared with 2,000 steps a day, 7,000 steps was associated with a 47% lower risk of death.',
    source: 'Ding et al., The Lancet Public Health, 2025',
  },
  {
    kind: 'stat',
    text: 'The same review linked 7,000 steps with 25% lower cardiovascular disease, 38% lower dementia risk, and 22% fewer depressive symptoms.',
    source: 'Ding et al., The Lancet Public Health, 2025',
  },
  {
    kind: 'stat',
    text: 'For adults under 60, mortality risk kept falling until about 8,000 to 10,000 steps a day. After 60, most of the gain arrived by 6,000 to 8,000.',
    source: 'Paluch et al., The Lancet Public Health, 2022',
  },
  {
    kind: 'stat',
    text: 'People averaging about 10,900 steps a day had a 53% lower risk of death than those averaging about 3,550.',
    source: 'Paluch et al., 15-cohort meta-analysis, 2022',
  },
  {
    kind: 'stat',
    text: 'A 10,000-step walk usually covers about 4 to 5 miles and burns roughly 300 to 500 calories for most adults, depending on pace and body size.',
    source: 'Typical clinical estimates for moderate walking',
  },
]

export function insightsForWalk(seed = 0): Insight[] {
  const quote = WALK_INSIGHTS.filter((item) => item.kind === 'quote')
  const stats = WALK_INSIGHTS.filter((item) => item.kind === 'stat')
  const first = quote[seed % quote.length]
  const rest = [0, 1, 2].map((offset) => stats[(seed + offset) % stats.length])
  return [first, ...rest]
}
