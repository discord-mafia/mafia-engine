import { prisma } from '../..';
import { FullAutomatedGame, getAutomatedGameOrThrow } from '../../util/database';

/**
 * Cycles through every stored automated game and starts the process to handle actions and events
 */
export async function runCycles() {
	const games = (
		(await prisma.automatedGame.findMany({
			select: {
				id: true,
			},
		})) ?? []
	).map((game) => game.id);

	for (const gameId of games) {
		try {
			const game = await getAutomatedGameOrThrow({ id: gameId });
			runCycle(game);
		} catch (err) {
			console.log(err);
		}
	}
}

export function runCycle(game: FullAutomatedGame) {
	const { currentPhase, scheduledPhaseEnd } = game;
	const isTimerComplete = scheduledPhaseEnd ? Date.now() > scheduledPhaseEnd.getTime() : false;
	switch (currentPhase) {
		case 'Pregame':
			if (isTimerComplete) {
				const allConfirmed =
					game.roles.length > 0
						? game.roles.reduce((acc, role) => {
								if (!role.isConfirmed) return false;
								return acc;
						  }, true)
						: false;

				if (!allConfirmed) {
					// End the game
					// Delete all database entries and roles/channels
				} else {
					// Set up all appropriate functionality and move to the first phase
				}
			}
			break;
		case 'Night':
			if (isTimerComplete) return processNightEnd(game);
			break;
		case 'Day':
			if (isTimerComplete) return processDayEnd(game);

			const voteCountCompleted = false; // Check if hammer is reached.
			if (voteCountCompleted) return processDayEnd(game);
			break;
		case 'Postgame':
			if (isTimerComplete) {
			}
			/* End the game.

				1. Reveal the game setup to all players, unlock chats to discuss.
				2. Create an archive post for the game.
				3. Create a timer for the postgame phase. When over, delete all database entries and roles/channels.
			*/
			break;
		default:
			return;
	}
}

export function processDayEnd(game: FullAutomatedGame) {
	// Check votes
	// If a player has been eliminated
	// 	 1. Kill and flip the player
	// 	 2. Check win conditions. If win conditions are met, end the game unless it's a non-game ending win con.
	//   3. If win conditions are not met, move to the next phase.
}
export function processNightEnd(game: FullAutomatedGame) {
	// Check actions
	// After all actions are handled, check win conditions. If win conditions are met, end the game unless it's a non-game ending win con.
}
