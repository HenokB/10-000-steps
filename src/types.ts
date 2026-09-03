export type LatLng = {
  lat: number
  lng: number
}

export type Place = {
  label: string
  address: string
  lat: number
  lng: number
}

export type Profile = {
  home: Place
  work: Place
  stepLengthM: number
}

export type WalkSide = 'left' | 'right' | 'straight' | 'uturn' | 'start' | 'arrive'

export type WalkStep = {
  instruction: string
  distance: string
  side: WalkSide
  lat?: number
  lng?: number
}

export type WalkKind = 'direct' | 'detour' | 'loop' | 'long'

export type WalkPlan = {
  kind: WalkKind
  origin: Place
  destination: Place
  distanceM: number
  durationS: number
  steps: number
  targetSteps: number
  turnByTurn: WalkStep[]
  path: LatLng[]
  viaPoints: LatLng[]
}

export const TARGET_STEPS = 10_000
export const DEFAULT_STEP_LENGTH_M = 0.78
