import { type UserSelectMenuInteraction, type CacheType } from 'discord.js';
import { UserSelectMenu } from '../../../structures/interactions/UserSelectMenu';
import { InteractionError } from '../../../structures/interactions';
import { prisma } from '../../..';
import { getOrCreateUser } from '@models/users';
import { getVoteCounter, type FullPlayer, getPlayer } from '@models/votecounter';
import { genCreateVoteCountEmbed, genPlayersEmbed } from '@views/votecounter';

export default class ReplacePlayersMenu extends UserSelectMenu {
	static customId = 'manage-vc-players-replace';
	constructor() {
		super(ReplacePlayersMenu.customId);
	}

	async onExecute(i: UserSelectMenuInteraction<CacheType>) {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');

		const values = i.values;
		if (!values) throw new InteractionError('No users were provided');
		if (values.length !== 2) throw new InteractionError('Exactly 2 users must be provided');

		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());

		let oldSlot: FullPlayer | undefined = undefined;
		let newSlot: string | undefined = undefined;

		for (const value of values) {
			const player = await getPlayer(vc.id, value);
			if (player) oldSlot = player;
			else newSlot = value;
		}

		if (!(oldSlot && newSlot)) {
			const errorList: string[] = [];
			if (!oldSlot) errorList.push('One player must be registered in this vote-count');
			if (!newSlot) errorList.push('One player must __not__ be registered in this vote-count');
			if (errorList.length == 0) errorList.push('An unknown error occurred');
			throw new InteractionError(errorList.join('\n'));
		}

		const newMember = await i.guild.members.fetch(newSlot);
		if (!newMember) throw new InteractionError('The new player must be a member of the server');

		const newUser = await getOrCreateUser(newMember);
		if (!newUser) throw new InteractionError('Failed to register the new player');

		await prisma.player.update({
			where: { id: oldSlot.id },
			data: {
				user: {
					connect: {
						discordId: newUser.discordId,
					},
				},
			},
		});

		const newVC = await getVoteCounter({ channelId: i.channelId });
		if (!newVC) return i.update(genCreateVoteCountEmbed());
		const playerMenuPayload = genPlayersEmbed(newVC);
		await i.update(playerMenuPayload);
	}

	generateUserSelectMenu() {
		return super.generateUserSelectMenu().setMaxValues(2).setMinValues(2).setPlaceholder('The player to replace and replace in');
	}
}
