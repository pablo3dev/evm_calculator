from uuid import UUID

from evm_project_tool.application.exceptions import NotFoundError
from evm_project_tool.application.ports import ActivityRepository


def delete_activity(activity_id: UUID, activity_repository: ActivityRepository) -> None:
    if not activity_repository.delete(activity_id):
        raise NotFoundError(f"Activity {activity_id} not found")
