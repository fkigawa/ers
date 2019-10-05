"use strict";

var path = require('path');
var morgan = require('morgan');
var express = require('express');
var exphbs  = require('express-handlebars');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('underscore');

app.engine('hbs', exphbs({
  extname: 'hbs',
  defaultLayout: 'main'
}));
app.set('view engine', 'hbs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(morgan('tiny'));

app.get('/', function(req, res) {
  res.render('index');
});

var Card = require('./card');
var Player = require('./player');
var Game = require('./game');
var game = new Game();
var count = 0; // Number of active socket connections
var winner = null; // Username of winner

function getGameState() {
  var currentPlayerUsername;
  var players = [];
  var numCards = {};

  // YOUR CODE HERE
  /*
  isStarted: A boolean value indicating if the game has already started
  numCards: an Object with the keys as playerIds and the value as the number of Cards
  currentPlayerUsername: the username of the current player's name. If the game has not started yet, return Game has not started yet as the currentPlayerUsername
  playersInGame: A string with the name of all the players in the game (e.g. Ricky, Moose, Abhi, Darwish)
  cardsInDeck: How many cards are in the current pile
  win: the name of the winner if it exists, otherwise, undefined (see winner)
  */
  for (var id in game.players) {
    numCards[id] = game.players[id].pile.length;
    players.push(game.players[id].username);
  }

  // return an object with 6 different properties
  return {
    isStarted: game.isStarted,
    numCards: numCards,
    currentPlayerUsername: game.players[game.playerOrder[0]].username,
    playersInGame: players.join(),
    cardsInDeck: game.pile.length,
    win: winner
  }
}

io.on('connection', function(socket) {

  if (game.isStarted) {
    // whenever a player joins an already started game, he or she becomes
    // an observer automatically
    socket.emit('observeOnly');
  }
  count++;
  socket.on('disconnect', function () {
    count--;
    if (count === 0) {
      game = new Game();
      winner = null;
    }
  });

  socket.on('username', function(data) {
    if (winner) {
      socket.emit('errorMessage', `${winner} has won the game. Refresh all windows to start a new game.`);
      return;
    }
    // YOUR CODE HERE
    try {
      socket.playerId = game.addPlayer(data);
      socket.emit('username', {id: socket.playerId, username: data})
      io.emit('updateGame', getGameState());
    }
    catch(e) {
      console.log('at username error', e.message)
      if (e.message == 'NotStarted is not defined') {
        socket.emit('errorMessage', `Game hasn't started yet!`);
      } else if (e.message == 'NotValid is not defined') {
        socket.emit('errorMessage', `This name isn't valid :/`);
      } else if (e.message == 'NoInput is not defined') {
      } else if (e.message == 'AlreadyChosen is not defined') {
        socket.emit('errorMessage', 'This name has already been chosen. Choose another!');
      }


    }

  });

  socket.on('start', function() {
    if (winner) {
      socket.emit('errorMessage', `${winner} has won the game. Refresh all windows to start a new game.`);
      return;
    }
    // YOUR CODE HERE
    if (socket.playerId) {
      try {
        game.startGame();
        io.emit('start');
        io.emit('updateGame', getGameState());

      }
      catch (e) {
        socket.emit('errorMessage', 'You need more players to start!');
      }
    } else {
      socket.emit('errorMessage', 'You are not a player of the game!')
    }
  });

  socket.on('playCard', function() {
    if (winner) {
      socket.emit('errorMessage', `${winner} has won the game. Refresh all windows to start a new game.`);
      return;
    }
    // YOUR CODE HERE
    if (socket.playerId) {
      try {
        console.log('in app playCard')
        var event = game.playCard(socket.playerId);
        io.emit('playCard', event);
        console.log('after emit playCard')
        var event2 = game.checkFace(socket.playerId);
        console.log('after checkface', event2);
        if (event2.winning == true) {
          winner = game.players[event2.winner].username;
        }
        if (event2.winner) {
          console.log('here before clearDeck')
          socket.emit('message', `${game.players[event2.winner].username} won the pile!`)
          io.emit('clearDeck');
          // io.emit('updateGame', getGameState());
          console.log('right after clearDeck')
          socket.broadcast.emit('message', `${game.players[event2.winner].username} won the pile!`)
        }
        io.emit('updateGame', getGameState());

      }
      catch(e) {
        socket.emit('errorMessage', 'Wait your turn!');
      }
    } else {
      socket.emit('errorMessage', 'You are not the player of the game!')
    }

    // YOUR CODE ENDS HERE
    // broadcast to everyone the game state

  });

  socket.on('slap', function() {
    if (winner) {
      socket.emit('errorMessage', `${winner} has won the game. Refresh all windows to start a new game.`);
      return;
    }
    // YOUR CODE HERE
    // var count = 0;
    // for (var number in this.numCards) {
    //   count++;
    // }
    // console.log(this.numCards, count)

    if (!game.isEmpty() && socket.playerId) {
      try {
        var event = game.slap(socket.playerId);
        if (event.winning == true) {
          winner = game.players[socket.playerId].username;
        }

        if (event.message == 'got the pile!') {
          socket.emit('message', 'You won the pile!')
          io.emit('clearDeck');
        } else {
          socket.emit('message', 'You lost 2 cards!')
        }

        if (game.players[socket.playerId].pile.length == 0) {
          var count = [0, null];
          for (let i = 0; i < game.playerOrder.length; i++) {
            if (game.players[game.playerOrder[i]].pile.length == 0) {
              count[0]++;
            } else {
              count[1] = game.players[game.playerOrder[i]].username;
            }
          }

          if (count[0] == 1) {
            winner = count[1]
          } else {
            game.nextPlayer();
          }
        }

        io.emit('updateGame', getGameState());
        socket.broadcast.emit('message', `${game.players[socket.playerId].username} ${event.message}`)

      }
      catch(e) {
        socket.emit('errorMessage', 'Wait your turn!');
      }
    }
    // else {
    //   socket.emit('errorMessage', '')
    // }
  });

});

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log('Express started. Listening on %s', port);
});
