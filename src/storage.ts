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

const STREAK_KEY = 'tenk-streak-v1'

type StreakData = {
  dates: string[]
  total: number
}

function readStreak(): StreakData {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    return raw ? (JSON.parse(raw) as StreakData) : { dates: [], total: 0 }
  } catch {
    return { dates: [], total: 0 }
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function recordWalk(): StreakData {
  const data = readStreak()
  const today = todayStr()
  if (!data.dates.includes(today)) {
    data.dates.push(today)
  }
  data.total += 1
  localStorage.setItem(STREAK_KEY, JSON.stringify(data))
  return data
}

export function getStreak(): { current: number; total: number } {
  const data = readStreak()
  const sorted = [...data.dates].sort().reverse()
  let streak = 0
  const now = new Date()
  for (let i = 0; i < sorted.length; i++) {
    const expected = new Date(now)
    expected.setDate(expected.getDate() - i)
    if (sorted[i] === expected.toISOString().slice(0, 10)) {
      streak++
    } else {
      break
    }
  }
  return { current: streak, total: data.total }
}
