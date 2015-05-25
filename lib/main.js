var data = require("sdk/self").data;
var tabs = require("sdk/tabs");

//coordinates of cursor to show panel
var cursorX = 0;
var cursorY = 0;

//translation panel
var translationPanel = require("sdk/panel").Panel({
	width: 300,
	
	//default height, updates after translation content
	height: 100,
	
	//default position is right bottom corner, updates
	//to position under cursor
	position: {bottom: 10, right: 10},
	contentURL: data.url("translationPanel.html"),
	contentScriptFile: data.url("getTranslation.js")
});

//attach content-script, that listens to
//mouse and keyboard events to every tab
tabs.on("ready", function(tab){
	var worker = tab.attach({
		contentScriptFile: [data.url("pageEventScript.js"), data.url("getWordOnCoords.js")]
	});

	//receive message from script to show panel
	//with coordinates of cursor and word under
	//cursor as parameters
	worker.port.on("showPanel", function(x, y, word) {
		
		//if no word under cursor - just do nothing
		if (word == null) return;
		
		//set coordinates
		cursorX = x;
		cursorY = y;

		//pass word to translation script
		//this script will send message to panel
		//to show up after it's ready
		translationPanel.port.emit("translateWord", word);

		//tell script, that panel is shown now
		worker.port.emit("panelIsShown", true);
	});
	
	//hide panel when mouse moves
	worker.port.on("hidePanel", function(hide) {
		translationPanel.hide();
	});
});

//when script, associated with panel, is ready, 
//show panel under cursor with specified height
translationPanel.port.on("readyToShow", function(height) {
	translationPanel.height = height;
	
	//show translation panel under cursor coordinates
	translationPanel.show({
		position: {
			top: (cursorY + 10),
			left: (cursorX - 50)
		}
	});
});