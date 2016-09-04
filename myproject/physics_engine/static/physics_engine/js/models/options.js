var physicsEngine = physicsEngine || {};

physicsEngine.Options = Backbone.Model.extend({

	//~ localStorage: new Backbone.LocalStorage('physEng-Options'),

	defaults: {
		play: false,
	},
	
	togglePlay: function() {
		this.set("play", !this.get("play"));
	},
	
});

physicsEngine.globalOptions = new physicsEngine.Options();
