import { SubCommandHandler } from '../builders/subcommandHandler';
import { SubCommand } from '../builders/subcommand';

export const testSubcommand = new SubCommand('again').onExecute(async (i) => {
	await i.reply('test');
});

export const test = new SubCommandHandler('test').addSubCommand(testSubcommand);
