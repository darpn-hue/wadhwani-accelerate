# AccelerateMentor Workbench

The Assisted Venture Growth Platform. From application to execution, we help you scale your venture with AI-driven insights and expert connections.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation

1. Clone the repository (if applicable) or navigate to the project directory.
2. Install dependencies:

```bash
npm install
```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

To build the application for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

- `src/components/ui`: Reusable UI components (e.g., Button).
- `src/pages`: Page components (e.g., Welcome, Committee Dashboard).
- `src/App.tsx`: Main application component with routing.

## Database Setup (Supabase)

This project requires a Supabase backend.

1. **Create a Supabase Project**.
2. **Run the SQL Schema**:
   - Go to the SQL Editor in your Supabase dashboard.
   - Copy the contents of `supabase_schema.sql` from this repository.
   - Run the script. This will create all necessary tables (including `ventures`, `venture_milestones`, `venture_streams`) and apply Row Level Security (RLS) policies.

## Key Modules

### 1. Venture Application & Dashboard
- Entrepreneurs can sign up, create a profile, and submit a venture application.
- `My Ventures` dashboard to track status.
- **New**: `Venture Workbench` for accepted ventures to view milestones, streams, and support hours.

### 2. Success Manager Dashboard (VSM)
- Success Managers can view all applications, perform AI analysis, and triage ventures.
- Uses `VSMDashboard.tsx` and `VentureDetails.tsx`.

### 3. Committee Dashboard [NEW]
- Committee members can review high-potential ventures.
- AI-assisted agreement generation (`CommitteeDashboard.tsx`).
- Approve/Reject workflows with automatic agreement status updates.

## Demo Accounts & Testing

To test the application, you can use the following demo flows:

### 1. Entrepreneur Flow (Applying for a Program)
- **Role**: Entrepreneur
- **Action**: Use the **"Entrepreneur"** button on the Login page.
- **Credentials**:
  - **Email**: `rajesh@example.com`
  - **Password**: `password`
- **Goal**: Log in, view "My Ventures" (empty initially), and click "New Application" to submit a venture.

### 2. Success Manager Flow (Reviewing Applications)
- **Role**: Success Manager / Admin
- **Action**: Use the **"Success Mgr"** button on the Login page.
- **Credentials**:
  - **Email**: `meetul@admin.com`
  - **Password**: `admin`
- **Goal**: Log in, view the dashboard with ALL submitted ventures, select one, run AI analysis, and submit triage notes.

> **Note**: For the "Success Manager" role to work efficiently with real data in production, you must manually update the user's role in the `profiles` table from `entrepreneur` to `success_mgr` or `admin`. The demo button bypasses this check for testing convenience.

### New User Signup
You can also freely Sign Up with any email/password.
- By default, new users are assigned the `entrepreneur` role.
- To test the Success Manager flow with a *new* signup, you must go to your Supabase `profiles` table and manually change the `role` column to `success_mgr`.
