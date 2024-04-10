import { EmbedBuilder, type ColorResolvable } from 'discord.js';
import { Role } from '../models/gameRoles';

export function genRoleEmbed(role: Role) {
	const embed = new EmbedBuilder();
	embed.setTitle(`${role.name} - ${role.alignment} ${role.subAlignment}`);
	embed.setColor(role.roleColour as ColorResolvable);

	if (role.flavourText) embed.setDescription(`*${role.flavourText}*`);
	if (role.wikiUrl) embed.setURL(role.wikiUrl);
	if (role.iconUrl) embed.setThumbnail(role.iconUrl);
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

	return embed;
}
