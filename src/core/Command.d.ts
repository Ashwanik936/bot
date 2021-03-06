export type Handler = CommandBase | Function<FrodoClient, Message>;

export interface Command {
    name: string;
    description: string;
    options?: CommandOption[];
    version: string;
    handler?: Handler;
	active?: boolean;
}

interface CommandOption {
    name: string;
    description: string;
    choices?: CommandChoice[];
    required?: boolean;
    type: 'STRING' | 'BOOLEAN' | 'USER';
}

interface CommandChoice {
    name: string;
    value: string;
}
