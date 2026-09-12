import { useCallback, useEffect, useState } from 'react'
import { deleteActivity, listActivitiesByProject } from '../api/activities.ts'
import { ApiError } from '../api/client.ts'
import { getProject } from '../api/projects.ts'
import { useMutationWithLock } from '../hooks/useMutationWithLock.ts'
import { useI18n } from '../i18n/useI18n.ts'
import type { TranslationKey } from '../i18n/types.ts'
import type {
  ActivityWithIndicatorsResponse,
  ProjectDetailResponse,
} from '../types/api.ts'
import { ActivitiesTable } from './ActivitiesTable.tsx'
import { ActivityFormModal } from './ActivityFormModal.tsx'
import { ConsolidatedIndicators } from './ConsolidatedIndicators.tsx'
import { ErrorBanner } from './ErrorBanner.tsx'
import { PvEvAcChart } from './PvEvAcChart.tsx'

export interface DashboardProps {
  projectId: string
}

function formatLoadError(
  error: unknown,
  t: (key: TranslationKey) => string,
): string {
  if (error instanceof ApiError) {
    if (error.isNetworkError()) {
      return t('common.errorNetwork')
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

  return t('dashboard.errorLoadFailed')
}

export function Dashboard({ projectId }: DashboardProps) {
  const { t } = useI18n()
  const [project, setProject] = useState<ProjectDetailResponse | null>(null)
  const [activities, setActivities] = useState<
    ActivityWithIndicatorsResponse[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] =
    useState<ActivityWithIndicatorsResponse | null>(null)
  const { isLocked, runMutation } = useMutationWithLock()

  const refetch = useCallback(async () => {
    const [projectData, activitiesData] = await Promise.all([
      getProject(projectId),
      listActivitiesByProject(projectId),
    ])
    setProject(projectData)
    setActivities(activitiesData)
  }, [projectId])

  useEffect(() => {
    let cancelled = false

    Promise.all([getProject(projectId), listActivitiesByProject(projectId)])
      .then(([projectData, activitiesData]) => {
        if (!cancelled) {
          setProject(projectData)
          setActivities(activitiesData)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(formatLoadError(err, t))
          setProject(null)
          setActivities([])
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [projectId, t])

  const handleMutationSuccess = () => {
    refetch().catch((err: unknown) => {
      setError(formatLoadError(err, t))
    })
  }

  const openCreateModal = () => {
    setEditingActivity(null)
    setModalOpen(true)
  }

  const openEditModal = (activityId: string) => {
    const activity = activities.find((item) => item.id === activityId) ?? null
    setEditingActivity(activity)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingActivity(null)
  }

  const handleDeleteFromTable = async (activityId: string) => {
    const activity = activities.find((item) => item.id === activityId)
    const name = activity?.name ?? t('activityForm.fallbackName')

    const confirmed = window.confirm(
      t('activityForm.confirmDelete').replace('{name}', name),
    )

    if (!confirmed) {
      return
    }

    await runMutation(async () => {
      try {
        await deleteActivity(activityId)
        await refetch()
      } catch (err: unknown) {
        setError(formatLoadError(err, t))
        throw err
      }
    })
  }

  const handleModalDelete = async () => {
    if (!editingActivity) {
      return
    }

    await deleteActivity(editingActivity.id)
  }

  return (
    <div className="dashboard">
      {error && <ErrorBanner message={error} />}

      {loading ? (
        <p className="dashboard-status">{t('common.loading')}</p>
      ) : project ? (
        <>
          <ConsolidatedIndicators
            indicators={project.consolidated_indicators}
          />

          <div className="dashboard-activities-header">
            <h2 className="dashboard-activities-title">
              {t('dashboard.activitiesTitle')}
            </h2>
            <button
              type="button"
              className="loading-button"
              onClick={openCreateModal}
            >
              {t('activityForm.titleCreate')}
            </button>
          </div>

          <ActivitiesTable
            activities={activities}
            onEdit={openEditModal}
            onDelete={handleDeleteFromTable}
            actionsDisabled={isLocked}
          />

          <PvEvAcChart activities={activities} />

          <ActivityFormModal
            projectId={projectId}
            activity={editingActivity}
            open={modalOpen}
            onClose={closeModal}
            onSuccess={handleMutationSuccess}
            onDelete={editingActivity ? handleModalDelete : undefined}
          />
        </>
      ) : null}
    </div>
  )
}
