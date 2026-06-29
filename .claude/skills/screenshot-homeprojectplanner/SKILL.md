---
name: screenshot-homeprojectplanner
description: Prendre des screenshots et mesurer le layout du rendu réel de HomeProjectPlanner via Playwright. À utiliser pour vérifier visuellement une feature implémentée, debugger un problème de layout/overflow, ou valider un sprint avant de le clore. Se connecte sur /signin avec les identifiants fournis par variables d'environnement. Sauvegarde dans `.debug/<contexte>/`.
---

# Screenshot & layout debug — HomeProjectPlanner

## ⚠️ Prérequis (à installer — pas encore présent)

Playwright n'est **pas installé** sur ce projet. Avant la 1ʳᵉ utilisation :
```bash
pnpm add -D @playwright/test
pnpx playwright install chromium
```

> 🔴 **Ce script se connecte au Supabase RÉEL** (l'app n'a pas de stack local — `.env.local` pointe sur le projet distant). Les captures utilisent donc des **données réelles** et le **compte personnel** fourni en variable d'environnement. N'utilise ce skill que pour de la vérif visuelle, jamais pour des écritures de test en masse. Ne committe **jamais** d'identifiants dans `pw.cjs`.

## Lancer

1. Démarrer le dev server : `pnpm dev` (Vite, port **5173** par défaut).
2. Exporter les identifiants et lancer le script :
   ```bash
   PW_EMAIL=didou518@gmail.com PW_PASSWORD='***' \
     node .claude/skills/screenshot-homeprojectplanner/pw.cjs <cmd> <route> <fichier.png>
   ```

| Commande | Ce qu'elle fait |
|----------|----------------|
| `screenshot` | Screenshot viewport desktop (1280×800) après login |
| `measure` | Screenshot + dump JSON des mesures DOM (overflow, rects sidebar/header/main) |
| `scroll` | Screenshot après scroll au bas de la page |

## Conventions de nommage

```
.debug/
  <contexte>/            ← un dossier par sprint/jalon/bug
    properties.png
    project-detail.png
```

## Exemples

```bash
# Accueil (après login → /)
node .claude/skills/screenshot-homeprojectplanner/pw.cjs screenshot / .debug/sprint-x/home.png

# Liste des biens
node .claude/skills/screenshot-homeprojectplanner/pw.cjs screenshot /properties .debug/sprint-x/properties.png

# Projets d'un bien (remplacer PROPERTY_ID)
node .claude/skills/screenshot-homeprojectplanner/pw.cjs screenshot /properties/PROPERTY_ID/projects .debug/sprint-x/projects.png

# Mesurer le layout (overflow sidebar/main ?)
node .claude/skills/screenshot-homeprojectplanner/pw.cjs measure /properties .debug/sprint-x/properties-layout.png
```

## Paramètres

- **Port** : si le dev server n'est pas sur 5173, exporte `PW_BASE_URL=http://localhost:<port>`.
- **Viewport** : par défaut `desktop` (1280×800). Changer le 1ᵉʳ argument de `launch()` dans `pw.cjs` en `tablet` ou `mobile` pour tester le responsive (sidebar repliée).
- **Identifiants** : `PW_EMAIL` / `PW_PASSWORD` (jamais en dur dans le fichier).
- **Login** : le script va sur `/signin`, remplit email/mot de passe, soumet, attend la redirection hors `/signin`.

## Trouver le PROPERTY_ID

Après login, navigue dans la sidebar ou fais un `measure` sur `/properties` et lis les liens (`/properties/<id>/...`) dans le DOM dumpé.
