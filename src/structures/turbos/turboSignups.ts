import { type Guild, ChannelType, Colors } from 'discord.js';
import { client, prisma } from '../..';
import { formatSignupEmbed } from '../../util/embeds';
import { type FullSignup } from '@models/signups';
import { createAutomatedGame } from '@models/automaticGames';

async function getMessage(guild: Guild, channelId: string, messageId: string) {
	try {
		const channel = guild.channels.cache.get(channelId);
		if (!channel || channel.type != ChannelType.GuildText) return null;
		const message = await channel.messages.fetch(messageId);
		return message ?? null;
	} catch (err) {
		return null;
	}
}

export async function setupTurbo(signup: FullSignup) {
	const guild = await client.guilds.fetch(signup.serverId);
	if (!guild) return;
	const message = await getMessage(guild, signup.channelId, signup.messageId);
	if (!message) return;
	message.channel.send({ content: `Turbo signup is full. Imagine there's confirmation functionality here`, allowedMentions: { users: [] } });

	const focusedCategory = signup.categories.find((c) => c.isFocused);
	if (!focusedCategory) return;

	const game = await createAutomatedGame(guild.id);
	if (!game) return message.channel.send({ content: `Failed to create automated game.`, allowedMentions: { users: [] } });

	const role = await guild.roles.create({
		name: `Turbo ${game.id}`,
		mentionable: true,
		color: Colors.Yellow,
	});

	const category = await guild.channels.create({
		name: `Turbo ${game.id}`,
		type: ChannelType.GuildCategory,
		permissionOverwrites: [
			{
				id: guild.roles.everyone.id,
				deny: ['ViewChannel'],
			},
		],
	});

	const infoChannel = await guild.channels.create({
		name: `turbo-info`,
		type: ChannelType.GuildText,
		parent: category,
		permissionOverwrites: [
			{
				id: guild.roles.everyone.id,
				allow: ['ViewChannel'],
			},
			{
				id: guild.roles.everyone.id,
				deny: ['SendMessages'],
			},
		],
	});

	const chatChannel = await guild.channels.create({
		name: `turbo-chat`,
		type: ChannelType.GuildText,
		parent: category,
		permissionOverwrites: [
			{
				id: guild.roles.everyone.id,
				allow: ['ViewChannel'],
			},
			{
				id: guild.roles.everyone.id,
				deny: ['SendMessages'],
			},
			{
				id: role.id,
				allow: ['SendMessages'],
			},
		],
	});

	const mafiaChannel = await guild.channels.create({
		name: `turbo-mafia`,
		type: ChannelType.GuildText,
		parent: category,
	});

	// const randomizedGame = ThinkTwice.randGame();
	// if (focusedCategory.users.length != randomizedGame.length)
	// 	return message.channel.send({ content: `Something went wrong.`, allowedMentions: { users: [] } });
	// for (const user of focusedCategory.users) {
	// 	const attachedRole = randomizedGame.shift();
	// 	if (!attachedRole) continue;

	// 	const member = await guild.members.fetch(user.user.discordId);
	// 	if (!member) continue;

	// 	const userDB = await getOrCreateUser(member);
	// 	if (!userDB) continue;

	// 	await member.roles.add(role);

	// 	const channel = await guild.channels.create({
	// 		name: `${user.user.username}-confessional`,
	// 		type: ChannelType.GuildText,
	// 		parent: category,
	// 		permissionOverwrites: [
	// 			{
	// 				id: user.user.discordId,
	// 				allow: ['ViewChannel', 'SendMessages'],
	// 			},
	// 			{
	// 				id: guild.roles.everyone.id,
	// 				deny: ['ViewChannel'],
	// 			},
	// 		],
	// 	});

	// 	const player = await prisma.player.create({
	// 		data: {
	// 			discordId: member.id,
	// 			automatedGameId: game.id,
	// 			confessionalId: channel.id,
	// 		},
	// 	});

	// 	await prisma.automatedRole.create({
	// 		data: {
	// 			automatedGameId: game.id,
	// 			playerId: player.id,
	// 			roleName: attachedRole,
	// 		},
	// 	});

	// 	await channel.send({ content: `Welcome to your confessional, <@${user.user.discordId}>.\nYou are a ${attachedRole}` });
	// }

	await prisma.signup.update({
		where: {
			id: signup.id,
		},
		data: {
			isActive: false,
		},
	});

	await prisma.automatedGame.update({
		where: {
			id: game.id,
		},
		data: {
			infoChannelId: infoChannel.id,
			chatChannelId: chatChannel.id,
			mafiaChannelId: mafiaChannel.id,
		},
	});

	signup.isActive = false;
	const format = formatSignupEmbed(signup);
	const { embed, row } = format;
	embed.setColor('Green');
	await message.edit({ embeds: [embed], components: [row] });
}
