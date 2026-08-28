export function parsePublicHandle(raw: string) {
  const decoded = decodeURIComponent(raw).trim().toLowerCase();
  if (!decoded.startsWith('@')) return null;

  const handle = decoded.slice(1);
  return /^[a-z0-9_]{3,20}$/.test(handle) ? handle : null;
}
