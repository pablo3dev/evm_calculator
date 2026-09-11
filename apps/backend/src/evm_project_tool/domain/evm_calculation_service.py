from decimal import Decimal

from evm_project_tool.domain.activity import Activity
from evm_project_tool.domain.evm_indicator_set import EvmIndicatorSet

_HUNDRED = Decimal("100")
_ONE = Decimal("1")
_ZERO = Decimal("0")

_CPI_NULL_INTERPRETATION = "Sin costo real registrado — CPI no aplicable"
_SPI_NULL_INTERPRETATION = "Sin avance planificado a la fecha — SPI no aplicable"


class EvmCalculationService:
    def calculate_for_activity(self, activity: Activity) -> EvmIndicatorSet:
        bac = activity.budgetAtCompletion.value
        planned_progress = activity.plannedProgressPercentage.value
        actual_progress = activity.actualProgressPercentage.value
        ac = activity.actualCost.value

        pv = self._planned_value(bac, planned_progress)
        ev = self._earned_value(bac, actual_progress)

        return self._build_indicator_set(bac=bac, pv=pv, ev=ev, ac=ac)

    def aggregate(self, activities: list[Activity]) -> EvmIndicatorSet:
        if not activities:
            return self._empty_aggregate()

        total_bac = _ZERO
        total_pv = _ZERO
        total_ev = _ZERO
        total_ac = _ZERO

        for activity in activities:
            bac = activity.budgetAtCompletion.value
            planned_progress = activity.plannedProgressPercentage.value
            actual_progress = activity.actualProgressPercentage.value
            ac = activity.actualCost.value

            total_bac += bac
            total_pv += self._planned_value(bac, planned_progress)
            total_ev += self._earned_value(bac, actual_progress)
            total_ac += ac

        return self._build_indicator_set(
            bac=total_bac,
            pv=total_pv,
            ev=total_ev,
            ac=total_ac,
        )

    @staticmethod
    def _planned_value(bac: Decimal, planned_progress: Decimal) -> Decimal:
        return planned_progress * bac / _HUNDRED

    @staticmethod
    def _earned_value(bac: Decimal, actual_progress: Decimal) -> Decimal:
        return actual_progress * bac / _HUNDRED

    def _build_indicator_set(
        self,
        *,
        bac: Decimal,
        pv: Decimal,
        ev: Decimal,
        ac: Decimal,
    ) -> EvmIndicatorSet:
        cv = ev - ac
        sv = ev - pv

        cpi: Decimal | None
        cpi_interpretation: str
        if ac == _ZERO:
            cpi = None
            cpi_interpretation = _CPI_NULL_INTERPRETATION
        else:
            cpi = ev / ac
            cpi_interpretation = self._interpret_cpi(cpi)

        spi: Decimal | None
        spi_interpretation: str
        if pv == _ZERO:
            spi = None
            spi_interpretation = _SPI_NULL_INTERPRETATION
        else:
            spi = ev / pv
            spi_interpretation = self._interpret_spi(spi)

        eac: Decimal | None = None
        if cpi is not None and cpi != _ZERO:
            eac = bac / cpi

        vac: Decimal | None = None
        if eac is not None:
            vac = bac - eac

        return EvmIndicatorSet(
            pv=pv,
            ev=ev,
            cv=cv,
            sv=sv,
            cpi=cpi,
            spi=spi,
            eac=eac,
            vac=vac,
            cpiInterpretation=cpi_interpretation,
            spiInterpretation=spi_interpretation,
        )

    def _empty_aggregate(self) -> EvmIndicatorSet:
        return EvmIndicatorSet(
            pv=_ZERO,
            ev=_ZERO,
            cv=_ZERO,
            sv=_ZERO,
            cpi=None,
            spi=None,
            eac=None,
            vac=None,
            cpiInterpretation=_CPI_NULL_INTERPRETATION,
            spiInterpretation=_SPI_NULL_INTERPRETATION,
        )

    @staticmethod
    def _interpret_cpi(cpi: Decimal) -> str:
        if cpi > _ONE:
            return "Bajo presupuesto"
        if cpi == _ONE:
            return "En presupuesto"
        return "Sobre presupuesto"

    @staticmethod
    def _interpret_spi(spi: Decimal) -> str:
        if spi > _ONE:
            return "Adelantado"
        if spi == _ONE:
            return "En plan"
        return "Atrasado"
