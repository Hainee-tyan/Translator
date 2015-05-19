﻿self.port.on("text", function(word) {
	
	//this should not be hardcoded
	var key = "dict.1.1.20150508T114605Z.d35c82ead74ccb72.f74324b7ec93ca680a19dd17a020aee671cee499";

	//xml request
	var xmlhttp = new XMLHttpRequest();
	var url = "https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=" + key + "&lang=en-ru&text=" + word;
	
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var translationJSON = JSON.parse(xmlhttp.responseText);
			parseJSON(translationJSON);
		};
	};

	xmlhttp.open("GET", url, true);
	xmlhttp.send();

	function parseJSON(translationJSON) {
		
		//HTML elements for different parts of JSON object
		var transcriptionHTML = document.getElementById("transcription");
		var translationHTML = document.getElementById("translation");
		
		//translation array
		var translationArray = translationJSON.def;
		var translation = "";
		
		//place word in it's html element
		document.getElementById("word").innerHTML = word;
		
		//if translation array has no values,
		//we should show no translation
		if (translationArray.length < 1) {
			transcriptionHTML.innerHTML = "";
			translationHTML.innerHTML = "Перевод не найден";
			return;
		}
		
		//transcription
		if ("ts" in translationArray[0])
			transcriptionHTML.innerHTML = "[" +  translationJSON.def[0].ts + "]";
        
		for (var i in translationArray)
		{
			//check if there is translation objects
			if(!("tr" in translationArray[i]) || translationArray[i].tr.length < 1) continue;
			
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
                for (var k = 0; "syn" in singleTranslation[j] && k < singleTranslation[j].syn.length && k < 3; k++)
                    translation += ", " + singleTranslation[j].syn[k].text;
                if (j < singleTranslation.length - 1) translation += ", ";
			}; 
		};
		
		translationHTML.innerHTML = translation;
	};
});