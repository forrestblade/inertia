CREATE TABLE daily_summaries (
  id SERIAL PRIMARY KEY,
  site_id TEXT NOT NULL,
  date DATE NOT NULL,
  business_type TEXT,
  schema_version INT DEFAULT 1,
  session_count INT,
  pageview_count INT,
  conversion_count INT,
  top_referrers JSONB DEFAULT '[]',
  top_pages JSONB DEFAULT '[]',
  intent_counts JSONB DEFAULT '{}',
  avg_flush_ms FLOAT DEFAULT 0,
  rejection_count INT DEFAULT 0,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, date)
);
