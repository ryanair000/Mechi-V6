import { ImageResponse } from 'next/og';
import QRCode from 'qrcode';
import { getCardData } from '@/features/cards/server/get-card-data';
import { parsePublicHandle } from '@/features/identity/lib/public-handle';
import { getAppUrl } from '@/lib/app-url';

type RouteContext = {
  params: Promise<{ handle: string }>;
};

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: RouteContext) {
  const { handle: rawHandle } = await params;
  const handle = parsePublicHandle(rawHandle);
  if (!handle) return new Response('Not found', { status: 404 });

  const card = await getCardData(handle);
  if (!card) return new Response('Not found', { status: 404 });

  const profileUrl = `${getAppUrl()}/@${card.handle}`;
  const qrDataUrl = await QRCode.toDataURL(profileUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 260,
    color: { dark: '#0b0f14', light: '#ffffff' },
  });
  const initials = card.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  const games = card.games.slice(0, 4);
  const platforms = card.platforms.slice(0, 3);
  const download = new URL(request.url).searchParams.get('download') === '1';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          background: '#0b0f14',
          color: '#ffffff',
          padding: '54px 58px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 520,
            height: 520,
            borderRadius: 520,
            right: -170,
            top: -230,
            background: 'rgba(184,255,44,.18)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: 420,
            left: 290,
            bottom: -310,
            background: 'rgba(80,120,255,.12)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#b8ff2c',
                color: '#0b0f14',
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              M
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1.4 }}>MECHI CARD</div>
              <div style={{ fontSize: 15, color: 'rgba(255,255,255,.42)' }}>your gaming identity</div>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid rgba(184,255,44,.28)',
              background: 'rgba(184,255,44,.08)',
              color: '#b8ff2c',
              borderRadius: 999,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            @{card.handle}
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', gap: 42 }}>
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div
                style={{
                  width: 128,
                  height: 128,
                  borderRadius: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  background: '#202832',
                  border: '4px solid rgba(255,255,255,.08)',
                  fontSize: 40,
                  fontWeight: 900,
                }}
              >
                {card.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={card.avatarUrl} alt="" width="128" height="128" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : initials || 'M'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 600 }}>
                <div style={{ fontSize: 52, lineHeight: 1, fontWeight: 900, letterSpacing: -2.8 }}>
                  {card.displayName}
                </div>
                {card.location ? (
                  <div style={{ marginTop: 14, fontSize: 20, color: 'rgba(255,255,255,.48)' }}>{card.location}</div>
                ) : null}
              </div>
            </div>

            {card.gamingStyles.length ? (
              <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
                {card.gamingStyles.slice(0, 3).map((style) => (
                  <div
                    key={style}
                    style={{
                      display: 'flex',
                      borderRadius: 999,
                      padding: '8px 13px',
                      background: 'rgba(255,255,255,.055)',
                      border: '1px solid rgba(255,255,255,.09)',
                      color: 'rgba(255,255,255,.65)',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                    {style.replaceAll('-', ' ')}
                  </div>
                ))}
              </div>
            ) : null}

            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 34 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#b8ff2c', letterSpacing: 2.4 }}>PLAYS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 11, marginTop: 12 }}>
                {games.map((game) => (
                  <div
                    key={game.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      borderRadius: 15,
                      padding: '11px 14px',
                      background: game.isPrimary ? '#b8ff2c' : 'rgba(255,255,255,.06)',
                      color: game.isPrimary ? '#0b0f14' : '#ffffff',
                      border: game.isPrimary ? '1px solid #b8ff2c' : '1px solid rgba(255,255,255,.09)',
                      fontSize: 16,
                      fontWeight: 800,
                    }}
                  >
                    {game.shortName || game.name}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginTop: 20 }}>
              {platforms.map((platform) => (
                <div key={platform.id} style={{ display: 'flex', color: 'rgba(255,255,255,.46)', fontSize: 15, fontWeight: 700 }}>
                  {platform.name}{platform.isPrimary ? ' · main' : ''}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              width: 250,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', padding: 14, background: '#ffffff', borderRadius: 28 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="" width="190" height="190" style={{ width: 190, height: 190 }} />
            </div>
            <div style={{ marginTop: 14, fontSize: 14, fontWeight: 800, color: 'rgba(255,255,255,.55)' }}>SCAN MY MECHI</div>
            <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,.28)' }}>mechi-v6.vercel.app</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 18 }}>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,.38)' }}>Everything you play. One identity.</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#b8ff2c' }}>MECHI</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        'Content-Disposition': download ? `attachment; filename="${card.handle}-mechi-card.png"` : 'inline',
      },
    },
  );
}
