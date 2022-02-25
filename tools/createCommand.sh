#!/bin/bash

cd "$( dirname "${BASH_SOURCE[0]}" )"

read -p "Command Name: " name
read -p "Command Description: " description
read -p "Category: " category
read -p "Function or class: " f_or_c
read -p "Command options (y/n): " options

name=${name,,}

if [ "$options" = "y" ]
then
OPTIONS=$(cat << EOF

	options: [
		{
			name: 'name',
			description: 'description',
			type: 'USER',
			required: true,
		},
	],
EOF
)
fi

DATA=$(cat << EOF
{
	name: '$name',
	description: '$description',$OPTIONS
	version: '1.0.0',
	handler: $name,
}
EOF
)

COMMAND=$(cat << EOF
import {Command} from './../../../core/Command.d';
import $name from './$name.js';

export const command: Command = $DATA;
EOF
)

COMMAND_CLASS=$(cat << EOF
import {CommandBaseOptions} from '../../../core/CommandBaseOptions.js';
import CommandBase from '../../../core/CommandBase.js';

export default class ${name^} extends CommandBase {
	constructor(options: CommandBaseOptions) {
		super(options);
	}
}
EOF
)

COMMAND_FUNCTION=$(cat << EOF
import {FrodoClient, Message, Options, Interaction} from '../../../core/FrodoClient';

export default function(this: FrodoClient, message: Message, options: Options, interaction: Interaction) {

}
EOF
)

if [ ! -d "../src/commands/$category" ]
then
    mkdir "../src/commands/$category"
fi

if [ -d "../src/commands/$category/$name" ]
then
    printf "Command already exists"
    exit
fi

mkdir "../src/commands/$category/$name"
touch "../src/commands/$category/$name/$name.ts"
touch "../src/commands/$category/$name/command.ts"

printf "$COMMAND\n" >> "../src/commands/$category/$name/command.ts"

if [ "$f_or_c" = "class" ]
then
    printf "$COMMAND_CLASS\n" >> "../src/commands/$category/$name/$name.ts"
elif [ "$f_or_c" = "function" ]
then
    printf "$COMMAND_FUNCTION\n" >> "../src/commands/$category/$name/$name.ts"
else
    printf "Invalid command type"
    exit
fi

./rewriteCommandFile.sh
printf "Command successfully registered"
printf "Have you remembered to create a new git branch?"
