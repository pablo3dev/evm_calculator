import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client.ts'
import { listProjects } from '../api/projects.ts'
import type { ProjectResponse } from '../types/api.ts'
import { formatDateTime } from '../utils/formatDisplay.ts'
import { ErrorBanner } from './ErrorBanner.tsx'
import { LoadingButton } from './LoadingButton.tsx'
import { ProjectFormModal } from './ProjectFormModal.tsx'

interface ProjectSelectorProps {
  value: string | null
  onChange: (id: string | null) => void
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

  return 'Failed to load projects.'
}

function sortProjects(projects: ProjectResponse[]): ProjectResponse[] {
  return [...projects].sort(
    (left, right) =>
      new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
  )
}

export function ProjectSelector({ value, onChange }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectResponse | null>(
    null,
  )

  const refetchProjects = useCallback(async () => {
    const data = await listProjects()
    setProjects(sortProjects(data))
    return data
  }, [])

  useEffect(() => {
    let cancelled = false

    listProjects()
      .then((data) => {
        if (!cancelled) {
          setProjects(sortProjects(data))
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(formatLoadError(err))
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
  }, [])

  const openCreateModal = () => {
    setEditingProject(null)
    setModalOpen(true)
  }

  const openEditModal = () => {
    const project = projects.find((item) => item.id === value) ?? null
    setEditingProject(project)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingProject(null)
  }

  const handleMutationSuccess = async (
    result: ProjectResponse | 'deleted',
    projectId: string,
  ) => {
    setError(null)

    try {
      await refetchProjects()

      if (result === 'deleted') {
        if (value === projectId) {
          onChange(null)
        }
        return
      }

      onChange(result.id)
    } catch (err: unknown) {
      setError(formatLoadError(err))
    }
  }

  if (loading) {
    return <p className="project-selector-status">Loading projects…</p>
  }

  if (error && projects.length === 0) {
    return <ErrorBanner message={error} />
  }

  return (
    <div className="project-selector">
      {error && <ErrorBanner message={error} />}

      <div className="project-selector-header">
        <h2 className="project-selector-title">Projects</h2>
        <LoadingButton type="button" onClick={openCreateModal}>
          New project
        </LoadingButton>
      </div>

      {projects.length === 0 ? (
        <p className="project-selector-status">
          No projects yet. Create a project to get started.
        </p>
      ) : (
        <ul className="project-list">
          {projects.map((project) => {
            const isSelected = project.id === value

            return (
              <li
                key={project.id}
                className={`project-list-item${isSelected ? ' project-list-item-selected' : ''}`}
              >
                <button
                  type="button"
                  className="project-list-select"
                  onClick={() => onChange(project.id)}
                  aria-pressed={isSelected}
                >
                  <span className="project-list-name">{project.name}</span>
                  {project.description && (
                    <span className="project-list-description">
                      {project.description}
                    </span>
                  )}
                  <span className="project-list-dates">
                    Created: {formatDateTime(project.created_at)} · Updated:{' '}
                    {formatDateTime(project.updated_at)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {value && (
        <div className="project-selector-actions">
          <LoadingButton type="button" onClick={openEditModal}>
            Edit project
          </LoadingButton>
        </div>
      )}

      <ProjectFormModal
        project={editingProject}
        open={modalOpen}
        onClose={closeModal}
        onSuccess={handleMutationSuccess}
      />
    </div>
  )
}
