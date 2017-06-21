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
	
	this.settlements = [];
	this.stateCoffers = 0;
	
	this.addSettlement("Leningrad", [100,100]);
	demoSettlement = this.settlements[0];
	demoSettlement.population = 100;
	var bread = new centralPlanningGame.Bread();
	var farmProduce = new centralPlanningGame.FarmProduce();
	var processedFoods = new centralPlanningGame.ProcessedFoods();
	//bread.stateOwned = 500;
	//bread.statePrice = 0;
	demoSettlement.addToReserves( bread );
	//farmProduce.privateOwned = 100;
	demoSettlement.addToReserves( farmProduce );
	demoSettlement.reserves["Food"]["Farm Produce"].privatePrice = 10;
	demoSettlement.reserves["Food"]["Bread"].privatePrice = 15;
	//demoSettlement.happinessFactors["Food"].getSpending(10);
	demoSettlement.overallHappiness.getSpending(10, true);
	var district = new centralPlanningGame.District("district1", 150);
	demoSettlement.addDistrict(district);
	var nStripFarms = 4;
	for (var i=0; i < nStripFarms; i++) {
		var stripFarm = new centralPlanningGame.StripFarms(this.date);
		stripFarm.numberWorkers = 20;
		demoSettlement.addBuilding(district, stripFarm);
	}
	var nBakeries = 1;
	for (var i=0; i < nBakeries; i++) {
		var bakery = new centralPlanningGame.SmallBakery(this.date);
		bakery.numberWorkers = 10;
		demoSettlement.addBuilding(district, bakery);
	}
	//demoSettlement.addBuilding(district, gatheringHut);
	this.buildGUI();
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

