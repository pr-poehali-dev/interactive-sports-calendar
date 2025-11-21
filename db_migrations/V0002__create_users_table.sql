-- Create table for users (registered accounts)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('individual', 'legal')),
    approved BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Fields for individual users
    birth_date DATE,
    passport_series VARCHAR(10),
    passport_number VARCHAR(10),
    passport_issue_date DATE,
    passport_issued_by TEXT,
    
    -- Fields for legal entities
    inn VARCHAR(20),
    company_name VARCHAR(255),
    legal_address TEXT
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_approved ON users(approved);
CREATE INDEX idx_users_submitted_at ON users(submitted_at DESC);