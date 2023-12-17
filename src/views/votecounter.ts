import { type FullVoteCount } from '@models/votecounter';
import CreateVotecountButton from '@root/events/buttons/manageVotecount/createVotecount';
import GoHomeButton from '@root/events/buttons/manageVotecount/goHome';
import ManagePlayersButton from '@root/events/buttons/manageVotecount/gotoPlayersMenu';
import GotoStateButton from '@root/events/buttons/manageVotecount/gotoStateMenu';
import GotoTogglesMenu from '@root/events/buttons/manageVotecount/gotoToggles';
import AddPlayersButton from '@root/events/buttons/manageVotecount/players/addPlayers';
import RemovePlayersButton from '@root/events/buttons/manageVotecount/players/removePlayers';
import ReplacePlayersButton from '@root/events/buttons/manageVotecount/players/replacePlayer';
import ManageVoteWeight from '@root/events/buttons/manageVotecount/state/changeVoteWeight';
import JumpToDayButton from '@root/events/buttons/manageVotecount/state/jumpToDay';
import { CustomButton } from '@root/structures/interactions/Button';
import { type BaseMessageOptions, EmbedBuilder, ActionRowBuilder, type ButtonBuilder } from 'discord.js';

export function genCreateVoteCountEmbed(): BaseMessageOptions {
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

export function genVoteCountEmbed(vc: FullVoteCount): BaseMessageOptions {
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

	const players = vc.players.length > 0 ? vc.players.map((p, i) => `${i + 1}. ${p.user.username} ${p.voteWeight == 1 ? '' : `[x${p.voteWeight}]`}`).join('\n') : '> None';
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

export function genStateEmbed(vc: FullVoteCount): BaseMessageOptions {
	if (!vc) return genCreateVoteCountEmbed();
	const { embeds } = genVoteCountEmbed(vc);

	const row = new ActionRowBuilder<ButtonBuilder>();
	const homeButton = CustomButton.getButtonOrThrow(GoHomeButton.customId);
	const jumpToDay = CustomButton.getButtonOrThrow(JumpToDayButton.customId);
	const setVoteWeight = CustomButton.getButtonOrThrow(ManageVoteWeight.customId);

	row.addComponents(homeButton.generateButton(), jumpToDay.generateButton(), setVoteWeight.generateButton());

	return {
		embeds,
		components: [row],
	};
}

export function genPlayersEmbed(vc: FullVoteCount): BaseMessageOptions {
	if (!vc) return genCreateVoteCountEmbed();
	const { embeds } = genVoteCountEmbed(vc);

	const row = new ActionRowBuilder<ButtonBuilder>();
	const homeButton = CustomButton.getButtonOrThrow(GoHomeButton.customId);
	const addPlayersButton = CustomButton.getButtonOrThrow(AddPlayersButton.customId);
	const removePlayersButton = CustomButton.getButtonOrThrow(RemovePlayersButton.customId);
	const replacePlayerButton = CustomButton.getButtonOrThrow(ReplacePlayersButton.customId);

	row.addComponents(homeButton.generateButton(), addPlayersButton.generateButton(), removePlayersButton.generateButton(), replacePlayerButton.generateButton());

	return {
		embeds,
		components: [row],
	};
}

export function genPlaceholderEmbed(vc?: FullVoteCount): BaseMessageOptions {
	if (!vc) return genCreateVoteCountEmbed();

	const embed = new EmbedBuilder();
	embed.setTitle('PLACEHOLDER');
	embed.setDescription(`This menu has not been created yet`);
	embed.setColor('Yellow');

	const row = new ActionRowBuilder<ButtonBuilder>();

	const homeButton = CustomButton.getButtonOrThrow(GoHomeButton.customId);
	row.addComponents(homeButton.generateButton());

	return {
		embeds: [embed],
		components: [row],
	};
}
