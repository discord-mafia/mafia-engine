import { SlashCommandBuilder, EmbedBuilder, type ColorResolvable } from 'discord.js';
import { newSlashCommand } from '@structures/interactions/SlashCommand';
import { prisma } from '../..';
import { capitalize } from '@utils/string';
import { getRoleNames } from '@models/gameRoles';

const data = new SlashCommandBuilder().setName('role').setDescription('View a role');
data.addStringOption((option) => option.setName('name').setDescription('The name of the role').setRequired(true).setAutocomplete(true));

export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;
		const name = i.options.getString('name', true);

		const fetchedRoleNames = await getRoleNames(name, { take: 1 });
		if (!fetchedRoleNames) return await i.reply({ content: 'Role not found', ephemeral: true });

		const bestMatch = fetchedRoleNames[0]?.name;
		if (!bestMatch) return await i.reply({ content: 'Role not found', ephemeral: true });

		const role = await prisma.role.findFirst({
			where: {
				name: {
					equals: bestMatch,
					mode: 'insensitive',
				},
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
		if (role.wikiUrl) embed.setURL(role.wikiUrl);
		if (role.isRetired)
			embed.setFooter({
				text: 'This role is retired',
			});

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

	autocomplete: async (i) => {
		const focused = i.options.getFocused();

		const fetchNames = await getRoleNames(focused, {
			take: 5,
		});
		if (!fetchNames) return i.respond([]);

		console.log(fetchNames);

		return i.respond(fetchNames.map((m) => ({ name: capitalize(m.name), value: m.name })));
	},
});
