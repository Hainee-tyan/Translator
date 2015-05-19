(function() {
	var x = 0;
	var y = 0;
	
	//track mouse x and y coordinates
	window.addEventListener("mousemove", function(event) {
		x = event.clientX;
		y = event.clientY;
	});

	//when we get a message from main add-on script, we should
	//send coordinates back to it
	self.port.on("cursor", function(bool) {	
		self.port.emit("cursorPosition", "x: " + x + ", y: " + y);
	});
})();