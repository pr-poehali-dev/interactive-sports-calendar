ALTER TABLE events
  ADD COLUMN IF NOT EXISTS responsible_person TEXT,
  ADD COLUMN IF NOT EXISTS responsible_position TEXT,
  ADD COLUMN IF NOT EXISTS responsible_phone TEXT;