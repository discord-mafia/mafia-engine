import { APIApplicationCommandOptionChoice, ColorResolvable, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { newSlashCommand } from '../../structures/BotClient';
import { getAverageColor } from 'fast-average-color-node';
import { prisma } from '../..';

const data = new SlashCommandBuilder().setName('citizenship').setDescription('View a members citizenship card');
data.addUserOption((x) => x.setName('user').setDescription('The user to view the citizenship card of').setRequired(true));
data.addBooleanOption((opt) => opt.setName('hidden').setDescription('To make this for only you to see').setRequired(false));

export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;

		const user = i.options.getUser('user', true);
		const hidden = i.options.getBoolean('hidden', false) ?? false;

		const citizenship = await prisma.user.findUnique({
			where: {
				discordId: user.id,
			},
		});

		if (!citizenship) return i.reply({ content: 'This user does not have a citizenship card', ephemeral: true });

		const member = await i.guild.members.fetch(user.id);

		const displayName = member.displayName;
		const avatarURL = member.avatarURL() ?? member.displayAvatarURL();
		const averageColour = (await getAverageColor(avatarURL)).hex;

		const embed = new EmbedBuilder()
			.setTitle(`${displayName}'s Citizenship Card`)
			.setThumbnail(user.displayAvatarURL())
			.setColor(averageColour as ColorResolvable);

		// embed.addFields({
		// 	name: 'Biography',
		// 	value: '> This is my epilogue\n> My Soliliquy\n> Take this broken melody, straight to the grave',
		// });

		embed.addFields({
			name: 'Official Name',
			value: citizenship.username,
			inline: true,
		});

		embed.addFields({
			name: 'Winrate (26 games)',
			value: '75.52%',
			inline: true,
		});

		embed.setAuthor({
			name: 'Citizen �',
			iconURL: 'https://media.discordapp.net/attachments/978980333968052254/1136743501447565464/Staff.png?width=438&height=460',
		});

		if (citizenship.mvpStatus != 'None') {
			const crownURL =
				'https://media.discordapp.net/attachments/1119025192946110464/1136734900351934464/pngtree-beutifull-gold-crown-clipart-vector-art-png-image_6566757.png?width=720&height=720';
			const crownType = citizenship.mvpStatus;
			embed.setFooter({
				text: `${crownType} MVP`,
				iconURL: crownURL,
			});
		}

		return i.reply({ embeds: [embed], ephemeral: hidden });
	},
});
