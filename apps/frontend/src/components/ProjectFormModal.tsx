import { useState, type FormEvent } from 'react'
import { ApiError } from '../api/client.ts'
import {
  createProject,
  deleteProject,
  updateProject,
} from '../api/projects.ts'
import { useMutationWithLock } from '../hooks/useMutationWithLock.ts'
import type {
  ProjectCreateRequest,
  ProjectResponse,
  ProjectUpdateRequest,
} from '../types/api.ts'
import { ErrorBanner } from './ErrorBanner.tsx'
import { LoadingButton } from './LoadingButton.tsx'

interface ProjectFormModalProps {
  project?: ProjectResponse | null
  open: boolean
  onClose: () => void
  onSuccess: (result: ProjectResponse | 'deleted', projectId: string) => void
}

interface ProjectFormFields {
  name: string
  description: string
}

const EMPTY_FIELDS: ProjectFormFields = {
  name: '',
  description: '',
}

function fieldsFromProject(project: ProjectResponse): ProjectFormFields {
  return {
    name: project.name,
    description: project.description ?? '',
  }
}

function formatMutationError(error: unknown): string {
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

  return 'Failed to save project.'
}

function buildRequestBody(
  fields: ProjectFormFields,
): ProjectCreateRequest | ProjectUpdateRequest {
  const trimmedDescription = fields.description.trim()

  return {
    name: fields.name.trim(),
    description: trimmedDescription.length > 0 ? trimmedDescription : null,
  }
}

interface ProjectFormModalContentProps {
  project?: ProjectResponse | null
  onClose: () => void
  onSuccess: (result: ProjectResponse | 'deleted', projectId: string) => void
}

function ProjectFormModalContent({
  project,
  onClose,
  onSuccess,
}: ProjectFormModalContentProps) {
  const isEditMode = Boolean(project)
  const { isLocked, runMutation } = useMutationWithLock()
  const [fields, setFields] = useState<ProjectFormFields>(() =>
    project ? fieldsFromProject(project) : EMPTY_FIELDS,
  )
  const [error, setError] = useState<string | null>(null)

  const updateField = (key: keyof ProjectFormFields, value: string) => {
    setFields((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const body = buildRequestBody(fields)

    const result = await runMutation(async () => {
      try {
        if (isEditMode && project) {
          return await updateProject(project.id, body)
        }
        return await createProject(body)
      } catch (err: unknown) {
        setError(formatMutationError(err))
        throw err
      }
    })

    if (result !== undefined) {
      onSuccess(result, result.id)
      onClose()
    }
  }

  const handleDelete = async () => {
    if (!project || !isEditMode) {
      return
    }

    const confirmed = window.confirm(
      `Delete project "${fields.name}"? This action cannot be undone.`,
    )

    if (!confirmed) {
      return
    }

    setError(null)

    const result = await runMutation(async () => {
      try {
        await deleteProject(project.id)
        return 'deleted' as const
      } catch (err: unknown) {
        setError(formatMutationError(err))
        throw err
      }
    })

    if (result !== undefined) {
      onSuccess('deleted', project.id)
      onClose()
    }
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="modal-dialog project-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2 id="project-form-title">
            {isEditMode ? 'Edit project' : 'New project'}
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={isLocked}
          >
            ×
          </button>
        </header>

        <form className="activity-form" onSubmit={handleSubmit}>
          {error && <ErrorBanner message={error} />}

          <div className="form-field">
            <label htmlFor="project-name">Name</label>
            <input
              id="project-name"
              type="text"
              required
              value={fields.name}
              onChange={(event) => updateField('name', event.target.value)}
              disabled={isLocked}
            />
          </div>

          <div className="form-field">
            <label htmlFor="project-description">Description (optional)</label>
            <textarea
              id="project-description"
              rows={3}
              value={fields.description}
              onChange={(event) =>
                updateField('description', event.target.value)
              }
              disabled={isLocked}
            />
          </div>

          <footer className="modal-footer">
            {isEditMode && (
              <LoadingButton
                type="button"
                className="button-danger"
                loading={isLocked}
                onClick={handleDelete}
              >
                Delete
              </LoadingButton>
            )}
            <div className="modal-footer-actions">
              <button
                type="button"
                className="button-secondary"
                onClick={onClose}
                disabled={isLocked}
              >
                Cancel
              </button>
              <LoadingButton type="submit" loading={isLocked}>
                {isEditMode ? 'Save changes' : 'Create project'}
              </LoadingButton>
            </div>
          </footer>
        </form>
      </div>
    </div>
  )
}

export function ProjectFormModal({
  project,
  open,
  onClose,
  onSuccess,
}: ProjectFormModalProps) {
  if (!open) {
    return null
  }

  return (
    <ProjectFormModalContent
      key={project?.id ?? 'new'}
      project={project}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  )
}
