import { backupDatabase } from '../src/server/database.js';

const destination = await backupDatabase(process.argv[2]);
console.log(`[backup] SQLite backup created: ${destination}`);
