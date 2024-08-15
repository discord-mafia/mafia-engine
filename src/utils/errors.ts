export class InteractionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InteractionError';
	}
}
