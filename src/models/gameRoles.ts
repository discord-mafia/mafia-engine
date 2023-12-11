import { prisma } from 'index';
import { rawQuery } from '.';
import { sql } from 'drizzle-orm';
import { z } from 'zod';

type RoleNameQuery = {
	forceLowercase: boolean;
};
export async function getAllRoleNames(query?: RoleNameQuery) {
	const forceLowerCase = query?.forceLowercase ?? true;

	try {
		const roleNames = (
			await prisma.role.findMany({
				select: {
					name: true,
				},
			})
		).map((r) => (forceLowerCase ? r.name.toLowerCase() : r.name));
		return roleNames;
	} catch (err) {
		return null;
	}
}

export async function getRole(name: string) {
	try {
		const role = await prisma.role.findFirst({
			where: {
				name: {
					equals: name,
					mode: 'insensitive',
				},
			},
		});
		return role;
	} catch (err) {
		return null;
	}
}

export type RoleNameQueryOptions = {
	take: number;
};
const roleNameResponseValidator = z.array(
	z.object({
		name: z.string(),
	})
);

export async function getRoleNames(name: string, options?: RoleNameQueryOptions) {
	const take = options?.take ?? 1;
	try {
		const data = await rawQuery(sql`
			SELECT name
			FROM "Role"
			ORDER BY similarity(name, ${name}) DESC
			LIMIT ${take};
		`);

		const validated = roleNameResponseValidator.parse(data);
		return validated;
	} catch (err) {
		console.log(err);
		return null;
	}
}
