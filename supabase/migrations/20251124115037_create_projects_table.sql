-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on house_id for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_house_id ON projects(house_id);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view projects from houses they belong to
CREATE POLICY "Users can view projects from their houses"
  ON projects FOR SELECT
  USING (
    house_id IN (
      SELECT id FROM houses WHERE owner_id = auth.uid()
      UNION
      SELECT house_id FROM house_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can create projects in houses they belong to
CREATE POLICY "Users can create projects in their houses"
  ON projects FOR INSERT
  WITH CHECK (
    house_id IN (
      SELECT id FROM houses WHERE owner_id = auth.uid()
      UNION
      SELECT house_id FROM house_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update projects in houses they belong to
CREATE POLICY "Users can update projects in their houses"
  ON projects FOR UPDATE
  USING (
    house_id IN (
      SELECT id FROM houses WHERE owner_id = auth.uid()
      UNION
      SELECT house_id FROM house_members WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete projects in houses they belong to
CREATE POLICY "Users can delete projects in their houses"
  ON projects FOR DELETE
  USING (
    house_id IN (
      SELECT id FROM houses WHERE owner_id = auth.uid()
      UNION
      SELECT house_id FROM house_members WHERE user_id = auth.uid()
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

