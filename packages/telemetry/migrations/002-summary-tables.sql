CREATE TABLE session_summaries (
  id SERIAL PRIMARY KEY,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_sessions INT,
  unique_referrers INT,
  device_mobile INT,
  device_desktop INT,
  device_tablet INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period_start, period_end)
);

CREATE TABLE event_summaries (
  id SERIAL PRIMARY KEY,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  event_category VARCHAR(100),
  total_count INT,
  unique_sessions INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period_start, period_end, event_category)
);

CREATE TABLE conversion_summaries (
  id SERIAL PRIMARY KEY,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  intent_type VARCHAR(100),
  total_count INT,
  top_sources JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period_start, period_end, intent_type)
);

CREATE TABLE ingestion_health (
  id SERIAL PRIMARY KEY,
  period_start TIMESTAMPTZ NOT NULL,
  payloads_accepted INT,
  payloads_rejected INT,
  avg_processing_ms FLOAT,
  buffer_saturation_pct FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
