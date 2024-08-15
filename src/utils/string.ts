function generateTrigrams(str: string): Set<string> {
	const trigrams = new Set<string>();
	for (let i = 0; i < str.length - 2; i++) {
		const trigram = str.substring(i, i + 3);
		trigrams.add(trigram);
	}
	return trigrams;
}

function calculateTrigramSimilarity(
	set1: Set<string>,
	set2: Set<string>
): number {
	const intersection = new Set<string>([...set1].filter((x) => set2.has(x)));
	const union = new Set<string>([...set1, ...set2]);
	return intersection.size / union.size;
}

export function compare(str1: string, str2: string): number {
	const trigrams1 = generateTrigrams(str1);
	const trigrams2 = generateTrigrams(str2);
	return calculateTrigramSimilarity(trigrams1, trigrams2);
}

export function trigramSimilarity(
	input: string,
	arr: string[],
	limit: number
): { str: string; similarity: number }[] {
	const similarities = arr.map((str) => ({
		str,
		similarity: compare(input, str),
	}));
	similarities.sort((a, b) => b.similarity - a.similarity);
	return similarities.slice(0, limit);
}
