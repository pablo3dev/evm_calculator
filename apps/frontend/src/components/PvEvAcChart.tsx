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
import type { ActivityWithIndicatorsResponse } from '../types/api.ts'
import { formatMoney } from '../utils/formatDisplay.ts'

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

export function PvEvAcChart({ activities }: PvEvAcChartProps) {
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
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Bar dataKey="pv" name="PV" fill="#6366f1" />
            <Bar dataKey="ev" name="EV" fill="#22c55e" />
            <Bar dataKey="ac" name="AC" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
