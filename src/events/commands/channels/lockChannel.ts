import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { newSlashCommand } from '@structures/interactions/SlashCommand';
import { InteractionError } from '@structures/interactions';

const data = new SlashCommandBuilder().setName('lock').setDescription('Lock a role from being able to send messages in a channel');
data.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

data.addRoleOption((x) => x.setName('role').setDescription('The role to lock').setRequired(true));
data.addChannelOption((x) => x.setName('channel').setDescription('The channel to lock the role from').setRequired(false));

export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');

		const role = i.options.getRole('role', true);
		const channelId = i.options.getChannel('channel', false)?.id ?? i.channel?.id;
		if (!channelId) throw new InteractionError('Invalid channel');

		const channel = await i.guild.channels.fetch(channelId);
		if (!channel || channel.type != ChannelType.GuildText) throw new InteractionError('Invalid channel');

		await channel.permissionOverwrites.edit(role.id, {
			SendMessages: false,
		});

		return await i.reply({
			content: `<@&${role.id}> can no longer speak in <#${channel.id}> (unless other perms override this)`,
			ephemeral: true,
		});
	},
});
