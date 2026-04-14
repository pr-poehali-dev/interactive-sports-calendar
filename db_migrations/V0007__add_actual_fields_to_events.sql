ALTER TABLE events
  ADD COLUMN IF NOT EXISTS actual_participants INTEGER,
  ADD COLUMN IF NOT EXISTS actual_spectators INTEGER,
  ADD COLUMN IF NOT EXISTS actual_comment TEXT;