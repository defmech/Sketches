var Dog = Dog || {};

Dog.Main = (function() {
	// scene vars
	var scene, camera, renderer, orbitControls;

	// canvas capture vars
	var canvasImageData;
	var getCanvasImageData = false;
	var ONCE = 'once';

	// texture vars
	var textureBumpMapLoader, textureMapBump;

	// Should scene show helpers
	var USE_HELPERS = false;

	// Objects
	var hero;
	var sphere;
	var animationSpeed = 2;
	var elements = [];
	var elementsContainer;

	var ORIGIN = {
		x: 0,
		y: 0
	}
	var SPHERE_RADIUS = 14;

	var BOX_WIDTH = 400;

	var ELEMENTS_MAX = 72;

	var SCALE_MIN = 0.1;
	var SCALE_MAX = 1;

	var spotLight1;

	var SPHERE_GEOMETRY = new THREE.SphereBufferGeometry(SPHERE_RADIUS, 32, 32);
	var SPHERE_MATERIAL = new THREE.MeshPhongMaterial({
		color: 0xFBBC03,
		shading: THREE.SmoothShading,
		emissive: 0x000000,
		specular: 0x666666,
		shininess: 30,
	});

	function setup() {

		textureBumpMapLoader = new THREE.TextureLoader();

		// init scene
		scene = new THREE.Scene();

		// init camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
		camera.position.x = 400;
		camera.position.y = 440;
		camera.position.z = 400;

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

		document.body.appendChild(renderer.domElement);

		// add controls
		orbitControls = new THREE.OrbitControls(camera, renderer.domElement);


		// add window resize handler
		window.addEventListener('resize', onWindowResize, false);

		// load images
		textureBumpMapLoader.load('./img/logo_dog.png', function(texture) {
			textureMapBump = texture;

			init();
		});

		if (USE_HELPERS) scene.add(new THREE.AxisHelper(500));
	}

	function init() {

		// add content
		addLighting();
		addFloor();
		addSkyBox();
		addBox();
		initAnimation();

		// init keyboard listener
		initKeyboard();

		// render
		render();
	}

	function initAnimation() {

		setInterval(addElement, 500);
	}

	function animateElements() {
		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];

			element.position.z += element.velocity.z;

			if (element.position.z > (BOX_WIDTH / 2)) {
				element.velocity.z *= 0.99;

				if (element.position.y > -200) {
					element.velocity.y -= 0.1;
					element.position.y += element.velocity.y;
				} else {
					element.restart();
				}
			} else {
				element.scale.x = element.scale.y = element.scale.z = Dog.Utils.map(element.position.z, -(BOX_WIDTH / 2), (BOX_WIDTH / 2), SCALE_MIN, SCALE_MAX);
				element.position.y = (BOX_WIDTH / 2) + (SPHERE_RADIUS * element.scale.x);
			}
		}
	}


	function initKeyboard() {
		// listen for keystrokes
		document.body.addEventListener("keyup", function(event) {
			console.info('event.keyCode', event.keyCode);

			switch (event.keyCode) {
				case 80: // p
					exportCanvasImageDataToPNG();
					break;
				case 67: // c
					logCameraPosotion();
					break;
			}
		});
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
		spotLight1 = new THREE.DirectionalLight(0xffffff, 0.75);
		spotLight1.position.set(0, 600, 100);
		spotLight1.target.position.set(0, 0, 0);

		var shadowSize = 1000;

		spotLight1.castShadow = true;
		spotLight1.shadow.mapSize.width = shadowSize * 2;
		spotLight1.shadow.mapSize.height = shadowSize * 2;
		spotLight1.shadow.camera.near = 1;
		spotLight1.shadow.camera.far = 1000;
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
		}

		// Add and additional AmbientLight
		scene.add(new THREE.AmbientLight(0x555555));
	}



	function addBox() {

		var geometry = new THREE.BoxBufferGeometry(BOX_WIDTH * 1.1, BOX_WIDTH, BOX_WIDTH);
		var material = new THREE.MeshPhongMaterial({
			color: 0x2194ce,
			shading: THREE.SmoothShading,
			emissive: 0x000000,
			specular: 0x666666,
			shininess: 10,
		});

		var box = new THREE.Mesh(geometry, material);

		box.receiveShadow = true;

		scene.add(box);
	}

	function addElement() {

		if (elements.length < ELEMENTS_MAX) {



			var element = new THREE.Mesh(SPHERE_GEOMETRY, SPHERE_MATERIAL);

			element.restart = function() {
				this.scale.x = this.scale.y = this.scale.z = SCALE_MIN;
				this.position.x = Dog.Utils.randomRange(-(BOX_WIDTH / 2), BOX_WIDTH / 2);
				this.position.y = (BOX_WIDTH / 2) + (SPHERE_RADIUS * this.scale.x);
				this.position.z = -(BOX_WIDTH / 2);
				this.positionClone = this.position.clone();
				this.velocity = new THREE.Vector3(0, 0, 2);
			}

			element.restart();

			// Handle scale
			// element.scale.x = element.scale.y = element.scale.z = Dog.Utils.randomRange(SCALE_MIN, 1);
			// element.scaleClone = element.scale.clone();

			element.receiveShadow = true;
			element.castShadow = true;


			scene.add(element);

			if (USE_HELPERS) element.add(new THREE.AxisHelper(25));

			elements.push(element);
		} else {
			console.log('Main.js', 'HIT ELEMENTS_MAX');
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
		floor.position.y = -200.1;
		scene.add(floor);
	}

	function addSkyBox() {
		var skyBoxWidth = 2000;
		var skybox = new THREE.Mesh(new THREE.BoxGeometry(skyBoxWidth, skyBoxWidth, skyBoxWidth), new THREE.MeshBasicMaterial({
			color: 0xFFFFFF,
			side: THREE.BackSide,
		}));
		// skybox.position.y = (skyBoxWidth / 2) - (BOX_WIDTH);
		skybox.receiveShadow = true;
		scene.add(skybox);
	}

	function render(howManyTimes) {
		/* If we are rendering for an exportCanvasImageDataToPNG then DO NOT requestAnimationFrame as can speed up animations that are called on render */

		if (howManyTimes !== ONCE) requestAnimationFrame(render);

		animateElements();
		// elementsContainer.rotation.y -= 0.01;

		renderer.clear();
		renderer.render(scene, camera);
		orbitControls.update();

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