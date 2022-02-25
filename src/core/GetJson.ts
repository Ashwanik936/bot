import fetch from 'node-fetch';

/**
 * Fetch JSON from a URL
 * @param {string} url The URL to fetch the JSON from
 * @return {Promise<resType>} The JSON object
 */
export default async function getJson<resType = any>(url: string): Promise<resType> {
	const req = await fetch(url);
	const json = await req.json();
	return <resType> json;
}
