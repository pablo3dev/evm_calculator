from decimal import Decimal
from uuid import uuid4

import pytest

from evm_project_tool.domain import Activity, EvmCalculationService

_CPI_NULL = "Sin costo real registrado — CPI no aplicable"
_SPI_NULL = "Sin avance planificado a la fecha — SPI no aplicable"


@pytest.fixture
def service() -> EvmCalculationService:
    return EvmCalculationService()


def _activity(
    *,
    bac: str,
    planned: str,
    actual: str,
    ac: str,
) -> Activity:
    return Activity.create(
        id=uuid4(),
        projectId=uuid4(),
        name="Test activity",
        budgetAtCompletion=Decimal(bac),
        plannedProgressPercentage=Decimal(planned),
        actualProgressPercentage=Decimal(actual),
        actualCost=Decimal(ac),
    )


class TestCalculateForActivity:
    def test_ec01_ac_zero_cpi_eac_vac_null(self, service: EvmCalculationService) -> None:
        activity = _activity(bac="1000", planned="50", actual="40", ac="0")
        indicators = service.calculate_for_activity(activity)

        assert indicators.pv == Decimal("500")
        assert indicators.ev == Decimal("400")
        assert indicators.cpi is None
        assert indicators.eac is None
        assert indicators.vac is None
        assert indicators.cpiInterpretation == _CPI_NULL

    def test_ec02_pv_zero_spi_null(self, service: EvmCalculationService) -> None:
        activity = _activity(bac="1000", planned="0", actual="25", ac="200")
        indicators = service.calculate_for_activity(activity)

        assert indicators.pv == Decimal("0")
        assert indicators.ev == Decimal("250")
        assert indicators.spi is None
        assert indicators.spiInterpretation == _SPI_NULL
        assert indicators.cpi == Decimal("1.25")
        assert indicators.cpiInterpretation == "Bajo presupuesto"

    def test_ec04_zero_actual_progress_with_ac_positive(self, service: EvmCalculationService) -> None:
        activity = _activity(bac="1000", planned="50", actual="0", ac="300")
        indicators = service.calculate_for_activity(activity)

        assert indicators.ev == Decimal("0")
        assert indicators.cpi == Decimal("0")
        assert indicators.cpiInterpretation == "Sobre presupuesto"
        assert indicators.cv == Decimal("-300")
        assert indicators.sv == Decimal("-500")
        assert indicators.eac is None
        assert indicators.vac is None

    def test_ec05_bac_zero(self, service: EvmCalculationService) -> None:
        activity = _activity(bac="0", planned="50", actual="25", ac="100")
        indicators = service.calculate_for_activity(activity)

        assert indicators.pv == Decimal("0")
        assert indicators.ev == Decimal("0")
        assert indicators.spi is None
        assert indicators.spiInterpretation == _SPI_NULL
        assert indicators.cpi == Decimal("0")
        assert indicators.cv == Decimal("-100")
        assert indicators.sv == Decimal("0")

    def test_ec06_favorable_scenario(self, service: EvmCalculationService) -> None:
        activity = _activity(bac="1000", planned="50", actual="60", ac="500")
        indicators = service.calculate_for_activity(activity)

        assert indicators.pv == Decimal("500")
        assert indicators.ev == Decimal("600")
        assert indicators.cv == Decimal("100")
        assert indicators.sv == Decimal("100")
        assert indicators.cpi == Decimal("1.2")
        assert indicators.spi == Decimal("1.2")
        assert indicators.cpiInterpretation == "Bajo presupuesto"
        assert indicators.spiInterpretation == "Adelantado"
        assert indicators.eac == Decimal("1000") / Decimal("1.2")
        assert indicators.vac == Decimal("1000") - indicators.eac


class TestAggregate:
    def test_ec03_empty_activities(self, service: EvmCalculationService) -> None:
        indicators = service.aggregate([])

        assert indicators.pv == Decimal("0")
        assert indicators.ev == Decimal("0")
        assert indicators.cv == Decimal("0")
        assert indicators.sv == Decimal("0")
        assert indicators.cpi is None
        assert indicators.spi is None
        assert indicators.eac is None
        assert indicators.vac is None
        assert indicators.cpiInterpretation == _CPI_NULL
        assert indicators.spiInterpretation == _SPI_NULL

    def test_rn12_sums_bases_not_averages_indices(self, service: EvmCalculationService) -> None:
        activities = [
            _activity(bac="1000", planned="50", actual="50", ac="400"),
            _activity(bac="1000", planned="50", actual="50", ac="600"),
        ]
        per_activity_cpi = [
            service.calculate_for_activity(activity).cpi for activity in activities
        ]
        indicators = service.aggregate(activities)

        assert per_activity_cpi == [Decimal("1.25"), Decimal("0.8333333333333333333333333333")]
        assert indicators.pv == Decimal("1000")
        assert indicators.ev == Decimal("1000")
        assert indicators.cpi == Decimal("1")
        assert indicators.spi == Decimal("1")
        assert indicators.cpiInterpretation == "En presupuesto"
        assert indicators.spiInterpretation == "En plan"


@pytest.mark.parametrize(
    ("cpi", "expected"),
    [
        (Decimal("1.5"), "Bajo presupuesto"),
        (Decimal("1"), "En presupuesto"),
        (Decimal("0.5"), "Sobre presupuesto"),
    ],
)
def test_cpi_interpretation_values(
    service: EvmCalculationService,
    cpi: Decimal,
    expected: str,
) -> None:
    assert service._interpret_cpi(cpi) == expected


@pytest.mark.parametrize(
    ("spi", "expected"),
    [
        (Decimal("1.5"), "Adelantado"),
        (Decimal("1"), "En plan"),
        (Decimal("0.5"), "Atrasado"),
    ],
)
def test_spi_interpretation_values(
    service: EvmCalculationService,
    spi: Decimal,
    expected: str,
) -> None:
    assert service._interpret_spi(spi) == expected


# EC-07: project_id inexistente — application layer (HTTP 404), N/A in domain tests.
# EC-08 / EC-09: domain validation — covered by Activity / value object entity tests.
