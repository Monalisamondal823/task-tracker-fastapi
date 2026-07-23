# Task Tracker API

A small backend service built to practice and demonstrate core Python backend skills:
FastAPI, REST APIs, JWT authentication, relational databases via SQLAlchemy, and
cloud deployment. Deploy free to **Render** with file storage on **Backblaze B2**.

## Features

- User registration, login, and session-based JWT authentication (`/auth`)
- Full CRUD on tasks, scoped per logged-in user (`/tasks`)
- React-based real-time task dashboard available at `/dashboard`
- File attachment upload to Backblaze B2, linked to a task
- Works with SQLite locally (zero setup) and PostgreSQL in production —
  just change one environment variable
- `/health` endpoint for load balancer / health checks
- Interactive API docs auto-generated at `/docs` (Swagger UI)

## Tech Stack

| Layer          | Choice                              |
|----------------|--------------------------------------|
| Framework      | FastAPI                              |
| Database       | SQLite (dev) / PostgreSQL (prod) via SQLAlchemy |
| Auth           | JWT (python-jose) + bcrypt password hashing |
| File storage   | Backblaze B2 (S3-compatible API)     |
| Deployment     | Docker container on Render           |

## Project Structure

```
app/
  main.py          # FastAPI app, router registration
  database.py       # SQLAlchemy engine/session (SQLite or Postgres via DATABASE_URL)
  models.py          # User, Task ORM models
  schemas.py          # Pydantic request/response models
  security.py          # password hashing, JWT create/verify
  deps.py                # get_current_user dependency (JWT -> User)
  s3.py                    # S3 upload helper
  routers/
    auth.py                # /auth/register, /auth/login
    tasks.py                # /tasks CRUD + attachment upload
Dockerfile
requirements.txt
.env.example
```

## Run locally

```bash
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

### Run backend

```bash
uvicorn app.main:app --reload
```

### Run the React dashboard

Install frontend dependencies once and build the app:

```bash
cd frontend
npm install
npm run build
```

Then start the backend:

```bash
cd ..
uvicorn app.main:app --reload
```

Open the React dashboard in your browser at:

```bash
http://127.0.0.1:8000/dashboard/
```

For local frontend development with Vite:

```bash
cd frontend
npm run dev
```

Then open the development app at:

```bash
http://localhost:4173
```

The dashboard now uses a modern email/password login flow and stores the JWT in an HttpOnly cookie. The frontend automatically restores the session on reload and protects dashboard, tasks, profile, and settings routes without requiring any manual token entry. If you do not yet have an account, use the sign-up page in the dashboard to create one.

Open http://127.0.0.1:8000/docs for interactive Swagger docs.
### Try it with curl

```bash
# Register
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"yourpassword"}'

# Login (note: form-encoded, not JSON - OAuth2 password flow)
curl -X POST http://127.0.0.1:8000/auth/login \
  -d "username=you@example.com&password=yourpassword"

# Create a task (replace TOKEN with the access_token from login)
curl -X POST http://127.0.0.1:8000/tasks/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Learn FastAPI","description":"Finish the tutorial"}'
```

## Run with Docker

```bash
docker build -t task-tracker-api .
docker run -p 8000:8000 --env-file .env task-tracker-api
```

## Deploying to Render + Backblaze B2 (free, no card required)

### 1. Set up Backblaze B2

1. Sign up for [Backblaze B2](https://www.backblaze.com/b2/cloud-storage.html) (free tier: 10GB storage)
2. Create a bucket for attachments
3. Create an Application Key with permissions for that bucket
4. Note down:
   - `B2_BUCKET_NAME`
   - `B2_APPLICATION_KEY_ID`
   - `B2_APPLICATION_KEY`

### 2. Create Render Web Service

1. Push this repo to GitHub (Render reads from GitHub)
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New** → **Web Service**
4. Select your GitHub repo
5. Fill in the config:
   - **Name**: `task-tracker-api`
   - **Root Directory**: (leave blank)
   - **Runtime**: `Docker`
   - **Plan**: `Free` (optional: $7/month to keep it always running)
6. Under **Environment**, add these variables:
   ```
   SECRET_KEY=<generate a long random string>
   DATABASE_URL=sqlite:///./tasktracker.db
   B2_BUCKET_NAME=<your B2 bucket name>
   B2_APPLICATION_KEY_ID=<your B2 key ID>
   B2_APPLICATION_KEY=<your B2 key>
   B2_ENDPOINT_URL=https://s3.us-west-000.backblazeb2.com
   ```
   (Or use a Render PostgreSQL instance for `DATABASE_URL` if you prefer)
7. Click **Create Web Service**
8. Done! Your API is live at `https://<your-service-name>.onrender.com`

### Alternative: Use render.yaml for one-click deploy

We've included a `render.yaml` file. Just push to GitHub and click **Deploy** on Render
— it auto-configures services and environment variables from the file.

## Notes on scope

This was built as a portfolio/practice project to get hands-on with the stack
above, not a production system — there's no rate limiting, refresh tokens, or
automated test suite yet. Natural next steps: add pytest coverage, a CI/CD
pipeline (GitHub Actions building the Docker image and deploying to EC2), and
refresh-token rotation.
