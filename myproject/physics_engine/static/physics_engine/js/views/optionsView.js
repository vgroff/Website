var physicsEngine = physicsEngine || {};

physicsEngine.OptionsView = Backbone.View.extend({

	// Instead of generating a new element, bind to the existing skeleton of
	// the App already present in the HTML.
	el: '#physicsEngineOptions',
	stepping: false,
		
	events: {
	  'click #physicsPlayButton': 'togglePlay',
	  'mousedown #physicsStepButton': 'triggerStep',
	  'mouseup #physicsStepButton': 'triggerStep'
	},

	
	initialize: function() {
		this.$playButton = $('#physicsPlayButton');  
		this.listenTo(this.model, "change", this.render);
	},
	
	render: function() {
		if ((this.model.get("play") === false) && (this.$playButton.html() == "Pause")) {
			this.$playButton.html("Play");
			this.trigger("togglePlay");
		}
		else if ((this.model.get("play")===true) && (this.$playButton.html() == "Play")) {
			this.$playButton.html("Pause");
			this.trigger("togglePlay");
		}
		
	},
	
	togglePlay: function() {
		this.model.togglePlay();
	},
	
	triggerStep: function(evt) {
		if (evt.type === "mousedown") {
			this.stepping = true;
			setTimeout(this.triggerStep.bind(this), physicsEngine.fps*3, {});
		}
		else if (evt.type === "mouseup"){
			this.stepping = false;
		}
		else if (this.stepping) {
			this.trigger("stepAnimation");
			setTimeout(this.triggerStep.bind(this), physicsEngine.fps*3, {});
		}
	},
});

physicsEngine.globalOptions = new physicsEngine.Options();
physicsEngine.optionsView = new physicsEngine.OptionsView({model:physicsEngine.globalOptions });
