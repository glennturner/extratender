// get Tender account information
var account = {};

var keyEvents = {};
chrome.extension.sendRequest(
	{ 						
		action: 'getSettings'
	}, function ( settings ) {
		if ( !settings.domain && !settings.token )  { 
			alert( 'Your Tender account information has not yet been set. Please do so via Window > Extensions.' );
		}

		ET = new ExtraTender( settings );

		// add shortcut handlers
		addWindowKeyEvents();
	}
);

function addWindowKeyEvents() {
	window.addEventListener( 'keydown', addKeyStates );
	window.addEventListener( 'keyup', removeKeyStates );
}

function removeWindowKeyEvents() {
	window.removeEventListener( 'keydown', addKeyStates );
	window.removeEventListener( 'keyup', removeKeyStates );
}

function addKeyStates( e ) {
	var character = String.fromCharCode( e.keyCode );
	
	// shortcuts for the active discussion
	if ( e.ctrlKey && e.metaKey ) {
		// close discussion if confirmed
		if ( character == 'C' ) {
			ET.doDiscussionAction( 'close-confirm' );
		// remove discussion
		} else if ( character == 'R' ) {
			ET.doDiscussionAction( 'delete' );
		// spam discussion
		} else if ( character == 'S' ) {
			ET.doDiscussionAction( 'spam' );
		// jump to single thread
		} else if ( e.keyCode == 190 ) {
			console.log( 'OPEN DISCUSSION' );
		
			ET.openActiveDiscussion();
		}
		
		return;
	// toggle visibility
	} else if ( e.keyCode == 13 && ET.isDiscussion( e.srcElement ) ) {
		ET.toggleDiscussion( e.srcElement );
	}
}

function removeKeyStates( e ) {
	// placeholder
}