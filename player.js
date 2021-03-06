var crypto = require("crypto");

class Player {
  constructor(username) {
    this.username = username;
    this.id = this.generateId();
    this.pile = [];
  }

  generateId() {
    return crypto.randomBytes(10).toString('hex');
  }

  fromObject(object) {
    this.username = object.username;
    this.id = object.id;
    this.pile = object.pile.map(card => {
      var c = new Card();
      c.fromObject(card);
      return c;
    });
  }

  toObject() {
    return {
      username: this.username,
      id: this.id,
      pile: this.pile.map(card => card.toObject())
    };
  }
}

module.exports = Player;
