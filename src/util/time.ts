export function convertDiscordTimestamp(discordTimestamp: number): string {
	const date = new Date(discordTimestamp * 1000);

	const utcHours = date.getUTCHours();
	const minutes = date.getUTCMinutes();
	const month = date.getUTCMonth() + 1;
	const day = date.getUTCDate();
	const year = date.getUTCFullYear();
	const isDST = isDaylightSavingTime(new Date(year, month - 1, day));
	const estOffset = isDST ? -4 : -5;
	const estHours = (utcHours + estOffset + 24) % 24;
	const hours12 = estHours % 12 || 12; // Convert 0 -> 12 for 12 AM
	const period = estHours >= 12 ? 'PM' : 'AM';
	const formattedMinutes = minutes.toString().padStart(2, '0');
	return `${hours12}:${formattedMinutes} ${period} EST`;
}

function isDaylightSavingTime(date: Date): boolean {
	// Last Sunday in March to last Sunday in October
	const startDST = new Date(date.getUTCFullYear(), 2, getLastSunday(2, date.getUTCFullYear()));
	const endDST = new Date(date.getUTCFullYear(), 9, getLastSunday(9, date.getUTCFullYear()));

	return date >= startDST && date < endDST;
}

// Helper function to find the last Sunday of a given month in a given year
function getLastSunday(month: number, year: number): number {
	const lastDay = new Date(Date.UTC(year, month + 1, 0)); // Last day of the month
	const dayOfWeek = lastDay.getUTCDay();
	return lastDay.getUTCDate() - dayOfWeek;
}
