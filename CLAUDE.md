# FinAI - Personal AI Financial Advisor

Guidelines and command references for building, running, and managing the project.

## Project Structure
- `backend/`: Express.js API server (Node, TypeScript, SQLite, Prisma)
- `frontend/`: Next.js React application (TypeScript, Tailwind CSS v4, Zustand, Recharts)

## Running the Application
To run the entire suite concurrently from the root directory:
```bash
npm run dev
```

To run individual parts manually:
- **Backend Only**: `npm --prefix backend run dev` (starts on port 5000)
- **Frontend Only**: `npm --prefix frontend run dev` (starts on port 3000)

## Installation & Setup
To install dependencies for all workspaces at once:
```bash
npm run install:all
```

To reset/seed databases or Prisma schemas:
- **Database Push**: `npm --prefix backend run db:push`
- **Database Seed**: `npm --prefix backend run db:seed`
