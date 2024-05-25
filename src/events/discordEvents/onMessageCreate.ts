import { ChannelType, Message, Webhook } from 'discord.js';
import { client } from '../../controllers/botController';
import { getAnonymousGroup, getAnonymousProfiles } from '../../models/anonymity';

export default async function OnMessageCreate(msg: Message<boolean>) {
	if (!msg.channel.isThread()) return;

	const threadChannel = msg.channel;
	const parentChannelID = threadChannel.parentId;
	if (!parentChannelID) return;
	const group = await getAnonymousGroup(parentChannelID);
	if (!group) return;

	const profiles = await getAnonymousProfiles(group.id);
	if (!profiles || profiles.length === 0) return;

	const filtered = profiles.filter((v) => v.discordId == msg.author.id);
	const profile = filtered[0];
	if (!profile) return;

	const parent = msg.channel.parent;
	if (!parent) return;
	if (parent.type != ChannelType.GuildText) return;

	const clientID = client.user?.id;
	if (!clientID) return;

	const webhooks = await parent.fetchWebhooks();
	let webhook: Webhook | undefined = webhooks.find((wh) => wh.owner?.id == clientID);
	if (!webhook) {
		const newWH = await parent.createWebhook({ name: 'Anonymity' });
		webhook = newWH;
	}

	const stickerURLs = msg.stickers.map((sticker) => {
		const url = `https://media.discordapp.net/stickers/${sticker.id}.gif?size=2048`;
		return url;
	});

	const msgContent = msg.content + '\n' + stickerURLs.join('\n');

	if (webhook) {
		webhook
			.send({
				content: msgContent,
				avatarURL: profile.avatarURI ?? undefined,
				username: profile.name ?? undefined,
			})
			.catch(() => {});
	}
}
