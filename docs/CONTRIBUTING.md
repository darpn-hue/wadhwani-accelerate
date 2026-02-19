# Contributing to Wadhwani Ventures Platform

Thank you for your interest in contributing! This document outlines the development standards, workflows, and best practices for this project.

---

## 🚧 Development Workflow

### 1. Fork & Clone
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/wadhwani-accelerate.git
cd wadhwani-accelerate
```

### 2. Set Up Development Environment

**Prerequisites:**
- Node.js 20+
- npm or yarn
- Supabase account
- Git

**Install Dependencies:**
```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

**Environment Variables:**

Create `.env` in project root:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3001
```

Create `.env` in `backend/`:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
JWT_SECRET=your_jwt_secret
PORT=3001
```

**Run Database Migrations:**
1. Go to Supabase Dashboard → SQL Editor
2. Run `fresh_supabase_setup.sql`
3. Run `vsm_schema_migration.sql`

### 3. Create a Feature Branch

Use descriptive branch names:
```bash
# Feature
git checkout -b feature/add-email-notifications

# Bug Fix
git checkout -b fix/vsm-dashboard-loading

# Documentation
git checkout -b docs/update-api-guide

# Refactor
git checkout -b refactor/optimize-queries
```

### 4. Development

**Run Development Servers:**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backend
npm run dev
```

**Frontend:** http://localhost:5173
**Backend:** http://localhost:3001

### 5. Testing

**Frontend Tests:**
```bash
npm run test              # Run unit tests
npm run test:coverage     # With coverage report
```

**Backend Tests:**
```bash
cd backend
npm run test
```

**E2E Tests:**
```bash
npm run test:e2e
```

### 6. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat: add email notification system"
git commit -m "feat(vsm): add AI analysis generation"

# Bug Fixes
git commit -m "fix: resolve venture status update issue"
git commit -m "fix(auth): handle expired token edge case"

# Documentation
git commit -m "docs: update API endpoint documentation"

# Refactoring
git commit -m "refactor: optimize venture query performance"

# Styling
git commit -m "style: format code with prettier"

# Chores (deps, configs)
git commit -m "chore: update dependencies"
```

### 7. Push & Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- **Title**: Clear, concise summary (< 70 characters)
- **Description**: Explain what changed and why
- **Screenshots**: If UI changes
- **Related Issues**: Link any related issues

---

## 📐 Coding Standards

### TypeScript & React

**Strict Typing:**
```typescript
// ❌ Avoid
const data: any = fetchData();

// ✅ Prefer
interface Venture {
  id: string;
  name: string;
  status: 'draft' | 'Submitted' | 'Under Review';
}
const data: Venture = fetchData();
```

**Functional Components:**
```typescript
// ✅ Use functional components with TypeScript
interface Props {
  ventureName: string;
  onSubmit: () => void;
}

export const VentureCard: React.FC<Props> = ({ ventureName, onSubmit }) => {
  return (
    <div>
      <h2>{ventureName}</h2>
      <button onClick={onSubmit}>Submit</button>
    </div>
  );
};
```

**Hooks Best Practices:**
```typescript
// Group related state
const [formData, setFormData] = useState({
  name: '',
  description: '',
  status: 'draft'
});

// Use custom hooks for reusable logic
const useVentureData = (ventureId: string) => {
  const [loading, setLoading] = useState(true);
  const [venture, setVenture] = useState<Venture | null>(null);

  useEffect(() => {
    fetchVenture(ventureId).then(setVenture).finally(() => setLoading(false));
  }, [ventureId]);

  return { venture, loading };
};
```

**Component Organization:**
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

// 2. Types
interface Props {
  ventureId: string;
}

// 3. Component
export const VentureDetails: React.FC<Props> = ({ ventureId }) => {
  // 4. Hooks
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // 5. Effects
  useEffect(() => {
    // ...
  }, [ventureId]);

  // 6. Handlers
  const handleSubmit = () => {
    // ...
  };

  // 7. Render
  return <div>{/* ... */}</div>;
};
```

### Styling with Tailwind CSS

**Use utility classes:**
```tsx
// ✅ Good
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Submit
</button>

// ❌ Avoid inline styles
<button style={{ padding: '8px 16px', background: 'blue' }}>
  Submit
</button>
```

**Extract common patterns:**
```tsx
// For repeated styles, use constants
const BUTTON_CLASSES = 'px-4 py-2 rounded-lg font-medium transition-colors';

<button className={`${BUTTON_CLASSES} bg-blue-600 text-white hover:bg-blue-700`}>
  Primary
</button>
<button className={`${BUTTON_CLASSES} bg-gray-200 text-gray-900 hover:bg-gray-300`}>
  Secondary
