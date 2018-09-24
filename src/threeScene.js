var initalizeThreeJS = undefined;
var loadThreeJSAssets = undefined;
var populateThreeTestScene = undefined;
var renderThreeScene = undefined;

var threeCanvas = undefined;
var threeImagesLoaded = false;
var threeModelsLoaded = false;

(function () {
	var scene = undefined;
	var camera = undefined;
	var renderer = undefined;

  var imagesToLoad = [
    'test'
  ];
	var imagesMap = {};

  var modelsToLoad = [
    'squirtle'
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
          //console.log(child);
          if (child.name === 'model') {
            child.children.forEach(function (subchild) {
              //console.log(subchild.material);
              //subchild.material = new THREE.MeshBasicMaterial({map: subchild.map, color:0x555555});
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
		var floorMaterial = new THREE.MeshBasicMaterial( { color: 0x212253, map: ceilingTexture} );
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
			if (layer.name === 'monsters' || layer.name === 'items') {
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

		monsters.forEach(function (monster) {
      var testModel = modelsMap['squirtle'].clone();
      testModel.position.set(monster.x, -16, monster.y);
      testModel.scale.set(0.0925, 0.0925, 0.0925);
      scene.add(testModel);
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

    var light = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
    scene.add(light);
	};

	renderThreeScene = function (x, y, rotationY) {
		camera.position.x = x;
		camera.position.z = y;
		var pos = new THREE.Vector3(camera.position.x + (10 * Math.cos(rotationY)), 0, camera.position.z + (10 * Math.sin(rotationY)));
		camera.lookAt(pos);
		renderer.render( scene, camera );
	};
})();