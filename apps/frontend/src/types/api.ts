export interface EvmIndicators {
  pv: number
  ev: number
  cv: number
  sv: number
  cpi: number | null
  spi: number | null
  eac: number | null
  vac: number | null
  cpi_interpretation: string
  spi_interpretation: string
}

export interface ProjectResponse {
  id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface ProjectDetailResponse extends ProjectResponse {
  consolidated_indicators: EvmIndicators
}

export interface ProjectCreateRequest {
  name: string
  description?: string | null
}

export interface ProjectUpdateRequest {
  name: string
  description?: string | null
}

export interface ActivityCreateRequest {
  name: string
  budget_at_completion: number
  planned_progress_percentage: number
  actual_progress_percentage: number
  actual_cost: number
}

export interface ActivityUpdateRequest {
  name: string
  budget_at_completion: number
  planned_progress_percentage: number
  actual_progress_percentage: number
  actual_cost: number
}

export interface ActivityWithIndicatorsResponse {
  id: string
  project_id: string
  name: string
  budget_at_completion: number
  planned_progress_percentage: number
  actual_progress_percentage: number
  actual_cost: number
  created_at: string
  updated_at: string
  indicators: EvmIndicators
}

export interface ValidationErrorDetail {
  loc: (string | number)[]
  msg: string
  type: string
}

export interface HttpValidationError {
  detail: ValidationErrorDetail[]
}

export interface HttpError {
  detail: string
}
