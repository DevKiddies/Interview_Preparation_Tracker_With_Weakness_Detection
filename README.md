<div align="center">

# 🎯 PrepEdge
### *Interview Preparation Tracker with Weakness Detection*

<br/>

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)
[![Redis](https://img.shields.io/badge/Redis-Session_Cache-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

<br/>

**PrepEdge** is a full-stack intelligent interview preparation platform that helps candidates ace technical interviews through adaptive practice, real-time weakness detection, and personalized analytics.

<br/>

[Features](#-features) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [Environment Variables](#-environment-variables) · [API Reference](#-api-reference) · [Team](#-team)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication & Security
- Email + OTP verification flow
- Google OAuth 2.0 & GitHub OAuth 2.0
- Smart account linking across providers
- Stateless JWT with Redis token blacklisting
- Password reset via email OTP
- IDOR-protected user endpoints

</td>
<td width="50%">

### 📋 Onboarding Wizard
- 4-step personalized setup
- Target company selection (FAANG, Product, Service)
- Interview date tracking with countdown
- Experience level & focus topic configuration

</td>
</tr>
<tr>
<td width="50%">

### 🧪 Mock Tests & Practice
- 90-minute full DSA assessments (20 questions)
- Configurable topic-based practice sessions
- Real-time countdown timer with question navigator
- Flag/skip functionality
- Server-side grading (answers never exposed to client)

</td>
<td width="50%">

### 📊 Analytics Dashboard
- Weakness Radar Chart across all topics
- Confidence vs. Accuracy trend charts (7-day / 30-day)
- Activity heatmap calendar
- Per-category score breakdown
- Danger Zone alert for critical weak areas

</td>
</tr>
<tr>
<td width="50%">

### 🧠 Weakness Detection
- Automated weak topic identification from test history
- Progress bars per topic with mastery levels
- Personalized recommendations engine (in progress)
- Confidence calibration tracking

</td>
<td width="50%">

### 🛠️ Admin Panel
- Secure admin authentication (isolated from user auth)
- User management dashboard
- Question bank management
- Test analytics overview

</td>
</tr>
</table>

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.2.5 | UI Framework |
| Vite | 8.0.9 | Build Tool & Dev Server |
| Tailwind CSS | 4.3.0 | Utility-first Styling |
| React Router DOM | 7.15.1 | Client-side Routing |
| Recharts | 3.8.1 | Data Visualization (Radar, Line, Bar) |
| @react-oauth/google | 0.13.5 | Google OAuth Integration |
| Lucide React | 1.16.0 | Icon Library |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.5.16 | REST API Framework |
| Java | 21 | Runtime |
| Spring Security | — | Route-level Access Control |
| Spring Data JPA | — | ORM / Database Layer |
| jjwt | 0.11.5 | JWT Generation & Validation |
| PostgreSQL (Supabase) | — | Primary Database |
| Redis | — | Token Blacklisting & Caching |
| Brevo API | — | Transactional Email (OTP) |
| Project Lombok | — | Boilerplate Reduction |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                │
│  Landing → Auth → Onboarding → Dashboard → Test → Results  │
└────────────────────────┬────────────────────────────────────┘
                         │  REST API  (JWT Bearer Token)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  SERVER (Spring Boot / Java 21)             │
│                                                             │
│  AuthController  UserController  QuestionController         │
│  TestController  AdminController                            │
│                                                             │
│  ┌──────────────┐  ┌────────────┐  ┌────────────────────┐  │
│  │  Spring      │  │  JWT       │  │  Redis             │  │
│  │  Security    │  │  Filter    │  │  (Token Blacklist) │  │
│  └──────────────┘  └────────────┘  └────────────────────┘  │
└────────┬───────────────────────────────────────────────────-┘
         │
         ▼
┌─────────────────────────┐    ┌────────────────────────┐
│  PostgreSQL (Supabase)  │    │  External APIs          │
│  Users, Profiles,       │    │  • Google OAuth 2.0     │
│  Questions, Admins,     │    │  • GitHub OAuth 2.0     │
│  VerificationTokens     │    │  • Brevo (Email)        │
└─────────────────────────┘    └────────────────────────┘
```

---

## 📁 Project Structure

```
Interview_Preparation_Tracker_With_Weakness_Detection/
│
├── client/                          # React Frontend
│   └── src/
│       ├── pages/                   # Route-level page components
│       ├── components/
│       │   ├── dashboard/           # 10 modular dashboard widgets
│       │   └── ui/                  # Reusable UI primitives
│       ├── context/                 # Theme (dark/light) context
│       ├── utils/                   # API config, form validation
│       └── data/                    # Static placeholder data
│
├── server/                          # Spring Boot Backend
│   └── src/main/java/com/preptracker/server/
│       ├── config/                  # Security, JWT, Redis, CORS
│       ├── controller/              # REST API endpoints
│       ├── service/                 # Business logic layer
│       ├── model/                   # JPA entities
│       ├── repository/              # Spring Data JPA interfaces
│       ├── dto/                     # Request / Response DTOs
│       ├── exception/               # Custom exception classes
│       └── util/                    # JWT utilities
│
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Java 21+**
- **Node.js 18+**
- **Maven** (or use the included `mvnw` wrapper)
- **PostgreSQL** (local or [Supabase](https://supabase.com))
- **Redis** (local instance)

---

### Backend Setup

```bash
# Navigate to the server directory
cd server

# Copy environment template and fill in your values
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
# Navigate to the client directory
cd client

# Copy environment template and fill in your values
cp .env.example .env

# Install dependencies
npm install

# Start the development server
npm run dev
```

> Frontend starts at `http://localhost:5173`

---

## 🔑 Environment Variables

### Server (`server/.env`)

```env
# Database (PostgreSQL / Supabase)
DB_URL=jdbc:postgresql://<host>:<port>/<database>
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET_KEY=your_super_secret_key_min_24_chars

# Email (Brevo / Sendinblue)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@yourdomain.com

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your_google_client_id

# GitHub OAuth 2.0
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:8080
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Register new user |
| `POST` | `/api/auth/login` | — | Login with email/password |
| `POST` | `/api/auth/google` | — | Google OAuth login |
| `GET` | `/api/auth/github/callback` | — | GitHub OAuth callback |
| `POST` | `/api/auth/verify-otp` | — | Verify email OTP |
| `POST` | `/api/auth/forgot-password` | — | Request password reset |
| `POST` | `/api/auth/reset-password` | — | Reset password with OTP |
| `POST` | `/api/auth/logout` | JWT | Logout (blacklist token) |
| `GET` | `/api/users/me` | JWT | Get current user profile |
| `PUT` | `/api/users/me` | JWT | Update user profile |
| `DELETE` | `/api/users/me` | JWT | Delete account |
| `GET` | `/api/questions` | JWT | Fetch questions (with filters) |
| `POST` | `/api/tests/submit` | JWT | Submit test for grading |
| `POST` | `/api/admin/auth/login` | — | Admin login |

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
  <b>Tanishq / Tanya</b><br/>
  <sub>Full Stack</sub>
</td>
<td align="center">
  <b>Suhani</b><br/>
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
