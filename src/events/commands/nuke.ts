import { type CategoryChannel, type Channel, ChannelType, PermissionFlagsBits } from 'discord.js';
import { SlashCommand } from '../../structures/interactions/SlashCommand';

export default new SlashCommand('nuke')
	.setDescription('Delete all channels underneath a category')
	.set((cmd) => {
		cmd.addChannelOption((x) => x.setName('category').setDescription('Category to delete all channels under').setRequired(true).addChannelTypes(ChannelType.GuildCategory));

		cmd.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
	})
	.onExecute(async (i) => {
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
	});
