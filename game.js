var _ = require('underscore');
var Card = require('./card');
var Player = require('./player');

class Game {
  constructor() {
    this.isStarted = false;
    this.players = {};
    this.playerOrder = [];
    this.pile = [];
    this.bottomcard = null;
    this.burnedcards = 0;
    this.changePlayer = false;
    this.fsPlayer = null;
    this.war = 0;
    this.strikes = {};
  }

  addPlayer(username) {
    if (this.isStarted) {
      throw NotStarted;
    } else if (username.trim().length == 0) {
      throw NotValid;
    } else if (username == null) {
      throw NoInput;
    }

    for (var id in this.players) {
      if (this.players[id].username == username) {
        throw AlreadyChosen
      }
    }

    var newPlayer = new Player(username);
    this.playerOrder.push(newPlayer.id);
    this.players[newPlayer.id] = newPlayer;

    return newPlayer.id;
  }

  startGame() {
    if (this.isStarted) {
      throw `There's already a game going on!`;
    } else if (Object.keys(this.players).length < 2) {
      throw `You don't have enough players yet!`
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

  slappedToEmpty(slapper) {
    console.log(this.playerOrder, slapper, this.playerOrder[0] == slapper);
    if (this.playerOrder[0] == slapper) {
      console.log(this.playerOrder, slapper);
      console.log('before switching players');
      this.nextPlayer();
      return true;
    }
    return false;
  }

  nextPlayer() {
    if (!this.isStarted) {
      throw `Woah, hold on there! The game hasn't started yet!`;
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
      throw `Woah, hold on there! The game hasn't started yet!`;
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

  setWar(card) {
    // this.fsPlayer = playerId;
    if (card == 11) {
      this.war = 1;
    } else if (card == 12) {
      this.war = 2;
    } else if (card == 13) {
      this.war = 3;
    } else if (card == 1) {
      this.war = 4;
    }
  }

  checkFace(playerId) {
    if (this.war > 0) {
      if (this.war == 1) {
        if (!(
          this.pile[this.pile.length-1].value == 11 ||
          this.pile[this.pile.length-1].value == 12 ||
          this.pile[this.pile.length-1].value == 13 ||
          this.pile[this.pile.length-1].value == 1
        )) {
          this.clearDeck(this.fsPlayer);
          this.war = 0;
          this.nextPlayer();
          return {
            winning: this.isWinning(this.fsPlayer),
            message: 'got the pile!',
            winner: this.fsPlayer
          }
        } else {
          this.fsPlayer = playerId;
          this.nextPlayer();
          this.setWar(this.pile[this.pile.length-1].value);
        }
      } else {
        if (!(
          this.pile[this.pile.length-1].value == 11 ||
          this.pile[this.pile.length-1].value == 12 ||
          this.pile[this.pile.length-1].value == 13 ||
          this.pile[this.pile.length-1].value == 1
        )) {
          this.war -= 1;
        } else {
          this.fsPlayer = playerId;
          this.nextPlayer();
          this.setWar(this.pile[this.pile.length-1].value);
        }
      }
    } else {
      if (!(
        this.pile[this.pile.length-1].value == 11 ||
        this.pile[this.pile.length-1].value == 12 ||
        this.pile[this.pile.length-1].value == 13 ||
        this.pile[this.pile.length-1].value == 1
      )) {
        this.nextPlayer();
      } else {
        this.fsPlayer = playerId;
        this.nextPlayer();
        this.setWar(this.pile[this.pile.length-1].value);
      }
    }

    // if (this.changePlayer) {
    //
    //   if (
    //     this.pile[this.pile.length-1].value == 11 ||
    //     this.pile[this.pile.length-1].value == 12 ||
    //     this.pile[this.pile.length-1].value == 13 ||
    //     this.pile[this.pile.length-1].value == 1
    //   ) {
    //     this.fsPlayer = playerId;
    //   } else {
    //     this.clearDeck(this.fsPlayer);
    //     this.changePlayer = false;
    //     return {
    //       winning: this.isWinning(this.fsPlayer),
    //       message: 'got the pile!',
    //       winner: this.fsPlayer
    //     }
    //   }
    // } else {
    //   this.changePlayer = true;
    //   this.fsPlayer = playerId;
    //   if (this.pile[this.pile.length-1].value == 11) {
    //     this.war = 1;
    //   } else if (this.pile[this.pile.length-1].value == 12) {
    //     this.war = 2;
    //   } else if (this.pile[this.pile.length-1].value == 13) {
    //     this.war = 3;
    //   } else if (this.pile[this.pile.length-1].value == 1) {
    //     this.war = 4;
    //   }
    // }

    return {
      winning: false,
      message: 'pile grows'
    }
  }

  playCard(playerId) {
    if (!this.isStarted) {
      throw `Woah, hold on there! The game hasn't started yet!`;
    } else if (this.playerOrder[0] != playerId) {
      throw 'error'
    } else if (this.players[playerId].pile.length == 0) {
      throw `You've got no more cards!`;
    }

    if (this.bottomcard == null) {
      this.bottomcard = this.players[playerId].pile.pop();
      this.pile.push(this.bottomcard);
    } else {
      this.pile.push(this.players[playerId].pile.pop());
    }

    if (this.players[playerId].pile.length == 0) {
      this.nextPlayer();
    }

    var nocards = 0;
    for (var id in this.players) {
      if (this.players[id].pile.length == 0) {
        nocards++;
      }
    }
    if (nocards == this.playerOrder.length) {
      this.isStarted = false;
      throw `It's a tie!`
    } else if (nocards == this.playerOrder.length-1) {
      return {
        card: 'end game',
        cardString: this.fsPlayer
      }
    }

    return {
      card: this.pile[this.pile.length-1],
      cardString: this.pile[this.pile.length-1].toString()
    }
  }

  findLastStanding() {
    for (var id in this.players) {
      if (this.players[id].pile.length != 0) {
        return this.players[id].username
      }
    }
  }
  //check wrapover
  slap(playerId) {
    if (!this.isStarted) {
      console.log('game isnt started')
      throw `Woah, hold on there! The game hasn't started yet!`;
    }
    console.log('these are the cards:', this.pile)
    console.log('1', (this.pile.length - this.burnedcards) > 1 && this.pile[this.pile.length-1].value == this.pile[this.pile.length-2].value);
    console.log('2', (this.pile.length - this.burnedcards) > 2 && this.pile[this.pile.length-1].value == this.pile[this.pile.length-3].value);
    console.log('3', (this.pile.length - this.burnedcards) > 1 && this.bottomcard != this.pile[this.pile.length-1] && this.bottomcard.value == this.pile[this.pile.length-1].value);
    console.log('4', (this.pile.length - this.burnedcards) > 1 && (this.pile[this.pile.length-1].value + this.pile[this.pile.length-2].value) == 10)
    console.log('5', (this.pile.length - this.burnedcards) > 2 && (this.pile[this.pile.length-1].value + this.pile[this.pile.length-3].value) == 10)
    console.log('6', ((this.pile.length - this.burnedcards) > 3 &&
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
    ));
    console.log('7', ((this.pile.length - this.burnedcards) > 1 && (
        (this.pile[this.pile.length-1].value == 12 && this.pile[this.pile.length-2].value == 13) ||
        (this.pile[this.pile.length-1].value == 13 && this.pile[this.pile.length-2].value == 12)
      )
    ));


    if (
      ((this.pile.length - this.burnedcards) > 1 && this.pile[this.pile.length-1].value == this.pile[this.pile.length-2].value) ||
      ((this.pile.length - this.burnedcards) > 2 && this.pile[this.pile.length-1].value == this.pile[this.pile.length-3].value) ||
      ((this.pile.length - this.burnedcards) > 1 && this.bottomcard != this.pile[this.pile.length-1] && this.bottomcard.value == this.pile[this.pile.length-1].value) ||
      ((this.pile.length - this.burnedcards) > 1 && (this.pile[this.pile.length-1].value + this.pile[this.pile.length-2].value) == 10) ||
      ((this.pile.length - this.burnedcards) > 2 && (this.pile[this.pile.length-1].value + this.pile[this.pile.length-3].value) == 10) ||
      ((this.pile.length - this.burnedcards) > 3 &&
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
      ((this.pile.length - this.burnedcards) > 1 && (
          (this.pile[this.pile.length-1].value == 12 && this.pile[this.pile.length-2].value == 13) ||
          (this.pile[this.pile.length-1].value == 13 && this.pile[this.pile.length-2].value == 12)
        )
      )
    )
    {
      console.log('slap worked');
      this.clearDeck(playerId);
      this.war = 0;

      //check to see if all other players have 0 cards--then return statement with the player that has more than 0

      return {
        winning: this.isWinning(playerId),
        message: 'got the pile!'
      }
    }

    for (let i = 0; i < Math.min(2, this.players[playerId].pile.length); i++) {
      this.pile.unshift(this.players[playerId].pile.pop());
      this.burnedcards += 2;
    }

    var nocards = 0;
    for (var id in this.players) {
      if (this.players[id].pile.length == 0) {
        nocards++;
      }
    }
    if (nocards == this.playerOrder.length) {
      return {
        winning: true,
        message: 'tie'
      }
    } else if (nocards == this.playerOrder.length-1) {
      var laststanding = this.findLastStanding();
      return {
        winning: 'take name',
        message: laststanding
      }
    }

    return {
      winning: false,
      message: 'lost 2 cards!'
    }
  }

  clearDeck(playerId) {
    this.players[playerId].pile = [...this.pile, ...this.players[playerId].pile];
    this.pile = [];
    this.burnedcards = 0;
    this.bottomcard = null;
  }

  isEmpty() {
    if (this.pile.length == 0) {
      return true;
    }
    return false;
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
