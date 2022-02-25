// Handles the WebSocket connection to the server

import {RawData, WebSocket} from 'ws';

import {FrodoClient} from './FrodoClient';
import wait from './Wait.js';

export default class WebSocketManager {
	client: FrodoClient;
	webSocket: WebSocket;
	live: boolean;
	connectTries: number;
	url: string;
	reconnecting: boolean;
	maxConnectTries: number;
	connected: boolean;
	ping: number;
	lastMessageSent: number;

	constructor(live: boolean, client: FrodoClient, auth: string) {
		this.client = client;
		if (!auth) {
			this.client.warnLog('No auth token provided for WebSocket');
			return;
		}
		this.live = live;
		this.maxConnectTries = 5;
		this.reconnecting = false;
		this.connected = false;
		this.ping = 0;
		this.lastMessageSent = 0;

		this.url = (live ? 'wss://frodo.fun/' : 'ws://localhost/') + auth;
		this.connectTries = 0;
		this.reconnect();
	}

	private reconnect() {
		this.webSocket = new WebSocket(this.url);
		this.registerEvents();
	}

	private registerEvents() {
		this.webSocket.on('error', this.onError.bind(this));
		this.webSocket.on('open', this.onOpen.bind(this));
		this.webSocket.on('message', this.onMessage.bind(this));
		this.webSocket.on('close', this.onClose.bind(this));
	}

	private onError(error: Error) {
		this.client.errorLog('Failed to connect to WebSocket server', error);
		this.webSocket.close();

		if (this.reconnecting) return;
		this.startReconnect();
	}

	private onOpen() {
		this.client.debugLog('WebSocket successfully opened');
		this.reconnecting = false;
		this.connected = true;
		this.startPing();
	}

	private async startPing() {
		while (!this.reconnecting) {
			this.webSocket.send(`${this.client.serverCount}`);
			this.lastMessageSent = Date.now();
			await wait(30000);
		}
	}

	private onMessage(message: RawData) {
		try {
			const {type, data} = JSON.parse(message.toString());
			switch (type) {
			case 'pong':
				this.ping = Date.now() - this.lastMessageSent;
				break;
			case 'vote':
				this.client.sendVoteMessage(data);
				break;
			}
		} catch (e) {}
	}

	private onClose() {
		this.client.warnLog('WebSocket closed');
		this.connected = false;
		if (this.reconnecting) return;
		this.startReconnect();
	}

	private async startReconnect() {
		this.connectTries = 0;
		this.reconnecting = true;
		this.client.warnLog(`Starting to reconnect to WebSocket with ${this.maxConnectTries} attempts`);

		for (let i = 0; i < this.maxConnectTries; i++) {
			this.connectTries++;

			if (this.connectTries > this.maxConnectTries) {
				this.client.errorLog(`Failed to connect to WebSocket server ${this.maxConnectTries} times, not trying again`);
				return;
			}

			this.client.warnLog(`Attempting to reconnect to WebSocket server (${this.connectTries}/${this.maxConnectTries})`);
			this.reconnect();
			await wait(60000);
			if (this.webSocket.readyState === WebSocket.OPEN) {
				this.client.debugLog('Reconnected to WebSocket server');
				return;
			}
		}
	}
}
