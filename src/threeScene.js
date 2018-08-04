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

	populateThreeTestScene = function () {
		var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		var material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
		var cube = new THREE.Mesh( geometry, material );
		scene.add( cube );

		camera.position.z = 5;
	};

	renderThreeScene = function () {
		renderer.render( scene, camera );
	};
})();