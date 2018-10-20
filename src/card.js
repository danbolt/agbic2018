var Card = function (game, name, description, frame, callback, callbackContext, manaCost) {
  this.game = game;

  this.name = name;
  this.description = description;
  this.frame = frame;

  this.callback = callback;
  this.callbackContext = callbackContext;

  this.manaCost = manaCost ? manaCost : 1;
};
Card.prototype.activate = function (onCompleteCallback) {
  this.callback.call(this.callbackContext, onCompleteCallback);
};

var ParryCard = function(game, speed, timeMoving, cost, callbackContext) {
  Card.call(this, game, 'parry', 'Does a parry', 20, function (onComplete) {
    let theta = this.rotationY + (Math.PI);
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.D)) {
      theta -= (Math.PI * 0.5);
    } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.A)) {
      theta += (Math.PI * 0.5);
    }
    this.player.body.velocity.set(speed * Math.cos(theta), speed * Math.sin(theta));

    this.game.time.events.add(timeMoving, function () {
      onComplete();
    }, this);
  }, callbackContext, cost);
};
ParryCard.prototype = Object.create(Card.prototype);

var StrikeCard = function(game, speed, timeMoving, cost, callbackContext) {
  Card.call(this, game, 'strike', 'strike forward', 21, function(onComplete) {
    let theta = this.rotationY;
    this.player.body.velocity.set(speed * Math.cos(theta), speed * Math.sin(theta));

    this.game.time.events.add(timeMoving, function () {
      onComplete();
    }, this);
  }, callbackContext, cost);
};
StrikeCard.prototype = Object.create(Card.prototype);

var CardUXElement = function (game, x, y, cardData) {
  Phaser.Sprite.call(this, game, x, y, 'test_sheet', cardData.frame);

  this.width = 64;
  this.height = 64;

  this.cardNameLabel = this.game.add.bitmapText(0, 0, 'font', cardData.name, 8);
  this.cardNameLabel.scale.x = 1 / this.scale.x;
  this.cardNameLabel.scale.y = 1 / this.scale.y;
  this.addChild(this.cardNameLabel);

  this.cardData = cardData;
};
CardUXElement.prototype = Object.create(Phaser.Sprite.prototype);
CardUXElement.prototype.constructor = CardUXElement;
CardUXElement.prototype.resetCardData = function (newCardData) {
  this.cardData = newCardData;
  this.cardNameLabel.text = this.cardData.name + '\n' + this.cardData.manaCost;
  this.frame = this.cardData.frame;
}