var data = require("sdk/self").data;

//TEST BUTTON
//button to access panel, needed only to develop
var button = require("sdk/ui/button/action").ActionButton({
  id: "show-panel",
  label: "Show Panel",
  icon: {
    "16": "./icon-16.png",
    "32": "./icon-32.png",
    "64": "./icon-64.png"
  },
//  onClick: showCoords
});

//translation panel itself
var translation_panel = require("sdk/panel").Panel({
	width: 300,
	height: 100,
	position: {bottom: 10, right: 10},
	contentURL: data.url("translationPanel.html"),
	contentScriptFile: data.url("getTranslation.js")
});

var text = "";


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
	translation_panel.port.emit("text", text);
    translation_panel.show();
};

//TEST PANEL
var test_panel = require("sdk/panel").Panel({
	width: 300,
	height: 100,
	contentURL: data.url("translationPanel.html")
});

//TEST FUNCTIONS TO GET CURSOR POSITION
var tabs = require("sdk/tabs");

//attach content-script to every tab
tabs.on("ready", function(tab){
	var worker = tab.attach({
		contentScriptFile: data.url("cursorPosition.js")
	});
	
	worker.port.on("cursorPosition", function(x, y) {
		test_panel.show({
			position: {
				left: (x - 50),
				top: (y + 10)
			}
		});
	});
});