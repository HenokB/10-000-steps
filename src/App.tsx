import { useCallback, useEffect, useRef, useState } from 'react'
import { DestinationScreen } from './components/DestinationScreen'
import { LocateScreen } from './components/LocateScreen'
import { OtherScreen } from './components/OtherScreen'
import { PlanningScreen } from './components/PlanningScreen'
import { RouteScreen } from './components/RouteScreen'
import { SettingsScreen } from './components/SettingsScreen'
import { SetupScreen } from './components/SetupScreen'
import { SplitRouteScreen } from './components/SplitRouteScreen'
import { SplitSetupScreen, type SplitSegment } from './components/SplitSetupScreen'
import { WelcomeScreen } from './components/WelcomeScreen'
import { getCurrentPosition } from './geo'
import { reverseGeocode } from './maps'
import { planTenKWalk } from './route'
import { clearAll, getProfile, setProfile } from './storage'
import type { Place, Profile, WalkPlan } from './types'

type Screen =
  | 'boot'
  | 'welcome'
  | 'setup'
  | 'locate'
  | 'destination'
  | 'other'
  | 'planning'
  | 'route'
  | 'split-setup'
  | 'split-planning'
  | 'split-route'
  | 'settings'

export default function App() {
  const [screen, setScreen] = useState<Screen>('boot')
  const [profile, setProfileState] = useState<Profile | null>(null)
  const [origin, setOrigin] = useState<Place | null>(null)
  const [locating, setLocating] = useState(false)
  const [gpsTried, setGpsTried] = useState(false)
  const [plan, setPlan] = useState<WalkPlan | null>(null)
  const [destination, setDestination] = useState<Place | null>(null)
  const [routeSeed, setRouteSeed] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [returnTo, setReturnTo] = useState<Screen>('locate')
  const [splitSegments, setSplitSegments] = useState<SplitSegment[]>([])
  const [splitPlans, setSplitPlans] = useState<WalkPlan[]>([])
  const gpsGeneration = useRef(0)

  useEffect(() => {
    const saved = getProfile()
    setProfileState(saved)
    setScreen(saved ? 'locate' : 'welcome')
  }, [])

  const findLocation = useCallback(async () => {
    const generation = ++gpsGeneration.current
    setLocating(true)
    setGpsTried(true)
    setError(null)
    try {
      const point = await getCurrentPosition()
      const place = await reverseGeocode(point)
      if (generation !== gpsGeneration.current) return
      setOrigin(place)
    } catch (err) {
      if (generation !== gpsGeneration.current) return
      setError(
        err instanceof Error
          ? `${err.message} Pick home, work, or type an address instead.`
          : 'Could not find you. Pick a starting place instead.',
      )
    } finally {
      if (generation === gpsGeneration.current) {
        setLocating(false)
      }
    }
  }, [])

  useEffect(() => {
    if (screen === 'locate' && !origin && !locating && !gpsTried) {
      void findLocation()
    }
  }, [screen, origin, locating, gpsTried, findLocation])

  function saveProfile(next: Profile) {
    setProfile(next)
    setProfileState(next)
    setScreen(origin ? 'destination' : 'locate')
  }

  async function planTo(nextDestination: Place, seed = 0) {
    if (!origin || !profile) return
    const previous = plan
    setDestination(nextDestination)
    setRouteSeed(seed)
    setError(null)
    setScreen('planning')
    try {
      const next = await planTenKWalk(
        origin,
        nextDestination,
        profile.stepLengthM,
        { seed },
      )
      setPlan(next)
      setScreen('route')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not draw a walking route. Try another destination.',
      )
      if (previous) {
        setPlan(previous)
        setScreen('route')
      } else {
        setScreen('destination')
      }
    }
  }

  async function planSplit(segments: SplitSegment[]) {
    if (!origin || !profile) return
    setSplitSegments(segments)
    setError(null)
    setScreen('split-planning')
    try {
      const plans: WalkPlan[] = []
      let start = origin
      for (const seg of segments) {
        const next = await planTenKWalk(
          start,
          seg.destination,
          profile.stepLengthM,
          { targetSteps: seg.steps },
        )
        plans.push(next)
        start = seg.destination
      }
      setSplitPlans(plans)
      setScreen('split-route')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not plan the split walks. Try different destinations.',
      )
      setScreen('split-setup')
    }
  }

  function resetAll() {
    clearAll()
    setProfileState(null)
    setOrigin(null)
    setPlan(null)
    setDestination(null)
    setRouteSeed(0)
    setSplitSegments([])
    setSplitPlans([])
    setGpsTried(false)
    setScreen('welcome')
  }

  if (screen === 'boot') {
    return (
      <main className="screen">
        <p className="lede">Opening 10k steps…</p>
      </main>
    )
  }

  if (screen === 'welcome') {
    return <WelcomeScreen onStart={() => setScreen('setup')} />
  }

  if (screen === 'setup') {
    return (
      <SetupScreen
        initial={profile}
        onSave={saveProfile}
        onBack={profile ? () => setScreen('settings') : undefined}
      />
    )
  }

  if (screen === 'locate' && profile) {
    return (
      <LocateScreen
        profile={profile}
        origin={origin}
        locating={locating}
        error={error}
        onRetry={() => {
          setGpsTried(false)
          setOrigin(null)
        }}
        onPick={(place) => {
          gpsGeneration.current += 1
          setLocating(false)
          setError(null)
          setOrigin(place)
        }}
        onContinue={() => {
          setError(null)
          setScreen('destination')
        }}
      />
    )
  }

  if (screen === 'destination' && profile && origin) {
    return (
      <DestinationScreen
        profile={profile}
        origin={origin}
        error={error}
        onPick={(place) => void planTo(place)}
        onOther={() => setScreen('other')}
        onSplit={() => setScreen('split-setup')}
        onBack={() => setScreen('locate')}
        onSettings={() => {
          setReturnTo('destination')
          setScreen('settings')
        }}
      />
    )
  }

  if (screen === 'other') {
    return (
      <OtherScreen
        onPick={(place) => void planTo(place)}
        onBack={() => setScreen('destination')}
      />
    )
  }

  if (screen === 'split-setup' && profile && origin) {
    return (
      <SplitSetupScreen
        profile={profile}
        error={error}
        onPlan={(segments) => void planSplit(segments)}
        onBack={() => setScreen('destination')}
      />
    )
  }

  if (screen === 'split-planning') {
    return <PlanningScreen />
  }

  if (screen === 'split-route' && splitPlans.length && splitSegments.length) {
    return (
      <SplitRouteScreen
        segments={splitSegments}
        plans={splitPlans}
        onBack={() => setScreen('split-setup')}
        onNewWalk={() => {
          setSplitPlans([])
          setSplitSegments([])
          setGpsTried(false)
          setOrigin(null)
          setScreen('locate')
        }}
      />
    )
  }

  if (screen === 'planning') {
    return <PlanningScreen />
  }

  if (screen === 'route' && plan) {
    return (
      <RouteScreen
        plan={plan}
        error={error}
        onBack={() => setScreen('destination')}
        onChangeDestination={() => {
          setError(null)
          setScreen('destination')
        }}
        onTryAnother={() => {
          if (destination) void planTo(destination, routeSeed + 1)
        }}
        onNewWalk={() => {
          setPlan(null)
          setDestination(null)
          setRouteSeed(0)
          setGpsTried(false)
          setOrigin(null)
          setScreen('locate')
        }}
      />
    )
  }

  if (screen === 'settings' && profile) {
    return (
      <SettingsScreen
        profile={profile}
        onSave={(next) => {
          setProfile(next)
          setProfileState(next)
          setScreen(returnTo)
        }}
        onEditPlaces={() => setScreen('setup')}
        onReset={resetAll}
        onBack={() => setScreen(returnTo)}
      />
    )
  }

  return (
    <main className="screen">
      <p className="lede">Getting things ready…</p>
    </main>
  )
}
