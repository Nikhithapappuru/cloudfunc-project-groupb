CREATE TABLE jobs (
    job_id VARCHAR(36) PRIMARY KEY,
    function_name VARCHAR(255) NOT NULL,
    payload TEXT,
    status VARCHAR(20),
    result TEXT,
    error TEXT,
    submitted_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    attempts INT DEFAULT 0
);
