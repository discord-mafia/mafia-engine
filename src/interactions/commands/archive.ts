import { APIApplicationCommandOptionChoice, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { newSlashCommand } from '../../structures/BotClient';

const data = new SlashCommandBuilder().setName('archive').setDescription('Manage an archive');

const queues: string[] = ['main', 'special', 'newcomer', 'turbo', 'community'];
const phases: string[] = ['day', 'night', 'pregame'];
data.addSubcommand((sub) =>
	sub
		.setName('start')
		.setDescription('Start an archive')
		.addStringOption((opt) =>
			opt
				.setName('queue')
				.setDescription('The queue to start an archive for')
				.setChoices(
					...queues.map((queue) => {
						return { name: queue.charAt(0).toUpperCase() + queue.slice(1), value: queue };
					})
				)
				.setRequired(true)
		)
		.addIntegerOption((opt) => opt.setName('number').setDescription('The number of the game').setRequired(true))
		.addStringOption((opt) => opt.setName('title').setDescription('The title of the game').setRequired(true))
);
data.addSubcommand((sub) =>
	sub
		.setName('player')
		.setDescription('Add a player to an archive')
		.addUserOption((opt) => opt.setName('member').setDescription('The member to add').setRequired(true))
		.addStringOption((opt) => opt.setName('alignment').setDescription('The alignment of the member').setRequired(true))
		.addStringOption((opt) => opt.setName('role').setDescription('The role of the member').setRequired(true))
		.addBooleanOption((opt) => opt.setName('won').setDescription('Whether the member won the game').setRequired(true))
);

data.addSubcommand((sub) =>
	sub
		.setName('missingmember')
		.setDescription('Add a missing player to an archive')
		.addStringOption((opt) => opt.setName('discordid').setDescription('The discord id of the missing player').setRequired(true))
		.addStringOption((opt) =>
			opt.setName('username').setDescription('The username of the missing player. Ignored if DB has it').setRequired(true)
		)
		.addStringOption((opt) => opt.setName('alignment').setDescription('The alignment of the member').setRequired(true))
		.addStringOption((opt) => opt.setName('role').setDescription('The role of the member').setRequired(true))
		.addBooleanOption((opt) => opt.setName('won').setDescription('Whether the member won the game').setRequired(true))
);
data.addSubcommand((sub) =>
	sub
		.setName('action')
		.setDescription('Add an action to an archive')
		.addStringOption((opt) =>
			opt
				.setName('phase')
				.setDescription('The phase of the action')
				.setRequired(true)
				.setChoices(
					...phases.map((phase) => {
						return { name: phase.charAt(0).toUpperCase() + phase.slice(1), value: phase };
					})
				)
		)
		.addIntegerOption((opt) => opt.setName('number').setDescription('The number of the phase of the action').setRequired(true))
		.addStringOption((opt) => opt.setName('discordid').setDescription('The discord id of the player who did the action').setRequired(true))
		.addStringOption((opt) => opt.setName('action').setDescription('The action that was done').setRequired(true))
);
data.addSubcommand((sub) =>
	sub
		.setName('event')
		.setDescription('Add an event to an archive')
		.addStringOption((opt) =>
			opt
				.setName('phase')
				.setDescription('The phase of the action')
				.setRequired(true)
				.setChoices(
					...phases.map((phase) => {
						return { name: phase.charAt(0).toUpperCase() + phase.slice(1), value: phase };
					})
				)
		)
		.addIntegerOption((opt) => opt.setName('number').setDescription('The number of the phase of the action').setRequired(true))
		.addStringOption((opt) => opt.setName('event').setDescription('The event that was done').setRequired(true))
);
data.addSubcommand((sub) =>
	sub
		.setName('spreadsheet')
		.setDescription('Set the spreadsheet URL')
		.addStringOption((opt) => opt.setName('url').setDescription('The URL of the spreadsheet').setRequired(true))
);
data.addSubcommand((sub) =>
	sub
		.setName('url')
		.setDescription('Add a URL to an archive')
		.addStringOption((opt) => opt.setName('url').setDescription('The URL to add').setRequired(true))
		.addStringOption((opt) => opt.setName('description').setDescription('The description of the URL').setRequired(false))
);
data.addSubcommand((sub) => sub.setName('submit').setDescription('Submit the archive'));

export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;

		const subcommand = i.options.getSubcommand(true);

		switch (subcommand) {
		}

		await i.reply({ content: 'This command is restricted to the bot owner.', ephemeral: true });
	},
});
