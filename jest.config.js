/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	moduleNameMapper: {
		'^@App/(.*)$': '<rootDir>/src/$1',
		'^lib/(.*)$': '<rootDir>/common/$1',
	}, // other Jest configurations...
};
