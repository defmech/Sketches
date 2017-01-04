var Dog = Dog || {};

Dog.Main = (function() {
	// scene vars
	var scene, camera, renderer, orbitControls;

	// canvas capture vars
	var canvasImageData;
	var getCanvasImageData = false;
	var ONCE = 'once';

	// Should scene show helpers
	var USE_HELPERS = false;

	// Objects
	var hero;
	var sphere;
	var animationSpeed = 2;
	var elementsBlue = [];
	var elementsOrange = [];
	var elementsContainer;

	var ORIGIN = {
		x: 0,
		y: 0
	}
	var SPHERE_RADIUS = 18;

	var BOX_WIDTH = 400;
	var BOX_DIMS = {
		w: 360,
		h: 600,
		d: 40
	}

	var OVERFLOW = BOX_DIMS.h / 2;

	var ELEMENTS_MAX = 1;

	var SCALE_MIN = 0.1;
	var SCALE_MAX = 1;

	var hueBlue = 204;
	var hueOrange = 20;

	var spotLight1;

	var elementsContainer;
	var waterfallBlue;
	var waterfallOrange;

	var SPHERE_GEOMETRY = new THREE.SphereBufferGeometry(SPHERE_RADIUS, 32, 32);

	var material = new THREE.ShaderMaterial({
		vertexShader: document.getElementById('vertexShader').textContent,
		fragmentShader: document.getElementById('fragmentShader').textContent
	});

	var intervalBlue;
	var intervalOrange;

	// Capture
	var capturer = new CCapture({
		format: 'webm'
	});
	var isCapturing = false;


	function setup() {

		textureBumpMapLoader = new THREE.TextureLoader();

		// init scene
		scene = new THREE.Scene();

		// init camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 800;

		// console.log('Main.js', camera.position);

		camera.lookAt(0, 0, 0)

		// init renderer
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.autoClear = false;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		// renderer.shadowMap.soft = true;

		document.body.appendChild(renderer.domElement);

		// add controls
		orbitControls = new THREE.OrbitControls(camera, renderer.domElement);


		// add window resize handler
		window.addEventListener('resize', onWindowResize, false);

		// add container
		elementsContainer = new THREE.Object3D();
		scene.add(elementsContainer);

		waterfallBlue = new THREE.Object3D();
		waterfallBlue.position.x = (BOX_DIMS.w / 2) + 40;
		elementsContainer.add(waterfallBlue);

		waterfallOrange = new THREE.Object3D();
		waterfallOrange.position.x = -((BOX_DIMS.w / 2) + 40);
		elementsContainer.add(waterfallOrange);

		if (USE_HELPERS) scene.add(new THREE.AxisHelper(500));

		init();
	}

	function init() {

		// add content
		addLighting();
		// addFloor();
		addSkyBox();
		// addBoxsTo(waterfallBlue);
		// addBoxsTo(waterfallOrange);
		initAnimation();

		// init keyboard listener
		initKeyboard();

		// render
		render();
	}

	function initAnimation() {

		intervalBlue = setInterval(addElementBlue, 100);
		intervalOrange = setInterval(addElementOrange, 100);
	}

	function animateElementsBlue() {
		for (var i = 0; i < elementsBlue.length; i++) {
			var element = elementsBlue[i];

			element.position.z += element.velocity.z;

			if (element.position.z > (BOX_DIMS.d / 2)) {
				element.velocity.z *= 0.99;

				if (element.position.y > -((BOX_DIMS.h / 2) + OVERFLOW)) {
					// Falling
					element.velocity.y -= (0.15 * (element.scale.x));
					element.position.y += element.velocity.y;
				} else {
					element.restart();
				}
			} else {
				element.position.y = (BOX_DIMS.h / 2) + (SPHERE_RADIUS * element.scale.x);
			}
		}
	}

	function animateElementsOrange() {
		for (var i = 0; i < elementsOrange.length; i++) {
			var element = elementsOrange[i];

			element.position.z += element.velocity.z;

			if (element.position.z > (BOX_DIMS.d / 2)) {
				element.velocity.z *= 0.99;

				if (element.position.y < ((BOX_DIMS.h / 2) + OVERFLOW)) {
					// Falling up
					element.velocity.y += (0.15 * (element.scale.x));
					element.position.y += element.velocity.y;
				} else {
					element.restart();
				}
			} else {
				element.position.y = -(BOX_DIMS.h / 2) - (SPHERE_RADIUS * element.scale.x);
			}
		}
	}


	function initKeyboard() {
		// listen for keystrokes
		document.body.addEventListener("keyup", function(event) {
			// console.info('event.keyCode', event.keyCode);

			switch (event.keyCode) {
				case 80: // p
					exportCanvasImageDataToPNG();
					break;
				case 67: // c
					logCameraPosotion();
					break;
				case 82: // r
					handleKeyboardR();
					break;
			}
		});
	}

	function handleKeyboardR(event) {
		console.log('Main.js', 'handleKeyboardR');
		if (!isCapturing) {
			isCapturing = true;
			capturer.start();

		} else {
			isCapturing = false;
			capturer.stop();

			// default save, will download automatically a file called {name}.extension (webm/gif/tar)
			capturer.save();
		}
	}

	function logCameraPosotion() {
		console.log('Main.js', 'camera.position', camera.position);
	}

	// gets image data 
	function exportCanvasImageDataToPNG() {
		getCanvasImageData = true;
		render(ONCE);

		var win = window.open("", "Canvas Image");
		var canvas = renderer.domElement;
		var src = canvas.toDataURL("image/png");

		win.document.write("<img src='" + canvasImageData + "' width='" + canvas.width + "' height='" + canvas.height + "'/>");
	}

	function onWindowResize() {
		// Update camera and renderer
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}



	function addLighting() {

		// Add a light
		spotLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
		spotLight1.position.set(0, 1200, 1200);
		spotLight1.target.position.set(0, 0, 0);

		var shadowSize = 1024;

		spotLight1.castShadow = true;
		spotLight1.shadow.mapSize.width = shadowSize * 2;
		spotLight1.shadow.mapSize.height = shadowSize * 2;
		spotLight1.shadow.camera.near = 100;
		spotLight1.shadow.camera.far = 2000;
		spotLight1.shadow.camera.left = -shadowSize / 2;
		spotLight1.shadow.camera.right = shadowSize / 2;
		spotLight1.shadow.camera.top = shadowSize / 2;
		spotLight1.shadow.camera.bottom = -shadowSize / 2;

		scene.add(spotLight1);

		// helper

		// add another spotlight
		var spotLight2 = new THREE.DirectionalLight(0xffffff, 0.125);
		spotLight2.position.set(Dog.Utils.randomRange(-300, -500), Dog.Utils.randomRange(-300, -500), Dog.Utils.randomRange(-300, -500));
		spotLight2.target.position.set(0, 0, 0);

		scene.add(spotLight2);

		// helper
		if (USE_HELPERS) {
			scene.add(new THREE.DirectionalLightHelper(spotLight1));
			scene.add(new THREE.DirectionalLightHelper(spotLight2));
			scene.add(new THREE.CameraHelper(spotLight1.shadow.camera));
		}

		// Add and additional AmbientLight
		scene.add(new THREE.AmbientLight(0xAAAAAA));
	}



	function addBoxsTo(target) {

		var material = new THREE.MeshPhongMaterial({
			color: new THREE.Color('hsl(26, 7%, 81%)'),
			shading: THREE.SmoothShading,
			emissive: 0x000000,
			specular: 0x666666,
			shininess: 10,
		});

		var boxFrontGeometry = new THREE.BoxBufferGeometry(BOX_DIMS.w, BOX_DIMS.h, BOX_DIMS.d);

		var boxFront = new THREE.Mesh(boxFrontGeometry, material);
		boxFront.receiveShadow = true;
		boxFront.castShadow = true;
		target.add(boxFront);
	}

	function addElementBlue() {

		if (elementsBlue.length < ELEMENTS_MAX) {

			// var material = new THREE.MeshPhongMaterial({
			// 	color: new THREE.Color('hsl(' + Dog.Utils.randomInt(hueBlue - 10, hueBlue + 10) + ', 60%, ' + Dog.Utils.randomInt(40, 70) + '%)'),
			// 	shading: THREE.SmoothShading,
			// 	emissive: 0x000000,
			// 	specular: 0x333333,
			// 	shininess: 10,
			// });


			var element = new THREE.Mesh(SPHERE_GEOMETRY, material);

			element.restart = function() {
				this.scale.x = this.scale.y = this.scale.z = Dog.Utils.randomRange(SCALE_MIN, SCALE_MAX);
				this.position.x = Dog.Utils.randomRange(-(BOX_DIMS.w / 2), BOX_DIMS.w / 2);
				this.position.y = (BOX_DIMS.h / 2) + (SPHERE_RADIUS * this.scale.x);
				this.position.z = -(BOX_DIMS.d / 2);
				this.positionClone = this.position.clone();
				this.velocity = new THREE.Vector3(0, 0, 2);
				this.scaleClone = this.scale.clone();
			}

			element.restart();

			// Performance hit
			// element.receiveShadow = true;
			element.castShadow = true;

			waterfallBlue.add(element);

			if (USE_HELPERS) element.add(new THREE.AxisHelper(25));

			elementsBlue.push(element);
		} else {
			clearInterval(intervalBlue);
		}
	}

	function addElementOrange() {

		if (elementsOrange.length < ELEMENTS_MAX) {
			204 - 10, 204 + 10

			// var material = new THREE.MeshPhongMaterial({
			// 	// HSL(8, 76%, 39%)
			// 	color: new THREE.Color('hsl(' + Dog.Utils.randomInt(hueOrange - 10, hueOrange + 10) + ', 76%, ' + Dog.Utils.randomInt(30, 50) + '%)'),
			// 	shading: THREE.SmoothShading,
			// 	emissive: 0x000000,
			// 	specular: 0x333333,
			// 	shininess: 10,
			// 	// transparent: true,
			// 	// opacity: 0.9,
			// 	// side: THREE.DoubleSide,
			// });


			var element = new THREE.Mesh(SPHERE_GEOMETRY, material);

			element.restart = function() {
				this.scale.x = this.scale.y = this.scale.z = Dog.Utils.randomRange(SCALE_MIN, SCALE_MAX);
				this.position.x = Dog.Utils.randomRange(-(BOX_DIMS.w / 2), BOX_DIMS.w / 2);
				this.position.y = -((BOX_DIMS.h / 2) + (SPHERE_RADIUS * this.scale.x));
				this.position.z = -(BOX_DIMS.d / 2);
				this.positionClone = this.position.clone();
				this.velocity = new THREE.Vector3(0, 0, 2);
				this.scaleClone = this.scale.clone();
			}

			element.restart();

			// element.receiveShadow = true;
			element.castShadow = true;

			waterfallOrange.add(element);

			if (USE_HELPERS) element.add(new THREE.AxisHelper(25));

			elementsOrange.push(element);
		} else {
			clearInterval(intervalOrange);
		}
	}

	function addFloor() {
		var floorMaterial = new THREE.MeshPhongMaterial({
			color: 0xFFFFFF,
			shading: THREE.FlatShading,
			emissive: 0x666666,
			specular: 0x111111,
			shininess: 30,
		});

		var floorGeometry = new THREE.PlaneBufferGeometry(2000, 2000);
		var floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.receiveShadow = true;
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = -(BOX_DIMS.h / 2);
		scene.add(floor);
	}

	function addSkyBox() {
		var skyBoxWidth = 2000;
		var skybox = new THREE.Mesh(new THREE.BoxGeometry(skyBoxWidth, skyBoxWidth, skyBoxWidth), new THREE.MeshBasicMaterial({
			// color: 0xBBBBBB,
			color: new THREE.Color('hsl(354, 7%, 71%)'),
			// HSL(354, 7%, 71%)
			side: THREE.BackSide,
		}));
		skybox.receiveShadow = true;
		scene.add(skybox);
	}

	function render(howManyTimes) {
		/* If we are rendering for an exportCanvasImageDataToPNG then DO NOT requestAnimationFrame as can speed up animations that are called on render */

		if (howManyTimes !== ONCE) requestAnimationFrame(render);

		// animateElementsBlue();
		// animateElementsOrange();
		// elementsContainer.rotation.y -= 0.01;

		renderer.clear();
		renderer.render(scene, camera);
		orbitControls.update();

		capturer.capture(renderer.domElement);

		if (getCanvasImageData === true) {
			canvasImageData = renderer.domElement.toDataURL();
			getCanvasImageData = false;
		}
	}

	return {
		init: function() {
			setup();
		}
	};
})();