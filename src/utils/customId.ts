export const CUSTOM_ID_SEPERATOR = ':';

export function verifyCustomId(custom_id: string) {
	return !custom_id.includes(CUSTOM_ID_SEPERATOR);
}

export type ParsedCustomID = {
	custom_id: string;
	context?: string;
};
export function parseCustomId(custom_id: string): ParsedCustomID {
	const split = custom_id.split(CUSTOM_ID_SEPERATOR);
	const parsed_custom_id = split.shift() ?? custom_id;
	return {
		custom_id: parsed_custom_id,
		context: split.join(CUSTOM_ID_SEPERATOR),
	};
}

export function createCustomId(custom_id: string, context?: string) {
	if (!context) return custom_id;
	return `${custom_id}${CUSTOM_ID_SEPERATOR}${context}`;
}
