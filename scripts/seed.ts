/**
 * scripts/seed.ts
 *
 * One-off seed script for loading initial song, chart, and broadcast data into Supabase.
 * Run with: npx tsx scripts/seed.ts
 *
 * This script must NEVER be imported by the runtime recommendation path.
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

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  console.log('Seeding database...');

  // Keep a live client reference here so the seed steps can be filled in incrementally.
  void supabase;

  // TODO: Insert songs
  // const { error: songsError } = await supabase.from('songs').insert([...]);

  // TODO: Insert chart entries
  // const { error: chartsError } = await supabase.from('charts').insert([...]);

  // TODO: Insert broadcast wins
  // const { error: winsError } = await supabase.from('broadcast_wins').insert([...]);

  console.log('Seed complete.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
