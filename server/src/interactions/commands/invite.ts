import { SlashCommandBuilder } from 'discord.js';
import { newSlashCommand } from '../../structures/BotClient';

const data = new SlashCommandBuilder().setName('invite').setDescription('See the invite links for our servers');
data.addStringOption((title) =>
	title.setName('server').setDescription('Server you want the invite link for.').setRequired(true).setChoices(
		{
			name: 'Discord Mafia',
			value: 'https://discord.gg/v4e6rrhXJG',
		},
		{
			name: 'Discord Mafia Playerchats',
			value: 'https://discord.gg/4ygmH7b',
		}
	)
);

data.addBooleanOption((pub) => pub.setName('reveal').setDescription('Send this publicly (ignore or FALSE for just yourself)').setRequired(false));

export default newSlashCommand({
	data,
	execute: async (i) => {
		const link = i.options.getString('server', true);
		const ephemeral = !(i.options.getBoolean('reveal', false) ?? false);

		await i.reply({
			content: link,
			ephemeral,
		});
	},
});
