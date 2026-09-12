import { useId, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { useI18n } from '../i18n/useI18n.ts'
import styles from './Tooltip.module.css'

export interface TooltipProps {
  nameEs: string
  nameEn: string
  description: string
  /** Notación de fórmula, ej. "CPI = EV / AC". Omitir si el indicador/control no tiene fórmula. */
  formula?: string
  /** Elemento disparador (trigger): texto de la sigla EVM, icono, o control no obvio */
  children: ReactNode
}

const MIN_SPACE_ABOVE_PX = 80

type Position = 'above' | 'below'

export function Tooltip({
  nameEs,
  nameEn,
  description,
  formula,
  children,
}: TooltipProps) {
  const { locale } = useI18n()
  const contentId = useId()
  const triggerRef = useRef<HTMLSpanElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<Position>('above')

  const open = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    const spaceAbove = rect ? rect.top : MIN_SPACE_ABOVE_PX
    setPosition(spaceAbove < MIN_SPACE_ABOVE_PX ? 'below' : 'above')
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (isOpen && event.key === 'Escape') {
      close()
    }
  }

  const displayName = locale === 'es' ? nameEs : nameEn

  return (
    <span className={styles.wrapper}>
      <span
        ref={triggerRef}
        className={styles.trigger}
        tabIndex={0}
        onMouseEnter={open}
        onMouseLeave={close}
        onFocus={open}
        onBlur={close}
        onKeyDown={handleKeyDown}
        aria-describedby={isOpen ? contentId : undefined}
      >
        {children}
      </span>
      {isOpen && (
        <span
          id={contentId}
          role="tooltip"
          className={`${styles.content} ${styles[position]}`}
        >
          <p className={styles.name}>{displayName}</p>
          <p className={styles.description}>{description}</p>
          {formula && <p className={styles.formula}>{formula}</p>}
        </span>
      )}
    </span>
  )
}
