import {Compliment} from './Compliment.d';
import getJson from '../../../core/GetJson.js';

export default async function getInsult(): Promise<Compliment> {
	const compliment = await getJson<Compliment>('https://complimentr.com/api');
	return compliment;
}
