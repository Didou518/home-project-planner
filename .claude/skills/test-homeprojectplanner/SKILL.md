---
name: test-homeprojectplanner
description: Workflow opérationnel pour LANCER les tests de HomeProjectPlanner en local — et, en amont, METTRE EN PLACE l'infra de test qui n'existe pas encore. Active ce skill pour "lance les tests", "run e2e", "mettre en place vitest", "installer playwright", "comment tester en local", "reproduire l'échec". Complément OPÉRATIONNEL de qa-homeprojectplanner (stratégie, cahier BDD) et de supabase-homeprojectplanner (gestion de la base).
---

# Tests — Workflow opérationnel HomeProjectPlanner

> **État actuel : il n'y a PAS d'infra de test.** `package.json` n'a aucun script `test`/`test:e2e`, et ni Vitest ni Playwright ne sont installés. Ce skill couvre donc **deux temps** : (A) **mettre en place** l'outillage, puis (B) **lancer** les tests une fois en place.

## A. Mise en place (à faire une fois, décision à acter avec Pascal)

Rien de tout ceci ne doit être installé sans validation explicite — c'est un changement de stack structurant.

### A.1 Tests unitaires (Vitest)

1. Installer : `pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom`.
2. Config `vitest.config.ts` (réutiliser l'alias `@` de `vite.config.ts`, environnement `jsdom`).
3. Scripts `package.json` :
   ```json
   "test": "vitest",
   "test:run": "vitest run"
   ```
4. Cibles naturelles : helpers de `src/lib/`, la logique de validation des `action`s (extraite si besoin), les stores Zustand purs.
   ⚠️ jsdom ne monte pas le routeur réel → les régressions d'overlay/navigation ne sont attrapées qu'en e2e.

### A.2 E2E (Playwright) — nécessite un stack Supabase local

L'e2e a besoin d'une base **isolée et reproductible**. **Ne jamais** lancer d'e2e contre le Supabase **distant réel** (risque de pollution/destruction de données). Donc, préalable :

1. **Stack Supabase local** : `pnpx supabase init` (créer `config.toml`) + `pnpx supabase start` + un `supabase/seed.sql` créant un compte de test et des données. Cf `supabase-homeprojectplanner` §Risque & évolution.
2. **Variante d'env de test** : un `.env.qa` pointant sur le local (`VITE_SUPABASE_URL=http://127.0.0.1:54321` + clé anon démo), et un mode Vite `--mode qa` chargé par le webServer Playwright. **Commiter `.env.qa`** (non secret), **jamais** `.env.local`.
3. Installer : `pnpm add -D @playwright/test` + `pnpx playwright install chromium`.
4. `playwright.config.ts` : `testDir: "./e2e"`, `baseURL: http://localhost:5173`, `webServer` lançant `pnpm dev --mode qa`, projets `chromium` + `mobile-chrome` (⚠️ `webkit`/mobile-safari échoue souvent en WSL local — l'exclure du local).
5. Scripts :
   ```json
   "test:e2e": "playwright test"
   ```
6. **Garde-fou anti-prod** (fortement recommandé) : dans les fixtures e2e, inspecter l'hôte du 1ᵉʳ appel Supabase et **faire échouer le run** si ce n'est pas `127.0.0.1`/`localhost`. Idem dans le script screenshot. C'est la protection qui évite de taper la prod par accident.

## B. Lancer les tests (une fois A en place)

| Niveau | Commande | Base requise |
|--------|----------|--------------|
| Unitaire (tout) | `pnpm test:run` | aucune |
| Unitaire (ciblé) | `pnpm test:run <chemin>` | aucune |
| Unitaire (watch) | `pnpm test` | aucune |
| E2E (suite) | `pnpm test:e2e` | **stack local + reset** |
| E2E (ciblé) | `pnpm test:e2e --project=chromium <spec>` | **stack local + reset** |
| Visuel | skill `screenshot-homeprojectplanner` | dev server |

**Toujours passer par les scripts pnpm**, jamais `vitest`/`playwright` en direct.

### Pré-run e2e

```bash
pnpx supabase start      # idempotent
pnpx supabase db reset   # rejoue migrations + seed (refaire après toute migration/seed)
pnpm test:e2e
```

⚠️ **Ne pas laisser tourner un `pnpm dev` (mode prod, `.env.local` → distant) sur le port e2e pendant un run** : Playwright le réutiliserait et taperait sur la **prod**. Couper le dev, ou utiliser un port dédié. C'est exactement ce que le garde-fou anti-prod (A.2.6) protège.

## Gotchas (anticipés)

- **`db reset` avant e2e si le schéma/seed a bougé** : `supabase start` ne rejoue pas les nouvelles migrations sur un volume déjà initialisé.
- **jsdom ≠ app réelle** : ne jamais conclure « tests OK » sur le seul unitaire pour une feature qui touche le routeur/la navigation.
- **Jamais de `waitForTimeout`** → `expect(...).toBeVisible()`, `waitForURL`.
- **mobile-safari (webkit) en WSL** : échoue souvent (libs système manquantes) → exclure du local, garder en CI Ubuntu si une CI est ajoutée.

## Anti-patterns

- Lancer un e2e contre le Supabase distant réel (sans stack local).
- Bricoler un `.env.local` temporaire pour rediriger vers le local → c'est le rôle de `.env.qa`.
- `vitest`/`playwright` en direct au lieu des scripts pnpm.
- Installer Vitest/Playwright sans en faire une décision actée avec Pascal.

## Frontière avec les autres skills

- **`qa-homeprojectplanner`** = le *quoi* tester (cahier BDD `04_QA/`, couverture, écriture des specs).
- **`test-homeprojectplanner`** (ce skill) = *mettre en place* puis *lancer* (commandes, base).
- **`screenshot-homeprojectplanner`** = vérif visuelle du rendu réel.
- **`supabase-homeprojectplanner`** = gérer la base (migrations, stack local, reset).
