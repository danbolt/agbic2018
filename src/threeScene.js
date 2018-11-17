var initalizeThreeJS = undefined;
var loadThreeJSAssets = undefined;
var populateThreeTestScene = undefined;
var updateThreeScene = undefined;
var updateThreeCamera = undefined;
var renderThreeScene = undefined;

var threeCanvas = undefined;
var threeImagesLoaded = false;
var threeModelsLoaded = false;

(function () {
	var scene = undefined;
	var camera = undefined;
	var renderer = undefined;

  var ingameMonsters = [];
  var bladeModel = null;

  var imagesToLoad = [
    'test'
  ];
	var imagesMap = {};

  var modelsToLoad = [
    'squirtle',
    'test_blade'
  ];
  var modelsMap = {};

	initalizeThreeJS = function (phaserWebGLContext) {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera( 75, phaserWebGLContext.drawingBufferWidth / phaserWebGLContext.drawingBufferHeight, 0.1, 600 );

		renderer = new THREE.WebGLRenderer();
		renderer.setSize(phaserWebGLContext.drawingBufferWidth, phaserWebGLContext.drawingBufferHeight );
		document.body.appendChild( renderer.domElement );
		renderer.domElement.style["z-index"] = -1;
		threeCanvas = renderer.domElement;
	};

	loadThreeJSAssets = function () {
		var imagesFinishedLoading = 0;
		var tl = new THREE.TextureLoader();
		imagesToLoad.forEach(function (imageName) {
			tl.load('asset/image/' + imageName + '.png', function (loadedTexture) {
				imagesMap[imageName] = loadedTexture;

				imagesFinishedLoading++;
				if (imagesFinishedLoading === imagesToLoad.length) {
					threeImagesLoaded = true;
					console.log('done loading three images!');
				}
			});
		}, this);

    var modelsFinishedLoading = 0;
    var ml = new THREE.GLTFLoader();
    modelsToLoad.forEach(function (modelName) {
      ml.load('asset/model/gltf/' + modelName + '.gltf', function (gltf) {
        gltf.scene.traverse(function (child) {
          if (child.name === 'model') {
            child.children.forEach(function (subchild) {
            }, this);
            modelsMap[modelName] = child;
          }
        }, function (error) {
          console.log(error);
        });
        modelsFinishedLoading++;
        if (modelsFinishedLoading === modelsToLoad.length) {
          threeModelsLoaded = true;
          console.log('done loading three models!');
        }
      });
    }, this);
	};

	populateThreeTestScene = function (tilemapData, monsters, items) {
		var wallsTexture = imagesMap['test'].clone();
    wallsTexture.needsUpdate = true;
    wallsTexture.magFilter = THREE.NearestFilter;
    wallsTexture.minFilter = THREE.NearestFilter;
    wallsTexture.wrapS = THREE.RepeatWrapping;
    wallsTexture.wrapT = THREE.RepeatWrapping;
    wallsTexture.repeat.set(32 / wallsTexture.image.width, 32 / wallsTexture.image.height);
    wallsTexture.offset.x = 0;
    wallsTexture.offset.y = 0.5;

    var ceilingTexture = wallsTexture.clone();
    ceilingTexture.needsUpdate = true;
    ceilingTexture.repeat.set(32 / wallsTexture.image.width, 32 / wallsTexture.image.height);

    var monsterTexture = imagesMap['test'].clone();
    monsterTexture.needsUpdate = true;
    monsterTexture.magFilter = THREE.NearestFilter;
    monsterTexture.minFilter = THREE.NearestFilter;
    monsterTexture.wrapS = THREE.RepeatWrapping;
    monsterTexture.wrapT = THREE.RepeatWrapping;
    monsterTexture.repeat.set(32 / monsterTexture.image.width, 32 / monsterTexture.image.height);
    monsterTexture.offset.x = 0;
    monsterTexture.offset.y = 1 - (1/8);
    var monsterMaterial = new THREE.SpriteMaterial( { map: monsterTexture, fog: true } );

		var geometry = new THREE.BoxBufferGeometry( 32, 32, 32 );
		var wallMaterial = new THREE.MeshBasicMaterial( { map: wallsTexture } );
		var floorMaterial = new THREE.MeshBasicMaterial( { color: 0x515253, map: ceilingTexture} );
		var ceilingMaterial = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, map: ceilingTexture } );

		scene.background = new THREE.Color( 0x111133 );

		var ceilingGeometry = new THREE.PlaneBufferGeometry(tilemapData.layers[0].width * 32, tilemapData.layers[0].height * 32, tilemapData.layers[0].width, tilemapData.layers[0].height);
		var ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
		ceiling.position.set(tilemapData.layers[0].width * 32 * 0.5, 16, tilemapData.layers[0].height * 32 * 0.5);
		ceiling.rotation.x = Math.PI * 0.5;
		scene.add(ceiling);
    var floor = new THREE.Mesh(ceilingGeometry, floorMaterial);
    floor.position.set(tilemapData.layers[0].width * 32 * 0.5, -16, tilemapData.layers[0].height * 32 * 0.5);
    floor.rotation.x = Math.PI * -0.5;
    scene.add(floor);

		tilemapData.layers.forEach(function (layer) {
			if (layer.name === 'monsters' || layer.name === 'items' || layer.name === 'etc') {
				return;
			}

			var material = floorMaterial;
			var testMaterialMap = {
				walls: wallMaterial
			};
			var testMaterialHeights = {
				walls: 0
			};
			material = testMaterialMap[layer.name];
			blockHeight = testMaterialHeights[layer.name];

			layer.data.forEach(function (tileNumber, index) {
				if (tileNumber === 0) {
					return;
				}

				var x = index % layer.width;
				var y = ~~(index / layer.width);


				var cube = new THREE.Mesh( geometry, material );
				cube.position.set(x * 32 + 16, blockHeight, y * 32 + 16);
				scene.add( cube );
			}, this);

		}, this);

    ingameMonsters = [];

		monsters.forEach(function (monster) {
      var testModel = modelsMap['squirtle'].clone();
      testModel.position.set(monster.x, -16, monster.y);
      testModel.scale.set(0.0925, 0.0925, 0.0925);
      testModel.userData.gameObject = monster;
      testModel.up = new THREE.Vector3(0, 1, 0);
      scene.add(testModel);
      ingameMonsters.push(testModel);
		}, this);

		items.forEach(function (item) {
			var sprite = new THREE.Sprite(monsterMaterial);
			sprite.position.set(item.x, -8, item.y);
			sprite.scale.set(16, 16, 16);
			scene.add(sprite);
			item.data.threeSprite = sprite;
		}, this);

		scene.fog = new THREE.Fog( new THREE.Color( 0x39414f ), 5, 250 );

		camera.position.x = 3;
		camera.position.y = 0;
		camera.position.z = 5;

    bladeModel = modelsMap['test_blade'].clone();
    bladeModel.position.set(64, 0, 64);
    scene.add(bladeModel);

    var light = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
    scene.add(light);
	};

  updateThreeScene = function (gameplay) {
    ingameMonsters.forEach(function (monster) {
      if (monster.userData.gameObject.alive === false) {
        monster.visible = false;
        return;
      }

      monster.position.set(monster.userData.gameObject.x, -16, monster.userData.gameObject.y);
      const velocity = monster.userData.gameObject.body.velocity;
      monster.lookAt(monster.position.x + velocity.x, -16, monster.position.z + velocity.y);
      monster.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI * 0.5);

      var player = gameplay.player;
      var rotationY = gameplay.rotationY;
      camera.position.x = player.centerX;
      camera.position.z = player.centerY;
      //camera.position.y = Math.sin((player.centerX + (6 * player.centerY)) / 100) * 0.2;
      var pos = new THREE.Vector3(camera.position.x + (10 * Math.cos(rotationY)), 0, camera.position.z + (10 * Math.sin(rotationY)));
      camera.lookAt(pos);

      bladeModel.rotation.set(0, 0, 0);
      bladeModel.lookAt(pos);
      bladeModel.rotateOnWorldAxis(new THREE.Vector3(Math.cos(rotationY), 0, Math.sin(rotationY)), -0.6);
      if (gameplay.currentCardName === 'strike') {
        var upDir = new THREE.Vector3(0, 1, 0);
        upDir.cross(new THREE.Vector3(Math.cos(rotationY), 0, Math.sin(rotationY)));
        bladeModel.rotateOnWorldAxis(upDir, Math.PI * 0.5);
      } else if (gameplay.currentCardName === 'block') {
        bladeModel.rotateOnWorldAxis(new THREE.Vector3(Math.cos(rotationY), 0, Math.sin(rotationY)), -0.9);
      }
      bladeModel.position.x = camera.position.x + (Math.cos(rotationY + 0.76) * 7);
      bladeModel.position.y = -2
      bladeModel.position.z = camera.position.z + (Math.sin(rotationY + 0.76) * 7);
    }, this);
  };

  updateThreeCamera = function (fov) {
    camera.fov = fov ? fov : 75;
    camera.updateProjectionMatrix();
  };

	renderThreeScene = function (x, y, rotationY) {
		renderer.render( scene, camera );
	};
})();