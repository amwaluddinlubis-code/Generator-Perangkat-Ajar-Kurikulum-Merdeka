import assert from 'node:assert/strict';
import test from 'node:test';
import { hashPassword, isValidNewPassword, verifyPassword } from '../src/server/security.ts';
import { validateLoginPayload, validatePasswordPayload } from '../src/server/validation.ts';

test('password hashing roundtrips and rejects wrong input', () => {
  const hash = hashPassword('Contoh-Kuat-9a8b7c');
  assert.match(hash, /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  assert.equal(verifyPassword('Contoh-Kuat-9a8b7c', hash), true);
  assert.equal(verifyPassword('salah12345', hash), false);
  assert.equal(verifyPassword('Contoh-Kuat-9a8b7c', 'bukan-format-hash'), false);
  assert.equal(verifyPassword('Contoh-Kuat-9a8b7c', ''), false);
});

test('password salts are unique per hash', () => {
  const a = hashPassword('kata-sandi-sama');
  const b = hashPassword('kata-sandi-sama');
  assert.notEqual(a, b);
  assert.equal(verifyPassword('kata-sandi-sama', a), true);
  assert.equal(verifyPassword('kata-sandi-sama', b), true);
});

test('new password length rules', () => {
  assert.equal(isValidNewPassword('pendek1'), false);
  assert.equal(isValidNewPassword('delapan88'), true);
  assert.equal(isValidNewPassword('x'.repeat(129)), false);
  assert.equal(isValidNewPassword(12345), false);
});

test('password payload validation', () => {
  assert.equal(validatePasswordPayload({}).ok, false);
  assert.equal(validatePasswordPayload({ newPassword: 'singkat' }).ok, false);
  assert.equal(validatePasswordPayload({ newPassword: 'cukup-panjang-1' }).ok, true);
  assert.equal(validatePasswordPayload({ newPassword: 'cukup-panjang-1', currentPassword: 'lama-12345' }).ok, true);
});

test('login payload accepts optional password', () => {  const ok = validateLoginPayload({ email: 'guru@guru.smp.belajar.id', password: 'rahasia123' });
  assert.equal(ok.ok, true);
  assert.equal(ok.value?.password, 'rahasia123');
  const noPw = validateLoginPayload({ email: 'guru@guru.smp.belajar.id' });
  assert.equal(noPw.ok, true);
  assert.equal(noPw.value?.password, undefined);
  assert.equal(validateLoginPayload({ email: 'guru@guru.smp.belajar.id', password: 'x'.repeat(129) }).ok, false);
});
