var ControlsSettings = {
  xSensitivity: 0.01,
  ySensitivity: 1
}

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
  var s = this.game.add.sprite(this.game.width * 0.5, this.game.height * 0.5, 'test_sheet', 0);
  s.anchor.set(0.5, 0.6);
  s.scale.set(1);
  s.update = function () { this.rotation -= 0.05; };

  this.rotationY = 0;
  this.game.input.addMoveCallback(function (pointer, x, y, isClickEvent, domMoveEvent) {
    if (pointer.isDown) {
      var deltaX = domMoveEvent.movementX * ControlsSettings.xSensitivity;

      this.rotationY += deltaX;
    }
  }, this);

  populateThreeTestScene(this.game.cache.getTilemapData('level_map').data);
};
Gameplay.prototype.update = function() {

	renderThreeScene(this.rotationY);
};
Gameplay.prototype.shutdown = function() {
  this.game.cache.removeTilemap('level_map');

  this.mapKey = null;
  this.player = null;
  this.foreground = null;

  this.rotationY = 0;
};