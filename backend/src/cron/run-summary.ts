import { Logger } from '@nestjs/common';
import { bootstrapApplicationContext } from '../app';
import { SummaryWorkflow } from '../email/workflows/summary.workflow';
import { resolveSummaryWindow } from './summary-window';

const logger = new Logger('SUMMARY_CRON');

async function run(): Promise<void> {
  const app = await bootstrapApplicationContext();

  try {
    const workflow = app.get(SummaryWorkflow);
    const window = resolveSummaryWindow(new Date());

    logger.log(
      JSON.stringify({
        event: 'summary_cron_started',
        runKind: window.runKind,
        scheduledAt: window.scheduledAt.toISOString(),
        windowStart: window.windowStart.toISOString(),
        windowEnd: window.windowEnd.toISOString(),
      }),
    );

    const result = await workflow.handle(window);

    logger.log(
      JSON.stringify({
        event: 'summary_cron_completed',
        runKind: window.runKind,
        scheduledAt: window.scheduledAt.toISOString(),
        windowStart: window.windowStart.toISOString(),
        windowEnd: window.windowEnd.toISOString(),
        ...result,
      }),
    );
  } finally {
    await app.close();
  }
}

run().catch(() => {
  logger.error(
    JSON.stringify({
      event: 'summary_cron_failed',
      errorCode: 'CRON_ERROR',
    }),
  );
  process.exitCode = 1;
});
