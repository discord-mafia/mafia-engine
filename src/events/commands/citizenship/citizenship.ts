import { type ColorResolvable, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { getAverageColor } from 'fast-average-color-node';
import { SlashCommand } from '@structures/interactions/SlashCommand';

export default new SlashCommand('citizenship').setDescription('View a members citizenship card').onExecute(async (i, ctx) => {
	if (!i.guild) return;
	if (!ctx.citizenship) return i.reply({ content: 'This user does not have a citizenship card', ephemeral: true });

	const user = i.options.getUser('user', false);
	const hidden = i.options.getBoolean('hidden', false) ?? false;
	const member = await i.guild.members.fetch(user?.id ?? i.user.id);

	if (!member) return i.reply({ content: 'This user is not in the server', ephemeral: true });

	const displayName = member.displayName;
	const avatarURL = member.avatarURL() ?? member.displayAvatarURL();
	const averageColour = (await getAverageColor(avatarURL)).hex;

	const embed = new EmbedBuilder()
		.setTitle(`${displayName}'s Citizenship Card`)
		.setThumbnail(member.displayAvatarURL())
		.setColor(averageColour as ColorResolvable);

	embed.addFields({
		name: 'Official Name',
		value: ctx.citizenship.username,
		inline: true,
	});

	return i.reply({ embeds: [embed], ephemeral: hidden });
});

const data = new SlashCommandBuilder().setName('citizenship').setDescription('View a members citizenship card');
data.addUserOption((x) => x.setName('user').setDescription('The user to view the citizenship card of').setRequired(true));
data.addBooleanOption((opt) => opt.setName('hidden').setDescription('To make this for only you to see').setRequired(false));
