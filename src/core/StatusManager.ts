// Handles the bot's status and fetches it from Firebase

import {FrodoClient} from './FrodoClient';

export default class StatusManager {
	client: FrodoClient;
	typeOptions: string[];
	refreshInterval: number;

	constructor(client: FrodoClient, refreshInterval: number) {
		this.client = client;
		this.refreshInterval = refreshInterval;
		this.typeOptions = [
			'PLAYING',
			'STREAMING',
			'LISTENING',
			'WATCHING',
		];
		this.fetchData();
	}

	private async fetchData() {
		const data = await this.client.firebase.getValue(this.client.firebase.getDoc('botData', 'status'));
		if (data && this.typeOptions.includes(data.type)) {
			this.client.user.setActivity(data.status, {type: data.type});
		} else {
			this.client.user.setActivity('/help', {type: 'PLAYING'});
		}
		setTimeout(() => this.fetchData(), this.refreshInterval);
	}
}
