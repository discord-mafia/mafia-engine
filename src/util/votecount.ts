import { type Snowflake } from 'discord.js';
import { type FullVoteCount } from './database';

export type CalculatedVoteCount = ReturnType<typeof calculateVoteCount>;
export function calculateVoteCount(vc: FullVoteCount) {
	const players = new Map<Snowflake, string>();
	const wagons = new Map<Snowflake, Snowflake[]>();
	const weights = new Map<Snowflake, number>();

	let votingNoLynch: Snowflake[] = [];
	let nonVoters: Snowflake[] = [];
	let majorityReached = false;

	vc.votes.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

	for (const player of vc.players) {
		players.set(player.discordId, player.user.username);
		weights.set(player.discordId, player.voteWeight);
		nonVoters.push(player.discordId);
	}

	for (const vote of vc.votes) {
		if (majorityReached) continue;

		const voterId = vote.voter.discordId;
		const votedTargetId = vote.votedTarget?.discordId;
		const isNoLynch = vc.noLynch && vote.isNoLynch;
		const isUnvote = !votedTargetId && !isNoLynch;

		if (votedTargetId && !wagons.get(votedTargetId)) wagons.set(votedTargetId, []);

		const wagonArray = Array.from(wagons.values()).map((val) => {
			const totalVoteWeight = val.reduce((acc, cur) => acc + (weights.get(cur) ?? 1), 0);
			return totalVoteWeight;
		});
		const highestWagon = Math.max(...wagonArray);

		// If majority is reached, skip
		if (vc.majority && highestWagon >= Math.floor(vc.players.length / 2 + 1)) {
			majorityReached = true;
			continue;
		}

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
		majorityReached,
		weights,
		settings: {
			majority: vc.majority,
		},
		iteration: [vc.currentRound, vc.currentIteration],
	};
}

export function formatVoteCount(calculated: CalculatedVoteCount) {
	const { wagons, nonVoters, players } = calculated;

	let format = `\`\`\`yaml\nVote Count ${calculated.iteration[0]}.${calculated.iteration[1]}\n\n`;

	if (calculated.majorityReached) format += '- Majority has been reached -\n\n';

	wagons.forEach((wagon, key) => {
		if (wagon.length > 0) {
			const wagonVoteWeight = wagon.reduce((acc, cur) => acc + (calculated.weights.get(cur) ?? 1), 0);
			const name = `${players.get(key) ?? `<@${key}>`} (${wagonVoteWeight})`;
			const value = wagon.length > 0 ? wagon.map((id) => players.get(id) ?? `<@${id}>`).join(', ') : 'None';
			format += `${name} - ${value}\n`;
		}
	});

	if (calculated.votingNoLynch.length > 0) {
		const noLynchVoteWeight = calculated.votingNoLynch.reduce((acc, cur) => acc + (calculated.weights.get(cur) ?? 1), 0);
		const name = `No-Lynch (${noLynchVoteWeight})`;
		const value = calculated.votingNoLynch.map((id) => players.get(id) ?? `<@${id}>`).join(', ');
		format += `\n${name} - ${value}\n`;
	}

	if (nonVoters.length > 0) {
		const name = `Not Voting (${nonVoters.length})`;
		const value = nonVoters.map((id) => players.get(id) ?? `<@${id}>`).join(', ');
		format += `\n${name} - ${value}`;
	}

	const hasSettings = calculated.settings.majority;
	if (hasSettings) format += `\n\n- - - - -\n`;
	if (calculated.settings.majority) format += `\nWith ${players.size} players, majority is ${Math.floor(players.size / 2 + 1)} votes`;

	format += `\n\`\`\``;

	return format;
}
