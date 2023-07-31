import { ChannelType, Colors, EmbedBuilder, Message, SlashCommandBuilder, TextChannel } from 'discord.js';
import { newSlashCommand } from '../../structures/BotClient';
const data = new SlashCommandBuilder().setName('prods').setDescription('Generate prods');
data.addRoleOption((role) => role.setName('aliveline').setDescription('Role which all living players have').setRequired(true));
data.addChannelOption((channel) => channel.setName('channel').setDescription('Channel to check prods within').addChannelTypes(ChannelType.GuildText).setRequired(true));
data.addIntegerOption((str) => str.setName('ago').setDescription('How many hours to check back').setRequired(true));
data.addIntegerOption((str) => str.setName('requirement').setDescription('How many posts do you want them to have to pass.').setRequired(true));

export default newSlashCommand({
	data,
	execute: async (i) => {
		const aliveLine = i.options.getRole('aliveline', true);
		const channel = i.options.getChannel('channel', true) as TextChannel;
		const req = i.options.getInteger('requirement', true);

		const hoursToCheck = i.options.getInteger('ago', true);
		const millisecondToCheck = hoursToCheck * 60 * 60 * 1000;

		const dateFrom = new Date(new Date().getTime() - millisecondToCheck).getTime();
		const seconds = Math.floor(dateFrom / 1000);

		if (!i.guild) return;
		await i.deferReply({ ephemeral: true });

		try {
			await i.guild.roles.fetch();
			await i.guild.members.fetch();

			const prodChecks: Record<string, Message<boolean>[]> = {};
			const role = i.guild.roles.cache.get(aliveLine.id);
			if (!role) throw Error('Invalid role');
			const users = role.members.map((m) => m.user.id);
			users.forEach((user) => {
				prodChecks[user] = [];
			});

			await i.editReply({
				content: `Checking prods for:\n${users.map((u) => `<@${u}>`).join('\n')}`,
			});

			let message = await channel.messages.fetch({ limit: 1 }).then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));
			let messageCount = 1;

			const checkMessage = (msg: Message) => {
				const createdAt = Math.ceil(msg.createdAt.getTime() / 1000);
				if (users.includes(msg.author.id) && createdAt > seconds) {
					prodChecks[msg.author.id].push(msg);
				}
			};

			if (message) checkMessage(message);

			while (message) {
				let hitProdThreshold = false;
				await channel.messages.fetch({ limit: 100, before: message.id }).then((messagePage) => {
					messagePage.forEach((msg) => {
						messageCount++;
						checkMessage(msg);
					});
					message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
					if (hitProdThreshold) message = null;
				});
			}

			const embed = new EmbedBuilder();
			embed.setTitle('Prod Check');
			embed.setColor(Colors.White);

			embed.setDescription(`Checked ${messageCount} messages in <#${channel.id}>.\nChecking since <t:${seconds}:R>, (${hoursToCheck} hours)`);

			const prodded: string[] = [];
			const cleared: string[] = [];
			for (const userID in prodChecks) {
				const list = prodChecks[userID];

				if (list.length >= req) cleared.push(`<@${userID}> has ${list.length}/${req} messages.`);
				else prodded.push(`<@${userID}> has ${list.length}/${req} messages.`);
			}

			if (cleared.length > 0) embed.addFields({ name: 'Cleared', value: cleared.join('\n') });
			if (prodded.length > 0) embed.addFields({ name: 'Prodded', value: prodded.join('\n') });

			await i.editReply({ content: '', embeds: [embed] });
		} catch (err) {
			console.log(err);
			await i.editReply('An error has occurred');
		}
	},
});
