
// Todo Router
// ----------

var app = app || {};

var Workspace = Backbone.Router.extend({
	routes:{
	  '*filter': 'filterEdit'
	},

	filterEdit: function( param ) {
	  // Set the current filter to be used
	  if (param) {
		param = param.trim();
	  }
	  app.TodoFilter = param || '';

	  // Trigger a collection filter event, causing hiding/unhiding
	  // of Todo view items
	  app.Todos.trigger('filterEdit');
	}
});

app.TodoRouter = new Workspace();
Backbone.history.start();
