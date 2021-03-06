import {ContextMenuCommand} from './core/ContextMenuCommand';

export const contextMenuCommands: ContextMenuCommand[] = [
	{
		name: 'Challenge to C4',
		type: 'USER',
	},
	{
		name: 'Challenge to TTT',
		type: 'USER',
	},
	{
		name: 'Insult them',
		type: 'USER',
	},
	{
		name: 'Compliment them',
		type: 'USER',
	},
];

export const contextMenuCommandsMap = {
	'Insult them': 'insult',
	'Challenge to C4': 'connectfour',
	'Challenge to TTT': 'ttt',
	'Compliment them': 'compliment',
};
