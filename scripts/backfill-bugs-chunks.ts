import { runChunkedBackfill } from '../src/ingest/runChunkedBackfill';

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  const from = readArg('from');
  const to = readArg('to');
  const chunkDaysRaw = readArg('chunk-days');
  const chunkDays = chunkDaysRaw ? Number.parseInt(chunkDaysRaw, 10) : undefined;

  if (!from || !to) {
    throw new Error('Expected --from=YYYY-MM-DD and --to=YYYY-MM-DD.');
  }

  if (chunkDaysRaw && !Number.isInteger(chunkDays)) {
    throw new Error(`Invalid --chunk-days value "${chunkDaysRaw}".`);
  }

  const summary = await runChunkedBackfill({
    source: 'bugs',
    from,
    to,
    chunkDays,
  });

  console.log(JSON.stringify({ ok: true, ...summary }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
