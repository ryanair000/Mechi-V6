export function GET() {
  return Response.json({
    ok: true,
    service: 'mechi-v6',
    version: '0.0.1',
    supabaseConfigured: Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ),
  });
}
