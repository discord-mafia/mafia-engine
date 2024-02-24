import { ChannelType, type TextChannel } from 'discord.js';
import { SlashCommand } from '../../structures/interactions/SlashCommand';

export default new SlashCommand('createinvite')
	.setDescription('See the invite links for our servers')
	.set((cmd) => cmd.addChannelOption((x) => x.setName('channel').setDescription('Channel to create the invite for').addChannelTypes(ChannelType.GuildText)))
	.onExecute(async (i) => {
		const channel = i.options.getChannel('channel', true) as TextChannel;

		const invite = await channel.createInvite({
			unique: true,
			maxAge: 0,
		});

		i.reply(`discord.gg/${invite.code}`);
	});
