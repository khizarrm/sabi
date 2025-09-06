-- Added waitlist count tracking table
CREATE TABLE IF NOT EXISTS waitlist_stats (
  id SERIAL PRIMARY KEY,
  total_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial count
INSERT INTO waitlist_stats (total_count) VALUES (1247)
ON CONFLICT DO NOTHING;

-- Function to get current waitlist count
CREATE OR REPLACE FUNCTION get_waitlist_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM waitlist);
END;
$$ LANGUAGE plpgsql;

-- Function to update waitlist stats
CREATE OR REPLACE FUNCTION update_waitlist_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE waitlist_stats 
  SET total_count = get_waitlist_count(), 
      updated_at = NOW()
  WHERE id = 1;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update count
CREATE TRIGGER waitlist_count_trigger
  AFTER INSERT OR DELETE ON waitlist
  FOR EACH STATEMENT
  EXECUTE FUNCTION update_waitlist_stats();
