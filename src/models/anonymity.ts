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

export async function linkChannelToGroup(groupID: number, channelId: string) {
	const update = await prisma.anonymousGroup
		.update({
			where: {
				id: groupID,
			},
			data: {
				linkedChannels: {
					push: channelId,
				},
			},
		})
		.catch(null);

	return update;
}
