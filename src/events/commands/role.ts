import { getRoleByName, getRoleNames } from '../../models/gameRoles';
import { SlashCommand } from '../../structures/interactions/SlashCommand';
import { capitalize } from '../../util/string';
import { genRoleEmbed } from '../../views/roles';

export default new SlashCommand('role')
	.setDescription('View a role')
	.set((cmd) => {
		cmd.addStringOption((option) => option.setName('name').setDescription('The name of the role').setRequired(true).setAutocomplete(true));
	})
	.onExecute(async (i, _ctx) => {
		if (!i.guild) return;
		const name = i.options.getString('name', true);

		const role = await getRoleByName(name);
		if (!role) return i.reply({ content: 'Role not found', ephemeral: true });

		const embed = genRoleEmbed(role);
		await i.reply({ embeds: [embed], ephemeral: false });
	})
	.onAutoComplete(async (i) => {
		const focused = i.options.getFocused();
		const fetchNames = await getRoleNames(focused, {
			take: 5,
		});
		if (!fetchNames) return i.respond([]);

		return i.respond(fetchNames.map((m) => ({ name: capitalize(m.name), value: m.name })));
	});
