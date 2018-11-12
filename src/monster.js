
const monsterWalkSpeed = 30;
const monsterEntranceRange = 90;
const monsertExitRange = 170;

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
  //this.body.velocity.y = 30;

  // reference to the player
  this.player = this.game.state.getCurrentState().player;
  this.targetingPlayer = false;

  this.game.add.existing(this);
};
Monster.prototype = Object.create(Phaser.Sprite.prototype);
Monster.prototype.constructor = Monster;

Monster.prototype.update = function () {
  if (this.targetingPlayer === false) {
    if (this.position.distance(this.player.position) < monsterEntranceRange) {
      this.targetingPlayer = true;
      return;
    }
  } else if (this.targetingPlayer === true) {
    if (this.position.distance(this.player.position) > monsertExitRange) {
      this.targetingPlayer = false;
      this.body.velocity.set(0, 0);
      return;
    }

    const playerAngle = this.position.angle(this.player.position);
    this.body.velocity.set(Math.cos(playerAngle), Math.sin(playerAngle));
    this.body.velocity.multiply(monsterWalkSpeed, monsterWalkSpeed);
  }
};