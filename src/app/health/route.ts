import { hasSupabaseEnv } from '@/lib/env';

export function GET() {
  return Response.json({
    ok: true,
    service: 'mechi-v6',
    version: '0.0.1',
    supabaseConfigured: hasSupabaseEnv(),
  });
}
