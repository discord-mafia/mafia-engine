import { prisma } from 'index';

type RoleNameQuery = {
	forceLowercase: boolean;
};
export async function getAllRoleNames(query: RoleNameQuery) {
	const forceLowerCase = query.forceLowercase ?? true;

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
