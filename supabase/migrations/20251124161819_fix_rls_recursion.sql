-- Fix infinite recursion in RLS policies by using SECURITY DEFINER functions

-- Function to check if user is owner of a property (bypasses RLS)
CREATE OR REPLACE FUNCTION is_property_owner(property_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM properties
    WHERE id = property_uuid AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is a member of a property (bypasses RLS)
CREATE OR REPLACE FUNCTION is_property_member(property_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM property_members
    WHERE property_id = property_uuid AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access a property (owner or member)
CREATE OR REPLACE FUNCTION can_access_property(property_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN is_property_owner(property_uuid) OR is_property_member(property_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view properties they belong to" ON properties;
DROP POLICY IF EXISTS "Users can view members of their properties" ON property_members;
DROP POLICY IF EXISTS "Only property owners can add members" ON property_members;
DROP POLICY IF EXISTS "Only property owners can update members" ON property_members;
DROP POLICY IF EXISTS "Only property owners can remove members" ON property_members;

-- Recreate properties SELECT policy using the function (no recursion)
CREATE POLICY "Users can view properties they belong to"
  ON properties FOR SELECT
  USING (can_access_property(id));

-- Recreate property_members policies using functions (no recursion)
CREATE POLICY "Users can view members of their properties"
  ON property_members FOR SELECT
  USING (can_access_property(property_id));

CREATE POLICY "Only property owners can add members"
  ON property_members FOR INSERT
  WITH CHECK (is_property_owner(property_id));

CREATE POLICY "Only property owners can update members"
  ON property_members FOR UPDATE
  USING (is_property_owner(property_id));

CREATE POLICY "Only property owners can remove members"
  ON property_members FOR DELETE
  USING (is_property_owner(property_id));

