import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { InteractionError } from '@structures/interactions/_Interaction';
import { SlashCommand } from '@structures/interactions/SlashCommand';
import { getSignup } from '@models/signups';

export default new SlashCommand('playerchats')
	.setDescription('Create playerchats')
	.set((cmd) => {
		cmd.addIntegerOption((x) => x.setName('signup_id').setDescription('Signup ID').setRequired(true));
		cmd.addIntegerOption((x) => x.setName('category_id').setDescription('Category ID').setRequired(true));
		cmd.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
	})
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		if (i.guildId != '648663810772697089') throw new InteractionError('You are not in the main server');

		await i.deferReply({ ephemeral: false });

		const signupID = i.options.getInteger('signup_id', true);
		const categoryID = i.options.getInteger('category_id', true);

		const signup = await getSignup({ signupId: signupID });
		if (!signup) throw new InteractionError('Signup under this ID does not exist');

		const signupCategory = signup.categories.find((v) => v.id === categoryID);
		if (!signupCategory) throw new InteractionError('Signup category under this ID does not exist');

		await i.client.guilds.fetch();
		const playerChatGuild = i.client.guilds.cache.get('753231987589906483');
		if (!playerChatGuild) throw new InteractionError('This bot must be in the player chat server');

		const IDs = [...signup.hosts.map((v) => v.user.discordId), ...signup.moderators.map((v) => v.user.discordId)];

		await i.followUp(IDs.join(' - '));

		const category = await playerChatGuild.channels.create({
			type: ChannelType.GuildCategory,
			name: signup.name ?? 'Untitled Game',
			permissionOverwrites: [
				{
					id: playerChatGuild.roles.everyone,
					deny: ['ViewChannel'],
				},
			],
		});

		for (const discordID of IDs) {
			await category.permissionOverwrites.edit(discordID, {
				ManageChannels: true,
				ManageMessages: true,
				MentionEveryone: true,
				ManageThreads: true,
			});
		}

		await playerChatGuild.members.fetch();

		for (const player of signupCategory.users) {
			const name = player.user.username;
			const id = player.user.discordId;

			const channel = await playerChatGuild.channels.create({
				name: name,
				parent: category.id,
				permissionOverwrites: [
					{
						id: playerChatGuild.roles.everyone,
						deny: ['ViewChannel'],
					},
				],
			});

			const member = playerChatGuild.members.cache.get(id);
			if (member) {
				await channel.permissionOverwrites.edit(id, {
					ViewChannel: true,
				});

				await channel.send(`<@${id}> hi <3`);
			} else {
				channel.send('User is not in the server');
			}
		}

		const response = `DATA: ${signupID} - ${categoryID}`;

		await i.editReply({ content: response });
	});
