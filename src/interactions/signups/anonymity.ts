import { ChannelType } from 'discord.js';
import { SubCommand } from '../../builders/subcommand';

import { InteractionError } from '../../utils/errors';
import { setSignupAnonymity } from '../../db/signups';
import { onSignupUpdate } from './signupUpdateEvent';

export default new SubCommand('anonymity')
	.setDescription('Set whether the signup is anonymous')
	.addBooleanOption((o) =>
		o
			.setName('anonymity')
			.setDescription('The new anonymity status')
			.setRequired(true)
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

		await i.deferReply({ ephemeral: true });

		const isAnonymous = i.options.getBoolean('anonymity', true);
		const signup = await setSignupAnonymity(i.channelId, isAnonymous);
		if (!signup) throw new InteractionError('Failed to fetch signup');

		const msg = await i.channel.messages.fetch(signup.messageId);
		await onSignupUpdate.publish({
			messageId: msg.id,
			message: msg,
		});

		await i.reply({
			content: `Toggled anonymity ${isAnonymous ? 'on' : 'off'}`,
			ephemeral: true,
		});
	});
