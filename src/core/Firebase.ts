// Handles our Database to allow for data to be stored

import {FirebaseApp, FirebaseOptions, initializeApp} from 'firebase/app';
import {collection, doc, DocumentReference, Firestore, getDoc, getFirestore, setDoc, updateDoc, query, orderBy, limit, getDocs} from 'firebase/firestore';

import {FrodoClient} from './FrodoClient';
import {LeaderboardItem} from './leaderboardItem';
import {CachedLeaderboard} from './CachedLeaderboard';

export default class Firebase {
	client: FrodoClient;
	app: FirebaseApp;
	database: Firestore;
	connected: boolean;
	cachedLeaderboards: CachedLeaderboard;

	constructor(client: FrodoClient) {
		this.client = client;
		this.connected = false;
		this.cachedLeaderboards = {};
		this.connect();
	}

	private connect() {
		if (!process.env.FIREBASE_CONFIG) {
			this.client.warnLog('No firebase config found, skipping firebase initialization');
			return;
		}
		try {
			const config: FirebaseOptions = <FirebaseOptions> JSON.parse(process.env.FIREBASE_CONFIG);
			this.app = initializeApp(config);
			this.database = getFirestore();

			this.client.debugLog('Connected to firebase');
			this.connected = true;
		} catch (e) {
			this.client.errorLog('Failed to connect to firebase', e);
		}
	}

	/**
	 * Get a collection reference from the database
	 * @param {string[]} path An array of strings representing the path to the collection
	 * @return {DocumentReference} The firebase document reference
	 */
	public getDoc(...path: string[]): DocumentReference {
		if (!this.connected) return;
		try {
			return doc(collection(this.database, path.shift()), ...path);
		} catch (e) {
			this.client.errorLog(`Failed to get document firebase reference`, e);
			return;
		}
	}

	/**
	 * Path is from the root of the database and `/` is used to separate each level
	 * @param {DocumentReference} reference The reference to the document you want to get
	 * @return {Promise<any>} The value at the specified path
	 */
	public async getValue(reference: DocumentReference): Promise<any> {
		if (!this.connected) return;
		const value = await getDoc(reference);
		try {
			return value.data();
		} catch (e) {
			this.client.errorLog(`Failed to get firebase value`, e);
			return;
		}
	}

	/**
	 * Path is from the root of the database and `/` is used to separate each level
	 * @param {DocumentReference} reference The reference to the document you want to set
	 * @param {any} [value] The value to set at the specified path
	 */
	public async setValue(reference: DocumentReference, value: any): Promise<any> {
		if (!this.connected) return;
		try {
			await setDoc(reference, value);
			return;
		} catch (e) {
			this.client.errorLog(`Failed to set fierbase value`, e);
			return;
		}
	}

	/**
	 * Path is from the root of the database and `/` is used to separate each level
	 * @param {DocumentReference} reference The reference to the document you want to update
	 * @param {any} [value] The value to set at the specified path
	 */
	public async updateValue(reference: DocumentReference, value: any): Promise<any> {
		if (!this.connected) return;
		try {
			await updateDoc(reference, value);
			return;
		} catch (e) {
			this.client.errorLog(`Failed to update firebase value`, e);
			return;
		}
	}

	/**
	 * Returns the top 5 users on the specified leaderboard
	 * @param {string} game The game to get the leaderboard for
	 * @return {Promise<LeaderboardItem[]>} The top 5 users on the specified leaderboard
	 */
	public async getTopLeaderboard(game: string): Promise<LeaderboardItem[]> {
		if (!this.connected) return;

		if (this.cachedLeaderboards[game] && this.cachedLeaderboards[game].lastUpdate > Date.now() - 1000 * 60) {
			return this.cachedLeaderboards[game].leaderboard;
		}

		const leaderboardRef = collection(this.database, `${game}Leaderboard`);
		const dbQuery = query(leaderboardRef, orderBy('score', 'desc'), limit(5));
		const value = await getDocs(dbQuery);
		const values: LeaderboardItem[] = [];
		value.forEach((doc) => {
			values.push(<LeaderboardItem> doc.data());
		});

		this.cachedLeaderboards[game] = {
			leaderboard: values,
			lastUpdate: Date.now(),
		};

		return values;
	}
}
