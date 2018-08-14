var ControlsSettings = {
  mouseXSensitivity: 0.01,
  keyboardXSensitivity: 0.001
};

var PlayerWalkSpeed = 50;

var Gameplay = function () {
  this.mapKey = null;
  this.player = null;
  this.foreground = null;
  this.monsters = null;

  this.ui = null;
  this.dialogueUi = null;
  this.dialogueText = null;
  this.dialoguePortrait = null;
  this.dialogueBacking = null;

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
  this.game.input.addMoveCallback(function (pointer, x, y, isClickEvent, domMoveEvent) {
    if (pointer.isDown && this.player.body.enable) {
      var deltaX = domMoveEvent.movementX * ControlsSettings.mouseXSensitivity;

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

  this.setupUI();

  populateThreeTestScene(this.game.cache.getTilemapData('level_map').data, this.monsters.children);
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

  this.ui = null;
  this.dialogueUi = null;
  this.dialogueText = null;
  this.dialoguePortrait = null;
  this.dialogueBacking = null;

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

Gameplay.prototype.showDialogue = function (dialogue) {
  this.player.body.enable = false;
  this.dialogueUi.visible = true;

  var currentDialogueIndex = 0;

  var setupDialogue = function () {
    if (dialogue[currentDialogueIndex].choice) {
      this.dialogueText.text = dialogue[currentDialogueIndex].choice;
    } else {
      this.dialogueText.text = dialogue[currentDialogueIndex].line;
    }
    
    this.dialogueText.children.forEach(function (child) { child.renderable = false; });
  };

  var playDialogue = function (onComplete, onCompleteContext) {
    var textChildrenToShow = 0;
    var tickNextChild = function () {
      this.dialogueText.children[textChildrenToShow].renderable = true;
      textChildrenToShow++;
    };
    var bipTextLoop = this.game.time.events.loop(60, function () {
      tickNextChild.call(this);
      if (textChildrenToShow === this.dialogueText.children.length) {
        this.game.time.events.remove(bipTextLoop);

        if (dialogue[currentDialogueIndex].choice) {
          var t = this.game.add.tween(this.dialogueText);
          t.to( { y: (this.game.height * 0.4) }, 400, Phaser.Easing.Linear.None );
          t.onComplete.add(function () {
            var buttons = [];
            dialogue[currentDialogueIndex].options.forEach(function (option, index) {
              var newButton = this.game.add.button(this.game.width * 0.5, this.game.height * 0.5 + (32 * index), 'test_sheet', function () {
                buttons.forEach(function (button) { button.destroy(); }, this);
              }, this, 16, 17, 28);
              newButton.anchor.set(0.5);
              newButton.width = (this.game.width) - 64;
              newButton.height = 24;
              var text = this.game.add.bitmapText(0, 0, 'font', option.name, 8);
              text.scale.x = 1 / newButton.scale.x;
              text.scale.y = 1 / newButton.scale.y;
              text.align = 'center';
              text.anchor.x = 0.5;
              text.anchor.y = 0.5;
              newButton.addChild(text);
              buttons.push(newButton);
            }, this);
          }, this);
          t.start();
        } else {
          currentDialogueIndex++;
          if (currentDialogueIndex === dialogue.length) {
            this.game.time.events.add(1000, function () {
              onComplete.call(onCompleteContext);
            }, this);
          } else {
            this.game.time.events.add(1000, function () {
              setupDialogue.call(this);
              playDialogue.call(this, onComplete, onCompleteContext);
            }, this);
          }
        }
      }
    }, this);
  };

  setupDialogue.call(this);

  var tAlphaIn = this.game.add.tween(this.dialogueBacking);
  tAlphaIn.to({alpha: 0.4}, 300, Phaser.Easing.Linear.None);
  tAlphaIn.start();

  var tAlphaOut = this.game.add.tween(this.dialogueBacking);
  tAlphaOut.to({alpha: 0}, 300, Phaser.Easing.Linear.None, false, 0);
  tAlphaOut.onComplete.add(function () {
    this.player.body.enable = true;
    this.dialogueUi.visible = false;
  }, this);

  var t1 = this.game.add.tween(this.dialoguePortrait);
  t1.to({y: (this.game.height - this.dialoguePortrait.height - 64 + 10)}, 300, Phaser.Easing.Cubic.In);
  var t2 = this.game.add.tween(this.dialoguePortrait);
  t2.to({y: (this.game.height)}, 500, Phaser.Easing.Cubic.Out, false, 0);
  t1.start();
  t1.onComplete.add(function () {
    playDialogue.call(this, function () {
      t2.start();
      tAlphaOut.start();
    }, this);
  }, this);
};
Gameplay.prototype.setupUI = function () {
  this.ui = this.game.add.group();
  this.ui.fixedToCamera = true;

  // dialogue ui element
  var dialogue = this.game.add.group();
  var backing = this.game.add.sprite(0, 0, 'test_sheet', 2);
  backing.tint = 0x000000;
  backing.width = this.game.width;
  backing.height = this.game.height;
  backing.alpha = 0;
  dialogue.addChild(backing);
  var portrait = this.game.add.sprite(this.game.width * 0.5, this.game.height, 'portraits', 1);
  portrait.anchor.set(0.5, 0);
  portrait.scale.set(1.5);
  dialogue.addChild(portrait);
  var text = this.game.add.bitmapText(this.game.width * 0.5, this.game.height * 0.7, 'font', 'here is some dialogue\non multiple lines\nk?', 8);
  text.align = 'center';
  text.anchor.x = 0.5;
  dialogue.addChild(text);
  dialogue.visible = false;
  this.dialogueText = text;
  this.dialoguePortrait = portrait;
  this.dialogueBacking = backing;
  this.dialogueUi = dialogue;
  this.ui.addChild(dialogue);

  var callbacks = {
    "items": function () {},
    "interact": function () {
      var monsterInFront = this.isMonsterInFrontOfPlayer();
      if (monsterInFront !== null) {
        this.showDialogue(dialogueFor("SampleChoice"));
      } 
    },
    "logbook": function () {}
  };
  var buttons = this.game.add.group();
  this.ui.addChild(buttons);
  ['items', 'interact', 'logbook'].forEach(function (name, index) {
    var newButton = this.game.add.button(index * (this.game.width / 3), this.game.height - 64 + 10, 'test_sheet', callbacks[name], this, 16, 17, 28);
    newButton.width = this.game.width / 3;
    newButton.height = 64;
    buttons.addChild(newButton);

    newButton.onInputOver.add(function () {
      var t = this.game.add.tween(newButton);
      t.to( { y: (this.game.height - 64) }, 200, Phaser.Easing.Cubic.Out );
      t.start();
    }, this);
    newButton.onInputOut.add(function () {
      var t = this.game.add.tween(newButton);
      t.to( { y: (this.game.height - 64 + 10) }, 200, Phaser.Easing.Cubic.In );
      t.start();
    }, this);

    var text = this.game.add.bitmapText(16, 12, 'font', name, 8);
    text.scale.x = 1 / newButton.scale.x;
    text.scale.y = 1 / newButton.scale.y;
    text.align = 'center';
    text.anchor.x = 0.5;
    newButton.addChild(text);
  }, this);
};
