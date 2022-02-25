export enum ButtonValidate {
	/**
	 * The `onButtonClick` function will be run
	 */
	Run,
	/**
	 * The `onButtonClick` function will not be run
	 */
	Ignore,
	/**
	 * A message will be sent to the user that they are not allowed to click the button
	 */
	Message,
}
