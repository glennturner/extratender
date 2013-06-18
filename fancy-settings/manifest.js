// SAMPLE
this.manifest = {
    "name": "My Extension",
    "icon": "icon.png",
    "settings": [
        {
            "tab": i18n.get("tender"),
            "group": i18n.get("domain"),
            "name": "domain",
            "type": "text",
            "text": i18n.get("x-characters-tender-domain")
        },
		{
			"tab": i18n.get("tender"),
		    "group": i18n.get("domain"),
		    "name": "Domain Label",
		    "type": "description",
		    "text": i18n.get("domain-label")
		},
		{
           	"tab": i18n.get("tender"),
           	"group": i18n.get("api-key"),
           	"name": "token",
           	"type": "text",
            "masked": true
        },
        {
            "tab": i18n.get("tender"),
            "group": i18n.get("api-key"),
            "name": "API Key Label",
            "type": "description",
            "text": i18n.get("api-key-label")
        },
        {
            "tab": i18n.get("tender"),
            "group": i18n.get("api-key"),
            "name": "saveAccount",
            "type": "button",
			"text": "Save Changes"
        }
	]
};
