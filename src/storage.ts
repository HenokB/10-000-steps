import { DEFAULT_STEP_LENGTH_M, type Profile } from './types'

const KEY = 'tenk-steps-v1'

type Stored = {
  profile?: Profile
}

function read(): Stored {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Stored) : {}
  } catch {
    return {}
  }
}

function write(next: Stored) {
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function getProfile(): Profile | null {
  const profile = read().profile
  if (!profile?.home || !profile?.work) return null
  return {
    ...profile,
    stepLengthM: profile.stepLengthM || DEFAULT_STEP_LENGTH_M,
  }
}

export function setProfile(profile: Profile) {
  write({ ...read(), profile })
}

export function clearAll() {
  localStorage.removeItem(KEY)
}
