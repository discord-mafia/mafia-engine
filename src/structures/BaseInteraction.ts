import { Collection, type Interaction } from 'discord.js';
import type { UnknownResponse } from '~/util/types';

export type CustomID = string;
export interface FilledCustomID {
	customId: CustomID;
	cacheKey: string;
}

export const interactions: Collection<string, BaseInteraction> = new Collection();
interface BaseInteraction {
	customID: CustomID;
	execute: (i: Interaction, cache?: unknown) => UnknownResponse;
}

export function createInteraction(i: BaseInteraction) {
	if (i.customID.indexOf('_') > -1) {
		console.log(`Interaction ${i.customID} has an invalid custom ID.`);
	} else {
		interactions.set(i.customID, i);
	}
}
