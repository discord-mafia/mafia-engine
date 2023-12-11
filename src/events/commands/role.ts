import { SlashCommandBuilder } from 'discord.js';
import { newSlashCommand } from '@structures/interactions/OldSlashCommand';
import { capitalize } from '@utils/string';
import { getRoleByName, getRoleNames } from '@models/gameRoles';
import { genRoleEmbed } from '@views/roles';

const data = new SlashCommandBuilder().setName('role').setDescription('View a role');
data.addStringOption((option) => option.setName('name').setDescription('The name of the role').setRequired(true).setAutocomplete(true));

export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;
		const name = i.options.getString('name', true);

		const role = await getRoleByName(name);
		if (!role) return i.reply({ content: 'Role not found', ephemeral: true });

		const embed = genRoleEmbed(role);
		await i.reply({ embeds: [embed], ephemeral: false });
	},

	autocomplete: async (i) => {
		const focused = i.options.getFocused();
		const fetchNames = await getRoleNames(focused, {
			take: 5,
		});
		if (!fetchNames) return i.respond([]);

		return i.respond(fetchNames.map((m) => ({ name: capitalize(m.name), value: m.name })));
	},
});
