/**
 * Waits the allocated time before resolving the promise
 * @param {number} time The time to wait in milliseconds
 * @return {Promise<void>} When the time has passed
 */
export default function wait(time: number): Promise<void> {
	return new Promise((res) => {
		setTimeout(() => {
			res();
		}, time);
	});
}
