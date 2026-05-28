-- Habit Tracker Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS habit_tracker;
USE habit_tracker;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Habits table
CREATE TABLE IF NOT EXISTS habits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    color VARCHAR(50),
    icon VARCHAR(50),
    frequency VARCHAR(50) NOT NULL DEFAULT 'daily',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_habits_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Habit Records table
CREATE TABLE IF NOT EXISTS habit_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    habit_id BIGINT NOT NULL,
    date DATE NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE KEY uk_habit_date (habit_id, date),
    INDEX idx_records_habit_date (habit_id, date),
    INDEX idx_records_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
