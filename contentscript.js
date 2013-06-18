// get Tender account information
var account = {};

var keyEvents = {};
chrome.extension.sendRequest(
	{ 						
		action: 'getSettings'
	}, function ( settings ) {
					
		if ( !settings.domain || !settings.token ) {
			alert( 'Your Tender account information has not been set yet. Please do so via Window > Extensions.' );
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
	if ( keyEvents.cmd && keyEvents.ctrl && String.fromCharCode(e.keyCode) == 'S' ) {
		ET.toggle();
	} else if ( e.keyCode == 13 && ET.isDiscussion( e.srcElement ) ) {
		ET.toggleDiscussion( e.srcElement );
	}
}

function removeKeyStates( e ) {

}