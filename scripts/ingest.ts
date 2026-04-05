import { runIngestion } from '../src/ingest/runIngestion';
import type { IngestMode, IngestOptions, IngestSource } from '../src/ingest/types';

function readArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((value) => value.startsWith(prefix))?.slice(prefix.length);
}

function parseArgs(): IngestOptions {
  const mode = readArg('mode') as IngestMode | undefined;
  const source = (readArg('source') ?? 'bugs') as IngestSource;
  const from = readArg('from');
  const to = readArg('to');
  const daysRaw = readArg('days');
  const days = daysRaw ? Number.parseInt(daysRaw, 10) : undefined;

  if (mode !== 'backfill' && mode !== 'incremental') {
    throw new Error('Expected --mode=backfill or --mode=incremental.');
  }

  if (source !== 'bugs') {
    throw new Error('Only --source=bugs is supported in this first implementation.');
  }

  if (daysRaw && !Number.isFinite(days)) {
    throw new Error(`Invalid --days value "${daysRaw}".`);
  }

  return {
    source,
    mode,
    from,
    to,
    days,
  };
}

async function main() {
  const options = parseArgs();
  const summary = await runIngestion(options);

  console.log(
    JSON.stringify(
      {
        ok: true,
        ...summary,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
