import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  children: ReactNode
}

export function LoadingButton({
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: LoadingButtonProps) {
  const classes = ['loading-button', className].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && (
        <span className="loading-button-spinner" aria-hidden="true" />
      )}
      <span className="loading-button-label">{children}</span>
    </button>
  )
}
