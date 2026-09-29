import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { DatabaseSync, backup as sqliteBackup } from 'node:sqlite';

export interface DbUser {
  id: string;
  name: string;
  email: string;
  schoolName: string;
  schoolId: string;
  npsn?: string;
  nip?: string;
  jenjang: 'SD' | 'SMP' | 'SMA' | 'SMK';
  mataPelajaran: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'GURU';
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';
  avatarUrl?: string;
  registeredAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export interface DbDocument {
  id: string;
  title: string;
  docType: 'modul_ajar' | 'rpp' | 'soal_ujian' | 'kktp_atp' | 'lkpd' | 'prota_promes' | 'modul_p5';
  jenjang: 'SD' | 'SMP' | 'SMA' | 'SMK';
  tingkat: string;
  fase: string;
  mataPelajaran: string;
  topik: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  schoolName: string;
  schoolId: string;
  isPublic?: boolean;
  durationMinutes?: number;
}

export interface DbAuditLog {
  id: string;
  tenantId?: string;
  actorUserId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  success: boolean;
  ip?: string;
  createdAt: string;
}

export interface DatabaseState {
  users: DbUser[];
  documents: DbDocument[];
  auditLogs: DbAuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = process.env.RGM_DB_PATH || (process.argv.includes('--test') ? ':memory:' : path.join(DATA_DIR, 'app.sqlite'));
const LEGACY_JSON_PATH = path.join(DATA_DIR, 'db.json');

let database: DatabaseSync | null = null;

function stableSchoolId(name: string, npsn?: string): string {
  const source = (npsn || name).trim().toLowerCase();
  return 'school_' + createHash('sha256').update(source).digest('hex').slice(0, 20);
}

function nowIso(): string {
  return new Date().toISOString();
}

function getDb(): DatabaseSync {
  if (database) return database;

  fs.mkdirSync(DATA_DIR, { recursive: true });
  database = new DatabaseSync(DB_PATH, { timeout: 5000 });
  database.exec('PRAGMA foreign_keys = ON;');
  database.exec('PRAGMA journal_mode = WAL;');
  database.exec('PRAGMA synchronous = FULL;');
  database.exec('PRAGMA busy_timeout = 5000;');

  const userColumns = database.prepare('PRAGMA table_info(users)').all() as Array<{ name: string }>;
  if (!userColumns.some(column => column.name === 'deleted_at')) {
    database.exec('ALTER TABLE users ADD COLUMN deleted_at TEXT');
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS schools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      npsn TEXT,
      jenjang TEXT NOT NULL CHECK (jenjang IN ('SD','SMP','SMA','SMK','MULTI')),
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','ARCHIVED')),
      created_at TEXT NOT NULL
    ) STRICT;

    CREATE UNIQUE INDEX IF NOT EXISTS ux_schools_npsn
      ON schools(npsn) WHERE npsn IS NOT NULL AND npsn <> '';

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL COLLATE NOCASE UNIQUE,
      school_id TEXT NOT NULL REFERENCES schools(id),
      npsn TEXT,
      nip TEXT,
      jenjang TEXT NOT NULL CHECK (jenjang IN ('SD','SMP','SMA','SMK')),
      mata_pelajaran TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN','ADMIN','GURU')),
      status TEXT NOT NULL CHECK (status IN ('VERIFIED','PENDING','REJECTED')),
      avatar_url TEXT,
      registered_at TEXT NOT NULL,
      verified_at TEXT,
      verified_by TEXT,
      deleted_at TEXT
    ) STRICT;

