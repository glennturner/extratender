
window.addEvent("domready", function () {
    // Option 1: Use the manifest:
	new FancySettings.initWithManifest(function ( settings ) {
        settings.manifest.saveAccount.addEvent("action", function ( e ) {
			// do something, if necessary in the future
        });
    });
});
