-- M4 — Fichiers : bucket Storage privé + table de métadonnées + RLS

-- Bucket privé pour les fichiers de projet (photos, devis)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- Métadonnées des fichiers (les octets vivent dans Storage)
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES project_expenses(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('photo', 'devis')),
  path TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_expense_id ON project_files(expense_id);

ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "project_files_select" ON project_files FOR SELECT
  USING (public.can_access_project(project_id));
CREATE POLICY "project_files_insert" ON project_files FOR INSERT
  WITH CHECK (public.can_access_project(project_id));
CREATE POLICY "project_files_delete" ON project_files FOR DELETE
  USING (public.can_access_project(project_id));

-- RLS Storage : accès aux objets selon le projet (1er dossier du chemin = project_id)
CREATE POLICY "project_files_storage_select" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'project-files'
    AND public.can_access_project(((storage.foldername(name))[1])::uuid)
  );
CREATE POLICY "project_files_storage_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-files'
    AND public.can_access_project(((storage.foldername(name))[1])::uuid)
  );
CREATE POLICY "project_files_storage_delete" ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'project-files'
    AND public.can_access_project(((storage.foldername(name))[1])::uuid)
  );
