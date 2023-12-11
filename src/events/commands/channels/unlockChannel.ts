import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { newSlashCommand } from '@structures/interactions/OldSlashCommand';
import { InteractionError } from '@structures/interactions';

const data = new SlashCommandBuilder().setName('unlock').setDescription('Allow a role to speak in a channel again');
data.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

data.addRoleOption((x) => x.setName('role').setDescription('The role to unlock').setRequired(true));
data.addChannelOption((x) => x.setName('channel').setDescription('The channel to unlock the role from').setRequired(false));

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
			SendMessages: true,
		});

		return await i.reply({
			content: `<@&${role.id}> can now speak in <#${channel.id}> (unless other perms override this)`,
			ephemeral: true,
		});
	},
});
