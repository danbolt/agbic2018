var initalizeThreeJS = undefined;
var loadThreeJSAssets = undefined;
var populateThreeTestScene = undefined;
var renderThreeScene = undefined;

var threeCanvas = undefined;
var threeAssetsLoaded = false;

(function () {
	var scene = undefined;
	var camera = undefined;
	var renderer = undefined;

	var assetsMap = {};

	initalizeThreeJS = function (phaserWebGLContext) {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera( 75, 240 / 320, 0.1, 600 );

		renderer = new THREE.WebGLRenderer();
		renderer.setSize(phaserWebGLContext.drawingBufferWidth, phaserWebGLContext.drawingBufferHeight );
		document.body.appendChild( renderer.domElement );
		renderer.domElement.style["z-index"] = -1;
		threeCanvas = renderer.domElement;
	};

	loadThreeJSAssets = function () {
		var assetsToLoad = [
			'test'
		];
		var assetsFinishedLoading = 0;

  		var tl = new THREE.TextureLoader();

  		assetsToLoad.forEach(function (assetName) {
  			tl.load('asset/image/' + assetName + '.png', function (loadedTexture) {
  				assetsMap[assetName] = loadedTexture;

  				assetsFinishedLoading++;
  				if (assetsFinishedLoading === assetsToLoad.length) {
  					threeAssetsLoaded = true;
  					console.log('done loading three assets!');
  				}
  			});
  		}, this);
	};

	populateThreeTestScene = function (tilemapData, monsters) {

		var wallsTexture = assetsMap['test'].clone();
        wallsTexture.needsUpdate = true;
        wallsTexture.magFilter = THREE.NearestFilter;
        wallsTexture.minFilter = THREE.NearestFilter;
        wallsTexture.wrapS = THREE.RepeatWrapping;
        wallsTexture.wrapT = THREE.RepeatWrapping;
        wallsTexture.repeat.set(32 / wallsTexture.image.width, 32 / wallsTexture.image.height);
        wallsTexture.offset.x = 0;
        wallsTexture.offset.y = 0.5;

        var monsterTexture = assetsMap['test'].clone();
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
		var floorMaterial = new THREE.MeshBasicMaterial( { color: 0x313233, map: wallsTexture} );
		var ceilingMaterial = new THREE.MeshBasicMaterial( { color: 0x333344, map: wallsTexture } );

		scene.background = new THREE.Color( 0x111133 );

		tilemapData.layers.forEach(function (layer) {
			if (layer.name === 'monsters') {
				return;
			}

			var material = floorMaterial;
			var testMaterialMap = {
				walls: wallMaterial,
				floor: floorMaterial,
				ceiling: ceilingMaterial
			};
			var testMaterialHeights = {
				walls: 0,
				floor: -32,
				ceiling: 32
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
			var sprite = new THREE.Sprite(monsterMaterial);
			sprite.position.set(monster.x, 0, monster.y);
			sprite.scale.set(32, 32, 32);
			scene.add(sprite);
		}, this);

		scene.fog = new THREE.Fog( new THREE.Color( 0x39414f ), 5, 250 );

		camera.position.x = 3;
		camera.position.y = -4;
		camera.position.z = 5;
	};

	renderThreeScene = function (x, y, rotationY) {
		camera.position.x = x;
		camera.position.z = y;
		var pos = new THREE.Vector3(camera.position.x + (10 * Math.cos(rotationY)), -4, camera.position.z + (10 * Math.sin(rotationY)));
		camera.lookAt(pos);
		renderer.render( scene, camera );
	};
})();