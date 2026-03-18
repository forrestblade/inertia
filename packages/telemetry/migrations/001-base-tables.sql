CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE sessions (
  session_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer TEXT,
  device_type VARCHAR(50) NOT NULL,
  operating_system TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE events (
  event_id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES sessions(session_id) ON DELETE RESTRICT,
  event_category VARCHAR(100) NOT NULL,
  dom_target TEXT,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_time_category ON events(created_at, event_category);
CREATE INDEX idx_events_payload ON events USING GIN(payload);
