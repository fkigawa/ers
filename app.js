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
var count = 0;
var winner = null;

function getGameState() {
  var currentPlayerUsername;
  var players = [];
  var numCards = {};

  for (var id in game.players) {
    numCards[id] = game.players[id].pile.length;
    players.push(game.players[id].username);
  }

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

    try {
      socket.playerId = game.addPlayer(data);
      socket.emit('username', {id: socket.playerId, username: data})
      io.emit('updateGame', getGameState());
    }
    catch(e) {
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
    if (socket.playerId) {
      try {
        var event = game.playCard(socket.playerId);
        if (event.card == 'end game') {
          winner = game.players[event.cardString].username;
          io.emit('updateGame', getGameState());
          return;
        }
        io.emit('playCard', event);
        var event2 = game.checkFace(socket.playerId);
        if (event2.winning == true) {
          winner = game.players[event2.winner].username;
        }
        if (event2.winner) {
          socket.emit('message', `${game.players[event2.winner].username} won the pile!`)
          io.emit('clearDeck');
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
  });

  socket.on('slap', function() {
    if (winner) {
      socket.emit('errorMessage', `${winner} has won the game. Refresh all windows to start a new game.`);
      return;
    }

    if (!game.isEmpty() && socket.playerId) {
      try {
        var event = game.slap(socket.playerId);
        if (event.winning == true) {
          if (event.message == 'tie') {
            throw `It's a tie!`
          }
          winner = game.players[socket.playerId].username;
          io.emit('updateGame', getGameState());
          return;
        }
        if (event.winning == 'take name') {
          winner = event.message;
          io.emit('updateGame', getGameState());
          return;
        }

        if (event.message == 'got the pile!') {
          socket.emit('message', 'You won the pile!')
          io.emit('clearDeck');
        } else {
          if (game.players[socket.playerId].pile.length == 0) {
            game.slappedToEmpty(socket.playerId);
          }
          socket.emit('message', 'You lost 2 cards!')
        }
        io.emit('updateGame', getGameState());
        socket.broadcast.emit('message', `${game.players[socket.playerId].username} ${event.message}`)
      }
      catch(e) {
        socket.emit('errorMessage', 'Wait your turn!');
      }
    }
  });
});

var port = process.env.PORT || 3000;
http.listen(port, function(){
  console.log('Express started. Listening on %s', port);
});
