import { EmbedBuilder, Interaction } from 'discord.js';

export enum ErrorCode {
	Unknown,
	NotPermitted,
}

export type StatusMessage = {
	status: ErrorCode;
	message?: string;
};

// Default status messages
export const defaultStatusMessages: Record<ErrorCode, string> = {
	[ErrorCode.Unknown]: 'An unknown error occurred',
	[ErrorCode.NotPermitted]:
		'You do not have permission to perform this action',
};

export class InteractionError extends Error {
	public readonly errorCode: ErrorCode = ErrorCode.Unknown;
	constructor(message: string | StatusMessage) {
		if (typeof message === 'string') {
			super(message);
			this.errorCode = ErrorCode.Unknown;
		} else {
			super(message.message ?? defaultStatusMessages[message.status]);
			this.errorCode = message.status;
		}
		this.name = 'InteractionError';
	}
}

export async function handleInteractionError(error: unknown, i: Interaction) {
	if (!(error instanceof Error)) return;

	const embed = new EmbedBuilder();
	embed.setTitle('Oh no :C');
	embed.setDescription(error.message ?? 'An unknown error occurred');
	embed.setColor(0xff0000);

	if (error instanceof InteractionError) {
		embed.setFooter({
			text: `Error code: ${error.errorCode}`,
		});
	}

	if (!i.isRepliable()) return;
	if (i.deferred || i.replied)
		return await i.editReply({
			embeds: [embed],
		});
	return await i.reply({
		embeds: [embed],
		ephemeral: true,
	});
}
