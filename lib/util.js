/* utility functions */

// Split class name by whitespace, and return a class names array.
function getClassNamesFromEle ( ele ) {
	return ele.className.split( /\s+/g );
}

String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

String.prototype.lowerCaseFirst = function () {
    return this.charAt(0).toLowerCase() + this.slice(1);
}

String.prototype.urlize = function() {
	var str = this.replace(/[^A-Z^a-z^0-9]/g,'-').toLowerCase();
	return str.replace(/\-{2,}/g,'-');
}

HTMLCollection.prototype.toKeyValuePairs = function() {
	var arr = {};
	for ( var i=0;i<this.length;i++ ) {
		if ( !this[i].name ) {
			continue;
		}
		
		arr[this[i].name] = this[i].value;
	}
	return arr;
}
