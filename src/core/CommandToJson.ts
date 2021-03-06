// Turns a local command into a JSON object suitable for Discord's API

import {SlashCommandBuilder} from '@discordjs/builders';

const OptionTypeKeys = {
	USER: 'addUserOption',
	BOOLEAN: 'addBooleanOption',
	STRING: 'addStringOption',
};

export function commandToJson(json) {
	const command = new SlashCommandBuilder()
		.setName(json.name)
		.setDescription(json.description);

	json.options?.forEach((optionData) => {
		command[OptionTypeKeys[optionData.type]]((option) => {
			option.setName(optionData.name);
			option.setDescription(optionData.description);
			option.setRequired(optionData.required);
			optionData.choices?.forEach((choice) => {
				option.addChoice(choice.name, choice.value);
			});

			return option;
		});
	});

	return command.toJSON();
}
