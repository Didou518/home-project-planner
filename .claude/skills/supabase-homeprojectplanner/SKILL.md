---
name: supabase-homeprojectplanner
description: Workflow opérationnel Supabase pour HomeProjectPlanner — QUEL outil utiliser et dans QUEL ordre pour toute interaction avec la base. Active ce skill dès qu'il s'agit d'écrire/appliquer une migration, interroger ou inspecter la base, gérer les politiques RLS au niveau opérationnel, ou gérer l'environnement Supabase. Déclenche pour "applique la migration", "db push", "db reset", "nouvelle migration", "interroge la base", "RLS qui ne marche pas", "supabase link", "types Supabase". Complément OPÉRATIONNEL de dev-homeprojectplanner (qui, lui, conçoit le modèle de données et écrit les politiques RLS).
---

# Supabase — Workflow opérationnel HomeProjectPlanner

Ce skill fixe **comment** parler à Supabase sur ce projet. À lire d'abord — la réalité du projet diffère de setups plus outillés :

> **Pas de serveur MCP, pas (encore) de stack Supabase locale ni de seed.** L'accès se fait via la **CLI Supabase** (`pnpx supabase …`), et le projet est **lié à un projet Supabase distant** (cf `supabase/.temp/project-ref`). Les migrations sont **poussées directement sur le distant** par `pnpm db:migrate`.

⚠️ **Conséquence importante** : il n'y a **pas d'étape de validation locale** entre l'écriture d'une migration et son application au distant. Tu testes donc en distant. C'est le risque principal de ce workflow — voir §Risque & évolution possible.

## Scripts disponibles (package.json)

| Besoin | Script | Commande sous-jacente |
|--------|--------|------------------------|
| Pousser les migrations vers le distant | `pnpm db:migrate` | `pnpx supabase db push` |
| Créer un fichier de migration vide | `pnpm db:migrate:create <nom>` | `pnpx supabase migration new <nom>` |
| Reset de la base | `pnpm db:reset` | `pnpx supabase db reset` |

> `db:reset` rejoue **toutes** les migrations depuis zéro — destructif. Sur un projet **lié au distant sans stack local**, ne l'utilise **jamais** à la légère : il peut viser le distant et **détruire les données**. Toujours confirmer la cible avant.

## Workflow migration — le canon

1. **Créer le fichier** : `pnpm db:migrate:create <nom_snake_case>` → crée `supabase/migrations/<timestamp>_<nom>.sql`.
2. **Écrire le SQL** : conventions de `dev-homeprojectplanner` :
   - `ALTER TABLE x ENABLE ROW LEVEL SECURITY;` d'office sur toute nouvelle table.
   - Policies **SELECT / INSERT / UPDATE / DELETE séparées**.
   - Pour l'accès à un bien, **réutiliser les fonctions `SECURITY DEFINER`** existantes (`can_access_property`, `is_property_owner`, `is_property_member`) plutôt qu'une sous-requête cross-table — c'est ce qui évite la récursion RLS (cf migration `..._fix_rls_recursion.sql`).
   - Idempotence : `IF NOT EXISTS` / `DROP POLICY IF EXISTS` où pertinent.
3. **Relire** le SQL attentivement (pas de filet local). Vérifier mentalement le rejeu et les dépendances (ordre des tables, FK).
4. **Appliquer** : `pnpm db:migrate` (push vers le distant).
5. **Vérifier** côté Supabase (dashboard / requête) que la table et ses policies sont bien créées, RLS active, FK indexées.
6. **Mettre à jour les types TS** : ce projet n'a **pas** de génération automatique de types — les types sont écrits à la main dans `src/types/` (`Property.ts`, `Project.ts`). Après un changement de schéma, **mets-les à jour à la main** pour rester aligné.

## Inspecter / interroger la base

Pas de MCP : utilise le **dashboard Supabase** ou la CLI (`pnpx supabase …`) pour inspecter le schéma, les policies, les logs. Pour un diagnostic RLS, vérifie que la policy correspond bien au rôle (`auth.uid()`) et qu'aucune permissive ne court-circuite une restrictive.

## Le client runtime (`src/integrations/supabase/client.ts`)

- **Un seul client**, clé **publishable/anon** uniquement (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` dans `.env.local`). **Jamais** de service-role côté client.
- Session persistée dans `localStorage`, `autoRefreshToken` activé.
- Les composants UI ne parlent jamais à `supabase` en direct : toujours via une fonction de ce module (cf `dev-homeprojectplanner`). C'est ce qui rend la couche data remplaçable.

## Gotchas RLS (à garder en tête)

- **RLS ne restreint pas les COLONNES.** Une policy UPDATE permissive laisse changer une colonne sensible (ex. escalade de rôle dans `property_members`). `WITH CHECK` ne peut pas comparer à `OLD` → utiliser un **trigger BEFORE UPDATE**. Les policies se combinent en **OR** : ajouter une restrictive à côté d'une permissive ne restreint rien → **remplacer** la permissive.
- **Récursion entre policies** : une policy de `properties` qui interroge `property_members` (et inversement) part en récursion infinie. D'où les fonctions `SECURITY DEFINER`. **Ne réintroduis pas** de sous-requête cross-table dans une policy.
- **Trigger appelant `auth.uid()`** : NULL hors requête authentifiée. Le trigger `add_owner_as_member` dépend de `NEW.owner_id` (OK), mais attention pour tout INSERT fait en admin/SQL console.
- **Dette `projects`** : ses policies utilisent encore des `UNION` inline au lieu de `can_access_property`. À aligner à la prochaine migration touchant ces policies.

## Risque & évolution possible (à proposer, pas à imposer)

Le workflow actuel (push direct au distant, pas de stack local, pas de seed, types manuels) est **simple mais risqué** : aucune validation avant prod, pas de jeu de données de test reproductible. Si le projet grossit, propose à Pascal (décision à acter) :
- Mettre en place un **stack Supabase local** (`supabase start` + `config.toml` + `seed.sql`) pour valider les migrations avant push.
- Générer les types via `supabase gen types typescript --local` plutôt qu'à la main.
- Ajouter une CI qui rejoue migrations + lint + build.

Ne mets rien de tout ça en place sans validation explicite — c'est un changement de workflow structurant.

## Anti-patterns

- Lancer `pnpm db:reset` sans avoir confirmé qu'il ne vise pas une base avec des données réelles.
- Écrire dans la base via le dashboard SQL pour un changement de **schéma** (toujours une migration versionnée).
- Réintroduire une sous-requête cross-table dans une policy RLS (récursion).
- Oublier de mettre à jour `src/types/` après un changement de schéma (pas de génération auto ici).
- Filtrer côté client par `owner_id`/`property_id` « parce que la RLS est compliquée » → c'est que la RLS est mal écrite.

## Quand revenir à `dev-homeprojectplanner`

Ce skill est le **comment** (tooling, application). Le **quoi** (concevoir une table, écrire une politique RLS, modéliser une relation) reste `dev-homeprojectplanner`. Question de design de schéma → bascule.
