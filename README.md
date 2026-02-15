# Zync

Zync is a modern, full-stack productivity application designed to help you manage tasks, goals, and projects efficiently. Built with performance and user experience in mind, it features a responsive Kanban board, hierarchical task management, and goal tracking.

## Features

- **Kanban Board**: Visualize your workflow with a fully interactive Kanban board supporting drag-and-drop actions.
- **Task Management**: Create, update, and organize tasks. Break complex tasks down into subtasks for better granularity.
- **Goal Tracking**: Set high-level goals and link them to actionable tasks to measure progress.
- **Responsive Design**: Customized sidebar and layout for a seamless experience across devices.
- **Authentication**: Secure user authentication powered by Firebase.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Vanilla CSS
- **Backend**: Node.js, Express
- **Database & Auth**: Firebase / Firestore

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository.
2. Install dependencies for both client and server:

   ```bash
   npm run install:all
   ```

   Alternatively, you can install them manually:

   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

### Configuration

Ensure you have the necessary environment variables set up.
Check `client/.env.example` for required frontend variables (e.g., Firebase config).

### Running the App

To run both the client and server concurrently in development mode:

```bash
npm run dev
```

- **Client**: http://localhost:5173
- **Server**: http://localhost:3000 (or your configured port)

## Deployment (Vercel + Render + Firebase)

- **Frontend**: Vercel (connect repo, set env vars, deploy)
- **API**: Render (Node/Express web service)
- **Auth & DB**: Firebase (Auth + Firestore)

### Checklist

1. **Vercel** (frontend): Add env vars — `VITE_API_URL` (Render API URL, no trailing slash), and all `VITE_FIREBASE_*` from Firebase Console → Project settings → Your apps.
2. **Firebase**: Authentication → Settings → Authorized domains — add your Vercel domain (e.g. `*.vercel.app` or your custom domain).
3. **Render** (API): Root directory `server`. Build command: `npm install && npm run build` (do **not** use `npx prisma generate` — the API uses Firestore). Env vars: `FRONTEND_URL` = your Vercel app URL (for CORS), `FIREBASE_SERVICE_ACCOUNT` = full service account JSON (single line).
4. **GitHub** (optional): Secrets `VITE_FIREBASE_*`, `VITE_API_URL`, `FIREBASE_SERVICE_ACCOUNT_ZYNC_2018A` for the PR build check and for deploying Firestore indexes on push to `master`.

## Scripts

- **`npm run dev`**: Runs client and server concurrently.
- **`npm run dev:client`**: Runs only the frontend.
- **`npm run dev:server`**: Runs only the backend.
- **`npm run install:all`**: Installs dependencies for both client and server.
