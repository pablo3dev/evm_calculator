import type { EvmIndicatorCode } from '../i18n/evmIndicatorsCatalog.ts'
import { evmIndicatorsCatalog } from '../i18n/evmIndicatorsCatalog.ts'
import { useI18n } from '../i18n/useI18n.ts'
import type { EvmIndicators } from '../types/api.ts'
import { formatIndicator } from '../utils/formatDisplay.ts'
import { CpiSpiBadge } from './CpiSpiBadge.tsx'
import { Tooltip } from './Tooltip.tsx'

export interface ConsolidatedIndicatorsProps {
  indicators: EvmIndicators
}

interface IndicatorCardProps {
  code: EvmIndicatorCode
  value: string
}

function IndicatorCard({ code, value }: IndicatorCardProps) {
  const { locale } = useI18n()
  const entry = evmIndicatorsCatalog[code]

  return (
    <div className="consolidated-indicator-card">
      <span className="consolidated-indicator-label">
        <Tooltip
          nameEs={entry.nameEs}
          nameEn={entry.nameEn}
          description={
            locale === 'es' ? entry.descriptionEs : entry.descriptionEn
          }
          formula={entry.formula}
        >
          <span>{code}</span>
        </Tooltip>
        {' — '}
        {locale === 'es' ? entry.nameEs : entry.nameEn}
      </span>
      <span className="consolidated-indicator-value">{value}</span>
    </div>
  )
}

export function ConsolidatedIndicators({
  indicators,
}: ConsolidatedIndicatorsProps) {
  const { t } = useI18n()

  return (
    <section
      className="consolidated-indicators"
      aria-label={t('consolidatedIndicators.ariaLabel')}
    >
      <h2 className="consolidated-indicators-title">
        {t('consolidatedIndicators.title')}
      </h2>
      <div className="consolidated-indicators-grid">
        <IndicatorCard code="PV" value={formatIndicator(indicators.pv)} />
        <IndicatorCard code="EV" value={formatIndicator(indicators.ev)} />
        <IndicatorCard code="CV" value={formatIndicator(indicators.cv)} />
        <IndicatorCard code="SV" value={formatIndicator(indicators.sv)} />
        <div className="consolidated-indicator-card consolidated-indicator-badge">
          <CpiSpiBadge value={indicators.cpi} metric="cpi" label="CPI" />
        </div>
        <div className="consolidated-indicator-card consolidated-indicator-badge">
          <CpiSpiBadge value={indicators.spi} metric="spi" label="SPI" />
        </div>
        <IndicatorCard code="EAC" value={formatIndicator(indicators.eac)} />
        <IndicatorCard code="VAC" value={formatIndicator(indicators.vac)} />
      </div>
    </section>
  )
}
