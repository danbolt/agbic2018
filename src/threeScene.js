var initalizeThreeJS = undefined;
var populateThreeTestScene = undefined;
var renderThreeScene = undefined;
var threeCanvas = undefined;

(function () {
	var scene = undefined;
	var camera = undefined;
	var renderer = undefined;

	initalizeThreeJS = function (phaserWebGLContext) {
		scene = new THREE.Scene();
		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

		renderer = new THREE.WebGLRenderer();
		renderer.setSize(phaserWebGLContext.drawingBufferWidth, phaserWebGLContext.drawingBufferHeight );
		document.body.appendChild( renderer.domElement );
		renderer.domElement.style["z-index"] = -1;
		threeCanvas = renderer.domElement;
	};

	populateThreeTestScene = function (tilemapData) {
		var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		var wallMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
		var floorMaterial = new THREE.MeshBasicMaterial( { color: 0x313233 } );
		var ceilingMaterial = new THREE.MeshBasicMaterial( { color: 0x111111 } );

		scene.background = new THREE.Color( 0x111133 );

		tilemapData.layers.forEach(function (layer) {
			var material = floorMaterial;
			var testMaterialMap = {
				walls: wallMaterial,
				floor: floorMaterial,
				ceiling: ceilingMaterial
			};
			var testMaterialHeights = {
				walls: 0,
				floor: -1,
				ceiling: 1
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
				cube.position.set(x * 1, blockHeight, y * 1);
				scene.add( cube );
			}, this);

		}, this);

		camera.position.z = 5;
		camera.position.x = 3;
	};

	renderThreeScene = function () {
		renderer.render( scene, camera );
	};
})();