CREATE DATABASE resume_generator;

\c resume_generator;

CREATE TABLE resumes(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    linkedin TEXT,
    github TEXT,
    objective TEXT,
    education TEXT,
    experience TEXT,
    skills TEXT
);
