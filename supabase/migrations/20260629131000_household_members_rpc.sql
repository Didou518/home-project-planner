-- M5 — RPC pour lister les membres du foyer (avec e-mail) côté UI

CREATE OR REPLACE FUNCTION public.get_household_members()
RETURNS TABLE (user_id UUID, email TEXT, is_me BOOLEAN)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '' AS $$
  SELECT u.id, u.email::text, (u.id = auth.uid())
  FROM public.household_members m
  JOIN auth.users u ON u.id = m.user_id
  WHERE m.household_id = public.my_household_id();
$$;
