CREATE TABLE otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_otp_email ON otp_codes(email);

-- RLS stays ENABLED with zero policies (default-deny for anon/authenticated
-- roles). The API routes that read/write this table use the service-role
-- client, which bypasses RLS entirely regardless of its enabled state — so
-- this doesn't block the app. What it blocks is anyone hitting Supabase's
-- REST API directly with the public NEXT_PUBLIC_SUPABASE_ANON_KEY (shipped
-- to every browser by design) and reading other users' valid, unexpired
-- login codes. Disabling RLS on this table instead would make every
-- pending OTP code readable by anyone who knows the project URL — a full
-- account-takeover vector requiring no cleverness.
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
