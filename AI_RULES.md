# AI Rules for BizRent

This document outlines the core technology stack and strict rules for contributing to the BizRent codebase. All AI agents and developers must adhere to these guidelines to maintain consistency, reliability, and maintainability.

## 🚀 Tech Stack

- **Framework:** React 18 with Vite (SWC plugin) and TypeScript.
- **Routing:** React Router DOM (v6) for client-side routing.
- **Backend as a Service:** Supabase (PostgreSQL Database, Authentication, Storage, Edge Functions).
- **State Management & Data Fetching:** React Query (`@tanstack/react-query`) for remote state management.
- **Styling:** Tailwind CSS with custom brand design tokens.
- **UI Architecture:** shadcn/ui (built on Radix UI primitives).
- **Forms & Validation:** React Hook Form coupled with Zod (`@hookform/resolvers/zod`).
- **Data Visualization:** Recharts for responsive, declarative charts.
- **Icons:** Lucide React.

## 📜 Library Usage Rules

### 1. Styling & CSS
- **Rule:** **Always use Tailwind CSS for styling.** Avoid inline styles or custom CSS files unless absolutely necessary (e.g., highly specific animations).
- **Rule:** Use the `cn()` utility function from `src/lib/utils.ts` (which wraps `clsx` and `tailwind-merge`) when conditionally applying or merging Tailwind classes.
- **Rule:** Utilize the custom BizRent design tokens defined in `src/index.css` (e.g., `text-bizrent-blue`, `bg-bizrent-emerald`, `text-bizrent-amber`).

### 2. UI Components
- **Rule:** **Prefer shadcn/ui components.** Before building a new component (like a modal, dropdown, select, or accordion), check if a shadcn/ui component exists in `src/components/ui/` and use it.
- **Rule:** Use `lucide-react` for all icons to maintain a consistent visual language.
- **Rule:** Do not edit the generated files inside `src/components/ui/` unless changing a core design system behavior. Wrap them in custom components if you need domain-specific logic.

### 3. Data Fetching & State Management
- **Rule:** **Do not use `useEffect` for data fetching.**
- **Rule:** Always use React Query (`useQuery`, `useMutation`, `useQueryClient`) for all Supabase database interactions.
- **Rule:** Encapsulate all database interactions in custom hooks (e.g., `src/hooks/useSupabaseData.ts`). Components should only call these hooks, not the Supabase client directly (except for specific Auth edge-cases).

### 4. Database & Backend (Supabase)
- **Rule:** Use the centralized Supabase client exported from `src/integrations/supabase/client.ts`.
- **Rule:** Rely on the auto-generated TypeScript definitions (`Database` from `src/integrations/supabase/types.ts`) for all database typings to ensure type safety. Do not create manual interfaces for database rows if the auto-generated types can be used.

### 5. Forms & Validation
- **Rule:** Use `react-hook-form` for form state management. 
- **Rule:** For complex forms, ALWAYS use `zod` for schema validation and connect it to React Hook Form using `@hookform/resolvers/zod`. Avoid manual state-based form validation.

### 6. Error Handling & Notifications
- **Rule:** Use the custom `handleSupabaseError(error)` utility from `src/lib/handleSupabaseError.ts` to transform raw database errors into user-friendly messages.
- **Rule:** Use `sonner` (`import { toast } from 'sonner'`) for user notifications. Trigger these typically inside the `onSuccess` and `onError` callbacks of React Query mutations.

### 7. File Structure & Conventions
- **Rule:** Keep components small, focused, and under 150 lines of code if possible. Break down large components into smaller chunks.
- **Rule:** Page components go in `src/pages/` (grouped by domain like `auth/`, `landlord/`, `tenant/`).
- **Rule:** Reusable, domain-specific UI components go in `src/components/`.
- **Rule:** Generic UI components belong in `src/components/ui/`.
- **Rule:** Utility functions go in `src/lib/` or `src/utils/`.