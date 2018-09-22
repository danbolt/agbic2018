var ControlsSettings = {
  mouseXSensitivity: 0.01,
  keyboardXSensitivity: 0.004
};

var PlayerWalkSpeed = 50;

var Gameplay = function () {
  this.mapKey = null;
  this.player = null;
  this.foreground = null;
  this.monsters = null;
  this.items = null;

  this.ui = null;

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
  this.player.width = 12;
  this.player.height = 12;
  this.player.renderable = false;
  this.player.update = function () {
    // Keyboard input
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

    if (this.body.enable) {
      if (this.game.input.keyboard.isDown(Phaser.KeyCode.E)) {
        this.data.gameState.rotationY += this.game.time.elapsed * ControlsSettings.keyboardXSensitivity;
      } else if (this.game.input.keyboard.isDown(Phaser.KeyCode.Q)) {
        this.data.gameState.rotationY -= this.game.time.elapsed * ControlsSettings.keyboardXSensitivity;
      }
    }
  };
  this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

  this.rotationY = 0;

  var map = this.game.add.tilemap('level_map');
  map.addTilesetImage('test', 'test_sheet_tile');
  this.foreground = map.createLayer('walls');
  this.foreground.resizeWorld();
  this.foreground.renderable = false;
  map.setCollisionByExclusion([0], true, this.foreground);
  this.game.physics.enable(this.foreground, Phaser.Physics.ARCADE);

  this.monsters = this.game.add.group();
  if (map.objects.monsters) {
    map.objects.monsters.forEach(function (monster) {
      var newMonster = this.game.add.sprite(monster.x, monster.y, 'test_sheet', 0);
      newMonster.anchor.set(0.5, 0.5);
      newMonster.tint = 0xff0000;
      newMonster.width = 16;
      newMonster.height = 16;
      newMonster.renderable = false;
      this.game.physics.enable(newMonster, Phaser.Physics.ARCADE);
      newMonster.body.immovable = true;
      newMonster.body.kinematic = true;
      newMonster.data = monster;

      this.monsters.addChild(newMonster);
      this.monsters.addToHash(newMonster);
    }, this);
  }

  this.items = this.game.add.group();
  if (map.objects.items) {
    map.objects.items.forEach(function (item) {
      var newItem = this.game.add.sprite(item.x, item.y, 'test_sheet', 0);
      newItem.anchor.set(0.5, 0.5);
      newItem.tint = 0xff0000;
      newItem.width = 16;
      newItem.height = 16;
      newItem.renderable = false;
      newItem.data = item;

      this.items.addChild(newItem);
    }, this);
  }

  populateThreeTestScene(this.game.cache.getTilemapData('level_map').data, this.monsters.children, this.items.children);
};
Gameplay.prototype.update = function() {
  this.game.physics.arcade.collide(this.player, this.foreground);

  this.game.physics.arcade.collide(this.player, this.monsters);

	renderThreeScene(this.player.centerX, this.player.centerY, this.rotationY);
};
Gameplay.prototype.shutdown = function() {
  this.game.cache.removeTilemap('level_map');

  this.mapKey = null;
  this.player = null;
  this.foreground = null;
  this.monsters = null;
  this.items = null;

  this.ui = null;

  this.rotationY = 0;
};

Gameplay.prototype.isMonsterInFrontOfPlayer = function() {
  var player = this.player;
  var rotation = this.rotationY;
  var monstersInFront = this.monsters.filter(function (monster) {
    // Are we near the monster? (be bold, young one!)
    if (player.position.distance(monster.position) > 50) {
      return false;
    }

    // Are we looking in the monster's direction? (eye contact is important!)
    var angleToMonster = Phaser.Math.normalizeAngle(Phaser.Point.angle(monster.position, player.position));
    var playerAngle = Phaser.Math.normalizeAngle(rotation);
    if (Phaser.Math.getShortestAngle(angleToMonster - Math.PI, playerAngle - Math.PI) > (Math.PI * 0.15)) {
      return false;
    }

    return true;
  });

  return monstersInFront.first;
};
Gameplay.prototype.isItemInFrontOfPlayer = function() {
  var player = this.player;
  var rotation = this.rotationY;
  var itemsInFront = this.items.filter(function (item) {
    if (player.position.distance(item.position) > 50) {
      return false;
    }

    var angleToMonster = Phaser.Math.normalizeAngle(Phaser.Point.angle(item.position, player.position));
    var playerAngle = Phaser.Math.normalizeAngle(rotation);
    if (Phaser.Math.getShortestAngle(angleToMonster - Math.PI, playerAngle - Math.PI) > (Math.PI * 0.15)) {
      return false;
    }

    return true;
  });

  return itemsInFront.first;
};
