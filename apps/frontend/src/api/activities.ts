import type {
  ActivityCreateRequest,
  ActivityUpdateRequest,
  ActivityWithIndicatorsResponse,
} from '../types/api.ts';
import { delete as del, get, post, put } from './client.ts';

export function listActivitiesByProject(
  projectId: string,
): Promise<ActivityWithIndicatorsResponse[]> {
  return get<ActivityWithIndicatorsResponse[]>(`/projects/${projectId}/activities`);
}

export function createActivity(
  projectId: string,
  body: ActivityCreateRequest,
): Promise<ActivityWithIndicatorsResponse> {
  return post<ActivityWithIndicatorsResponse>(`/projects/${projectId}/activities`, body);
}

export function getActivity(activityId: string): Promise<ActivityWithIndicatorsResponse> {
  return get<ActivityWithIndicatorsResponse>(`/activities/${activityId}`);
}

export function updateActivity(
  activityId: string,
  body: ActivityUpdateRequest,
): Promise<ActivityWithIndicatorsResponse> {
  return put<ActivityWithIndicatorsResponse>(`/activities/${activityId}`, body);
}

export function deleteActivity(activityId: string): Promise<void> {
  return del<void>(`/activities/${activityId}`);
}
