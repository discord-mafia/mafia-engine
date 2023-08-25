import { type CategoryChannel, type Channel, ChannelType, SlashCommandBuilder } from 'discord.js';
import { ServerType, newSlashCommand } from '../../structures/BotClient';

const data = new SlashCommandBuilder().setName('nuke').setDescription('Delete all channels underneath a category');
data.addChannelOption((x) =>
	x.setName('category').setDescription('Category to delete all channels under').setRequired(true).addChannelTypes(ChannelType.GuildCategory)
);

export default newSlashCommand({
	data,
	serverType: [ServerType.PLAYERCHAT, ServerType.TURBO],
	execute: async (i) => {
		await i.deferReply();
		const category = i.options.getChannel('category', true) as CategoryChannel;
		const channels: Channel[] = [];
		category.children.cache.forEach((v) => channels.push(v));
		for (let i = 0; i < channels.length; i++) {
			const channel = channels[i];
			if (channel) await channel.delete();
		}
		await category.delete();
		await i.editReply('Done');
	},
});
