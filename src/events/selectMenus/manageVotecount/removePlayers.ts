import { getVoteCounter, deletePlayerAndVotes } from '../../../models/votecounter';
import { CustomUserSelectMenuBuilder } from '../../../structures/interactions/UserSelectMenu';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { genCreateVoteCountEmbed, genPlayersEmbed } from '../../../views/votecounter';

export default new CustomUserSelectMenuBuilder('manage-vc-select-players-remove')
	.onGenerate((builder) => builder.setMaxValues(25).setMinValues(1).setPlaceholder('Players to remove from the vote counter. THIS DELETES ALL THEIR VOTES!'))
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');

		const values = i.values;
		if (!values) throw new InteractionError('No users were provided');

		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());

		const players = vc.players;

		const existingPlayers: string[] = [];
		const newPlayers: string[] = [];

		for (const value of values) {
			if (players.find((player) => player.discordId === value)) existingPlayers.push(value);
			else newPlayers.push(value);
		}

		if (existingPlayers.length <= 0) throw new InteractionError('No players were provided that could be removed');
		const failedPlayers: string[] = [];
		const successfulPlayers: [string, number][] = [];

		for (const player of existingPlayers) {
			try {
				const deletion = await deletePlayerAndVotes(vc.id, player);

				if (!deletion) {
					failedPlayers.push(player);
					continue;
				}

				successfulPlayers.push([deletion.deletedPlayer.discordId, deletion.deletedVotes.count]);
			} catch (error) {
				console.error(error);
			}
		}

		const newVC = await getVoteCounter({ channelId: i.channelId });
		if (!newVC) return i.update(genCreateVoteCountEmbed());
		const playerMenuPayload = genPlayersEmbed(newVC);
		await i.update(playerMenuPayload);
	});
