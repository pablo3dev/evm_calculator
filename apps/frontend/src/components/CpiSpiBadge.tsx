import type { ReactElement } from 'react'
import type { EvmIndicatorCode } from '../i18n/evmIndicatorsCatalog.ts'
import {
  getCpiInterpretationKey,
  getSpiInterpretationKey,
} from '../i18n/evmInterpretation.ts'
import { useI18n } from '../i18n/useI18n.ts'
import { EvmIndicatorLabel } from './EvmIndicatorLabel.tsx'
import styles from './CpiSpiBadge.module.css'

export interface CpiSpiBadgeProps {
  value: number | null
  metric: 'cpi' | 'spi'
  label?: EvmIndicatorCode
  /** `inline` (tabla): una línea. `stacked` (consolidados): sigla, ícono y texto en tres renglones. */
  layout?: 'inline' | 'stacked'
}

type BadgeVariant = 'neutral' | 'nominal' | 'favorable' | 'unfavorable'

function getVariant(value: number | null): BadgeVariant {
  if (value === null) {
    return 'neutral'
  }
  if (value > 1) {
    return 'favorable'
  }
  if (value < 1) {
    return 'unfavorable'
  }
  return 'nominal'
}

function NeutralIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M4.5 7h5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

function NominalIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M4.5 7.25 6.1 8.85 9.75 5.2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function FavorableIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 2.5v9M4 6.5 7 3.5 10 6.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function UnfavorableIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M7 1.75 12.25 11.5H1.75L7 1.75Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path
        d="M7 5.25v3"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <circle cx="7" cy="10" r="0.75" fill="currentColor" />
    </svg>
  )
}

const ICON_BY_VARIANT: Record<BadgeVariant, () => ReactElement> = {
  neutral: NeutralIcon,
  nominal: NominalIcon,
  favorable: FavorableIcon,
  unfavorable: UnfavorableIcon,
}

function buildAriaLabel(
  label: string | undefined,
  interpretation: string,
): string {
  const trimmedLabel = label?.trim()
  if (trimmedLabel) {
    return `${trimmedLabel}: ${interpretation}`
  }
  return interpretation
}

export function CpiSpiBadge({
  value,
  metric,
  label,
  layout = 'inline',
}: CpiSpiBadgeProps) {
  const { t } = useI18n()
  const variant = getVariant(value)
  const Icon = ICON_BY_VARIANT[variant]
  const interpretationKey =
    metric === 'cpi'
      ? getCpiInterpretationKey(value)
      : getSpiInterpretationKey(value)
  const interpretation = t(`evmInterpretation.${interpretationKey}`)
  const ariaLabel = buildAriaLabel(label, interpretation)

  return (
    <span
      role="status"
      className={`${styles.badge} ${styles[variant]} ${styles[layout]}`}
      data-layout={layout}
      aria-label={ariaLabel}
    >
      {label && (
        <span className={styles.label}>
          <EvmIndicatorLabel code={label} />
        </span>
      )}
      <span className={styles.icon}>
        <Icon />
      </span>
      <span className={styles.text}>{interpretation}</span>
    </span>
  )
}
