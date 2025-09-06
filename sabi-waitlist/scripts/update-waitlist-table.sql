-- Update waitlist table to include payment information
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);
ALTER TABLE waitlist ADD COLUMN IF NOT EXISTS amount_paid INTEGER;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_waitlist_payment_status ON waitlist(payment_status);
CREATE INDEX IF NOT EXISTS idx_waitlist_stripe_session ON waitlist(stripe_session_id);

-- Insert sample paid waitlist entries
INSERT INTO waitlist (email, payment_status, amount_paid, created_at) VALUES
('john@example.com', 'paid', 1000, NOW()),
('sarah@example.com', 'paid', 1000, NOW()),
('mike@example.com', 'paid', 1000, NOW())
ON CONFLICT (email) DO NOTHING;
