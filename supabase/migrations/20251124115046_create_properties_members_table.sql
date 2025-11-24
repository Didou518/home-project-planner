-- Create property_members table (junction table)
CREATE TABLE IF NOT EXISTS property_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, user_id)
);

-- Update properties SELECT policy to include members
DROP POLICY IF EXISTS "Users can view properties they belong to" ON properties;
CREATE POLICY "Users can view properties they belong to"
  ON properties FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (SELECT property_id FROM property_members WHERE user_id = auth.uid())
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_property_members_property_id ON property_members(property_id);
CREATE INDEX IF NOT EXISTS idx_property_members_user_id ON property_members(user_id);

-- Enable RLS
ALTER TABLE property_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view members of properties they belong to
-- (owners can see all members, members can see all members of their properties)
CREATE POLICY "Users can view members of their properties"
  ON property_members FOR SELECT
  USING (
    property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid())
    OR property_id IN (SELECT property_id FROM property_members WHERE user_id = auth.uid())
  );

-- Policy: Only property owners can add members
CREATE POLICY "Only property owners can add members"
  ON property_members FOR INSERT
  WITH CHECK (
    property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid())
  );

-- Policy: Only property owners can update members
CREATE POLICY "Only property owners can update members"
  ON property_members FOR UPDATE
  USING (
    property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid())
  );

-- Policy: Only property owners can remove members
CREATE POLICY "Only property owners can remove members"
  ON property_members FOR DELETE
  USING (
    property_id IN (SELECT id FROM properties WHERE owner_id = auth.uid())
  );

-- Function to automatically add owner as member when creating a property
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO property_members (property_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (property_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically add owner as member
CREATE TRIGGER add_owner_as_member_trigger
  AFTER INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_as_member();

