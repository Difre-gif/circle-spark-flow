

# BizRent Frontend Prototype — Full Implementation Plan

## Overview
Build a complete, polished frontend prototype for BizRent — East Africa's MoMo-First Property Management Platform. This covers ~30 screens across the Landlord Portal and Tenant Portal, using mock data, BizRent brand identity, and the uploaded dashboard reference as a visual guide.

## Brand System (applied globally)

| Token | Value |
|-------|-------|
| Navy (primary) | #1E3A8A |
| Blue (interactive) | #1D4ED8 |
| Emerald (approved) | #10B981 |
| Forest (secondary) | #065F46 |
| Amber (pending) | #F59E0B |
| Red (rejected) | #DC2626 |
| Slate (dark text) | #0F172A |
| Light (background) | #F8FAFC |
| Font | Inter (Google Fonts) — 700 headings, 400 body |
| Border radius | 6px buttons, 8px cards |

## Architecture

- **Routing**: React Router with two route groups — `/landlord/*` and `/tenant/*`, plus auth pages at root
- **State**: Mock data via React context providers (no backend)
- **Layout**: Shared sidebar layout for landlord, simple mobile-first layout for tenant
- **Components**: Built on existing shadcn/ui, customised to BizRent brand

## Screen Inventory (30 screens)

### Auth Screens (4)
1. **Login** — Email/password form, BizRent logo, tagline
2. **Register** — Landlord signup: name, email, phone, password, organisation name
3. **Forgot Password** — Email input, confirmation message
4. **Reset Password** — New password form

### Landlord Portal (20 screens)
5. **Dashboard** — KPI cards (Total Properties, Units, Collection Rate, Outstanding), weekly revenue bar chart, cost/status donut chart, recent transactions list, maintenance requests list (adapted from uploaded reference image)
6. **Properties List** — Table with property name, type, units count, occupancy %, status; Add Property button
7. **Property Detail** — Property info card + units table showing unit number, type, rent, status, tenant
8. **Add/Edit Property** — Form: name, type (APARTMENT/HOUSE/COMMERCIAL), address, city, district
9. **Units List** — Filterable table of all units across properties
10. **Add/Edit Unit** — Form: unit number, type, monthly rent, status
11. **Tenants List** — Table: name, email, phone, unit, property, payment status
12. **Add/Invite Tenant** — Form: name, email, phone; sends invite
13. **Tenancies List** — Active/terminated tenancies with lease details
14. **Add/Edit Tenancy** — Form: unit, tenant, start date, agreed rent, deposit
15. **Invoices List** — Filterable table: invoice #, tenant, unit, period, amount, status (DUE/PAID/PARTIAL/OVERDUE)
16. **Invoice Detail** — Full invoice with payment history, balance, generate receipt action
17. **Pending Payments Queue** — The core screen: list of PENDING payment submissions with transaction ID, amount, tenant, screenshot preview, Approve/Reject buttons
18. **Payment Detail** — Full payment record with proof screenshot viewer, approve/reject with reason modal
19. **Reports** — Collections summary, aging report, occupancy report with charts and export buttons
20. **Receipts List** — Generated receipts table with download links
21. **Team Management** — Invite managers/accountants, manage roles (OWNER/MANAGER/ACCOUNTANT)
22. **Audit Logs** — Searchable log table: actor, action, target, timestamp
23. **Settings** — Organisation profile, notification preferences, subscription tier display
24. **Notifications** — Bell dropdown + full notifications page with read/unread states

### Tenant Portal (6 screens)
25. **Tenant Dashboard** — Current invoice status, quick submit payment CTA, recent payment history
26. **Tenant Invoices** — List of invoices with status badges
27. **Tenant Invoice Detail + Submit Payment** — Invoice details + MoMo transaction ID input + screenshot upload form
28. **Tenant Receipts** — Downloadable receipt list
29. **Tenant Payment History** — All submitted payments with status
30. **Tenant Profile** — Personal info, notification preferences

## Implementation Phases (executed sequentially)

### Phase 1: Foundation
- Configure Tailwind with BizRent brand tokens (colors, fonts)
- Add Inter font via Google Fonts in index.html
- Create BizRent logo component (SVG icon mark — geometric "B-Key" building icon)
- Create mock data files: organisations, properties, units, tenants, tenancies, invoices, payments, receipts, audit logs
- Build shared layout components: LandlordSidebar (navy sidebar with white text, navigation icons), TenantLayout (mobile-first single column), TopBar (search, notifications bell, user avatar)

### Phase 2: Auth Screens
- Login, Register, Forgot Password, Reset Password pages
- Auth context with mock login (landlord vs tenant role routing)

### Phase 3: Landlord Dashboard + Core Navigation
- Dashboard with KPI stat cards, bar chart (Recharts), donut chart, recent transactions, maintenance requests
- Sidebar navigation: Dashboard, Properties, Tenants, Invoices, Payments, Reports, Receipts, Team, Audit Log, Settings

### Phase 4: Property & Unit Management
- Properties list with table, filters, add/edit modals
- Property detail page with units sub-table
- Unit add/edit forms

### Phase 5: Tenant & Tenancy Management
- Tenants list, invite tenant form
- Tenancies list, add/edit tenancy form

### Phase 6: Invoices & Payments (Core Workflow)
- Invoices list with status filters
- Invoice detail with payment history
- Pending Payments Queue — the hero screen for landlords
- Payment detail with approve/reject modals (reject requires reason)
- Status badges: PENDING (#F59E0B), APPROVED (#10B981), REJECTED (#DC2626), OVERDUE (#EA580C)

### Phase 7: Reports, Receipts, Audit
- Reports page with collections table, aging buckets (color-coded), occupancy chart
- Receipts list
- Audit logs table with filters

### Phase 8: Settings, Team, Notifications
- Team management with role assignment
- Settings page with org profile
- Notifications dropdown and page

### Phase 9: Tenant Portal
- Tenant dashboard, invoice list, payment submission form, receipts, payment history, profile

### Phase 10: Polish
- Empty states with BizRent copy ("All clear. No payments waiting for your review.")
- Loading skeletons
- Responsive design verification
- Status chip consistency across all screens

## Key UI Patterns (from brand doc)
- **Cards**: white bg, 1px solid #E2E8F0 border, 8px radius, subtle shadow
- **Data tables**: Navy (#1E3A8A) header with white text, alternating rows white/#F8FAFC
- **Primary buttons**: #1D4ED8 bg, white text, Inter 600, hover #1E3A8A
- **Status chips**: Colored bg with white bold labels (12px Inter 600)
- **Currency**: Always "RWF 120,000" format
- **Dates**: "1 April 2026" format

## Technical Details
- All screens use React Router for navigation
- Mock data stored in `src/data/` as TypeScript constants
- Recharts for dashboard charts (already available via shadcn chart component)
- React Hook Form + Zod for all forms
- Responsive: desktop-first for landlord portal, mobile-first for tenant portal
- ~25 new component files, ~30 page files, ~8 data/type files

