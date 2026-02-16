# System Architecture

## Overview
The Assisted Venture Growth Platform is a modern Single Page Application (SPA) built with React and TypeScript, leveraging Supabase for its backend-as-a-service (BaaS) capabilities. The architecture emphasizes modularity, type safety, and real-time data synchronization.

## 🏗️ High-Level Design

```mermaid
graph TD
    User[User (Browser)] -->|HTTPS| CDN[Netlify CDN]
    CDN -->|Serves| SPA[React SPA]
    
    SPA -->|Data/Auth| Supabase[Supabase Project]
    
    subgraph Supabase
        Auth[GoTrue Auth]
        DB[(PostgreSQL)]
        Realtime[Realtime Engine]
        Storage[File Storage]
    end
    
    SPA -->|State| Context[React Context]
```

## 🧩 Key Components

### 1. Frontend Application (`src/`)
-   **Framework**: React 18 with Vite for fast HMR and optimized builds.
-   **Routing**: `react-router-dom` v6 for client-side routing.
-   **Styling**: Tailwind CSS for utility-first styling, ensuring consistency and rapid development.
-   **State Management**:
    -   **AuthContext**: Manages user session and role-based access.
    -   **Local State**: `useState` / `useReducer` for form handling and UI toggles.
    -   **Server State**: Direct Supabase client calls (effectively serving as server state manager).

### 2. Backend Services (Supabase)
-   **Authentication**: Handles user sign-up/login (Email/Password).
-   **Database**: PostgreSQL with strong consistency.
-   **Security**: Row Level Security (RLS) is the primary enforcement mechanism for data access control.
    -   *Example*: A user can only view ventures they created (unless they are admin/staff).

## 🔄 Data Flow

1.  **Authentication Flow**:
    -   User logs in -> Supabase returns JWT.
    -   JWT is stored in `localStorage`.
    -   `AuthContext` updates user state.
    
2.  **App Submission Flow**:
    -   User fills form -> Data validated in React.
    -   `handleSubmit` calls `supabase.from('ventures').insert()`.
    -   RLS Policy checks `auth.uid()` match.
    -   On success, redirect to Dashboard.

3.  **Roles & Permissions**:
    -   Roles are stored in `public.profiles` table: `entrepreneur`, `success_mgr`, `committee_member`, `admin`.
    -   Frontend uses `useAuth()` hook to conditionally render UI elements based on role.
    -   Backend (Postgres) uses RLS policies to enforce these roles at the data layer.

## 📐 Design Decisions

| Decision | Choice | Rationale |
| :--- | :--- | :--- |
| **BaaS vs Custom Backend** | Supabase | Speed to market, built-in Auth/DB/Realtime, reduced DevOps overhead. |
| **CSS Framework** | Tailwind | Rapid UI development, consistent design system tokens. |
| **Type System** | TypeScript | Prevents runtime errors, improves developer experience with autocomplete. |
| **Route Protection** | Wrapper Comp | ProtectedRoute component checks auth status before reason child routes. |

## 🔮 Future Architecture Evolution

While the current Supabase-centric architecture provides rapid development and scalability, future requirements may necessitate a dedicated backend layer.

### Transition to Node.js Backend

As the platform grows, we may introduce a **Node.js / Express / NestJS** service between the Client and the Database.

#### Triggers for Migration
1.  **Complex Business Logic**: If validation or processing logic exceeds what is comfortable in RLS policies or Database Functions.
2.  **Third-Party Integrations**: Need to securely handle webhooks (e.g., Stripe, sophisticated AI providers) or detailed logging/auditing.
3.  **Rate Limiting & Caching**: Custom API gateway requirements for high-traffic scenarios.

#### Proposed Hybrid Architecture
-   **Auth**: Continue using Supabase Auth (GoTrue).
-   **Data Access**:
    -   *Reads*: Client can still read public/safe data directly via Supabase for performance.
    -   *Writes*: Sensitive mutations routed through Node.js API.
-   **Migration Strategy**:
    1.  Maintain the current database schema.
    2.  Disable RLS write policies for client roles.
    3.  Create API endpoints that perform the logic and write to DB using a `service_role` key.

