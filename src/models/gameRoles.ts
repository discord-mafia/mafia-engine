import { prisma } from 'index';

export async function getAllRoleNames() {
	try {
		const roleNames = (
			await prisma.role.findMany({
				select: {
					name: true,
				},
			})
		).map((r) => r.name.toLowerCase());
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
