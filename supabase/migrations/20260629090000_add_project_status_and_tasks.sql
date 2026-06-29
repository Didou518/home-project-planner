-- M2 — Avancement projet : statut + tâches
-- Inclut la dette #11 : aligner les policies de `projects` sur can_access_property()
-- (fin des sous-requêtes UNION inline).

-- 1) Statut du projet (clés stables EN, libellés FR côté UI)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'todo'
  CHECK (status IN ('todo', 'in_progress', 'done'));

-- 2) Helper SECURITY DEFINER : accès à un projet = accès à son bien (pas de récursion)
CREATE OR REPLACE FUNCTION can_access_project(project_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects p
    WHERE p.id = project_uuid
      AND can_access_property(p.property_id)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3) Dette #11 : recréer les policies `projects` via can_access_property()
DROP POLICY IF EXISTS "Users can view projects from their properties" ON projects;
DROP POLICY IF EXISTS "Users can create projects in their properties" ON projects;
DROP POLICY IF EXISTS "Users can update projects in their properties" ON projects;
DROP POLICY IF EXISTS "Users can delete projects in their properties" ON projects;

CREATE POLICY "projects_select" ON projects FOR SELECT
  USING (can_access_property(property_id));
CREATE POLICY "projects_insert" ON projects FOR INSERT
  WITH CHECK (can_access_property(property_id));
CREATE POLICY "projects_update" ON projects FOR UPDATE
  USING (can_access_property(property_id));
CREATE POLICY "projects_delete" ON projects FOR DELETE
  USING (can_access_property(property_id));

-- 4) Tâches d'un projet
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  is_done BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);

ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_tasks_select" ON project_tasks FOR SELECT
  USING (can_access_project(project_id));
CREATE POLICY "project_tasks_insert" ON project_tasks FOR INSERT
  WITH CHECK (can_access_project(project_id));
CREATE POLICY "project_tasks_update" ON project_tasks FOR UPDATE
  USING (can_access_project(project_id));
CREATE POLICY "project_tasks_delete" ON project_tasks FOR DELETE
  USING (can_access_project(project_id));
