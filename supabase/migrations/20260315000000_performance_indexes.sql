-- PATCH 1/2 — Performance: composite indexes for the most frequent query patterns

-- Highlights: users load annotations per book+chapter while reading
CREATE INDEX IF NOT EXISTS idx_highlights_user_book_chapter
  ON highlights(user_id, book, chapter);

-- Structured notes: lookup by user + location (verse or chapter scope)
CREATE INDEX IF NOT EXISTS idx_structured_notes_user_book_chapter
  ON structured_notes(user_id, book, chapter);

-- Bible verses: reader loads every chapter by translation+book+chapter (hottest query)
CREATE INDEX IF NOT EXISTS idx_bible_verses_translation_book_chapter
  ON bible_verses(translation, book, chapter);

-- Favorite verses: user list page queries all favorites for a user
CREATE INDEX IF NOT EXISTS idx_favorite_verses_user_id
  ON favorite_verses(user_id);

-- Analytics events: admin dashboard and per-user timeline queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_created
  ON analytics_events(user_id, created_at DESC);

-- App events: admin real-time feed sorted by recency
CREATE INDEX IF NOT EXISTS idx_app_events_created_at
  ON app_events(created_at DESC);

-- Reading progress: per-user plan lookup on MinhaJornada page
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_plan
  ON user_reading_progress(user_id, plan_id);
