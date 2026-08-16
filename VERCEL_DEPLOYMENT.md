# 🚀 Vercel Deployment Guide

This Next.js 14 portfolio is fully optimized for **Vercel** with instant Edge caching, optimized images, zero-latency serverless routes, and persistent storage support.

---

## ⚡ Method 1: Deploy via GitHub (Recommended)

### Step 1: Push Code to GitHub
1. Initialize git if not already done:
   ```bash
   git init
   git add .
   git commit -m "feat: portfolio ready for Vercel deployment"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Link and push your repository:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Import into Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository from the list and click **"Import"**.
4. Vercel will automatically detect **Next.js** framework settings:
   - **Framework Preset**: `Next.js`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables in Vercel
Under the **Environment Variables** section in your Vercel project configuration, add:

| Key | Example Value | Description |
|---|---|---|
| `ADMIN_EMAIL` | `chediland266@gmail.com` | Primary authorized admin email |
| `JWT_SECRET` | `a_long_32_character_random_secret_string` | Secret for cryptographically signing JWT auth tokens |
| `CONTACT_EMAIL` | `ngwadiland68@gmail.com` | Destination inbox for contact submissions |
| `MAIL_CONSOLE_MOCK` | `true` (or `false` with API key) | Set to `true` to test contact form without third-party email API |

*(Optional email provider keys: `MAIL_CONSOLE_API_KEY`, `MAIL_CONSOLE_TEMPLATE_ID`)*

### Step 4: Click "Deploy"
Vercel will build and deploy your site in ~45 seconds. Your site will be live at `https://your-project.vercel.app`.

---

## 💾 Adding Persistent Storage with Vercel KV (Optional)

In serverless environments, local JSON files are read-only. For cloud persistence across `/admin` CMS edits:

1. In your Vercel project dashboard, navigate to the **Storage** tab.
2. Click **"Create Database"** → select **KV (Serverless Redis)**.
3. Choose a region close to your primary audience and click **"Create"**.
4. In the database view, click **"Connect Project"** and choose your portfolio project.
5. Vercel will automatically inject:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`
   - `KV_URL`
6. Redeploy your project. The portfolio API automatically detects Vercel KV and activates persistent multi-region cloud storage!

---

## 💻 Method 2: Deploy via Vercel CLI

If you prefer deploying directly from your terminal:

1. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Log in to Vercel:
   ```bash
   vercel login
   ```
3. Deploy preview:
   ```bash
   vercel
   ```
4. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## 🔑 Admin Console Access

Once deployed:
- Navigate to `https://your-domain.com/admin`
- Enter admin email: `chediland266@gmail.com`
- Enter default access key or your configured secret
- Manage projects, case studies, bio, metrics, and architecture diagrams in real time!
