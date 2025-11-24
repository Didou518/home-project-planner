-- Create houses table
CREATE TABLE IF NOT EXISTS houses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index on owner_id for faster queries
CREATE INDEX IF NOT EXISTS idx_houses_owner_id ON houses(owner_id);

-- Enable RLS
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view houses they own (will be updated in next migration to include members)
CREATE POLICY "Users can view houses they belong to"
  ON houses FOR SELECT
  USING (owner_id = auth.uid());

-- Policy: Users can create houses (they become owner)
CREATE POLICY "Users can create houses"
  ON houses FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Policy: Only owners can update houses
CREATE POLICY "Only owners can update houses"
  ON houses FOR UPDATE
  USING (owner_id = auth.uid());

-- Policy: Only owners can delete houses
CREATE POLICY "Only owners can delete houses"
  ON houses FOR DELETE
  USING (owner_id = auth.uid());

