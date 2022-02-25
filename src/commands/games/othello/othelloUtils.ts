import {GridPlace, HelpGridPlace, SpaceStatus} from './emoji.js';

export function makeOthelloGrid(height, width): GridPlace[][] {
	const grid: number[][] = [];

	for (let i = 0; i < width; i++) {
		grid[i] = [];
		for (let j = 0; j < height; j++) {
			grid[i][j] = GridPlace.Empty;
		}
	}

	const gridCenter = [width / 2, height / 2];
	grid[Math.round(gridCenter[0] - 1)][Math.round(gridCenter[1] - 1)] = GridPlace.PlayerOne;
	grid[Math.round(gridCenter[0])][Math.round(gridCenter[1])] = GridPlace.PlayerOne;
	grid[Math.round(gridCenter[0])][Math.round(gridCenter[1] - 1)] = GridPlace.PlayerTwo;
	grid[Math.round(gridCenter[0] - 1)][Math.round(gridCenter[1])] = GridPlace.PlayerTwo;

	return grid;
}
export function makeOthelloHelpGrid(height, width, start?): HelpGridPlace[][] {
	const grid: number[][] = [];

	for (let i = 0; i < width; i++) {
		grid[i] = [];
		for (let j = 0; j < height; j++) {
			grid[i][j] = GridPlace.Empty;
		}
	}

	if (start) {
		const gridCenter = [width / 2, height / 2];
		grid[Math.round(gridCenter[0])][Math.round(gridCenter[1] - 1) - 1] = GridPlace.PlayerOne;
		grid[Math.round(gridCenter[0]) + 1][Math.round(gridCenter[1] - 1)] = GridPlace.PlayerOne;
		grid[Math.round(gridCenter[0] - 1) - 1][Math.round(gridCenter[1])] = GridPlace.PlayerOne;
		grid[Math.round(gridCenter[0] - 1)][Math.round(gridCenter[1]) + 1] = GridPlace.PlayerOne;
	}

	return grid;
}
export function makeTakenSpaces(height, width): SpaceStatus[][] {
	const spaces = [];
	for (let i = 0; i < width; i++) {
		spaces[i] = [];
		for (let j = 0; j < height; j++) {
			spaces[i][j] = SpaceStatus.Free;
		}
	}

	const gridCenter = [width / 2, height / 2];
	spaces[Math.round(gridCenter[0] - 1)][Math.round(gridCenter[1] - 1)] = SpaceStatus.Taken;
	spaces[Math.round(gridCenter[0])][Math.round(gridCenter[1])] = SpaceStatus.Taken;
	spaces[Math.round(gridCenter[0])][Math.round(gridCenter[1] - 1)] = SpaceStatus.Taken;
	spaces[Math.round(gridCenter[0] - 1)][Math.round(gridCenter[1])] = SpaceStatus.Taken;

	return spaces;
}
export function makeTakenRows(height): SpaceStatus[] {
	const rows = [];
	for (let i = 0; i < height; i++) {
		rows[i] = SpaceStatus.Free;
	}
	return rows;
}
export function getPlayerHelpSpace(playersGo: number): HelpGridPlace {
	return playersGo === 0 ? HelpGridPlace.PlayerOne : HelpGridPlace.PlayerTwo;
}

export function getPlayerSpace(playersGo: number): GridPlace {
	return playersGo === 0 ? GridPlace.PlayerOne : GridPlace.PlayerTwo;
}

export function getOtherPlayerSpace(playersGo: number): GridPlace {
	return playersGo === 0 ? GridPlace.PlayerTwo : GridPlace.PlayerOne;
}
