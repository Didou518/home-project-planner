-- M5 — Partage foyer (2 comptes, sans e-mail)
-- Un "foyer" (household) regroupe des comptes ; tout bien d'un membre est
-- automatiquement visible par les autres membres (foyer auto, ADR-002).

-- Tables
CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS household_members (
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (household_id, user_id),
  UNIQUE (user_id) -- un seul foyer par utilisateur
);

CREATE TABLE IF NOT EXISTS household_invites (
  code TEXT PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_invites ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION public.my_household_id()
RETURNS UUID LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '' AS $$
  SELECT household_id FROM public.household_members WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.shares_household_with(target UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members a
    JOIN public.household_members b ON a.household_id = b.household_id
    WHERE a.user_id = auth.uid() AND b.user_id = target
  );
$$;

-- RLS : on ne voit que son foyer (mutations via RPC SECURITY DEFINER)
CREATE POLICY "households_select" ON households FOR SELECT
  USING (id = public.my_household_id());
CREATE POLICY "household_members_select" ON household_members FOR SELECT
  USING (household_id = public.my_household_id());
CREATE POLICY "household_invites_select" ON household_invites FOR SELECT
  USING (household_id = public.my_household_id());

-- Accès aux biens : owner OU membre explicite OU même foyer que l'owner
CREATE OR REPLACE FUNCTION public.can_access_property(property_uuid UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  RETURN public.is_property_owner(property_uuid)
      OR public.is_property_member(property_uuid)
      OR EXISTS (
           SELECT 1 FROM public.properties p
           WHERE p.id = property_uuid
             AND public.shares_household_with(p.owner_id)
         );
END;
$$;

-- Foyer auto à l'inscription
CREATE OR REPLACE FUNCTION public.ensure_household_for_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE hid UUID;
BEGIN
  INSERT INTO public.households DEFAULT VALUES RETURNING id INTO hid;
  INSERT INTO public.household_members (household_id, user_id) VALUES (hid, NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_household_for_user();

-- Backfill : un foyer pour chaque compte existant sans foyer
DO $$
DECLARE u RECORD; hid UUID;
BEGIN
  FOR u IN
    SELECT id FROM auth.users
    WHERE id NOT IN (SELECT user_id FROM public.household_members)
  LOOP
    INSERT INTO public.households DEFAULT VALUES RETURNING id INTO hid;
    INSERT INTO public.household_members (household_id, user_id) VALUES (hid, u.id);
  END LOOP;
END $$;

-- RPC : générer un code d'invitation pour son foyer
CREATE OR REPLACE FUNCTION public.create_household_invite()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_code TEXT; v_household UUID;
BEGIN
  SELECT household_id INTO v_household FROM public.household_members WHERE user_id = auth.uid();
  IF v_household IS NULL THEN RAISE EXCEPTION 'Aucun foyer'; END IF;
  v_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  INSERT INTO public.household_invites (code, household_id, created_by)
  VALUES (v_code, v_household, auth.uid());
  RETURN v_code;
END;
$$;

-- RPC : rejoindre un foyer via code
CREATE OR REPLACE FUNCTION public.redeem_household_invite(invite_code TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_target UUID; v_old UUID;
BEGIN
  SELECT household_id INTO v_target FROM public.household_invites
    WHERE code = upper(invite_code) AND expires_at > now();
  IF v_target IS NULL THEN RAISE EXCEPTION 'Code invalide ou expiré'; END IF;

  SELECT household_id INTO v_old FROM public.household_members WHERE user_id = auth.uid();
  IF v_old = v_target THEN RETURN; END IF;

  UPDATE public.household_members SET household_id = v_target WHERE user_id = auth.uid();

  DELETE FROM public.households h
   WHERE h.id = v_old
     AND NOT EXISTS (SELECT 1 FROM public.household_members m WHERE m.household_id = h.id);

  DELETE FROM public.household_invites WHERE code = upper(invite_code);
END;
$$;

-- RPC : quitter le foyer (revenir à un foyer perso)
CREATE OR REPLACE FUNCTION public.leave_household()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE v_new UUID; v_old UUID;
BEGIN
  SELECT household_id INTO v_old FROM public.household_members WHERE user_id = auth.uid();
  INSERT INTO public.households DEFAULT VALUES RETURNING id INTO v_new;
  UPDATE public.household_members SET household_id = v_new WHERE user_id = auth.uid();
  DELETE FROM public.households h
   WHERE h.id = v_old
     AND NOT EXISTS (SELECT 1 FROM public.household_members m WHERE m.household_id = h.id);
END;
$$;
