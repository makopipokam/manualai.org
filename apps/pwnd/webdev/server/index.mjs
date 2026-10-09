import { createApp } from './app.mjs';
import { runMigrations } from './migrate.mjs';

const port = Number(process.env.PORT) || 3000;

async function main() {
  await runMigrations();
  const app = createApp();
  app.listen(port, '0.0.0.0', () => console.log(`[pwnd] listening on 0.0.0.0:${port}`));
}

main().catch(error => {
  console.error('[pwnd] failed to start', error);
  process.exit(1);
});
