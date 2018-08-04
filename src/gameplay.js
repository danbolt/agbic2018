var Gameplay = function () {
  //
};
Gameplay.prototype.create = function() {
  var s = this.game.add.sprite(this.game.width * 0.5, this.game.height * 0.5, 'test_sheet', 0);
  s.anchor.set(0.5, 0.6);
  s.scale.set(3);
  s.update = function () { this.rotation -= 0.05; }

  populateThreeTestScene();
};
Gameplay.prototype.update = function() {
	renderThreeScene();
};
Gameplay.prototype.shutdown = function() {
  //
};