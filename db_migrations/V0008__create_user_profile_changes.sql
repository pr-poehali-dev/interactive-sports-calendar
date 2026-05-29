CREATE TABLE t_p20079682_interactive_sports_c.user_profile_changes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p20079682_interactive_sports_c.users(id),
    name VARCHAR(255),
    phone VARCHAR(50),
    birth_date DATE,
    passport_series VARCHAR(10),
    passport_number VARCHAR(10),
    passport_issue_date DATE,
    passport_issued_by TEXT,
    inn VARCHAR(20),
    company_name VARCHAR(255),
    legal_address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by VARCHAR(255)
);