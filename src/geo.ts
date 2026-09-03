import type { LatLng } from './types'

const EARTH_M = 6_371_000

export function haversineM(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_M * Math.asin(Math.min(1, Math.sqrt(s)))
}

export function destinationPoint(
  from: LatLng,
  bearingDeg: number,
  distanceM: number,
): LatLng {
  const δ = distanceM / EARTH_M
  const θ = (bearingDeg * Math.PI) / 180
  const φ1 = (from.lat * Math.PI) / 180
  const λ1 = (from.lng * Math.PI) / 180
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ),
  )
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2),
    )
  return { lat: (φ2 * 180) / Math.PI, lng: (λ2 * 180) / Math.PI }
}

export function bearingDeg(a: LatLng, b: LatLng): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const φ1 = toRad(a.lat)
  const φ2 = toRad(b.lat)
  const λ = toRad(b.lng - a.lng)
  const y = Math.sin(λ) * Math.cos(φ2)
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

export function pathMidpoint(path: LatLng[]): LatLng {
  if (path.length === 0) {
    throw new Error('Cannot find the middle of an empty path.')
  }
  if (path.length === 1) return path[0]
  const segs: number[] = []
  let total = 0
  for (let i = 1; i < path.length; i++) {
    const d = haversineM(path[i - 1], path[i])
    segs.push(d)
    total += d
  }
  let remain = total / 2
  for (let i = 0; i < segs.length; i++) {
    if (remain <= segs[i]) {
      const t = segs[i] === 0 ? 0 : remain / segs[i]
      const a = path[i]
      const b = path[i + 1]
      return {
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
      }
    }
    remain -= segs[i]
  }
  return path[path.length - 1]
}

export function getCurrentPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('This browser cannot share your location.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error('Location permission was denied.'))
        } else if (err.code === err.TIMEOUT) {
          reject(new Error('Finding you took too long.'))
        } else {
          reject(new Error('Could not read your location.'))
        }
      },
      { enableHighAccuracy: true, timeout: 14000, maximumAge: 20_000 },
    )
  })
}
