import { stepsFromMeters } from './format'
import {
  bearingDeg,
  destinationPoint,
  haversineM,
  pathMidpoint,
} from './geo'
import { withTimeout } from './maps'
import {
  TARGET_STEPS,
  type LatLng,
  type Place,
  type WalkKind,
  type WalkPlan,
  type WalkSide,
  type WalkStep,
} from './types'

type OsrmManeuver = {
  type?: string
  modifier?: string
  location?: [number, number]
}

type OsrmStep = {
  distance?: number
  name?: string
  maneuver?: OsrmManeuver
}

type OsrmRoute = {
  distance: number
  duration: number
  geometry?: { coordinates?: [number, number][] }
  legs?: Array<{ steps?: OsrmStep[] }>
}

type OsrmResponse = {
  code?: string
  message?: string
  routes?: OsrmRoute[]
}

type Routed = {
  distanceM: number
  durationS: number
  path: LatLng[]
  turnByTurn: WalkStep[]
  viaPoints: LatLng[]
}

function coord(point: LatLng): string {
  return `${point.lng},${point.lat}`
}

function formatStepDistance(meters: number): string {
  if (meters < 1000) return `${Math.max(1, Math.round(meters))} m`
  return `${(meters / 1000).toFixed(1)} km`
}

function formatDirection(modifier: string): string {
  switch (modifier) {
    case 'left':
      return 'left'
    case 'right':
      return 'right'
    case 'sharp left':
      return 'sharp left'
    case 'sharp right':
      return 'sharp right'
    case 'slight left':
      return 'slightly left'
    case 'slight right':
      return 'slightly right'
    case 'straight':
      return 'straight'
    case 'uturn':
      return 'a U-turn'
    default:
      return modifier
  }
}

function stepSide(type: string, modifier: string): WalkSide {
  if (type === 'depart') return 'start'
  if (type === 'arrive') return 'arrive'
  if (type === 'new name' || type === 'continue' || type === 'notification') {
    return 'straight'
  }
  if (modifier.includes('uturn')) return 'uturn'
  if (modifier.includes('left')) return 'left'
  if (modifier.includes('right')) return 'right'
  return 'straight'
}

function stepInstruction(step: OsrmStep): string {
  const type = step.maneuver?.type ?? 'continue'
  const modifier = step.maneuver?.modifier ?? ''
  const street = step.name?.trim()
  const onto = street ? ` onto ${street}` : ''
  const along = street ? ` on ${street}` : ''
  const dir = formatDirection(modifier)

  switch (type) {
    case 'depart':
      return street ? `Start walking on ${street}` : 'Start walking'
    case 'arrive':
      return 'You have arrived'
    case 'turn':
      if (dir === 'straight') return `Go straight ahead${along}`
      if (dir === 'a U-turn') return `Make a U-turn${onto}`
      if (dir.startsWith('slightly')) return `Bear ${dir}${onto}`
      return `Turn ${dir}${onto}`
    case 'end of road':
      return dir && dir !== 'straight'
        ? `At the end of the road, turn ${dir}${onto}`
        : `At the end of the road, continue${onto}`
    case 'new name':
    case 'continue':
      return street ? `Continue straight on ${street}` : 'Continue straight'
    case 'merge':
      return dir && dir !== 'straight' ? `Merge ${dir}${onto}` : `Merge${onto}`
    case 'fork':
      return dir && dir !== 'straight'
        ? `At the fork, keep ${dir}${onto}`
        : `At the fork, keep going${onto}`
    case 'off ramp':
    case 'on ramp':
      return dir && dir !== 'straight'
        ? `Take the ramp and keep ${dir}${onto}`
        : `Take the ramp${onto}`
    case 'roundabout':
    case 'rotary':
      return dir && dir !== 'straight'
        ? `At the roundabout, take the ${dir} exit${onto}`
        : `Enter the roundabout${onto}`
    default:
      if (dir && dir !== 'straight') return `Go ${dir}${onto || along}`
      return street ? `Continue on ${street}` : 'Continue straight'
  }
}

function keepStep(step: OsrmStep): boolean {
  const type = step.maneuver?.type ?? ''
  const side = stepSide(type, step.maneuver?.modifier ?? '')
  if (type === 'arrive' || type === 'depart') return true
  if (side === 'left' || side === 'right' || side === 'uturn') return true
  return (step.distance ?? 0) > 12
}

