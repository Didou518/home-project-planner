-- Priorisation des projets : ordre manuel global (tous biens confondus),
-- partagé au sein du foyer. Une colonne `priority` (entier) sur `projects`
-- + une RPC de réordonnancement atomique.

-- 1) Colonne d'ordre. NULL = pas encore priorisé → placé en fin de liste.
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS priority INTEGER;

-- 2) Backfill : ordre initial déterministe sur les projets existants
--    (par date de création) pour éviter une liste 100% NULL au démarrage.
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS rn
  FROM public.projects
)
UPDATE public.projects p
SET priority = ordered.rn
FROM ordered
WHERE ordered.id = p.id AND p.priority IS NULL;

-- 3) RPC de réordonnancement : affecte priority = position dans le tableau.
--    SECURITY DEFINER (contourne la RLS) MAIS garde-fou `can_access_project`
--    pour n'autoriser que les projets accessibles à l'appelant.
CREATE OR REPLACE FUNCTION public.reorder_projects(p_ids uuid[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.projects p
  SET priority = t.ord
  FROM unnest(p_ids) WITH ORDINALITY AS t(id, ord)
  WHERE p.id = t.id
    AND public.can_access_project(p.id);
END;
$$;

GRANT EXECUTE ON FUNCTION public.reorder_projects(uuid[]) TO authenticated;
