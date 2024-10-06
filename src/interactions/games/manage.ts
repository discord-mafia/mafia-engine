import { EmbedBuilder } from 'discord.js';
import { Game } from '../../db/games/games';

export async function genManageGameEmbed(game: Game) {
	const { name } = game.getData();

	const embed = new EmbedBuilder();
	embed.setTitle(name);

	const usergroups = await game.fetchUsergroups();
	for (const usergroup of usergroups) {
		const { name: usergroupName } = usergroup.getData();
		const participants = await usergroup.fetchParticipants();
		const partList: string[] = [];
		for (const participant of participants) {
			const username = await participant.generateUsername();
			partList.push('> ' + username);
		}

		let value = '> No slots';
		if (partList.length > 0) {
			value = partList.join('\n');
		}

		embed.addFields({ name: usergroupName, value });
	}

	return { embed };
}
