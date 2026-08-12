-- Enables trigram matching so an ILIKE '%term%' search (see resolveExploreWhere
-- in lib/explore.ts) can use an index instead of a sequential scan on "Comic".
-- Used by both /app/explore and /app/category/[type].
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "Comic_title_trgm_idx" ON "Comic" USING GIN ("title" gin_trgm_ops);