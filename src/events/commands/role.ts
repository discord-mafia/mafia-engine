import { SlashCommandBuilder, EmbedBuilder, type ColorResolvable } from 'discord.js';
import { newSlashCommand } from '@structures/interactions/SlashCommand';
import { prisma } from '../..';
import stringSimilarity from 'string-similarity';
import { getAllRoleNames } from '@models/gameRoles';

const data = new SlashCommandBuilder().setName('role').setDescription('View a role');
data.addStringOption((option) => option.setName('name').setDescription('The name of the role').setRequired(true).setAutocomplete(true));

export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;
		const name = i.options.getString('name', true);

		const allRoleNames = (
			await prisma.role.findMany({
				select: {
					name: true,
				},
			})
		).map((r) => r.name.toLowerCase());

		const bestMatch = stringSimilarity.findBestMatch(name.toLowerCase(), allRoleNames).bestMatch;

		const role = await prisma.role.findFirst({
			where: {
				name: {
					equals: bestMatch.target,
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

		const roleNames = (await getAllRoleNames()) ?? [];

		const getClosestMatches = (str: string, arr: string[], total: number = 1) => {
			const matches = stringSimilarity.findBestMatch(str.toLowerCase(), arr).ratings;
			const sorted = matches.sort((a, b) => b.rating - a.rating);
			return sorted.slice(0, total);
		};

		// Find the closest 5 matches
		const matches = getClosestMatches(focused, roleNames, 5);
		const capitalize = (str: string) => {
			return str.charAt(0).toUpperCase() + str.slice(1);
		};

		return i.respond(matches.map((m) => ({ name: capitalize(m.target), value: m.target })));
	},
});
