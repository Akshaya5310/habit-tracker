# Habit Tracker Application

A modern full-stack Habit Tracker with a spreadsheet-style dashboard for tracking daily habits.

## Tech Stack
- **Backend:** Java 21, Spring Boot 3, Spring Security + JWT, Hibernate/JPA, MySQL
- **Frontend:** React 18, Tailwind CSS, Recharts
- **Build:** Maven, npm/Vite
- **Database:** MySQL 8

## Project Structure
```
habit-tracker/
├── backend/          # Spring Boot application
├── frontend/         # React application
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites
- Java 21
- Node.js 18+
- MySQL 8
- Maven 3.9+

### Backend Setup
```bash
cd backend
# Update application.properties with your MySQL credentials
mvn clean install
mvn spring-boot:run
```
Backend runs on http://localhost:8080

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173

### Docker Setup
```bash
docker-compose up --build
```

## Features
- Spreadsheet-style habit tracking dashboard
- Weekly grouping with daily checkboxes
- Progress percentages and analytics
- JWT authentication
- Dark/Light mode
- Responsive design
- Habit streak tracking
- Monthly analytics with charts

## API Endpoints
- POST /api/auth/register
- POST /api/auth/login
- GET /api/habits
- POST /api/habits
- PUT /api/habits/{id}
- DELETE /api/habits/{id}
- POST /api/habits/{id}/toggle
- GET /api/habits/monthly?month=3&year=2025
- GET /api/habits/statistics?month=3&year=2025
