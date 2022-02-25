import {Button} from './../../../core/Button.d';
import {CLEAREMOJI, LETTEREMOJIS, NUMBEREMOJIS} from '../../../core/GlobalConstants.js';

export const clearPlayerEmojis = [
	'<:p0c:851057388030525440>',
	'<:p1c:851057401003900938>',
];
export const gridEmojis = [
	'<:gr:851050647302438912>',
	'<:p0:851054097129144340>',
	'<:p1:851054110673076224>',
	'<:sr:851055934172430336>',
];
export const tipEmojis = (help: boolean): string[] => {
	return help ? [
		'<:gr:851050647302438912>',
		'<:0o:855787570834046976>',
		'<:1o:855787570864586782>',
		'<:0os:855787570872057856>',
		'<:1os:855787570943098920>',
	] : [
		'<:gr:851050647302438912>',
		'<:gr:851050647302438912>',
		'<:gr:851050647302438912>',
		'<:sr:851055934172430336>',
		'<:sr:851055934172430336>',
	];
};
export const controlEmojis = [
	'✅',
	'❌',
];
export enum GridPlace {
	Empty,
	PlayerOne,
	PlayerTwo,
	Selected,
}
export enum HelpGridPlace {
	Empty,
	PlayerOne,
	PlayerTwo,
	PlayerOneSelected,
	PlayerTwoSelected,
}
export enum SpaceStatus {
	Free,
	Taken,
}
export const defaultStringGrid = [
	[CLEAREMOJI.name, NUMBEREMOJIS[0].name, NUMBEREMOJIS[1].name, NUMBEREMOJIS[2].name, NUMBEREMOJIS[3].name, NUMBEREMOJIS[4].name, NUMBEREMOJIS[5].name, NUMBEREMOJIS[6].name, NUMBEREMOJIS[7].name],
	[LETTEREMOJIS[0].name, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty],
	[LETTEREMOJIS[1].name, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty],
	[LETTEREMOJIS[2].name, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty],
	[LETTEREMOJIS[3].name, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty],
	[LETTEREMOJIS[4].name, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty],
	[LETTEREMOJIS[5].name, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty],
	[LETTEREMOJIS[6].name, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty],
	[LETTEREMOJIS[7].name, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty, GridPlace.Empty],
];
export interface GridCheck {
	canPlay: boolean;
	playableDirections?: number[][];
	playablePlaces?: number[][];
}
export interface CounterCounts {
	black: number;
	white: number;
}
export const allDirections = [
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, -1],
	[0, 1],
	[1, -1],
	[1, 0],
	[1, 1],
];

export const letterButtons: Button[][] = [
	[
		{
			label: 'A',
			id: '0',
		},
		{
			label: 'B',
			id: '1',
		},
		{
			label: 'C',
			id: '2',
		},
		{
			label: 'D',
			id: '3',
		},
	],
	[
		{
			label: 'E',
			id: '4',
		},
		{
			label: 'F',
			id: '5',
		},
		{
			label: 'G',
			id: '6',
		},
		{
			label: 'H',
			id: '7',
		},
	],
];
export const numberButtons: Button[][] = [
	[
		{
			label: '1',
			id: '0',
		},
		{
			label: '2',
			id: '1',
		},
		{
			label: '3',
			id: '2',
		},
		{
			label: '4',
			id: '3',
		},
	],
	[
		{
			label: '5',
			id: '4',
		},
		{
			label: '6',
			id: '5',
		},
		{
			label: '7',
			id: '6',
		},
		{
			label: '8',
			id: '7',
		},
	],
];
export const controlButtons: Button[][] = [
	[
		{
			label: '✓',
			style: 'SUCCESS',
			id: '0',
		},
		{
			label: 'X',
			style: 'DANGER',
			id: '1',
		},
	],
];
export const tipButton: (on: boolean) => Button = (on: boolean): Button => {
	return {
		label: '💡',
		style: on ? 'SUCCESS' : 'DANGER',
		id: 'tip',
	};
};
