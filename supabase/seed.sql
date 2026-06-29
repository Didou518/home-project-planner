-- Seed de démo — HomeProjectPlanner
-- Rattache un bien + quelques projets à l'utilisateur le plus ancien (ton compte).
-- Idempotent : UUID fixes + ON CONFLICT DO NOTHING (rejouable sans doublon).
-- Le trigger add_owner_as_member crée automatiquement la ligne property_members.

do $$
declare
  v_owner uuid := (select id from auth.users order by created_at asc limit 1);
  v_prop  uuid := '00000000-0000-0000-0000-0000000000a1';
begin
  if v_owner is null then
    raise notice 'Aucun utilisateur dans auth.users — crée un compte via l''app avant de seeder.';
    return;
  end if;

  insert into properties (id, name, owner_id)
  values (v_prop, 'Maison de démo', v_owner)
  on conflict (id) do nothing;

  insert into projects (id, property_id, name, description) values
    ('00000000-0000-0000-0000-0000000000b1', v_prop, 'Rénovation cuisine',     'Refaire la cuisine de A à Z (meubles, électroménager, carrelage).'),
    ('00000000-0000-0000-0000-0000000000b2', v_prop, 'Isolation des combles',  'Isoler pour réduire la facture de chauffage.'),
    ('00000000-0000-0000-0000-0000000000b3', v_prop, 'Aménagement du jardin',  'Terrasse, clôture et plantations.')
  on conflict (id) do nothing;

  raise notice 'Seed appliqué pour owner=%', v_owner;
end $$;
