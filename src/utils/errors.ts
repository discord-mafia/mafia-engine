/* eslint-disable quotes */

import { EmbedBuilder, Interaction } from 'discord.js';

export enum ErrorCode {
	Unknown = 'UNKNOWN',
	NotPermitted = 'NOT_PERMITTED',
	NotImplemented = 'NOT_IMPLEMENTED',
	NotFound = 'NOT_FOUND',
	BadRequest = 'BAD_REQUEST',
	Conflict = 'CONFLICT',
	Internal = 'INTERNAL',

	// Specifics
	OutOfServer = 'OUT_OF_SERVER',
	OutOfTextChannel = 'OUT_OF_TEXT_CHANNEL',
	MissingContext = 'MISSING_CONTEXT',
}

export function isErrorCode(value: string): value is ErrorCode {
	return (
		ErrorCode.Unknown === value ||
		ErrorCode.NotPermitted === value ||
		ErrorCode.NotImplemented === value ||
		ErrorCode.NotFound === value ||
		ErrorCode.BadRequest === value ||
		ErrorCode.Conflict === value ||
		ErrorCode.Internal === value ||
		ErrorCode.OutOfServer === value ||
		ErrorCode.OutOfTextChannel === value ||
		ErrorCode.MissingContext === value
	);
}

export type StatusMessage = {
	status: ErrorCode;
	message?: string;
};

// Default status messages
export const defaultStatusMessages: Record<ErrorCode, string> = {
	[ErrorCode.Unknown]: 'An unknown error occurred',
	[ErrorCode.NotPermitted]:
		'You do not have the required permissions to do this',
	[ErrorCode.NotImplemented]: 'This feature has not been implemented yet',
	[ErrorCode.NotFound]: 'The requested resource was not found',
	[ErrorCode.BadRequest]: 'The request was invalid',
	[ErrorCode.Conflict]: 'The resource already exists or cannot be overridden',
	[ErrorCode.Internal]: 'An internal server error occurred',

	// Specifics
	[ErrorCode.OutOfServer]: 'This action must be done within a server',
	[ErrorCode.OutOfTextChannel]:
		'This action must be done within a text channel',
	[ErrorCode.MissingContext]:
		'This action requires internal context that it is unable to find',
};

const embedErrorJokeNames: string[] = [
	'Oopsie Daisy!',
	'Oh no :C',
	'Uh oh!',
	'Someone screwed up!',
	'Whoops!',
	'Yikes!',
	'Well, this is awkward...',
	"This wasn't supposed to happen!",
	'Houston, we have a problem!',
	'Oops, something broke!',
	'Oh snap!',
	"It's not you, it's me…",
	'Oh dear!',
	'What have you done?',
	'Something went wrong!',
	"This is why we can't have nice things!",
	"That didn't go as planned!",
	'Whoops-a-doodle!',
	'The gremlins are at it again!',
	"Oof, that's not good!",
	'Uh oh, spaghettios!',
	'Oh crumbs!',
	'The computer says no!',
	"Something's fishy here!",
	'Well, this is embarrassing...',
	"That's a big nope!",
	'Whoopsie doopsie!',
	'Oh fiddle sticks!',
	'Technical difficulties!',
	'What just happened?',
	'Something went kaboom!',
	'Well, this is unexpected!',
	'The internet goblins struck again!',
	'Oh boy, not again!',
	'The system is not amused!',
	'This was not in the script!',
	'The code monkeys made a mess!',
	"We're gonna need a bigger boat!",
	'Bummer, dude!',
	'Time for a coffee break!',
	'The universe glitched!',
	"Red alert! Something's broken!",
	'Better call tech support!',
	"It's a trap!",
	'We hit a snag!',
	'The hamster fell off the wheel!',
	'Oopsie poopsie!',
	'Oh fudge!',
	"That's not supposed to happen!",
	'Sorry, my bad!',
	'Cowabummer!',
];

export function getErrorEmbedTitle() {
	return (
		embedErrorJokeNames[
			Math.floor(Math.random() * embedErrorJokeNames.length)
		] ?? 'Oopsie Daisy!'
	);
}

export class InteractionError extends Error {
	public readonly errorCode: ErrorCode = ErrorCode.Unknown;
	constructor(message: string | ErrorCode | StatusMessage) {
		if (typeof message === 'string') {
			super(
				isErrorCode(message) ? defaultStatusMessages[message] : message
			);
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
	embed.setTitle(getErrorEmbedTitle());
	embed.setDescription(error.message ?? 'An unknown error occurred');
	embed.setColor(0xff0000);

	if (error instanceof InteractionError) {
		embed.setFooter({
			text: `ERR_${error.errorCode}`,
		});

		if (error.errorCode === ErrorCode.NotImplemented) {
			embed.setColor('Grey');
			embed.setTitle('Oopsie Daisy!');
		}

		if (embed.data.title == 'Cowabummer!') {
			embed.setImage(
				'https://media.discordapp.net/attachments/1111370865943261334/1277312399908536422/sddefault.png'
			);
		}
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
