
![Status](https://img.shields.io/endpoint?url=https://frodo.fun/api/status)
![Servers](https://img.shields.io/endpoint?url=https://frodo.fun/api/servers)
![Build](https://img.shields.io/gitlab/pipeline-status/frodobot/bot.svg?branch=master)


<br/>
<p style="text-align: center;">
	<a href="https://gitlab.com/frodobot/bot">
		<img src="https://frodo.fun/static/img/icons/nobg-text.svg" style="height: 400px;"/>
	</a>
</p>

<p style="text-align: center;">
    A work in progress Discord Minigames bot that brings many of you childhood favourites right into the comfort of the Discord UI
    <br/>
    <a href="https://gitlab.com/frodobot/bot"><strong>Explore the Repo»</strong></a>
    <br/><br/>
    <a href="https://invite.frodo.fun">Invite to your server</a>
    ·
    <a href="https://help.frodo.fun">Report Bug / Request Feature</a>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
	- [Features](#features)
	- [Dependencies](#dependencies)

<!-- ABOUT THE PROJECT -->
## About The Project

There are many Discord bots out there that can do games, but Frodo aims to bring them all together. It is currently being worked on by [Daniel Howard](https://gitlab.com/danielhoward) and [Noah Lavelle](https://gitlab.com/noahlavelle) for fun and to develop skills. It is being updated frequently and includes many classic games.

### Features

The bot will currently has quite a few games. The full list currently is
* [Akinator](https://frodo.fun/commands#Akinator)
* [Anagrams](https://frodo.fun/commands#Anagrams)
* [Connect Four](https://frodo.fun/commands#Connect%20Four)
* [Hangman](https://frodo.fun/commands#Hangman)
* [Othello](https://frodo.fun/commands#Othello)
* [Rock Paper Scissors](https://frodo.fun/commands#Rock%20Paper%20Scissors)
* [Trivia](https://frodo.fun/commands#Trivia)
* [Tic Tac Toe](https://frodo.fun/commands#Tic%20Tac%20Toe)
* [Fact](https://frodo.fun/commands#Fact)
* [Fortune](https://frodo.fun/commands#Fortune)
* [Insult](https://frodo.fun/commands#Insult)
* [Joke](https://frodo.fun/commands#Joke)


### Dependencies

These are all of the node modules the bot uses.
```sh
discord.js
aki-api
node-fetch
express
firebase
nodemailer
topgg-autoposter
ws
```

# Development

To develop on Frodo, some environment variables are required. To do this, make a file called `.env` in the root of the project and include these values:
* TOKEN: The token you have recieved from your [Discord Developer Portal](https://discord.com/developers/applications)
* RUNTIME: Indicates the runtime version of bot
* TESTING: Indicates runtime version but for testing

<p>
The following variables are optional:

* FIREBASE_CONFIG: The config you have recieved from firebase, this allows Frodo to connect to the firestore to store leaderboards
* TOPGG_TOKEN: Upload statistics to top.gg
* WEBSOCKETAUTH: For the Website WebSocket
* SENDMAIL: Send emails containing errors that have happend
* MAIL_USER: Username for Email
* MAIL_PASS: Password for Email
* EMAILRECIVERS: Recievers for the error emails, seperated by a `,`
* GITLABISSUEEMAIL: The email to make issues on GitLab
