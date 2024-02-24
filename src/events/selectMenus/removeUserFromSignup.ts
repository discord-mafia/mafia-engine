import { prisma } from '../..';
import { getSignup } from '../../models/signups';
import { CustomUserSelectMenuBuilder } from '../../structures/interactions/UserSelectMenu';
import { InteractionError } from '../../structures/interactions/_Interaction';
import { formatSignupEmbed, signupSettingsMain } from '../../views/signups';

export default new CustomUserSelectMenuBuilder('manage-signps-players-remove')
	.onGenerate((builder) => builder.setMaxValues(20).setMinValues(1).setPlaceholder('Players to remove from ALL categories'))
	.onExecute(async (i, cache) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		if (!i.channel) throw new InteractionError('This command can only be used in a channel');
		if (!cache) throw new InteractionError('This command is invalid as it has no valid cache attached');

		const values = i.values;
		const messageId = cache;

		const signup = await getSignup({ messageId });
		if (!signup) return i.reply({ content: 'This select menu is invalid', ephemeral: true });

		const allCategoryIds = signup.categories.map((x) => x.id);

		await prisma.signupUserJunction.deleteMany({
			where: {
				signupCategoryId: {
					in: allCategoryIds,
				},
				user: {
					discordId: {
						in: values,
					},
				},
			},
		});

		const signupMessage = await i.channel.messages.fetch(messageId);
		if (!signupMessage) return i.update({ content: 'Failed to fetch signup message but the players are removed' });

		const reset = await getSignup({ messageId });
		if (!reset) return i.update({ content: 'This button failed' });
		const { embed, row } = formatSignupEmbed(reset);

		signupMessage.edit({ embeds: [embed], components: [row] });

		const payload = signupSettingsMain(reset);
		await i.update(payload);
	});
