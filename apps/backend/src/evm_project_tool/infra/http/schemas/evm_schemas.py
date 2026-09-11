import logging
from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from evm_project_tool.domain import EvmIndicatorSet

logger = logging.getLogger(__name__)


class EvmIndicators(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    pv: float
    ev: float
    cv: float
    sv: float
    cpi: float | None
    spi: float | None
    eac: float | None
    vac: float | None
    cpi_interpretation: str
    spi_interpretation: str

    @classmethod
    def from_domain(
        cls, indicators: EvmIndicatorSet, *, context: str = ""
    ) -> EvmIndicators:
        log_null_indicators_if_applicable(indicators, context=context)
        return cls(
            pv=_to_float(indicators.pv),
            ev=_to_float(indicators.ev),
            cv=_to_float(indicators.cv),
            sv=_to_float(indicators.sv),
            cpi=_to_optional_float(indicators.cpi),
            spi=_to_optional_float(indicators.spi),
            eac=_to_optional_float(indicators.eac),
            vac=_to_optional_float(indicators.vac),
            cpi_interpretation=indicators.cpiInterpretation or "",
            spi_interpretation=indicators.spiInterpretation or "",
        )


def _to_float(value: Decimal | None) -> float:
    return float(value or Decimal("0"))


def _to_optional_float(value: Decimal | None) -> float | None:
    if value is None:
        return None
    return float(value)


def log_null_indicators_if_applicable(
    indicators: EvmIndicatorSet,
    *,
    context: str,
) -> None:
    if indicators.cpi is None or indicators.spi is None:
        logger.warning(
            "RN-09 null indicators for %s (cpi=%s, spi=%s)",
            context or "unknown",
            indicators.cpi,
            indicators.spi,
        )
