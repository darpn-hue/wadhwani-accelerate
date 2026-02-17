# Assisted Venture Growth Platform

A comprehensive platform designed to help rural ventures scale by providing AI-driven insights, expert connections, and a structured growth acceleration program. This platform connects Entrepreneurs, Success Managers, and Committee Members in a seamless ecosystem.

---

## 🚀 Features

### For Entrepreneurs (Ventures)
- **Venture Application**: 4-step wizard for submitting venture details (Business, Growth Plans, Status & Needs, Support Request)
- **My Ventures Dashboard**: Track application status and view feedback
- **Venture Workbench**: Post-approval dashboard to track Milestones, Support Hours, and Venture Streams
- **Agreement Management**: Digital review and signing of partnership agreements

### For Success Managers
- **VSM Dashboard**: Unified view of all venture applications
- **AI Analysis**: Automated "Deep Dive" insights generating summaries, red flags, and interview questions
- **Triage & Notes**: Tools to evaluate and move ventures through the pipeline
- **Screening Workflow**: Comprehensive review and recommendation system

### For Committee Members
- **Committee Dashboard**: High-level view for decision making
- **Agreement Generation**: AI-assisted generation of custom milestone agreements
- **Approval Workflow**: Formal approval process with "Tier Override" capabilities

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS
- **Backend & Database**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: React Context, Local State
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Deployment**: Netlify

---

## 📂 Project Structure

```bash
src/
├── components/         # Reusable UI components
│   ├── ui/             # Atomic components (Button, Input, Card)
│   └── ...             # Feature-specific components
├── context/            # React Context providers (Auth, etc.)
├── lib/                # Library configurations (Supabase client)
├── pages/              # Main page views (Dashboards, Wizards)
├── layouts/            # Layout components (VSM, Committee)
├── App.tsx             # Main entry point with Routing
└── main.tsx            # DOM rendering
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn
- A Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/vpx-pro/wadhwani-assisted-platform.git
cd wadhwani-assisted-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### Create a New Supabase Project
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details and create

#### Run the Database Schema
1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **"New Query"**
4. Copy the entire contents of [`fresh_supabase_setup.sql`](./fresh_supabase_setup.sql)
5. Paste into the SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. Wait for "Success. No rows returned"

#### Verify Tables Created
Go to **Table Editor** and confirm you see:
- `profiles` - User profiles and roles
- `ventures` - Main venture applications
- `programs` - Available programs (should have 5 rows)
- `venture_milestones` - Milestone tracking
- `venture_streams` - Stream status tracking
- `support_hours` - Support hour allocation
- `venture_history` - Status change history

### 4. Configure Environment Variables

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Disable Email Confirmation (For Development)

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Scroll to **"Email Auth"** section
3. **Toggle OFF** "Enable email confirmations"
4. Click **Save**

This allows instant signup without email verification during development.

### 6. Run Development Server

```bash
npm run dev
```

Access the app at **http://localhost:5173**

---

## 🧪 Testing the Application

### Create Test Accounts

The platform auto-assigns roles based on email patterns:

**Entrepreneur Account:**
```
Email: test@example.com
Password: Test123!
Name: Test Entrepreneur
Role: entrepreneur (auto-assigned)
```

**Success Manager Account:**
```
Email: admin@example.com
Password: Admin123!
Name: Test Admin
Role: success_mgr (auto-assigned because email contains "admin")
```

**Committee Member Account:**
```
Email: committee@example.com
Password: Committee123!
Name: Test Committee
Role: committee_member (auto-assigned because email contains "committee")
```

### Test the Complete Workflow

1. **As Entrepreneur:**
   - Login with test@example.com
   - Click "Apply Now"
   - Fill out all 4 steps of the application
   - Submit the venture

2. **Verify in Supabase:**
   - Go to Table Editor → `ventures`
   - Check that your venture data is saved
   - Go to `venture_streams` table
   - Verify stream statuses are recorded

3. **As Success Manager:**
   - Login with admin@example.com
   - View submitted ventures in VSM Dashboard
   - Test screening workflow
   - Add notes and recommendations

4. **As Committee Member:**
   - Login with committee@example.com
   - View ventures in committee review
   - Test approval workflow

---

## 📚 Documentation

- **[Setup Guide](./FRESH_SUPABASE_SETUP_GUIDE.md)** - Detailed Supabase setup instructions
- **[Quick Checklist](./QUICK_SETUP_CHECKLIST.md)** - Quick reference for setup steps
- **[Email Fix](./FIX_EMAIL_RATE_LIMIT.md)** - Fix email rate limit issues
- **[Architecture](./docs/ARCHITECTURE.md)** - System architecture overview
- **[AI Prompts](./docs/ai-prompts/)** - AI prompt templates for consistent AI features
- **[Contributing](./CONTRIBUTING.md)** - Contribution guidelines

---

## 🗄️ Database Schema

The platform uses the following main tables:

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles with role-based access (entrepreneur, success_mgr, committee_member) |
| `ventures` | Main venture applications with all form data |
| `programs` | Available programs (Accelerate Prime, Core, Select, Ignite, Liftoff) |
| `venture_milestones` | Milestone tracking for each venture |
| `venture_streams` | Stream status (Money & Capital, Product & Strategy, etc.) |
| `support_hours` | Support hour allocation and tracking |
| `venture_history` | Audit trail of status changes |

All tables have Row Level Security (RLS) policies configured for proper access control.

---

## 🔐 Security

- **Row Level Security (RLS)**: All tables have RLS policies
- **Role-Based Access**: Automatic role assignment based on email
- **Secure Authentication**: Powered by Supabase Auth
- **Data Isolation**: Users can only access their own data (except staff)

---

## 🚀 Deployment

### Deploy to Netlify

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)

3. **Enable email confirmation:**
   - In Supabase Dashboard, enable email confirmations
   - Configure custom SMTP for production (optional)

---

## 🐛 Troubleshooting

### Email Rate Limit Exceeded
See [FIX_EMAIL_RATE_LIMIT.md](./FIX_EMAIL_RATE_LIMIT.md) for solutions.

### Can't Connect to Supabase
- Verify `.env` file has correct URL and key
- Restart dev server (`npm run dev`)
- Clear browser cache

### SQL Errors
- Ensure you copied the entire `fresh_supabase_setup.sql` file
- Run in Supabase SQL Editor, not terminal
- Check for any existing tables that might conflict

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🎯 What's New

### Latest Updates
- ✅ Complete 4-step venture application form
- ✅ Growth focus tracking (Product/Segment/Geography)
- ✅ Founder name field added
- ✅ Fresh Supabase setup with consolidated schema
- ✅ Comprehensive RLS policies
- ✅ Auto-role assignment based on email
- ✅ Complete VSM and Committee workflows

---

## 📞 Support

For issues or questions:
1. Check the [documentation files](./docs/)
2. Review [troubleshooting section](#-troubleshooting)
3. Open an issue on GitHub

---

**Built with ❤️ for rural venture growth**
