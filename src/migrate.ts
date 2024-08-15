import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './controllers/database';

(async () => {
	await migrate(db, { migrationsFolder: './drizzle' });
})();
