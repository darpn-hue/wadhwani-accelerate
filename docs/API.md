# API & Data Models

Since the application uses the Supabase Client directly, the Data Models largely reflect the PostgreSQL Schema.

## 🗄️ Database Schema

### 1. `profiles`
Links to `auth.users` to store application-specific user data.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key, references `auth.users.id`. |
| `full_name` | text | User's display name. |
| `role` | text | Enum: `entrepreneur`, `success_mgr`, `committee_member`, `admin`. |

### 2. `ventures`
Core table storing venture application data.

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key. |
| `user_id` | uuid | References `auth.users.id` (The founder). |
| `name` | text | Venture Name. |
| `description` | text | Short pitch. |
| `status` | text | `Draft`, `Submitted`, `Under Review`, `Approved`, `Rejected`. |
| `program` | text | Assigned program (e.g., 'Accelerate'). |
| `agreement_status` | text | `Draft`, `Sent`, `Signed`. |

### 3. `venture_milestones`
Milestones assigned to a venture (typically after committee approval).

| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | uuid | Primary Key. |
| `venture_id` | uuid | FK to `ventures`. |
| `category` | text | E.g., 'Financials', 'Recruitment'. |
| `description` | text | The specific milestone goal. |
| `status` | text | `Pending`, `In Progress`, `Achieved`. |
| `due_date` | date | Target completion date. |

### 4. `venture_streams`
Tracks ongoing operational streams for the venture dashboard.

| Column | Type | Description |
| :--- | :--- | :--- |
| `stream_name` | text | E.g., 'Business', 'Product'. |
| `owner` | text | Person responsible (e.g., 'Founder', 'CFO'). |
| `status` | text | `On Track`, `At Risk`, `Delayed`. |

## 🔒 Row Level Security (RLS) Policies

Access to data is strictly controlled via RLS policies in PostgreSQL.

| Table | Action | Policy | Logic |
| :--- | :--- | :--- | :--- |
| `ventures` | SELECT | **Public View Own** | Users can see their own ventures. |
| `ventures` | SELECT | **Staff View All** | Success Managers/Admins can see ALL ventures. |
| `ventures` | INSERT | **Authenticated** | Any logged-in user can create a venture. |
| `ventures` | UPDATE | **Owner Only** | Users can update their own venture if status is 'Draft'. |
| `ventures` | UPDATE | **Staff Update** | Staff can update any venture (e.g., changing status). |

> **Note**: Similar patterns apply to `venture_milestones` and `venture_streams`, ensuring founders can only see/edit their own data, while staff have broad access.