    CREATE TABLE IF NOT EXISTS school_memberships (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      school_id TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
      membership_role TEXT NOT NULL CHECK (membership_role IN ('OWNER','ADMIN','MEMBER')),
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDED','REVOKED')),
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, school_id)
    ) STRICT;

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      school_id TEXT NOT NULL REFERENCES schools(id),
      title TEXT NOT NULL,
      doc_type TEXT NOT NULL CHECK (doc_type IN ('modul_ajar','rpp','soal_ujian','kktp_atp','lkpd','prota_promes','modul_p5')),
      jenjang TEXT NOT NULL CHECK (jenjang IN ('SD','SMP','SMA','SMK')),
      tingkat TEXT NOT NULL,
      fase TEXT NOT NULL,
      mata_pelajaran TEXT NOT NULL,
      topik TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      author_id TEXT NOT NULL REFERENCES users(id),
      author_name TEXT NOT NULL,
      school_name_snapshot TEXT NOT NULL,
      is_public INTEGER NOT NULL DEFAULT 0 CHECK (is_public IN (0,1)),
      duration_minutes REAL,
      deleted_at TEXT
    ) STRICT;

    CREATE INDEX IF NOT EXISTS ix_documents_school ON documents(school_id, created_at);
    CREATE INDEX IF NOT EXISTS ix_documents_author ON documents(author_id, created_at);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      tenant_id TEXT REFERENCES schools(id),
      actor_user_id TEXT REFERENCES users(id),
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      success INTEGER NOT NULL CHECK (success IN (0,1)),
      ip TEXT,
      created_at TEXT NOT NULL
    ) STRICT;

    CREATE INDEX IF NOT EXISTS ix_audit_tenant_time ON audit_logs(tenant_id, created_at);
    CREATE INDEX IF NOT EXISTS ix_audit_actor_time ON audit_logs(actor_user_id, created_at);

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      last_seen_at INTEGER NOT NULL
    ) STRICT;

    CREATE INDEX IF NOT EXISTS ix_sessions_expiry ON sessions(expires_at);

    CREATE TABLE IF NOT EXISTS rate_limits (
      rate_key TEXT PRIMARY KEY,
      window_started_at INTEGER NOT NULL,
      request_count INTEGER NOT NULL
    ) STRICT;
  `);

  return database;
}

function ensureSchool(name: string, npsn: string | undefined, jenjang: string): string {
  const db = getDb();
  const normalizedName = (name || 'Sekolah Belum Diatur').trim() || 'Sekolah Belum Diatur';
  const existing = npsn
    ? db.prepare('SELECT id FROM schools WHERE npsn = ? LIMIT 1').get(npsn) as { id: string } | undefined
    : db.prepare('SELECT id FROM schools WHERE name = ? LIMIT 1').get(normalizedName) as { id: string } | undefined;

  if (existing?.id) return existing.id;

  const id = stableSchoolId(normalizedName, npsn);
  db.prepare(
    'INSERT OR IGNORE INTO schools (id, name, npsn, jenjang, created_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, normalizedName, npsn || null, ['SD','SMP','SMA','SMK'].includes(jenjang) ? jenjang : 'MULTI', nowIso());

  return id;
}

function mapUser(row: Record<string, unknown>): DbUser {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    schoolName: String(row.school_name),
    schoolId: String(row.school_id),
    npsn: row.npsn ? String(row.npsn) : undefined,
    nip: row.nip ? String(row.nip) : undefined,
    jenjang: row.jenjang as DbUser['jenjang'],
    mataPelajaran: String(row.mata_pelajaran),
    role: row.role as DbUser['role'],
    status: row.status as DbUser['status'],
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    registeredAt: String(row.registered_at),
    verifiedAt: row.verified_at ? String(row.verified_at) : undefined,
    verifiedBy: row.verified_by ? String(row.verified_by) : undefined
  };
}

function mapDocument(row: Record<string, unknown>): DbDocument {
  return {
    id: String(row.id),
    title: String(row.title),
    docType: row.doc_type as DbDocument['docType'],
    jenjang: row.jenjang as DbDocument['jenjang'],
    tingkat: String(row.tingkat),
    fase: String(row.fase),
    mataPelajaran: String(row.mata_pelajaran),
    topik: String(row.topik),
    content: String(row.content),
    createdAt: String(row.created_at),
    authorId: String(row.author_id),
    authorName: String(row.author_name),
    schoolName: String(row.school_name_snapshot),
    schoolId: String(row.school_id),
    isPublic: Number(row.is_public) === 1,
    durationMinutes: row.duration_minutes === null || row.duration_minutes === undefined ? undefined : Number(row.duration_minutes)
  };
}

function mapAudit(row: Record<string, unknown>): DbAuditLog {
  return {
    id: String(row.id),
    tenantId: row.tenant_id ? String(row.tenant_id) : undefined,
    actorUserId: row.actor_user_id ? String(row.actor_user_id) : undefined,
    action: String(row.action),
    resourceType: String(row.resource_type),
    resourceId: row.resource_id ? String(row.resource_id) : undefined,
    success: Number(row.success) === 1,
    ip: row.ip ? String(row.ip) : undefined,
    createdAt: String(row.created_at)
  };
}

function insertUser(user: Record<string, any>, schoolId?: string): void {
  const db = getDb();
  const resolvedSchoolId = schoolId || user.schoolId || ensureSchool(user.schoolName, user.npsn, user.jenjang);
  db.prepare(`
    INSERT OR REPLACE INTO users
      (id,name,email,school_id,npsn,nip,jenjang,mata_pelajaran,role,status,avatar_url,registered_at,verified_at,verified_by,deleted_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    user.id, user.name, user.email, resolvedSchoolId, user.npsn || null, user.nip || null,
    user.jenjang, user.mataPelajaran, user.role, user.status, user.avatarUrl || null,
    user.registeredAt, user.verifiedAt || null, user.verifiedBy || null, user.deletedAt || null
  );
  db.prepare(`
    INSERT OR REPLACE INTO school_memberships
      (user_id,school_id,membership_role,status,created_at)
    VALUES (?,?,?,?,?)
  `).run(
    user.id,
    resolvedSchoolId,
    user.role === 'SUPER_ADMIN' ? 'OWNER' : user.role === 'ADMIN' ? 'ADMIN' : 'MEMBER',
    user.status === 'REJECTED' ? 'REVOKED' : 'ACTIVE',
    user.registeredAt || nowIso()
  );
}

