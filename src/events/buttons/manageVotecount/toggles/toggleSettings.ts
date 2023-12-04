import type { ButtonBuilder, ButtonInteraction, CacheType } from 'discord.js';
import { CustomButton } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '../../../../util/database';
import { prisma } from '../../../..';
import { genTogglesMenu } from '../gotoToggles';

export enum VCSettings {
	LOCK_VOTES = 'lock-votes',
	MAJORITY = 'majority',
	NO_LYNCH = 'nolynch',
}

export default class ToggleSettingsButton extends CustomButton {
	static customId = 'manage-vc-toggle';
	constructor() {
		super(ToggleSettingsButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>, cache: string) {
		if (!i.guild) return i.reply({ content: 'This command can only be used in a server', ephemeral: true });
		if (!cache) return i.reply({ content: 'An error occured while creating the vote counter [ERR_01]', ephemeral: true });

		const toggleLockVotes = cache === VCSettings.LOCK_VOTES;
		const toggleMajority = cache === VCSettings.MAJORITY;
		const toggleNoLynch = cache === VCSettings.NO_LYNCH;

		if (!toggleLockVotes && !toggleMajority && !toggleNoLynch)
			return i.reply({ content: `The button you clicked was invalid [ERR_02]`, ephemeral: true });

		const voteCounter = await getVoteCounter({ channelId: i.channelId });
		if (!voteCounter) return i.reply({ content: `This is not a vote channel`, ephemeral: true });

		const vc = await prisma.voteCounter.update({
			where: {
				id: voteCounter.id,
			},
			data: {
				majority: toggleMajority ? !voteCounter.majority : voteCounter.majority,
				lockVotes: toggleLockVotes ? !voteCounter.lockVotes : voteCounter.lockVotes,
				noLynch: toggleNoLynch ? !voteCounter.noLynch : voteCounter.noLynch,
			},
			include: {
				players: {
					include: {
						user: true,
					},
				},
				votes: {
					include: {
						voter: true,
						votedTarget: true,
					},
				},
			},
		});

		const payload = genTogglesMenu(vc ?? undefined);
		return await i.update(payload);
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Home');
	}
}
