import type { EvmIndicatorCode } from '../i18n/evmIndicatorsCatalog.ts'
import { getEvmTooltipContent } from '../i18n/evmIndicatorsCatalog.ts'
import { useI18n } from '../i18n/useI18n.ts'
import { Tooltip } from './Tooltip.tsx'

export interface EvmIndicatorLabelProps {
  code: EvmIndicatorCode
}

export function EvmIndicatorLabel({ code }: EvmIndicatorLabelProps) {
  const { locale } = useI18n()
  const tooltip = getEvmTooltipContent(code, locale)

  return (
    <Tooltip
      nameEs={tooltip.nameEs}
      nameEn={tooltip.nameEn}
      description={tooltip.description}
      formula={tooltip.formula}
    >
      <span>{code}</span>
    </Tooltip>
  )
}
