var physicsEngine = physicsEngine || {};

physicsEngine.EditView = Backbone.View.extend({

	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.

	events: {
		"click .addNew": "addOne",
		"click .toggleEdit": "toggleEditMode",
	},

	
	initialize: function(collection) {
		var self = this;
		this.editing = false;
		
		this.collection = collection;
		this.$el.addClass("physicsEditingSection");
		
		this.editModeButton  = $(document.createElement('button'));
		this.editModeButton.addClass(".toggleEdit");
		this.editModeButton.html( "Toggle Editing Mode" );
		
		collection.forEach( function(childModel) {
			let childView = new physicsEngine.editChildView({model:childModel});
			self.$el.append(childView.$el);
		});		
		
		this.addNewButton  = $(document.createElement('button'));
		this.addNewButton.addClass("addNew");
		this.addNewButton.html( "Add Another ".concat(collection.nameModel) );
		this.$el.append(this.addNewButton);   
		
		this.listenTo(physicsEngine.physicsRouter, "routed", this.toggleVisibility);
		
		this.listenTo(this.collection, "add", this.renderOne);
	},
	
	render: function() {
			
	},
	
	renderOne: function(model) {
		this.addNewButton.remove();
		let childView = new physicsEngine.editChildView({model:model});
		this.$el.append(childView.$el);	
		this.$el.append(this.addNewButton);		
	},
	
	addOne: function() {
		this.collection.add( new this.collection.model({"id": this.collection.nextId()}) );
	},
	
	toggleVisibility: function() {
		if (physicsEngine.editFilter === this.collection.name) {
			console.log("showing ".concat(this.collection.name));
			this.$el.show();
		}
		else {
			this.$el.hide();
		}
	},


});

// this should create different child views depending on which models it gets passed, the views can access all necessary models
