import { loadEnvConfig } from '@next/env';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let envLoaded = false;

function ensureEnvLoaded() {
  if (envLoaded) {
    return;
  }

  loadEnvConfig(process.cwd());
  envLoaded = true;
}

export function getIngestSupabaseClient(): SupabaseClient {
  ensureEnvLoaded();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
