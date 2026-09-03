import L from 'leaflet'
import { useEffect, useRef } from 'react'
import { bearingDeg } from '../geo'
import type { WalkPlan } from '../types'

type WalkMapProps = {
  plan: WalkPlan
}

function arrowIcon(degrees: number) {
  return L.divIcon({
    className: 'route-arrow',
    html: `<div style="transform:rotate(${degrees}deg)">▲</div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  })
}

function turnIcon(label: string, side: string) {
  return L.divIcon({
    className: `map-turn map-turn-${side}`,
    html: `<span>${label}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  })
}

export function WalkMap({ plan }: WalkMapProps) {
  const nodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    const map = L.map(node, {
      zoomControl: true,
      attributionControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const latLngs = plan.path.map((point) => L.latLng(point.lat, point.lng))
    const line = L.polyline(latLngs, {
      color: '#2F5A3C',
      weight: 6,
      opacity: 0.92,
      lineJoin: 'round',
      lineCap: 'round',
    }).addTo(map)

    const step = Math.max(12, Math.floor(plan.path.length / 18))
    for (let i = step; i < plan.path.length - 1; i += step) {
      const from = plan.path[i - 1]
      const to = plan.path[i]
      L.marker([to.lat, to.lng], {
        icon: arrowIcon(bearingDeg(from, to)),
        interactive: false,
        keyboard: false,
      }).addTo(map)
    }

    for (const turn of plan.turnByTurn) {
      if (
        turn.lat == null ||
        turn.lng == null ||
        (turn.side !== 'left' && turn.side !== 'right' && turn.side !== 'uturn')
      ) {
        continue
      }
      const label = turn.side === 'left' ? 'L' : turn.side === 'right' ? 'R' : 'U'
      L.marker([turn.lat, turn.lng], {
        icon: turnIcon(label, turn.side),
        keyboard: false,
      })
        .bindTooltip(turn.instruction, { direction: 'top' })
        .addTo(map)
    }

    L.circleMarker([plan.origin.lat, plan.origin.lng], {
      radius: 8,
      color: '#FFFBF5',
      weight: 3,
      fillColor: '#1C1916',
      fillOpacity: 1,
    })
      .bindTooltip('Start', { direction: 'top' })
      .addTo(map)

    if (plan.kind !== 'loop') {
      L.circleMarker([plan.destination.lat, plan.destination.lng], {
        radius: 8,
        color: '#FFFBF5',
        weight: 3,
        fillColor: '#C45C26',
        fillOpacity: 1,
      })
        .bindTooltip(plan.destination.label, { direction: 'top' })
        .addTo(map)
    }

    if (latLngs.length) {
      map.fitBounds(line.getBounds(), { padding: [28, 28] })
    } else {
      map.setView([plan.origin.lat, plan.origin.lng], 14)
    }

    const resize = window.setTimeout(() => map.invalidateSize(), 80)

    return () => {
      window.clearTimeout(resize)
      map.remove()
    }
  }, [plan])

  return <div ref={nodeRef} className="walk-map" role="img" aria-label="Walking route map" />
}
