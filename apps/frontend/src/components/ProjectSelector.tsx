import { useEffect, useState } from 'react'
import { ApiError } from '../api/client.ts'
import { listProjects } from '../api/projects.ts'
import type { ProjectResponse } from '../types/api.ts'
import { ErrorBanner } from './ErrorBanner.tsx'

interface ProjectSelectorProps {
  value: string | null
  onChange: (id: string) => void
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

export function ProjectSelector({ value, onChange }: ProjectSelectorProps) {
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    listProjects()
      .then((data) => {
        if (!cancelled) {
          setProjects(data)
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

  const selectedProject =
    projects.find((project) => project.id === value) ?? null

  if (loading) {
    return <p className="project-selector-status">Loading projects…</p>
  }

  if (error) {
    return <ErrorBanner message={error} />
  }

  if (projects.length === 0) {
    return <p className="project-selector-status">No projects available.</p>
  }

  return (
    <div className="project-selector">
      <label htmlFor="project-select">Project</label>
      <select
        id="project-select"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="" disabled>
          Select a project
        </option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </select>
      {selectedProject && (
        <p className="project-selector-selected">
          Active: <strong>{selectedProject.name}</strong>
        </p>
      )}
    </div>
  )
}
