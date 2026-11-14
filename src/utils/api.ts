/**
 * Utilitas API Fetch terpadu untuk Ruang Guru Merdeka.
 *
 * Autentikasi HANYA lewat cookie sesi httpOnly (`rgm_session`) yang dikirim
 * otomatis dengan `credentials: 'include'`. Token TIDAK disimpan di
 * localStorage: nilai yang bisa dibaca JavaScript sama rapuhnya dengan sesi
 * biasa bila ada XSS, dan meniadakan manfaat httpOnly.
 *
 * Header `x-user-id` / `x-user-email` SENGAJA tidak dikirim — server tidak
 * memakainya sebagai bukti autentikasi (anti-spoofing, issue #2).
 */

export function getAuthHeaders(): Record<string, string> {
  return {};
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const mergedHeaders: Record<string, string> = {
    ...getAuthHeaders(),
    ...((init?.headers as Record<string, string>) || {}),
  };

  return fetch(input, {
    credentials: 'include',
    ...init,
    headers: mergedHeaders,
  });
}

export function extractErrorMessage(data: any, fallback = 'Terjadi kesalahan pada server'): string {
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
  if (data.error) {
    if (typeof data.error === 'string' && data.error.trim()) return data.error.trim();
    if (typeof data.error.message === 'string' && data.error.message.trim()) return data.error.message.trim();
  }
  return fallback;
}
