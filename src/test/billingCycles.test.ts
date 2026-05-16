import { describe, expect, it } from 'vitest';
import { getCyclePreview } from '@/lib/billingCycles';

describe('billing cycles', () => {
  it('derives a monthly cycle from a move-in date and anchor day', () => {
    expect(getCyclePreview('2026-05-18', 18)?.label).toBe('18 May 2026 → 17 Jun 2026');
  });

  it('moves the first cycle to next month when the anchor has already passed', () => {
    expect(getCyclePreview('2026-05-20', 18)?.label).toBe('18 Jun 2026 → 17 Jul 2026');
  });

  it('clamps anchors for shorter months', () => {
    expect(getCyclePreview('2026-01-31', 31)?.label).toBe('31 Jan 2026 → 27 Feb 2026');
  });
});