function insertDocument(document: Record<string, any>): void {
  const db = getDb();
  const schoolId = document.schoolId || ensureSchool(document.schoolName, document.npsn, document.jenjang);
  db.prepare(`
    INSERT OR REPLACE INTO documents
      (id,school_id,title,doc_type,jenjang,tingkat,fase,mata_pelajaran,topik,content,created_at,author_id,author_name,school_name_snapshot,is_public,duration_minutes,deleted_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    document.id, schoolId, document.title, document.docType, document.jenjang, document.tingkat,
    document.fase, document.mataPelajaran, document.topik, document.content, document.createdAt,
    document.authorId, document.authorName, document.schoolName, document.isPublic ? 1 : 0,
    document.durationMinutes ?? null, null
  );
}

function migrateLegacyJson(seedUsers: Record<string, any>[], seedDocuments: Record<string, any>[], seedAuditLogs: Record<string, any>[]): void {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number };
  if (Number(count.count) > 0) return;

  let sourceUsers = seedUsers;
  let sourceDocuments = seedDocuments;
  let sourceAuditLogs = seedAuditLogs;

  if (fs.existsSync(LEGACY_JSON_PATH)) {
    try {
      const legacy = JSON.parse(fs.readFileSync(LEGACY_JSON_PATH, 'utf8'));
      if (Array.isArray(legacy.users) && legacy.users.length) sourceUsers = legacy.users;
      if (Array.isArray(legacy.documents)) sourceDocuments = legacy.documents;
      if (Array.isArray(legacy.auditLogs)) sourceAuditLogs = legacy.auditLogs;
      console.log('[DB] Migrating legacy data/db.json into SQLite');
    } catch (error) {
      console.warn('[DB] Legacy db.json could not be read; using code seed:', (error as Error).message);
    }
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    for (const user of sourceUsers) insertUser(user);
    const validUserIds = new Set(sourceUsers.map(user => user.id));
    for (const document of sourceDocuments) {
      if (validUserIds.has(document.authorId)) insertDocument(document);
    }
    for (const audit of sourceAuditLogs) {
      db.prepare(`
        INSERT OR IGNORE INTO audit_logs
          (id,tenant_id,actor_user_id,action,resource_type,resource_id,success,ip,created_at)
        VALUES (?,?,?,?,?,?,?,?,?)
      `).run(
        audit.id,
        audit.tenantId || sourceUsers.find(user => user.id === audit.actorUserId)?.schoolId || null,
        audit.actorUserId || null,
        audit.action,
        audit.resourceType,
        audit.resourceId || null,
        audit.success ? 1 : 0,
        audit.ip || null,
        audit.createdAt || nowIso()
      );
    }
    db.prepare(`INSERT OR REPLACE INTO schema_meta (key,value) VALUES ('data_model_version','1')`).run();
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function getOrCreateSchool(name: string, npsn?: string, jenjang: string = 'MULTI'): string {
  return ensureSchool(name, npsn, jenjang);
}

export function updateSchool(schoolId: string, patch: { name?: string; npsn?: string; jenjang?: string }): void {
  const db = getDb();
  const current = db.prepare('SELECT name, npsn, jenjang FROM schools WHERE id = ?').get(schoolId) as Record<string, unknown> | undefined;
  if (!current) throw new Error('School not found');

  db.prepare(`
    UPDATE schools
    SET name = ?, npsn = ?, jenjang = ?
    WHERE id = ?
  `).run(
    patch.name?.trim() || String(current.name),
    patch.npsn?.trim() || (current.npsn ? String(current.npsn) : null),
    ['SD','SMP','SMA','SMK','MULTI'].includes(String(patch.jenjang))
      ? patch.jenjang
      : String(current.jenjang),
    schoolId
  );
}

export function initializeDatabase(seedUsers: Record<string, any>[], seedDocuments: Record<string, any>[], seedAuditLogs: Record<string, any>[]): void {
  getDb();
  migrateLegacyJson(seedUsers, seedDocuments, seedAuditLogs);
}

export function loadState(): DatabaseState {
  const db = getDb();
  const users = (db.prepare(`
    SELECT u.*, s.name AS school_name
    FROM users u JOIN schools s ON s.id = u.school_id
    WHERE u.deleted_at IS NULL
    ORDER BY u.registered_at DESC
  `).all() as Record<string, unknown>[]).map(mapUser);

  const documents = (db.prepare(`
    SELECT *
    FROM documents
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
  `).all() as Record<string, unknown>[]).map(mapDocument);

  const auditLogs = (db.prepare(`
    SELECT *
    FROM audit_logs
    ORDER BY created_at DESC
    LIMIT 5000
  `).all() as Record<string, unknown>[]).map(mapAudit);

  return { users, documents, auditLogs };
}

export function getUserById(userId: string): DbUser | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT u.*, s.name AS school_name
    FROM users u JOIN schools s ON s.id = u.school_id
    WHERE u.id = ? AND u.deleted_at IS NULL
  `).get(userId) as Record<string, unknown> | undefined;
  return row ? mapUser(row) : null;
}

