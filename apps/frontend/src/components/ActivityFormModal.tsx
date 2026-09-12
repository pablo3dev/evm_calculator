import { useState, type FormEvent } from 'react'
import { createActivity, updateActivity } from '../api/activities.ts'
import { ApiError } from '../api/client.ts'
import type {
  ActivityCreateRequest,
  ActivityUpdateRequest,
  ActivityWithIndicatorsResponse,
} from '../types/api.ts'
import { useMutationWithLock } from '../hooks/useMutationWithLock.ts'
import { useI18n } from '../i18n/useI18n.ts'
import type { TranslationKey } from '../i18n/types.ts'
import { ErrorBanner } from './ErrorBanner.tsx'
import { LoadingButton } from './LoadingButton.tsx'

interface ActivityFormModalProps {
  projectId: string
  activity?: ActivityWithIndicatorsResponse | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
  onDelete?: () => Promise<void>
}

interface ActivityFormFields {
  name: string
  budget_at_completion: string
  planned_progress_percentage: string
  actual_progress_percentage: string
  actual_cost: string
}

const EMPTY_FIELDS: ActivityFormFields = {
  name: '',
  budget_at_completion: '0',
  planned_progress_percentage: '0',
  actual_progress_percentage: '0',
  actual_cost: '0',
}

function fieldsFromActivity(
  activity: ActivityWithIndicatorsResponse,
): ActivityFormFields {
  return {
    name: activity.name,
    budget_at_completion: String(activity.budget_at_completion),
    planned_progress_percentage: String(activity.planned_progress_percentage),
    actual_progress_percentage: String(activity.actual_progress_percentage),
    actual_cost: String(activity.actual_cost),
  }
}

function formatMutationError(
  error: unknown,
  t: (key: TranslationKey) => string,
): string {
  if (error instanceof ApiError) {
    if (error.isValidationError()) {
      return error.body.detail.map((item) => item.msg).join('; ')
    }
    if (error.isNotFound() && error.body.detail) {
      return error.body.detail
    }
    if (
      typeof error.body === 'object' &&
      error.body !== null &&
      'detail' in error.body
    ) {
      const detail = (error.body as { detail: unknown }).detail
      if (typeof detail === 'string') {
        return detail
      }
    }
  }

  return t('activityForm.errorSaveFailed')
}

function buildRequestBody(
  fields: ActivityFormFields,
): ActivityCreateRequest | ActivityUpdateRequest {
  return {
    name: fields.name.trim(),
    budget_at_completion: Number(fields.budget_at_completion),
    planned_progress_percentage: Number(fields.planned_progress_percentage),
    actual_progress_percentage: Number(fields.actual_progress_percentage),
    actual_cost: Number(fields.actual_cost),
  }
}

interface ActivityFormModalContentProps {
  projectId: string
  activity?: ActivityWithIndicatorsResponse | null
  onClose: () => void
  onSuccess: () => void
  onDelete?: () => Promise<void>
}

