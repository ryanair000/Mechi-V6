import type { EmailOtpType } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function safeNext(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('next');
  if (!raw) return '/onboarding';

  try {
    const resolved = new URL(raw, request.nextUrl.origin);
    if (resolved.origin !== request.nextUrl.origin) return '/onboarding';
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return '/onboarding';
  }
}

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type') as EmailOtpType | null;
  const next = safeNext(request);

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL('/login?error=invalid_confirmation', request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error) {
    return NextResponse.redirect(new URL('/login?error=confirmation_failed', request.url));
  }

  return NextResponse.redirect(new URL(next, request.nextUrl.origin));
}
