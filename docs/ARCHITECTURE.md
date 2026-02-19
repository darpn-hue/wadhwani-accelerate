# System Architecture

## Overview

The Wadhwani Ventures platform is a modern full-stack application built with **React 19** (frontend) and **Node.js/Express** (backend), leveraging **Supabase** for database, authentication, and real-time capabilities. The architecture emphasizes type safety, modularity, role-based access control, and scalability.

---

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User (Browser)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Netlify CDN (Frontend)                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │           React 19 SPA (TypeScript + Vite)                │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  • AuthContext (User Session)                       │  │  │
│  │  │  • API Client (Supabase + Express)                  │  │  │
│  │  │  • React Router v6                                  │  │  │
│  │  │  • Tailwind CSS                                     │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────┬───────────────────────────┬─────────────────────────┘
            │                           │
            │ Direct Queries            │ Complex Mutations
            │ (RLS Protected)           │ & Business Logic
            ↓                           ↓
┌───────────────────────┐    ┌──────────────────────────────────┐
│   Supabase Project    │    │   Express Backend (Railway)      │
│  ┌─────────────────┐  │    │  ┌────────────────────────────┐  │
│  │  GoTrue Auth    │  │    │  │  /api/ventures             │  │
│  │  (JWT)          │  │    │  │  /api/ventures/:id/submit  │  │
│  └─────────────────┘  │    │  │  /api/ventures/:id/streams │  │
│  ┌─────────────────┐  │    │  │  /api/auth/*               │  │
│  │  PostgreSQL     │  │    │  └────────────────────────────┘  │
│  │  - ventures     │←─┼────┼─ Supabase Client (server-side) │
│  │  - profiles     │  │    └──────────────────────────────────┘
│  │  - programs     │  │
│  │  - RLS Policies │  │
│  └─────────────────┘  │
└───────────────────────┘
```

---

## 🧩 Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite (Fast HMR, optimized production builds)
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**:
  - **AuthContext**: User session and role management
  - **Local State**: `useState`/`useReducer` for forms and UI
  - **Server State**: Direct Supabase client + API calls
- **HTTP Client**: Supabase JS client + native fetch for Express API
- **Deployment**: Netlify (CDN + Edge Functions)

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Zod schemas
- **Authentication**: Supabase Auth (JWT verification)
- **Database Client**: Supabase JS client (server-side)
- **Deployment**: Railway / Render

### Database & Services
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (GoTrue)
- **File Storage**: Supabase Storage (if needed)
- **Row Level Security (RLS)**: Postgres policies for data access control

---

## 📊 Data Flow Patterns

### 1. Authentication Flow

```
User Login → Supabase Auth → JWT Token → localStorage
                ↓
         AuthContext updates
                ↓
    Role-based UI rendering + RLS enforcement
```

**Details:**
1. User enters credentials
2. Frontend calls `supabase.auth.signInWithPassword()`
3. Supabase returns JWT + session
4. Token stored in localStorage
5. AuthContext updates user state
6. Protected routes check auth status
7. RLS policies enforce data access based on `auth.uid()` and `profiles.role`

### 2. Venture Application Submission Flow

```
Entrepreneur fills 4-step form
        ↓
    Validates locally
        ↓
    Creates draft venture (Supabase Direct)
        ↓
    Saves each step's data to ventures table
        ↓
    Clicks "SUBMIT APPLICATION"
        ↓
    api.submitVenture(id) → status = 'Submitted'
        ↓
    Success Manager sees venture in VSM Dashboard
```

### 3. VSM Dashboard Review Flow

```
Success Manager opens VSM Dashboard
        ↓
    Fetches all ventures (Supabase Direct + RLS)
        ↓
    Filters by program_recommendation (client-side)
        ↓
    Selects venture → Reviews data
        ↓
    Optionally generates AI analysis
        ↓
    Fills in:
      - Program Recommendation
      - Call Notes (vsm_notes)
      - Internal Comments
      - AI Analysis
        ↓
    Clicks "SUBMIT RECOMMENDATION"
        ↓
    supabase.from('ventures').update({
      program_recommendation,
      vsm_notes,
      internal_comments,
      ai_analysis,
      vsm_reviewed_at: NOW(),
      status: 'Under Review'
    })
        ↓
    Committee sees venture in Committee Dashboard
```

### 4. Role-Based Data Access

```
Request → Supabase → RLS Policy Check → Response

Example:
  Entrepreneur → SELECT from ventures
    ↓
  WHERE user_id = auth.uid()  ← RLS enforces
    ↓
  Returns only user's ventures

  Success Manager → SELECT from ventures
    ↓
  WHERE role IN ('success_mgr', 'admin')  ← RLS allows all
    ↓
  Returns ALL ventures
```

---

## 🔐 Security Architecture

### Row Level Security (RLS) Policies

**Ventures Table:**

```sql
-- Entrepreneurs: Read only own ventures
CREATE POLICY "Users can view own ventures"
ON ventures FOR SELECT
USING (user_id = auth.uid());

-- Staff: Read ALL ventures
CREATE POLICY "Staff can read all ventures"
ON ventures FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('success_mgr', 'committee', 'venture_mgr', 'admin')
  )
);

-- Entrepreneurs: Insert own ventures
CREATE POLICY "Users can create ventures"
ON ventures FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Staff: Update any venture
CREATE POLICY "Staff can update any venture"
ON ventures FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('success_mgr', 'committee', 'venture_mgr', 'admin')
  )
);
```

**Profiles Table:**

```sql
-- Auto role assignment trigger on auth.users INSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    CASE
      WHEN NEW.email LIKE '%admin%' THEN 'success_mgr'
      WHEN NEW.email LIKE '%committee%' THEN 'committee'
      ELSE 'entrepreneur'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Authentication & Authorization

1. **JWT Tokens**: Issued by Supabase Auth
2. **Token Storage**: localStorage (frontend)
3. **Token Validation**:
   - Frontend: AuthContext checks
   - Backend: Express middleware verifies JWT
4. **Role Assignment**: Automatic via trigger based on email pattern
5. **Access Control**: RLS policies + frontend route guards

---

## 🗄️ Database Schema

### Core Tables

#### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT CHECK (role IN ('entrepreneur', 'success_mgr', 'committee', 'venture_mgr', 'admin')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `ventures`
```sql
CREATE TABLE ventures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Application Data
  name TEXT NOT NULL,
  description TEXT,
  founder_name TEXT,
  city TEXT,
  location TEXT,
  revenue_12m NUMERIC,
  full_time_employees INTEGER,
  revenue_potential_3y NUMERIC,
  incremental_hiring INTEGER,
  growth_current JSONB,
  growth_target JSONB,
  commitment JSONB,
  growth_focus TEXT,
  min_investment NUMERIC,
  blockers TEXT,
  support_request TEXT,

  -- VSM Workflow
  program_recommendation TEXT,
  vsm_notes TEXT,
  internal_comments TEXT,
  ai_analysis JSONB,
  vsm_reviewed_at TIMESTAMPTZ,

  -- Committee Workflow
  venture_partner TEXT,
  committee_feedback TEXT,
  committee_decision TEXT,

  -- Status & Tracking
  status TEXT DEFAULT 'draft',
  agreement_status TEXT DEFAULT 'pending',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `venture_streams`
```sql
CREATE TABLE venture_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venture_id UUID REFERENCES ventures(id) ON DELETE CASCADE,
  stream_name TEXT NOT NULL,
  status TEXT DEFAULT 'No help needed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `programs`
```sql
CREATE TABLE programs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  duration_months INTEGER
);

-- Seeded data:
-- 1. Accelerate Prime
-- 2. Accelerate Core
-- 3. Accelerate Select
-- 4. Ignite
-- 5. Liftoff
```

---

## 🎯 Design Decisions & Rationale

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Frontend Framework** | React 19 | Latest features, excellent TypeScript support, large ecosystem |
| **Build Tool** | Vite | Fast HMR, optimized builds, modern ESM support |
| **Backend** | Express.js | Lightweight, flexible, excellent middleware ecosystem |
| **Database** | Supabase PostgreSQL | BaaS benefits + full PostgreSQL power, RLS for security |
| **CSS Framework** | Tailwind CSS | Rapid development, consistent design system, small bundle |
| **Type System** | TypeScript | Type safety, better DX, prevents runtime errors |
| **Auth Strategy** | Supabase Auth + RLS | Built-in, secure, scales automatically |
| **State Management** | Context + Direct Supabase | Simple, no over-engineering, leverages RLS |
| **Deployment** | Netlify (FE) + Railway (BE) | CDN edge, automatic deployments, serverless scaling |

---

## 🔄 State Management Strategy

### Frontend State Layers

1. **Server State** (Ventures, Profiles, Programs)
   - Source of truth: PostgreSQL
   - Fetched via Supabase client
   - No local caching (always fresh data)
   - RLS ensures security

2. **Authentication State** (User Session)
   - Managed by `AuthContext`
   - Persisted in localStorage
   - Synced with Supabase Auth

3. **UI State** (Forms, Modals, Loading)
   - Local `useState`/`useReducer`
   - Component-scoped
   - Not persisted

### Why No Redux/MobX?

- **Supabase RLS** acts as state manager (server-side)
- **Direct queries** keep data fresh
- **Simple mental model**: UI → Supabase → RLS → Data
- **Less boilerplate**: No actions, reducers, sagas
- **Performance**: RLS filtering happens in database, not client

---

## 📈 Scalability Considerations

### Current Architecture (< 10K users)
- Supabase handles auth, database, and RLS
- Express backend for complex logic
- Direct Supabase queries for reads
- Netlify CDN for static assets

### Future Growth (10K–100K users)

#### Caching Layer
```
Frontend → Redis Cache → Supabase
```
- Cache frequent queries (programs, public data)
- Invalidate on writes
- Reduces database load

#### API Gateway
```
Frontend → API Gateway → Microservices
           (Rate Limiting, Auth)
```
- Centralized auth verification
- Rate limiting per user/role
- Request/response transformation

#### Database Optimization
- **Indexes**: Add indexes on frequently queried columns
- **Partitioning**: Partition `ventures` table by created_at
- **Read Replicas**: Separate read/write databases
- **Connection Pooling**: PgBouncer for connection management

### At Scale (100K+ users)

#### Microservices Architecture
```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
┌──────┴──────────────────────────────┐
│         API Gateway                 │
│      (Auth, Rate Limit, Routing)    │
└──────┬──────────────────────────────┘
       │
   ┌───┴───┬────────┬────────┬────────┐
   │       │        │        │        │
┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌──┴──┐ ┌───┴───┐
│Auth │ │Vent │ │VSM  │ │Comm │ │Notif  │
│Svc  │ │Svc  │ │Svc  │ │Svc  │ │Svc    │
└─────┘ └─────┘ └─────┘ └─────┘ └───────┘
   │       │        │        │        │
   └───┬───┴────────┴────────┴────────┘
       │
┌──────┴──────┐
│  PostgreSQL │
│  (Sharded)  │
└─────────────┘
```

---

## 🚀 Deployment Architecture

### Current Setup

**Frontend (Netlify):**
- **Build Command**: `npm run build`
- **Publish Directory**: `dist/`
- **Environment Variables**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_API_URL` (Express backend URL)

**Backend (Railway):**
- **Start Command**: `npm run start`
- **Environment Variables**:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `JWT_SECRET`
  - `PORT`

**Database (Supabase):**
- Managed PostgreSQL
- Automatic backups
- Connection pooling via Supavisor

### CI/CD Pipeline

```
GitHub Push
     ↓
Netlify Build (Frontend)
     ↓
Railway Deploy (Backend)
     ↓
Run Migrations (if any)
     ↓
Health Check
     ↓
Live ✅
```

---

## 🧪 Testing Strategy

### Unit Tests
- **Frontend**: Vitest + React Testing Library
- **Backend**: Jest + Supertest
- **Coverage Target**: > 70%

### Integration Tests
- API endpoint tests
- Database query tests
- Auth flow tests

### E2E Tests
- Playwright for critical user flows:
  1. Sign up → Create venture → Submit
  2. VSM login → Review venture → Submit recommendation
  3. Committee login → Approve venture

---

## 📚 Code Organization

```
wadhwani_ventures_4_arun/
├── src/                          # Frontend (React)
│   ├── components/               # Reusable UI components
│   ├── pages/                    # Route pages
│   ├── context/                  # React Context (Auth)
│   ├── lib/                      # API client, Supabase client
│   ├── types/                    # TypeScript types
│   └── App.tsx                   # Root component
├── backend/                      # Backend (Express)
│   ├── src/
│   │   ├── routes/               # API routes
│   │   ├── services/             # Business logic
│   │   ├── middleware/           # Auth, validation
│   │   ├── types/                # TypeScript types + Zod schemas
│   │   └── config/               # Supabase config
│   └── dist/                     # Compiled JS (gitignored)
├── scripts/                      # SQL scripts for setup/maintenance
├── docs/                         # Documentation
└── tests/                        # Test files
```

---

## 🔮 Future Enhancements

1. **Real-time Updates**: Supabase Realtime for live VSM Dashboard
2. **File Uploads**: Supabase Storage for pitch decks, financials
3. **Email Notifications**: SendGrid/Postmark for status updates
4. **Analytics Dashboard**: Custom analytics for success managers
5. **Mobile App**: React Native with shared API
6. **AI Features**: OpenAI integration for deeper venture analysis
7. **Webhooks**: Integrate with external CRM/ERP systems

---

**Built with ❤️ for scaling rural ventures**
