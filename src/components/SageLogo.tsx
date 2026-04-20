interface SageLogoProps {
  /** compact: icon + name only; full: icon + name + tagline */
  variant?: 'compact' | 'full'
  /** height in px — width scales automatically */
  height?: number
  className?: string
}

/**
 * Inline SVG logo for Sage Narrative.
 * Matches the brand mark: sage-green circle with a stylised S/sprout,
 * "SAGE NARRATIVE" in spaced serif caps, and the tagline beneath.
 */
export default function SageLogo({
  variant = 'full',
  height = 52,
  className = '',
}: SageLogoProps) {
  const isCompact = variant === 'compact'

  // viewBox widths
  const vbW = isCompact ? 230 : 340
  const vbH = 80
  const w = Math.round((height / vbH) * vbW)

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${vbW} ${vbH}`}
      width={w}
      height={height}
      className={className}
      aria-label="Sage Narrative"
      role="img"
    >
      {/* ── Sage-green circle ── */}
      <circle cx="40" cy="40" r="36" fill="#8fa86e" />

      {/* ── Plant / S mark inside circle ── */}
      {/* Stem */}
      <line
        x1="40" y1="56" x2="40" y2="26"
        stroke="#2a3318" strokeWidth="2.4" strokeLinecap="round"
      />
      {/* Left leaf */}
      <path d="M40 40 C33 35 26 37 26 44 C34 44 38 42 40 40Z" fill="#2a3318" />
      {/* Right leaf */}
      <path d="M40 32 C47 27 54 29 54 36 C46 36 42 34 40 32Z" fill="#2a3318" />
      {/* Serif dot at top of stem */}
      <circle cx="40" cy="24" r="2.5" fill="#2a3318" />

      {/* ── Brand name ── */}
      <text
        x="88"
        y="37"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="20"
        fontWeight="700"
        fill="#2a3318"
        letterSpacing="4.5"
        className="dark-logo-text"
      >
        SAGE NARRATIVE
      </text>

      {/* ── Tagline — only in full variant ── */}
      {!isCompact && (
        <text
          x="88"
          y="55"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="9"
          fill="#767870"
          letterSpacing="3"
        >
          THOUGHTFUL WRITING · CALM FOCUS
        </text>
      )}
    </svg>
  )
}
