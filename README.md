# Task Tracker API

A production-ready full-stack Task Tracker application built with **FastAPI**, **React**, **PostgreSQL/SQLite**, **JWT Authentication**, **Docker**, and **Backblaze B2** cloud storage.

This project demonstrates secure authentication, RESTful API development, CRUD operations, cloud file storage, and containerized deployment.

---

## Features

- Secure user registration and login
- JWT authentication using HttpOnly cookies
- Protected routes with automatic session management
- Full CRUD operations for task management
- User-specific task isolation
- React dashboard with automatic login and session restoration
- File upload support using Backblaze B2 (S3-compatible)
- SQLite for local development and PostgreSQL for production
- Dockerized deployment
- Interactive Swagger API documentation
- Health check endpoint (`/health`)

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Backend | FastAPI, Python |
| Frontend | React, Vite, Tailwind CSS |
| Database | SQLite, PostgreSQL |
| ORM | SQLAlchemy |
| Authentication | JWT, bcrypt |
| Cloud Storage | Backblaze B2 (S3-Compatible) |
| Deployment | Docker, Render |
| API Documentation | Swagger UI |

---

## Project Structure

```text
app/
├── main.py
├── database.py
├── models.py
├── schemas.py
├── security.py
├── deps.py
├── s3.py
└── routers/
    ├── auth.py
    └── tasks.py

frontend/
Dockerfile
requirements.txt
.env.example
```

---

## Local Setup

### Clone the repository

```bash
git clone https://github.com/<your-username>/task-tracker-fastapi.git
cd task-tracker-fastapi
```

### Create a virtual environment

```bash
python -m venv venv
```

### Activate the environment

Windows

```bash
venv\Scripts\activate
```

Linux/macOS

```bash
source venv/bin/activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Start the backend

```bash
uvicorn app.main:app --reload
```

Backend:

```
http://127.0.0.1:8000
```

Swagger Docs:

```
http://127.0.0.1:8000/docs
```

Dashboard:

```
http://127.0.0.1:8000/dashboard/
```

---

## Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Development URL:

```
http://localhost:5173
```

---

## Run with Docker

Build:

```bash
docker build -t task-tracker-api .
```

Run:

```bash
docker run -p 8000:8000 --env-file .env task-tracker-api
```

---

## Environment Variables

Create a `.env` file.

```env
SECRET_KEY=your_secret_key

DATABASE_URL=sqlite:///./tasktracker.db

B2_BUCKET_NAME=your_bucket_name
B2_APPLICATION_KEY_ID=your_key_id
B2_APPLICATION_KEY=your_application_key
B2_ENDPOINT_URL=https://s3.us-east-005.backblazeb2.com
```

---

## Deployment

The application can be deployed using:

- Render
- Docker
- Backblaze B2
- PostgreSQL

---

## API Endpoints

### Authentication

- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/logout`
- GET `/auth/me`

### Tasks

- GET `/tasks`
- POST `/tasks`
- PUT `/tasks/{id}`
- DELETE `/tasks/{id}`

### System

- GET `/health`

---

## Future Improvements

- Refresh Token Authentication
- Role-Based Access Control (RBAC)
- Email Verification
- Password Reset
- GitHub Actions CI/CD
- AWS EC2 Deployment
- AWS S3 Integration
- AWS RDS Deployment
- Unit & Integration Testing

---

## Author

**Monalisa Mondal**

B.Sc. Data Science Student

Python Backend Developer | FastAPI | React | PostgreSQL | Docker | REST APIs
