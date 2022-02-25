import {GridPlace} from './types.js';

export function makeTttGrid(width: number, height: number): GridPlace[][] {
	const grid: GridPlace[][] = [];
	for (let i = 0; i < height; i++) {
		grid[i] = [];
		for (let j = 0; j < width; j++) {
			grid[i][j] = GridPlace.Empty;
		}
	}
	return grid;
}
