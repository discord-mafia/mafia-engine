import { sign } from 'crypto';
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
		};

		switch (true) {
			case query.messageId != null:
				return await prisma.signup.findUnique({ where: { messageId: query.messageId }, include: includeScript });
			case query.signupId != null:
				return await prisma.signup.findUnique({ where: { id: query.signupId }, include: includeScript });
			default:
				return null;
		}
	} catch (err) {
		console.log(err);
		return null;
	}
}
