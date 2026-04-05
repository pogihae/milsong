import { importBroadcastWins } from '../src/ingest/importBroadcastWins';

async function main() {
  const summary = await importBroadcastWins();
  console.log(JSON.stringify({ ok: true, ...summary }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
