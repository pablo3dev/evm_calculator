export const MISSING_VALUE = '—'

function isDisplayableNumber(
  value: number | null | undefined,
): value is number {
  return value != null && Number.isFinite(value)
}

export function formatMoney(value: number | null | undefined): string {
  if (!isDisplayableNumber(value)) {
    return MISSING_VALUE
  }

  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number | null | undefined): string {
  if (!isDisplayableNumber(value)) {
    return MISSING_VALUE
  }

  return `${value.toFixed(1)}%`
}

export function formatIndicator(value: number | null | undefined): string {
  if (!isDisplayableNumber(value)) {
    return MISSING_VALUE
  }

  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
