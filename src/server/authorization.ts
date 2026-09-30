export type AccessRole = 'SUPER_ADMIN' | 'ADMIN' | 'GURU';
export type AccountStatus = 'VERIFIED' | 'PENDING' | 'REJECTED';

export interface Principal {
  id: string;
  schoolId: string;
  role: AccessRole;
  status: AccountStatus;
}

export interface TargetUser extends Principal {}

export interface ProtectedDocument {
  authorId: string;
  schoolId: string;
}

export function isPrivileged(role: AccessRole): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN';
}

export function canListUser(principal: Principal, target: TargetUser): boolean {
  if (principal.role === 'SUPER_ADMIN') return true;
  if (principal.role === 'ADMIN') return principal.schoolId === target.schoolId || principal.id === target.id;
  return principal.id === target.id;
}

export function canVerifyUser(principal: Principal, target: TargetUser): boolean {
  if (principal.role !== 'ADMIN' && principal.role !== 'SUPER_ADMIN') return false;
  if (target.role === 'SUPER_ADMIN') return false;
  if (target.role === 'ADMIN' && principal.role !== 'SUPER_ADMIN') return false;
  return principal.role === 'SUPER_ADMIN' || principal.schoolId === target.schoolId;
}

export function canUpdateUser(principal: Principal, target: TargetUser): boolean {
  if (principal.id === target.id) return true;
  if (principal.role === 'SUPER_ADMIN') return target.role !== 'SUPER_ADMIN';
  if (principal.role === 'ADMIN') return target.role === 'GURU' && principal.schoolId === target.schoolId;
  return false;
}

export function canChangeTenant(principal: Principal): boolean {
  return principal.role === 'SUPER_ADMIN';
}

export function canDeleteUser(principal: Principal, target: TargetUser): boolean {
  if (principal.id === target.id) return false;
  if (target.role === 'SUPER_ADMIN') return false;
  if (principal.role === 'SUPER_ADMIN') return true;
  return principal.role === 'ADMIN' && target.role === 'GURU' && principal.schoolId === target.schoolId;
}

export function canAccessDocument(principal: Principal, document: ProtectedDocument): boolean {
  if (principal.role === 'SUPER_ADMIN') return true;
  if (principal.role === 'ADMIN') return principal.schoolId === document.schoolId;
  return principal.id === document.authorId;
}
