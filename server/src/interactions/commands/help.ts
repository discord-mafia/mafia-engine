import {
	APIApplicationCommandOptionChoice,
	ChannelType,
	EmbedBuilder,
	GuildMember,
	InviteTargetType,
	SlashCommandBuilder,
	TextChannel,
} from 'discord.js';
import { newSlashCommand } from '../../structures/BotClient';

const LIST_OF_STAFF = 'LIST_OF_STAFF';
const options: Record<string, string> = {
	'Wiki Main Page': 'https://discord-mafia-role-cards.fandom.com/wiki/Discord_Mafia_Role_cards_Wiki',
	'List of Roles': 'https://discord-mafia-role-cards.fandom.com/wiki/List_of_roles',
	'How to Play': 'https://discord-mafia-role-cards.fandom.com/wiki/How_To_Play',
	'Grand Idea Mafia': 'https://discord-mafia-role-cards.fandom.com/wiki/Grand_Idea_Mafia',
	Terminology: 'https://discord-mafia-role-cards.fandom.com/wiki/Terminology',
	'Voting Terminology': 'https://discord-mafia-role-cards.fandom.com/wiki/Voting_Terminology',
};

const parseOptions = (): APIApplicationCommandOptionChoice<string>[] => {
	const result: APIApplicationCommandOptionChoice<string>[] = [];

	Object.keys(options).forEach((v) => {
		result.push({
			name: v,
			value: v,
		});
	});

	return result;
};

const data = new SlashCommandBuilder().setName('help').setDescription('Access various helpful information for Discord Mafia');

data.addStringOption((x) =>
	x
		.setName('options')
		.setDescription('What type of help would you like?')
		.setRequired(true)
		.addChoices(...parseOptions())
);

export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;
		const selectedOption = i.options.getString('options', true);

		const option = options[selectedOption];
		if (!option) return i.reply({ content: 'Invalid request', ephemeral: true });

		const embed = new EmbedBuilder()
			.setTitle(selectedOption)
			.setURL(option)
			.setThumbnail(i.guild.iconURL())
			.setDescription('Click on the link to access the wiki page')
			.setColor('White');
		await i.reply({ embeds: [embed] });
	},
});
