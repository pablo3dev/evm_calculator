import { useCallback, useEffect, useState } from 'react'
import { deleteActivity, listActivitiesByProject } from '../api/activities.ts'
import { ApiError } from '../api/client.ts'
import { getProject } from '../api/projects.ts'
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

function formatLoadError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isNetworkError()) {
      return 'Unable to reach the server. Check that the API is running.'
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

  return 'Failed to load dashboard data.'
}

export function Dashboard({ projectId }: DashboardProps) {
  const [project, setProject] = useState<ProjectDetailResponse | null>(null)
  const [activities, setActivities] = useState<
    ActivityWithIndicatorsResponse[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] =
    useState<ActivityWithIndicatorsResponse | null>(null)

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
          setError(formatLoadError(err))
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
  }, [projectId])

  const handleMutationSuccess = () => {
    refetch().catch((err: unknown) => {
      setError(formatLoadError(err))
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
    const name = activity?.name ?? 'this activity'

    const confirmed = window.confirm(
      `Delete activity "${name}"? This action cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    try {
      await deleteActivity(activityId)
      await refetch()
    } catch (err: unknown) {
      setError(formatLoadError(err))
    }
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
        <p className="dashboard-status">Loading dashboard…</p>
      ) : project ? (
        <>
          <ConsolidatedIndicators
            indicators={project.consolidated_indicators}
          />

          <div className="dashboard-activities-header">
            <h2 className="dashboard-activities-title">Activities</h2>
            <button
              type="button"
              className="loading-button"
              onClick={openCreateModal}
            >
              New activity
            </button>
          </div>

          <ActivitiesTable
            activities={activities}
            onEdit={openEditModal}
            onDelete={handleDeleteFromTable}
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
