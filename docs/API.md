# API Documentation — Assisted Venture Growth Platform

> **Note:** This application uses Supabase for backend services. All API calls go through the Supabase client library, not a custom REST API.

## Base URL

```
Supabase Project URL: https://ymeqyrcstuskhcbpenss.supabase.co
```

## Authentication

All authenticated requests use Supabase Auth with JWT tokens automatically handled by the client library.

```javascript
import { supabase } from '@/lib/supabase';

// Authentication is handled automatically
const { data, error } = await supabase.auth.getSession();
```

---

## Auth Endpoints

### Sign Up

Create a new user account with automatic role assignment.

**Method:** `supabase.auth.signUp()`

**Example:**
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe'
    }
  }
});
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "user_metadata": {
      "full_name": "John Doe"
    }
  },
  "session": {
    "access_token": "jwt...",
    "refresh_token": "..."
  }
}
```

**Auto-Role Assignment:**
- Email contains "admin" → `success_mgr`
- Email contains "committee" → `committee_member`
- Default → `entrepreneur`

### Sign In

Authenticate with email and password.

**Method:** `supabase.auth.signInWithPassword()`

**Example:**
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

**Response:**
```json
{
  "user": { "id": "uuid", "email": "..." },
  "session": { "access_token": "jwt..." }
}
```

### Get Current User

Get authenticated user profile.

**Method:** `supabase.auth.getUser()` + `supabase.from('profiles').select()`

**Example:**
```javascript
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "entrepreneur",
  "avatar_url": null,
  "updated_at": "2026-02-17T00:00:00Z"
}
```

### Sign Out

End user session.

**Method:** `supabase.auth.signOut()`

**Example:**
```javascript
const { error } = await supabase.auth.signOut();
```

---

## Ventures (Applications) Endpoints

### List Ventures

Get all ventures (filtered by RLS policies).

**Method:** `supabase.from('ventures').select()`

**Example:**
```javascript
// Entrepreneurs see only their ventures
// Staff see all ventures
const { data, error } = await supabase
  .from('ventures')
  .select('*')
  .order('created_at', { ascending: false });
```

**Response:**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "name": "Punjab Organic Exports",
    "founder_name": "Rajesh Kumar",
    "description": "Organic basmati rice exports",
    "location": "Punjab, Haryana",
    "city": "Amritsar",
    "revenue_12m": "₹5 Crores",
    "full_time_employees": "25",
    "growth_focus": "product,geography",
    "revenue_potential_3y": "₹20 Crores",
    "min_investment": "₹75 Lakhs",
    "status": "Submitted",
    "program": "Accelerate",
    "created_at": "2026-02-17T00:00:00Z"
  }
]
```

### Create Venture Application

Submit a new venture application.

**Method:** `supabase.from('ventures').insert()`

**Example:**
```javascript
const { data, error } = await supabase.from('ventures').insert({
  user_id: user.id,
  name: formData.ventureName,
  founder_name: formData.founderName,
  description: `${formData.whatDoYouSell} • ${formData.whoDoYouSellTo}`,
  location: formData.regionsCovered,
  city: formData.city,
  revenue_12m: formData.currentRevenue,
  full_time_employees: formData.teamSize,
  program: 'Accelerate',
  status: 'Submitted',
  growth_focus: formData.growthFocus,
  revenue_potential_3y: formData.revenuePotential,
  min_investment: formData.investment,
  incremental_hiring: formData.incrementalHiring,
  blockers: formData.blockers,
  support_request: formData.supportRequest,
  growth_current: {
    product: formData.whatDoYouSell,
    segment: formData.whoDoYouSellTo,
    geography: formData.regionsCovered
  },
  growth_target: {
    product: formData.focusProduct,
    segment: formData.focusSegment,
    geography: formData.focusGeography
  }
}).select();
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Punjab Organic Exports",
  "status": "Submitted",
  "created_at": "2026-02-17T00:00:00Z"
}
```

### Get Venture by ID

Retrieve a specific venture.

**Method:** `supabase.from('ventures').select().eq('id', id).single()`

**Example:**
```javascript
const { data, error } = await supabase
  .from('ventures')
  .select('*')
  .eq('id', ventureId)
  .single();
```

### Update Venture

Update venture details (VSM/Committee use).

**Method:** `supabase.from('ventures').update()`

**Example:**
```javascript
const { data, error } = await supabase
  .from('ventures')
  .update({
    status: 'In Review',
    vsm_notes: 'Strong application with clear market opportunity',
    program_recommendation: 'Accelerate Core'
  })
  .eq('id', ventureId)
  .select();
```

---

