# 🎓 Freshers Group Generator

A production-ready, mobile-first web application for college orientation group assignment.

---

## 🏗️ Project Structure

```
Freshers Group Generator/
├── backend/          # Node.js + Express API
└── frontend/         # React + Vite + Tailwind frontend
```

---

## 🚀 Quick Start

### Step 1 — Firebase Setup (Required)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Firestore Database** (start in test mode)
4. Go to **Project Settings → Service Accounts → Generate new private key**
5. Copy the values into `backend/.env`
6. Go to **Project Settings → Your Apps → Add Web App**
7. Copy the config values into `frontend/.env`

### Step 2 — Configure Environment

**Backend** (`backend/.env`):
```env
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=change_this_to_a_random_secret
```

**Frontend** (`frontend/.env`):
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc
```

### Step 3 — Install & Run

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## 🌐 Application URLs

| URL | Description |
|-----|-------------|
| `http://localhost:5173/` | Student Registration Page |
| `http://localhost:5173/success` | Success Page (after registration) |
| `http://localhost:5173/admin/login` | Admin Login |
| `http://localhost:5173/admin/dashboard` | Admin Dashboard |
| `http://localhost:5173/admin/groups` | Group Management |
| `http://localhost:5173/admin/students` | Student Management |
| `http://localhost:5173/admin/settings` | Event Settings + QR Code |

---

## 🔑 Default Admin Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

> Change these in `backend/.env` before deployment!

---

## ✨ Features

### Student Portal
- ✅ Mobile-optimized registration form
- ✅ Department dropdown (no free-text)
- ✅ 10-digit mobile validation
- ✅ Duplicate prevention (same group if registered again)
- ✅ Animated success screen with confetti
- ✅ Large animated group number display
- ✅ Success sound (Web Audio API)

### Admin Panel
- ✅ JWT-secured login
- ✅ Real-time dashboard via Firebase Firestore
- ✅ Live registration counter
- ✅ Progress bar
- ✅ Group management (view all groups + members)
- ✅ Student management (edit, delete, move to group)
- ✅ Manual student addition
- ✅ Search & filter (by name, mobile, department, group)
- ✅ Export CSV + Excel (with per-group sheets)
- ✅ Print all groups / individual group
- ✅ QR Code generator with download
- ✅ Dynamic event settings (no code changes needed)
- ✅ Registration open/close toggle
- ✅ Reset entire event
- ✅ Warning when changing settings with existing registrations

### Group Assignment
- ✅ No hardcoded values — all configured by admin
- ✅ Auto-calculates total groups: ⌈totalStudents ÷ studentsPerGroup⌉
- ✅ Random assignment only from non-full groups
- ✅ Firestore transactions prevent race conditions
- ✅ Last group handles remainder students

### Security
- ✅ JWT authentication for all admin routes
- ✅ Rate limiting (10 registrations/min per IP)
- ✅ Input validation + sanitization
- ✅ Helmet.js security headers
- ✅ CORS configured
- ✅ No client-side group assignment (always server-side)

---

## 🔧 Changing Admin Credentials

Edit `backend/.env`:
```env
ADMIN_USERNAME=your_new_username
ADMIN_PASSWORD=your_secure_password
```
Restart the backend server.

---

## 📱 Mobile QR Code Flow

1. Admin goes to Settings page → copies/downloads QR code
2. Display the QR code on a projector or print it
3. Students scan with their phone → opens registration page
4. Student fills form → receives group number instantly

---

## 🗄️ Firebase Firestore Collections

| Collection | Document | Description |
|-----------|----------|-------------|
| `students` | `{mobile}` | Student records (mobile as document ID) |
| `settings` | `event` | Event configuration |
| `groups` | `counters` | Group fill counters |

---

## 🏭 Production Deployment

**Frontend** → Vercel / Netlify  
**Backend** → Railway / Render / Heroku

Update `FRONTEND_URL` in `backend/.env` to your production frontend URL.
