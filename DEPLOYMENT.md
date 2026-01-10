# 🚀 FL-Predictor Deployment Guide

## Quick Deploy Options

### Option 1: Vercel + Render (Recommended - Easiest)

#### Frontend on Vercel
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
   ```
7. Click "Deploy"

#### Backend on Render
1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: fl-predictor-backend
   - **Root Directory**: `backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add Environment Variables:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_service_role_key
   ```
6. Click "Create Web Service"
7. Copy the deployed URL (e.g., `https://fl-predictor-backend.onrender.com`)
8. Go back to Vercel and update `NEXT_PUBLIC_API_URL` with this URL

---

### Option 2: Railway (Full Stack - Single Platform)

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"

#### Deploy Backend:
3. Select your repository
4. Click "Add variables":
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_service_role_key
   ```
5. In Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Deploy and copy the generated URL

#### Deploy Frontend:
7. Click "New Service" → "GitHub Repo"
8. Select the same repository
9. Add variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   ```
10. In Settings:
    - **Root Directory**: `frontend`
    - **Build Command**: `npm install && npm run build`
    - **Start Command**: `npm start`

---

### Option 3: Docker Compose (Self-Hosted)

#### Prerequisites:
- Docker and Docker Compose installed
- Server with public IP or domain

#### Steps:
1. Clone repository on your server:
   ```bash
   git clone <your-repo-url>
   cd fl-predictor
   ```

2. Create `.env` files from examples:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   ```

3. Edit environment variables:
   ```bash
   nano backend/.env
   nano frontend/.env.local
   ```

4. Build and run:
   ```bash
   docker-compose up -d
   ```

5. Access:
   - Frontend: `http://your-server-ip:3000`
   - Backend: `http://your-server-ip:8000`

6. Set up reverse proxy (Nginx) for HTTPS:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
       }
   }
   
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
       }
   }
   ```

---

## Database Setup (All Options)

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to SQL Editor
3. Run the contents of `database_schema.sql`
4. Get your credentials:
   - Go to Settings → API
   - Copy `URL` and `anon/public` key (for frontend)
   - Copy `service_role` key (for backend - keep secret!)

---

## Environment Variables Reference

### Backend (`.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | Service role key (secret!) | `eyJxxx...` |

### Frontend (`.env.local`)
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | `eyJxxx...` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.yourdomain.com` |

---

## Post-Deployment Checklist

- [ ] Database schema created in Supabase
- [ ] Frontend loads without errors
- [ ] Can create an account and log in
- [ ] Can submit a prediction
- [ ] Predictions appear in submissions page
- [ ] Standings page shows users
- [ ] Admin endpoints work (if applicable)
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Custom domain configured (optional)
- [ ] SSL/HTTPS enabled

---

## Troubleshooting

### Frontend can't connect to backend
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify CORS settings in `backend/main.py`
- Check backend is running and accessible

### Database connection errors
- Verify Supabase credentials
- Check RLS policies are not blocking access
- Ensure `handle_new_user()` trigger is created

### Authentication issues
- Confirm Supabase URL matches in both frontend and middleware
- Check cookies are enabled in browser
- Verify anon key is correct

### Build failures
- Run `npm install` / `pip install -r requirements.txt` locally first
- Check Node.js version (18+) and Python version (3.10+)
- Review build logs for specific errors

---

## Scaling Considerations

- **Frontend**: Vercel auto-scales
- **Backend**: Use Railway auto-scaling or add more instances on Render
- **Database**: Supabase handles scaling, upgrade plan as needed
- **Caching**: Add Redis for session storage and API caching
- **CDN**: Vercel provides this automatically

---

## Monitoring

- **Frontend**: Vercel Analytics (built-in)
- **Backend**: Railway/Render logs
- **Database**: Supabase Dashboard
- **Errors**: Consider Sentry for production error tracking

---

**Need help?** Open an issue on GitHub or check the main README.md

Happy Racing! 🏎️💨
