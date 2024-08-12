import { getSignup } from '../../../models/signups';
import { CustomStringSelectMenu } from '../../../structures/interactions/StringSelectMenu';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { signupSettingsManageCategory } from '../../../views/signups';

export default new CustomStringSelectMenu('manage-signups-categories')
	.onGenerate((builder) => builder.setMaxValues(1).setMinValues(1).setPlaceholder('Select the category to manage'))
	.onExecute(async (i, cache) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		if (!i.channel) throw new InteractionError('This command can only be used in a channel');
		if (!cache) throw new InteractionError('This command is invalid as it has no valid cache attached');

		const values = i.values;
		const messageId = cache;
		const categoryString = values[0];
		if (values.length === 0 || !categoryString) throw new InteractionError('You need to select a category');

		const categoryID = parseInt(categoryString);
		if (isNaN(categoryID)) throw new InteractionError('This select menu option was invalid');

		const signup = await getSignup({ messageId: messageId });
		if (!signup) throw new InteractionError('This signup no longer or never existed');

		const payload = signupSettingsManageCategory(signup, categoryID);
		await i.update(payload);
	});