export function getUserByEmail(email: string): DbUser | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT u.*, s.name AS school_name
    FROM users u JOIN schools s ON s.id = u.school_id
    WHERE lower(u.email) = lower(?) AND u.deleted_at IS NULL
  `).get(email) as Record<string, unknown> | undefined;
  return row ? mapUser(row) : null;
}

export function createUser(user: Record<string, any>): DbUser {
  const db = getDb();
  const schoolId = user.schoolId || ensureSchool(user.schoolName, user.npsn, user.jenjang);
  db.exec('BEGIN IMMEDIATE');
  try {
    insertUser({ ...user, schoolId }, schoolId);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  return getUserById(user.id)!;
}

export function updateUser(user: Record<string, any>): DbUser {
  const db = getDb();
  const current = getUserById(user.id);
  if (!current) throw new Error('User not found');

  const schoolId = user.schoolId || current.schoolId;
  if (schoolId !== current.schoolId) {
    ensureSchool(user.schoolName, user.npsn, user.jenjang);
  }

  db.exec('BEGIN IMMEDIATE');
  try {
    if (schoolId !== current.schoolId) {
      db.prepare('DELETE FROM school_memberships WHERE user_id = ?').run(user.id);
    }
    insertUser({ ...current, ...user, schoolId }, schoolId);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  return getUserById(user.id)!;
}

export function deleteUser(userId: string): void {
  const db = getDb();
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('UPDATE users SET status = ?, deleted_at = ? WHERE id = ? AND deleted_at IS NULL').run('REJECTED', nowIso(), userId);
    db.prepare('UPDATE school_memberships SET status = ? WHERE user_id = ?').run('REVOKED', userId);
    db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function getDocumentById(documentId: string): DbDocument | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT *
    FROM documents
    WHERE id = ? AND deleted_at IS NULL
  `).get(documentId) as Record<string, unknown> | undefined;
  return row ? mapDocument(row) : null;
}

