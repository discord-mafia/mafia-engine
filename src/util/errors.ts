import type { Interaction } from 'discord.js';

export class CustomError extends Error {
	constructor(msg: string) {
		super(msg);
		Object.setPrototypeOf(this, CustomError.prototype);
	}

	respond(i: Interaction) {
		if (i.isRepliable()) return i.reply({ content: this.message, ephemeral: true });
		return Promise.reject(this);
	}
}
