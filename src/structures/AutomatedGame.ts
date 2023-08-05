import { Snowflake } from 'discord.js';

type Player = {
	discordId: Snowflake;
	username: string;
};

class AutomatedGame {
	voteCounterId: number | undefined;
	players: Player[] = [];

	constructor() {}
}
