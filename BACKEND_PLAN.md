# Backend Implementation Plan - Zync

## Goal Description

Establish a robust, scalable backend architecture for the "Zync" project within the existing repository. The goal is to separate concerns between frontend and backend, choose a suitable database, and prepare for future deployment.

## User Review Required

> [!IMPORTANT]
> **Action Required**: Please review the **Database Schema** and **API Endpoints** sections below.
>
> **Confirmed Decisions**:
>
> - **Structure**: Moving frontend to `client/` and creating `server/`. This cleanly separates dependencies and is essential for deploying two different apps (static frontend vs node backend) from one repo.
> - **Deployment**: Frontend -> Vercel. Backend -> Render. Database -> Neon (Free Postgres).
> - **Database**: PostgreSQL is chosen over MongoDB for its relational integrity, which is crucial for a task management app (User -> Board -> Column -> Task).

## Proposed Changes

### 1. Project Overview & Tech Stack

- **Architecture**: Monorepo (Client + Server in root)
- **Frontend**: React + Vite (Existing, moves to `/client`)
- **Backend**: Node.js + Express
- **Language**: TypeScript
- **Database**: PostgreSQL (via **Neon** or **Supabase** for free tier)
- **ORM**: Prisma (Best-in-class TypeScript support)
- **Auth**: JWT (Stateless, secure)

### 2. Folder Structure

We will transform the root directory:

```text
/ (root)
├── client/                 # MOVED: Current project goes here
│   ├── src/
│   ├── vite.config.ts
│   └── package.json
├── server/                 # NEW: Backend application
│   ├── src/
│   │   ├── controllers/    # Request logic
│   │   ├── middleware/     # Auth & Validation
│   │   ├── routes/         # API Route definitions
│   │   └── index.ts        # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database Schema
│   ├── package.json
│   └── tsconfig.json
└── package.json            # Root configuration (scripts to run both)
```

### 3. Database Schema (Prisma)

This is the heart of the application.

```prisma
// This is a draft schema
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed
  name      String?
  boards    Board[]
  goals     Goal[]
  checkIns  DailyCheckIn[]
  createdAt DateTime @default(now())
}

model DailyCheckIn {
  id        String   @id @default(uuid())
  date      DateTime @default(now())
  content   String   @db.Text
  mood      String?
  tags      String[]
  isPublic  Boolean  @default(false)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  updatedAt DateTime @updatedAt
}

model Board {
  id        String   @id @default(uuid())
  title     String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  columns   Column[]
  createdAt DateTime @default(now())
}

model Column {
  id        String   @id @default(uuid())
  title     String
  order     Int
  boardId   String
  board     Board    @relation(fields: [boardId], references: [id])
  tasks     Task[]
}

model Goal {
  id          String    @id @default(uuid())
  title       String
  description String?
  category    String    // short-term, long-term, financial, completed
  progress    Int       @default(0)
  dueDate     DateTime?
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  tasks       Task[]
  createdAt   DateTime  @default(now())
}

model Task {
  id          String   @id @default(uuid())
  title       String
  description String?  @db.Text
  priority    String   @default("medium")
  order       Int
  columnId    String
  column      Column   @relation(fields: [columnId], references: [id])
  goalId      String?
  goal        Goal?    @relation(fields: [goalId], references: [id])
  createdAt   DateTime @default(now())
  dueDate     DateTime?
}
```

### 4. API Endpoints Plan

#### Authentication

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token
- `GET /api/auth/me` - Get current user info

#### Daily Check-ins / Blogs

- `GET /api/checkins` - Get all entries for user
- `POST /api/checkins` - Create a new daily entry/blog
- `GET /api/checkins/:id` - Read a specific entry
- `PUT /api/checkins/:id` - Update an entry
- `DELETE /api/checkins/:id` - Delete an entry

#### Goals

- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal (progress, etc.)
- `DELETE /api/goals/:id` - Delete goal

#### Boards

- `GET /api/boards` - Get all boards for user
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get specific board details

#### Columns & Tasks

- `POST /api/columns` - Add column to board
- `POST /api/tasks` - Add task to column
- `PUT /api/tasks/:id` - Move task (drag & drop update), edit content
- `DELETE /api/tasks/:id` - Remove task

### 5. Implementation Steps

#### Phase 1: Restructuring

1.  Create `client` folder.
2.  Move existing frontend files into `client`.
3.  Verification: Ensure `npm run dev` works inside `client`.

#### Phase 2: Server Setup

1.  Initialize `server` folder with `npm init`.
2.  Install `express`, `prisma`, `typescript`, `check-env`.
3.  Set up basic "Hello World" API.

#### Phase 3: Database & Auth

1.  Set up local Postgres or Neon connection string.
2.  Define Schema in `schema.prisma`.
3.  Implement Register/Login with hashing (`bcrypt`) and tokens (`jsonwebtoken`).

#### Phase 4: Feature Implementation

1.  CRUD for Boards.
2.  CRUD for Tasks.
3.  **Frontend Integration**: Replace dummy data calls with `fetch('/api/...')` calls.

## Verification Plan

- **Local**: Run `client` (port 5173) and `server` (port 3000) simultaneously.
- **API Testing**: Use `.http` files or Postman to verify endpoints independent of frontend.
- **End-to-End**: Log in to frontend, create a task, refresh page, ensure task persists.
