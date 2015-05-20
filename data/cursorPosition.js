(function() {
	var x = 0;
	var y = 0;
	
	//this should be read from preferences
	var keyToPress = 16; //shift
	var keyLocation = 2; //DOM_KEY_LOCATION_RIGHT
	
	//track mouse x and y coordinates
	window.addEventListener("mousemove", function(event) {
		x = event.clientX;
		y = event.clientY;
	});

	//when we get a message from main add-on script, we should
	//send coordinates back to it
	window.addEventListener("keydown", function(event) {
		if (event.which === keyToPress && event.location === keyLocation)
			self.port.emit("cursorPosition", x, y);
	});
})();