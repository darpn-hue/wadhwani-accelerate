# API Documentation

The platform uses a **hybrid architecture** combining Supabase direct client calls (for reads) and a Node.js/Express backend (for complex mutations and business logic).

## Architecture Overview

- **Frontend → Supabase**: Direct database queries for reads (leveraging RLS policies)
- **Frontend → Express Backend**: Complex mutations, validations, and business logic
- **Authentication**: Supabase Auth (GoTrue) with JWT tokens
- **Database**: PostgreSQL with Row Level Security (RLS)

---

## Base URLs

**Development (Backend):**
```
http://localhost:3001/api
```

**Development (Frontend → Supabase):**
```
Direct Supabase client via environment variables
```

**Production:**
```
https://api.your-domain.com/api
```

---

## Authentication

All protected endpoints require a valid JWT token in the `Authorization` header:

```http
Authorization: Bearer <your-access-token>
```

Tokens are obtained via Supabase Auth and stored in localStorage.

---

## Response Format

**Success Response:**
```json
{
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response:**
```json
{
  "error": "Error message description",
  "details": [ ... ]
}
```

---

## Endpoints

### 🔐 Authentication

All authentication goes through Supabase Auth directly from the frontend.

#### Sign Up
```typescript
await supabase.auth.signUp({
  email: string,
  password: string,
  options: {
    data: {
      full_name: string,
      role?: 'entrepreneur' | 'success_mgr' | 'committee' | 'admin'
    }
  }
})
```

#### Login
```typescript
await supabase.auth.signInWithPassword({
  email: string,
  password: string
})
```

#### Get Current User
```typescript
await supabase.auth.getUser()
```

#### Logout
```typescript
await supabase.auth.signOut()
```

---

### 🚀 Ventures

#### List Ventures
**Frontend (Supabase Direct):**
```typescript
await supabase
  .from('ventures')
  .select('*, streams:venture_streams(*)')
  .eq('status', 'Submitted') // Optional filter
```

**Backend Endpoint:**
- **URL**: `GET /api/ventures`
- **Query Params**:
  - `status`: Filter by status
  - `program`: Filter by program name
  - `limit`: Number of results (default 50)
  - `offset`: Pagination offset
- **Access**: Role-based via RLS
  - Entrepreneurs: See only their ventures
  - Success Managers/Committee/Admin: See all ventures

#### Create Venture
**Frontend (Supabase Direct):**
```typescript
await supabase
  .from('ventures')
  .insert({
    name: string,
    description: string,
    founder_name: string,
    city: string,
    revenue_12m: number,
    full_time_employees: number,
    revenue_potential_3y: number,
    incremental_hiring: number,
    growth_current: object, // JSONB
    growth_target: object,  // JSONB
    commitment: object,     // JSONB
    growth_focus: string,
    min_investment: number,
    blockers: string,
    support_request: string,
    status: 'draft',        // Default
    user_id: string         // Auto from auth.uid()
  })
  .select()
  .single()
```

**Backend Endpoint:**
- **URL**: `POST /api/ventures`
- **Body**: Venture object
- **Returns**: Created venture

#### Get Venture Details
**Frontend (Supabase Direct):**
```typescript
await supabase
  .from('ventures')
  .select(`
    *,
    streams:venture_streams(*)
  `)
  .eq('id', ventureId)
  .single()
```

**Backend Endpoint:**
- **URL**: `GET /api/ventures/:id`
- **Access**: Owner or Staff roles only

#### Update Venture
**Frontend (Supabase Direct - for VSM Dashboard):**
```typescript
await supabase
  .from('ventures')
  .update({
    // Application data
    name: string,
    description: string,

    // VSM Workflow fields
    program_recommendation: string, // 'Self-Serve' | 'Accelerate Core' | 'Accelerate Select' | 'Accelerate Prime' | 'Reject'
    vsm_notes: string,              // Call transcripts, screening notes
    internal_comments: string,       // Committee-only notes
    ai_analysis: object,            // JSONB: { strengths, risks, questions }
    vsm_reviewed_at: timestamp,     // Auto-set on submission
    status: string,                 // Changes to 'Under Review' on VSM submission

    // Committee workflow
    venture_partner: string,
    committee_feedback: string,
    committee_decision: string,

    // Other fields
    ...
  })
  .eq('id', ventureId)
  .select()
  .single()
```

**Backend Endpoint:**
- **URL**: `PUT /api/ventures/:id`
- **Body**: Partial venture object
- **Access**: Owner or Staff roles

#### Submit Venture for Review
**Frontend (Supabase Direct):**
```typescript
await supabase
  .from('ventures')
  .update({ status: 'Submitted' })
  .eq('id', ventureId)
  .select()
  .single()
```

**Backend Endpoint:**
- **URL**: `POST /api/ventures/:id/submit`
- **Action**: Sets status to 'Submitted'
- **Access**: Venture owner only

#### Delete Venture
**Backend Endpoint:**
- **URL**: `DELETE /api/ventures/:id`
- **Access**: Owner or Admin only

---

### 🌊 Venture Streams

#### List Streams for Venture
**Frontend (Supabase Direct):**
```typescript
await supabase
  .from('venture_streams')
  .select('*')
  .eq('venture_id', ventureId)
