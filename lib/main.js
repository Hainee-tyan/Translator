var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var text = "";

//translation panel
var translationPanel = require("sdk/panel").Panel({
	width: 300,
	height: 100,
	position: {bottom: 10, right: 10},
	contentURL: data.url("translationPanel.html"),
	contentScriptFile: data.url("getTranslation.js")
});

//attach content-script to every tab
tabs.on("ready", function(tab){
	var worker = tab.attach({
		contentScriptFile: [data.url("cursorPosition.js"), data.url("getWordOnCoords.js")]
	});
	
	//receive message from script to show panel
	//with coordinates of cursor and word under
	//cursor as parameters
	worker.port.on("showPanel", function(x, y, word) {
		
		//if no word under cursor - just do nothing
		if (word == null) return;
		
		//pass word to translation script
		translationPanel.port.emit("translateWord", word);
		
		translationPanel.port.on("height", function(height) {
			translationPanel.resize(300, height);
		});

		//show translation panel under cursor coordinates
		translationPanel.show({
			position: {
				left: (x - 50),
				top: (y + 10)
			}
		});

		worker.port.emit("panelIsShown", true);
	});
	
	//hide panel when mouse moves
	worker.port.on("hidePanel", function(hide) {
		translationPanel.hide();
	});
});

//TEST SELECTION
var selection = require("sdk/selection");
selection.on("select", function() {
	text = selection.text
	showTranslation();
});

// Show the panel
function showTranslation(state) {
	//if text is empty or include spaces, nothing should happen
	if(!text || text.trim().indexOf(" ") != -1) return;
	translationPanel.port.emit("text", text);
    translationPanel.show();
};

//TEST