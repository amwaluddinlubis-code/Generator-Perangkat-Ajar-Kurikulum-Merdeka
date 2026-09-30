import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canAccessDocument,
  canChangeTenant,
  canDeleteUser,
  canListUser,
  canUpdateUser,
  canVerifyUser
} from '../src/server/authorization.ts';

const superAdmin = { id: 'sa', schoolId: 'school-a', role: 'SUPER_ADMIN' as const, status: 'VERIFIED' as const };
const adminA = { id: 'admin-a', schoolId: 'school-a', role: 'ADMIN' as const, status: 'VERIFIED' as const };
const adminB = { id: 'admin-b', schoolId: 'school-b', role: 'ADMIN' as const, status: 'VERIFIED' as const };
const teacherA = { id: 'teacher-a', schoolId: 'school-a', role: 'GURU' as const, status: 'VERIFIED' as const };
const teacherB = { id: 'teacher-b', schoolId: 'school-b', role: 'GURU' as const, status: 'VERIFIED' as const };

test('tenant user listing is isolated by school', () => {
  assert.equal(canListUser(adminA, teacherA), true);
  assert.equal(canListUser(adminA, teacherB), false);
  assert.equal(canListUser(adminA, adminB), false);
  assert.equal(canListUser(superAdmin, teacherB), true);
  assert.equal(canListUser(teacherA, teacherA), true);
  assert.equal(canListUser(teacherA, teacherB), false);
});

test('verification cannot be escalated by school admin', () => {
  assert.equal(canVerifyUser(adminA, teacherA), true);
  assert.equal(canVerifyUser(adminA, teacherB), false);
  assert.equal(canVerifyUser(adminA, adminA), false);
  assert.equal(canVerifyUser(adminA, adminB), false);
  assert.equal(canVerifyUser(superAdmin, adminB), true);
  assert.equal(canVerifyUser(superAdmin, superAdmin), false);
});

test('profile update policy blocks cross-tenant and privilege changes', () => {
  assert.equal(canUpdateUser(teacherA, teacherA), true);
  assert.equal(canUpdateUser(teacherA, teacherB), false);
  assert.equal(canUpdateUser(adminA, teacherA), true);
  assert.equal(canUpdateUser(adminA, teacherB), false);
  assert.equal(canUpdateUser(adminA, adminA), true);
  assert.equal(canUpdateUser(adminA, adminB), false);
  assert.equal(canUpdateUser(superAdmin, adminB), true);
  assert.equal(canUpdateUser(adminA, superAdmin), false);
});

test('delete policy blocks self, cross-tenant and privileged deletion', () => {
  assert.equal(canDeleteUser(adminA, teacherA), true);
  assert.equal(canDeleteUser(adminA, teacherB), false);
  assert.equal(canDeleteUser(adminA, adminA), false);
  assert.equal(canDeleteUser(adminA, adminB), false);
  assert.equal(canDeleteUser(superAdmin, adminB), true);
  assert.equal(canDeleteUser(superAdmin, superAdmin), false);
});

test('document policy follows tenant and ownership boundaries', () => {
  const own = { authorId: 'teacher-a', schoolId: 'school-a' };
  const sameSchool = { authorId: 'teacher-other', schoolId: 'school-a' };
  const otherSchool = { authorId: 'teacher-b', schoolId: 'school-b' };

  assert.equal(canAccessDocument(teacherA, own), true);
  assert.equal(canAccessDocument(teacherA, sameSchool), false);
  assert.equal(canAccessDocument(teacherA, otherSchool), false);
  assert.equal(canAccessDocument(adminA, sameSchool), true);
  assert.equal(canAccessDocument(adminA, otherSchool), false);
  assert.equal(canAccessDocument(superAdmin, otherSchool), true);
});

test('only Super Admin can change tenant membership', () => {
  assert.equal(canChangeTenant(superAdmin), true);
  assert.equal(canChangeTenant(adminA), false);
  assert.equal(canChangeTenant(teacherA), false);
});
