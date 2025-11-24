# Supabase Migrations

Ce dossier contient les migrations SQL pour la base de données Supabase.

## Structure

Les migrations sont numérotées par timestamp pour garantir l'ordre d'exécution :

- `20251124115035_create_houses_table.sql` - Création de la table houses
- `20251124115036_create_house_members_table.sql` - Création de la table house_members
- `20251124115037_create_projects_table.sql` - Création de la table projects

## Commandes disponibles

### Appliquer les migrations

```bash
pnpm db:migrate
```

### Créer une nouvelle migration

```bash
pnpm db:migrate:create nom_de_la_migration
```

### Réinitialiser la base de données (⚠️ supprime toutes les données)

```bash
pnpm db:reset
```

## Configuration requise

Pour utiliser ces commandes, vous devez :

1. Installer Supabase CLI : `npm install -g supabase`
2. Lier votre projet : `supabase link --project-ref your-project-ref`
3. Configurer les variables d'environnement si nécessaire

## Notes

- Les migrations sont exécutées dans l'ordre chronologique
- Chaque migration est idempotente (utilise `IF NOT EXISTS` où approprié)
- Les RLS (Row Level Security) policies sont incluses dans chaque migration
