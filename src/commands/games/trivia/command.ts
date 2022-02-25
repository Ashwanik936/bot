import {Command} from './../../../core/Command.d';
import trivia from './trivia.js';

export const command: Command = {
	name: 'trivia',
	description: 'Play trivia with your friends',
	options: [
		{
			name: 'difficulty',
			description: 'Select the difficulty of the question',
			type: 'STRING',
			choices: [
				{
					name: 'Easy',
					value: 'easy',
				},
				{
					name: 'Medium',
					value: 'medium',
				},
				{
					name: 'Hard',
					value: 'hard',
				},
			],
			required: false,
		},
		{
			name: 'category',
			description: 'Select the category of the question',
			type: 'STRING',
			choices: [
				{
					name: 'General Knowledge',
					value: '9',
				},
				{
					name: 'Entertainment: Books',
					value: '10',
				},
				{
					name: 'Entertainment: Film',
					value: '11',
				},
				{
					name: 'Entertainment: Music',
					value: '12',
				},
				{
					name: 'Entertainment: Musicals & Theatres',
					value: '13',
				},
				{
					name: 'Entertainment: Television',
					value: '14',
				},
				{
					name: 'Entertainment: Video Games',
					value: '15',
				},
				{
					name: 'Entertainment: Board Games',
					value: '16',
				},
				{
					name: 'Science & Nature',
					value: '17',
				},
				{
					name: 'Science: Computers',
					value: '18',
				},
				{
					name: 'Science: Mathematics',
					value: '19',
				},
				{
					name: 'Mythology',
					value: '20',
				},
				{
					name: 'Sports',
					value: '21',
				},
				{
					name: 'Geography',
					value: '22',
				},
				{
					name: 'History',
					value: '23',
				},
				{
					name: 'Politics',
					value: '24',
				},
				{
					name: 'Art',
					value: '25',
				},
				{
					name: 'Celebrities',
					value: '26',
				},
				{
					name: 'Animals',
					value: '27',
				},
				{
					name: 'Vehicles',
					value: '28',
				},
				{
					name: 'Entertainment: Comics',
					value: '29',
				},
				{
					name: 'Science: Gadgets',
					value: '30',
				},
				{
					name: 'Entertainment: Japanese Anime & Manga',
					value: '31',
				},
				{
					name: 'Entertainment: Cartoon & Animations',
					value: '32',
				},
			],
			required: false,
		},
	],
	version: '1.0.0',
	handler: trivia,
};
