import { enrichBugsMetadata } from '../src/ingest/enrichBugsMetadata';

function readLimit(): number | undefined {
  const prefix = '--limit=';
  const raw = process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);

  if (!raw) {
    return undefined;
  }

  const limit = Number.parseInt(raw, 10);
  if (!Number.isFinite(limit)) {
    throw new Error(`Invalid --limit value "${raw}".`);
  }

  return limit;
}

async function main() {
  const summary = await enrichBugsMetadata(readLimit());
  console.log(JSON.stringify({ ok: true, ...summary }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
