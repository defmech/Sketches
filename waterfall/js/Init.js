if (Dog.WebGLDetect.canProceed)
{
	// If WebGL is available to use then we load our libraries.
	LazyLoad.js(
		[
			"../libs/three.min.js",
			"../libs//OrbitControls.js",
			"../libs/TweenMax.min.js",
			"./js/Utils.js",
			"./js/Main.js"
		],
		function()
		{
			Dog.Main.init();
		});
}