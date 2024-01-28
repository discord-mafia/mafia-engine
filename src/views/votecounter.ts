import { type FullVoteCount } from '@models/votecounter';
import createVotecount from '@root/events/buttons/manageVotecount/createVotecount';
import GoHomeButton from '@root/events/buttons/manageVotecount/goHome';
import ManagePlayersButton from '@root/events/buttons/manageVotecount/gotoPlayersMenu';
import GotoStateButton from '@root/events/buttons/manageVotecount/gotoStateMenu';
import GotoTogglesMenu from '@root/events/buttons/manageVotecount/gotoToggles';
import AddPlayersButton from '@root/events/buttons/manageVotecount/players/addPlayers';
import RemovePlayersButton from '@root/events/buttons/manageVotecount/players/removePlayers';
import ReplacePlayersButton from '@root/events/buttons/manageVotecount/players/replacePlayer';
import ManageVoteWeight from '@root/events/buttons/manageVotecount/state/changeVoteWeight';
import JumpToDayButton from '@root/events/buttons/manageVotecount/state/jumpToDay';
import { type BaseMessageOptions, EmbedBuilder, ActionRowBuilder, type ButtonBuilder } from 'discord.js';
import { type Snowflake } from 'discord.js';

export function genCreateVoteCountEmbed(): BaseMessageOptions {
	const embed = new EmbedBuilder();
	embed.setTitle('Create Vote-Counter');
	embed.setDescription('There is no vote counter in this channel');
	embed.setColor('Red');
	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(createVotecount.build());

	return {
		embeds: [embed],
		components: [row],
	};
}

export function genVoteCountEmbed(vc: FullVoteCount): BaseMessageOptions {
	const embed = new EmbedBuilder();
	embed.setTitle('Manage Vote Counter');
	embed.setDescription('Manage the vote counter for the game');
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
	row.addComponents(ManagePlayersButton.build(), GotoStateButton.build(), GotoTogglesMenu.build());

	return {
		embeds: [embed],
		components: [row],
	};
}

export function genStateEmbed(vc: FullVoteCount): BaseMessageOptions {
	if (!vc) return genCreateVoteCountEmbed();
	const { embeds } = genVoteCountEmbed(vc);

	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(GoHomeButton.build(), JumpToDayButton.build(), ManageVoteWeight.build());
	return {
		embeds,
		components: [row],
	};
}

export function genPlayersEmbed(vc: FullVoteCount): BaseMessageOptions {
	if (!vc) return genCreateVoteCountEmbed();
	const { embeds } = genVoteCountEmbed(vc);

	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(GoHomeButton.build(), AddPlayersButton.build(), RemovePlayersButton.build(), ReplacePlayersButton.build());

	return {
		embeds,
		components: [row],
	};
}

export function genPlaceholderEmbed(vc?: FullVoteCount): BaseMessageOptions {
	if (!vc) return genCreateVoteCountEmbed();

	const embed = new EmbedBuilder();
	embed.setTitle('PLACEHOLDER');
	embed.setDescription('This menu has not been created yet');
	embed.setColor('Yellow');

	const row = new ActionRowBuilder<ButtonBuilder>();
	row.addComponents(GoHomeButton.build());

	return {
		embeds: [embed],
		components: [row],
	};
}

export type CalculatedVoteCount = ReturnType<typeof calculateVoteCount>;
export function calculateVoteCount(vc: FullVoteCount) {
	const players = new Map<Snowflake, string>();
	const wagons = new Map<Snowflake, Snowflake[]>();
	const weights = new Map<Snowflake, number>();

	let votingNoLynch: Snowflake[] = [];
	let nonVoters: Snowflake[] = [];

	vc.votes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
	const checkMajorityReached = () => {
		return Math.max(...Array.from(wagons.values()).map((val) => val.reduce((acc, cur) => acc + (weights.get(cur) ?? 1), 0))) >= Math.floor(vc.players.length / 2 + 1);
	};

	for (const player of vc.players) {
		players.set(player.discordId, player.user.username);
		weights.set(player.discordId, player.voteWeight);
		nonVoters.push(player.discordId);
	}

	for (const vote of vc.votes) {
		if (vc.majority && checkMajorityReached()) continue;

		const voterId = vote.voter.discordId;
		const votedTargetId = vote.votedTarget?.discordId;
		const isNoLynch = vc.noLynch && vote.isNoLynch;
		const isUnvote = !votedTargetId && !isNoLynch;

		if (votedTargetId && !wagons.get(votedTargetId)) wagons.set(votedTargetId, []);

		wagons.forEach((wagon, key) => {
			const exists = wagon.includes(voterId);
			const isFocused = !isNoLynch && !isUnvote && key == votedTargetId;

			if (exists && !isFocused) {
				votingNoLynch = votingNoLynch.filter((id) => id != voterId);
				wagons.set(
					key,
					wagon.filter((id) => id != voterId)
				);
			} else if (isFocused && !exists) wagons.set(key, [...wagon, voterId]);
		});

		if (isNoLynch) votingNoLynch = [...votingNoLynch.filter((id) => id != voterId), voterId];
		if (isUnvote) votingNoLynch = votingNoLynch.filter((id) => id != voterId);

		nonVoters = [];
		Array.from(players.keys()).forEach((player) => {
			let isVoting = false;
			wagons.forEach((wagon) => {
				if (wagon.includes(player)) isVoting = true;
			});
			if (!isVoting && !votingNoLynch.includes(player)) nonVoters.push(player);
		});
	}

	return {
		players,
		wagons,
		nonVoters,
		votingNoLynch,
		majorityReached: vc.majority && checkMajorityReached(),
		weights,
		settings: {
			majority: vc.majority,
		},
		iteration: [vc.currentRound, vc.currentIteration],
	};
}

