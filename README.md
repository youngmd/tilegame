# TileGame

## To Install:

- Clone this repository
- cd into cloned directory
- run `npm install`
- run `npm start`

By default the server will listen on port 9002.  This can be overriden by setting the environment variable PORT or editing server.js  

## Usage:

The game can be customized via 2 optional settings:

- Number of tokens player starts with
- Maximum delay between rounds

To set these options, change the url parameters:

http://yourserver.com/#!/game/tokens/delay

So to give the player 15 tokens and set a random delay of 1-10 seconds, go to:

http://yourserver.com/#!/game/15/10
