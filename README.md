INSTRUCTIONS FOR RUNNING <br />
Simple way: <br />
All players follow this heroku link: https://boiling-tor-31925.herokuapp.com/
Start playing! <br />
(note: to start a new game, all players need to refresh their browser).

Code-y way: <br />
Run the following command lines in your terminal:
```
git clone https://github.com/fkigawa/ers.git
npm install --save
npm start
```
All players open up http://localhost:3000/ <br />
Start Playing! <br />
(note: to start a new game, the server in your terminal needs to be restarted)

RULES OF EGYPTIAN RAT SCREW
Taken from https://bicyclecards.com/how-to-play/egyptian-rat-screw/ with a few changes/clarifications (which will be indicated).

THE PACK
A standard 52-card deck is used and includes Jokers (change: Deck does not include Jokers).

THE DEAL
(clarification: This action is done automatically at the start of the game)
Deal cards one at a time face down, to each player until all the cards have been dealt evenly. Without looking at any of the cards, each player squares up their hand into a neat pile in front of them.

THE PLAY
(clarification: The starting player will be indicated in everyone's window)
Starting to the left of the dealer players pull the top card off their pile and place it face-up in the middle. If the card played is a number card, the next player puts down a card, too. This continues around the table until somebody puts down a face card or an Ace (J, Q, K, or A).

When a face card or an ace is played, the next person in the sequence must play another face card or an ace in order for play to continue.

(clarification: This description by Bicycle is unclear. when the rules state "within their allotted chance", they mean the following:
The following player has 1 chance to play a face card, after a Jack is played.
The following player has 2 chances to play a face card, after a Queen is played.
The following player has 3 chances to play a face card, after a King is played.
The following player has 4 chances to play a face card, after an Ace is played.)

If the next person in the sequence does not play a face card or an ace within their allotted chance, the person who played the last face card or an ace wins the round and the whole pile goes to them.

(change: The following player begins the next round of play)
The winner begins the next round of play.

(clarification: There is no valid slap condition if war has ended. e.g. If player A plays a Queen, that means the following player, player B, has 2 chances to play a face card. If player B plays a 7 and then another 7, the pile automatically goes to player A.)
The only thing that overrides the face card or an ace rule is the slap rule. The first person to slap the pile of cards when the slap rule is put into effect is the winner of that round. If it cannot be determined who was the first to slap the pile, the person with the most fingers on top wins.

SLAP RULES
Double – When two cards of equivalent value are laid down consecutively. Ex: 5, 5
Sandwich – When two cards of equivalent value are laid down consecutively, but with one card of different value between them. Ex: 5, 7, 5
Top Bottom – When the same card as the first card of the set is laid down.
Tens – When two cards played consecutively (or with a letter card in between) add up to 10. For this rule, an ace counts as one. Ex: 3, 7 or A, K, 9

(change: Not using Jokers)
Jokers – When jokers are used in the game, which should be determined before game play begins. Anytime someone lays down a joker, the pile can be slapped.

(change: Wrapover between A and 2 is not valid. Ex: J, Q, K, A is valid, but Q, K, A, 2 is not valid)
Four in a row – When four cards with values in consistent ascending or descending order is placed. Ex: 5, 6, 7, 8 or Q, K, A, 2
Marriage – When a queen is placed over or under a king. Ex: Q, K or K,Q

(clarification: The player burns 2 cards during a non-slappable condition.)
You must add one or two cards to the bottom of the pile if you slap the pile when it was not slappable.

(change: if there is only one player left with cards, that player automatically wins)
Continue playing even if you have run out of cards. As long as you don't slap at the wrong time, you are still allowed to "slap in" and get cards! Everyone should try to stay in the game until you have a single winner who obtains all the cards

HOW TO KEEP SCORE
(clarification: the player with all the cards or the only player left with cards wins)
The player, who has all of the cards at the end of the game, wins.


DESIGN CHOICES

I structured the card game by beginning with create-react-app, which streamlines the app building process, and by using full-stack Javascript, which is a stack designed to build up apps. I decided to modularize the card creation, player creation, game creation/rules, the server, and the client. With the card and player creation, it's because they're pretty simple and don't need to be changed while editing game rules. The game creation/rules was probably the most time intensive part of the challenge, because there were so many rules I had to account for. And the client and server interacted frequently with each other, so separating them made it easier to spot bugs and build out the game.

Data structures that I used were mostly arrays and hashes, depending on the use case. For creating the player order, an array worked fine. For storing all the information within each player, I needed to use a hash. I used Player and Card objects to store the necessary information within each. Algorithms that I used were guided by the card game's logic; I used for loops and lots and lots of check conditions. Definitely, card games are condition intensive, which brings so many edge cases into the building of the app.

TOOLING

Probably the most important tool I used was socket.io. It makes calls between the players of the game really simple, and also accounts for multiple different players all within the same game. The high-level understanding of socket.io, in my case, is: a player clicks a button, which causes the client to send a call to the server. The server completes a series of steps depending on the button clicked. The server sends a call back to the client with instructions to change the game's interface. The server is run on the express framework, which a popular framework when building apps with Javascript.

I used bootstraps.js for streamlining the design of the app. I wanted to focus on the logic of the card game more than the design.

I used heroku to launch the card game on the browser, so that it's easily accessible to anyone at any time. I'm honestly a big fan of heroku.

I spent way more time than recommended on this game (yike!), but I did enjoy building it. I hope you enjoy playing it!
