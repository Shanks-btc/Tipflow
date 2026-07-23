-- Per-streamer alert/settings columns, used by the dashboard Settings
-- modal (PATCH /api/streamers/settings). Existing rows get sane defaults
-- so nothing else that reads `streamers` needs to change.
ALTER TABLE streamers
  ADD COLUMN IF NOT EXISTS alert_duration integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS min_tip_amount numeric NOT NULL DEFAULT 1;
