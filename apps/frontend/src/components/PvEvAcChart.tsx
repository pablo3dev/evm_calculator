import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { EvmIndicatorCode } from '../i18n/evmIndicatorsCatalog.ts'
import {
  evmIndicatorsCatalog,
  getEvmTooltipContent,
} from '../i18n/evmIndicatorsCatalog.ts'
import { useI18n } from '../i18n/useI18n.ts'
import type { ActivityWithIndicatorsResponse } from '../types/api.ts'
import { formatMoney } from '../utils/formatDisplay.ts'
import { EvmIndicatorLabel } from './EvmIndicatorLabel.tsx'

export interface PvEvAcChartProps {
  activities: ActivityWithIndicatorsResponse[]
}

interface ChartDatum {
  name: string
  pv: number
  ev: number
  ac: number
}

const ACTIVITY_LABEL_MAX = 18

function buildChartData(
  activities: ActivityWithIndicatorsResponse[],
): ChartDatum[] {
  return activities.map((activity) => ({
    name: activity.name,
    pv: activity.indicators.pv,
    ev: activity.indicators.ev,
    ac: activity.actual_cost,
  }))
}

function shortenActivityName(name: string): string {
  if (name.length <= ACTIVITY_LABEL_MAX) {
    return name
  }
  return `${name.slice(0, ACTIVITY_LABEL_MAX)}…`
}

function formatTooltipValue(value: unknown): string {
  const raw = Array.isArray(value) ? value[0] : value

  if (typeof raw === 'number') {
    return formatMoney(raw)
  }

  if (typeof raw === 'string') {
    const parsed = Number(raw)
    if (Number.isFinite(parsed)) {
      return formatMoney(parsed)
    }
  }

  return formatMoney(null)
}

function renderLegendEntry(value: string) {
  return <EvmIndicatorLabel code={value as EvmIndicatorCode} />
}

interface ChartHoverItem {
  name?: string | number
  value?: number | string
  color?: string
}

interface ChartHoverTooltipProps {
  active?: boolean
  label?: string | number
  payload?: ChartHoverItem[]
  locale: 'es' | 'en'
}

function ChartHoverTooltip({
  active,
  label,
  payload,
  locale,
}: ChartHoverTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="pv-ev-ac-chart-tooltip" role="tooltip">
      {label && <p className="pv-ev-ac-chart-tooltip-label">{label}</p>}
      <ul className="pv-ev-ac-chart-tooltip-list">
        {payload.map((item) => {
          const code = String(item.name).toUpperCase() as EvmIndicatorCode
          const content = getEvmTooltipContent(code, locale)
          const displayName = locale === 'es' ? content.nameEs : content.nameEn
          return (
            <li key={code} className="pv-ev-ac-chart-tooltip-item">
              <span
                className="pv-ev-ac-chart-tooltip-swatch"
                style={{ backgroundColor: item.color }}
              />
              <span>
                <strong>{evmIndicatorsCatalog[code].code}</strong>
                {' — '}
                {displayName}: {formatTooltipValue(item.value)}
                {content.formula && (
                  <span className="pv-ev-ac-chart-tooltip-formula">
                    {content.formula}
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function PvEvAcChart({ activities }: PvEvAcChartProps) {
  const { locale, t } = useI18n()

  if (activities.length === 0) {
    return (
      <div className="pv-ev-ac-chart-empty">
        <p>{t('pvEvAcChart.emptyState')}</p>
      </div>
    )
  }

  const chartData = buildChartData(activities)

  return (
    <section className="pv-ev-ac-chart" aria-label={t('pvEvAcChart.ariaLabel')}>
      <h2 className="pv-ev-ac-chart-title">{t('pvEvAcChart.title')}</h2>
      <div className="pv-ev-ac-chart-container">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 8, bottom: 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={72}
              tickFormatter={shortenActivityName}
            />
            <YAxis
              tickFormatter={(value: number) => formatMoney(value)}
              width={96}
            />
            <Tooltip content={<ChartHoverTooltip locale={locale} />} />
            <Legend formatter={renderLegendEntry} />
            <Bar dataKey="pv" name="PV" fill="#6366f1" />
            <Bar dataKey="ev" name="EV" fill="#22c55e" />
            <Bar dataKey="ac" name="AC" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
