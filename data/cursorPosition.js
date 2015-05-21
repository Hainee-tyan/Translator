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

	//when user press key, we invoke function to find word 
	//on position of cursor and sent position itself and word
	//to add-on main script
	window.addEventListener("keydown", function(event) {
		if (event.which === keyToPress && event.location === keyLocation) {
			var word = getWordOnCoords(window.document.body, x, y);
			self.port.emit("cursorPosition", x, y, word);
		};
	});
})();