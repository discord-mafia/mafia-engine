import { ChannelType, Colors, EmbedBuilder, type Message, type TextChannel } from 'discord.js';
import { SlashCommand } from '../../structures/interactions/SlashCommand';

export default new SlashCommand('prods')
	.setDescription('Generate prods')
	.set((cmd) => {
		cmd.addRoleOption((role) => role.setName('aliveline').setDescription('Role which all living players have').setRequired(true));
		cmd.addChannelOption((channel) => channel.setName('channel').setDescription('Channel to check prods within').addChannelTypes(ChannelType.GuildText).setRequired(true));
		cmd.addIntegerOption((str) => str.setName('ago').setDescription('How many hours to check back').setRequired(true));
		cmd.addIntegerOption((str) => str.setName('requirement').setDescription('How many posts do you want them to have to pass.').setRequired(true));
	})
	.onExecute(async (i) => {
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
			const role = i.guild.roles.cache.get(aliveLine.id);
			if (!role) throw Error('Invalid role');

			const prods = new Map<string, Message<boolean>[]>();
			role.members.forEach((m) => {
				prods.set(m.user.id, []);
			});

			const formatContent = (complete: boolean = false) => {
				const embed = new EmbedBuilder();
				embed.setColor(complete ? Colors.Green : Colors.Red);
				embed.setTitle('Checking Prods...');

				const passed: [string, number][] = [];
				const failed: [string, number][] = [];

				prods.forEach((value, key) => {
					if (value.length >= req) passed.push([key, value.length]);
					else failed.push([key, value.length]);
				});

				const passText = passed.length > 0 ? passed.map((v) => `<@${v[0]}>: ${v[1]}/${req}`).join('\n') : '> None';
				const failText = failed.length > 0 ? failed.map((v) => `<@${v[0]}>: ${v[1]}/${req}`).join('\n') : '> None';

				embed.addFields(
					{
						name: 'Passed',
						value: passText,
					},
					{
						name: 'Failed',
						value: failText,
					}
				);

				return embed;
			};

			await i.editReply({ embeds: [formatContent()] });

			let message = await channel.messages.fetch({ limit: 1 }).then((messagePage) => (messagePage.size === 1 ? messagePage.at(0) : null));

			const checkMessage = (msg: Message) => {
				const createdAt = Math.ceil(msg.createdAt.getTime() / 1000);
				if (prods.has(msg.author.id) && createdAt > seconds) {
					prods.get(msg.author.id)?.push(msg);
				}
			};

			if (message) checkMessage(message);

			while (message) {
				const hitProdThreshold = false;
				await channel.messages.fetch({ limit: 100, before: message.id }).then((messagePage) => {
					messagePage.forEach((msg) => {
						checkMessage(msg);
					});
					message = 0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
					if (hitProdThreshold) message = null;
				});

				await i.editReply({ embeds: [formatContent()] });
			}

			console.log('Completed Prods');

			await i.editReply({ embeds: [formatContent(true)] });
		} catch (err) {
			console.log(err);
			await i.editReply('An error has occurred');
		}
	});
