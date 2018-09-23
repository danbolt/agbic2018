  
var Player = function(game, x, y) {
  Phaser.Sprite.call(this, game, x, y, 'test_sheet', 0);

  this.width = 12;
  this.height = 12;
  this.renderable = false;

  this.gameState = null;

  this.game.physics.enable(this, Phaser.Physics.ARCADE);
};
Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
Player.prototype.update = function () {
  this.body.velocity.set(0, 0);

  // Keyboard input
  if (this.game.input.keyboard.isDown(Phaser.KeyCode.W) || (this.game.input.gamepad.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) < 0.0)) {
    this.body.velocity.x += PlayerWalkSpeed * Math.cos(this.data.gameState.rotationY);
    this.body.velocity.y += PlayerWalkSpeed * Math.sin(this.data.gameState.rotationY);
  } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.S) || (this.game.input.gamepad.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_Y) > 0.0)) {
    this.body.velocity.x += -PlayerWalkSpeed * Math.cos(this.data.gameState.rotationY);
    this.body.velocity.y += -PlayerWalkSpeed * Math.sin(this.data.gameState.rotationY);
  }

  if (this.game.input.keyboard.isDown(Phaser.KeyCode.A) || (this.game.input.gamepad.pad1.isDown(Phaser.Gamepad.XBOX360_LEFT_BUMPER))) {
    this.body.velocity.x += PlayerWalkSpeed * Math.cos(this.data.gameState.rotationY - Math.PI * 0.5);
    this.body.velocity.y += PlayerWalkSpeed * Math.sin(this.data.gameState.rotationY - Math.PI * 0.5);
  } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.D) || (this.game.input.gamepad.pad1.isDown(Phaser.Gamepad.XBOX360_RIGHT_BUMPER))) {
    this.body.velocity.x += (PlayerWalkSpeed * Math.cos(this.data.gameState.rotationY + Math.PI * 0.5));
    this.body.velocity.y += PlayerWalkSpeed * Math.sin(this.data.gameState.rotationY + Math.PI * 0.5);
  }

  if (this.body.enable) {
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.E) || (this.game.input.gamepad.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) > 0.0)) {
      this.data.gameState.rotationY += this.game.time.elapsed * ControlsSettings.keyboardXSensitivity;
    } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.Q) || (this.game.input.gamepad.pad1.axis(Phaser.Gamepad.XBOX360_STICK_LEFT_X) < 0.0)) {
      this.data.gameState.rotationY -= this.game.time.elapsed * ControlsSettings.keyboardXSensitivity;
    }
  }
};