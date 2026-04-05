/**
 * One-off seed script for loading initial song, chart, and broadcast data into Supabase.
 * Run with: npx tsx scripts/seed.ts
 *
 * This script must never be imported by the runtime recommendation path.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  console.log('Seeding database...');

  // TODO: Insert songs
  // TODO: Insert chart entries
  // TODO: Insert broadcast wins

  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
