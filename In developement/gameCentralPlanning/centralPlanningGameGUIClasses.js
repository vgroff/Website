
centralPlanningGame.SettlementGui = function(container, coord, size, settlement) {
	centralPlanningGame.Gui.call(this, container, coord, size, true, {});
	this.settlement = settlement;
	this.hi = 4;
	var guiTemplate = _.template(
	"<h1 class=\"centralGui\"><%= settlement.name %></h1>\
	<div class=\"centralGui subMenu\">\
		<% for (var i=0; i<guiArr.length; i++) {\
			var gui = guiArr[i]; %>\
			<% if (i === 0) { %>\
				<h3 class=\"centralGui subMenu clicked <%= gui.type %>\"><%= gui.type[0].toUpperCase() + gui.type.slice(1) %></h3>\
			<% } %>\
			<% if (i > 0) { %>\
				<h3 class=\"centralGui subMenu <%= gui.type %>\"><%= gui.type[0].toUpperCase() + gui.type.slice(1) %></h3>\
			<% } %>\
		<% } %>\
	</div>\
	"
	);
	var overviewGUI = new centralPlanningGame.SettlementOverviewGui(settlement);
	var happinessGUI = new centralPlanningGame.SettlementHappinessGui(settlement);
	var buildingsGUI = new centralPlanningGame.SettlementBuildingsGUI(settlement);
	var guiArr = [ overviewGUI, happinessGUI, buildingsGUI ];
	this.subMenuClasses = [overviewGUI.type, happinessGUI.type, buildingsGUI.type]; // WRITE A FOR LOOP FOR THIS!!!!
	var guiHTML = guiTemplate({"settlement":settlement, "guiArr":guiArr});
	this.divJ.html(guiHTML);
	this.subMenus = this.divJ.find("h3.subMenu");
	for (var i=0; i<this.subMenus.length;i++) {
		$(this.subMenus[i]).on("click", this.subMenuClick.bind(this));
		
	}
	this.divJ.append(overviewGUI.divJ);
	this.divJ.append(happinessGUI.divJ);
	this.divJ.append(buildingsGUI.divJ);
	this.divJ.css("max-height", size[1]+"px");
	this.divJ.css("overflow-y", "auto");
}



centralPlanningGame.SettlementGui.prototype = Object.create(centralPlanningGame.Gui.prototype);
// correct the constructor pointer
centralPlanningGame.SettlementGui.prototype.constructor = centralPlanningGame.SettlementGui;

centralPlanningGame.SettlementGui.prototype.subMenuClick = function(e) {
	var prevClickedJ = $(this.divJ.find(".subMenu.clicked")[0]);
	prevClickedJ.removeClass("clicked");
	var newClickedJ = $(e.target);
	newClickedJ.addClass("clicked");
	for (var i in this.subMenuClasses) {
		if (prevClickedJ.hasClass(this.subMenuClasses[i])) {
			var div = this.divJ.find("div."+this.subMenuClasses[i])[0];
			$(div).addClass("hidden");
		}
		if (newClickedJ.hasClass(this.subMenuClasses[i])) {
			var div = this.divJ.find("div."+this.subMenuClasses[i])[0];
			$(div).removeClass("hidden");
		}
	}
};

centralPlanningGame.SettlementGui.prototype.rebuild = function() {
	this.parentContainer.removeChild(this.container);
	this.divH.parentNode.removeChild(this.divH);
	var index = centralPlanningGame.openWindows.indexOf(this);
	return new centralPlanningGame.SettlementGui(this.parentContainer, this.coord, this.size, this.settlement);
};
	
centralPlanningGame.SettlementOverviewGui = function(settlement) {
	this.type = "overview";
	var template = _.template(
	"<p>Population: <%= settlement.population %></p>\
	<p>Unemployed: <%= settlement.unemployed %> (<%= (100*settlement.unemployed/settlement.population).toFixed(2) %>%)</p>\
	<p>Mean Wage: <%= settlement.averageWageDaily.toFixed(2) %></p>\
	<p>Mean Happiness: <%= settlement.averageHappinessDaily.toFixed(3) %></p>\
	<p>Citizen Savings: <%= settlement.citizenWealth.toFixed(0) %></p>\
	"
	);
	this.guiHTML = template({"settlement":settlement, "that":this});
	this.divJ = $("<div class=\"centralGui\"> </div>");
	this.divJ.addClass(this.type);
	this.divJ.append(this.guiHTML);
	var resourcesButton = $("<button>Show Resources</button>");
	resourcesButton.on("click", function() {new centralPlanningGame.SettlementResourcesGui(settlement);} );
	this.divJ.append(resourcesButton);
};

