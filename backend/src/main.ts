import { bootstrap } from './app';
import { Logger } from '@nestjs/common';

const logger = new Logger('NestApplication');

async function main() {
  try {
    const app = await bootstrap();
    await app.listen(3000);
    logger.log(`Listening on ${await app.getUrl()}`);
    logger.log(`Process start up took ${process.uptime()} seconds`);
  } catch (err) {
    logger.error(err);
  }
}

main();
