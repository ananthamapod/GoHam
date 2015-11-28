/**
Name: textNodes
Description: Identifies the text nodes in an HTML document.
	Implementation is similar to running a breadth-first-search in a graph
	consisting of the DOM element nodes starting at the HTML node
Returns: Array of text Nodes
*/
function textNodes() {
	// Root HTML documents, could be multiple in cases of things like iframes or
	// embedded documents
	var roots = Array.prototype.slice.call(document.getElementsByTagName("html"), 0);
	// Queue that stores nodes to be inspected
	var Q = [];

	var leafNodes = [];
	// Initial population of queue
	roots.forEach(function(root) {
		Q.push(root);
	});

	while(Q.length > 0) {
		var node = Q.shift();
		// Check kind of node
		switch(node.nodeType) {
			// Text node, just what we want. Add node to list
			case Node.TEXT_NODE:
				leafNodes.push(node);
				break;
			// Comment node, do nothing
			case Node.COMMENT_NODE:
				break;
			// If neither, check the descendants
			default:
				// Ignore these types of nodes
				if(node.nodeName.toLowerCase() == "script" ||
					node.nodeName.toLowerCase() == "style" ||
					node.nodeName.toLowerCase() == "iframe") {
					continue;
				} else {
					// Get children
					var children = node.childNodes;
					// For each child, add to queue
					for(var i = 0; i < children.length; i++) {
						Q.push(children[i]);
					}
				}
		}
	}
	return leafNodes;
}

/*#####################DEPRECATED######################*/
function count_sylls(word) {
  word = word.toLowerCase();
  if(word.length <= 3) {
  	return 1;
  }
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');
  return word.match(/[aeiouy]{1,2}/g).length;
}
/*#####################################################*/

function swap(node) {
	var re = /[\s,;.\[\]()"!?]+/;
	var vowels = "AEIOUaeiou";

	var textData = node.data;
	var words = textData.split(re);
	var size = words.length;
	for(var i = 0; i < size; i++) {
		var word = words[i];
		// if the string is empty, you ignore it
		if(word == "") {
			continue;
		}
		// Check first letter for what to do for conversion
		var starter = word[0];
		if(vowels.indexOf(starter) === -1) {
			word = word.slice(1) + starter + "ay";
		} else {
			word += "yay";
		}
		//var numSylls = count_sylls(words[i]);
		// updates words in word list
		words[i] = word;
	}

	// Set the text node to the pig Latin version
	node.data = words.join(' ');
}

/*#####################DEPRECATED######################*/
function findFirstSyll(word, numSylls) {
	if(numSylls == 1) {
		return word.length;
	}
	if(numSylls == 2) {

	}
}
/*#####################################################*/


function main() {
	// Find text nodes
	var leafNodes = textNodes();

	// Convert the text within each text node
	leafNodes.forEach(function(elem,ind,arr) {
		arr[ind] = swap(elem);
	});
}

main();
