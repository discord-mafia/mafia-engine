import { ChannelType } from 'discord.js';
import { SubCommand } from '../../builders/subcommand';
import {
	insertSignup,
	insertSignupCategory,
	getHydratedSignup,
} from '../../db/signups';
import { InteractionError } from '../../utils/errors';
import { formatSignupComponents, formatSignupEmbed } from '../../views/signup';

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
		const components = formatSignupComponents(hydrated);

		await i.editReply({ embeds: [embed], components: [components] });

		await deferred.startThread({
			name: 'Discussion',
		});
	});
