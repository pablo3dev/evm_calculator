from decimal import Decimal
from unittest.mock import MagicMock
from uuid import uuid4

import pytest

from evm_project_tool.application.exceptions import NotFoundError, ValidationError
from evm_project_tool.application.use_cases import (
    create_activity,
    create_project,
    delete_activity,
    delete_project,
    get_activity,
    get_project,
    list_activities,
    list_projects,
    update_activity,
    update_project,
)
from evm_project_tool.domain import Activity, EvmIndicatorSet, Project


@pytest.fixture
def project_repository() -> MagicMock:
    return MagicMock()


@pytest.fixture
def activity_repository() -> MagicMock:
    return MagicMock()


def _project(*, name: str = "Alpha", description: str | None = "Desc") -> Project:
    return Project(id=uuid4(), name=name, description=description)


def _activity(*, project_id=None) -> Activity:
    return Activity.create(
        id=uuid4(),
        projectId=project_id or uuid4(),
        name="Build module",
        budgetAtCompletion=Decimal("1000"),
        plannedProgressPercentage=Decimal("50"),
        actualProgressPercentage=Decimal("40"),
        actualCost=Decimal("400"),
    )


def _indicators(
    *,
    cpi_interpretation: str = "Bajo presupuesto",
    spi_interpretation: str = "Adelantado",
) -> EvmIndicatorSet:
    return EvmIndicatorSet(
        pv=Decimal("500"),
        ev=Decimal("600"),
        cpi=Decimal("1.2"),
        spi=Decimal("1.2"),
        cpiInterpretation=cpi_interpretation,
        spiInterpretation=spi_interpretation,
    )


class TestCreateProject:
    def test_happy_path(self, project_repository: MagicMock) -> None:
        expected = _project(name="New project")
        project_repository.create.return_value = expected

        result = create_project("New project", project_repository, description="Desc")

        assert result is expected
        project_repository.create.assert_called_once()
        created = project_repository.create.call_args.args[0]
        assert created.name == "New project"
        assert created.description == "Desc"

    @pytest.mark.parametrize("name", ["", "   "])
    def test_empty_name_raises_validation_error(
        self, project_repository: MagicMock, name: str
    ) -> None:
        with pytest.raises(ValidationError, match="Project name must not be empty"):
            create_project(name, project_repository)

        project_repository.create.assert_not_called()


class TestListProjects:
    def test_returns_all_projects(self, project_repository: MagicMock) -> None:
        projects = [_project(name="A"), _project(name="B")]
        project_repository.list_all.return_value = projects

        assert list_projects(project_repository) == projects
        project_repository.list_all.assert_called_once_with()


class TestUpdateProject:
    def test_happy_path(self, project_repository: MagicMock) -> None:
        project_id = uuid4()
        existing = Project(id=project_id, name="Old", description=None)
        updated = Project(id=project_id, name="New", description="Updated")
        project_repository.get_by_id.return_value = existing
        project_repository.update.return_value = updated

        result = update_project(project_id, "New", "Updated", project_repository)

        assert result is updated
        project_repository.update.assert_called_once()

    def test_not_found_raises(self, project_repository: MagicMock) -> None:
        project_id = uuid4()
        project_repository.get_by_id.return_value = None

        with pytest.raises(NotFoundError, match=f"Project {project_id} not found"):
            update_project(project_id, "Name", None, project_repository)

        project_repository.update.assert_not_called()

    def test_empty_name_raises_validation_error(self, project_repository: MagicMock) -> None:
        project_id = uuid4()
        project_repository.get_by_id.return_value = _project()

        with pytest.raises(ValidationError, match="Project name must not be empty"):
            update_project(project_id, "", None, project_repository)

        project_repository.update.assert_not_called()


class TestDeleteProject:
    def test_happy_path(self, project_repository: MagicMock) -> None:
        project_id = uuid4()
        project_repository.delete.return_value = True

        delete_project(project_id, project_repository)

        project_repository.delete.assert_called_once_with(project_id)

    def test_not_found_raises(self, project_repository: MagicMock) -> None:
        project_id = uuid4()
        project_repository.delete.return_value = False

        with pytest.raises(NotFoundError, match=f"Project {project_id} not found"):
            delete_project(project_id, project_repository)


