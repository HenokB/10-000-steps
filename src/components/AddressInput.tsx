import { useEffect, useState } from 'react'
import { geocodeAddress, searchPlaces } from '../maps'
import type { Place } from '../types'

type AddressInputProps = {
  id: string
  label: string
  placeholder: string
  value: Place | null
  onChange: (place: Place | null) => void
}

export function AddressInput({
  id,
  label,
  placeholder,
  value,
  onChange,
}: AddressInputProps) {
  const [text, setText] = useState(value?.address ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState<Place[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setText(value?.address ?? '')
  }, [value?.address])

  useEffect(() => {
    const query = text.trim()
    if (value && query === value.address) {
      setSuggestions([])
      setOpen(false)
      return
    }
    if (query.length < 3) {
      setSuggestions([])
      return
    }

    const timer = window.setTimeout(() => {
      void searchPlaces(query)
        .then((places) => {
          setSuggestions(places)
          setOpen(places.length > 0)
        })
        .catch(() => setSuggestions([]))
    }, 350)

    return () => window.clearTimeout(timer)
  }, [text, value])

  function choose(place: Place) {
    setText(place.address)
    setSuggestions([])
    setOpen(false)
    setError('')
    onChange({ ...place, label: place.label || label })
  }

  async function lookup() {
    const query = text.trim()
    if (!query) {
      onChange(null)
      return
    }
    if (value && query === value.address) return
    setBusy(true)
    setError('')
    try {
      const place = await geocodeAddress(query)
      choose({ ...place, label })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not find that address.')
      onChange(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="field">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      <div className="field-row">
        <div className="suggest-wrap">
          <input
            id={id}
            value={text}
            placeholder={placeholder}
            autoComplete="off"
            onChange={(event) => {
              setText(event.target.value)
              setError('')
              if (value) onChange(null)
            }}
            onFocus={() => {
              if (suggestions.length) setOpen(true)
            }}
            onBlur={() => {
              window.setTimeout(() => setOpen(false), 180)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                if (suggestions[0]) choose({ ...suggestions[0], label })
                else void lookup()
              }
            }}
          />
          {open && suggestions.length ? (
            <ul className="suggest-list" role="listbox">
              {suggestions.map((place) => (
                <li key={`${place.lat},${place.lng},${place.address}`}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose({ ...place, label })}
                  >
                    <strong>{place.label}</strong>
                    <span>{place.address}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <button className="ghost-btn" type="button" disabled={busy} onClick={() => void lookup()}>
          {busy ? '…' : 'Pin'}
        </button>
      </div>
      {value ? <span className="field-ok">Pinned · {value.address}</span> : null}
      {error ? <span className="field-error">{error}</span> : null}
    </div>
  )
}
