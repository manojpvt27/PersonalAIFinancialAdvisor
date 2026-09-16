# Personal AI Financial Advisor (FinAI)

A modern, full-stack Personal Financial Management and Advisory platform powered by AI. Manage budgets, track expenses, monitor cash flow, simulate financial scenarios, analyze debt and tax obligations, and receive personalized AI financial advisory recommendations.

---

## Features

- **Executive Financial Dashboard**: Real-time net worth, cash flow trends, financial health scoring, and quick expense ledgers.
- **AI Financial Advisor**: Context-aware AI insights and actionable recommendations powered by Google Gemini / OpenAI.
- **Budgeting & Spending Analysis**: Dynamic category tracking, interactive charts, and threshold alerts.
- **Income & Expense Tracking**: Categorized financial logging with multi-payment-method support.
- **Financial Simulation & Autopilot**: Scenario modeling and automated financial health checks.
- **Debt & Tax Insights**: Debt payoff projections and tax estimations.
- **Responsive & Modern UI**: Built with Next.js App Router, Tailwind CSS, Lucide icons, and Recharts.

---

## Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **ORM & Database**: [Prisma](https://www.prisma.io/) with SQLite (configurable to PostgreSQL/MySQL)
- **Authentication**: JWT authentication with refresh token mechanism & bcrypt password hashing
- **AI Integration**: Google Generative AI (Gemini) / OpenAI API

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Installation
Clone the repository and install dependencies for both frontend and backend:
```bash
# Clone the repository
git clone https://github.com/manojpvt27/PersonalAIFinancialAdvisor.git
cd PersonalAIFinancialAdvisor

# Install dependencies for both backend and frontend
npm run install:all
```

### 2. Environment Configuration

#### Backend
Copy the example environment file and configure your API keys:
```bash
cp backend/.env.example backend/.env
```
In `backend/.env`, configure:
- `GEMINI_API_KEY` (or `OPENAI_API_KEY` depending on chosen `AI_PROVIDER`)
- `JWT_SECRET` and `JWT_REFRESH_SECRET`

#### Frontend
Copy the example environment file:
```bash
cp frontend/.env.example frontend/.env.local
```

### 3. Database Setup
Initialize the database and apply the Prisma schema:
```bash
npm --prefix backend run db:push
npm --prefix backend run db:seed
```

### 4. Running the Development Server
To run both backend and frontend concurrently:
```bash
npm run dev
```

Or run them individually:
- **Backend API**: `npm --prefix backend run dev` (runs on `http://localhost:5000`)
- **Frontend App**: `npm --prefix frontend run dev` (runs on `http://localhost:3000`)

---

## Project Structure

```
Personal-AI-Financial-Advisor/
├── backend/
│   ├── prisma/             # Database schema and seed scripts
│   ├── src/
│   │   ├── config/         # App configuration & environment settings
│   │   ├── middleware/     # Auth and error handling middlewares
│   │   ├── routes/         # Express API route definitions
│   │   ├── services/       # Business logic and AI service integrations
│   │   └── server.ts       # Express app entry point
│   └── tsconfig.json
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── app/            # Next.js App Router pages (dashboard, auth, etc.)
│   │   ├── components/     # Reusable UI & dashboard components
│   │   ├── lib/            # Types, utilities, and API client
│   │   └── store/          # Zustand state stores
│   └── tsconfig.json
├── package.json            # Root scripts for multi-workspace management
└── README.md
```

---

## License
This project is open source and available under the [MIT License](LICENSE).
