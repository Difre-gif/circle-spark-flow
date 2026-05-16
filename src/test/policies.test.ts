import { describe, expect, it } from 'vitest';
import { DEFAULT_POLICY_FORM, getPolicyErrors, normalizeDays, samePolicy } from '@/lib/policies';

describe('policy helpers', () => {
  it('normalizes duplicate, invalid, and unsorted days', () => {
    expect(normalizeDays([5, 3, 5, -1, 0, 2.5, 1])).toEqual([1, 3, 5]);
  });

  it('detects equal policies by value', () => {
    expect(samePolicy(DEFAULT_POLICY_FORM, { ...DEFAULT_POLICY_FORM })).toBe(true);
    expect(samePolicy(DEFAULT_POLICY_FORM, { ...DEFAULT_POLICY_FORM, grace_period_days: 4 })).toBe(false);
  });

  it('rejects out-of-range values while allowing empty reminder arrays', () => {
    expect(getPolicyErrors({ ...DEFAULT_POLICY_FORM, days_before_due: [], days_after_due: [] })).toEqual([]);
    expect(getPolicyErrors({
      default_due_day: 29,
      grace_period_days: 31,
      days_before_due: [31],
      days_after_due: [91],
    })).toHaveLength(4);
  });
});
