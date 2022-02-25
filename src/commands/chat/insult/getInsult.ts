import {Insult} from './Insult.d';
import getJson from '../../../core/GetJson.js';
import {insultBlacklist} from './insultBlacklist.js';

export default async function getInsult(): Promise<Insult> {
	const insult = await getJson<Insult>('https://evilinsult.com/generate_insult.php?lang=en&type=json');
	if (insultBlacklist.includes(insult.number)) {
		return getInsult();
	}
	return insult;
}
