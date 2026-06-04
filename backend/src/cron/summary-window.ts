const SUMMARY_MORNING_HOUR_UTC = 14;
const SUMMARY_AFTERNOON_HOUR_UTC = 21;
const SUMMARY_MINUTE_UTC = 30;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export type SummaryRunKind = 'morning' | 'afternoon';

export interface SummaryWindow {
  runKind: SummaryRunKind;
  scheduledAt: Date;
  windowStart: Date;
  windowEnd: Date;
}

function createUtcTimestamp(
  year: number,
  month: number,
  day: number,
  hour: number,
): Date {
  return new Date(Date.UTC(year, month, day, hour, SUMMARY_MINUTE_UTC, 0, 0));
}

export function resolveSummaryWindow(runAt: Date): SummaryWindow {
  const scheduledAt = new Date(runAt);
  const morningCutoff = createUtcTimestamp(
    scheduledAt.getUTCFullYear(),
    scheduledAt.getUTCMonth(),
    scheduledAt.getUTCDate(),
    SUMMARY_MORNING_HOUR_UTC,
  );
  const afternoonCutoff = createUtcTimestamp(
    scheduledAt.getUTCFullYear(),
    scheduledAt.getUTCMonth(),
    scheduledAt.getUTCDate(),
    SUMMARY_AFTERNOON_HOUR_UTC,
  );

  if (scheduledAt.getTime() >= afternoonCutoff.getTime()) {
    return {
      runKind: 'afternoon',
      scheduledAt,
      windowStart: morningCutoff,
      windowEnd: afternoonCutoff,
    };
  }

  return {
    runKind: 'morning',
    scheduledAt,
    windowStart: new Date(afternoonCutoff.getTime() - MILLISECONDS_PER_DAY),
    windowEnd: morningCutoff,
  };
}
