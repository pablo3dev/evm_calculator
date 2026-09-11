CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    budget_at_completion NUMERIC(14,2) NOT NULL CHECK (budget_at_completion >= 0),
    planned_progress_percentage NUMERIC(5,2) NOT NULL CHECK (planned_progress_percentage BETWEEN 0 AND 100),
    actual_progress_percentage NUMERIC(5,2) NOT NULL CHECK (actual_progress_percentage BETWEEN 0 AND 100),
    actual_cost NUMERIC(14,2) NOT NULL CHECK (actual_cost >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activities_project_id ON activities(project_id);
