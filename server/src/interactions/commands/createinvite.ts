import { ChannelType, InviteTargetType, SlashCommandBuilder, TextChannel } from 'discord.js';
import { newSlashCommand } from '../../structures/BotClient';

const data = new SlashCommandBuilder().setName('createinvite').setDescription('See the invite links for our servers');
data.addChannelOption((x) => x.setName('channel').setDescription('Channel to create the invite for').addChannelTypes(ChannelType.GuildText));
export default newSlashCommand({
	data,
	execute: async (i) => {
		const channel = i.options.getChannel('channel', true) as TextChannel;

		const invite = await channel.createInvite({
			unique: true,
			maxAge: 0,
		});

		i.reply(`discord.gg/${invite.code}`);
	},
});
