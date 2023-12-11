import { type ColorResolvable, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { newSlashCommand } from '@structures/interactions/SlashCommand';
import { addHiddenOption } from '../../util/commands';
import { getAllRoleNames, getRole } from '@models/gameRoles';
import stringSimilarity from 'string-similarity';
const data = new SlashCommandBuilder().setName('view').setDescription('View something');

data.addSubcommand((sub) =>
	sub
		.setName('role')
		.setDescription('View a role')
		.addStringOption((option) => option.setName('name').setDescription('The name of the role').setRequired(true).setAutocomplete(true))
		.addBooleanOption(addHiddenOption)
);

export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;

		const subcommand = i.options.getSubcommand(true);

		const embed = new EmbedBuilder();

		switch (subcommand) {
			case 'role':
				const reqRoleName = i.options.getString('name', true);
				const allRoleNames = await getAllRoleNames();
				if (!allRoleNames) return i.reply({ content: 'Failed to fetch roles', ephemeral: true });

				const roleBestMatch = stringSimilarity.findBestMatch(reqRoleName.toLowerCase(), allRoleNames).bestMatch;

				const requestedRole = await getRole(roleBestMatch.target);

				if (!requestedRole) return i.reply({ content: 'Role not found', ephemeral: true });

				embed.setTitle(`${requestedRole.name} - ${requestedRole.alignment} ${requestedRole.subAlignment}`);
				embed.setColor(requestedRole.roleColour as ColorResolvable);

				if (requestedRole.flavourText) embed.setDescription(`*${requestedRole.flavourText}*`);
				if (requestedRole.wikiUrl) embed.setURL(requestedRole.wikiUrl);
				if (requestedRole.isRetired)
					embed.setFooter({
						text: 'This role is retired',
					});

				embed.addFields(
					{
						name: 'Abilities',
						value: requestedRole.abilities,
					},
					{
						name: 'Win Condition',
						value: requestedRole.winCondition,
					}
				);

				await i.reply({ embeds: [embed], ephemeral: false });

				break;
			default:
				return i.reply({ content: 'Invalid subcommand', ephemeral: true });
		}
	},
	autocomplete: async (i) => {
		const focused = i.options.getFocused();
		const subcommand = i.options.getSubcommand(true);

		const getClosestMatches = (str: string, arr: string[], total: number = 1) => {
			const matches = stringSimilarity.findBestMatch(str.toLowerCase(), arr).ratings;
			const sorted = matches.sort((a, b) => b.rating - a.rating);
			return sorted.slice(0, total);
		};

		switch (subcommand) {
			case 'role':
				if (!focused) return i.respond([]);
				const roleNames = (await getAllRoleNames()) ?? [];
				const roleMatches = getClosestMatches(focused, roleNames, 5);
				return i.respond(roleMatches.map((m) => ({ name: m.target.charAt(0).toUpperCase() + m.target.slice(1), value: m.target })));
			default:
				return i.respond([]);
		}
	},
});
