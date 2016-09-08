var physicsEngine = physicsEngine || {};

physicsEngine.ContainerView = Backbone.View.extend({
	
	template: _.template( $('#containerTemplate').html() ),

	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.

	events: {
		"keypress .editAttr": "editModelAttr",
		"click .toggleAttr": "toggleModelAttr",
	},

	
	initialize: function() {
		this.period = 30;
		this.iteration = 0;
		this.$el.append(this.template( $.extend({}, this.model.attributes, {"containerId": this.model.get("container").get("id")}) )) ;
		this.listenTo(this.model, "change", this.render);
	},
	
	render: function() {
		if (this.iteration === this.period) {
			this.iteration = 0;
			this.$el.empty();
			this.$el.append( this.template( $.extend({}, this.model.attributes, {"containerId": this.model.get("container").get("id")}) ) );
		}
		this.iteration++;	
	},
	
	forceRender: function() {
		this.iteration = this.period;
		this.render();
	},
	
	editModelAttr: function(evt) {
		if (evt.key === "Enter") {
			this.model.set($(evt.target).attr("data-attr"), parseFloat( $(evt.target).val().trim() ));
			this.forceRender();
		}
	},
	
	toggleModelAttr: function(evt) {
		var attr = $(evt.target).attr("data-attr");
		this.model.set(attr,  !this.model.get(attr));
		this.forceRender();
	},

});

