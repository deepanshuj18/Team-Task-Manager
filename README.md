# Team Task Manager

Team Task Manager is a production-ready full-stack web application for project delivery, team coordination, task assignment, and progress tracking. It includes JWT authentication, role-based access control, a PostgreSQL database with Prisma ORM, and a responsive React frontend designed for deployment on Railway.

## Features

- JWT authentication with signup, login, logout, and protected routes
- Role-based access control for `Admin` and `Member`
- Project creation, editing, deletion, and ownership tracking
- Team membership management per project
- Task creation, assignment, editing, deletion, status updates, priorities, due dates, and overdue indicators
- Dashboard metrics for projects, tasks, overdue items, due soon items, assigned work, and recent activity
- Seed script with demo users, projects, and tasks
- Monorepo structure ready for Railway deployment

## Tech Stack

- Frontend: React, Vite, TypeScript, React Router, Axios
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL, Prisma ORM
- Authentication: JWT, bcryptjs
- Deployment target: Railway

## Folder Structure

```text
team-task-manager/
+- client/
|  +- .env.example
|  +- index.html
|  +- package.json
|  +- tsconfig.json
|  +- tsconfig.node.json
|  +- vite.config.ts
|  \- src/
|     +- api/
|     +- components/
|     +- context/
|     +- hooks/
|     +- pages/
|     +- styles/
|     +- types/
|     +- App.tsx
|     \- main.tsx
+- server/
|  +- .env.example
|  +- package.json
|  +- tsconfig.json
|  +- prisma/
|  |  +- migrations/
|  |  +- schema.prisma
|  |  \- seed.ts
|  \- src/
|     +- config/
|     +- constants/
|     +- controllers/
|     +- middleware/
|     +- routes/
|     +- services/
|     +- types/
|     +- utils/
|     +- validations/
|     +- app.ts
|     \- index.ts
+- package.json
\- README.md
```

## Core Roles

### Admin

- Create, update, and delete projects
- Add and remove project members
- Create, assign, update, and delete tasks
- View all dashboard metrics
- Update any task status

### Member

- View only projects they belong to
- View tasks inside their allowed projects
- Update the status of tasks assigned to them
- Access only permitted project and task data

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

On Windows PowerShell:

```powershell
Copy-Item server/.env.example server/.env
Copy-Item client/.env.example client/.env
```

### 3. Run Prisma migrations

```bash
npm --workspace server run prisma:migrate
```

### 4. Seed demo data

```bash
npm run seed
```

### 5. Start both apps

In separate terminals:

```bash
npm run dev:server
npm run dev:client
```

Backend runs on `http://localhost:4000` and frontend runs on `http://localhost:5173`.

## Seed Accounts

- Admin: `admin@teamtaskmanager.dev` / `Admin123!`
- Member: `member@teamtaskmanager.dev` / `Member123!`

## Environment Variables

### Server

- `PORT`: API port, default `4000`
- `NODE_ENV`: `development`, `test`, or `production`
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: long secret with at least 32 characters
- `JWT_EXPIRES_IN`: JWT lifetime, default `7d`
- `CLIENT_URL`: allowed frontend origin or comma-separated origins
- `BCRYPT_SALT_ROUNDS`: bcrypt cost, default `10`
- `SEED_ADMIN_EMAIL`: seeded admin email
- `SEED_ADMIN_PASSWORD`: seeded admin password
- `SEED_MEMBER_EMAIL`: seeded member email
- `SEED_MEMBER_PASSWORD`: seeded member password

### Client

- `VITE_API_URL`: API base URL for development, for example `http://localhost:4000/api`

## Railway Deployment

### Backend service

1. Create a Railway PostgreSQL database.
2. Deploy the repository from the project root.
3. Set the backend environment variables from `server/.env.example`.
4. Set `CLIENT_URL` to the frontend production URL.
5. Use this build command:

```bash
npm install && npm run build
```

6. Use this start command:

```bash
npm start
```

7. Run Prisma migrations after deployment:

```bash
npm --workspace server run prisma:deploy
```

### Frontend hosting options

- Option 1: Let the Express server serve the built React app in production.
- Option 2: Deploy `client/dist` separately on Railway static hosting or another static host.

If deploying separately, set `VITE_API_URL` to the deployed backend URL ending in `/api`.

## API Areas

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `DELETE /api/projects/:projectId`
- `POST /api/projects/:projectId/members`
- `DELETE /api/projects/:projectId/members/:userId`
- `POST /api/projects/:projectId/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId`
- `PATCH /api/tasks/:taskId/status`
- `DELETE /api/tasks/:taskId`
- `GET /api/dashboard/summary`
- `GET /api/users`

## Production Notes

- In production the backend serves the compiled React application from `client/dist`.
- All API routes are mounted under `/api`.
- CORS is restricted by `CLIENT_URL`.
- Prisma migrations and seed support are included in the server workspace.
