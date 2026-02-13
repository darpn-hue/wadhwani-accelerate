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
| **Route Protection** | Wrapper Comp | ProtectedRoute component checks auth status before rendering child routes. |
