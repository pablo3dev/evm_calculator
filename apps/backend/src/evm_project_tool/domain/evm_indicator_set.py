from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class EvmIndicatorSet:
    pv: Decimal | None = None
    ev: Decimal | None = None
    cv: Decimal | None = None
    sv: Decimal | None = None
    cpi: Decimal | None = None
    spi: Decimal | None = None
    eac: Decimal | None = None
    vac: Decimal | None = None
    cpiInterpretation: str | None = None
    spiInterpretation: str | None = None
