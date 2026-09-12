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
  const { locale, t } = useI18n()

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
