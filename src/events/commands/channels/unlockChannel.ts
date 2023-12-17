import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { InteractionError } from '@structures/interactions/_Interaction';
import { SlashCommand } from '@structures/interactions/SlashCommand';

export default new SlashCommand('unlock')
	.setDescription('Allow a role to speak in a channel again')
	.set((cmd) => {
		cmd.addRoleOption((x) => x.setName('role').setDescription('The role to unlock').setRequired(true));
		cmd.addChannelOption((x) => x.setName('channel').setDescription('The channel to unlock the role from').setRequired(false));
		cmd.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);
	})
	.onExecute(async (i) => {
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
	});
