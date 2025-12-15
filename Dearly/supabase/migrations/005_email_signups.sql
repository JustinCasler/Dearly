-- Email signups table for marketing newsletter
CREATE TABLE email_signups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    source TEXT DEFAULT 'landing_page',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email lookups
CREATE INDEX idx_email_signups_email ON email_signups(email);
CREATE INDEX idx_email_signups_created_at ON email_signups(created_at);

-- Enable RLS
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;

-- Admin-only access for reading email signups
CREATE POLICY "Admins can view all email signups" ON email_signups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Allow anonymous inserts (for public signup form)
CREATE POLICY "Anyone can insert email signups" ON email_signups
    FOR INSERT WITH CHECK (true);