export function createDocument(document: Record<string, any>): DbDocument {
  const db = getDb();
  const schoolId = document.schoolId || ensureSchool(document.schoolName, document.npsn, document.jenjang);
  db.exec('BEGIN IMMEDIATE');
  try {
    insertDocument({ ...document, schoolId },);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  return getDocumentById(document.id)!;
}

export function deleteDocument(documentId: string): void {
  const db = getDb();
  db.prepare('UPDATE documents SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL').run(nowIso(), documentId);
}

export function appendAuditLog(entry: Record<string, any>): void {
  const db = getDb();
  db.prepare(`
    INSERT OR IGNORE INTO audit_logs
      (id,tenant_id,actor_user_id,action,resource_type,resource_id,success,ip,created_at)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(
    entry.id,
    entry.tenantId || null,
    entry.actorUserId || null,
    entry.action,
    entry.resourceType,
    entry.resourceId || null,
    entry.success ? 1 : 0,
    entry.ip || null,
    entry.createdAt || nowIso()
  );
}

export function getAuditLogs(limit = 100, tenantId?: string): DbAuditLog[] {
  const db = getDb();
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const rows = tenantId
    ? db.prepare(`
        SELECT *
        FROM audit_logs
        WHERE tenant_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `).all(tenantId, safeLimit)
    : db.prepare(`
        SELECT *
        FROM audit_logs
        ORDER BY created_at DESC
        LIMIT ?
      `).all(safeLimit);

  return (rows as Record<string, unknown>[]).map(mapAudit);
}

export function createSessionRecord(tokenHash: string, userId: string, createdAt: number, expiresAt: number): void {
  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO sessions (token_hash,user_id,created_at,expires_at,last_seen_at)
    VALUES (?,?,?,?,?)
  `).run(tokenHash, userId, createdAt, expiresAt, createdAt);
}

export function getSessionUserId(tokenHash: string, now: number, idleTtlMs = 2 * 60 * 60 * 1000): string | null {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE expires_at <= ? OR last_seen_at + ? <= ?').run(now, idleTtlMs, now);
  const row = db.prepare('SELECT user_id FROM sessions WHERE token_hash = ? AND expires_at > ? AND last_seen_at + ? > ?').get(tokenHash, now, idleTtlMs, now) as { user_id: string } | undefined;
  if (!row) return null;
  db.prepare('UPDATE sessions SET last_seen_at = ? WHERE token_hash = ?').run(now, tokenHash);
  return row.user_id;
}

export function revokeSession(tokenHash: string): void {
  getDb().prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

export function checkRateLimitRecord(key: string, maxRequests: number, windowMs: number, now: number): { allowed: boolean; retryAfterSeconds: number } {
  const db = getDb();
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare('DELETE FROM rate_limits WHERE window_started_at + ? <= ?').run(windowMs, now);
    const existing = db.prepare('SELECT window_started_at, request_count FROM rate_limits WHERE rate_key = ?').get(key) as { window_started_at: number; request_count: number } | undefined;

    if (!existing || existing.window_started_at + windowMs <= now) {
      db.prepare(`
        INSERT OR REPLACE INTO rate_limits (rate_key,window_started_at,request_count)
        VALUES (?,?,?)
      `).run(key, now, 1);
      db.exec('COMMIT');
      return { allowed: true, retryAfterSeconds: 0 };
    }

    const nextCount = existing.request_count + 1;
    db.prepare('UPDATE rate_limits SET request_count = ? WHERE rate_key = ?').run(nextCount, key);

    const result = nextCount <= maxRequests
      ? { allowed: true, retryAfterSeconds: 0 }
      : {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil((existing.window_started_at + windowMs - now) / 1000))
        };

    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function resetRateLimitRecord(key: string): void {
  getDb().prepare('DELETE FROM rate_limits WHERE rate_key = ?').run(key);
}

export async function backupDatabase(destination?: string): Promise<string> {
  const target = destination || path.join(DATA_DIR, 'backups', `app-${new Date().toISOString().replace(/[:.]/g, '-')}.sqlite`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await sqliteBackup(getDb(), target, { rate: 100 });
  return target;
}

export { DB_PATH };