## Venture Streams Endpoints

### Get Streams for Venture

Retrieve all streams for a venture.

**Method:** `supabase.from('venture_streams').select()`

**Example:**
```javascript
const { data, error } = await supabase
  .from('venture_streams')
  .select('*')
  .eq('venture_id', ventureId);
```

**Response:**
```json
[
  {
    "id": "uuid",
    "venture_id": "uuid",
    "stream_name": "Money & Capital",
    "status": "Need deep support",
    "owner": null,
    "end_date": null,
    "end_output": null,
    "sprint_deliverable": null,
    "created_at": "2026-02-17T00:00:00Z"
  }
]
```

### Create/Update Stream

Add or update a venture stream.

**Method:** `supabase.from('venture_streams').insert()` or `.update()`

**Example:**
```javascript
const { data, error } = await supabase
  .from('venture_streams')
  .insert({
    venture_id: ventureId,
    stream_name: 'Money & Capital',
    status: 'Need deep support'
  })
  .select();
```

---

## Support Hours Endpoints

### Get Support Hours

Retrieve support hours allocation for a venture.

**Method:** `supabase.from('support_hours').select()`

**Example:**
```javascript
const { data, error } = await supabase
  .from('support_hours')
  .select('*')
  .eq('venture_id', ventureId)
  .single();
```

**Response:**
```json
{
  "id": "uuid",
  "venture_id": "uuid",
  "allocated": 120,
  "used": 35,
  "balance": 85,
  "last_updated_at": "2026-02-17T00:00:00Z"
}
```

### Update Support Hours

Allocate or update support hours.

**Method:** `supabase.from('support_hours').upsert()`

**Example:**
```javascript
const { data, error } = await supabase
  .from('support_hours')
  .upsert({
    venture_id: ventureId,
    allocated: 120,
    used: 0
  })
  .select();
```

---

## Milestones Endpoints

### Get Milestones

Retrieve milestones for a venture.

**Method:** `supabase.from('venture_milestones').select()`

**Example:**
```javascript
const { data, error } = await supabase
  .from('venture_milestones')
  .select('*')
  .eq('venture_id', ventureId)
  .order('due_date', { ascending: true });
```

**Response:**
```json
[
  {
    "id": "uuid",
    "venture_id": "uuid",
    "category": "Market Entry",
    "description": "Obtain EU organic certifications",
    "status": "Pending",
    "due_date": "2026-05-17",
    "created_at": "2026-02-17T00:00:00Z"
  }
]
```

### Create Milestone

Add a new milestone.

**Method:** `supabase.from('venture_milestones').insert()`

**Example:**
```javascript
const { data, error } = await supabase
  .from('venture_milestones')
  .insert({
    venture_id: ventureId,
    category: 'Revenue',
    description: 'Achieve ₹10Cr revenue',
    status: 'Pending',
    due_date: '2027-02-17'
  })
  .select();
```

---

## Programs Endpoints

### List Programs

Get all available programs.

**Method:** `supabase.from('programs').select()`

**Example:**
```javascript
const { data, error } = await supabase
  .from('programs')
  .select('*')
  .order('name');
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Accelerate Prime",
    "description": "For early stage ventures",
    "created_at": "2026-02-17T00:00:00Z"
  },
  {
    "id": "uuid",
    "name": "Accelerate Core",
    "description": "For growth stage ventures",
    "created_at": "2026-02-17T00:00:00Z"
  }
]
```

---

## Venture History Endpoints

### Get History

Retrieve status change history for a venture.

**Method:** `supabase.from('venture_history').select()`

**Example:**
```javascript
const { data, error } = await supabase
  .from('venture_history')
  .select('*')
  .eq('venture_id', ventureId)
  .order('changed_at', { ascending: false });
```

**Response:**
```json
[
  {
    "id": "uuid",
    "venture_id": "uuid",
    "previous_status": "Submitted",
    "new_status": "In Review",
    "changed_by": "uuid",
    "changed_at": "2026-02-17T00:00:00Z",
    "notes": "Moved to VSM screening"
  }
]
```

---

## Row Level Security (RLS) Policies

All tables have RLS enabled with the following access patterns:

### Entrepreneurs
- **ventures**: Can view/insert/update their own ventures only
- **venture_streams**: Can view/insert/update streams for their ventures
- **support_hours**: Can view their own support hours
- **venture_milestones**: Can view milestones for their ventures

### Success Managers & Committee Members
- **ventures**: Can view/update ALL ventures
- **venture_streams**: Can view/update ALL streams
- **support_hours**: Can view/update ALL support hours
- **venture_milestones**: Can view/create/update ALL milestones

