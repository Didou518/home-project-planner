-- Create house_members table (junction table)
CREATE TABLE IF NOT EXISTS house_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(house_id, user_id)
);

-- Update houses SELECT policy to include members
DROP POLICY IF EXISTS "Users can view houses they belong to" ON houses;
CREATE POLICY "Users can view houses they belong to"
  ON houses FOR SELECT
  USING (
    owner_id = auth.uid() OR
    id IN (SELECT house_id FROM house_members WHERE user_id = auth.uid())
  );

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_house_members_house_id ON house_members(house_id);
CREATE INDEX IF NOT EXISTS idx_house_members_user_id ON house_members(user_id);

-- Enable RLS
ALTER TABLE house_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view members of houses they belong to
-- (owners can see all members, members can see all members of their houses)
CREATE POLICY "Users can view members of their houses"
  ON house_members FOR SELECT
  USING (
    house_id IN (SELECT id FROM houses WHERE owner_id = auth.uid())
    OR house_id IN (SELECT house_id FROM house_members WHERE user_id = auth.uid())
  );

-- Policy: Only house owners can add members
CREATE POLICY "Only house owners can add members"
  ON house_members FOR INSERT
  WITH CHECK (
    house_id IN (SELECT id FROM houses WHERE owner_id = auth.uid())
  );

-- Policy: Only house owners can update members
CREATE POLICY "Only house owners can update members"
  ON house_members FOR UPDATE
  USING (
    house_id IN (SELECT id FROM houses WHERE owner_id = auth.uid())
  );

-- Policy: Only house owners can remove members
CREATE POLICY "Only house owners can remove members"
  ON house_members FOR DELETE
  USING (
    house_id IN (SELECT id FROM houses WHERE owner_id = auth.uid())
  );

-- Function to automatically add owner as member when creating a house
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO house_members (house_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (house_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically add owner as member
CREATE TRIGGER add_owner_as_member_trigger
  AFTER INSERT ON houses
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_as_member();

