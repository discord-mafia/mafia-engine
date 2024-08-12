# Mafia Engine

## Overview

Mafia Engine is a Discord bot written in Typescript. It is designed to be a simple, easy and fun bot to manage games of Mafia on the official [Discord Mafia server](https://discord.gg/social-deduction). The main focus for this project is to remove any tedious aspect of managing the server and games while leaving it as fun for the hosts and players as possible.

This bot is currently in development and is actively getting new features and bug fixes. If you have any suggestions or find any bugs, please feel free to open an issue or pull request.

## Bot Features

-   Signup / Looking For Group functionality
-   Automatic vote counting and vote handling
-   Automatic game management (mass-changing permissions and creating appropriate channels)

## Technical Features

-   Written in Typescript using Discord.JS
-   Using Prisma and PostgreSQL for database management

## Installation

**For all processes**

1. Clone the repository in a directory of your choice
2. Run `npm install` to install all dependencies
3. Rename `.env.example` to `.env` and fill in the appropriate values

**To run the bot officially**

1. Run `npm run build` to build the project
2. Run `npm run start` to start the node process
    - If you wish to use pm2 to manage the process, run `npm run start:local`
3. Enjoy!

**To run the bot in a dev environment**

1. Run `npm run dev` to start the nodemon process
