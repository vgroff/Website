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
	//this.openWindows = [];
	this.stateCoffers = 0;
	
	this.addSettlement("Leningrad", [100,100]);
	demoSettlement = this.settlements[0];
	demoSettlement.population = 150;
	var bread = new centralPlanningGame.Bread();
	var farmProduce = new centralPlanningGame.FarmProduce();
	var processedFoods = new centralPlanningGame.ProcessedFoods();
	//bread.stateOwned = 500;
	//bread.statePrice = 0;
	demoSettlement.addToReserves( bread );
	//farmProduce.privateOwned = 100;
	demoSettlement.addToReserves( farmProduce );
	demoSettlement.reserves["Food"]["Farm Produce"].privatePrice = 10;
	demoSettlement.reserves["Food"]["Farm Produce"].privateOwned = 50;
	demoSettlement.reserves["Food"]["Bread"].privatePrice = 15;
	demoSettlement.reserves["Food"]["Bread"].privateOwned = 50;
	demoSettlement.reserves["Food"]["Animal Produce"].privatePrice = 20;
	demoSettlement.reserves["Food"]["Animal Produce"].privateOwned = 50;
	//demoSettlement.happinessFactors["Food"].getSpending(10);
	demoSettlement.overallHappiness.getSpending(10, true);
	var district = new centralPlanningGame.District("Town Center", 150);
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
	var district2 = new centralPlanningGame.District("District 1", 150);
	demoSettlement.addDistrict(district2);
	var nStripFarms = 2;
	for (var i=0; i < nStripFarms; i++) {
		var stripFarm = new centralPlanningGame.StripFarms(this.date);
		stripFarm.numberWorkers = 20;
		demoSettlement.addBuilding(district2, stripFarm);
	}
	var smallCoop = new centralPlanningGame.SmallCoop(this.date);
	smallCoop.numberWorkers = 10;
	demoSettlement.addBuilding(district2, smallCoop);
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

