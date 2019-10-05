var _ = require('underscore');
var Card = require('./card');
var Player = require('./player');

class Game {
  constructor() {
    this.isStarted = false;
    this.players = {};
    this.playerOrder = [];
    this.pile = [];
    this.faceSuccession = false;
    this.fsPlayer = null;
  }

  addPlayer(username) {
    if (this.isStarted || username.trim().length == 0 || this.players[username]) {
      throw 'error';
    }

    for (var id in this.players) {
      if (this.players[id].username == username) {
        throw 'error'
      }
    }

    var newPlayer = new Player(username);
    this.playerOrder.push(newPlayer.id);
    this.players[newPlayer.id] = newPlayer;

    return newPlayer.id;
  }

  startGame() {
    if (this.isStarted || Object.keys(this.players).length < 2) {
      throw 'error';
    }

    this.isStarted = true;


    for (let i = 1; i <= 13; i++) {
      for (let j = 1; j <= 4; j++) {
        var suit = null;
        if (j == 1) {
          suit = 'spades';
        } else if (j == 2) {
          suit = 'hearts';
        } else if (j == 3) {
          suit = 'diamonds';
        } else if (j == 4) {
          suit = 'clubs';
        }

        var card = new Card(suit, i);
        this.pile.push(card);
      }
    }

    this.pile = _.shuffle(this.pile)

    var cardsForEach = Math.floor(52/Object.keys(this.players).length)
    for (var id in this.players) {
      for (let j = 1; j <= cardsForEach; j++) {
        this.players[id].pile.push(this.pile.pop());
      }
    }

    for (var id in this.players) {
      if (this.pile.length > 0) {
        this.players[id].pile.push(this.pile.pop());
      } else {
        break;
      }
    }

  }

  nextPlayer() {
    if (!this.isStarted) {
      throw 'error';
    }

    var shifted = this.playerOrder.shift();
    this.playerOrder.push(shifted);

    while (this.players[this.playerOrder[0]].pile.length == 0) {
      var shifted = this.playerOrder.shift();
      this.playerOrder.push(shifted);
    }

  }

  isWinning(playerId) {
    if (!this.isStarted) {
      throw 'error';
    }

    if (this.players[playerId].pile.length == 52) {
      this.isStarted = false;
      return true;
    }

    return false;
  }

  /*
  Change playCard rules.
  If someone plays a face/ace card, set face succession boolean variable to true
  if fs is true, check to see what the new card is. if it is a face card, continue.
  If not, clear deck (using same logic as slap)
  */
  checkFace(playerId) {

    if (this.faceSuccession) {

      if (
        this.pile[this.pile.length-1].value == 11 ||
        this.pile[this.pile.length-1].value == 12 ||
        this.pile[this.pile.length-1].value == 13 ||
        this.pile[this.pile.length-1].value == 1
      ) {
        this.fsPlayer = playerId;
      } else {
        this.clearDeck(this.fsPlayer);
        this.faceSuccession = false;
        return {
          winning: this.isWinning(this.fsPlayer),
          message: 'got the pile!',
          winner: this.fsPlayer
        }
      }
    } else if (!this.faceSuccession && (
      this.pile[this.pile.length-1].value == 11 ||
      this.pile[this.pile.length-1].value == 12 ||
      this.pile[this.pile.length-1].value == 13 ||
      this.pile[this.pile.length-1].value == 1
    )) {
      this.faceSuccession = true;
      this.fsPlayer = playerId;
    }

    return {
      winning: false,
      message: 'pile grows'
    }
  }

  playCard(playerId) {
    if (!this.isStarted || this.playerOrder[0] != playerId || this.players[playerId].pile.length == 0) {
      throw 'error';
    }

    this.pile.push(this.players[playerId].pile.pop());

    var nocards = 0;
    for (var id in this.players) {
      if (this.players[id].pile.length == 0) {
        nocards++;
      }
    }
    if (nocards == this.playerOrder.length) {
      this.isStarted = false;
      throw `It's a tie!`
    }

    this.nextPlayer();

    return {
      card: this.pile[this.pile.length-1],
      cardString: this.pile[this.pile.length-1].toString()
    }
  }

  //check wrapover
  slap(playerId) {
    if (!this.isStarted) {
      throw 'error';
    }

    if (
      (this.pile.length > 1 && this.pile[this.pile.length-1].value == this.pile[this.pile.length-2].value) ||
      (this.pile.length > 2 && this.pile[this.pile.length-1].value == this.pile[this.pile.length-3].value) ||
      (this.pile.length > 1 && this.pile[0].value == this.pile[this.pile.length-1].value) ||
      (this.pile.length > 1 && (this.pile[this.pile.length-1].value + this.pile[this.pile.length-2].value) == 10) ||
      (this.pile.length > 2 && (this.pile[this.pile.length-1].value + this.pile[this.pile.length-3].value) == 10) ||
      (this.pile.length > 3 &&
        (
          (
          this.pile[this.pile.length-1].value ==
          this.pile[this.pile.length-2].value-1 ==
          this.pile[this.pile.length-3].value-2 ==
          this.pile[this.pile.length-4].value-3
          )
          ||
          (
          this.pile[this.pile.length-1].value ==
          this.pile[this.pile.length-2].value+1 ==
          this.pile[this.pile.length-3].value+2 ==
          this.pile[this.pile.length-4].value+3
          )
        )
      ) ||
      (this.pile.length > 1 && (
          (this.pile[this.pile.length-1].value == 12 && this.pile[this.pile.length-2].value == 13) ||
          (this.pile[this.pile.length-1].value == 13 && this.pile[this.pile.length-2].value == 12)
        )
      )
    )
    {

      this.clearDeck(playerId);

      return {
        winning: this.isWinning(playerId),
        message: 'got the pile!'
      }
    }

    for (let i = 0; i < Math.min(2, this.players[playerId].pile.length); i++) {
      this.pile.unshift(this.players[playerId].pile.pop());
    }

    return {
      winning: false,
      message: 'lost 2 cards!'
    }
  }

  clearDeck(playerId) {
    this.players[playerId].pile = [...this.pile, ...this.players[playerId].pile];
    this.pile = [];
  }

  fromObject(object) {
    this.isStarted = object.isStarted;

    this.players = _.mapObject(object.players, player => {
      var p = new Player();
      p.fromObject(player);
      return p;
    });

    this.playerOrder = object.playerOrder;

    this.pile = object.pile.map(card => {
      var c = new Card();
      c.fromObject(card);
      return c;
    });
  }

  toObject() {
    return {
      isStarted: this.isStarted,
      players: _.mapObject(this.players, val => val.toObject()),
      playerOrder: this.playerOrder,
      pile: this.pile.map(card => card.toObject())
    };
  }

  fromJSON(jsonString) {
    this.fromObject(JSON.parse(jsonString));
  }

  toJSON() {
    return JSON.stringify(this.toObject());
  }
}

module.exports = Game;
