import {
	APIApplicationCommandOptionChoice,
	ChannelType,
	ColorResolvable,
	EmbedBuilder,
	GuildMember,
	InviteTargetType,
	SlashCommandBuilder,
	TextChannel,
} from 'discord.js';
import { newSlashCommand } from '../../structures/BotClient';
import axios from 'axios';
import { load } from 'cheerio';
import { format } from 'path';

const data = new SlashCommandBuilder().setName('test').setDescription('TEST');

data.addStringOption((x) => x.setName('wiki-url').setDescription('Wiki URL').setRequired(true));

export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;

		return i.reply({ content: 'Test', ephemeral: true });

		// const url = i.options.getString('wiki-url', true);
		// await i.deferReply();
		// try {
		// 	const response = await axios.get(url);
		// 	const $ = load(response.data);

		// 	//#Rolecard
		// 	//#Alternative_Names
		// 	const rolecard = $('#Rolecard');
		// 	const alternative = $('#Alternative_Names');

		// 	// #mw-content-text > div > h3

		// 	const header3 = $('#mw-content-text > div > h3').first();

		// 	const roleCardName = $('#mw-content-text > div > h3 > span > span').first();
		// 	const colour = roleCardName.css('color') ?? '#FFFFFF';
		// 	const hex = colour.startsWith('#') ? colour : `#FFFFFF`;

		// 	const otherData = header3.next();
		// 	const otherDataFormat = otherData
		// 		.text()
		// 		.split('\n')
		// 		.map((v) => `- ${v}`)
		// 		.join('\n');

		// 	const abilities = otherData.next().next();

		// 	const dataList: [string, string[]][] = [];
		// 	const directUnder = abilities.find('li');
		// 	directUnder.each((v) => {
		// 		const subData = $(v).find('ul > li').text().split('\n');
		// 		const data = $(v).children().first().text();

		// 		dataList.push([data, subData]);
		// 	});

		// 	let abilityFormat = '';
		// 	for (const [abil, subAbil] of dataList) {
		// 		abilityFormat += `- ${abil}\n${subAbil.map((v) => ` - ${v}`).join('\n')}\n`;
		// 	}

		// 	const embed = new EmbedBuilder();
		// 	embed.setTitle(roleCardName.text());
		// 	embed.setColor(hex as ColorResolvable);
		// 	embed.setDescription(otherDataFormat);

		// 	embed.addFields({
		// 		name: 'Abilities',
		// 		value: abilityFormat,
		// 	});

		// 	await i.editReply({ embeds: [embed] });
		// } catch (err) {
		// 	console.log(err);
		// 	await i.editReply('Error');
		// }
	},
});
