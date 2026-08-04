<div align="center">

# 🎯 PrepEdge
### *Interview Preparation Tracker with Weakness Detection*

<br/>

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Redis](https://img.shields.io/badge/Redis-Session_Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

<br/>

**PrepEdge** is a full-stack interview preparation platform that helps candidates track their progress across interview cycles, take timed mock/topic assessments, and surface weak topics through confidence-vs-accuracy analytics. A Gemini-powered AI coach answers interview questions personalized to each user's live performance, and a dedicated admin panel manages the question bank, tests, and users.

<br/>

[Features](#-features) · [Project Status](#-project-status) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Environment Variables](#-environment-variables) · [API Reference](#-api-reference) · [Team](#-team)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication & Security
- Email + OTP verification flow (Brevo transactional email)
- Google OAuth 2.0 & GitHub OAuth 2.0 login
- Stateless JWT auth with Redis-backed token blacklisting (logout)
- Password reset via email OTP
- Per-user IDOR-protected endpoints (`/api/users/{id}` enforces self-access)
- Isolated admin authentication (`ROLE_ADMIN`, separate login/token space from users)

</td>
<td width="50%">

### 📋 Onboarding & Interview Tracking
- 4-step onboarding wizard (target company, experience, focus topics, interview date)
- Track multiple interview cycles at once, each with its own countdown
- Close out an interview with a result: Selected / Not Selected / Archived
- Interview history timeline with per-interview mock-test drill-down

</td>
</tr>
<tr>
<td width="50%">

### 🧪 Mock Tests & Practice
- Full mock assessments and configurable topic-based practice sessions
- Real-time countdown timer with question navigator, flag/skip support
- Server-side grading — correct answers are never sent to the client
- Per-question confidence rating, calibrated against actual correctness
- In-progress attempts cached client-side so a refresh doesn't lose answers

</td>
<td width="50%">

### 📊 Analytics & Weakness Detection
- Weakness radar chart across all topic categories
- Confidence vs. accuracy trend charts and per-category breakdowns
- Activity heatmap calendar on the profile page
- "Danger Zone" alerts for topics with high confidence but low accuracy (blind spots)
- Confidence Explorer — drill into any topic's question-level history

</td>
</tr>
<tr>
<td width="50%">

### 🔔 Notifications, AI Coach & Resources
- In-app notification bell with unread count and mark-as-read
- **AI Interview Coach** (Gemini) — a floating chatbot that reads your stats, strong/weak topics, and target role to give personalized prep guidance & mock-answer reviews
- Notes, cheat sheets, and coding-problem reference pages (Markdown-rendered)
- Interview experiences shared across users
- Public "Contact Us" form routed to the team inbox

</td>
<td width="50%">

### 🛠️ Admin Panel
- Dashboard, user management, and ban/unban with an audit-friendly banned-users view
- Question bank: search/filter/paginate, create, bulk-create, edit, delete
- Category / topic / technique / company metadata management
- Mock test builder and per-test result review
- Platform analytics overview, user reports, and weakness-analysis views

</td>
</tr>
</table>

---

## 📌 Project Status

The project is under active development (**~90% complete**). Core auth, onboarding, mock testing, grading, confidence scoring, interview tracking, the Gemini AI coach, and the full admin panel are built and wired end-to-end against the real backend. Remaining gaps:

- **Automated test coverage** is minimal — only the default Spring Boot context-load smoke test exists; no frontend test suite yet.
- Some admin routes (`/admin/users/:userId`, `/admin/questions/edit/:id`) are intentionally stubbed with a "Coming Soon" placeholder pending detail-view designs.
- The **AI coach** answers based on each user's current dashboard statistics; a deeper, per-question recommendation engine (suggesting exactly which questions to practice next) is not yet built.

---

## 🛠 Tech Stack

### Frontend (`client/`)
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.5 | UI framework |
| Vite | 8.0.9 | Build tool & dev server |
| Tailwind CSS | 4.3.0 | Utility-first styling |
| React Router DOM | 7.15.1 | Client-side routing, lazy-loaded pages |
| Recharts | 3.8.1 | Data visualization (radar, line, bar, pie) |
| Framer Motion | 12.43.0 | Animations & transitions |
| React Markdown + remark-gfm | 10.1.0 / 4.0.1 | Rendering notes/cheat-sheet content |
| @react-oauth/google | 0.13.5 | Google OAuth integration |
| Lucide React | 1.16.0 | Icon library |
| ESLint | 9.39.4 | Linting |

### Backend (`server/`)
| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.3.5 | REST API framework |
| Java | 21 | Runtime |
| Spring Security | — | Route-level access control, CORS, BCrypt |
| Spring Data JPA / Hibernate | — | ORM / database layer |
| jjwt | 0.11.5 | JWT generation & validation |
| PostgreSQL (Supabase) | — | Primary database |
| Spring Data Redis | — | JWT blacklist on logout |
| Brevo API | — | Transactional email (OTP, notifications) |
| Google API Client | 2.6.0 | Google OAuth token verification |
| Google Gemini AI | — | Generative AI coach (WebClient) |
| Spring WebFlux | — | Reactive WebClient for Gemini API |
| Project Lombok | 1.18.46 | Boilerplate reduction |
| Maven | — | Build tool (via `mvnw` wrapper) |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     CLIENT (React 19 + Vite)                     │
│   Landing → Auth → Onboarding → Dashboard → Mock Test → Results  │
│                    Admin Panel (separate layout & auth)          │
└────────────────────────────┬──────────────────────────────────────┘
                              │  REST API  (JWT Bearer Token)
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                SERVER (Spring Boot 3.3 / Java 21)                │
│                                                                    │
│  Auth · Users · Interviews · Tests · Questions · Notifications    │
│  Admin (Auth · Users · Questions · Tests · Analytics · Metadata)  │
│                                                                    │
│  ┌──────────────┐  ┌────────────┐  ┌───────────────────────────┐ │
│  │  Spring      │  │  JWT       │  │  Redis                    │ │
│  │  Security    │  │  Filter    │  │  (Logout Token Blacklist) │ │
│  └──────────────┘  └────────────┘  └───────────────────────────┘ │
└────────┬───────────────────────────────────────────────────────-─┘
         │
         ▼
┌──────────────────────────┐    ┌─────────────────────────┐
│  PostgreSQL (Supabase)   │    │  External APIs          │
│  Users, Interviews,      │    │  • Google OAuth 2.0     │
│  Test/User Attempts,     │    │  • GitHub OAuth 2.0     │
│  Questions, Categories,     │    │  • Brevo (Email)        │
│  Topics, Techniques,        │    │  • Gemini (AI Coach)    │
│  Companies, Admins          │    │                         │
└──────────────────────────┘    └─────────────────────────┘
```

---

## 📁 Project Structure

```
Interview_Preparation_Tracker_With_Weakness_Detection/
│
├── client/                              # React frontend
│   └── src/
│       ├── pages/                       # Route-level page components
│       │   └── admin/                   # Admin panel pages
│       ├── components/
│       │   ├── admin/                   # Admin shell/layout
│       │   ├── chat/                    # Floating AI coach chatbot
│       │   ├── dashboard/               # Dashboard widgets (radar, heatmap, trends)
│       │   ├── readiness/               # Confidence/readiness explorer views
│       │   ├── interview/               # Onboarding/interview-setup steps
│       │   ├── interview-history/       # Interview timeline & filters
│       │   ├── mock-test/                # Quiz-taking UI (header, navigator, footer)
│       │   ├── mock-test-selection/     # Test browsing/filtering
│       │   ├── mocktest-history/        # Per-interview test history
│       │   ├── profile/                 # Profile & activity heatmap
│       │   ├── result/                  # Result overview/analytics/review tabs
│       │   └── ui/                      # Reusable primitives (Card, ProgressBar, ...)
│       ├── context/                     # Theme (dark/light) context
│       ├── utils/                       # API base, chat/auth/profile caches, validation
│       └── data/                        # Static display metadata (category labels/colors)
│
├── db/                                  # SQL migrations
│   └── migration_*.sql                  # Normalization, dashboard-support migrations
│
├── server/                              # Spring Boot backend
│   └── src/main/java/com/preptracker/server/
│       ├── config/                      # Security, JWT filter, Redis, CORS, exception handling
│       ├── controller/                  # REST endpoints (user-facing + admin)
│       ├── service/                     # Business logic layer
│       ├── model/                       # JPA entities
│       ├── repository/                  # Spring Data JPA interfaces
│       ├── dto/                         # Request / response DTOs
│       ├── exception/                   # Custom exception types
│       └── util/                        # JWT utilities
│
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Java 21+**
- **Node.js 18+**
- **Maven** (or use the included `mvnw` / `mvnw.cmd` wrapper)
- **PostgreSQL** (local or [Supabase](https://supabase.com))
- **Redis** (local instance — defaults to `localhost:6379`)

---

### Backend Setup

```bash
cd server

# Copy the env template and fill in your values
cp .env.example .env

# Build the project
./mvnw clean install

# Run the development server
./mvnw spring-boot:run
```

> Server starts at `http://localhost:8080`

---

### Frontend Setup

```bash
cd client

# Copy the env template and fill in your values
cp .env.example .env

# Install dependencies
npm install

# Start the development server
npm run dev
```

> Frontend starts at `http://localhost:5173`

---

## 🔑 Environment Variables

Both `client/.env` and `server/.env` are git-ignored — copy the `.env.example` in each folder as a starting point. **Never commit real `.env` files.**

### Server (`server/.env`)

```env
# Database (PostgreSQL / Supabase)
DB_URL=jdbc:postgresql://<host>:<port>/<database>
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET_KEY=your_super_secret_key_min_32_chars

# Email (Brevo)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@yourdomain.com

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id

# GitHub OAuth 2.0
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google Gemini (AI coach)
GEMINI_API_KEY=your_gemini_api_key
```

> Redis host/port, the GitHub OAuth redirect URI, the frontend callback URL, and the Gemini model URL are currently configured in `application.properties` for local development (`localhost:6379`, `localhost:8080`, `localhost:5173`, `gemini-3.5-flash-lite`). Update those directly in `application.properties` for other environments. Note: the AI coach / chat feature requires a valid `GEMINI_API_KEY`; without it, `/api/chat` will fail.

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📡 API Reference

All endpoints are prefixed `/api`. Auth is stateless JWT (Bearer token); admin endpoints additionally require a `ROLE_ADMIN` token.

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Email/password login |
| POST | `/auth/verify-otp` | Verify registration OTP |
| POST | `/auth/resend-otp` | Resend verification OTP |
| POST | `/auth/google` | Login via Google access token |
| GET | `/auth/github` | Redirect to GitHub OAuth authorize URL |
| GET | `/auth/github/callback` | GitHub OAuth callback → redirects to frontend with JWT |
| POST | `/auth/forgot-password` | Request password-reset OTP |
| POST | `/auth/reset-password` | Reset password with OTP |
| POST | `/auth/logout` | Logout (blacklists current token) |
| POST | `/admin/auth/login` | Admin login → JWT with `ROLE_ADMIN` |
| POST | `/contact` | Submit the "Contact Us" form |
| GET | `/public/stats` | Aggregate landing-page stats (user/question counts) |

### Authenticated (user)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Current user's full profile |
| GET / PUT / DELETE | `/users/{id}` | Get / update / delete own account (username, password, avatar, interview date) |
| POST | `/users/onboarding` | Complete the onboarding flow |
| GET | `/users/me/dashboard/stats` | Overall dashboard KPIs (tests, solved, accuracy, confidence) |
| GET | `/users/me/dashboard/categories` | Per-category confidence breakdown |
| GET | `/users/me/dashboard/confidence-tree` | Category → topic → technique confidence tree |
| GET | `/users/me/dashboard/trend` | Confidence/accuracy trend over time |
| GET | `/users/me/dashboard/blind-spots` | High-confidence-but-low-accuracy "danger zone" topics |
| GET | `/users/me/dashboard/accuracy-heatmap` | Accuracy heatmap grid |
| GET | `/users/me/dashboard/activity-heatmap` | Practice activity heatmap |
| GET | `/interviews` | List the user's interview tracks + aggregate stats |
| POST | `/interviews/result` | Close an interview with a result |
| POST | `/chat` | Ask the AI coach (personalized with your stats) |
| GET | `/questions` | Fetch shuffled questions, filterable by topic/category/limit |
| POST | `/tests/start/{testId}` | Start a persisted mock test session |
| POST | `/tests/start` | Start a topic-based practice session |
| POST | `/tests/abandon` | Abort the active session (saves partial progress) |
| POST | `/tests/submit` | Submit a completed test for grading + confidence scoring |
| GET | `/tests/latest` | Most recent test attempt (for the dashboard card) |
| GET | `/tests/attempts/{attemptId}` | Detailed result for a past attempt |
| GET | `/tests/available` | List available full mock assessments |
| GET | `/tests/history` | Persisted mock/topic test history |
| GET | `/notifications` | List recent notifications |
| GET | `/notifications/unread-count` | Unread notification count |
| PATCH | `/notifications/{id}/read` \| `/notifications/read-all` | Mark one / all notifications read |

### Admin (`ROLE_ADMIN`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` \| `/admin/users/banned` | List users / banned users |
| POST | `/admin/users/{id}/ban` \| `/admin/users/{id}/unban` | Ban / unban a user |
| GET | `/admin/questions` \| `/admin/questions/search` \| `/admin/questions/stats` | List / search+paginate / stats for questions |
| POST | `/admin/questions` \| `/admin/questions/bulk` | Create a question / bulk-create |
| PUT / DELETE | `/admin/questions/{id}` | Update / delete a question |
| GET / POST / PUT / DELETE | `/admin/tests` \| `/admin/tests/{id}` | Manage mock tests |
| GET | `/admin/results` | List all persisted test results |
| GET | `/admin/dashboard` | Admin dashboard widget data |
| GET | `/admin/analytics/overview` | Platform-wide KPIs, growth, and health |
| GET | `/admin/analytics/users` | User-centric analytics (growth, demographics, reports) |
| GET | `/admin/categories` \| `/admin/topics` \| `/admin/techniques` \| `/admin/companies` \| `/admin/technique-topics` | List metadata |
| POST / DELETE | `/admin/topics` \| `/admin/topics/{id}` | Create / delete a topic |

---

## 👥 Team

<table>
<tr>
<td align="center">
  <b>Varad Ijantkar</b><br/>
  <sub>Full Stack</sub>
</td>
<td align="center">
  <b>Utkarsh Kumar</b><br/>
  <sub>Full Stack</sub>
</td>
<td align="center">
  <b>Tanishq</b><br/>
  <sub>Full Stack</sub>
</td>
<td align="center">
  <b>Suhani</b><br/>
  <sub>Full Stack</sub>
</td>
<td align="center">
  <b>Saurabh</b><br/>
  <sub>Full Stack</sub>
</td>
</tr>
</table>

**Organization**: [DevKiddies](https://github.com/DevKiddies)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

---

<div align="center">

Made with ❤️ by **DevKiddies** · 2026

</div>
