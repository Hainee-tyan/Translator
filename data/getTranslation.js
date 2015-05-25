self.port.on("translateWord", function(word) {
	
	//specifications of Yandex.Dictionary and
	//Yandex.Translation
	var systemInformation = {
		"dictionary": {
			"url": "https://dictionary.yandex.net/api/v1/dicservice.json/lookup?",
			"key": "dict.1.1.20150508T114605Z.d35c82ead74ccb72.f74324b7ec93ca680a19dd17a020aee671cee499",
			"property": "def"
		},
		"translation": {
			"url": "https://translate.yandex.net/api/v1.5/tr.json/translate?",
			"key": "trnsl.1.1.20150508T110245Z.27605ac05e213aef.e12e2ea8ceb3380bb3035192d56857fa747231b6",
			"property": "text"
		}
	};
	

	//check language of word and specify direction
	//of translation
	var fromLanguage = "en";
	var toLanguage = "ru";
	
	if (!isLatin(word)) {
		fromLanguage = "ru";
		toLanguage = "en";
	};
	
	//send request to server and inspect response
	var inspection = inspectTranslation(systemInformation.dictionary, fromLanguage, toLanguage, word);
	
	//if inspection returned 0, it means there is no translation
	//in dictionary, so we check yandex.translation service
	if (inspection == 0) {
		inspection = inspectTranslation(systemInformation.translation, fromLanguage, toLanguage, word);
		//if inspection returned 0 again, we should admit
		//there is no translation for this text
		if (inspection == 0)
			printError("Перевод не найден.");
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
	
	if ("text" in translationJSON) {
		translationHTML.innerHTML = translationJSON.text;
		return;
	};

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

//print specified error message in panel
function printError(errorMessage) {
	document.getElementById("word").innerHTML = "ERROR";
	document.getElementById("transcription").innerHTML = "";
	document.getElementById("translation").innerHTML = errorMessage;
};

//send AJAX synchronous request to server,
//returns valid JSON object or null in case of error
function translationRequest(baseURL, key, fromLanguage, toLanguage, word) {

	//xml request
	var httpRequest = new XMLHttpRequest();
	var url = baseURL + "key=" + key +
			"&lang=" + fromLanguage + "-" + toLanguage + 
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

//function check if there is more
//latin or cyrillic characters in text
function isLatin(text) {
	var engMatches = text.match(/[a-z]/ig);
	var ruMatches = text.match(/[а-я]/ig);
	if (!engMatches || (ruMatches && ruMatches.length > engMatches.length)) 
		return false;
	return true;
};


//send request to server and inspect response.
//prints error message of translation in panel
//returns 0 if no translation found
function inspectTranslation(systemInformation, fromLanguage, toLanguage, word) {
	//response from server
	var translationJSON = translationRequest(systemInformation.url, systemInformation.key, fromLanguage, toLanguage, word);
	
	//if function returned valid JSON object, inspect it
	if (translationJSON != null) {
		//if there is no needed property, request
		//wasn't correct - return text of error
		//("message" property) if possible
		if (!(systemInformation.property in translationJSON)) {
			var errorMessage = "Unknown error.";		
			if ("message" in translationJSON)
				errorMessage = translationJSON.message;
			printError(errorMessage);
		}
		//request was correct, but there is no translation
		else if (translationJSON[systemInformation.property].length < 1) {
			return 0;
		}
		//request was correct and there is at least 1 translation
		else {
			parseJSON(translationJSON, word);
		};
	}
	//if function returned null - it means
	//server didn't responsed or response wasn't
	//valid JSON object
	else {
		printError("Unknown error.");
	};
};