# 🏎️ FL-Predictor: Formula 1 Race Prediction Platform

A full-stack web application for predicting Formula 1 race outcomes and competing in a prediction league. Users submit predictions for qualifying and race results, earn points based on accuracy, and compete on a global leaderboard.

![Tech Stack](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.123-009688?style=for-the-badge&logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)

## ✨ Features

- 🎯 **Race Predictions**: Submit predictions for qualifying (P1-P3) and race results (P1-P3)
- 📊 **Live Standings**: Real-time leaderboard with recent form tracking
- 🏆 **Scoring System**: Points for accurate predictions with special bonuses
  - Hat Trick bonus: Correctly predict pole position + race winner
  - Podium Trio bonus: Get all 3 podium finishers correct
- 🔒 **Authentication**: Secure user authentication via Supabase Auth
- 📱 **Responsive Design**: Modern racing-themed UI with animations
- 🌐 **Live F1 Data**: Integration with Jolpica F1 API for real race results

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (React 19)
- **TypeScript**
- **TailwindCSS v4**
- **Supabase SSR** (Authentication)

### Backend
- **FastAPI** (Python)
- **Supabase** (PostgreSQL + Auth + Real-time)
- **Uvicorn** (ASGI server)

### External APIs
- **Jolpica F1 API** (Live race data)

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Supabase** account ([Sign up for free](https://supabase.com))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd fl-predictor
```

### 2. Set Up Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and add your Supabase credentials
```

### 3. Set Up Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local and add your Supabase credentials
```

### 4. Set Up Supabase Database

1. Create a new Supabase project at [app.supabase.com](https://app.supabase.com)
2. Run the database schema (see [Database Schema](#database-schema) section)
3. Copy your project URL and keys to the `.env` files

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

## 🗄️ Database Schema

Your Supabase database needs these tables:

### `profiles`
- `id` (uuid, primary key) - User ID from auth.users
- `username` (text)
- `total_score` (integer)
- `created_at` (timestamp)

### `races`
- `id` (serial, primary key)
- `name` (text) - e.g., "Monaco Grand Prix"
- `circuit` (text) - e.g., "Circuit de Monaco"
- `race_time` (timestamptz)
- `is_sprint` (boolean)

### `predictions`
- `id` (serial, primary key)
- `user_id` (uuid, foreign key to profiles)
- `race_id` (integer, foreign key to races)
- `quali_p1_driver` (text)
- `quali_p2_driver` (text)
- `quali_p3_driver` (text)
- `race_p1_driver` (text)
- `race_p2_driver` (text)
- `race_p3_driver` (text)
- `wild_prediction` (text)
- `biggest_flop` (text)
- `biggest_surprise` (text)
- `points_total` (integer)
- `manual_score` (integer)
- `created_at` (timestamp)
- Unique constraint on (`user_id`, `race_id`)

## 📊 Scoring System

- **Qualifying**: P1 = 5pts, P2 = 3pts, P3 = 1pt
- **Race**: P1 = 10pts, P2 = 8pts, P3 = 6pts
- **Hat Trick Bonus**: +2pts (correct pole + win by same driver)
- **Podium Trio (Exact Order)**: +5pts (all 3 podium positions correct)
- **Podium Trio (Any Order)**: +2pts (all 3 drivers on podium)
- **Manual Grading**: Admin can award bonus points for wild predictions

## 🎨 Environment Variables

### Backend (`.env`)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
```

### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📁 Project Structure

```
fl-predictor/
├── backend/                 # FastAPI backend
│   ├── main.py             # API routes
│   ├── scoring.py          # Points calculation logic
│   ├── migrate_data.py     # Data migration script
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Backend config (not in git)
│
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   │   ├── page.tsx       # Home page
│   │   ├── predict/       # Prediction submission
│   │   ├── standings/     # Leaderboard
│   │   ├── results/       # Championship results
│   │   └── admin/         # Admin panel
│   ├── middleware.ts      # Route protection
│   └── .env.local         # Frontend config (not in git)
│
└── README.md              # You are here!
```

## 🚢 Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy ✨

### Backend (Render/Railway)
1. Create new Web Service
2. Connect your repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy ✨

## 🛣️ API Endpoints

### Public
- `GET /` - Health check
- `GET /races` - List all races
- `GET /races/{id}` - Get race details
- `GET /standings` - Get leaderboard

### Protected (Requires Auth)
- `POST /predict` - Submit prediction
- `GET /admin/predictions/{race_id}` - Get all predictions for race (admin)
- `POST /admin/grade` - Manually grade prediction (admin)
- `POST /admin/settle` - Calculate points for settled race (admin)

## 🧪 Data Migration

To import historical predictions from CSV:

```bash
cd backend
python migrate_data.py
```

Ensure your CSV file matches the format expected in `migrate_data.py`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🏁 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Built with ❤️ for F1 fans by F1 fans