</button>
```

### Backend (Express + TypeScript)

**Route Structure:**
```typescript
// routes/ventures.ts
router.get(
  '/',
  authenticateUser,          // Middleware
  validateQuery(schema),     // Validation
  async (req, res, next) => { // Handler
    try {
      const result = await ventureService.getVentures(/* ... */);
      successResponse(res, result);
    } catch (error) {
      next(error);  // Pass to error handler
    }
  }
);
```

**Service Layer:**
```typescript
// services/ventureService.ts
export async function getVentures(
  supabase: SupabaseClient,
  userId: string,
  role: string,
  filters: VentureQueryParams
) {
  let query = supabase.from('ventures').select('*');

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return { ventures: data };
}
```

**Validation with Zod:**
```typescript
import { z } from 'zod';

export const createVentureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  revenue_12m: z.number().nonnegative(),
  status: z.enum(['draft', 'Submitted', 'Under Review']).default('draft')
});

export type CreateVentureInput = z.infer<typeof createVentureSchema>;
```

### Database (Supabase / PostgreSQL)

**Naming Conventions:**
- **Tables**: `snake_case`, plural (e.g., `ventures`, `venture_streams`)
- **Columns**: `snake_case` (e.g., `full_name`, `created_at`)
- **Foreign Keys**: `table_id` (e.g., `user_id`, `venture_id`)

**RLS Policies Are Mandatory:**
```sql
-- Every table MUST have RLS enabled
ALTER TABLE ventures ENABLE ROW LEVEL SECURITY;

-- Define clear policies
CREATE POLICY "Users can view own ventures"
ON ventures FOR SELECT
USING (user_id = auth.uid());
```

**Migrations:**
- Place new migrations in `scripts/` directory
- Name with timestamp: `2026_02_20_add_email_field.sql`
- Include both UP and DOWN operations (if possible)

---

## 🧪 Testing Guidelines

### Frontend Tests

**Component Tests:**
```typescript
import { render, screen } from '@testing-library/react';
import { VentureCard } from './VentureCard';

test('displays venture name', () => {
  render(<VentureCard ventureName="TechCo" />);
  expect(screen.getByText('TechCo')).toBeInTheDocument();
});
```

**Hook Tests:**
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useVentureData } from './useVentureData';

test('fetches venture data', async () => {
  const { result } = renderHook(() => useVentureData('123'));

  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });

  expect(result.current.venture).toBeDefined();
});
```

### Backend Tests

**API Tests:**
```typescript
import request from 'supertest';
import app from '../app';

describe('GET /api/ventures', () => {
  it('returns ventures for authenticated user', async () => {
    const response = await request(app)
      .get('/api/ventures')
      .set('Authorization', `Bearer ${validToken}`);

    expect(response.status).toBe(200);
    expect(response.body.ventures).toBeInstanceOf(Array);
  });
});
```

---

## 🎯 Pull Request Guidelines

### Before Submitting

- [ ] Code builds without errors (`npm run build`)
- [ ] All tests pass (`npm run test`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Code is formatted (`npm run format`)
- [ ] Documentation updated (if API/behavior changed)
- [ ] Commit messages follow Conventional Commits
- [ ] Branch is up to date with `main`

### PR Description Template

```markdown
## 🎯 What does this PR do?
Brief description of the changes.

## 🔗 Related Issues
Closes #123

## 🧪 How to test
1. Step one
2. Step two
3. Expected result

## 📸 Screenshots (if applicable)
[Add screenshots for UI changes]

## ✅ Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

---

## 🌟 Best Practices

### General

1. **Keep it Simple**: Don't over-engineer solutions
2. **DRY Principle**: Don't Repeat Yourself
3. **YAGNI**: You Aren't Gonna Need It (avoid premature optimization)
4. **Meaningful Names**: Use descriptive variable/function names
5. **Small Commits**: Commit often with focused changes
6. **Code Comments**: Explain _why_, not _what_ (code shows what)

### Security

- ✅ **ALWAYS** validate user input (frontend + backend)
- ✅ **NEVER** commit secrets (.env files)
- ✅ **USE** parameterized queries (Supabase handles this)
- ✅ **ENABLE** RLS on all tables
- ✅ **VERIFY** user permissions before mutations

### Performance

- Avoid N+1 queries (use `.select()` with joins)
- Use pagination for large datasets
- Optimize images (compress, use WebP)
- Lazy load routes (`React.lazy()`)
- Memoize expensive computations (`useMemo`, `useCallback`)

### Accessibility

- Use semantic HTML (`<button>` not `<div onClick>`)
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios (WCAG AA)

---

## 📚 Resources

- [React 19 Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## 🆘 Need Help?

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Review [API.md](./API.md) for endpoint documentation
- Read [README.md](../README.md) for setup instructions
- Ask questions in GitHub Discussions
- Open an issue for bugs

---

## 📜 Code of Conduct

- Be respectful and constructive
- Welcome newcomers
- Focus on the code, not the person
- Assume good intentions
- Help others learn

---

Thank you for contributing to Wadhwani Ventures! 🎉

**Built with ❤️ for rural venture growth**
