import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { InteractionError } from '@structures/interactions/_Interaction';
import { SlashCommand } from '@structures/interactions/SlashCommand';
import { editChannelPermission } from '@utils/discordChannels';

export default new SlashCommand('lock')
	.setDescription('Lock a role from being able to send messages in a channel')
	.set((cmd) => {
		cmd.addRoleOption((x) => x.setName('role').setDescription('The role to lock').setRequired(true));
		cmd.addChannelOption((x) => x.setName('channel').setDescription('The channel to lock the role from').setRequired(false));
		cmd.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);
	})
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');

		const role = i.options.getRole('role', true);
		const channelId = i.options.getChannel('channel', false)?.id ?? i.channel?.id;
		if (!channelId) throw new InteractionError('Invalid channel');

		const channel = await i.guild.channels.fetch(channelId);
		if (!channel || channel.type != ChannelType.GuildText) throw new InteractionError('Invalid channel');

		await editChannelPermission(channel, role.id, { SendMessages: false });

		return await i.reply({
			content: `<@&${role.id}> can no longer speak in <#${channel.id}> (unless other perms override this)`,
			ephemeral: true,
		});
	});
