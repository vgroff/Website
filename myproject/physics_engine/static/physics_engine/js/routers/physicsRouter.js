
var physicsEngine = physicsEngine || {};

var Workspace = Backbone.Router.extend({
	routes:{
	  '*collection': 'setCollection'
	},
	
	initialize: function() {
		
	},

	setCollection: function( param ) {
		  // Set the current filter to be used
		  if (param) {
			param = param.trim();
		  }
		  physicsEngine.editFilter = param || '';

		  // Trigger a collection filter event, causing hiding/unhiding
		  // of Todo view items
		this.trigger('routed');
	}
});

physicsEngine.physicsRouter = new Workspace();
Backbone.history.start();