centralPlanningGame.mainLogic.prototype.updateDaily = function() {
	this.gameDay += 1
	this.dayTime = 0;
	var newDate = new Date(this.date);
	newDate.setDate(newDate.getDate() + 1);
	this.date = newDate;	
	// The penalty can be altered by better roads and transport companies etc... But essentially it would need to translate to man hours which would be speed/km.
	// For now, every new settlement has a coordinate system and is connected to our settlements via a straight-line dirt track.
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
	for (var i=0; i < this.settlements.length; i++) {
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
		for (buildingName in settlement.production) {
			var privateDailyIncome = 0;
			var privateDailyWages = 0;
			var industry = settlement.production[buildingName];
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
			//console.log(reserves[product.type][product.title]);		 
		}
		settlement.unemployed = unemployed;
		if (settlement.wageLevels["0"]) {
			settlement.wageLevels["0"] += unemployed;
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
		//console.log(settlement.reserves["Food"]["Farm Produce"].privateOwned);
		var originalPopulation = settlement.population;
		settlement.averageWageDaily = 0;
		settlement.averageHappinessDaily = 0;
		for (var wageIndex=0; wageIndex < wageArr.length; wageIndex++) {
			// Given that wageLevels is in ascending order, we get maxHappiness spending, remove the amount needed from the reserves, pay the industry and update the population left.
			var wage = wageArr[wageIndex]["wage"];
			var wagePop = wageArr[wageIndex]["pop"];
			settlement.averageWageDaily += wage*wagePop/originalPopulation;
			var spending = settlement.overallHappiness.getSpending(wage, true); 
			var moneySaved = 0;
			wageArr[wageIndex]["happinessKeys"] = spending["keys"];
			wageArr[wageIndex]["happinessAmounts"] = [];
			wageArr[wageIndex]["wagesSpent"] = [];
			for (var happinessKeyIndex=0; happinessKeyIndex<spending["keys"].length; happinessKeyIndex++) {
				var happinessType = spending["keys"][happinessKeyIndex];
				if (happinessType !== "Savings") {
					var result = settlement.happinessFactors[happinessType].getSpending(spending["wagesSpent"][happinessKeyIndex]);
					wageArr[wageIndex]["happinessAmounts"].push(result["value"]);
					wageArr[wageIndex][happinessType] = {};
					wageArr[wageIndex][happinessType]["keys"] = result["keys"];
					wageArr[wageIndex][happinessType]["amounts"] = [];
					wageArr[wageIndex][happinessType]["wagesSpent"] = [];
					var totalSpent = 0;
					for (var keyIndex=0; keyIndex<result["keys"].length; keyIndex++) {
						var productName = result["keys"][keyIndex];
						var product = settlement.reserves[happinessType][productName];
						var moneySpent = result["wagesSpent"][keyIndex];
						var amountBought = result["amountBought"][keyIndex];
						var bought = settlement.buyCheapestMaxAmount(product, moneySpent); 
						product.privateOwned -= bought[1]*wagePop;
						product.stateOwned -= bought[0]*wagePop;
						totalSpent += bought[2];
						moneySaved += (moneySpent - bought[2]);
						wageArr[wageIndex][happinessType]["amounts"].push(bought[0]+bought[1])
						wageArr[wageIndex][happinessType]["wagesSpent"].push(bought[2])
					}
					wageArr[wageIndex]["wagesSpent"].push(totalSpent);
					//console.log(result);
				}
				else {
					var savingsKeyIndex = happinessKeyIndex;
					wageArr[wageIndex]["wagesSpent"].push(0);
					wageArr[wageIndex]["happinessAmounts"].push(0);
				}
			}
			var totalSaved  = spending["wagesSpent"][savingsKeyIndex] + moneySaved;
			settlement.citizenWealth += wagePop*totalSaved;// Make citizen savings
			wageArr[wageIndex]["happinessAmounts"][savingsKeyIndex] = settlement.happinessFactors["Savings"].calcHappiness(totalSaved, wage)["value"];
			wageArr[wageIndex]["wagesSpent"][savingsKeyIndex] = totalSaved;
			var overall = settlement.overallHappiness.calcHappiness(wageArr[wageIndex]["happinessAmounts"], wageArr[wageIndex]["happinessKeys"]);
			wageArr[wageIndex]["overallHappiness"] = overall["value"];
			settlement.averageHappinessDaily += overall["value"] * wagePop / originalPopulation;
			// CALCULATE SAVINGS HAPPINESS WITH THINGY REMOVED
			//console.log(spending, wage);
			settlement.population -= wagePop; // Need to update before this stuff will work
		}
		//console.log(wageArr);
		//console.log(settlement.reserves["Food"]["Farm Produce"].privateOwned);
		var production = Object.keys(settlement.production);
		shuffleArray(production); // Allows different industries first access
		for (var arrIndex=0; arrIndex<production.length; arrIndex++) {
			var industryKey = production[arrIndex];
			var industry = settlement.production[industryKey];
			// Cycle over businesses, buying inputs
			for (businessIndex in industry["buildings"]) {
				var business = industry["buildings"][businessIndex];
				var inputs = business.buyInputs(settlement, true);
				for (inputIndex in inputs) {
					var reserve = settlement.reserves[inputs[inputIndex]["input"].type][inputs[inputIndex]["input"].title];
					reserve.dailyExcessDemand += inputs[inputIndex]["excessDemand"];
					//console.log(inputs[inputIndex]["excessDemand"]);
				}
			}
		}
		settlement.population = originalPopulation;
		settlement.wageHappiness = wageArr;
		//console.log(reserves);
		//settlement.printLog();
		settlement.updatePrices();
	}
	//console.log("State coffers: ", this.stateCoffers);
	this.updateGUIDaily();
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
	this.nextDayButton = new centralPlanningGame.ButtonGui(this.stage, [0, 660], [180, 40], this.updateDaily.bind(this), true, {"text": "Next Day"});
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

// Notes for future:
// - Look into caching for improved graphic performance? (not immediately important0
// - Make sure that naming collisions are covered, since this could be a problem.

// COMMENTS FOR WHEN LOOKING BACK:
// - Game is centered around settlements and their traders. Population work jobs at "Production" Buildings to earn a wage, the buildings sell their produce to the trader
// The population then buys products from the trader in order to maximise their "OverallHappiness". The "Production" buildings then buy any inputs they need from the leftover.
// Then prices are re-calculated (atm stilll not done). And then exporting/importing via paying delivery people.
// Then entrepreneurs/citizens will invest every week or changes wages etc...
// Most of the logic is in mainLogic.updateDaily()

var game = new centralPlanningGame.mainLogic;
