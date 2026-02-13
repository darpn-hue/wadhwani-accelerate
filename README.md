# Assisted Venture Growth Platform

The **Assisted Venture Growth Platform** is a comprehensive solution designed to help rural ventures scale by providing AI-driven insights, expert connections, and a structured growth acceleration program. This platform connects Entrepreneurs, Success Managers, and Committee Members in a seamless ecosystem.

## 🚀 Features

### For Entrepreneurs (Ventures)
- **Venture Application**: Streamlined wizard for submitting venture details (Business, Financials, Team).
- **My Ventures Dashboard**: Track application status and view feedback.
- **Venture Workbench**: Post-approval dashboard to track Milestones, Support Hours, and Venture Streams.
- **Agreement Management**: Digital review and signing of partnership agreements.

### For Success Managers
- **VSM Dashboard**: Unified view of all venture applications.
- **AI Analysis**: Automated "Deep Dive" insights generating summaries, red flags, and interview questions.
- **Triage & Notes**: Tools to evaluate and move ventures through the pipeline.

### For Committee Members
- **Committee Dashboard**: High-level view for decision making.
- **Agreement Generation**: AI-assisted generation of custom milestone agreements.
- **Approval Workflow**: Formal approval process with "Tier Override" capabilities.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS
- **Backend & Database**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: React Context, Local State
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Deployment**: Netlify

## 📂 Project Structure

```bash
src/
├── components/         # Reusable UI components
│   ├── ui/             # Atomic components (Button, Input, Card)
│   └── ...             # Feature-specific components
├── lib/                # Library configurations (Supabase client)
├── pages/              # Main page views (Dashboards, Wizards)
├── App.tsx             # Main entry point with Routing
└── main.tsx            # DOM rendering
```

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+)
- npm
- A Supabase Project (See Database Setup)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vpx-pro/wadhwani-assisted-platform.git
   cd wadhwani-assisted-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173`.

## 🗄️ Database Setup

1. Create a new Supabase project.
2. Navigate to the **SQL Editor**.
3. Copy the contents of [`supabase_schema.sql`](./supabase_schema.sql) and run it.
4. This script will:
   - Create tables: `ventures`, `profiles`, `venture_milestones`, etc.
   - Configure **Row Level Security (RLS)** policies.
   - Set up triggers and functions.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines on how to contribute to this project.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