function unpack(route: OsrmRoute, viaPoints: LatLng[]): Routed {
  const path = (route.geometry?.coordinates ?? []).map(([lng, lat]) => ({
    lat,
    lng,
  }))
  const turnByTurn: WalkStep[] = (route.legs ?? []).flatMap((leg) =>
    (leg.steps ?? []).filter(keepStep).map((step) => {
      const type = step.maneuver?.type ?? 'continue'
      const location = step.maneuver?.location
      return {
        instruction: stepInstruction(step),
        distance: formatStepDistance(step.distance ?? 0),
        side: stepSide(type, step.maneuver?.modifier ?? ''),
        lat: location?.[1],
        lng: location?.[0],
      }
    }),
  )

  return {
    distanceM: route.distance,
    durationS: route.duration,
    path,
    turnByTurn,
    viaPoints,
  }
}

function routeScore(meters: number, targetM: number): number {
  const pct = (meters - targetM) / targetM
  if (pct >= -0.03 && pct <= 0.04) return Math.abs(pct)
  if (pct < 0) return Math.abs(pct) * 1.85
  return pct * 1.3
}

function closeEnough(meters: number, targetM: number): boolean {
  return Math.abs(meters - targetM) / targetM <= 0.035
}

function pickClosest(routes: OsrmRoute[], targetM: number): OsrmRoute {
  return routes.reduce((best, route) =>
    routeScore(route.distance, targetM) < routeScore(best.distance, targetM)
      ? route
      : best,
  )
}

function asErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message
  return 'Could not draw a walking route.'
}

function isFatalMapsError(message: string): boolean {
  return /too long|429|rate|unavailable|failed \(5/i.test(message)
}

async function requestWalk(
  origin: LatLng,
  destination: LatLng,
  waypoints: LatLng[] = [],
  alternatives = false,
  targetM = TARGET_STEPS * 0.78,
): Promise<Routed> {
  const points = [origin, ...waypoints, destination]
  const url = new URL(
    `https://router.project-osrm.org/route/v1/walking/${points.map(coord).join(';')}`,
  )
  url.searchParams.set('overview', 'full')
  url.searchParams.set('geometries', 'geojson')
  url.searchParams.set('steps', 'true')
  url.searchParams.set('alternatives', alternatives ? 'true' : 'false')

  let data: OsrmResponse
  try {
    const response = await withTimeout(
      fetch(url.toString(), { headers: { Accept: 'application/json' } }),
      15000,
      'The walking map did not come back in time. Try again.',
    )
    if (response.status === 429) {
      throw new Error('The free map is busy. Wait a moment and try again.')
    }
    if (!response.ok) {
      throw new Error(`Could not draw a walking route (${response.status}).`)
    }
    data = (await response.json()) as OsrmResponse
  } catch (err) {
    throw new Error(asErrorMessage(err))
  }

  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error(
      data.message || 'No walking path through those streets. Try another place.',
    )
  }

  const route = pickClosest(data.routes, targetM)
  return unpack(route, waypoints)
}

function toPlan(
  kind: WalkKind,
  origin: Place,
  destination: Place,
  routed: Routed,
  stepLengthM: number,
): WalkPlan {
  return {
    kind,
    origin,
    destination,
    distanceM: routed.distanceM,
    durationS: Math.round(routed.distanceM / 1.34),
    steps: stepsFromMeters(routed.distanceM, stepLengthM),
    targetSteps: TARGET_STEPS,
    turnByTurn: routed.turnByTurn,
    path: routed.path,
    viaPoints: routed.viaPoints,
  }
}

export type PlanOptions = {
  seed?: number
}

async function tryWalk(
  origin: LatLng,
  destination: LatLng,
  waypoints: LatLng[],
  targetM: number,
): Promise<Routed | null> {
  try {
    return await requestWalk(origin, destination, waypoints, false, targetM)
  } catch (err) {
    const message = asErrorMessage(err)
    if (isFatalMapsError(message)) {
      throw new Error(message)
    }
    return null
  }
}

function keepBest(
  current: Routed | null,
  next: Routed | null,
  targetM: number,
): Routed | null {
  if (!next) return current
  if (!current) return next
  return routeScore(next.distanceM, targetM) < routeScore(current.distanceM, targetM)
    ? next
    : current
}

