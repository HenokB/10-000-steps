import type { LatLng, Place } from './types'

type PhotonProperties = {
  name?: string
  street?: string
  housenumber?: string
  city?: string
  district?: string
  locality?: string
  state?: string
  country?: string
}

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] }
  properties?: PhotonProperties
}

type PhotonResponse = {
  features?: PhotonFeature[]
}

export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  message: string,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (value) => {
        window.clearTimeout(timer)
        resolve(value)
      },
      (err: unknown) => {
        window.clearTimeout(timer)
        reject(err)
      },
    )
  })
}

async function fetchJson<T>(url: URL | string): Promise<T> {
  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new Error(`Map lookup failed (${response.status}). Try again in a moment.`)
  }
  return (await response.json()) as T
}

function formatPhotonAddress(props: PhotonProperties): string {
  const street = [props.housenumber, props.street].filter(Boolean).join(' ')
  const parts = [
    street,
    props.district || props.locality,
    props.city,
    props.state,
    props.country,
  ].filter((part): part is string => Boolean(part))
  if (props.name && !parts.some((part) => part.includes(props.name!))) {
    return [props.name, ...parts].join(', ')
  }
  return parts.join(', ') || props.name || 'Unknown place'
}

function featureToPlace(feature: PhotonFeature): Place | null {
  const coords = feature.geometry?.coordinates
  const props = feature.properties
  if (!coords || coords.length < 2 || !props) return null
  const address = formatPhotonAddress(props)
  return {
    label: props.name || address,
    address,
    lat: coords[1],
    lng: coords[0],
  }
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return []

  const url = new URL('https://photon.komoot.io/api/')
  url.searchParams.set('q', trimmed)
  url.searchParams.set('limit', '6')

  const data = await withTimeout(
    fetchJson<PhotonResponse>(url),
    10000,
    'Looking up that place took too long.',
  )

  return (data.features ?? [])
    .map(featureToPlace)
    .filter((place): place is Place => place !== null)
}

export async function geocodeAddress(query: string): Promise<Place> {
  const hits = await searchPlaces(query)
  if (!hits[0]) {
    throw new Error(`No place found for “${query}”.`)
  }
  return hits[0]
}

export async function reverseGeocode(point: LatLng): Promise<Place> {
  const url = new URL('https://photon.komoot.io/reverse')
  url.searchParams.set('lon', String(point.lng))
  url.searchParams.set('lat', String(point.lat))

  const data = await withTimeout(
    fetchJson<PhotonResponse>(url),
    10000,
    'Looking up that place took too long.',
  )

  const place = data.features?.[0] ? featureToPlace(data.features[0]) : null
  if (place) {
    return {
      ...place,
      lat: point.lat,
      lng: point.lng,
      label: place.label || 'Current location',
    }
  }

  return {
    label: 'Current location',
    address: `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`,
    lat: point.lat,
    lng: point.lng,
  }
}
