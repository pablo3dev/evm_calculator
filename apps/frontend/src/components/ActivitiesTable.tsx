import type { EvmIndicatorCode } from '../i18n/evmIndicatorsCatalog.ts'
import { evmIndicatorsCatalog } from '../i18n/evmIndicatorsCatalog.ts'
import { useI18n } from '../i18n/useI18n.ts'
import type { ActivityWithIndicatorsResponse } from '../types/api.ts'
import {
  formatIndicator,
  formatMoney,
  formatPercent,
} from '../utils/formatDisplay.ts'
import { CpiSpiBadge } from './CpiSpiBadge.tsx'
import { LoadingButton } from './LoadingButton.tsx'
import { Tooltip } from './Tooltip.tsx'

export interface ActivitiesTableProps {
  activities: ActivityWithIndicatorsResponse[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  actionsDisabled?: boolean
}

interface EvmColumnHeaderProps {
  code: EvmIndicatorCode
  locale: 'es' | 'en'
}

function EvmColumnHeader({ code, locale }: EvmColumnHeaderProps) {
  const entry = evmIndicatorsCatalog[code]
  return (
    <>
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
    </>
  )
}

export function ActivitiesTable({
  activities,
  onEdit,
  onDelete,
  actionsDisabled = false,
}: ActivitiesTableProps) {
  const { locale } = useI18n()

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
            <th scope="col">
              <EvmColumnHeader code="PV" locale={locale} />
            </th>
            <th scope="col">
              <EvmColumnHeader code="EV" locale={locale} />
            </th>
            <th scope="col">
              <EvmColumnHeader code="CV" locale={locale} />
            </th>
            <th scope="col">
              <EvmColumnHeader code="SV" locale={locale} />
            </th>
            <th scope="col">
              <EvmColumnHeader code="CPI" locale={locale} />
            </th>
            <th scope="col">
              <EvmColumnHeader code="SPI" locale={locale} />
            </th>
            <th scope="col">
              <EvmColumnHeader code="EAC" locale={locale} />
            </th>
            <th scope="col">
              <EvmColumnHeader code="VAC" locale={locale} />
            </th>
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
                  <button
                    type="button"
                    disabled={actionsDisabled}
                    onClick={() => onEdit(activity.id)}
                  >
                    Edit
                  </button>
                  <LoadingButton
                    type="button"
                    loading={actionsDisabled}
                    onClick={() => onDelete(activity.id)}
                  >
                    Delete
                  </LoadingButton>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
