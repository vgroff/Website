centralPlanningGame.mainLogic = function() {
	if (centralPlanningGame.debug === true) {this.debug = true}
	if (this.debug) {console.log("Main Logic Started");}
	
	this.stage = centralPlanningGame.stage;
	this.area = centralPlanningGame.buildAndAddContainer(this.stage);
	
	this.gameDay = 0;
	this.dayTime = 0;
	this.lastGameUpdate = -1;
	this.updatesPerDay = 4;
	this.dayDuration = 1.6; // Duration of one day in seconds
	this.startDate = new Date(1917, 9, 25, 0, 0, 0,0);
	this.startTime = this.startDate.getTime();
	this.date = new Date(this.startDate);
	this.log = true;
	
	this.nationalInflation = [1,1,1];
	
	this.settlements = [];
	//this.openWindows = [];
	this.stateCoffers = 0;
	
	this.addSettlement("Leningrad", [100,100]);
	demoSettlement = this.settlements[0];
	//demoSettlement.population = 160;
	demoSettlement.population = 130;
	var bread = new centralPlanningGame.Bread();
	var farmProduce = new centralPlanningGame.FarmProduce();
	var processedFoods = new centralPlanningGame.ProcessedFoods();
	//bread.stateOwned = 500;
	//bread.statePrice = 0;
	demoSettlement.addToReserves( bread );
	//farmProduce.privateOwned = 100;
	demoSettlement.addToReserves( farmProduce );
	demoSettlement.reserves["Food"]["Farm Produce"].privatePrice = 10;
	demoSettlement.reserves["Food"]["Farm Produce"].privateOwned = demoSettlement.population*30;
	demoSettlement.reserves["Food"]["Bread"].privatePrice = 14;
	demoSettlement.reserves["Food"]["Bread"].privateOwned = demoSettlement.population*30;
	demoSettlement.reserves["Food"]["Animal Produce"].privatePrice = 25;
	demoSettlement.reserves["Food"]["Animal Produce"].privateOwned = demoSettlement.population*30;
	//demoSettlement.happinessFactors["Food"].getSpending(10);
	//demoSettlement.overallHappiness.getSpending(10, true);
	var district = new centralPlanningGame.District("Town Center", 150);
	demoSettlement.addDistrict(district);
	var nStripFarms = 4;
	for (var i=0; i < nStripFarms; i++) {
		var stripFarm = new centralPlanningGame.StripFarms(this.date);
		stripFarm.numberWorkers = 10;
		demoSettlement.addBuilding(district, stripFarm);
	}
	var nBakeries = 2;
	for (var i=0; i < nBakeries; i++) {
		var bakery = new centralPlanningGame.BasicBakery(this.date);
		bakery.numberWorkers = 10;
		demoSettlement.addBuilding(district, bakery);
	}
	var district2 = new centralPlanningGame.District("District 1", 150);
	demoSettlement.addDistrict(district2);
	var nCabins = 6;
	for (var i=0; i < nCabins; i++) {
		var cabin = new centralPlanningGame.HuntingCabin(this.date);
		cabin.numberWorkers = 10;
		demoSettlement.addBuilding(district2, cabin);
	}
	//demoSettlement.addBuilding(district, gatheringHut);
	this.buildGUI();
	this.updateDaily();
	var gui = new centralPlanningGame.SettlementGui(this.stage, [80,60], [650,500], demoSettlement);
	centralPlanningGame.openWindows.push(gui);
	console.log(this.settlements[0]);
	// Add event listeners
	//window.addEventListener("keydown", this.handleKeyDown.bind(this));
	//window.addEventListener("keyup", this.handleKeyUp.bind(this));
	// Draw to screen

	this.fps = 40;
	createjs.Ticker.setFPS(this.fps);	
	this.listener = createjs.Ticker.on("tick", this.updateStage.bind(this));
	this.play();
	if (this.debug) {console.log("Main Logic Setup Finished");}	
}

centralPlanningGame.mainLogic.prototype.play = function() {
	this.paused = false;
};

centralPlanningGame.mainLogic.prototype.pause = function() {
	this.paused = true;
};

centralPlanningGame.mainLogic.prototype.updateStage = function() {
	if (this.paused == false) {
	}
	this.stage.update();
};

