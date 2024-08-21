import { SlashCommand } from '../builders/slashCommand';
import { SubCommandHandler } from '../builders/subcommandHandler';

export default new SlashCommand('commands')
	.setDescription('List all commands and what they do')
	.onExecute(async (i) => {
		const slashCommands = SlashCommand.slashCommands;
		const subCommandHandlers = SubCommandHandler.subcommandHandlers;

		const commandList: string[] = [];

		slashCommands.forEach((v) => {
			commandList.push(`/${v.name} :: ${v.description}`);
		});

		subCommandHandlers.forEach((v) => {
			commandList.push('');
			v.getSubCommands().forEach((sub) => {
				commandList.push(
					`/${v.name} ${sub.name} :: ${sub.description}`
				);
			});
		});

		const content = `\`\`\`asciidoc\n${commandList.join('\n')}\`\`\``;
		await i.reply({ content, ephemeral: true });
	});
