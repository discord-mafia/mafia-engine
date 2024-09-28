export const CUSTOM_ID_SEPERATOR = ':';

export class CustomId {
	private customId: string;
	private context: string | undefined;
	constructor(customId: string, context?: string) {
		if (!CustomId.verifyRaw(customId))
			throw new Error(
				`Custom id ${customId} is not in the correct format.`
			);

		this.customId = customId;
		this.context = context;
	}

	getHydrated() {
		if (!this.context) return this.customId;
		return `${this.customId}${CUSTOM_ID_SEPERATOR}${this.context}`;
	}

	getId() {
		return this.customId;
	}

	getContext() {
		return this.context;
	}

	setCustomId(customId: string) {
		this.customId = customId;
	}

	setContext(context: string) {
		this.context = context;
	}

	static parseString(customId: string) {
		const split = customId.split(CUSTOM_ID_SEPERATOR);
		const parsed_custom_id = split.shift() ?? customId;

		return new CustomId(parsed_custom_id, split.join(CUSTOM_ID_SEPERATOR));
	}

	static verifyRaw(customId: string) {
		return !customId.includes(CUSTOM_ID_SEPERATOR);
	}
}
