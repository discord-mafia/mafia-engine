import {
	APIEmbedField,
	ChannelType,
	Colors,
	EmbedBuilder,
	RestOrArray,
} from 'discord.js';
import { SubCommand } from '../../builders/subcommand';
import {
	insertSignup,
	insertSignupCategory,
	getHydratedSignup,
	HydratedSignup,
} from '../../db/signups';
import { InteractionError } from '../../utils/errors';

export const createSignup = new SubCommand('create')
	.addStringOption((o) =>
		o.setName('name').setDescription('Name of the signup')
	)
	.addIntegerOption((o) =>
		o
			.setName('limit')
			.setDescription('How many players do you want to sign up?')
	)
	.onExecute(async (i) => {
		if (!i.guild)
			throw new InteractionError(
				'Cannot use this command outside of a server'
			);
		if (!i.channel || i.channel.type != ChannelType.GuildText)
			throw new InteractionError(
				'Cannot use this command outside of a text channel'
			);

		const name = i.options.getString('name') ?? 'Game Signups';
		const limit = i.options.getInteger('limit');

		const deferred = await i.deferReply({ fetchReply: true });

		const signup = await insertSignup({
			guildId: i.guild.id,
			channelId: i.channel.id,
			messageId: deferred.id,
			name,
		});

		if (!signup) throw new InteractionError('Failed to create signup');

		await insertSignupCategory({
			signupId: signup.id,
			name: 'Players',
			buttonName: 'Play',
			limit,
			isFocused: true,
		});

		await insertSignupCategory({
			signupId: signup.id,
			name: 'Backups',
			buttonName: 'Backup',
		});

		await insertSignupCategory({
			signupId: signup.id,
			name: 'Hosts',
			isHoisted: true,
		});

		await insertSignupCategory({
			signupId: signup.id,
			name: 'Moderators',
			isHoisted: true,
		});

		await insertSignupCategory({
			signupId: signup.id,
			name: 'Balancers',
			isHoisted: true,
		});

		const hydrated = await getHydratedSignup(deferred.id);
		if (!hydrated) throw new InteractionError('Failed to hydrate signup');

		const embed = formatSignupEmbed(hydrated);
		await i.editReply({ embeds: [embed] });
	});

export function formatSignupEmbed(signup: HydratedSignup) {
	const embed = new EmbedBuilder();
	embed.setTitle(signup.name);
	embed.setDescription('Click the appropriate buttons to join a category');
	embed.setColor(Colors.Blurple);

	const hoistedFields: RestOrArray<APIEmbedField> = [];
	const otherFields: RestOrArray<APIEmbedField> = [];

	for (const category of signup.categories) {
		let users_str = '';
		for (const user of category.users) {
			users_str += `> ${user.username}\n`;
		}
		if (users_str == '') users_str = '> None';

		const field = {
			name: category.name,
			value: users_str,
			inline: true,
		};

		if (category.isHoisted) hoistedFields.push(field);
		else otherFields.push(field);
	}

	embed.addFields(hoistedFields);
	embed.addFields({
		name: '\u200B',
		value: '**__[ SIGNED UP ]__**',
	});
	embed.addFields(otherFields);

	return embed;
}
