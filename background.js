/*
	fancy-settings is a bit a mystery, due to a complete and total lack of documentation,
	so we're hacking retrieval this way.
*/
window.addEventListener( 'load', function() { 
	chrome.extension.onRequest.addListener( 
		function ( type, sender, callback ) {
			
			var storagePrefix = 'store.settings.'
			var key;
			var pairs = {};
			for ( var k in localStorage ) {
				if ( k.indexOf( storagePrefix ) == 0 ) {
					key = k.substr(storagePrefix.length );
					
					// remove quotes from stored values
					pairs[ key ] = localStorage[ k ].replace( /^\"|\"$/g, '' );
				}
			}
			
			callback( pairs );
		}
	);
});