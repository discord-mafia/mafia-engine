import { getRoleByName, getRoleNames } from '../../models/gameRoles';
import { SlashCommand } from '../../structures/interactions/SlashCommand';
import { capitalize } from '../../util/string';
import { genRoleEmbed } from '../../views/roles';

export default new SlashCommand('view')
	.setDescription('View something')
	.set((cmd) => {
		cmd.addSubcommand((sub) =>
			sub
				.setName('role')
				.setDescription('View a role')
				.addStringOption((option) => option.setName('name').setDescription('The name of the role').setRequired(true).setAutocomplete(true))
				.addBooleanOption((opt) => opt.setName('hidden').setDescription('Whether to show hidden roles').setRequired(false))
		);
	})
	.onExecute(async (i, _ctx) => {
		const subcommand = i.options.getSubcommand(true);

		switch (subcommand) {
			case 'role': {
				const reqRoleName = i.options.getString('name', true);
				const role = await getRoleByName(reqRoleName);
				if (!role) return i.reply({ content: 'Role not found', ephemeral: true });
				const embed = genRoleEmbed(role);
				return await i.reply({ embeds: [embed], ephemeral: false });
			}
			default: {
				return i.reply({ content: 'Invalid subcommand', ephemeral: true });
			}
		}
	})
	.onAutoComplete(async (i) => {
		const focused = i.options.getFocused();
		const subcommand = i.options.getSubcommand(true);

		switch (subcommand) {
			case 'role': {
				const fetchNames = await getRoleNames(focused, { take: 5 });
				if (!fetchNames) return i.respond([]);
				return i.respond(fetchNames.map((m) => ({ name: capitalize(m.name), value: m.name })));
			}
			default:
				return i.respond([]);
		}
	});
