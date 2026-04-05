import { importBroadcastWins } from '../src/ingest/importBroadcastWins';

function readYearArg(name: string): number | undefined {
  const prefix = `--${name}=`;
  const raw = process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);

  if (!raw) {
    return undefined;
  }

  const year = Number.parseInt(raw, 10);
  if (!Number.isInteger(year)) {
    throw new Error(`Invalid --${name} value "${raw}".`);
  }

  return year;
}

async function main() {
  const summary = await importBroadcastWins({
    fromYear: readYearArg('from-year'),
    toYear: readYearArg('to-year'),
  });
  console.log(JSON.stringify({ ok: true, ...summary }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