export function formatVoteCount(calculated: CalculatedVoteCount) {
	const { wagons, players } = calculated;

	let format = `\`\`\`yaml\nDay ${calculated.iteration[0]} Votecount ${calculated.iteration[1]}\n\n`;

	if (calculated.majorityReached) format += '- Majority has been reached -\n\n';

	type Wagon = {
		name: string;
		size: number;
		value: string;
	};
	const rawWagons: Wagon[] = [];

	wagons.forEach((wagon, key) => {
		if (wagon.length > 0) {
			const wagonVoteWeight = wagon.reduce((acc, cur) => acc + (calculated.weights.get(cur) ?? 1), 0);
			const name = `${players.get(key) ?? `<@${key}>`}: `;

			const voteArray = wagon.map((id) => {
				const player = players.get(id) ?? `<@${id}>`;
				const playerVoteWeight = calculated.weights.get(id);
				return `${player} ${playerVoteWeight && playerVoteWeight > 1 ? `[x${playerVoteWeight}]` : ''}`;
			});

			rawWagons.push({
				name,
				size: wagonVoteWeight,
				value: voteArray.length > 0 ? voteArray.join(', ') : 'None',
			});
		}
	});

	if (calculated.votingNoLynch.length > 0) {
		const noLynchVoteWeight = calculated.votingNoLynch.reduce((acc, cur) => acc + (calculated.weights.get(cur) ?? 1), 0);
		const name = 'Skipping: ';
		const value = calculated.votingNoLynch.length > 0 ? calculated.votingNoLynch.map((id) => players.get(id) ?? `<@${id}>`).join(', ') : 'None';
		rawWagons.push({ name, size: noLynchVoteWeight, value });
	}

	if (calculated.nonVoters.length > 0) {
		const name = 'Abstaining: ';
		const value = calculated.nonVoters
			.map((id) => {
				const player = players.get(id) ?? `<@${id}>`;
				const playerVoteWeight = calculated.weights.get(id);
				return `${player} ${playerVoteWeight && playerVoteWeight > 1 ? `[x${playerVoteWeight}]` : ''}`;
			})
			.join(', ');

		rawWagons.push({ name, size: calculated.nonVoters.length, value });
	}

	// Go through rawWagons and make all the first element in the array the same length, pad with spaces
	const longestWagonName = Math.max(...rawWagons.map((wagon) => wagon.name.length));
	const longestSizeCharacters = Math.max(...rawWagons.map((wagon) => wagon.size.toString().length));

	let noLynchValue: string | undefined;
	let notVotingValue: string | undefined;
	rawWagons.forEach(({ name, size, value }) => {
		const paddedName = name.padEnd(longestWagonName, ' ');
		const paddedSize = size.toString().padStart(longestSizeCharacters, ' ');
		const parsedValue = `${paddedName} ${paddedSize} - ${value}`;

		if (name.includes('Skipping')) noLynchValue = parsedValue;
		else if (name.includes('Abstaining')) notVotingValue = parsedValue;
		else format += `${parsedValue}\n`;
	});

	if (noLynchValue) format += `\n${noLynchValue}`;
	if (notVotingValue) format += `\n${notVotingValue}`;
	if (noLynchValue || notVotingValue) format += '\n';

	const hasSettings = calculated.settings.majority;
	if (hasSettings) format += '\n- - - - -\n';
	if (calculated.settings.majority) format += `\nWith ${players.size} players, majority is ${Math.floor(players.size / 2 + 1)} votes`;

	format += '\n```';

	return format;
}
