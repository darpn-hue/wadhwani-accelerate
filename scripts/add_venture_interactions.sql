-- Migration: Add venture_interactions table for tracking calls, meetings, and notes
-- This allows Venture Managers and Committee members to log interactions with ventures

-- Create venture_interactions table
CREATE TABLE IF NOT EXISTS venture_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venture_id UUID REFERENCES ventures(id) ON DELETE CASCADE NOT NULL,

    -- Interaction metadata
    interaction_type VARCHAR(50) DEFAULT 'call' CHECK (interaction_type IN ('call', 'meeting', 'email', 'note')),
    title VARCHAR(255),

    -- Content
    transcript TEXT NOT NULL, -- Call transcript or meeting notes

    -- Context
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    interaction_date TIMESTAMP DEFAULT NOW(), -- When the actual call/meeting happened

    -- Metadata
    duration_minutes INTEGER,
    participants TEXT[], -- Array of participant names/emails

    -- Soft delete
    deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_venture_interactions_venture_id ON venture_interactions(venture_id);
CREATE INDEX IF NOT EXISTS idx_venture_interactions_created_at ON venture_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_venture_interactions_type ON venture_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_venture_interactions_deleted ON venture_interactions(deleted_at) WHERE deleted_at IS NULL;

-- Add comments for documentation
COMMENT ON TABLE venture_interactions IS 'Stores all interactions (calls, meetings, notes) between venture managers/committee and ventures';
COMMENT ON COLUMN venture_interactions.interaction_type IS 'Type of interaction: call, meeting, email, or note';
COMMENT ON COLUMN venture_interactions.transcript IS 'Full transcript or notes from the interaction';
COMMENT ON COLUMN venture_interactions.interaction_date IS 'When the actual interaction took place';
COMMENT ON COLUMN venture_interactions.participants IS 'Array of participants in the interaction';
COMMENT ON COLUMN venture_interactions.deleted_at IS 'Soft delete timestamp - NULL means not deleted';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_venture_interactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_venture_interactions_updated_at ON venture_interactions;
CREATE TRIGGER trigger_update_venture_interactions_updated_at
    BEFORE UPDATE ON venture_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_venture_interactions_updated_at();
