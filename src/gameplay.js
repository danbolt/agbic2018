var ControlsSettings = {
  xSensitivity: 0.01,
  ySensitivity: 1
}

var PlayerWalkSpeed = 50;

var Gameplay = function () {
  this.mapKey = null;
  this.player = null;
  this.foreground = null;

  this.rotationY = 0;
};
Gameplay.prototype.init = function (mapKey) {
  this.mapKey = mapKey ? mapKey : 'floor0';
};
Gameplay.prototype.preload = function () {
  this.game.load.tilemap('level_map', 'asset/map/' + this.mapKey + '.json', undefined, Phaser.Tilemap.TILED_JSON);
};
Gameplay.prototype.create = function() {
  this.player = this.game.add.sprite(32, 32, 'test_sheet', 0);
  this.player.data.gameState = this;
  this.player.renderable = false;
  this.player.update = function () {
    if (this.game.input.keyboard.isDown(Phaser.KeyCode.W)) {
      this.body.velocity.set(PlayerWalkSpeed * Math.cos(this.data.gameState.rotationY), PlayerWalkSpeed * Math.sin(this.data.gameState.rotationY));
    } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.S)) {
      this.body.velocity.set(-PlayerWalkSpeed * Math.cos(this.data.gameState.rotationY), -PlayerWalkSpeed * Math.sin(this.data.gameState.rotationY));
    } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.A)) {
      this.body.velocity.set(PlayerWalkSpeed * Math.cos(this.data.gameState.rotationY - Math.PI * 0.5), PlayerWalkSpeed * Math.sin(this.data.gameState.rotationY - Math.PI * 0.5));
    } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.D)) {
      this.body.velocity.set(PlayerWalkSpeed * Math.cos(this.data.gameState.rotationY + Math.PI * 0.5), PlayerWalkSpeed * Math.sin(this.data.gameState.rotationY + Math.PI * 0.5));
    } else {
      this.body.velocity.set(0, 0);
    }
  };
  this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

  this.rotationY = 0;
  this.game.input.addMoveCallback(function (pointer, x, y, isClickEvent, domMoveEvent) {
    if (pointer.isDown) {
      var deltaX = domMoveEvent.movementX * ControlsSettings.xSensitivity;

      this.rotationY += deltaX;
    }
  }, this);

  var map = this.game.add.tilemap('level_map');
  map.addTilesetImage('test', 'test_sheet_tile');
  this.foreground = map.createLayer('walls');
  this.foreground.resizeWorld();
  this.foreground.renderable = false;
  map.setCollisionByExclusion([0], true, this.foreground);
  this.game.physics.enable(this.foreground, Phaser.Physics.ARCADE);

  populateThreeTestScene(this.game.cache.getTilemapData('level_map').data);
};
Gameplay.prototype.update = function() {
  this.game.physics.arcade.collide(this.player, this.foreground);

	renderThreeScene(this.player.centerX, this.player.centerY, this.rotationY);
};
Gameplay.prototype.shutdown = function() {
  this.game.cache.removeTilemap('level_map');

  this.mapKey = null;
  this.player = null;
  this.foreground = null;

  this.rotationY = 0;
};