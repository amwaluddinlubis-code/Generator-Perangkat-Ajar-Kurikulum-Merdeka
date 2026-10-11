/**
 * Utilitas API Fetch terpadu untuk Ruang Guru Merdeka.
 * Autentikasi HANYA via bukti sesi: cookie (credentials: include),
 * Authorization Bearer, atau x-session-token.
 * Header x-user-id/x-user-email SENGAJA tidak dikirim — server tidak lagi
 * memakainya sebagai bukti autentikasi (anti-spoofing, issue #2).
 */

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  try {
    const token = localStorage.getItem('ruang_guru_session_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-session-token'] = token;
    }
  } catch {
    // Abaikan kegagalan baca data lokal
  }
  return headers;
}

export async function apiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const authHeaders = getAuthHeaders();
  const mergedHeaders: Record<string, string> = {
    ...authHeaders,
    ...((init?.headers as Record<string, string>) || {}),
  };

  const response = await fetch(input, {
    credentials: 'include',
    ...init,
    headers: mergedHeaders,
  });

  // Simpan token baru bila server memperbarui sesi
  const newToken = response.headers.get('x-new-session-token');
  if (newToken) {
    try {
      localStorage.setItem('ruang_guru_session_token', newToken);
    } catch {
      // Abaikan
    }
  }

  return response;
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
