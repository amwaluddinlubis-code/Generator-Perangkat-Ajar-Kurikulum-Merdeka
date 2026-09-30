/**
 * Ambil pesan error server apa pun formatnya:
 * format baru `{ success:false, error:{ code, message } }`
 * maupun format lama `{ success:false, message }`.
 */
export function getServerMessage(data: any, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const fromError =
    data.error && typeof data.error === 'object' && typeof data.error.message === 'string'
      ? data.error.message.trim()
      : '';
  if (fromError) return fromError;
  if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
  return fallback;
}
