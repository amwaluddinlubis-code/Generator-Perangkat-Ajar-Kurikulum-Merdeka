import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync, backup as sqliteBackup } from 'node:sqlite';

const source = process.argv[2];
if (!source) {
  console.error('Usage: npm run restore -- <backup.sqlite>');
  process.exit(1);
}
if (process.env.RGM_RESTORE_CONFIRM !== 'YES') {
  console.error('Restore is destructive. Set RGM_RESTORE_CONFIRM=YES and stop the application first.');
  process.exit(1);
}
if (!fs.existsSync(source)) {
  console.error(`Backup not found: ${source}`);
  process.exit(1);
}

const dataDir = path.resolve(process.cwd(), 'data');
const target = process.env.RGM_DB_PATH || path.join(dataDir, 'app.sqlite');
const temp = `${target}.restore-${Date.now()}`;
fs.mkdirSync(path.dirname(target), { recursive: true });

const sourceDb = new DatabaseSync(source, { readOnly: true });
await sqliteBackup(sourceDb, temp, { rate: 100 });
sourceDb.close();

if (fs.existsSync(target)) {
  const previous = `${target}.before-restore-${Date.now()}`;
  fs.renameSync(target, previous);
  console.log(`[restore] Previous database preserved at: ${previous}`);
}
fs.renameSync(temp, target);
for (const suffix of ['-wal', '-shm']) {
  const sidecar = `${target}${suffix}`;
  if (fs.existsSync(sidecar)) fs.rmSync(sidecar, { force: true });
}
console.log(`[restore] Database restored from: ${source}`);
