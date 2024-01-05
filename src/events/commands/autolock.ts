import { prisma } from '@root/index';
import { SlashCommand } from '@structures/interactions/SlashCommand';
import { InteractionError } from '@structures/interactions/_Interaction';

export default new SlashCommand('autolock')
	.setDescription('Lock a channel at a particular time')
	.set((cmd) => {
		cmd.addChannelOption((x) => x.setName('channel').setDescription('The channel to lock').setRequired(true));
		cmd.addRoleOption((x) => x.setName('role').setDescription('The role to lock').setRequired(true));
		cmd.addIntegerOption((x) => x.setName('timestamp').setDescription('The time to lock the channel (discord, not unix)').setRequired(true));
	})
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');

		const channel = i.options.getChannel('channel', true);
		const role = i.options.getRole('role', true);
		const timestamp = i.options.getInteger('timestamp', true);

		await i.deferReply({ ephemeral: true });

		const lock = await prisma.autoLocker.create({
			data: {
				channelId: channel.id,
				guildId: i.guild.id,
				roleId: role.id,
				lockAt: new Date(timestamp * 1000),
			},
		});

		await i.editReply({
			content: `Channel <#${lock.channelId}> will be locked at <t:${timestamp}:R>`,
		});
	});
