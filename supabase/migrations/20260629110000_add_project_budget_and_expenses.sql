-- M3 — Budget projet : budget prévu + dépenses

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS budget NUMERIC(12, 2);

CREATE TABLE IF NOT EXISTS project_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  spent_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_expenses_project_id ON project_expenses(project_id);

ALTER TABLE project_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_expenses_select" ON project_expenses FOR SELECT
  USING (public.can_access_project(project_id));
CREATE POLICY "project_expenses_insert" ON project_expenses FOR INSERT
  WITH CHECK (public.can_access_project(project_id));
CREATE POLICY "project_expenses_update" ON project_expenses FOR UPDATE
  USING (public.can_access_project(project_id));
CREATE POLICY "project_expenses_delete" ON project_expenses FOR DELETE
  USING (public.can_access_project(project_id));
