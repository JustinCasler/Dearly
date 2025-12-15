-- Audio Delivery System Migration
-- Creates tables for listening tokens, transcripts, and transcript segments
-- Adds audio/transcript storage paths to sessions table

-- Create listening_tokens table for secure shareable links
CREATE TABLE listening_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID UNIQUE NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    view_count INTEGER DEFAULT 0
);

-- Create transcripts table to store transcript metadata
CREATE TABLE transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID UNIQUE NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    processing_status TEXT NOT NULL CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transcript_segments table for time-synced transcript chunks
CREATE TABLE transcript_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transcript_id UUID NOT NULL REFERENCES transcripts(id) ON DELETE CASCADE,
    question_id TEXT,
    start_time DECIMAL(10, 2) NOT NULL,
    end_time DECIMAL(10, 2) NOT NULL,
    text TEXT NOT NULL,
    sequence_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add audio and transcript storage paths to sessions table
ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS audio_storage_path TEXT,
    ADD COLUMN IF NOT EXISTS transcript_storage_path TEXT,
    ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending'
        CHECK (processing_status IN ('pending', 'uploading', 'processing', 'ready', 'failed'));

-- Create indexes for performance
CREATE INDEX idx_listening_tokens_session ON listening_tokens(session_id);
CREATE INDEX idx_listening_tokens_token ON listening_tokens(token);
CREATE INDEX idx_transcripts_session ON transcripts(session_id);
CREATE INDEX idx_transcript_segments_transcript ON transcript_segments(transcript_id);
CREATE INDEX idx_transcript_segments_question ON transcript_segments(question_id);
CREATE INDEX idx_sessions_processing_status ON sessions(processing_status);

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for transcripts updated_at
CREATE TRIGGER update_transcripts_updated_at
    BEFORE UPDATE ON transcripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE listening_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listening_tokens
-- Public read access (anyone can view with token)
CREATE POLICY "Anyone can read listening tokens by token"
    ON listening_tokens
    FOR SELECT
    USING (true);

-- Admins and interviewers can insert listening tokens
CREATE POLICY "Admins and interviewers can insert listening tokens"
    ON listening_tokens
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'interviewer')
        )
    );

-- Admins and interviewers can update listening tokens
CREATE POLICY "Admins and interviewers can update listening tokens"
    ON listening_tokens
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'interviewer')
        )
    );

-- RLS Policies for transcripts
-- Users can view their own transcripts
CREATE POLICY "Users can view their own transcripts"
    ON transcripts
    FOR SELECT
    USING (
        session_id IN (SELECT id FROM sessions WHERE user_id = auth.uid())
    );

-- Admins and interviewers can view all transcripts
CREATE POLICY "Admins and interviewers can view all transcripts"
    ON transcripts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'interviewer')
        )
    );

-- Admins and interviewers can manage transcripts
CREATE POLICY "Admins and interviewers can manage transcripts"
    ON transcripts
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'interviewer')
        )
    );

-- RLS Policies for transcript_segments
-- Users can view segments for their own transcripts
CREATE POLICY "Users can view their own segments"
    ON transcript_segments
    FOR SELECT
    USING (
        transcript_id IN (
            SELECT id FROM transcripts WHERE session_id IN (
                SELECT id FROM sessions WHERE user_id = auth.uid()
            )
        )
    );

-- Admins and interviewers can view all segments
CREATE POLICY "Admins and interviewers can view all segments"
    ON transcript_segments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'interviewer')
        )
    );

-- Admins and interviewers can manage segments
CREATE POLICY "Admins and interviewers can manage segments"
    ON transcript_segments
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'interviewer')
        )
    );

-- Storage policies for recordings bucket
-- Note: Storage buckets should be created via Supabase dashboard or CLI
-- The following policies assume 'recordings' and 'transcripts' buckets exist

-- Public read access to recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access to recordings"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'recordings');

CREATE POLICY "Admins and interviewers can upload recordings"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'recordings' AND
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'interviewer')
        )
    );

CREATE POLICY "Admins and interviewers can delete recordings"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'recordings' AND
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'interviewer')
        )
    );

-- Create transcripts bucket (private)
INSERT INTO storage.buckets (id, name, public) VALUES ('transcripts', 'transcripts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated read access to transcripts"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'transcripts' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Admins and interviewers can upload transcripts"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'transcripts' AND
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'interviewer')
        )
    );

CREATE POLICY "Admins and interviewers can delete transcripts"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'transcripts' AND
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'interviewer')
        )
    );
