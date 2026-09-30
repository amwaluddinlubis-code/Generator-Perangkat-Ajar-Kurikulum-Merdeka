import { randomBytes } from 'node:crypto';

export const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
export const GOOGLE_TOKENINFO_URL = 'https://oauth2.googleapis.com/tokeninfo';
export const GOOGLE_OAUTH_STATE_TTL_MS = 10 * 60 * 1000;
const GOOGLE_OAUTH_SCOPES = 'openid email profile';

export interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function getGoogleOAuthConfig(redirectUriFallback?: string): GoogleOAuthConfig | null {
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  // Hanya URI absolut http(s) yang sah — placeholder seperti "MY_APP_URL" diabaikan
  // agar jatuh ke fallback host request (mis. http://localhost:3000/...).
  const absolute = (v: string | undefined): string => {
    const s = (v || '').trim().replace(/\/$/, '');
    return /^https?:\/\/.+/i.test(s) ? s : '';
  };
  const redirectUri =
    absolute(process.env.GOOGLE_REDIRECT_URI) ||
    (process.env.APP_URL ? absolute(process.env.APP_URL + '/api/auth/google/callback') : '') ||
    absolute(redirectUriFallback);
  if (!clientId || !clientSecret || !redirectUri) return null;
  return { clientId, clientSecret, redirectUri };
}

export function isGoogleOAuthConfigured(): boolean {
  return getGoogleOAuthConfig() !== null;
}

/** Email yang boleh masuk via Google OAuth: suffix Belajar.id (+ pengecualian super-admin). */
export function isAllowedBelajarIdEmail(email: string): boolean {
  if (!email) return false;
  const lower = email.toLowerCase().trim();
  if (lower === 'amwaluddin.lubis@gmail.com') return true;
  return (
    lower.endsWith('@guru.sd.belajar.id') ||
    lower.endsWith('@guru.smp.belajar.id') ||
    lower.endsWith('@guru.sma.belajar.id') ||
    lower.endsWith('@guru.smk.belajar.id') ||
    lower.endsWith('@admin.sd.belajar.id') ||
    lower.endsWith('@admin.smp.belajar.id') ||
    lower.endsWith('@admin.sma.belajar.id') ||
    lower.endsWith('@admin.belajar.id') ||
    lower.endsWith('@guru.belajar.id') ||
    lower.endsWith('@belajar.id')
  );
}

export function detectJenjangFromEmail(email: string): 'SD' | 'SMP' | 'SMA' | 'SMK' {
  const lower = email.toLowerCase();
  if (lower.includes('.sd.')) return 'SD';
  if (lower.includes('.smp.')) return 'SMP';
  if (lower.includes('.sma.')) return 'SMA';
  if (lower.includes('.smk.')) return 'SMK';
  return 'SMP';
}

export function buildGoogleAuthUrl(config: GoogleOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: GOOGLE_OAUTH_SCOPES,
    access_type: 'online',
    prompt: 'select_account',
    state
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export function createOAuthState(): string {
  return randomBytes(16).toString('hex');
}

export interface GoogleTokenInfo {
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
  hostedDomain?: string;
}

/** Tukar authorization code dengan id_token (tanpa library tambahan). */
export async function exchangeCodeForIdToken(
  config: GoogleOAuthConfig,
  code: string
): Promise<string> {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: config.redirectUri
  });
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });
  if (!res.ok) throw new Error('Gagal menukar kode otorisasi Google.');
  const data = (await res.json()) as { id_token?: string };
  if (!data.id_token) throw new Error('Respons Google tidak memuat id_token.');
  return data.id_token;
}

/**
 * Verifikasi id_token via endpoint tokeninfo Google (validasi tanda tangan
 * dilakukan oleh Google sendiri). Memastikan aud, expiry, dan email_verified.
 */
export async function verifyGoogleIdToken(
  clientId: string,
  idToken: string
): Promise<GoogleTokenInfo> {
  const res = await fetch(`${GOOGLE_TOKENINFO_URL}?id_token=${encodeURIComponent(idToken)}`);
  if (!res.ok) throw new Error('Token Google tidak valid.');
  const data = (await res.json()) as {
    aud?: string;
    email?: string;
    email_verified?: string;
    name?: string;
    picture?: string;
    hd?: string;
    exp?: string;
    iss?: string;
  };
  if (!data.aud || data.aud !== clientId) throw new Error('Token Google bukan untuk aplikasi ini.');
  if (!data.iss || !/accounts\.google\.com/.test(data.iss)) throw new Error('Penerbit token Google tidak dikenal.');
  if (data.exp && Number(data.exp) * 1000 < Date.now()) throw new Error('Token Google kedaluwarsa.');
  if (!data.email || data.email_verified !== 'true') throw new Error('Email Google belum terverifikasi.');
  return {
    email: data.email.toLowerCase().trim(),
    emailVerified: true,
    name: data.name,
    picture: data.picture,
    hostedDomain: data.hd
  };
}
