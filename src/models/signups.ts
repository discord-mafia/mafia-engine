import { prisma } from '..';

export type FullSignup = NonNullable<Awaited<ReturnType<typeof getSignup>>>;

type SignupQuery = {
	messageId?: string;
	signupId?: number;
};
export async function getSignup(query: SignupQuery) {
	try {
		const includeScript = {
			categories: {
				include: {
					users: {
						include: {
							user: true,
						},
					},
				},
			},
			balancers: {
				include: {
					user: true,
				},
			},
			hosts: {
				include: {
					user: true,
				},
			},
			moderators: {
				include: {
					user: true,
				},
			},
		};

		if (query.messageId != null)
			return await prisma.signup.findUnique({
				where: { messageId: query.messageId },
				include: includeScript,
			});
		else if (query.signupId != null) return await prisma.signup.findUnique({ where: { id: query.signupId }, include: includeScript });

		return null;
	} catch (err) {
		console.log(err);
		return null;
	}
}