centralPlanningGame.mainLogic.prototype.updateDaily = function() {
	this.gameDay += 1
	this.dayTime = 0;
	var newDate = new Date(this.date);
	newDate.setDate(newDate.getDate() + 1);
	this.date = newDate;	
	this.updateGUIDaily();
	// Update new average wage, std dev wage etc when jobs handed out
	// Need to sell before wages can be worked out.
	// NOTES:
	// Need to sell
	// So how do we sell? For deliverable goods, would like to iterate over settlements and see what profits can be made selling at current price. 
	// Need to include the penalty for transport, which needs to be worked out. 
	// Industry buys at the end, and can also buy from whichever settlement is selling for cheapest, given the penalty of transport. So industry never sells directly to itself, only ever via the settlements.
	// How would the penalty be worked out? Possible pre-calculate penalties between each settlements with double for loop. What would the monetary value be? I think we need a transport product which is exclusive to companies.
	// Can use a transport industry from another area, then just re-use the penalty. The penalty can be altered by better roads and transport companies etc... But essentially it would need to translate to man hours which would be speed/km.
	// For now, every new settlement has a coordinate system and is connected to our settlements via a straight-line dirt track.
	// ORDER 2:
	// - Local trader buys all local produce at privatePrice using current numberOfWorkers etc... 
	// - Local populace buys locally from trader
	// - Local industry buys it's inputs locally from trader, or tries to and if it can't, adds to an extra demand number
	// - Prices re-calculated? Compare with same reserves yesterday, and consider the extra demand?
	// - Settlements traders trade any surplus reserves between each other - i.e. any daily surplus is sold to places with higher prices, while counting delivery costs. How is this done in practice? Need the delivery peeps but possibly can be done later? Wages calculated such that we break even? Could just be an industry that produces "delivery hours". Could re-calculate (both) local prices after each trade?
	// - Prices re-calculated?
	// - Re-calculate wage/business opportunities? Do on a weekly average to "smoothen" things out !!
	// - Dish out tomorrow's jobs using current wage.
	// - WHAT IF? things like numberOfWorkers and wages only changed weekly. Daily changes are just prices, so that they can be left to even out over the week? Would also allow savings to build up.
	// So for now do the daily update, which is just trader buying from state and private with current workers etc..., populace buying, industry buying and cross-settlement trading (can be semi left till later)
	// Do each industry at once or do by business??!?!?!? Possibly sum over businesses in an industry, store profits by industry and by total private profits? 
	// Remember to separate state and private indsutry too via "ownedBy"
	// How do we do private price versus state price, i.e. if no one is buying state reserves, what happens? Trader shouldnt keep buying it. Maybe trader can just stop buying from state since it cant control price? If there is any private industry force statePrice < privatePrice?
	// If current state reserves and current statePrice > population, stop buying, what if there is no private industry, then price is not relevant?
	// Can we only get profits once produce is sold, not as it is "bought" by a trader? Just thinking of bizzare state-related cases when prices are too high for people to buy? The idea of reserves would then not really make sense?
	// Could do things where we let state supplies build up by setting high price, then drop the price aggressively so people can buy them, giving a win-win situation. Would this be a case of increasing (money) supply without increasing real supply?
	// OR, SELL things at same price they were bought for!!!! i.e. do an average. So we have 2 prices, the current price that the reserves are being sold at and the current price that new produce is being bought for.
	// Not sure if this would be very responsive, i.e. if price bought at drops aggresively, reserves price will not do the same and thus prices will fall further than necessary.
	// Maybe do the average thing but only with state produce? Is it a problem that things might change value in between being bought and sold without the company feeling it? Maybe the company only gets it's income once (private) reserves have been sold.
	// ORDER 3:
	// - Local trader takes all local produce at privatePrice using current numberOfWorkers etc... 
	// - Local populace buys locally from trader and trader pays the money back to the private industry. Assuming locals already sorted by wage?
	// - Local industry buys it's inputs locally from trader, or tries to and if it can't, adds to an extra demand number. Also need to give money back to private industry here.
	// - Prices re-calculated? Compare with same reserves yesterday, and consider the extra demand?
	// - Settlements traders trade any surplus reserves between each other - i.e. any daily surplus is sold to places with higher prices, while counting delivery costs. How is this done in practice? Need the delivery peeps but possibly can be done later? Wages calculated such that we break even? Could just be an industry that produces "delivery hours". Could re-calculate (both) local prices after each trade?
	// - Prices re-calculated?
	// - All entrepreneurs MAKE THE SAME WAGE (for now). They pay themselves from the wealth, making sure they have enough that it keeps growing?
	// If we have traders buying all, what do we do about state prices? e.g. when does the money hit the state coffers? Still want it to keep up with money supply, so perhaps when just when the trader buys.
	// But what if no one is buying the stuff? Could there be an upper limit on reserves
	// STATE PRICES:Instead of fixing a state price, could offer subsidies to consumers. OR allow state price to drop from a baseStatePrice, but not increase!!! i.e. can fix a MAXIMUM state price.
	// Done trader industry selling, wages, pop buying. Now need industry buying, price re-calculations and dishing out jobs (do it daily). for industry buying, need a bakery.
	for (var i in this.settlements) {
		var settlement = this.settlements[i];
		var production = [];
		var reserves = settlement.reserves;
		for (var reserveType in settlement.reserves) {
			for (var reserve in settlement.reserves[reserveType]) {
				var product = settlement.reserves[reserveType][reserve];
				product.dailyProduction = 0;
				product.dailyStateProduction = 0;
				product.dailyPrivateProduction = 0;
				product.dailyExcessDemand = 0;
			}
		}
		// NEW: Want trader to buy from everyone first, then sell.
		// Cycle over industries
		//~ for (industryIndex in settlement.production) {
			
		//~ }	
		settlement.wageLevels = {};
		var unemployed = settlement.population;
		for (industryIndex in settlement.production) {
			var privateDailyIncome = 0;
			var privateDailyWages = 0;
			var industry = settlement.production[industryIndex];
			industry["dailyIncome"] = 0;
			// Cycle over individual businesses, sell stuff and pay out wages, then calculate wage levels and income gaps
			for (businessIndex in industry["buildings"]) {
				var business = industry["buildings"][businessIndex];
				//business.dailyIncome = 0;
				unemployed -= business.numberWorkers;
				var product = business.produce();
				var reserve = reserves[product.type][product.title];
				settlement.addToReserves(product);
				var income = 0;
				if (business.ownedBy === "state") {
					income = product.stateOwned*reserve.statePrice;
					this.stateCoffers += income;
					business.totalUnitsProduced += product.stateOwned;
					business.dailyUnitsProduced = product.stateOwned;
				}
				else {
					income = product.privateOwned*reserve.privatePrice;
					business.totalUnitsProduced += product.privateOwned;
					business.dailyUnitsProduced = product.privateOwned;
				}
				business.totalIncome += income;
				business.dailyIncome = income;
				var wage = business.getWage(business.totalIncome - business.totalExpenses);
				var wageStr = wage.toString();
				business.dailyExpenses = wage*business.numberWorkers;
				business.totalExpenses += wage*business.numberWorkers;
				business.dailyProfits = business.dailyIncome - wage*business.numberWorkers;
				if (business.ownedBy === "private") {
					settlement.entrepreneurWealth += business.dailyIncome - business.dailyExpenses;
				}
				if (settlement.wageLevels[wageStr]) {
					settlement.wageLevels[wageStr] += business.numberWorkers;
				}
				else {
					settlement.wageLevels[wageStr] = business.numberWorkers;
				}
				reserve.totalUnitsProduced += product.stateOwned+product.privateOwned;
				reserve.dailyProduction += product.stateOwned+product.privateOwned;
				reserve.dailyStateProduction += product.stateOwned;
				reserve.dailyPrivateProduction += product.privateOwned;
			}			 
		}
		if (settlement.wageLevels["0"]) {
			settlement.wageLevels[wageStr] += unemployed;
		}
		else {
			settlement.wageLevels["0"] = unemployed;
		}
		var wageArr = [];
		for (var wage in settlement.wageLevels) {
			wageArr.push({"wage": parseFloat(wage), "pop":settlement.wageLevels[wage]});
		}
		wageArr.sort( function(a,b) {
			return a["wage"]-b["wage"];
		});
		//console.log(wageArr, settlement.wageLevels);
		var originalPopulation = settlement.population;
		console.log(settlement.reserves["Food"]["Farm Produce"].privateOwned);
		// Now what? Pay the industries and put that money away, then put savings away. For strip farms, immediately convert profits into wages. Pay tomorrow's wages today.
		for (wageIndex in wageArr) {
			// Given that wageLevels is in ascending order, we get maxHappiness spending, remove the amount needed from the reserves, pay the industry and update the population left.
			var wage = wageArr[wageIndex]["wage"];
			var wagePop = wageArr[wageIndex]["pop"];
			var spending = settlement.overallHappiness.getSpending(wage, true); 
			var moneySaved = 0;
			for (var happinessKeyIndex in spending["keys"]) {
				var happinessType = spending["keys"][happinessKeyIndex];
				if (happinessType !== "Savings") {
					var result = settlement.happinessFactors[happinessType].getSpending(spending["wagesSpent"][happinessKeyIndex]);
					for (keyIndex in result["keys"]) {
						var productName = result["keys"][keyIndex];
						var product = settlement.reserves[happinessType][productName];
						var moneySpent = result["wagesSpent"][keyIndex];
						var amountBought = result["amountBought"][keyIndex];
						var bought = settlement.buyCheapestMaxAmount(product, moneySpent); 
						product.privateOwned -= bought[1]*wagePop;
						product.stateOwned -= bought[0]*wagePop;
						moneySaved += (moneySpent - bought[2])*wagePop;
					}
					console.log(result);
				}
				else {
					var savingsKeyIndex = happinessKeyIndex;
				}
			}
			settlement.citizenWealth += spending["wagesSpent"][savingsKeyIndex]*wagePop + moneySaved;// Make citizen savings
			//console.log(spending, wage);
			settlement.population -= wagePop; // Need to update before this stuff will work
		}
		console.log(settlement.reserves["Food"]["Farm Produce"].privateOwned);
		var production = Object.keys(settlement.production);
		shuffleArray(production); // Allows different industries first access
		for (arrIndex in production) {
			var industryKey = production[arrIndex];
			var industry = settlement.production[industryKey];
			// Cycle over businesses, buying inputs
			for (businessIndex in industry["buildings"]) {
				var business = industry["buildings"][businessIndex];
				var inputs = business.buyInputs(settlement, true);
				for (inputIndex in inputs) {
					var reserve = settlement.reserves[inputs[inputIndex]["input"].type][inputs[inputIndex]["input"].title];
					reserve.dailyExcessDemand += inputs[inputIndex]["excessDemand"];
					console.log(inputs[inputIndex]["excessDemand"]);
				}
			}
		}
		console.log(settlement.reserves["Food"]["Farm Produce"].privateOwned);
		settlement.population = originalPopulation;
		console.log(reserves);
		settlement.printLog();
	}
	console.log("State coffers: ", this.stateCoffers);
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
	this.guiClock = new centralPlanningGame.DisplayGui(this.stage, [0, 600], [180,40], null, null, true, {"text":this.date.toString().slice(4, 15), "textCss": {"font": "20px Arial", "margin-top": "7px"}});
	this.nextDayButton = new centralPlanningGame.ButtonGui(this.stage, [0, 640], [180, 40], this.updateDaily.bind(this), true, {"text": "Next Day"});
	this.intro = new centralPlanningGame.TitleTextGui(this.stage, [50, 80], [300, 200], null, null, true, {"title": "Hello!", "text": "Welcome.", "textCss": {"font": "20px Arial", "margin-top": "7px"}});
};