centralPlanningGame.mainLogic.prototype.updateDaily = function(guiUpdate) {
	this.gameDay += 1
	this.dayTime = 0;
	var newDate = new Date(this.date);
	newDate.setDate(newDate.getDate() + 1);
	this.date = newDate;	
	var inflationTotal = 0;
	var totalProduced  = 0;
	for (var i=0; i < this.settlements.length; i++) {
		this.settlements[i].updateDaily(guiUpdate);
		this.settlements[i].previousDailyInflation = this.settlements[i].dailyInflation;
		this.settlements[i].dailyInflation = 1;
		inflationTotal += this.settlements[i].meanDailyPriceChange*this.settlements[i].dailyProduction;
		totalProduced  += this.settlements[i].dailyProduction;
	}
	// Inflation dampener (if hard currency desired)
	if (totalProduced > 0) {
		var result = inflationTotal/totalProduced;
		this.nationalInflation[0] = result * (1 - centralPlanningGame.timeModifiers[0]) + this.nationalInflation[0] * centralPlanningGame.timeModifiers[0] ;
		this.nationalInflation[1] = result * (1 - centralPlanningGame.timeModifiers[1]) + this.nationalInflation[1] * centralPlanningGame.timeModifiers[1] ;
		this.nationalInflation[2] = result * (1 - centralPlanningGame.timeModifiers[2]) + this.nationalInflation[2] * centralPlanningGame.timeModifiers[2] ;
		//~ if (this.nationalInflation[1] > 1.005) {
			//~ for (var i=0; i < this.settlements.length; i++) {
				//~ this.settlements[i].dailyInflation = 0.99;
			//~ } 
			//~ console.log("PRICES DROPPED!");
		//~ }
		//~ else if (this.nationalInflation[1] < 0.995) {
			//~ for (var i=0; i < this.settlements.length; i++) {
				//~ this.settlements[i].dailyInflation = 1.01;
			//~ }	
			//~ console.log("PRICES RAISED!");		
		//~ }
	}
	//console.log("Inflation today is " + result + " " + this.nationalInflation, result * centralPlanningGame.timeModifiers[0], this.nationalInflation[1] > 1.01 );
	//console.log("State coffers: ", this.stateCoffers);
	if (guiUpdate) {this.updateGUIDaily();}
};

centralPlanningGame.mainLogic.prototype.skipDays = function(days) {
	for (var i=0; i < days-1; i++) {
		this.updateDaily(false);
	}
	this.updateDaily(true)
};

centralPlanningGame.mainLogic.prototype.addSettlement = function(name, coords) {
	// Make sure name and coords aren't the same/too close to others
	var allowed = true;
	for (settlementIndex in this.settlements) {
		var otherSettlement = this.settlement[settlementIndex];
		if (name === otherSettlement.name) {
			allowed = false;
		}
		else if (distanceTo(coords, otherSettlement.coords) < 15) {
			allowed = false;
		}
	}
	if (allowed === true) {
		var settlement = new centralPlanningGame.Settlement(name, coords);
		this.settlements.push(settlement);
	}
};

centralPlanningGame.mainLogic.prototype.addEvent = function(timeFromStart, event) {
	
};

centralPlanningGame.mainLogic.prototype.buildGUI = function() {
	if (this.debug) {console.log("Building GUI");}
	this.guiClock = new centralPlanningGame.DisplayGui(this.stage, [0, 540], [180,40], null, null, true, {"text":this.date.toString().slice(4, 15), "textCss": {"font": "20px Arial", "margin-top": "7px"}});
	this.nextDayButton = new centralPlanningGame.ButtonGui(this.stage, [0, 600], [180, 40], this.updateDaily.bind(this, true), true, {"text": "Next Day"});
	this.nextWeekButton = new centralPlanningGame.ButtonGui(this.stage, [0, 650], [180, 40], this.skipDays.bind(this, 7), true, {"text": "Next Week"});
	this.nextWeekButton = new centralPlanningGame.ButtonGui(this.stage, [0, 700], [180, 40], this.skipDays.bind(this, 30), true, {"text": "Next Month"});
	//this.intro = new centralPlanningGame.TitleTextGui(this.stage, [50, 80], [300, 200], null, null, true, {"title": "Hello!", "text": "Welcome.", "textCss": {"font": "20px Arial", "margin-top": "7px"}});
};

centralPlanningGame.mainLogic.prototype.updateGUIDaily = function() {
	this.guiClock.updateText(this.date.toString().slice(4, 15));
	var windows = centralPlanningGame.openWindows;
	var newWindows = [];
	for (var i=0; i < windows.length; i++) {
		newWindows.push( windows[i].rebuild() );
	}
	centralPlanningGame.openWindows = newWindows;
};

