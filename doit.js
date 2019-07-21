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

/*

"Junk" here defined as "any non-alpha Ascii characters".
These will not be considered part of a word to be translated.

Note: Extended ASCII codes and all Unicode characters are not
considered junk and will be included for translation.

*/

function firstJunkPos(word) {
	for (var i = 0; i < word.length; i++) {
		charCode = word.charCodeAt(i);
		if (charCode <= 64
		|| (charCode >= 91 && charCode <= 96)
		|| (charCode >= 123 && charCode <= 127)) {
			return i;
		}
	}
	return -1;
}

function firstNonJunkPos(word) {
	for (var i = 0; i < word.length; i++) {
		charCode = word.charCodeAt(i);
		if (charCode <= 64
		|| (charCode >= 91 && charCode <= 96)
		|| (charCode >= 123 && charCode <= 127)) {
			continue;
		} else {
			return i;
		}
	}
	return -1;
}

function firstUpperPos(camelWord) {
	for (var i = 0; i < camelWord.length; i++) {
		if ( camelWord[i] === camelWord[i].toUpperCase() ) return i;
	}
	return -1;
}

function firstVowelPos(lowerWord) {
	for (var i = 0; i < lowerWord.length; i++) {
		switch (lowerWord.charAt(i)) {
			case 'a':
			case 'e':
			case 'i':
			case 'o':
			case 'u':
				return i;
		}
	}
	return -1;
}

function translate(words) {
	for(var i = 0; i < words.length; i++) {
		var word = words[i];

		// Defaults
		var leadingJunk = "";
		var trailingJunkOrCompoundWords = "";
		var wordCapitalised = false;

		// Preserve and remove any leading junk...
		var wordStart = firstNonJunkPos(word);
		if (wordStart == -1) {
			continue; // Nothing to translate
		} else if (wordStart > 0) {
			leadingJunk = word.slice(0, wordStart);
			word = word.slice(wordStart);
		}

		// Process any futher junk or compound words...
		var junkPos = firstJunkPos(word);
		if (junkPos > -1) {
			// Recursive "translate" call if the word still contains junk...
			trailingJunkOrCompoundWords = translate([word.slice(junkPos)]).join("");
			word = word.slice(0,junkPos);
		}

		// Quality controls...
		if(word === "" ) {
			// String is empty, ignore it.
			words[i] = leadingJunk + trailingJunkOrCompoundWords;
			continue;
		} else if (word.length == 1 && "aiAI".indexOf(word) == -1 ) {
			// Avoid translating non-word single characters (usually icons).
			words[i] = leadingJunk + word + trailingJunkOrCompoundWords;
			continue;
		} else if (word.length > 1 && word == word.toUpperCase()) {
			// Assume any words in FULL CAPS are accronyms and ignore them.
			words[i] = leadingJunk + word + trailingJunkOrCompoundWords;
			continue;
		} else if (word.length > 1 && word.slice(1).toLowerCase() != word.slice(1)){
			// The word is CamelCase, recursion the sucker...
			var wordEnd = firstUpperPos(word.slice(1)) + 1;
			trailingJunkOrCompoundWords = translate([word.slice(wordEnd)]).join("") + trailingJunkOrCompoundWords;
			word = word.slice( 0, wordEnd );
		}
		// Yay! At this point we have something that resembles a single word worth translating.

		// Remove capitalisation
		if ( word[0] != word[0].toLowerCase() ) {
			wordCapitalised = true;
			word = word.toLowerCase();
		}

		// Translate to Pig Latin
		var vowelPos = firstVowelPos(word);
		if (vowelPos === 0) {
			word += "way"; // The rule for leading vowels
		} else if ( vowelPos > 0 ) {
			word = word.slice(vowelPos)+word.slice(0,vowelPos)+"ay"; // Leading consonants rule
		} else {
			word += "ay"; // Rule for no vowels at all (made this rule up just now, Good Enough™)
		}

		// Restore capitalisation
		if (wordCapitalised) {
			word = word[0].toUpperCase() + word.slice(1);
		}

		// Restore junk and/or compound words
		words[i] = leadingJunk + word + trailingJunkOrCompoundWords;
	}
	return words;
}

function swap(node) {
	if (node.parentNode.classList.contains("notranslate")
	||  node.parentNode.getAttribute("translate") == "no"){
		// https://www.w3schools.com/tags/att_global_translate.asp
		return;
	}
	var re = /[\s]+/;
	var textData = node.data;
	var words = textData.split(re);

	words = translate(words);

	// Set the text node to the pig Latin version
	node.data = words.join(' ');
}

function main() {
	// Find text nodes
	var leafNodes = textNodes();

	// Convert the text within each text node
	leafNodes.forEach(function(elem,ind,arr) {
		arr[ind] = swap(elem);
	});
}

main();
