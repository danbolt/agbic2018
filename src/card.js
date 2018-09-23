var Card = function (game, name, description, frame, callback, callbackContext) {
  this.game = game;

  this.name = name;
  this.description = description;
  this.frame = frame;

  this.callback = callback;
  this.callbackContext = callbackContext;
};
Card.prototype.activate = function () {
  this.callback.call(callbackContext);
};

var CardUXElement = function (game, x, y, cardData) {
  Phaser.Button.call(this, game, x, y, 'test_sheet', cardData.callback, cardData.callbackContext, 16, 17, 18, 17);

  this.width = 64;
  this.height = 64;

  this.cardNameLabel = this.game.add.bitmapText(0, 0, 'font', cardData.name, 8);
  this.cardNameLabel.scale.x = 1 / this.scale.x;
  this.cardNameLabel.scale.y = 1 / this.scale.y;
  this.addChild(this.cardNameLabel);

  this.cardData = cardData;
};
CardUXElement.prototype = Object.create(Phaser.Button.prototype);
CardUXElement.prototype.constructor = CardUXElement;
CardUXElement.prototype.resetCardData = function (newCardData) {
  this.onInputUp.remove(this.cardData.callback);

  this.cardData = newCardData;
  this.cardNameLabel.text = this.cardData.name;
  this.onInputUp.add(newCardData.callback, newCardData.callbackContext);
}