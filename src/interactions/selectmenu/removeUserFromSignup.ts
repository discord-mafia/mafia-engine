import { formatSignupEmbed } from '../../util/embeds';
import { prisma } from '../..';
import { SelectMenu } from '../../structures/interactions';
import { getSignup } from '../../util/database';

export default new SelectMenu('remove-user-from-signup').onExecute(async (i, cache) => {
	if (!cache) return i.reply({ content: 'This select menu is invalid', ephemeral: true });
	if (!i.guild) return;
	if (!i.channel) return;

	const values = i.values;
	const messageId = cache;

	await i.deferReply({ ephemeral: true });

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
	if (!signupMessage) return i.editReply({ content: 'Failed to fetch signup message but the players are removed' });

	const reset = await getSignup({ messageId });
	if (!reset) return i.editReply({ content: 'This button failed' });
	const { embed, row } = formatSignupEmbed(reset);

	signupMessage.edit({ embeds: [embed], components: [row] });

	await i.editReply({ content: 'Removed users from signup' });
});
