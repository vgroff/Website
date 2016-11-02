var physicsEngine = physicsEngine || {};

physicsEngine.Graphs = Backbone.Collection.extend({

	// Reference to this collection's model.
	model: physicsEngine.Graph,
	name: "Graphs",
	nameModel: "Graph",

	nextId: function() {
	  if ( !this.length ) {
		return 1;
	  }
	  return this.last().get('id') + 1;
	},

	comparator: function( ball ) {
	  return ball.get('id');
	}
});

physicsEngine.graphs = new physicsEngine.Graphs();
