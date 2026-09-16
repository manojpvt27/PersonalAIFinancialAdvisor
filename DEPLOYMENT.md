# Deploying Personal AI Financial Advisor on Vercel

This repository is configured for effortless deployment of both the **Next.js Frontend** and the **Express.js Backend** on Vercel.

---

## Architecture Overview

Vercel is optimized for monorepos by linking two projects from the same GitHub repository:
1. **Backend Project**: Express serverless API running on Node.js runtime (`Root Directory: backend`)
2. **Frontend Project**: Next.js App Router application (`Root Directory: frontend`)

---

## Step 1: Deploy the Backend on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and log in with GitHub.
2. Select your repository: **`PersonalAIFinancialAdvisor`**.
3. Under **Project Name**, enter: `finai-backend` (or your preferred name).
4. Click **Edit** next to **Root Directory** and select:
   ```
   backend
   ```
5. In **Build and Output Settings**:
   - Framework Preset: **Other** (detected automatically via `vercel.json`)
   - Build Command: `npm run vercel-build` (or leave default)
6. Expand **Environment Variables** and add:
   | Variable | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Environment mode |
   | `PORT` | `5000` | Port default |
   | `JWT_SECRET` | *(Generate a random 32+ char string)* | Token signing |
   | `JWT_REFRESH_SECRET` | *(Generate another random string)* | Refresh token signing |
   | `AI_PROVIDER` | `gemini` (or `openai`) | AI Provider |
   | `GEMINI_API_KEY` | *(Your Gemini API Key)* | AI Key |
   | `DATABASE_URL` | `file:/tmp/dev.db` (or Neon/Supabase Postgres) | Database Connection |
   | `FRONTEND_URL` | `*` (or your frontend vercel domain) | Allowed CORS domain |
7. Click **Deploy**.
8. Once deployment finishes, copy your backend deployment URL:
   > Example: `https://finai-backend.vercel.app`

---

## Step 2: Deploy the Frontend on Vercel

1. Go back to [vercel.com/new](https://vercel.com/new).
2. Select the same repository again: **`PersonalAIFinancialAdvisor`**.
3. Under **Project Name**, enter: `finai-frontend` (or `personal-ai-financial-advisor`).
4. Click **Edit** next to **Root Directory** and select:
   ```
   frontend
   ```
5. In **Build and Output Settings**:
   - Framework Preset: **Next.js** (detected automatically)
   - Build Command: `npm run build`
6. Expand **Environment Variables** and add:
   | Variable | Value | Description |
   |---|---|---|
   | `NEXT_PUBLIC_API_URL` | `https://finai-backend.vercel.app/api` | Your backend API URL from Step 1 |
   | `BACKEND_API_URL` | `https://finai-backend.vercel.app` | Proxy fallback for next rewrites |
7. Click **Deploy**.
8. Your frontend is now live!

---

## Alternative: Deploy via Vercel CLI

If you prefer terminal deployment:

```bash
# 1. Login to Vercel
npx vercel login

# 2. Deploy Backend
cd backend
npx vercel --prod

# 3. Deploy Frontend
cd ../frontend
npx vercel --prod
```
