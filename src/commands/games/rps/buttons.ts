import {Button} from './../../../core/Button.d';

export const emojis = {
	r: '🪨',
	s: '✂️',
	p: '📰',
};
export const playerOneButtons: Button[] = [
	{
		label: emojis.r,
		id: 'r',
	},
	{
		label: emojis.s,
		id: 's',
	},
	{
		label: emojis.p,
		id: 'p',
	},
];
export enum WinOutcome {
	Draw,
	PlayerOne,
	PlayerTwo,
}
export const WinScenarios: {[id: string]: WinOutcome} = {
	'rs': WinOutcome.PlayerOne,
	'pr': WinOutcome.PlayerOne,
	'sp': WinOutcome.PlayerOne,

	'sr': WinOutcome.PlayerTwo,
	'rp': WinOutcome.PlayerTwo,
	'ps': WinOutcome.PlayerTwo,

	'rr': WinOutcome.Draw,
	'pp': WinOutcome.Draw,
	'ss': WinOutcome.Draw,
};

