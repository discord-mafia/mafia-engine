import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { newSlashCommand } from '@structures/interactions/SlashCommand';
import { getRoleByName, getRoleNames } from '@models/gameRoles';
import { genRoleEmbed } from '@views/roles';
import { capitalize } from '@utils/string';
const data = new SlashCommandBuilder().setName('view').setDescription('View something');

data.addSubcommand((sub) =>
	sub
		.setName('role')
		.setDescription('View a role')
		.addStringOption((option) => option.setName('name').setDescription('The name of the role').setRequired(true).setAutocomplete(true))
		.addBooleanOption((opt) => opt.setName('hidden').setDescription('Whether to show hidden roles').setRequired(false))
);

export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;

		const subcommand = i.options.getSubcommand(true);

		switch (subcommand) {
			case 'role':
				const reqRoleName = i.options.getString('name', true);
				const role = await getRoleByName(reqRoleName);
				if (!role) return i.reply({ content: 'Role not found', ephemeral: true });
				const embed = genRoleEmbed(role);
				return await i.reply({ embeds: [embed], ephemeral: false });
			default:
				return i.reply({ content: 'Invalid subcommand', ephemeral: true });
		}
	},
	autocomplete: async (i) => {
		const focused = i.options.getFocused();
		const subcommand = i.options.getSubcommand(true);

		switch (subcommand) {
			case 'role':
				const fetchNames = await getRoleNames(focused, { take: 5 });
				if (!fetchNames) return i.respond([]);
				return i.respond(fetchNames.map((m) => ({ name: capitalize(m.name), value: m.name })));
			default:
				return i.respond([]);
		}
	},
});
