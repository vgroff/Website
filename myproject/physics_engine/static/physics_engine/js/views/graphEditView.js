var physicsEngine = physicsEngine || {};

physicsEngine.GraphEditChildView = Backbone.View.extend({

	events: {
		"keypress .graphEditBalls": "changeBalls",
		"keypress .graphEditDir": "editDirection",
		"change .graphTypeSelect": "editPlottingType"
	},
	
	template: _.template( $('#graphEditViewTemplate').html() ),
	
	initialize: function() {
		var self = this;
		this.editing = false;
		
		this.render();
		
	},
	
	render: function() {
		this.$el.html( this.template({model:this.model}) ); 
	},
	
	changeBalls: function(evt) {
		if (evt.key === "Enter") {
			var text = $(evt.target).val().trim();
			if ( $(evt.target).val().trim().indexOf(',') > -1 ) { 
				var output = [];
				var array = $(evt.target).val().trim().split(',');
				for (var i=0; i < array.length; i++) {
					var ball = physicsEngine.balls.get(parseInt(array[i]));
					if (ball) {
						output.push(parseInt(array[i]));
					}
				}
				for (var i=0; i<output.length; i++) {
					this.model.set("plottingBalls", output);
				}
				this.render();
			}
			else if ( parseInt(text) ) {
				var ball = physicsEngine.balls.get(parseInt(text));
				if (ball) {
					this.model.set("plottingBalls", [parseInt(text)]);
					this.render();
				}
			}
		}
	},
	
	editDirection: function(evt) {
		if (evt.key === "Enter") {
			var text = $(evt.target).val().trim();
			var num = parseFloat(text);
			if ($(evt.target).hasClass("graphEditDirX")) {
				var dir = this.model.get("plottingDirection");
				dir[0] = num;
				this.model.set("plottingDirection", dir);
			}
			else {
				var dir = this.model.get("plottingDirection");
				dir[1] = num;
				this.model.set("plottingDirection", dir);	
			}
		}
	},
	
	editPlottingType: function(evt) {
		this.model.set("plottingOption", $(evt.target).val());
	},

});

physicsEngine.GraphEditView = Backbone.View.extend({

	events: {
		"click .addNew": "addOne",
	},
	
	template: _.template( $('#editViewTemplate').html() ),
	
	initialize: function() {
		var self = this;
		this.editing = false;
		this.collection = physicsEngine.graphs;
		this.$el.html( this.template({collection: physicsEngine.graphs}) );
		
		this.$el.attr("id", "physicsGraphEditingSection"); 
		
		this.render();
		
		//~ this.listenTo(this.collection, "reset", this.removeChildViews);

		this.listenTo(this.collection, "add", this.renderOne);
	},

	// Adds a model to the collection
	addOne: function() {
		let childModel = new this.collection.model({"id": this.collection.nextId()});
		this.collection.add( childModel );
	},
	
	// Renders a new child model when added to collection
	renderOne: function(model) {
		model.set("name", this.collection.nameModel);
		let childView = new physicsEngine.GraphEditChildView({model:model});
		this.$el.append(childView.$el);	
	},
	
});

