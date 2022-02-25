import {Command} from './../../../core/Command.d';
import leaderboard from './leaderboard.js';

export const command: Command = {
	name: 'leaderboard',
	description: 'Check out the current Frodo leaderboard!',
	options: [
		{
			name: 'game',
			description: 'Pick a game to view the leaderboard for',
			type: 'STRING',
			choices: [
				{
					name: 'Trivia',
					value: 'trivia',
				},
			],
			required: true,
		},
	],
	version: '1.0.0',
	handler: leaderboard,
};