class TestCreateActivity:
    def test_happy_path(self, activity_repository: MagicMock) -> None:
        project_id = uuid4()
        expected = _activity(project_id=project_id)
        activity_repository.exists_project.return_value = True
        activity_repository.create.return_value = expected

        result = create_activity(
            project_id,
            "Build module",
            Decimal("1000"),
            Decimal("50"),
            Decimal("40"),
            Decimal("400"),
            activity_repository,
        )

        assert result is expected
        activity_repository.exists_project.assert_called_once_with(project_id)
        activity_repository.create.assert_called_once()

    def test_nonexistent_project_raises_not_found(self, activity_repository: MagicMock) -> None:
        project_id = uuid4()
        activity_repository.exists_project.return_value = False

        with pytest.raises(NotFoundError, match=f"Project {project_id} not found"):
            create_activity(
                project_id,
                "Build module",
                Decimal("1000"),
                Decimal("50"),
                Decimal("40"),
                Decimal("400"),
                activity_repository,
            )

        activity_repository.create.assert_not_called()

    def test_empty_name_raises_validation_error(self, activity_repository: MagicMock) -> None:
        project_id = uuid4()
        activity_repository.exists_project.return_value = True

        with pytest.raises(ValidationError, match="Activity name must not be empty"):
            create_activity(
                project_id,
                "",
                Decimal("1000"),
                Decimal("50"),
                Decimal("40"),
                Decimal("400"),
                activity_repository,
            )

        activity_repository.create.assert_not_called()


class TestUpdateActivity:
    def test_happy_path(self, activity_repository: MagicMock) -> None:
        existing = _activity()
        updated = _activity(project_id=existing.projectId)
        activity_repository.get_by_id.return_value = existing
        activity_repository.update.return_value = updated

        result = update_activity(
            existing.id,
            "Renamed",
            Decimal("2000"),
            Decimal("60"),
            Decimal("55"),
            Decimal("900"),
            activity_repository,
        )

        assert result is updated
        activity_repository.update.assert_called_once()

    def test_not_found_raises(self, activity_repository: MagicMock) -> None:
        activity_id = uuid4()
        activity_repository.get_by_id.return_value = None

        with pytest.raises(NotFoundError, match=f"Activity {activity_id} not found"):
            update_activity(
                activity_id,
                "Name",
                Decimal("1000"),
                Decimal("50"),
                Decimal("40"),
                Decimal("400"),
                activity_repository,
            )

        activity_repository.update.assert_not_called()

    def test_empty_name_raises_validation_error(self, activity_repository: MagicMock) -> None:
        existing = _activity()
        activity_repository.get_by_id.return_value = existing

        with pytest.raises(ValidationError, match="Activity name must not be empty"):
            update_activity(
                existing.id,
                "  ",
                Decimal("1000"),
                Decimal("50"),
                Decimal("40"),
                Decimal("400"),
                activity_repository,
            )

        activity_repository.update.assert_not_called()


class TestDeleteActivity:
    def test_happy_path(self, activity_repository: MagicMock) -> None:
        activity_id = uuid4()
        activity_repository.delete.return_value = True

        delete_activity(activity_id, activity_repository)

        activity_repository.delete.assert_called_once_with(activity_id)

    def test_not_found_raises(self, activity_repository: MagicMock) -> None:
        activity_id = uuid4()
        activity_repository.delete.return_value = False

        with pytest.raises(NotFoundError, match=f"Activity {activity_id} not found"):
            delete_activity(activity_id, activity_repository)