function ActivityFormModalContent({
  projectId,
  activity,
  onClose,
  onSuccess,
  onDelete,
}: ActivityFormModalContentProps) {
  const isEditMode = Boolean(activity)
  const { isLocked, runMutation } = useMutationWithLock()
  const { t } = useI18n()
  const [fields, setFields] = useState<ActivityFormFields>(() =>
    activity ? fieldsFromActivity(activity) : EMPTY_FIELDS,
  )
  const [error, setError] = useState<string | null>(null)

  const updateField = (key: keyof ActivityFormFields, value: string) => {
    setFields((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const body = buildRequestBody(fields)

    const result = await runMutation(async () => {
      try {
        if (isEditMode && activity) {
          return await updateActivity(activity.id, body)
        }
        return await createActivity(projectId, body)
      } catch (err: unknown) {
        setError(formatMutationError(err, t))
        throw err
      }
    })

    if (result !== undefined) {
      onSuccess()
      onClose()
    }
  }

  const handleDelete = async () => {
    if (!onDelete || !isEditMode) {
      return
    }

    const confirmed = window.confirm(
      t('activityForm.confirmDelete').replace('{name}', fields.name),
    )

    if (!confirmed) {
      return
    }

    setError(null)

    const result = await runMutation(async () => {
      try {
        await onDelete()
      } catch (err: unknown) {
        setError(formatMutationError(err, t))
        throw err
      }
    })

    if (result !== undefined) {
      onSuccess()
      onClose()
    }
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-dialog activity-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="activity-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="activity-form-title">
            {isEditMode
              ? t('activityForm.titleEdit')
              : t('activityForm.titleCreate')}
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            ×
          </button>
        </header>

        <form className="activity-form" onSubmit={handleSubmit}>
          {error && <ErrorBanner message={error} />}

          <div className="form-field">
            <label htmlFor="activity-name">{t('activityForm.fieldName')}</label>
            <input
              id="activity-name"
              type="text"
              required
              value={fields.name}
              onChange={(event) => updateField('name', event.target.value)}
              disabled={isLocked}
            />
          </div>

          <div className="form-field">
            <label htmlFor="activity-bac">
              {t('activityForm.fieldBudgetAtCompletion')}
            </label>
            <input
              id="activity-bac"
              type="number"
              required
              min={0}
              step="any"
              value={fields.budget_at_completion}
              onChange={(event) =>
                updateField('budget_at_completion', event.target.value)
              }
              disabled={isLocked}
            />
          </div>

          <div className="form-field">
            <label htmlFor="activity-planned-progress">
              {t('activityForm.fieldPlannedProgress')}
            </label>
            <input
              id="activity-planned-progress"
              type="number"
              required
              min={0}
              max={100}
              step="any"
              value={fields.planned_progress_percentage}
              onChange={(event) =>
                updateField('planned_progress_percentage', event.target.value)
              }
              disabled={isLocked}
            />
          </div>

          <div className="form-field">
            <label htmlFor="activity-actual-progress">
              {t('activityForm.fieldActualProgress')}
            </label>
            <input
              id="activity-actual-progress"
              type="number"
              required
              min={0}
              max={100}
              step="any"
              value={fields.actual_progress_percentage}
              onChange={(event) =>
                updateField('actual_progress_percentage', event.target.value)
              }
              disabled={isLocked}
            />
          </div>

          <div className="form-field">
            <label htmlFor="activity-actual-cost">
              {t('activityForm.fieldActualCost')}
            </label>
            <input
              id="activity-actual-cost"
              type="number"
              required
              min={0}
              step="any"
              value={fields.actual_cost}
              onChange={(event) =>
                updateField('actual_cost', event.target.value)
              }
              disabled={isLocked}
            />
          </div>

          <footer className="modal-footer">
            {isEditMode && onDelete && (
              <LoadingButton
                type="button"
                className="button-danger"
                loading={isLocked}
                onClick={handleDelete}
              >
                {t('common.delete')}
              </LoadingButton>
            )}
            <div className="modal-footer-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={onClose}
                disabled={isLocked}
              >
                {t('common.cancel')}
              </button>
              <LoadingButton type="submit" loading={isLocked}>
                {isEditMode
                  ? t('activityForm.submitLabelEdit')
                  : t('activityForm.submitLabelCreate')}
              </LoadingButton>
            </div>
          </footer>
        </form>
      </div>
    </div>
  )
}

export function ActivityFormModal({
  projectId,
  activity,
  open,
  onClose,
  onSuccess,
  onDelete,
}: ActivityFormModalProps) {
  if (!open) {
    return null
  }

  return (
    <ActivityFormModalContent
      key={activity?.id ?? 'new'}
      projectId={projectId}
      activity={activity}
      onClose={onClose}
      onSuccess={onSuccess}
      onDelete={onDelete}
    />
  )
}