centralPlanningGame.mainLogic.prototype.updateGUIDaily = function() {
	this.guiClock.updateText(this.date.toString().slice(4, 15));
};


// Each turn is 1/4 day (this should be variable perhaps for larger maps?), then things get done daily and weekly.
// Each day need to check a to-do list i.e. a queue of things to be done, organised chronologically for helpfulness
// Try to do it neural networky
//
// Things that work:
// - Basic GUI
// - Basic happiness (food happiness at least)


// Minimal desired thingys NEW:
// - Basic food happiness is now working. Worth creating an economy around that at first and see how it works.
// - Start with strip farming and wages/prices from that, see how it evolves. Add a bakery in just for the sake of prices/wages, have everyone employed and just evolve it? Bakery also owned by workers I guess.
// - Then make a GUI
// - Have bakery be the first "business", started from citizen savings. Could have different sized bakeries with different production limits and employee numbers.
// - Have blacksmiths produce tools and strip farms buy them (if worth it)
// Current Work:
// Added a bakery to make sure buying works, not sure this is actually working yet. Have a basic price mechanism and test. Do we need to have the jobs mechanism going too? Business with no inputs fires all workers
// Could a business without inputs fire all workers until it has inputs? Think this makes sense. Then GUI!!!!!
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

// Notes for future:
// - Look into caching for improved graphic performance? (not immediately important0
// - Make sure that naming collisions are covered, since this could be a problem.

// NOTES:
// Menus are one level down and OOP when possible
// Can't do timed callbacks easily: would need to change them when the speed is changed. Worth ticking through each GUI in updatestage instead? Could group smaller GUIs into larger ones. Remember, you can do what you want (non-GUI based) in those callbacks! It's all game logic!!


var game = new centralPlanningGame.mainLogic;
