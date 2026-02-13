# Contributing to Assisted Venture Growth Platform

Thank you for your interest in contributing! This document outlines the standards and workflows for developing on this platform.

## 🚧 Development Workflow

1.  **Fork & Clone**: Fork the repository and clone it locally.
2.  **Branching**: Create a new branch for your feature or bug fix.
    -   Feature: `feature/feature-name`
    -   Bug Fix: `fix/bug-description`
    -   Docs: `docs/update-description`
3.  **Development**: Write clean, maintainable code.
4.  **Testing**: Verify your changes locally.
5.  **Commit**: Use descriptive commit messages (Conventional Commits recommended).
    -   `feat: add new venture wizard step`
    -   `fix: resolve rls policy issue`
6.  **Push & PR**: Push to your fork and submit a Pull Request to `main`.

## 📐 Coding Standards

### TypeScript & React
-   **Strict Typing**: Avoid `any` wherever possible. Define interfaces for props and data models.
-   **Functional Components**: Use React Functional Components (`const Component = () => {}`) with Hooks.
-   **Atomic Design**: Keep components small, focused, and reusable. Place them in `src/components/ui` if generic.
-   **Tailwind CSS**: Use utility classes for styling. Avoid inline styles or separate CSS files unless necessary.

### Database (Supabase)
-   **RLS is Mandatory**: Every table must have Row Level Security enabled.
-   **Snake_case**: Use `snake_case` for table names and columns (e.g., `venture_milestones`, `created_at`).

## 📁 specific Guidelines

-   **State Management**: Use local state (`useState`) for form inputs and component-specific UI logic. Use Context features sparingly for global auth/theme state.
-   **Async Operations**: Handle loading and error states explicitly in your UI.

## 🚀 Pull Request Process

1.  Ensure your code builds without errors (`npm run build`).
2.  Update `README.md` or other docs if you changed functionality.
3.  Describe your changes clearly in the PR description.
4.  Link any related issues.

Thank you for helping us build a better platform!
