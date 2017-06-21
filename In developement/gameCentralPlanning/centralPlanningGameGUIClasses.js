
centralPlanningGame.SettlementGui = function(container, coord, size) {
	centralPlanningGame.Gui.call(this, container, coord, size, {});
	
}

centralPlanningGame.SettlementGui.prototype = Object.create(centralPlanningGame.Gui.prototype);
// correct the constructor pointer
centralPlanningGame.SettlementGui.prototype.constructor = centralPlanningGame.SettlementGui;
