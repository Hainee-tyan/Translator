self.port.on("translateWord", function(word) {
	
	var dictionaryURL = "https://dictionary.yandex.net/api/v1/dicservice.json/lookup?";
	var dictionaryKey = "dict.1.1.20150508T114605Z.d35c82ead74ccb72.f74324b7ec93ca680a19dd17a020aee671cee499";
	var translationJSON = translationRequest(dictionaryURL, dictionaryKey, word);
	
	//if function returned valid JSON object, inspect it
	if (translationJSON != null)
	{
		//if there is no "def" property, request
		//wasn't correct - tell user what was
		//wrong ("message" property) if it's possible
		if (!("def" in translationJSON)) {
			var errorMessage = "Unknown error.";		
			if ("message" in translationJSON)
				errorMessage = translationJSON.message;
			printError(errorMessage);
		}
		//request was correct, but there is no translation
		else if (translationJSON.def.length < 1) {
			printError("Перевод не найден.");
		}
		//request was correct and there is at least 1 translation
		else
			parseJSON(translationJSON, word);
	}
	//if function returned null - it means
	//server didn't requested or request wasn't
	//valid JSON object
	else {
		printError("Unknown error.");
	};
	
	//send message to main add-on script, that
	//document is ready to be shown
	//send also height of document, so script 
	//can resize panel
	var height = document.body.offsetHeight;
	self.port.emit("readyToShow", height + 16);
});

//assume that translationJSON is valid JSON object and contains "def"
//property, that is array with length >0
function parseJSON(translationJSON, word) {
	
	//HTML elements for different parts of translation
	var wordHTML = document.getElementById("word");
	var transcriptionHTML = document.getElementById("transcription");
	var translationHTML = document.getElementById("translation");

	//place word in it's html element and clear other fields
	wordHTML.innerHTML = word;
	translationHTML.innerHTML = "";
	transcriptionHTML.innerHTML = "";

 	//translation array
	var translationArray = translationJSON.def;
	var translation = "";

	//transcription
	if ("ts" in translationArray[0])
		transcriptionHTML.innerHTML = "[" +  translationJSON.def[0].ts + "]";

	for (var i in translationArray)
	{
		//check if there is translation objects
		if(!("tr" in translationArray[i]) || translationArray[i].tr.length < 1)
			continue;
			
		//if there is part-of-speech property, use it
		if ("pos" in translationArray[i].tr[0])
			//word's part of speech
			translation += "<div style=\"font-style: italic;\">&emsp;" + translationArray[i].tr[0].pos + "</div>";
        
		//single translation group
		for (var j in translationArray[i].tr)
		{ 
		    var singleTranslation = translationArray[i].tr;

			//first translation in group
			translation += singleTranslation[j].text;
			
			//if there is array of synonims, use it
            for (var k = 0; "syn" in singleTranslation[j] && k <singleTranslation[j].syn.length && k < 3; k++)
               translation += ", " + singleTranslation[j].syn[k].text;
		   
		   if (j < singleTranslation.length - 1) translation += ", ";
		}; 
	};
		
	translationHTML.innerHTML = translation;
};
	
 function printError(errorMessage) {
	document.getElementById("word").innerHTML = "ERROR";
	document.getElementById("transcription").innerHTML = "";
	document.getElementById("translation").innerHTML = errorMessage;
};

//send AJAX synchronous request to server,
//returns valid JSON object or null in case of error
function translationRequest(baseURL, key, word) {

	//languages
	var languageOfWord = "en";
	var languageOfTranslation = "ru";

	//xml request
	var httpRequest = new XMLHttpRequest();
	var url = baseURL + "key=" + key +
			"&lang=" + languageOfWord + "-" + languageOfTranslation + 
			"&text=" + word;
	
	//send request
	httpRequest.open("GET", url, false);
	httpRequest.send();
		
	//handle case where returned value is not valid JSON
	//or server didn't responsed at all
	try {
		var translationJSON = JSON.parse(httpRequest.responseText);
		return translationJSON;
	}
	catch (error) {
		return null;
	};
};