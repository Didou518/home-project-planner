-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create index on owner_id for faster queries
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view properties they own (will be updated in next migration to include members)
CREATE POLICY "Users can view properties they belong to"
  ON properties FOR SELECT
  USING (owner_id = auth.uid());

-- Policy: Users can create properties (they become owner)
CREATE POLICY "Users can create properties"
  ON properties FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- Policy: Only owners can update properties
CREATE POLICY "Only owners can update properties"
  ON properties FOR UPDATE
  USING (owner_id = auth.uid());

-- Policy: Only owners can delete properties
CREATE POLICY "Only owners can delete properties"
  ON properties FOR DELETE
  USING (owner_id = auth.uid());

