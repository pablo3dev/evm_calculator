import type { EvmIndicatorCode } from '../i18n/evmIndicatorsCatalog.ts'
import { useI18n } from '../i18n/useI18n.ts'
import type { ActivityWithIndicatorsResponse } from '../types/api.ts'
import {
  formatIndicator,
  formatMoney,
  formatPercent,
} from '../utils/formatDisplay.ts'
import { CpiSpiBadge } from './CpiSpiBadge.tsx'
import { EvmIndicatorLabel } from './EvmIndicatorLabel.tsx'
import { LoadingButton } from './LoadingButton.tsx'

export interface ActivitiesTableProps {
  activities: ActivityWithIndicatorsResponse[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  actionsDisabled?: boolean
}

function EvmColumnHeader({ code }: { code: EvmIndicatorCode }) {
  return <EvmIndicatorLabel code={code} />
}

export function ActivitiesTable({
  activities,
  onEdit,
  onDelete,
  actionsDisabled = false,
}: ActivitiesTableProps) {
  const { t } = useI18n()

  if (activities.length === 0) {
    return (
      <div className="activities-table-empty">
        <p>{t('activitiesTable.emptyState')}</p>
      </div>
    )
  }

  return (
    <div className="activities-table-wrapper">
      <table className="activities-table">
        <thead>
          <tr>
            <th scope="col">{t('activitiesTable.columnActivity')}</th>
            <th scope="col">{t('activitiesTable.columnBudget')}</th>
            <th scope="col">{t('activitiesTable.columnPlannedProgress')}</th>
            <th scope="col">{t('activitiesTable.columnActualProgress')}</th>
            <th scope="col">{t('activitiesTable.columnActualCost')}</th>
            <th scope="col">
              <EvmColumnHeader code="PV" />
            </th>
            <th scope="col">
              <EvmColumnHeader code="EV" />
            </th>
            <th scope="col">
              <EvmColumnHeader code="CV" />
            </th>
            <th scope="col">
              <EvmColumnHeader code="SV" />
            </th>
            <th scope="col">
              <EvmColumnHeader code="CPI" />
            </th>
            <th scope="col">
              <EvmColumnHeader code="SPI" />
            </th>
            <th scope="col">
              <EvmColumnHeader code="EAC" />
            </th>
            <th scope="col">
              <EvmColumnHeader code="VAC" />
            </th>
            <th scope="col">{t('activitiesTable.columnActions')}</th>
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
                    metric="cpi"
                    label="CPI"
                  />
                </td>
                <td>
                  <CpiSpiBadge
                    value={indicators.spi}
                    metric="spi"
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
                    {t('common.edit')}
                  </button>
                  <LoadingButton
                    type="button"
                    className="activities-table-delete"
                    loading={actionsDisabled}
                    onClick={() => onDelete(activity.id)}
                  >
                    {t('common.delete')}
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
