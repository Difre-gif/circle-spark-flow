// Central RBAC permissions utility.
// Single source of truth for all role-based access checks.
// Every component that renders a restricted action must call can(role, action).

export type OrgRole = 'OWNER' | 'MANAGER' | 'ACCOUNTANT' | 'TENANT';

export type Action =
  // Properties
  | 'property:create'
  | 'property:edit'
  | 'property:delete'
  | 'property:view'
  // Units
  | 'unit:create'
  | 'unit:edit'
  | 'unit:delete'
  | 'unit:view'
  // Tenants
  | 'tenant:invite'
  | 'tenant:remove'
  | 'tenant:view'
  // Invoices
  | 'invoice:generate'
  | 'invoice:view'
  // Payments
  | 'payment:approve'
  | 'payment:reject'
  | 'payment:view'
  // Receipts
  | 'receipt:view'
  // Reports
  | 'report:view'
  | 'report:export'
  // Settings
  | 'settings:view'
  | 'settings:edit'
  // Billing
  | 'billing:view'
  | 'billing:edit'
  // Team
  | 'team:invite'
  | 'team:remove'
  | 'team:view';

const PERMISSIONS: Record<OrgRole, Set<Action>> = {
  OWNER: new Set([
    'property:create', 'property:edit', 'property:delete', 'property:view',
    'unit:create', 'unit:edit', 'unit:delete', 'unit:view',
    'tenant:invite', 'tenant:remove', 'tenant:view',
    'invoice:generate', 'invoice:view',
    'payment:approve', 'payment:reject', 'payment:view',
    'receipt:view',
    'report:view', 'report:export',
    'settings:view', 'settings:edit',
    'billing:view', 'billing:edit',
    'team:invite', 'team:remove', 'team:view',
  ]),

  MANAGER: new Set([
    'property:view',
    'unit:create', 'unit:edit', 'unit:view',
    'tenant:invite', 'tenant:remove', 'tenant:view',
    'invoice:generate', 'invoice:view',
    'payment:approve', 'payment:reject', 'payment:view',
    'receipt:view',
    'report:view',
    'team:view',
  ]),

  ACCOUNTANT: new Set([
    'property:view',
    'unit:view',
    'tenant:view',
    'invoice:view',
    'payment:view',
    'receipt:view',
    'report:view', 'report:export',
  ]),

  TENANT: new Set([
    'invoice:view',
    'payment:view',
    'receipt:view',
  ]),
};

export function can(role: OrgRole | string | undefined | null, action: Action): boolean {
  if (!role) return false;
  const perms = PERMISSIONS[role as OrgRole];
  if (!perms) return false;
  return perms.has(action);
}
