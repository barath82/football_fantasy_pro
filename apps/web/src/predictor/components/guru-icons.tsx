import type { SVGProps } from 'react';

/*
 * FantasyBrahma's guru icon set — ported from the Lovable-generated reference
 * in tmp_changes/fantasybrahma_changes_aug11/src/components/guru-icons.tsx
 * (pure SVG, no framework dependency, so it carried over unchanged).
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

/**
 * Shared guru silhouette — the FantasyBrahma mark.
 * Flame of knowledge, head with a third eye, seated shoulders on a lotus base.
 * `badge` shifts the guru left to make room for a challenge motif.
 */
function GuruShell({ badge = false }: { badge?: boolean }) {
  const cx = badge ? 12 : 16;
  return (
    <g transform={badge ? 'translate(-2.5 0) scale(0.88) translate(2 1.5)' : undefined}>
      <path d={`M${cx} 2.5c2 1.7 2.4 3.3 1.1 4.5`} />
      <circle cx={cx} cy="11" r="4" />
      <path d={`M${cx} 9.6v1.2`} />
      <path d={`M${cx - 9} 26c1-4.4 4.4-6.8 9-6.8s8 2.4 9 6.8`} />
      <path d={`M${cx - 6.5} 29h13`} />
    </g>
  );
}

export function BrahmaIcon(props: IconProps) {
  return (
    <Base {...props}>
      <GuruShell />
    </Base>
  );
}

/** Guru + two-way exchange arrows. */
export function TransferGuruIcon(props: IconProps) {
  return (
    <Base {...props}>
      <GuruShell badge />
      <g strokeWidth={1.6}>
        <path d="M22 21.5h8l-2-2M30 26.5h-8l2 2" />
      </g>
    </Base>
  );
}

/** Guru + diverging paths (the contrarian split). */
export function DifferentialGuruIcon(props: IconProps) {
  return (
    <Base {...props}>
      <GuruShell badge />
      {/* the crowd (large, hollow) vs the differential (small, solid) */}
      <circle cx="24.5" cy="22.5" r="3.2" strokeWidth={1.5} />
      <circle cx="28.8" cy="28" r="1.7" fill="currentColor" strokeWidth={1.2} />
    </Base>
  );
}

/** Guru + formation board (structure and shape). */
export function StrategyGuruIcon(props: IconProps) {
  return (
    <Base {...props}>
      <GuruShell badge />
      <g strokeWidth={1.5}>
        <rect x="21.5" y="19.5" width="9" height="10" rx="1.2" />
        <path d="M21.5 24.5h9" />
      </g>
      <path d="M26 22h.01M23.5 27.2h.01M28.5 27.2h.01" strokeWidth={2.4} />
    </Base>
  );
}

/** Guru + clock face (right chip, right week — or wasted). */
export function ChipGuruIcon(props: IconProps) {
  return (
    <Base {...props}>
      <GuruShell badge />
      <g strokeWidth={1.5}>
        <circle cx="26" cy="24" r="5" />
        <path d="M26 21.3v3l2.3 1.3" />
      </g>
    </Base>
  );
}

/** Guru + shield (the wall that holds, or doesn't). */
export function CSGuruIcon(props: IconProps) {
  return (
    <Base {...props}>
      <GuruShell badge />
      <path
        d="M26 19.3l4.5 1.7v3.5c0 3-1.9 5.4-4.5 6.6-2.6-1.2-4.5-3.6-4.5-6.6v-3.5z"
        strokeWidth={1.5}
      />
    </Base>
  );
}

/** Guru with a full halo — the guru of all gurus. */
export function OracleIcon(props: IconProps) {
  return (
    <Base {...props}>
      <GuruShell />
      <path d="M8 8.5a10 10 0 0 1 16 0" />
    </Base>
  );
}
