# Focusly — Daily Task Tracker

A production-ready full-stack daily task tracker with a premium SaaS UI.

**Tech Stack:** React + Vite + Tailwind CSS · Node.js + Express · MongoDB + Mongoose · JWT (HTTP-only cookies) · Recharts

---

## 📁 Folder Structure

```
focusly/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.js          # Register, login, logout, me, update
│   │   │   ├── tasks.js         # Full CRUD + subtask toggle
│   │   │   ├── timers.js        # Start/stop timer, get active
│   │   │   └── analytics.js     # Dashboard KPIs, weekly, trend, categories, heatmap
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT protect middleware + sendToken
│   │   │   └── error.js         # Global error + 404 handlers
│   │   ├── models/
│   │   │   ├── User.js          # User schema (bcrypt, streakData)
│   │   │   └── Task.js          # Task schema (subtasks, timerLogs, recurring)
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── tasks.js
│   │   │   ├── timers.js
│   │   │   └── analytics.js
│   │   └── server.js            # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── charts/
    │   │   │   └── Charts.jsx   # WeeklyBar, TrendLine, Donut, CategoryBar (Recharts)
    │   │   ├── layout/
    │   │   │   └── AppLayout.jsx  # Sidebar + topbar shell
    │   │   ├── tasks/
    │   │   │   ├── TaskForm.jsx   # Create/edit modal
    │   │   │   ├── TaskItem.jsx   # Row with timer + actions
    │   │   │   └── TaskDetail.jsx # Detail modal with subtasks + timer
    │   │   └── ui/
    │   │       ├── Badges.jsx    # Priority, Status, Category, DueDate
    │   │       ├── KPICard.jsx   # Metric card with skeleton
    │   │       ├── LoadingScreen.jsx
    │   │       ├── Modal.jsx     # Reusable modal
    │   │       └── Skeletons.jsx # Loading placeholders
    │   ├── context/
    │   │   ├── AuthContext.jsx   # User state + session verify
    │   │   ├── ThemeContext.jsx  # Dark/light mode
    │   │   └── TasksContext.jsx  # Tasks state + optimistic updates + cache
    │   ├── hooks/
    │   │   └── useTimer.js       # Per-task timer with start/stop API calls
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── DashboardPage.jsx  # KPIs + today tasks + charts
    │   │   ├── TasksPage.jsx      # Full list with filters
    │   │   ├── KanbanPage.jsx     # 3-column kanban
    │   │   ├── CalendarPage.jsx   # Monthly calendar
    │   │   ├── AnalyticsPage.jsx  # Charts + heatmap
    │   │   └── SettingsPage.jsx   # Profile + theme + password
    │   ├── services/
    │   │   └── api.js            # Axios instance + all API functions
    │   ├── App.jsx               # Routes + providers
    │   ├── main.jsx
    │   └── index.css             # Tailwind + component styles
    ├── index.html
    ├── vite.config.js            # Dev proxy → backend
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & install

```bash
# Backend
cd focusly/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure backend environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/focusly
JWT_SECRET=change-this-to-a-long-random-string-minimum-32-chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Or use MongoDB Atlas (cloud) — just update MONGODB_URI
```

### 4. Run the app

```bash
# Terminal 1 — Backend
cd backend
npm run dev
# ✅ MongoDB connected
# 🚀 Server running on port 5000

# Terminal 2 — Frontend
cd frontend
npm run dev
# ➜  Local: http://localhost:5173
```

Open **http://localhost:5173**, register an account, and start tracking!

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login (sets HTTP-only cookie) |
| POST | /api/auth/logout | Logout (clears cookie) |
| GET | /api/auth/me | Get current user |
| PATCH | /api/auth/me | Update profile |
| PATCH | /api/auth/password | Change password |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | List tasks (filter: status, priority, category, due, search) |
| POST | /api/tasks | Create task |
| GET | /api/tasks/:id | Get single task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| PATCH | /api/tasks/:id/subtask/:subtaskId | Toggle subtask |
| DELETE | /api/tasks/bulk-delete | Bulk delete |

### Timers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/timers/active | Get active timers |
| POST | /api/timers/:taskId/start | Start timer |
| POST | /api/timers/:taskId/stop | Stop timer + log time |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/analytics/dashboard | KPIs (today, streak, focus, rates) |
| GET | /api/analytics/weekly | Last 7 days bar chart data |
| GET | /api/analytics/trend | 30-day completion trend |
| GET | /api/analytics/categories | Task counts by category |
| GET | /api/analytics/heatmap | Activity heatmap (last 365 days) |

---

## 🏗️ Architecture Notes

### Auth Flow
1. User submits login form
2. Backend validates credentials, signs JWT
3. JWT stored in **HTTP-only cookie** (inaccessible to JS)
4. Frontend fetches `/api/auth/me` on mount to restore session
5. Axios interceptor redirects to `/login` on 401

### State Management
- **AuthContext** — user object + login/logout/update
- **ThemeContext** — dark/light + localStorage persistence
- **TasksContext** — tasks array + optimistic updates + localStorage cache

### Offline Cache
- Tasks cached in `localStorage` under `focusly_tasks_cache`
- Stale cache renders instantly while fresh data loads from backend
- Cache invalidated on auth errors or manual clear

### Optimistic Updates
- Task status/progress updates apply instantly to UI
- Backend call made in background
- Reverts to server state if call fails

---

## 🔐 Security
- Passwords hashed with bcrypt (12 rounds)
- JWT in HTTP-only cookies (prevents XSS theft)
- Rate limiting: 200 req/15min global, 20 req/15min on auth routes
- Helmet.js security headers
- CORS restricted to CLIENT_URL
- All task routes scoped to authenticated user (`user: req.user._id`)

---

## 🚢 Production Deployment

```bash
# Frontend build
cd frontend
npm run build
# Output: frontend/dist/

# Backend — set in .env:
NODE_ENV=production
MONGODB_URI=mongodb+srv://...  # Atlas connection string
JWT_SECRET=<64-char random string>
CLIENT_URL=https://yourdomain.com
```

Serve `frontend/dist` via Nginx or a CDN. Run the backend with PM2:
```bash
npm install -g pm2
cd backend
pm2 start src/server.js --name focusly-api
```
