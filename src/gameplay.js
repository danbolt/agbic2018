var ControlsSettings = {
  mouseXSensitivity: 0.01,
  keyboardXSensitivity: 0.004
};

const NumberOfCardsInHand = 3;
const ManaPerSecond = 3; // change this later
const MaxMana = 32;

var Gameplay = function () {
  this.mapKey = null;
  this.player = null;
  this.foreground = null;
  this.monsters = null;
  this.items = null;

  this.deck = [];
  this.discard = [];
  this.currentDeckIndex = 0;
  this.activeCardTick = null;
  this.currentCardName = '';

  this.ui = null;
  this.ui_hand = null;
  this.ui_debug_mana_count = null;

  this.mana = 0;
  this.maxMana = MaxMana;
  this.manaTickHandle = null;

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
      newMonster.body.velocity.y = 100;
      newMonster.update = function () {
        this.body.velocity.rotate(0, 0, this.game.time.elapsed * 0.001);
      };

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
  this.currentDeckIndex = 0;
  this.activeCardTick = null;

  this.mana = 0;
  this.maxMana = MaxMana;
  this.manaTickHandle = this.game.time.events.loop(1000 / ManaPerSecond, function () {
    this.mana++;
    this.mana = Math.min(this.mana, this.maxMana);
    this.ui_debug_mana_count.text = 'mana: ' + this.mana;
  }, this);

  this.deck = [
    new BlockCard(this.game, 400, 1, this),
    new StrikeCard(this.game, 253, 250, 1, this),
    new StrikeCard(this.game, 253, 250, 1, this),
    new StrikeCard(this.game, 253, 250, 1, this),
    new ParryCard(this.game, 200, 400, 1, this),
    new ParryCard(this.game, 300, 100, 1, this),
    new ParryCard(this.game, 400, 200, 1, this),
  ];

  this.ui = this.game.add.group();
  this.ui.fixedToCamera = true;
  this.ui_hand = this.game.add.group();
  this.ui.addChild(this.ui_hand);
  this.ui_debug_mana_count = this.game.add.bitmapText(8, 8, 'font', 'mana: 0', 8);
  this.ui.addChild(this.ui_debug_mana_count);

  var dummyCard = new Card(this.game, 'dummy', 'a dummy card', 19, function () { throw "Invalid placeholder card"; }, this);
  for (var i = 0; i < NumberOfCardsInHand; i++) {
    var cardButton = this.game.add.existing(new CardUXElement(this.game, i * 64, this.game.height - 56, dummyCard));
    this.ui_hand.addChild(cardButton);
  }
  this.refreshHand();
  
  let cardCompleteCallback = () => {
    this.player.body.velocity.set(0, 0);
    this.player.movementEnabled = true;
    this.activeCardTick = null;
    this.currentCardName = '';
  };
  this.game.input.gamepad.onDownCallback = (buttonCode) => {
    //
  };
  this.game.input.keyboard.onDownCallback = (key) => {
    if (key.keyCode === Phaser.KeyCode.RIGHT) {
      this.currentDeckIndex = (this.currentDeckIndex + 1) % this.deck.length;
      this.refreshHand();
    } else if (key.keyCode === Phaser.KeyCode.LEFT) {
      this.currentDeckIndex = (this.currentDeckIndex - 1 + this.deck.length) % this.deck.length;
      this.refreshHand();
    } else if (key.keyCode === Phaser.KeyCode.UP) {
      if (this.deck.length > 0) {
        var currentCard = this.deck[this.currentDeckIndex];
        if (currentCard.manaCost <= this.mana) {
          this.deck.splice(this.currentDeckIndex, 1);
          this.currentDeckIndex = ((this.currentDeckIndex - 1 + this.deck.length) % this.deck.length);
          this.refreshHand();


          this.player.body.velocity.set(0, 0);
          this.player.movementEnabled = false;
          currentCard.activate(cardCompleteCallback);
          this.activeCardTick = currentCard.tick;
          this.currentCardName = currentCard.name;
          this.discard.push(currentCard);
          this.mana -= currentCard.manaCost;
          this.ui_debug_mana_count.text = 'mana: ' + this.mana;
        }
      }
    } else if (key.keyCode === Phaser.KeyCode.DOWN) {
      if (this.deck.length === 0) {
        this.currentDeckIndex = 0;
        var swap = this.discard;
        this.discard = this.deck;
        this.deck = swap;
        this.refreshHand();
      }
    }
  };

  populateThreeTestScene(this.game.cache.getTilemapData('level_map').data, this.monsters.children, this.items.children);
};
Gameplay.prototype.update = function() {
  this.game.physics.arcade.collide(this.player, this.foreground);
  this.game.physics.arcade.collide(this.player, this.monsters);
  this.game.physics.arcade.collide(this.monsters, this.foreground);

  if (this.activeCardTick !== null) {
    this.activeCardTick.call(this);
  }

  updateThreeScene(this);
	renderThreeScene(this.player.centerX, this.player.centerY, this.rotationY);
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
  this.currentDeckIndex = 0;
  this.activeCardTick = null;
  this.currentCardName = '';

  this.ui = null;
  this.ui_hand = null;

  this.mana = 0;
  this.maxMana = MaxMana;
  this.game.time.events.remove(this.manaTickHandle);
  this.manaTickHandle = null;
  this.ui_debug_mana_count = null;

  this.rotationY = 0;
};

Gameplay.prototype.refreshHand = function () {
  this.ui_hand.children.forEach(function (child, index) {
    if (index < this.deck.length) {
      child.visible = true;
      var card = this.deck[(this.currentDeckIndex + index) % this.deck.length];
      child.resetCardData(card);
    } else {
      child.visible = false;
    }
  }, this);
};
Gameplay.prototype.isMonsterInFrontOfPlayer = function() {
  var player = this.player;
  var rotation = this.rotationY;
  var monstersInFront = this.monsters.filter(function (monster) {
    // Are we near the monster? (be bold, young one!)
    if (player.position.distance(monster.position) > 32) {
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
