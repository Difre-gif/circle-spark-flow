export type PolicyForm = {
  default_due_day: number;
  grace_period_days: number;
  days_before_due: number[];
  days_after_due: number[];
};

export const DEFAULT_POLICY_FORM: PolicyForm = {
  default_due_day: 1,
  grace_period_days: 3,
  days_before_due: [3],
  days_after_due: [1, 5, 10],
};

export const normalizeDays = (days: number[]) =>
  [...new Set(days.filter(day => Number.isInteger(day) && day > 0))].sort((a, b) => a - b);

export const samePolicy = (a: PolicyForm | null, b: PolicyForm | null) =>
  !!a &&
  !!b &&
  a.default_due_day === b.default_due_day &&
  a.grace_period_days === b.grace_period_days &&
  a.days_before_due.join(',') === b.days_before_due.join(',') &&
  a.days_after_due.join(',') === b.days_after_due.join(',');

export const getPolicyErrors = (policy: PolicyForm | null) => {
  if (!policy) return [];
  const errors: string[] = [];
  if (!Number.isInteger(policy.default_due_day) || policy.default_due_day < 1 || policy.default_due_day > 28) {
    errors.push('Default billing day must be a whole number between 1 and 28.');
  }
  if (!Number.isInteger(policy.grace_period_days) || policy.grace_period_days < 0 || policy.grace_period_days > 30) {
    errors.push('Grace period must be a whole number between 0 and 30 days.');
  }
  if (policy.days_before_due.some(day => day < 1 || day > 30)) {
    errors.push('Pre-due reminders must be between 1 and 30 days before the due date.');
  }
  if (policy.days_after_due.some(day => day < 1 || day > 90)) {
    errors.push('Overdue escalations must be between 1 and 90 days after the due date.');
  }
  return errors;
};
