import {Button} from './../../../core/Button.d';

export const hangmanStages = [
	'___\n|      |\n|    \n|    \n|      \n|    \n|',
	'___\n|      |\n|    :dizzy_face: \n|      | \n|      \n|    \n|',
	'___\n|      |\n|    :dizzy_face: \n|    /|\\ \n|      \n|    \n|',
	'___\n|      |\n|    :dizzy_face: \n|    /|\\ \n|      |\n|    \n|',
	'___\n|      |\n|    :dizzy_face: \n|    /|\\ \n|      |\n|    /\n|',
	'___\n|      |\n|    :dizzy_face: \n|    /|\\ \n|      |\n|    / \\\n|',
];
export const stopButton: Button = {
	label: 'X',
	id: 'stop',
	style: 'DANGER',
};
