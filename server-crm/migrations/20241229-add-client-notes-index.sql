-- Migration: Add index on clients.notes for better search performance
-- Date: 2024-12-29
-- Description: Creates a GIN index on notes column for full-text search capabilities

-- Add GIN index for full-text search on notes (if using PostgreSQL full-text search)
-- This index will improve performance when searching in client notes
CREATE INDEX IF NOT EXISTS idx_clients_notes_gin ON clients USING gin(to_tsvector('english', COALESCE(notes, '')));

-- Alternative: Simple index if full-text search is not needed
-- CREATE INDEX IF NOT EXISTS idx_clients_notes ON clients(notes) WHERE notes IS NOT NULL;

-- Add comment
COMMENT ON INDEX idx_clients_notes_gin IS 'GIN index for full-text search on client notes';

