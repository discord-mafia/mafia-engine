import { prisma } from '..';

export async function anonymousGroupExistsInChannel(channelId: string) {
	const group = await prisma.anonymousGroup
		.findFirst({
			where: {
				linkedChannels: {
					has: channelId,
				},
			},
		})
		.catch(null);

	return !!group;
}

export async function createAnonymousGroup(channelId: string) {
	const group = await prisma.anonymousGroup
		.create({
			data: {
				linkedChannels: [channelId],
			},
		})
		.catch(null);

	return !!group;
}

export async function getAnonymousGroup(channelId: string) {
	const group = await prisma.anonymousGroup
		.findFirst({
			where: {
				linkedChannels: {
					has: channelId,
				},
			},
		})
		.catch(null);

	return group;
}
