# ProjectFlow — MERN Project Management App

A production-ready, full-stack project management application built with the MERN stack. Features role-based access control, real-time task management, and a modern responsive UI.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Quick Start (Local Dev)](#quick-start-local-dev)
- [Environment Variables](#environment-variables)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [Docker Setup](#docker-setup)
- [Deployment on Render](#deployment-on-render)
- [API Documentation](#api-documentation)
- [Role Permissions](#role-permissions)

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router v6 |
| Backend    | Node.js, Express.js                           |
| Database   | MongoDB Atlas, Mongoose                       |
| Auth       | JWT, bcryptjs                                 |
| Deployment | Docker, Render, nginx                         |

---

## Features

- **Authentication** — JWT-based signup/login with bcrypt password hashing
- **Role-Based Access Control** — Admin and Member roles with granular permissions
- **Project Management** — Create, edit, delete projects; manage team members
- **Task Management** — Full CRUD with statuses (Todo / In Progress / Done), priorities, due dates
- **Overdue Detection** — Automatically flags tasks past their due date
- **Dashboard** — Live stats: total tasks, completed, overdue, tasks by status, activity feed
- **Activity Log** — Tracks create/update events per project
- **Responsive UI** — Works on desktop and mobile
- **Production-Ready** — Rate limiting, security headers, centralized error handling, structured logging

---

## Project Structure

```
project-root/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection, constants
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth, error handler, validate
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Business logic layer
│   │   ├── utils/           # Logger, asyncHandler, jwt, pagination
│   │   └── validations/     # express-validator chains
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios modules per resource
│   │   ├── components/      # common, layout, auth, dashboard, projects, tasks
│   │   ├── constants/       # Shared enums and route paths
│   │   ├── hooks/           # useFetch, useAsync, useProjects, useTasks
│   │   ├── pages/           # Route-level page components
│   │   ├── store/           # AuthContext + useReducer
│   │   └── utils/           # Date helpers, cn, getInitials, etc.
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   └── .env.example
├── docker-compose.yml
├── render.yaml
└── README.md
```

---

## Quick Start (Local Dev)

### Prerequisites

- Node.js >= 18
- npm >= 9
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/projectflow.git
cd projectflow

# Install backend deps
cd backend && npm install

# Install frontend deps
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET

# Frontend
cd ../frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000
```

### 3. Run Dev Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000

---

## Environment Variables

### Backend (`backend/.env`)

| Variable              | Description                           | Required |
|-----------------------|---------------------------------------|----------|
| `NODE_ENV`            | `development` or `production`         | Yes      |
| `PORT`                | Server port (default: 5000)           | No       |
| `MONGO_URI`           | MongoDB Atlas connection string       | Yes      |
| `JWT_SECRET`          | Secret key for JWT signing (32+ chars)| Yes      |
| `JWT_EXPIRES_IN`      | Token expiry (e.g. `7d`)             | No       |
| `CLIENT_URL`          | Frontend origin for CORS              | Yes      |
| `RATE_LIMIT_WINDOW_MS`| Rate limit window in ms               | No       |
| `RATE_LIMIT_MAX`      | Max requests per window               | No       |

### Frontend (`frontend/.env`)

| Variable       | Description              | Required |
|----------------|--------------------------|----------|
| `VITE_API_URL` | Backend API base URL     | No*      |

*If not set, requests proxy through Vite's dev server.

---

## MongoDB Atlas Setup

1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new **free M0** cluster
3. Under **Database Access** → Add a database user with username/password
4. Under **Network Access** → Add `0.0.0.0/0` to allow connections from anywhere (for Render deployment)
5. Click **Connect** → **Connect your application** → copy the connection string
6. Replace `<password>` and `<dbname>` in the string and paste into `MONGO_URI`

---

## Docker Setup

### Development with Docker Compose

```bash
# Copy and fill in backend env
cp backend/.env.example backend/.env

# Start all services (API + Frontend + local MongoDB)
docker-compose up --build
```

Frontend: http://localhost  
API: http://localhost:5000

### Build images individually

```bash
# Backend
docker build -t projectflow-api ./backend

# Frontend
docker build --build-arg VITE_API_URL=http://localhost:5000 -t projectflow-client ./frontend
```

---

## Deployment on Render

### Option A — Automatic via render.yaml (recommended)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Blueprint**
3. Connect your GitHub repo
4. Render will detect `render.yaml` and configure both services automatically
5. Set the `MONGO_URI` secret in the Render dashboard for the `projectflow-api` service
6. Deploy!

### Option B — Manual

**Backend (Web Service)**
- Runtime: **Docker**
- Root Directory: `./backend`
- Port: `5000`
- Environment variables: see table above

**Frontend (Web Service)**
- Runtime: **Docker**
- Root Directory: `./frontend`
- Build Args: `VITE_API_URL=https://your-backend-url.onrender.com`

> **Note:** Render free-tier services spin down after 15 min of inactivity. The first request after sleep may take ~30s.

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected endpoints require:
```
Authorization: Bearer <token>
```

---

### Auth Endpoints

| Method | Endpoint           | Access | Description            |
|--------|--------------------|--------|------------------------|
| POST   | `/auth/signup`     | Public | Register new user      |
| POST   | `/auth/login`      | Public | Login and get token    |
| GET    | `/auth/me`         | Auth   | Get current user       |

**POST /auth/signup**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "admin"
}
```

**POST /auth/login**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response shape (all endpoints)**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "user": { "_id": "...", "name": "Jane Smith", "email": "...", "role": "admin" },
    "token": "eyJ..."
  }
}
```

---

### Projects

| Method | Endpoint                        | Access      | Description              |
|--------|---------------------------------|-------------|--------------------------|
| GET    | `/projects`                     | Auth        | List accessible projects |
| POST   | `/projects`                     | Admin       | Create project           |
| GET    | `/projects/:id`                 | Auth        | Get project details      |
| PUT    | `/projects/:id`                 | Admin owner | Update project           |
| DELETE | `/projects/:id`                 | Admin owner | Delete project           |
| POST   | `/projects/:id/members`         | Admin owner | Add member               |
| DELETE | `/projects/:id/members/:userId` | Admin owner | Remove member            |

---

### Tasks

| Method | Endpoint                   | Access       | Description         |
|--------|----------------------------|--------------|---------------------|
| GET    | `/tasks/my-tasks`          | Auth         | Get my assigned tasks|
| GET    | `/tasks/project/:projectId`| Member+      | Tasks for a project |
| POST   | `/tasks`                   | Admin        | Create task         |
| GET    | `/tasks/:id`               | Member+      | Get task details    |
| PUT    | `/tasks/:id`               | Auth         | Update task*        |
| DELETE | `/tasks/:id`               | Admin        | Delete task         |

> *Members can only update `status`. Admins can update all fields.

**POST /tasks**
```json
{
  "title": "Build login page",
  "description": "Implement JWT auth flow",
  "projectId": "664abc...",
  "assigneeId": "664def...",
  "status": "todo",
  "priority": "high",
  "dueDate": "2025-01-31"
}
```

---

### Dashboard

| Method | Endpoint            | Access | Description        |
|--------|---------------------|--------|--------------------|
| GET    | `/dashboard/stats`  | Auth   | Get dashboard data |

**Response**
```json
{
  "totalTasks": 42,
  "completedTasks": 18,
  "inProgressTasks": 12,
  "todoTasks": 12,
  "overdueTasks": 3,
  "projectCount": 5,
  "tasksByStatus": { "todo": 12, "in_progress": 12, "done": 18 },
  "recentActivity": [...]
}
```

---

### Users

| Method | Endpoint      | Access | Description    |
|--------|---------------|--------|----------------|
| GET    | `/users`      | Auth   | List all users |
| GET    | `/users/:id`  | Auth   | Get user by ID |

---

## Role Permissions

| Action                   | Admin | Member |
|--------------------------|-------|--------|
| Create project           | ✅    | ❌     |
| Edit/Delete project      | ✅*   | ❌     |
| Add/Remove members       | ✅*   | ❌     |
| Create task              | ✅    | ❌     |
| Edit task (all fields)   | ✅    | ❌     |
| Update task status       | ✅    | ✅     |
| Delete task              | ✅    | ❌     |
| View assigned projects   | ✅    | ✅     |
| View dashboard           | ✅    | ✅     |

*Project owner only

---

## License

MIT
