type WalkArtProps = {
  variant?: 'trail' | 'stroll' | 'park'
}

export function WalkArt({ variant = 'trail' }: WalkArtProps) {
  if (variant === 'stroll') {
    return (
      <svg className="walk-art" viewBox="0 0 320 140" fill="none" aria-hidden="true">
        <circle cx="268" cy="28" r="16" fill="#e0a84b" />
        <path d="M12 118C58 92 72 128 118 104C164 80 176 122 228 96C268 76 286 108 308 92" stroke="#1a6b5a" strokeWidth="3" strokeLinecap="round" />
        <path d="M198 78c-8 18-4 28 8 34" stroke="#0f1c2e" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="206" cy="64" r="7" fill="#0f1c2e" />
        <path d="M204 86c8 4 16-2 18 8M204 86c-6 10-2 18 4 22" stroke="#0f1c2e" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M46 118c0-18 12-28 12-28s12 10 12 28" stroke="#228c73" strokeWidth="2" />
        <path d="M86 110c0-14 9-22 9-22s9 8 9 22" stroke="#228c73" strokeWidth="2" />
        <path d="M258 108c0-16 10-24 10-24s10 8 10 24" stroke="#228c73" strokeWidth="2" />
      </svg>
    )
  }

  if (variant === 'park') {
    return (
      <svg className="walk-art" viewBox="0 0 320 120" fill="none" aria-hidden="true">
        <path d="M0 92h320" stroke="#d0d9e4" strokeWidth="2" />
        <path d="M20 92C70 40 110 110 160 58C210 8 250 88 300 42" stroke="#1a6b5a" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 10" />
        <circle cx="48" cy="70" r="3" fill="#d05828" />
        <circle cx="112" cy="78" r="3" fill="#d05828" />
        <circle cx="176" cy="52" r="3" fill="#d05828" />
        <circle cx="236" cy="68" r="3" fill="#d05828" />
        <path d="M280 92v-28M268 78c12-18 24-18 36 0" stroke="#228c73" strokeWidth="2" strokeLinecap="round" />
        <path d="M40 92v-22M30 80c10-14 20-14 30 0" stroke="#228c73" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg className="walk-art" viewBox="0 0 320 110" fill="none" aria-hidden="true">
      <path
        d="M8 86C42 28 78 96 124 46C162 8 198 78 248 36C278 14 298 48 312 30"
        stroke="#1a6b5a"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="8" cy="86" r="4" fill="#d05828" />
      <circle cx="312" cy="30" r="4" fill="#d05828" />
      <path d="M70 86c-6-16 6-22 12-10c8-20 22-16 18 4" stroke="#228c73" strokeWidth="2" strokeLinecap="round" />
      <path d="M210 62c-5-14 6-18 11-8c7-16 18-12 15 4" stroke="#228c73" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
