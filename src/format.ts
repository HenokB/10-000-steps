export function formatDistance(meters: number): string {
  const miles = meters / 1609.344
  const km = meters / 1000
  return `${miles.toFixed(2)} mi · ${km.toFixed(2)} km`
}

export function formatDuration(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} hr ${rest} min` : `${hours} hr`
}

export function formatSteps(steps: number): string {
  return new Intl.NumberFormat('en-US').format(steps)
}

export function stepsFromMeters(meters: number, stepLengthM: number): number {
  return Math.max(1, Math.round(meters / stepLengthM))
}
