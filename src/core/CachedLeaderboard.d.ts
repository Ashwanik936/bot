import {LeaderboardItem} from './LeaderboardItem';

export interface CachedLeaderboard {
	[key: string]: {
		leaderboard: LeaderboardItem[],
		lastUpdate: number,
	}
}
