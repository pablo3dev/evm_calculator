import type {
  ProjectCreateRequest,
  ProjectDetailResponse,
  ProjectResponse,
  ProjectUpdateRequest,
} from '../types/api.ts'
import { delete as del, get, post, put } from './client.ts'

export function listProjects(): Promise<ProjectResponse[]> {
  return get<ProjectResponse[]>('/projects')
}

export function createProject(
  body: ProjectCreateRequest,
): Promise<ProjectResponse> {
  return post<ProjectResponse>('/projects', body)
}

export function getProject(projectId: string): Promise<ProjectDetailResponse> {
  return get<ProjectDetailResponse>(`/projects/${projectId}`)
}

export function updateProject(
  projectId: string,
  body: ProjectUpdateRequest,
): Promise<ProjectResponse> {
  return put<ProjectResponse>(`/projects/${projectId}`, body)
}

export function deleteProject(projectId: string): Promise<void> {
  return del<void>(`/projects/${projectId}`)
}
