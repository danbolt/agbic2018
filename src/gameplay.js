var ControlsSettings = {
  mouseXSensitivity: 0.01,
  keyboardXSensitivity: 0.004
};

const NumberOfCardsInHand = 3;

var Gameplay = function () {
  this.mapKey = null;
  this.player = null;
  this.foreground = null;
  this.monsters = null;
  this.items = null;

  this.deck = [];
  this.discard = [];
  this.hand = [];

  this.ui = null;
  this.ui_hand = null;

  this.rotationY = 0;
};
Gameplay.prototype.init = function (mapKey) {
  this.mapKey = mapKey ? mapKey : 'floor0';
};
Gameplay.prototype.preload = function () {
  this.game.load.tilemap('level_map', 'asset/map/' + this.mapKey + '.json', undefined, Phaser.Tilemap.TILED_JSON);
};
Gameplay.prototype.create = function() {
  this.player = this.game.add.existing(new Player(this.game, 32, 32));
  this.player.data.gameState = this;

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
  };

  this.deck = [];
  this.discard = [];
  this.hand = [];

  this.hand = [
    new Card(this.game, 'strike', 'uhh...', 19, function () { console.log('strike'); }, this),
    new Card(this.game, '5d', 'well...', 19, function () { console.log('five of diamonds'); }, this),
    new Card(this.game, 'parry', 'umm...', 19, function () { console.log('parry'); }, this)
  ];

  this.ui = this.game.add.group();
  this.ui.fixedToCamera = true;
  this.ui_hand = this.game.add.group();
  this.ui.addChild(this.ui_hand);

  var dummyCard = new Card(this.game, 'dummy', 'a dummy card', 19, function () { throw "Do not use this"; }, this);
  for (var i = 0; i < NumberOfCardsInHand; i++) {
    var cardButton = this.game.add.existing(new CardUXElement(this.game, i * 64, this.game.height - 56, dummyCard));
    this.ui_hand.addChild(cardButton);
  }
  this.refreshHandVisual();
  
  var buttonToCardIndex = {
    0: 2,
    2: 1,
    3: 0
  };
  this.game.input.gamepad.onDownCallback = (buttonCode) => {
    if (buttonToCardIndex[buttonCode] !== undefined) {
      this.hand[buttonToCardIndex[buttonCode]].activate();
    }
  };
  var keyToCardIndex = {
    74: 2,
    75: 1,
    76: 0
  };
  this.game.input.keyboard.onDownCallback = (key) => {
    if (keyToCardIndex[key.keyCode] !== undefined) {
      this.hand[keyToCardIndex[key.keyCode]].activate();
    }
  };

  populateThreeTestScene(this.game.cache.getTilemapData('level_map').data, this.monsters.children, this.items.children);
};
Gameplay.prototype.update = function() {
  this.game.physics.arcade.collide(this.player, this.foreground);
  this.game.physics.arcade.collide(this.player, this.monsters);
  this.game.physics.arcade.collide(this.monsters, this.foreground);

	renderThreeScene(this.player.centerX, this.player.centerY, this.rotationY);
};
Gameplay.prototype.refreshHandVisual = function () {
  this.hand.forEach(function (card, index) {
    this.ui_hand.children[index].resetCardData(card, this);
  }, this);
};
Gameplay.prototype.shutdown = function() {
  this.game.cache.removeTilemap('level_map');

  this.mapKey = null;
  this.player = null;
  this.foreground = null;
  this.monsters = null;
  this.items = null;

  this.deck = null;
  this.discard = null;
  this.hand = null;

  this.ui = null;
  this.ui_hand = null;

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
