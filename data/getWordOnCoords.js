//return word or null if there were no word on such coords
function getWordOnCoords(node, x, y) {    
    var range = document.createRange();
    range.selectNode(node);
    
    //check if our coords are inside element
    if (coordsInRange(range, x, y) != 0) return null;
    
    //Work with text itself
    if (node.nodeType == document.TEXT_NODE) {
        //split text into words
        var strings = node.nodeValue.split(/[^a-zA-Z0-9]/);
        
        //start and end position of range
        var startOffset = 0;
        var endOffset = 0;

        //check range of every word in node
        for (var i = 0; i < strings.length; i++) {
            endOffset = startOffset + strings[i].length;
            
            //set new range, which is single word
            range.setStart(node, startOffset);
            range.setEnd(node, endOffset);
        
            //if our word is in range, we simply return it
            if (coordsInRange(range, x, y) == 0) {
                var word = range.toString();
                //detach range for optimization
                range.detach();
                return word;
            };
            
            //if we have already passed our coords,
            //but there was no word, return null
            if (coordsInRange(range, x, y) > 0) {
				range.detach();
				return null;
			};

            startOffset = endOffset + 1;      
        };
    }
    else {
        //check every child of our node
        var nodeList = node.childNodes;
        for (var i = 0; i < nodeList.length; i++) {
            //some recursion
            var word = getWordOnCoords(nodeList[i], x, y);
            if (word != null) {
				range.detach();
				return word;
			};
        };
    };
	range.detach();
    return null;
};

//if coords are in range - return 0,
//if coords are before range - return -1,
//if coords are after range - return 1
function coordsInRange(range, x, y) {
    var rect = range.getBoundingClientRect();
    if (rect.top <= y && rect.bottom >= y &&
        rect.left <= x && rect.right >= x)
        return 0;
    if (rect.top > y) 
        return 1;
    return -1;
};