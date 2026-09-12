export type EvmInterpretationKey =
  | 'cpiNull'
  | 'cpiAboveOne'
  | 'cpiEqualOne'
  | 'cpiBelowOne'
  | 'spiNull'
  | 'spiAboveOne'
  | 'spiEqualOne'
  | 'spiBelowOne'

export function getCpiInterpretationKey(
  cpi: number | null,
): EvmInterpretationKey {
  if (cpi === null) return 'cpiNull'
  if (cpi > 1) return 'cpiAboveOne'
  if (cpi === 1) return 'cpiEqualOne'
  return 'cpiBelowOne'
}

export function getSpiInterpretationKey(
  spi: number | null,
): EvmInterpretationKey {
  if (spi === null) return 'spiNull'
  if (spi > 1) return 'spiAboveOne'
  if (spi === 1) return 'spiEqualOne'
  return 'spiBelowOne'
}