centralPlanningGame.SettlementHappinessGui = function(settlement) {
	this.type = "happiness";
	var wageArr = settlement.wageHappiness;
	this.divJ = $("<div class=\"centralGui hidden\"> </div>");
	this.divJ.addClass(this.type);
	for (var i=0; i < wageArr.length; i++) {
		var result = wageArr[i];
		var div = $("<div class=\"centralGui wageLevelDiv\"> </div>");
		var income    = $("<h5> Total Income: " + (wageArr[i]["savings"]/wageArr[i]["pop"] + wageArr[i]["wage"]).toPrecision(3) + "</h5>");
		var happiness = $("<h5> Happiness: " + wageArr[i]["overallHappiness"].toFixed(3) + "</h5>");
		var citizens  = $("<h5> Citizens: " + wageArr[i]["pop"]+ "</h5>");
		var moreButton = $("<button>More Detail</button>");
		div.append(income);
		div.append(happiness);
		div.append(citizens);
		div.append(moreButton);
		var moreDiv = $("<div></div>");
		moreDiv.addClass("hidden");
		moreButton.on("click", centralPlanningGame.buttonUnhide.bind(this, moreDiv, moreButton) 
		);
		var savingsKeyIndex = 0;
		for (var j=0; j < wageArr[i]["happinessKeys"].length; j++) {
			var happinessKey = wageArr[i]["happinessKeys"][j];
			if ( happinessKey !== "Savings") {
				var happDiv = $("<div></div>");
				happDiv.addClass("happinessLevelDiv");
				happDiv.addClass("centralGui");
				var title = $("<p>" + happinessKey + ": </p>");
				var wagesSpent = $("<p>  Income spent: " + wageArr[i]["wagesSpent"][j].toPrecision(3) + "</p>");
				var happiness = $("<p>  Happiness: " + wageArr[i]["happinessAmounts"][j].toFixed(3) + "</p>");
				var evenMoreButton = $("<button>More Detail</button>");
				title.css("width", "85px");
				wagesSpent.css("width", "180px");
				happiness.css("width", "160px");
				happDiv.append(title);
				happDiv.append(wagesSpent);
				happDiv.append(happiness);
				happDiv.append(evenMoreButton);
				var productsDiv = $("<div></div>");
				productsDiv.addClass("hidden");	
				evenMoreButton.on("click", centralPlanningGame.buttonUnhide.bind(this, productsDiv, evenMoreButton));
				var happiness = wageArr[i][happinessKey];
				for (var k=0; k < happiness["keys"].length; k++) {
					var prodDiv = $("<div></div>");
					prodDiv.addClass("productLevelDiv");
					prodDiv.addClass("centralGui");	
					var title = $("<p>" + happiness["keys"][k] + "</p>");
					var amount = $("<p> Quantity: " + happiness["amounts"][k].toFixed(2) + "</p>");
					var wage = $("<p> Income spent: " + happiness["wagesSpent"][k].toPrecision(3) + "</p>");
					title.css("width", "150px");
					amount.css("width", "170px");
					wage.css("width", "170px");
					prodDiv.append(title);
					prodDiv.append(wage);
					prodDiv.append(amount);
					productsDiv.append(prodDiv);				
				}
				happDiv.append(productsDiv);
				moreDiv.append(happDiv);	
			}
			else {
				savingsKeyIndex = j;
			}
		}
		// Savings always goes at the bottom so buttons are lined up
		var happDiv = $("<div></div>");
		happDiv.addClass("happinessLevelDiv");
		happDiv.addClass("centralGui");
		var happinessKey = wageArr[i]["happinessKeys"][savingsKeyIndex];
		var title = $("<p>" + happinessKey + ": </p>");
		var wagesSpent = $("<p>  Income spent: " + wageArr[i]["wagesSpent"][savingsKeyIndex].toPrecision(3) + "</p>");
		var happiness = $("<p>  Happiness: " + wageArr[i]["happinessAmounts"][savingsKeyIndex].toFixed(3) + "</p>");
		title.css("width", "85px");
		wagesSpent.css("width", "180px");
		happiness.css("width", "160px");
		happDiv.append(title);
		happDiv.append(wagesSpent);
		happDiv.append(happiness);
		moreDiv.append(happDiv);
		var emptyDiv = $("<div></div>");
		div.append(moreDiv);
		this.divJ.append(div);
	}
};


