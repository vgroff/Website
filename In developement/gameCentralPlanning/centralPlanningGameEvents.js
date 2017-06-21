
centralPlanningGame.Event = function(timeFromStart, name, description, callbacks) {
	this.triggerTime = timeFromStart;	
	this.title = title;
	this.description = description;
	this.callbacks = callbacks;
};

centralPlanningGame.Event.prototype.trigger = function() {
	for (var i=0; i<this.callbacks.length; i++) {
		this.callbacks[i]();
	}
};

centralPlanningGame.DisplayEvent = function(timeFromStart, title, description) {
	centralPlanningGame.Event.call(this, timeFromStart, title, description);
};

// inherit 
centralPlanningGame.DisplayEvent.prototype = Object.create(centralPlanningGame.Event.prototype);
// correct the constructor pointer
centralPlanningGame.DisplayEvent.prototype.constructor = centralPlanningGame.DisplayEvent;



