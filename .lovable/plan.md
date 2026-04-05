

# BizRent — System-Aligned Frontend Rebuild Plan

## Current State Assessment

The codebase is ~80% wired to Supabase already. The key issues to fix:

1. **TopBar still imports mockData** — `mockNotifications` used for bell badge count
2. **Register page doesn't pass metadata** to `signUp()` — trigger creates broken `public.users` rows
3. **Register inserts into `organisations` directly** — but RLS blocks INSERT for `organisations` (only SELECT/UPDATE allowed)
4. **No subscription gating** — Add buttons work regardless of tier limits
5. **No error handling utility** — errors show raw Supabase messages
6. **Missing: audit_log inserts** on approve/reject, no notification polling with unread count
7. **`balance` column is GENERATED** — current code tries to SET it directly in approve flow (will fail)
8. **Types in `src/types/index.ts`** are stale mock types, not used by actual data hooks (hooks use Supabase auto-types). Harmless but messy.
9. **Pending Payments** fetches ALL payments then filters client-side — should filter server-side with `.eq('status', 'PENDING')`
10. **No file upload validation** (MIME magic bytes, 5MB limit)

## What's Already Working

- AuthContext with Supabase Auth, session persistence, role fetching
- ProtectedRoute with role-based access
- All CRUD hooks in `useSupabaseData.ts` (properties, units, tenancies, invoices, payments, receipts, notifications, audit logs, team, subscription)
- All 30 pages exist and render with Supabase data
- Brand tokens configured in Tailwind + CSS variables

## Implementation Plan (10 tasks)

### 1. Fix Register page — pass metadata, fix org creation RLS

The `organisations` table has no INSERT RLS policy for authenticated users. The `handle_new_auth_user` trigger creates the `public.users` row automatically, so the manual INSERT is redundant.

**Changes:**
- `src/pages/auth/Register.tsx`: Pass `data: { full_name, phone }` in `signUp()` options. Remove the manual `users` INSERT (trigger handles it). For `organisations` INSERT, need a **SQL migration** to add an INSERT policy allowing new OWNER users to create their org, OR use an Edge Function / database function to handle registration atomically.
- Add Zod validation (email, password min 8 chars, passwords match)

**Migration needed:** Add `organisations_insert` RLS policy for authenticated users where `user_id = auth.uid()` — or better, create a `register_organisation` database function (SECURITY DEFINER) that atomically creates org + role + subscription.

### 2. Fix TopBar — replace mock notifications with live polling

**Changes:**
- `src/components/layouts/TopBar.tsx`: Remove `mockNotifications` import. Use `useNotifications()` hook (already exists with 30s polling). Compute `unreadCount` from live data. Add notification dropdown with last 10 items and deep-link navigation.

### 3. Fix payment approval — don't SET `balance` column

**Changes:**
- `src/hooks/useSupabaseData.ts` (`useApprovePayment`): Remove `balance` from the invoice UPDATE — it's a GENERATED column. Only update `amount_paid` and `status`. Add audit_log INSERT after approval/rejection.

### 4. Fix Pending Payments — server-side filter + card layout + auto-refresh

**Changes:**
- `src/pages/landlord/PendingPayments.tsx`: Use `usePayments({ status: 'PENDING' })` instead of fetching all and filtering. Change from table to card layout per spec. Add `refetchInterval: 60000`. Add proper empty state copy.
- `src/hooks/useSupabaseData.ts`: Ensure `usePayments` with `status` filter queries server-side with ascending order by `submitted_at`.

### 5. Add file upload validation + proper flow for tenant payment submission

**Changes:**
- `src/pages/tenant/TenantInvoiceDetail.tsx`: Add MIME magic byte validation, 5MB size check, progress indicator. Check for existing PENDING payment before showing form. Handle 409 duplicate transaction ID inline (not toast).
- Create `src/lib/uploadPaymentProof.ts` utility with the validation logic from Section 12.

### 6. Add subscription tier gating

**Changes:**
- Create `src/hooks/useSubscriptionLimits.ts`: Fetch subscription tier limits, current counts, expose `canAddProperty`, `canAddUnit`, `canAddManager` booleans.
- Update `src/pages/landlord/Properties.tsx`, `Units.tsx`, `TeamManagement.tsx`: Disable Add buttons when limits reached, show upgrade tooltip.
- Create `src/components/UpgradePrompt.tsx` reusable component.

### 7. Add error handling utility

**Changes:**
- Create `src/lib/handleSupabaseError.ts` with the error mapping from Section 8.
- Update mutation `onError` callbacks in `useSupabaseData.ts` to use it.

### 8. Add subscription warning banner to landlord layout

**Changes:**
- `src/components/layouts/LandlordLayout.tsx`: Add amber banner above TopBar when subscription is TRIAL (show days remaining) or LAPSED.
- Use `useSubscription()` hook.

### 9. Fix data types and cleanup

**Changes:**
- Delete `src/data/mockData.ts` — no longer imported anywhere after TopBar fix.
- Clean up `src/types/index.ts` — keep only types actually used by components (UserRole for AuthContext). The Supabase auto-generated types handle everything else.

### 10. Polish remaining screens to spec

- **Dashboard**: Add revenue bar chart using collection summary data, occupancy donut from occupancy summary view. Add overdue invoices list.
- **Notifications page**: Deep-link click handling using `reference_type` + `reference_id`.
- **Audit Logs**: Add action type filter, diff viewer modal.
- **Reports**: Wire aging/collections/occupancy tabs to their respective view hooks (already exist).
- **Receipts**: Generate signed URL for download.

## SQL Migration Required

A single migration to:

1. Create `register_organisation()` SECURITY DEFINER function that atomically creates org + user_organisation_role + subscription
2. Add `audit_logs_insert` RLS policy for authenticated users (currently no INSERT policy)

## Technical Details

- No schema changes to existing tables
- No new tables
- 1 new database function (`register_organisation`)
- 2 new RLS policies (organisations INSERT, audit_logs INSERT)
- ~5 new utility files, ~15 file edits
- Delete 1 file (mockData.ts)

