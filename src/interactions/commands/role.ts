import { SlashCommandBuilder, EmbedBuilder, type ColorResolvable } from 'discord.js';
import { newSlashCommand } from '../../structures/BotClient';
import { prisma } from '../../';

const data = new SlashCommandBuilder().setName('role').setDescription('View a role');
data.addStringOption((option) => option.setName('name').setDescription('The name of the role').setRequired(true));
export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;
		const name = i.options.getString('name', true);

		const role = await prisma.role.findUnique({
			where: {
				name: name,
			},
		});

		if (!role) {
			await i.reply({ content: 'Role not found', ephemeral: true });
			return;
		}

		const embed = new EmbedBuilder();
		embed.setTitle(`${role.name} - ${role.alignment} ${role.subAlignment}`);
		embed.setColor(role.roleColour as ColorResolvable);

		if (role.flavourText) embed.setDescription(`*${role.flavourText}*`);

		if (role.wikiUrl) {
			embed.setURL(role.wikiUrl);
		}

		embed.addFields(
			{
				name: 'Abilities',
				value: role.abilities,
			},
			{
				name: 'Win Condition',
				value: role.winCondition,
			}
		);

		await i.reply({ embeds: [embed], ephemeral: false });
	},
});
