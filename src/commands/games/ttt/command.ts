import {Command} from './../../../core/Command.d';
import ttt from './ttt.js';

export const command: Command = {
	name: 'ttt',
	description: 'Play tic tac toe with your friends!',
	options: [
		{
			name: 'playertwo',
			description: 'The player that you would like to challenge',
			type: 'USER',
			required: true,
		},
		{
			name: 'size',
			description: 'The size of the grid, defaults to 3x3',
			choices: [
				{
					name: '3x3',
					value: '3',
				},
				{
					name: '4x4',
					value: '4',
				},
				{
					name: '5x5',
					value: '5',
				},
			],
			type: 'STRING',
			required: false,
		},
		{
			name: 'counttowin',
			description: 'The number of moves required to win, defaults to grid size',
			choices: [
				{
					name: '3',
					value: '3',
				},
				{
					name: '4',
					value: '4',
				},
				{
					name: '5',
					value: '5',
				},
			],
			type: 'STRING',
			required: false,
		},
	],
	version: '1.0.0',
	handler: ttt,
};
