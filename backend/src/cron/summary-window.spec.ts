import { resolveSummaryWindow } from './summary-window';

describe('resolveSummaryWindow', () => {
  it('resolves the morning run window at exactly 7:30am boundary', () => {
    const window = resolveSummaryWindow(new Date('2026-06-02T14:30:00Z'));

    expect(window.runKind).toBe('morning');
    expect(window.windowStart.toISOString()).toBe('2026-06-01T21:30:00.000Z');
    expect(window.windowEnd.toISOString()).toBe('2026-06-02T14:30:00.000Z');
  });

  it('resolves the afternoon run window at exactly 2:30pm boundary', () => {
    const window = resolveSummaryWindow(new Date('2026-06-02T21:30:00Z'));

    expect(window.runKind).toBe('afternoon');
    expect(window.windowStart.toISOString()).toBe('2026-06-02T14:30:00.000Z');
    expect(window.windowEnd.toISOString()).toBe('2026-06-02T21:30:00.000Z');
  });

  it('keeps the prior window end exclusive and the next window start inclusive', () => {
    const morningWindow = resolveSummaryWindow(
      new Date('2026-06-02T14:30:00Z'),
    );
    const afternoonWindow = resolveSummaryWindow(
      new Date('2026-06-02T21:30:00Z'),
    );
    const nextMorningWindow = resolveSummaryWindow(
      new Date('2026-06-03T14:30:00Z'),
    );

    const exactMorningBoundary = new Date('2026-06-02T14:30:00Z');
    const exactAfternoonBoundary = new Date('2026-06-02T21:30:00Z');

    expect(exactMorningBoundary.getTime()).toBe(
      morningWindow.windowEnd.getTime(),
    );
    expect(exactMorningBoundary.getTime()).toBe(
      afternoonWindow.windowStart.getTime(),
    );
    expect(exactAfternoonBoundary.getTime()).toBe(
      afternoonWindow.windowEnd.getTime(),
    );
    expect(exactAfternoonBoundary.getTime()).toBe(
      nextMorningWindow.windowStart.getTime(),
    );
  });
});