```

**Backend Endpoint:**
- **URL**: `GET /api/ventures/:id/streams`

#### Create Stream
**Frontend (Supabase Direct):**
```typescript
await supabase
  .from('venture_streams')
  .insert({
    venture_id: string,
    stream_name: string,  // e.g., 'Product', 'GTM', 'Funding', etc.
    status: string        // 'No help needed' | 'Work in Progress' | 'Done' | 'Support needed'
  })
  .select()
  .single()
```

**Backend Endpoint:**
- **URL**: `POST /api/ventures/:id/streams`
- **Body**:
  ```json
  {
    "stream_name": "Product Development",
    "status": "Work in Progress"
  }
  ```

#### Update Stream
**Backend Endpoint:**
- **URL**: `PUT /api/streams/:id`
- **Body**:
  ```json
  {
    "status": "Done"
  }
  ```

#### Delete Stream
**Backend Endpoint:**
- **URL**: `DELETE /api/streams/:id`

---

### 💼 Programs

Programs are static reference data seeded during setup:

```sql
SELECT * FROM programs;
```

| ID | Name | Description |
|----|------|-------------|
| 1 | Accelerate Prime | High-potential ventures |
| 2 | Accelerate Core | Core program |
| 3 | Accelerate Select | Selected ventures |
| 4 | Ignite | Early-stage ventures |
| 5 | Liftoff | Pre-seed ventures |

---

### ❤️ System

#### Health Check
**Backend Endpoint:**
- **URL**: `GET /api/health`
- **Response**:
  ```json
  {
    "status": "ok",
    "service": "Wadhwani Ventures API",
    "version": "2.0.0"
  }
  ```

---

## Database Schema

### Ventures Table - Key Fields

**Application Data:**
- `name`, `description` - Basic info
- `founder_name`, `city`, `location` - Founder details
- `revenue_12m`, `full_time_employees` - Current metrics
- `revenue_potential_3y`, `incremental_hiring` - Projections
- `growth_current`, `growth_target` (JSONB) - Growth profiles
- `commitment` (JSONB) - Investment details
- `growth_focus` - Focus areas
- `min_investment` - Required investment
- `blockers`, `support_request` - Challenges and needs

**VSM Workflow Fields:**
- `vsm_notes` (TEXT) - Call transcripts and screening notes
- `program_recommendation` (TEXT) - Recommended program tier
- `internal_comments` (TEXT) - Committee-only internal notes
- `ai_analysis` (JSONB) - AI-generated insights
  ```json
  {
    "strengths": ["...", "..."],
    "risks": ["...", "..."],
    "questions": ["...", "..."]
  }
  ```
- `vsm_reviewed_at` (TIMESTAMP) - Review timestamp
- `status` (TEXT) - Application status workflow

**Committee Workflow:**
- `venture_partner` - Assigned partner
- `committee_feedback` - Decision notes
- `committee_decision` - Final decision

**Agreement Workflow:**
- `agreement_status` - Draft/Sent/Signed

---

## Row Level Security (RLS)

All tables have RLS policies that enforce access control:

### Ventures Table Policies

**Entrepreneurs:**
```sql
-- Can read only their own ventures
SELECT * FROM ventures WHERE user_id = auth.uid()

-- Can create ventures
INSERT INTO ventures (user_id = auth.uid())

-- Can update their own drafts
UPDATE ventures WHERE user_id = auth.uid() AND status = 'draft'
```

**Staff (success_mgr, committee, venture_mgr, admin):**
```sql
-- Can read ALL ventures
SELECT * FROM ventures

-- Can update any venture
UPDATE ventures
```

### Profiles Table

Auto-populated from `auth.users` with role assignment based on email:
- Email contains "admin" → `success_mgr`
- Email contains "committee" → `committee`
- Otherwise → `entrepreneur`

---

## Error Codes

| Code | Description |
|------|-------------|
| **200** | OK |
| **201** | Created |
| **204** | No Content (Delete succeeded) |
| **400** | Bad Request - Validation failed |
| **401** | Unauthorized - Missing/invalid token |
| **403** | Forbidden - Insufficient permissions |
| **404** | Not Found |
| **500** | Internal Server Error |

---

## Rate Limiting

- **Backend API**: 100 requests/minute per IP
- **Supabase**: Per project limits (see Supabase dashboard)

---

## Frontend API Client

The frontend uses `src/lib/api.ts` which wraps Supabase calls:

```typescript
import { api } from '@/lib/api';

// Get all ventures
const { ventures } = await api.getVentures({ status: 'Submitted' });

// Create venture
const { venture } = await api.createVenture(data);

// Update venture
const { venture } = await api.updateVenture(id, updates);

// Submit venture
const { venture } = await api.submitVenture(id);
```

---

## VSM Dashboard Data Flow

1. **Entrepreneur submits venture** → Status changes to `Submitted`
2. **VSM reviews in VSM Dashboard**:
   - Reads venture data
   - Generates AI analysis (optional)
   - Adds call notes to `vsm_notes`
   - Selects `program_recommendation`
   - Adds `internal_comments`
3. **VSM submits** → `updateVenture()` with all VSM fields
4. **Status changes** to `Under Review`
5. **Committee sees** venture in Committee Dashboard
6. **Final decision** → Update `committee_decision`

All state is persisted in the `ventures` table via Supabase RLS-protected updates.
