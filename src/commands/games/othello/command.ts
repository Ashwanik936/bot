import {Command} from './../../../core/Command.d';
import othello from './othello.js';

export const command: Command = {
	name: 'othello',
	description: 'A game of othello against another player',
	options: [
		{
			name: 'playertwo',
			description: 'The user that you would like to challenge',
			type: 'USER',
			required: true,
		},
		{
			name: 'showmoves',
			description: 'Show the possible moves that you can make (this can be changed during the game)',
			type: 'BOOLEAN',
			required: false,
		},
	],
	version: '1.0.0',
	handler: othello,
};
