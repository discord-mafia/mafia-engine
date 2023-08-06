import { ChannelType, EmbedBuilder, OverwriteResolvable, SlashCommandBuilder, User } from 'discord.js';
import { ServerType, newSlashCommand } from '../../structures/BotClient';
import { getSignup } from '../../util/database';
import { sign } from 'crypto';

const data = new SlashCommandBuilder().setName('playerchats').setDescription('Create a category as associated channels for a signup');
data.addStringOption((x) => x.setName('name').setDescription('The name of the game').setRequired(true));
data.addIntegerOption((x) => x.setName('signup').setDescription('The index of the signup (check the cog button on signups)').setRequired(true));
data.addIntegerOption((x) =>
	x.setName('category').setDescription('The index of the signup category (check the cog button on signups)').setRequired(true)
);

for (let i = 0; i < 10; i++) {
	data.addUserOption((x) =>
		x
			.setName(i === 0 ? 'host' : `host-${i}`)
			.setDescription(`The ${i === 0 ? 'main' : `${i}th`} host`)
			.setRequired(i === 0)
	);
}

export default newSlashCommand({
	data,
	serverType: ServerType.PLAYERCHAT,
	execute: async (i) => {
		if (!i.guild) return;

		const name = i.options.getString('name', true);
		const signupIndex = i.options.getInteger('signup', true);
		const categoryIndex = i.options.getInteger('category', true);
		const hosts: User[] = [];
		for (let f = 0; f < 10; f++) {
			const host = i.options.getUser(f === 0 ? 'host' : `host-${i}`);
			if (host) hosts.push(host);
		}

		const signup = await getSignup({ signupId: signupIndex });
		if (!signup) return i.reply({ content: 'Signup not found', ephemeral: true });

		await i.deferReply({ ephemeral: true });
		const category = await i.guild.channels.create({
			name,
			type: ChannelType.GuildCategory,
			permissionOverwrites: [
				...hosts.map((x) => {
					const val: OverwriteResolvable = {
						id: x.id,
						allow: ['ViewChannel', 'ManageChannels', 'ManageMessages', 'ManageThreads'],
					};

					return val;
				}),
				{
					deny: ['ViewChannel'],
					id: i.guild.roles.everyone.id,
				},
			],
		});

		if (!category) return i.editReply({ content: 'Failed to create category' });
		const signupCategory = signup.categories.find((x) => x.id === categoryIndex);
		if (!signupCategory) return i.editReply({ content: 'Category not found' });

		const hostPanel = await i.guild.channels.create({
			name: 'host-panel',
			type: ChannelType.GuildText,
			parent: category,
		});
		if (!hostPanel) return i.editReply({ content: 'Failed to create host panel' });

		for (const user of signupCategory.users) {
			const { discordId, username } = user.user;

			const member = await i.guild.members.fetch(discordId);

			const channel = await i.guild.channels.create({
				name: username,
				type: ChannelType.GuildText,
				parent: category,
			});

			if (!member) {
				hostPanel.send({
					content: `\`\`\`Failed to find ${username} in the server. Manually fix their permissions in <#${channel.id}>\`\`\``,
				});
				continue;
			}

			await channel.permissionOverwrites.create(member.id, {
				ViewChannel: true,
				SendMessages: true,
			});

			await hostPanel.send({ content: `Created channel for ${username} <#${channel.id}>` });
		}

		await i.editReply({ content: 'Done' });
	},
});
