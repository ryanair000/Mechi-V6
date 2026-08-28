export function getAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production}`;

  const deployment = process.env.VERCEL_URL?.trim();
  if (deployment) return `https://${deployment}`;

  return 'http://localhost:3000';
}
