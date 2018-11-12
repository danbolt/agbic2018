
let monsterWalkSpeed = 30;

var Monster = function (game, x, y, monsterInfo) {
  Phaser.Sprite.call(this, game, x, y, 'test_sheet', 0);

  this.anchor.set(0.5);
  this.width = 16;
  this.height = 16;
  this.renderable = false;
  this.game.physics.enable(this, Phaser.Physics.ARCADE);
  this.body.immovable = true;
  this.body.kinematic = true;
  this.data = monsterInfo;
  this.body.velocity.y = 30;

  this.game.add.existing(this);
};
Monster.prototype = Object.create(Phaser.Sprite.prototype);
Monster.prototype.constructor = Monster;

Monster.prototype.update = function () {
  this.body.velocity.set(monsterWalkSpeed * Math.cos(this.game.time.elapsed * 0.01), monsterWalkSpeed * Math.sin(this.game.time.elapsed * 0.01));
};