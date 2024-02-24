import { signupSettingsMain } from '@views/signups';
import { getSignup } from '@models/signups';
import { CustomButtonBuilder } from '@structures/interactions/Button';

export default new CustomButtonBuilder('signups-connect-feature')
	.onGenerate((builder) => builder.setLabel('Connect Feature'))
	.onExecute(async (i, cache) => {
		if (!i.guild) return i.reply({ content: 'This command can only be used in a server', ephemeral: true });
		if (!cache) return i.reply({ content: 'The button you pressed was invalid', ephemeral: true });
		const signup = await getSignup({ messageId: cache });
		if (!signup) return i.reply({ content: 'The button you pressed was for a signup that no longer exists', ephemeral: true });

		const payload = signupSettingsMain(signup);
		return await i.update(payload);
	});
