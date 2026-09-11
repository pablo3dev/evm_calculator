export const MISSING_VALUE = 'N/A'

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

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return MISSING_VALUE
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return MISSING_VALUE
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