class TestGetProject:
    def test_happy_path(
        self, project_repository: MagicMock, activity_repository: MagicMock
    ) -> None:
        project = _project()
        activities = [_activity(project_id=project.id), _activity(project_id=project.id)]
        consolidated = _indicators()
        evm_service = MagicMock()
        evm_service.aggregate.return_value = consolidated
        project_repository.get_by_id.return_value = project
        activity_repository.list_by_project_id.return_value = activities

        result = get_project(
            project.id, project_repository, activity_repository, evm_service
        )

        assert result.project is project
        assert result.consolidated_indicators is consolidated
        assert result.consolidated_indicators.cpiInterpretation == "Bajo presupuesto"
        assert result.consolidated_indicators.spiInterpretation == "Adelantado"
        project_repository.get_by_id.assert_called_once_with(project.id)
        activity_repository.list_by_project_id.assert_called_once_with(project.id)
        evm_service.aggregate.assert_called_once_with(activities)

    def test_not_found_raises(
        self, project_repository: MagicMock, activity_repository: MagicMock
    ) -> None:
        project_id = uuid4()
        project_repository.get_by_id.return_value = None

        with pytest.raises(NotFoundError, match=f"Project {project_id} not found"):
            get_project(project_id, project_repository, activity_repository)

        activity_repository.list_by_project_id.assert_not_called()

    def test_uses_evm_calculation_service_aggregate(
        self, project_repository: MagicMock, activity_repository: MagicMock
    ) -> None:
        project = _project()
        activities = [_activity(project_id=project.id)]
        evm_service = MagicMock()
        evm_service.aggregate.return_value = _indicators()
        project_repository.get_by_id.return_value = project
        activity_repository.list_by_project_id.return_value = activities

        get_project(project.id, project_repository, activity_repository, evm_service)

        evm_service.aggregate.assert_called_once_with(activities)


class TestListActivities:
    def test_happy_path(self, activity_repository: MagicMock) -> None:
        project_id = uuid4()
        activities = [_activity(project_id=project_id), _activity(project_id=project_id)]
        indicators_a = _indicators(
            cpi_interpretation="Bajo presupuesto",
            spi_interpretation="Adelantado",
        )
        indicators_b = _indicators(
            cpi_interpretation="Sobre presupuesto",
            spi_interpretation="Retrasado",
        )
        evm_service = MagicMock()
        evm_service.calculate_for_activity.side_effect = [indicators_a, indicators_b]
        activity_repository.exists_project.return_value = True
        activity_repository.list_by_project_id.return_value = activities

        result = list_activities(project_id, activity_repository, evm_service)

        assert len(result) == 2
        assert result[0].activity is activities[0]
        assert result[0].indicators is indicators_a
        assert result[0].indicators.cpiInterpretation == "Bajo presupuesto"
        assert result[0].indicators.spiInterpretation == "Adelantado"
        assert result[1].activity is activities[1]
        assert result[1].indicators is indicators_b
        assert result[1].indicators.cpiInterpretation == "Sobre presupuesto"
        assert result[1].indicators.spiInterpretation == "Retrasado"

    def test_project_not_found_raises(self, activity_repository: MagicMock) -> None:
        project_id = uuid4()
        activity_repository.exists_project.return_value = False

        with pytest.raises(NotFoundError, match=f"Project {project_id} not found"):
            list_activities(project_id, activity_repository)

        activity_repository.list_by_project_id.assert_not_called()

    def test_calculate_for_activity_called_per_activity(
        self, activity_repository: MagicMock
    ) -> None:
        project_id = uuid4()
        activities = [_activity(project_id=project_id), _activity(project_id=project_id)]
        evm_service = MagicMock()
        evm_service.calculate_for_activity.return_value = _indicators()
        activity_repository.exists_project.return_value = True
        activity_repository.list_by_project_id.return_value = activities

        list_activities(project_id, activity_repository, evm_service)

        assert evm_service.calculate_for_activity.call_count == 2
        evm_service.calculate_for_activity.assert_any_call(activities[0])
        evm_service.calculate_for_activity.assert_any_call(activities[1])


class TestGetActivity:
    def test_happy_path(self, activity_repository: MagicMock) -> None:
        activity = _activity()
        indicators = _indicators()
        evm_service = MagicMock()
        evm_service.calculate_for_activity.return_value = indicators
        activity_repository.get_by_id.return_value = activity

        result = get_activity(activity.id, activity_repository, evm_service)

        assert result.activity is activity
        assert result.indicators is indicators
        assert result.indicators.cpiInterpretation == "Bajo presupuesto"
        assert result.indicators.spiInterpretation == "Adelantado"
        evm_service.calculate_for_activity.assert_called_once_with(activity)

    def test_not_found_raises(self, activity_repository: MagicMock) -> None:
        activity_id = uuid4()
        activity_repository.get_by_id.return_value = None

        with pytest.raises(NotFoundError, match=f"Activity {activity_id} not found"):
            get_activity(activity_id, activity_repository)

        activity_repository.get_by_id.assert_called_once_with(activity_id)
