import { CategoryChannel, Channel, ChannelType, SlashCommandBuilder, TextChannel } from 'discord.js';
import { newSlashCommand } from '../../structures/BotClient';

const data = new SlashCommandBuilder().setName('nuke').setDescription('Delete all channels underneath a category');
data.addChannelOption((x) =>
	x.setName('category').setDescription('Category to delete all channels under').setRequired(true).addChannelTypes(ChannelType.GuildCategory)
);

export default newSlashCommand({
	data,
	execute: async (i) => {
		await i.deferReply();
		const category = i.options.getChannel('category', true) as CategoryChannel;
		const channels: Channel[] = [];
		category.children.cache.forEach((v) => channels.push(v));
		for (let i = 0; i < channels.length; i++) {
			await channels[i].delete();
		}
		await category.delete();
		await i.editReply('Done');
	},
});
