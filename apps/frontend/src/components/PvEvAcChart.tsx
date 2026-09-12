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
import type { Formatter as TooltipFormatter } from 'recharts/types/component/DefaultTooltipContent'
import type { EvmIndicatorCode } from '../i18n/evmIndicatorsCatalog.ts'
import { evmIndicatorsCatalog } from '../i18n/evmIndicatorsCatalog.ts'
import { useI18n } from '../i18n/useI18n.ts'
import type { ActivityWithIndicatorsResponse } from '../types/api.ts'
import { formatMoney } from '../utils/formatDisplay.ts'
import { Tooltip as EvmTooltip } from './Tooltip.tsx'

export interface PvEvAcChartProps {
  activities: ActivityWithIndicatorsResponse[]
}

interface ChartDatum {
  name: string
  pv: number
  ev: number
  ac: number
}

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

// Recharts' <Legend> renders its content as plain HTML (not SVG), so the
// design.md §2.8 pattern (Tooltip trigger + trailing localized name) can be
// used as-is via the `formatter` prop.
function renderLegendEntry(locale: 'es' | 'en') {
  return function LegendEntry(value: string) {
    const entry = evmIndicatorsCatalog[value as EvmIndicatorCode]
    return (
      <>
        <EvmTooltip
          nameEs={entry.nameEs}
          nameEn={entry.nameEn}
          description={
            locale === 'es' ? entry.descriptionEs : entry.descriptionEn
          }
          formula={entry.formula}
        >
          <span>{entry.code}</span>
        </EvmTooltip>
        {' — '}
        {locale === 'es' ? entry.nameEs : entry.nameEn}
      </>
    )
  }
}

// Recharts' native chart <Tooltip> (hover overlay on the bars) reads its
// `formatter` return tuple as [ReactNode, NameType], and NameType is
// `string | number` — it cannot host a nested interactive Tooltip trigger.
// As a technical adaptation of the closed pattern for this Recharts
// limitation, the invariant siglum and the localized name are still both
// shown, concatenated into that plain-string name slot.
function renderTooltipFormatter(locale: 'es' | 'en'): TooltipFormatter {
  return (value, name) => {
    const code = String(name).toUpperCase() as EvmIndicatorCode
    const entry = evmIndicatorsCatalog[code]
    const localizedName = locale === 'es' ? entry.nameEs : entry.nameEn
    return [formatTooltipValue(value), `${entry.code} — ${localizedName}`]
  }
}

export function PvEvAcChart({ activities }: PvEvAcChartProps) {
  const { locale } = useI18n()

  if (activities.length === 0) {
    return (
      <div className="pv-ev-ac-chart-empty">
        <p>No activities to chart. Add activities to compare PV, EV, and AC.</p>
      </div>
    )
  }

  const chartData = buildChartData(activities)

  return (
    <section
      className="pv-ev-ac-chart"
      aria-label="PV, EV, and AC comparison chart"
    >
      <h2 className="pv-ev-ac-chart-title">PV / EV / AC by Activity</h2>
      <div className="pv-ev-ac-chart-container">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={72}
            />
            <YAxis
              tickFormatter={(value: number) => formatMoney(value)}
              width={96}
            />
            <Tooltip formatter={renderTooltipFormatter(locale)} />
            <Legend formatter={renderLegendEntry(locale)} />
            <Bar dataKey="pv" name="PV" fill="#6366f1" />
            <Bar dataKey="ev" name="EV" fill="#22c55e" />
            <Bar dataKey="ac" name="AC" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