centralPlanningGame.SettlementBuildingsGUI = function(settlement) {
	this.type = "buildings";
	this.divJ = $("<div class=\"centralGui hidden\"> </div>");
	this.divJ.addClass(this.type);
	for (var i=0; i < settlement.districts.length; i++) {
		var district = settlement.districts[i];
		var div = $("<div class=\"centralGui buildingLevelDiv\"></div>");
		var title = $("<h4>" + district.name + "</h4>");
		var size = $("<h5>Size: " + district.sizeUsed + "/" + district.size + "</h5>");
		div.append(title);
		div.append(size);
		var buildingTitle = $("<h5>Building:</h5>");
		var buildingSize = $("<h5>Size:</h5>");
		var buildingOwned = $("<h5>Owned By:</h5>");
		buildingTitle.css("display", "inline-block");
		buildingSize.css("display", "inline-block");
		buildingOwned.css("display", "inline-block");
		buildingTitle.css("width", "140px");
		buildingSize.css("width", "60px");	
		buildingOwned.css("width", "100px");	
		div.append(buildingTitle);
		div.append(buildingSize);
		div.append(buildingOwned);
		for (var j=0; j < district.buildings.length; j++) {
			var buildingDiv = $("<div></div>");
			var building = district.buildings[j];
			var name = $("<p>" + building.title + "</p>");
			var size = $("<p>" + building.size + "</p>");
			var ownedBy = $("<p>" + building.ownedBy + "</p>");
			var more = $("<button>More Stats</button>");
			more.on("click", function(build) { new centralPlanningGame.BuildingGUI(build);}.bind(this, building));
			name.css("width", "140px");
			size.css("width", "60px");
			ownedBy.css("width", "120px");
			more.css("width", "100px");
			name.css("display", "inline-block");
			size.css("display", "inline-block");
			ownedBy.css("display", "inline-block");
			more.css("display", "inline-block");
			buildingDiv.append(name);
			buildingDiv.append(size);
			buildingDiv.append(ownedBy);
			buildingDiv.append(more);
			div.append(buildingDiv);
		}
		this.divJ.append(div);
	}
	//this.divJ.append(div);
}; 

centralPlanningGame.BuildingGUI = function(building) {
	container = centralPlanningGame.stage;
	var coord = [0,0];
	var size = [250, 400];
	centralPlanningGame.Gui.call(this, container, coord, size, true, {});
	//console.log(building, building.maxAvailableJobs);
	var guiTemplate = _.template(
	"<h3 class=\"centralGui\"><%= building.title %></h3>\
	<p class=\"centralGui\">Available Jobs: <%= building.availableJobs %>/<%= building.maxAvailableJobs %></p>\
	<p class=\"centralGui\">Workers: <%= building.numberWorkers %></p>\
	<p class=\"centralGui\">Wage (Today): <%= building.wage %></p>\
	<p class=\"centralGui\">Income (Today): <%= building.dailyIncome %></p>\
	<p class=\"centralGui\">Input Storage: <%= building.inputStorage %></p>\
	"
	);
	var guiHTML = guiTemplate({"building":building});
	this.divJ.html(guiHTML);
}

centralPlanningGame.BuildingGUI.prototype = Object.create(centralPlanningGame.Gui.prototype);
// correct the constructor pointer
centralPlanningGame.BuildingGUI.prototype.constructor = centralPlanningGame.BuildingGUI;


centralPlanningGame.SettlementResourcesGui = function(settlement) {
	this.type = "resources";
	container = centralPlanningGame.stage;
	var coord = [0,0];
	var size = [250, 400];
	centralPlanningGame.Gui.call(this, container, coord, size, true, {});
	this.divJ.addClass(this.type);
	var heading = $("<h3>Resources</h3>");
	this.divJ.append(heading);
	for (var reserveType in settlements.reserves) {
		for (var reserveTitle in settlement.reserves[reserveType] {
			var product = settlement.reserves[reserveType][reserveTitle];
		}
	}
	var closeButton = $("<button>Close</button>");
	closeButton.on("click",function() {this.parentContainer.removeChild(this.container);this.divH.parentNode.removeChild(this.divH);}.bind(this));
	this.divJ.append(closeButton);
}

centralPlanningGame.SettlementResourcesGui.prototype = Object.create(centralPlanningGame.Gui.prototype);
// correct the constructor pointer
centralPlanningGame.SettlementResourcesGui.prototype.constructor = centralPlanningGame.SettlementResourcesGui;


// Hapinness GUI details:

// What do we want on this GUI?
// Can we do it all through raw HTML+JS+JQuery? Possibly, if we use html data, and limit the changes that need to be made. I.e. each day get a report and can take actions, but those actions only take effect overnight, so no changes needed here at least.
// Will need to change things once we get to policy work, where the policy will need to update when we change it. Will have them open a separate GUI and might need to work with ids/classes and html data.
// OVERVIEW:
// Stats such as:
// Mean wage
// Mean happiness
// Num. employed, available jobs
// 
// HAPPINESS:
// Report on happiness from different wage levels, incl. what they bought
//
// ECONOMY:
// Jobs, supply+demand and price, industries, reserves etc...
//
// BUILDINGS:
// Look at buildings by district, but buildings GUI come up in seperate GUI
// 
