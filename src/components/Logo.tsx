type LogoProps = {
  size?: 'sm' | 'md'
}

export function Logo({ size = 'md' }: LogoProps) {
  return (
    <div className={`brand brand-${size}`}>
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="12" fill="#2F5A3C" />
          <path
            d="M8 27C12.2 16 16 29 22 18C26.4 10 30.5 16 32 12"
            stroke="#F4EFE6"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="8" cy="27" r="1.7" fill="#E8C07A" />
          <circle cx="32" cy="12" r="1.7" fill="#E8C07A" />
        </svg>
      </span>
      <span className="brand-name">
        10k <em>steps</em>
      </span>
    </div>
  )
}
