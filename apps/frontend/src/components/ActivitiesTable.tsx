import type { ActivityWithIndicatorsResponse } from '../types/api.ts'
import {
  formatIndicator,
  formatMoney,
  formatPercent,
} from '../utils/formatDisplay.ts'
import { CpiSpiBadge } from './CpiSpiBadge.tsx'

export interface ActivitiesTableProps {
  activities: ActivityWithIndicatorsResponse[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function ActivitiesTable({
  activities,
  onEdit,
  onDelete,
}: ActivitiesTableProps) {
  if (activities.length === 0) {
    return (
      <div className="activities-table-empty">
        <p>No activities yet. Add an activity to see EVM indicators.</p>
      </div>
    )
  }

  return (
    <div className="activities-table-wrapper">
      <table className="activities-table">
        <thead>
          <tr>
            <th scope="col">Activity</th>
            <th scope="col">BAC</th>
            <th scope="col">Planned %</th>
            <th scope="col">Actual %</th>
            <th scope="col">AC</th>
            <th scope="col">PV</th>
            <th scope="col">EV</th>
            <th scope="col">CV</th>
            <th scope="col">SV</th>
            <th scope="col">CPI</th>
            <th scope="col">SPI</th>
            <th scope="col">EAC</th>
            <th scope="col">VAC</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => {
            const { indicators } = activity

            return (
              <tr key={activity.id}>
                <td>{activity.name}</td>
                <td>{formatMoney(activity.budget_at_completion)}</td>
                <td>{formatPercent(activity.planned_progress_percentage)}</td>
                <td>{formatPercent(activity.actual_progress_percentage)}</td>
                <td>{formatMoney(activity.actual_cost)}</td>
                <td>{formatIndicator(indicators.pv)}</td>
                <td>{formatIndicator(indicators.ev)}</td>
                <td>{formatIndicator(indicators.cv)}</td>
                <td>{formatIndicator(indicators.sv)}</td>
                <td>
                  <CpiSpiBadge
                    value={indicators.cpi}
                    interpretation={indicators.cpi_interpretation}
                    label="CPI"
                  />
                </td>
                <td>
                  <CpiSpiBadge
                    value={indicators.spi}
                    interpretation={indicators.spi_interpretation}
                    label="SPI"
                  />
                </td>
                <td>{formatIndicator(indicators.eac)}</td>
                <td>{formatIndicator(indicators.vac)}</td>
                <td className="activities-table-actions">
                  <button type="button" onClick={() => onEdit(activity.id)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => onDelete(activity.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
