import QRCode from 'qrcode';
import { parsePublicHandle } from '@/features/identity/lib/public-handle';
import { getCardData } from '@/features/cards/server/get-card-data';
import { getAppUrl } from '@/lib/app-url';

type RouteContext = {
  params: Promise<{ handle: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { handle: rawHandle } = await params;
  const handle = parsePublicHandle(rawHandle);
  if (!handle) return new Response('Not found', { status: 404 });

  const card = await getCardData(handle);
  if (!card) return new Response('Not found', { status: 404 });

  const profileUrl = `${getAppUrl()}/@${card.handle}`;
  const svg = await QRCode.toString(profileUrl, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 320,
    color: {
      dark: '#0b0f14',
      light: '#ffffff',
    },
  });

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