async function planLoop(
  origin: Place,
  stepLengthM: number,
  seed: number,
): Promise<WalkPlan> {
  const targetM = TARGET_STEPS * stepLengthM
  const headings = [28 + seed * 53, 118 + seed * 53, 208 + seed * 53]
  let radius = targetM / 5.35
  let best: Routed | null = null

  for (const heading of headings) {
    const waypoints = [0, 120, 240].map((deg) =>
      destinationPoint(origin, heading + deg, radius),
    )
    const routed = await tryWalk(origin, origin, waypoints, targetM)
    best = keepBest(best, routed, targetM)
    if (routed && closeEnough(routed.distanceM, targetM)) {
      return toPlan('loop', origin, origin, routed, stepLengthM)
    }
    if (routed) {
      radius = Math.min(2600, Math.max(700, radius * (targetM / routed.distanceM)))
      const refined = [0, 120, 240].map((deg) =>
        destinationPoint(origin, heading + 18 + deg, radius),
      )
      const again = await tryWalk(origin, origin, refined, targetM)
      best = keepBest(best, again, targetM)
      if (again && closeEnough(again.distanceM, targetM)) {
        return toPlan('loop', origin, origin, again, stepLengthM)
      }
    }
  }

  if (!best) {
    throw new Error(
      'Could not draw a walking loop from here. Try a nearby street as your start.',
    )
  }

  return toPlan('loop', origin, origin, best, stepLengthM)
}

async function planDetour(
  origin: Place,
  destination: Place,
  direct: Routed,
  stepLengthM: number,
  seed: number,
): Promise<WalkPlan> {
  const targetM = TARGET_STEPS * stepLengthM
  const mid = pathMidpoint(direct.path.length ? direct.path : [origin, destination])
  const heading = bearingDeg(origin, destination) + (seed % 2 === 0 ? 0 : 12)
  const spread = Math.sqrt(
    Math.max(180, (targetM ** 2 - direct.distanceM ** 2) / 4),
  )
  const sides = seed % 2 === 0 ? [-1, 1] : [1, -1]
  let best = direct

  for (const side of sides) {
    for (const scale of [1, 1.22, 1.45]) {
      const waypoint = destinationPoint(mid, heading + side * 90, spread * scale)
      const routed = await tryWalk(origin, destination, [waypoint], targetM)
      best = keepBest(best, routed, targetM) ?? best
      if (routed && closeEnough(routed.distanceM, targetM)) {
        return toPlan('detour', origin, destination, routed, stepLengthM)
      }
    }
  }

  if (!closeEnough(best.distanceM, targetM) && best.distanceM < targetM) {
    const extra = targetM / Math.max(best.distanceM, 1)
    const first = destinationPoint(mid, heading + sides[0] * 70, spread * extra * 0.7)
    const second = destinationPoint(mid, heading + sides[0] * 110, spread * extra)
    const routed = await tryWalk(origin, destination, [first, second], targetM)
    best = keepBest(best, routed, targetM) ?? best
  }

  const kind: WalkKind =
    best.viaPoints.length > 0
      ? 'detour'
      : best.distanceM > targetM * 1.04
        ? 'long'
        : 'direct'

  return toPlan(kind, origin, destination, best, stepLengthM)
}

export async function planTenKWalk(
  origin: Place,
  destination: Place,
  stepLengthM: number,
  options: PlanOptions = {},
): Promise<WalkPlan> {
  const targetM = TARGET_STEPS * stepLengthM
  const seed = options.seed ?? 0
  const samePlace = haversineM(origin, destination) < 120

  if (samePlace) {
    return planLoop(origin, stepLengthM, seed)
  }

  const direct = await requestWalk(origin, destination, [], true, targetM)

  if (direct.distanceM >= targetM * 0.965) {
    const kind: WalkKind = direct.distanceM > targetM * 1.04 ? 'long' : 'direct'
    return toPlan(kind, origin, destination, direct, stepLengthM)
  }

  return planDetour(origin, destination, direct, stepLengthM, seed)
}

export function openMapsUrl(plan: WalkPlan): string {
  const params = new URLSearchParams({
    api: '1',
    origin: `${plan.origin.lat},${plan.origin.lng}`,
    destination: `${plan.destination.lat},${plan.destination.lng}`,
    travelmode: 'walking',
    dir_action: 'navigate',
  })
  if (plan.viaPoints.length) {
    params.set(
      'waypoints',
      plan.viaPoints
        .slice(0, 9)
        .map((point) => `${point.lat},${point.lng}`)
        .join('|'),
    )
  }
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function kindCopy(kind: WalkKind, destinationLabel: string): string {
  switch (kind) {
    case 'loop':
      return 'A loop of about 10,000 steps that brings you back to where you started.'
    case 'detour':
      return `The straight walk was short, so this route wanders a little and still ends at ${destinationLabel}.`
    case 'long':
      return `This is the walking path to ${destinationLabel}. It runs longer than 10,000 steps — the shortest walk still overshoots.`
    default:
      return `A walking route to ${destinationLabel} that lands right around 10,000 steps.`
  }
}
