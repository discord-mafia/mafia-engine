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

		embed.addFields({
			name: 'Official Name',
			value: citizenship.username,
		});

		return i.reply({ embeds: [embed], ephemeral: hidden });
	},
});
