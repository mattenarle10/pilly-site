import { useId } from 'react';

export type MedicineForm = 'tablet' | 'capsule' | 'liquid' | 'injection' | 'drops' | 'inhaler';

type Props = {
  form: MedicineForm;
  color: string;
  secondaryColor?: string;
  className?: string;
};

export function Medicine({ form, color, secondaryColor = color, className }: Props) {
  const clipId = useId();
  const body = {
    fill: color,
    stroke: 'var(--text)',
    strokeOpacity: 0.18,
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const detail = {
    fill: 'none',
    stroke: 'var(--text)',
    strokeOpacity: 0.22,
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
  };

  return (
    <svg className={className} viewBox="0 0 72 72" aria-hidden="true">
      {form === 'tablet' && (
        <>
          <circle cx="36" cy="36" r="24" {...body} />
          <path d="M27 36h18" {...detail} />
        </>
      )}
      {form === 'capsule' && (
        <>
          <defs>
            <clipPath id={clipId}>
              <rect x="10" y="22" width="52" height="28" rx="14" />
            </clipPath>
          </defs>
          <rect x="10" y="22" width="52" height="28" rx="14" {...body} />
          <rect
            x="36"
            y="22"
            width="26"
            height="28"
            fill={secondaryColor}
            clipPath={`url(#${clipId})`}
          />
          <path d="M36 22v28" {...detail} />
        </>
      )}
      {form === 'liquid' && (
        <>
          <rect x="26" y="10" width="20" height="11" rx="3" {...body} />
          <path d="M23 27q0-5 5-5h16q5 0 5 5v31q0 5-5 5H28q-5 0-5-5Z" {...body} />
          <path d="M24 40h24M31 51h10" {...detail} />
        </>
      )}
      {form === 'injection' && (
        <g transform="rotate(-35 36 36)">
          <rect x="22" y="27" width="29" height="18" rx="4" {...body} />
          <path
            d="M43 27v18M32 37v5M37 37v5M51 36h10M15 36h7M14 29v14M10 29h8M10 43h8"
            {...detail}
          />
        </g>
      )}
      {form === 'drops' && (
        <>
          <rect x="27" y="11" width="18" height="10" rx="3" {...body} />
          <path d="M23 29q0-7 7-7h12q7 0 7 7v21q0 9-8 9H31q-8 0-8-9Z" {...body} />
          <path
            d="M36 33c-4 6-6 9-6 13a6 6 0 0 0 12 0c0-4-2-7-6-13Z"
            fill="var(--surface)"
            stroke="var(--text)"
            strokeOpacity=".14"
          />
        </>
      )}
      {form === 'inhaler' && (
        <>
          <path d="M25 13h16q5 0 5 5v25H25Z" {...body} />
          <path d="M25 34h21v21h8q4 0 4 4v3H31q-6 0-6-6Z" {...body} />
          <path d="M29 21h13M25 43h21" {...detail} />
        </>
      )}
    </svg>
  );
}
