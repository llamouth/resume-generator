CREATE DATABASE resume_generator;

\c resume_generator;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resumes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL, -- Full resume text
    ats_score INT CHECK (ats_score BETWEEN 0 AND 100), -- AI-calculated ATS score
    keywords TEXT, -- Extracted keywords for ATS optimization
    feedback TEXT, -- AI-generated resume improvement suggestions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_descriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    required_skills TEXT, -- Extracted key skills for AI comparison
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE evaluations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    resume_id INT REFERENCES resumes(id) ON DELETE CASCADE,
    job_description_id INT REFERENCES job_descriptions(id) ON DELETE CASCADE,
    match_score INT CHECK (match_score BETWEEN 0 AND 100), -- AI-determined resume-job fit
    strengths TEXT, -- AI-detected strong points in the resume
    weaknesses TEXT, -- AI-detected weak areas
    suggested_improvements TEXT, -- AI-generated recommendations\
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cover_letters (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    job_description_id INT REFERENCES job_descriptions(id) ON DELETE CASCADE,
    content TEXT NOT NULL, -- AI-generated cover letter
    ai_explanation TEXT, -- AI justification for the generated cover letter
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
