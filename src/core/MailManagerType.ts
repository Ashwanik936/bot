import SMTPTransport from 'nodemailer/lib/smtp-transport';

export enum MailManagerSubjects {
	CAUGHT_ERROR = '"Frodo Bot Error" <bot@frodo.fun>',
	UNCAUGHT_ERROR = '"Frodo Urgent Bot Error" <bot@frodo.fun>',
}
export function transporter(user, pass): SMTPTransport.Options {
	return {
		host: 'smtp.zoho.eu',
		port: 465,
		secure: true,
		auth: {
			user: user,
			pass: pass,
		},
	};
}
export function makeEmail(options: string[][]): string {
	let email = `
		<h1 style="color: red;">$title</h1>
		<p>
			Error:
			<div style="background: lightgrey; border-radius: 5px; padding: 10px;"><code>$error</code></div>
		</p>
		<p>
			Time: $date<br/>
			Command Name: $command_name<br/>
			Command ID: $command_id<br/>
		</p>
	`;

	options.forEach((option) => {
		email = email.replace(`$${option[0]}`, option[1]);
	});

	return email;
}
export function makeUncaughtErrorEmail(options: string[][]): string {
	let email = `
		<h1 style="color: red;">$title</h1>
		<p>
			Error:
			<div style="background: lightgrey; border-radius: 5px; padding: 10px;"><code>$error</code></div>
		</p>
		<p>
			Time: $date<br/>
			The bot will attempt to restart
		</p>
	`;

	options.forEach((option) => {
		email = email.replace(`$${option[0]}`, option[1]);
	});

	return email;
}
export function makeGitLabIssue(error: Error): string {
	return `\`\`\`<br>${error.stack.split('\n').join('<br>')}<br>\`\`\`<br>/label ~"Runtime Error" ~"Priority: High"`;
}
