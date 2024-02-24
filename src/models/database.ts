import config from '../config';
import { Client } from 'pg';

const pgClient = new Client({
	connectionString: config.DATABASE_URL,
});

pgClient.connect();

export async function sql(template: TemplateStringsArray, ...substitutions: unknown[]) {
	try {
		const str = template.map((word, index) => (index !== template.length - 1 ? `${word}$${index + 1}` : word)).join(' ');
		const response = await pgClient.query(str, substitutions);
		return response.rows;
	} catch (err) {
		console.log(err);
		return null;
	}
}
