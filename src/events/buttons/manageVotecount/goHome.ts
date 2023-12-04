import {
	type ButtonBuilder,
	type ButtonInteraction,
	ButtonStyle,
	type CacheType,
	EmbedBuilder,
	ActionRowBuilder,
	type BaseMessageOptions,
} from 'discord.js';
import { CustomButton } from '../../../structures/interactions/Button';
import { type FullVoteCount, getVoteCounter } from '../../../util/database';
import ManagePlayersButton from './gotoPlayersMenu';
import GotoStateButton from './gotoStateMenu';
import GotoTogglesMenu from './gotoToggles';
import CreateVotecountButton from './createVotecount';

export default class GoHomeButton extends CustomButton {
	static customId = 'manage-vc-home';
	constructor() {
		super(GoHomeButton.customId);
	}

	async onExecute(i: ButtonInteraction<CacheType>) {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(manageVoteCountEmbeds.create());
		const payload = generateBaseVcMenu(vc);
		i.update(payload);
	}

	generateButton(): ButtonBuilder {
		return super.generateButton().setLabel('Home').setStyle(ButtonStyle.Primary);
	}
}

export function generateBaseVcMenu(vc: FullVoteCount): BaseMessageOptions {
	const embed = new EmbedBuilder();
	embed.setTitle('Manage Vote Counter');
	embed.setDescription(`Manage the vote counter for the game`);
	embed.setColor('White');

	// TOGGLES
	const isMajority = vc.majority ? '✅' : '❌';
	const isNoLynch = vc.noLynch ? '✅' : '❌';
	const isLockVotes = vc.lockVotes ? '✅' : '❌';

	embed.addFields({
		name: 'Toggles',
		value: `Majority: ${isMajority}\nNo-Lynch: ${isNoLynch}\nLock Votes: ${isLockVotes}`,
		inline: true,
	});

	embed.addFields({
		name: 'State',
		value: `Day ${vc.currentRound}, VC ${vc.currentIteration}`,
		inline: true,
	});

	const players = vc.players.length > 0 ? vc.players.map((p, i) => `${i + 1}. ${p.user.username}`).join('\n') : '> None';
	embed.addFields({
		name: 'Players',
		value: players,
		inline: false,
	});

	const row = new ActionRowBuilder<ButtonBuilder>();
	const managePlayersButton = CustomButton.getButtonOrThrow(ManagePlayersButton.customId);
	const manageStateButton = CustomButton.getButtonOrThrow(GotoStateButton.customId);
	const manageTogglesButton = CustomButton.getButtonOrThrow(GotoTogglesMenu.customId);

	row.addComponents(managePlayersButton.generateButton(), manageTogglesButton.generateButton(), manageStateButton.generateButton());

	return {
		embeds: [embed],
		components: [row],
	};
}

export const manageVoteCountEmbeds = {
	main: generateManageVCEmbed,
	players: generateManagePlayersEmbed,
	create: generateCreateVCEmbed,
};

export function generateCreateVCEmbed(): BaseMessageOptions {
	const embed = new EmbedBuilder();
	embed.setTitle('Create Vote-Counter');
	embed.setDescription(`There is no vote counter in this channel`);
	embed.setColor('Red');
	const row = new ActionRowBuilder<ButtonBuilder>();

	const btn = CustomButton.getButtonOrThrow(CreateVotecountButton.customId);
	row.addComponents(btn.generateButton());

	return {
		embeds: [embed],
		components: [row],
	};
}
export function generateManagePlayersEmbed(vc?: FullVoteCount): BaseMessageOptions {
	if (!vc) return generateCreateVCEmbed();

	const embed = new EmbedBuilder();
	embed.setTitle('Manage Players');
	embed.setDescription(`Manage players within a vote count`);
	embed.setColor('White');

	const row = new ActionRowBuilder<ButtonBuilder>();

	return {
		embeds: [embed],
		components: [row],
	};
}

export function generateManageVCEmbed(vc?: FullVoteCount): BaseMessageOptions {
	if (!vc) return generateCreateVCEmbed();

	const embed = new EmbedBuilder();
	embed.setTitle('Manage VC');
	embed.setDescription(`Manage the vote count`);
	embed.setColor('White');

	const row = new ActionRowBuilder<ButtonBuilder>();
	// const button = CustomButton.getButtonOrThrow(ToggleSettingsButton.customId);
	const managePlayersButton = CustomButton.getButtonOrThrow(ManagePlayersButton.customId);
	const manageStateButton = CustomButton.getButtonOrThrow(GotoStateButton.customId);
	const manageTogglesButton = CustomButton.getButtonOrThrow(GotoTogglesMenu.customId);

	row.addComponents(managePlayersButton.generateButton(), manageTogglesButton.generateButton(), manageStateButton.generateButton());

	return {
		embeds: [embed],
		components: [row],
	};
}
