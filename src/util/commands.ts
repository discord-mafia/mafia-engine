import { type SlashCommandBooleanOption } from 'discord.js';

export function addHiddenOption(opt: SlashCommandBooleanOption) {
	return opt.setName('hidden').setDescription('Whether to show hidden roles').setRequired(false);
}
