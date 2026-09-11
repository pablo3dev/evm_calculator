import type { EvmIndicators } from '../types/api.ts'
import { formatIndicator } from '../utils/formatDisplay.ts'
import { CpiSpiBadge } from './CpiSpiBadge.tsx'

export interface ConsolidatedIndicatorsProps {
  indicators: EvmIndicators
}

interface IndicatorCardProps {
  label: string
  value: string
}

function IndicatorCard({ label, value }: IndicatorCardProps) {
  return (
    <div className="consolidated-indicator-card">
      <span className="consolidated-indicator-label">{label}</span>
      <span className="consolidated-indicator-value">{value}</span>
    </div>
  )
}

export function ConsolidatedIndicators({
  indicators,
}: ConsolidatedIndicatorsProps) {
  return (
    <section
      className="consolidated-indicators"
      aria-label="Consolidated project indicators"
    >
      <h2 className="consolidated-indicators-title">Project Summary</h2>
      <div className="consolidated-indicators-grid">
        <IndicatorCard label="PV" value={formatIndicator(indicators.pv)} />
        <IndicatorCard label="EV" value={formatIndicator(indicators.ev)} />
        <IndicatorCard label="CV" value={formatIndicator(indicators.cv)} />
        <IndicatorCard label="SV" value={formatIndicator(indicators.sv)} />
        <div className="consolidated-indicator-card consolidated-indicator-badge">
          <span className="consolidated-indicator-label">CPI</span>
          <CpiSpiBadge
            value={indicators.cpi}
            interpretation={indicators.cpi_interpretation}
            label="CPI"
          />
        </div>
        <div className="consolidated-indicator-card consolidated-indicator-badge">
          <span className="consolidated-indicator-label">SPI</span>
          <CpiSpiBadge
            value={indicators.spi}
            interpretation={indicators.spi_interpretation}
            label="SPI"
          />
        </div>
        <IndicatorCard label="EAC" value={formatIndicator(indicators.eac)} />
        <IndicatorCard label="VAC" value={formatIndicator(indicators.vac)} />
      </div>
    </section>
  )
}
