/**
 * Test regresi issue #2: header x-user-id / x-user-email TIDAK boleh menjadi
 * bukti autentikasi (anti-spoofing). Dijalankan via: npx tsx test/auth-header-spoofing.test.ts
 * Keluar dengan kode 1 bila ada kasus yang gagal.
 */
import {
  createRequireAuth,
  createSession,
  setSessions,
  type AuthUser,
} from '../server/auth.ts';

const VICTIM: AuthUser = {
  id: 'user-victim-001', name: 'Korban', email: 'korban@sekolah.id',
  schoolName: 'SMPN 1', jenjang: 'SMP', mataPelajaran: 'Informatika',
  role: 'GURU', status: 'VERIFIED', registeredAt: new Date().toISOString(),
};
const ATTACKER: AuthUser = {
  id: 'user-attacker-002', name: 'Penyerang', email: 'penyerang@jahat.id',
  schoolName: 'SMPN 1', jenjang: 'SMP', mataPelajaran: 'Informatika',
  role: 'GURU', status: 'VERIFIED', registeredAt: new Date().toISOString(),
};
const USERS = new Map([[VICTIM.id, VICTIM], [ATTACKER.id, ATTACKER]]);

function mockReq(headers: Record<string, string> = {}) {
  return { headers } as any;
}
function mockRes() {
  const res: any = { statusCode: 0, body: null };
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.json = (body: unknown) => { res.body = body; return res; };
  res.setHeader = () => res;
  return res;
}

let passed = 0, failed = 0;
function check(name: string, cond: boolean, extra = '') {
  if (cond) { passed++; console.log(`  PASS ${name}`); }
  else { failed++; console.log(`  FAIL ${name} ${extra}`); }
}

console.log('Issue #2 — regresi anti-spoofing header identitas\n');

const requireAuth = createRequireAuth((id: string) => USERS.get(id));

// 1. Spoofing murni via x-user-id → harus 401, next TIDAK dipanggil
{
  setSessions([]);
  let nextCalled = false;
  const res = mockRes();
  requireAuth(mockReq({ 'x-user-id': VICTIM.id }), res, (() => { nextCalled = true; }) as any);
  check('x-user-id saja tanpa sesi -> 401', res.statusCode === 401);
  check('x-user-id saja tanpa sesi -> next() tidak dipanggil', !nextCalled);
}

// 2. Spoofing murni via x-user-email → harus 401
{
  setSessions([]);
  let nextCalled = false;
  const res = mockRes();
  requireAuth(mockReq({ 'x-user-email': VICTIM.email }), res, (() => { nextCalled = true; }) as any);
  check('x-user-email saja tanpa sesi -> 401', res.statusCode === 401);
  check('x-user-email saja tanpa sesi -> next() tidak dipanggil', !nextCalled);
}

// 3. KRITIS: penyerang tanpa sesi mengirim x-user-id korban → 401 dan TIDAK ada sesi baru diterbitkan
{
  setSessions([]);
  let nextCalled = false;
  const res = mockRes();
  requireAuth(mockReq({ 'x-user-id': VICTIM.id, 'x-user-email': VICTIM.email }), res, (() => { nextCalled = true; }) as any);
  check('spoofing korban -> 401', res.statusCode === 401);
  check('spoofing korban -> next() tidak dipanggil', !nextCalled);
  // verifikasi via sessions: tidak ada sesi untuk korban
  const { getSessions } = await import('../server/auth.ts');
  check('spoofing korban -> daftar sesi tetap kosong', getSessions().length === 0);
}

// 4. Bearer token valid milik korban → lolos sebagai korban
{
  setSessions([]);
  const token = createSession(VICTIM.id);
  let nextCalled = false;
  const req = mockReq({ authorization: `Bearer ${token}` });
  const res = mockRes();
  requireAuth(req, res, (() => { nextCalled = true; }) as any);
  check('Bearer valid -> next() dipanggil', nextCalled);
  check('Bearer valid -> identitas = korban', req.user?.id === VICTIM.id);
}

// 5. Session cookie valid → lolos
{
  setSessions([]);
  const token = createSession(ATTACKER.id);
  let nextCalled = false;
  const req = mockReq({ cookie: `rgm_session=${token}` });
  const res = mockRes();
  requireAuth(req, res, (() => { nextCalled = true; }) as any);
  check('cookie sesi valid -> next() dipanggil', nextCalled);
  check('cookie sesi valid -> identitas benar', req.user?.id === ATTACKER.id);
}

// 6. Token tidak valid / sesi tidak ada → 401
{
  setSessions([]);
  let nextCalled = false;
  const res = mockRes();
  requireAuth(mockReq({ authorization: 'Bearer token-palsu-123' }), res, (() => { nextCalled = true; }) as any);
  check('Bearer palsu -> 401', res.statusCode === 401);
  check('Bearer palsu -> next() tidak dipanggil', !nextCalled);
}

// 7. Header x-user-id penyerang + Bearer valid milik korban → identitas tetap korban (header diabaikan)
{
  setSessions([]);
  const token = createSession(VICTIM.id);
  let nextCalled = false;
  const req = mockReq({ authorization: `Bearer ${token}`, 'x-user-id': ATTACKER.id });
  const res = mockRes();
  requireAuth(req, res, (() => { nextCalled = true; }) as any);
  check('Bearer korban + x-user-id penyerang -> next() dipanggil', nextCalled);
  check('Bearer korban + x-user-id penyerang -> identitas = korban (header diabaikan)', req.user?.id === VICTIM.id);
}

// 8. Tanpa kredensial sama sekali → 401
{
  setSessions([]);
  let nextCalled = false;
  const res = mockRes();
  requireAuth(mockReq({}), res, (() => { nextCalled = true; }) as any);
  check('tanpa kredensial -> 401', res.statusCode === 401);
  check('tanpa kredensial -> next() tidak dipanggil', !nextCalled);
}

console.log(`\nHasil: ${passed} lolos, ${failed} gagal`);
process.exit(failed > 0 ? 1 : 0);
