export function cleanUsername(username: string) {
	const illegal_chars = [
		'*',
		'_',
		'~',
		'`',
		'|',
		'>',
		'[',
		']',
		'(',
		')',
		':',
	];

	const regex = new RegExp(
		`([${illegal_chars.map((char) => `\\${char}`).join('')}])`,
		'g'
	);

	return username.replace(regex, '\\$1');
}
