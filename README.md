# Pool Scoreboard

A full stack app to help me and my friends play 8 ball pool and track the scores in a table format.

Instead of using the notes app in my iPhone, I wanted to make a simple react app to keep scores of a pool tournament we were having. This app has different databases in Supabase and stores all the information so that anyone playing in the tournament can go onto the live app, check the current match being played, the current table standing and previous match history. 

## Installation and Setup Instructions

Available to view on live netlify server - https://cottagepool.netlify.app/

Alternatively,

You will need `node` and `npm` installed on your machine.

Clone the repo:

`https://github.com/usama-asghar1/RecipeLibrary.git`

Install the required npm modules:

`npm install`

Start the application:

`npm start`

## Usage

1. Use the add player button to add the names of the players
2. Check all the possible matches and select a current match
3. Deteremine the winner of the match and see the table update
4. Clear the board when done by pressing clear and delete the players

## Tech Stack

**Client:** JavaScript, HTML, CSS, React, Supabase

## Improvements

Potential future improvements:

- Add user authentication: Allow users to sign up and log in to create their own game sessions where they can invite other users to be part of the tournament
- Improve UI/UX: Make the app's design and user interface more visually appealing
- Personal Statistics: Show the user their personal stats like total wins, total losses etc. that they can view in their profile