// Minimal desired thingys NEW:
// - Basic food happiness is now working. Worth creating an economy around that at first and see how it works.
// - Start with strip farming and wages/prices from that, see how it evolves. Add a bakery in just for the sake of prices/wages, have everyone employed and just evolve it? Bakery also owned by workers I guess.
// - Then make a GUI
// - Have bakery be the first "business", started from citizen savings. Could have different sized bakeries with different production limits and employee numbers.
// - Have blacksmiths produce tools and strip farms buy them (if worth it)
// Current Work:
// Currently working on GUI for ease with examining pricing and supply/demand. What if comapanies did the local buying BEFORE citizens, since they improve any goods that they will end up buying? Would still have excess demand, but potentially less reliably. Does citizen happiness also have less control. i.e. what if companies decide to make all farm produce into bread???
// Have a basic price mechanism and test. Do we need to have the jobs mechanism going too? Business with no inputs fires all workers
// Then COMMENT!!!!!!!	
// ORDER:
// - Local trader buys all local produce at privatePrice using current numberOfWorkers etc... 
// - Local populace buys locally from trader
// - Local industry buys it's inputs locally from trader, or tries to and if it can't, adds to an extra demand number
// - Prices re-calculated? Compare with same reserves yesterday, and consider the extra demand?
// - Settlements traders trade any surplus reserves between each other - i.e. any daily surplus is sold to places with higher prices, while counting delivery costs. How is this done in practice? Need the delivery peeps but possibly can be done later? Wages calculated such that we break even? Could just be an industry that produces "delivery hours". Could re-calculate (both) local prices after each trade?
// - Prices re-calculated?
// - Re-calculate wage/business opportunities? Maybe bad idea to do on a daily basis, do on a weekly average to "smoothen" things out.
// - Dish out tomorrow's jobs using current wage.
// - WHAT IF? things like numberOfWorkers and wages only changed weekly. Daily changes are just prices, so that they can be left to even out over the week? Would also allow savings to build up.
// COULD WE JUST HAVE "IMPORTERS" IN THE SAME WAY WE CURRENTLY HAVE "PRODUCTIONBUILDING", CALCULATE TOTAL IMPORTED MINUS SOLD TO GET ITS INCOME/PROFITS AND JUST MAKE SURE WE GIVE IT TO THE RIGHT SETTLEMENT ENTREPRENEURS ETC...
// CHANGE
//  for imports/exports have traders trading with each other. What to do with extra money? Could it go to delivery people? Could the traders just keep it?

// CURRENT WORK ON PRICE STABILISATION:
// We hold 3 days worth of all consumer goods (everything is a direct cosumer good atm). We say that if the current reserve is between 2.5 and 3.5 * pop,
// all we do is try to stabilise it. If it falls under 2.5 or grows over 3.5, we then try and change the supply up/down as aggressively as possible.

// Notes for future:
// - Look into caching for improved graphic performance? (not immediately important0
// - Make sure that naming collisions are covered, since this could be a problem.

// IDEAS FOR POLITICS:
// Could have aswell as an innate political "centre", and a "stability" std.dev for the resulting normal distribution for both left/right economically and liberal/authoritarian. 
// Also similar thing for political apathy of ideology (people who just want a decent life)
// Then we generate 500 voters for each election and make them "vote" depending on how their life is going and how you are respoding to their ideology.
// Depening on political situation, they may vote for 3 different parties besides yourself, who position themselves in opposition to you.
// You can then form a "coalition" with a single one of the 2 parties closest to yourself ideologically. You are then given a year to prove yourself,
// at which point your coalition partners may abandon you and call a new election. If you cannot make up 50% of the vote, you lose.
// The political centre may also move or the ditribution may narrow or widen depending on whether people think you are doing a good job running the country.

// COMMENTS FOR WHEN LOOKING BACK:
// - Game is centered around settlements and their traders. Population work jobs at "Production" Buildings to earn a wage, the buildings sell their produce to the trader
// The population then buys products from the trader in order to maximise their "OverallHappiness". The "Production" buildings then buy any inputs they need from the leftover.
// Then prices are re-calculated (atm stilll not done). And then exporting/importing via paying delivery people.
// Then entrepreneurs/citizens will invest every week or changes wages etc...
// Most of the logic is in mainLogic.updateDaily()

var game = new centralPlanningGame.mainLogic;
