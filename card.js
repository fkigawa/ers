class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }

  toString() {
    var rValue = this.value
    if (rValue == 1) {
      rValue = 'Ace';
    } else if (rValue == 11) {
      rValue = 'Jack';
    } else if (rValue == 12) {
      rValue = 'Queen';
    } else if (rValue == 13) {
      rValue = 'King';
    }

    var rSuit = this.suit;
    if (rSuit == 'spades') {
      rSuit = 'Spades';
    } else if (rSuit == 'hearts') {
      rSuit = 'Hearts'
    } else if (rSuit == 'diamonds') {
      rSuit = 'Diamonds'
    } else if (rSuit == 'clubs') {
      rSuit = 'Clubs'
    }

    return rValue + ' of ' + rSuit;
  }

  fromObject(object) {
    this.value = object.value;
    this.suit = object.suit;
  }

  toObject() {
    return {
      value: this.value,
      suit: this.suit
    };
  }
}

module.exports = Card;
