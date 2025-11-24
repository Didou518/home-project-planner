-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on property_id for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_property_id ON projects(property_id);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view projects from properties they belong to
CREATE POLICY "Users can view projects from their properties"
  ON projects FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid()
      UNION
      SELECT property_id FROM property_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can create projects in properties they belong to
CREATE POLICY "Users can create projects in their properties"
  ON projects FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid()
      UNION
      SELECT property_id FROM property_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update projects in properties they belong to
CREATE POLICY "Users can update projects in their properties"
  ON projects FOR UPDATE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid()
      UNION
      SELECT property_id FROM property_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete projects in properties they belong to
CREATE POLICY "Users can delete projects in their properties"
  ON projects FOR DELETE
  USING (
    property_id IN (
      SELECT id FROM properties WHERE owner_id = auth.uid()
      UNION
      SELECT property_id FROM property_members WHERE user_id = auth.uid()
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