### All Users
- **profiles**: Can view all profiles, update only their own
- **programs**: Read-only access to all programs

---

## Error Handling

Supabase returns errors in this format:

```json
{
  "error": {
    "message": "Description of the error",
    "code": "ERROR_CODE",
    "details": "Additional details"
  }
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| `PGRST116` | Row not found |
| `PGRST204` | Column not found in schema |
| `23505` | Unique constraint violation |
| `23503` | Foreign key violation |
| `42501` | Insufficient privileges (RLS) |

---

## Realtime Subscriptions

Subscribe to real-time changes on tables.

**Example:**
```javascript
const channel = supabase
  .channel('ventures-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'ventures'
    },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

---

## Data Models

### Venture Application

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | text | Yes | Company name |
| founder_name | text | No | Founder/owner name |
| description | text | No | Business description |
| location | text | No | Geographic coverage |
| city | text | No | Primary city |
| revenue_12m | text | No | Current annual revenue |
| full_time_employees | text | No | Team size |
| growth_focus | text | No | Growth areas (comma-separated) |
| revenue_potential_3y | text | No | 3-year revenue projection |
| min_investment | text | No | Investment needed |
| incremental_hiring | text | No | Hiring plans |
| blockers | text | No | Current challenges |
| support_request | text | No | Specific support needs |
| growth_current | jsonb | No | Current state (product/segment/geography) |
| growth_target | jsonb | No | Target state (product/segment/geography) |
| status | text | No | Application status (default: 'Submitted') |
| program | text | No | Selected program |

### Profile

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | uuid | Yes | User ID (references auth.users) |
| full_name | text | No | User's full name |
| role | text | No | User role (entrepreneur, success_mgr, committee_member) |
| avatar_url | text | No | Profile picture URL |

### Venture Stream

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| venture_id | uuid | Yes | Reference to venture |
| stream_name | text | Yes | Stream name |
| owner | text | No | Stream owner |
| status | text | No | Stream status |
| end_date | text | No | Target completion date |
| end_output | text | No | Expected output |
| sprint_deliverable | text | No | Sprint deliverable |

---

## Example Workflows

### 1. Submit Venture Application

```javascript
// 1. Get authenticated user
const { data: { user } } = await supabase.auth.getUser();

// 2. Insert venture
const { data: venture, error } = await supabase.from('ventures').insert({
  user_id: user.id,
  name: 'My Venture',
  founder_name: 'John Doe',
  // ... other fields
  status: 'Submitted'
}).select().single();

// 3. Insert streams
const streams = ['Money & Capital', 'Product & Strategy', /* ... */];
const streamData = streams.map(stream => ({
  venture_id: venture.id,
  stream_name: stream,
  status: 'No help needed'
}));

await supabase.from('venture_streams').insert(streamData);

// 4. Initialize support hours
await supabase.from('support_hours').insert({
  venture_id: venture.id,
  allocated: 0,
  used: 0
});
```

### 2. VSM Screening Workflow

```javascript
// 1. Get venture details
const { data: venture } = await supabase
  .from('ventures')
  .select('*, venture_streams(*)')
  .eq('id', ventureId)
  .single();

// 2. Update venture with VSM notes
await supabase
  .from('ventures')
  .update({
    status: 'VSM Review',
    vsm_notes: 'Strong application...',
    program_recommendation: 'Accelerate Core'
  })
  .eq('id', ventureId);

// 3. Record history
await supabase.from('venture_history').insert({
  venture_id: ventureId,
  previous_status: 'Submitted',
  new_status: 'VSM Review',
  changed_by: user.id,
  notes: 'Moved to VSM screening'
});
```

### 3. Committee Approval

```javascript
// 1. Update venture status
await supabase
  .from('ventures')
  .update({
    status: 'Approved',
    committee_decision: 'Approved for Accelerate Core',
    committee_feedback: 'Strong potential...'
  })
  .eq('id', ventureId);

// 2. Allocate support hours
await supabase
  .from('support_hours')
  .update({
    allocated: 120
  })
  .eq('venture_id', ventureId);

// 3. Create milestones
const milestones = [
  { category: 'Market Entry', description: '...', due_date: '2026-05-17' },
  // ...
];
await supabase.from('venture_milestones').insert(
  milestones.map(m => ({ ...m, venture_id: ventureId }))
);
```

---

## Client Library Setup

```javascript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## Support

For database schema details, see [`fresh_supabase_setup.sql`](../fresh_supabase_setup.sql)

For architecture overview, see [`ARCHITECTURE.md`](./ARCHITECTURE.md)

For setup instructions, see [`README.md`](../README.md)
