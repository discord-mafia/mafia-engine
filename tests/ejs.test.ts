import { capitalize } from '../src/util/string';

test('capitlize turns hello into Hello', () => {
	expect(capitalize('hello')).toBe('Hello');
});
