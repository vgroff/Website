// How do citizens decide what they "want"?
// Should be based on a happiness level and some kind of hierarchy of different happinesses to produce an overall happiness level, based on what they can buy that week. Calculate for each wage to produce average happiness.
// The aim would be to maximize the overall happiness level of each wage level for that day (would probs need a chi-sq/rms here). ALWAYS NEED A CURRENT AND "FINAL" HAPPINESS therefore.
// All happiness should be a neural-network type deal, based on what the citizens of each wage level buy. 
// The happinesses could all have inertia, either upwards or downwards. E.g. citizens will buy TVs en mass when they come out, but once everyone has a TV they shoulds spend money on other things without TV happiness dropping much (i.e. increase is fast, decrease is much slower).
// Remember that savings are a thing too, one need not spend all of their money if the increase in happiness is insignificant.  
// Perhaps one unit of anything is enough to fully satisfy a particular need? That way anything bought is between 0 and 1 and production of anything is /citizen need.
// ALWAYS NEED A CURRENT AND "FINAL" HAPPINESS.
// More specifics:
// Food variety, Food quantity and Food liked/tastiness should be 3 different hapinesses between 0 and 1 with different associated multipliers, although they could feel into an artificial "food happiness" at a later time.
// GENERAL BEHAVIOUR:
// - Free things will always be taken if they improve happiness substantially
// FOOD BEHAVIOUR:
// - Variety, quantity, liked (how they relate to their respective happinesses). 
// - Quantity happiness clearly most important, and should be so if quantity drops below 0.5 or so. x**1.3 seems to work quite well. 
// - Variety should increase a lot with increases in variety. x**1.5 seems to work well. Should be second most important
// Perhaps something basic is 0.05 variety, meat can be 0.2. That way 2-3 meats and a few different foods would make 1.
// - Liked should perhaps increase the slowest. 0.5**0.8, and be least important
// Perhaps go with quantity - 0.5, variety - 0.27, liked - 0.23

// POLITICS/STRIKES/WORKERS:
// - Should be based on changes to overall happiness over time, if they notice that their living standards are dropping, workers will demand higher wages, strike and/or rebel against government
// - Should also be based on changes to relative income, if their income starts slipping behind everyone else, they should demand higher wages or strike (if there is little unemployement)

// ECONOMY NOTES:
// - Entrepreneurs could decide on a new industry via weighted (un)happinesses. E.g. if the weightings are food 0.5, housing 0.4, entetainment 0.1, and the happinesses are 0.5, 0.1, 0, then we mutliply weight*(1-happiness) giving  0.25, 0.36, 0.1, then we know that the ratio of importance is basically 2:3:1, then have array like [housing, housing, food, housing, food, entertainment] and go through with a random number generator depending on size of array, such that more important things more likely.
// - Remember that "entreprenurial thinking" is centralised, and then "opportunities" are dished out to them. So the other option is to calculate demand via making supply be 1 unit of everything that is currently in production and also some new/better products.
// - Business opportunities can include "upgrades" of existing places to increase quantities or qualities produced
// - Early on in the game, strip farming acts like one huge "invisible" entrepreneur that cannot upgrade the farms or fire workers
// - The trader always buys from whoever is selling and sells to whomever is buying, i.e. he "creates the money" but he will adjust prices if supply doesnt meet or exceeds demand). He is the "invisible hand of the free market". Prices are local so "supply" refers to reserves+production+imports-exports.
// - The trader will also always import anything that he can if he can do it for lower than the local price, or if there are no reserves of a given product but there is demand at that price.
// - Do I need my own "gold standard" i.e. setting the price of privately-made farm products to 10. Hopefully it would avoid crazy inflation/deflation that I cant control. The trader would also then need to only buy necessary farm products, instead of always buying from everyone since it cannot control supply with prices in this case. An emergency measure perhaps?
// - 2 options for overall calculations: either have 6 "wage brackets" and work out an average for each of them, allowing individual companies control over whether to increase wages or increase work quality to improve employement.
// - Could also have strip farming be a kind of bedrock, i.e. give it a bad but not 0 job quality, so that people will resort to that if job quality is too bad elsewhere.
// - What if we have all entrepreneurs of one city under one name e.g. "bakery owners", since they will all have the same number of workers and same profits etc... Could at least work as a temporary measure for calculating happiness. Then only one etrepreneur effectively. Would need to close places gradually if profits too low,
// - Current birth/death worldwide rates are currently at 1.9% for births, 0.8% for deaths, giving 1.1% growth yearly or 10% every ten years approximately. 
// - For storable items, aim to have a reserve of 100, or some other reasonable number so that you can tell what is going on when there is excess demand (reserves will drop, which they cant do if at 0)

// AIMS:
// Implement eating of food
// Implement strip farming of different produce via a trader, so that monetary exchanges can be made by trader he calculates prices and hands out the money when needed but perhaps isnt a real citizen in-game
// Since all trade is via happiness, likely worth implementing 5-6 happinesses before starting with economics. e.g. 3 food ones, housing quantity and quality, clothing quantitys+quality, healthcare (access*quality)?
// "unahappiness" can essentially be considered demand? i.e. entrepreneurs should at least consider which happiness is lowest and most important before attempting a business venture, as well as using demand to calculate profits.
// Entrepreneurs also need to calculate when they will break even so that they don't bankrupt themselves (so obviously always leave some margin, probably dependant on current expenditure/income/profits).
// The trader always buys from whoever is selling and sells to whomever is buying, i.e. he "creates the money" but he will adjust prices if supply doesnt meet or exceeds demand). He is the "invisible hand of the free market". Prices are local so "supply" refers to reserves+production+imports-exports.
// Calculate demand: make supply be 1 unit of everything that is currently in production and use equation i.e. what WOULD people buy with their wages if all that is currently available was fully stocked?
// Calculate entrepreneur demand: First see how much entrepreneur wants to produce to meet citizen demand, then produce his demand from that, do entrepreneur demand+(citizen demand*number of citizens) to give an overall demand.
// Allow imports too, import prices should be agreed on by entrepreneurs of outside cities and traders based on transportation costs if there is no imports/supply/production currently in city.

// Minimal working thingy:
// - Build happiness framework. General framework or specific? Possibly just extensions of a general one.
// - Happiness for each wage level, so need multiple instances of each happiness per city - Happiness calculated same way each time though!!!
// - Each happiness is basically just a function that returns the happiness given a certain input, i.e. food happiness takes as input the various food quantites/variety/liked multipliers of each type of food, and maximises those. 
// - 2 options:
// - EITHER we calculate all happiness at once, although it is unclear how this would work using cobyla
// - OR we calculate each happiness individually, e.g. spending on food vs food happiness is one function that uses findMaximum with a given amount of money and foods then do a higher-level findMaximum that allocates different wages to each happiness, and finds the maximum of that! Would need low nFunc since this will be expensive otherwise
// - The different wage levels add another complexity here, need to do findMaximum with each. Might be an idea to start with minimal products e.g. just "farm products" for all farms, then perhaps we can later have "high quality farm products" which would be a different product.
// - How are the starting prices decided? Based on import prices.
// - 


// Do job distribution now. Have workers consider actual (long-term) happiness in a certain workplace as well as theoretical happiness they could get (from theoretically produced wage on daily basis). 

centralPlanningGame.Settlement = function(name, coordinates) {
	this.log = true;
	this.name = name;
	this.daysExisted = 0;
	this.population = 0;
	this.entrepreneurs = 0;
	this.landFertility = 1;
	this.reserves = {};
	this.production = {};
	this.dailyStats = {"averageWage":0};
	this.connections = {};
	this.primaryEducation = 0.0;
	this.secondaryEducation = 0.0;
	this.districts = [];
	this.wageLevels = [{}];
	this.wageLevelsArr = [];
	this.savingsLevels = [{"pop":0, "savings":0}];
	this.incomeDeciles = [];
	this.averageWageDaily = 0;
	this.dailyStateIncome = 0;
	this.availableJobs = 0;
	this.businessesEmploying = [];
	this.unpaidWorkers = 0;
	this.jobSeekers = 0;
	this.citizenWealth = 0;
	this.entrepreneurWealth = 0;
	this.averageWage = 0;
	this.wageStDev = 0;
	this.meanDailyPriceChange = 0;
	this.dailyInflation = 1;
	this.previousDailyInflation = 1;
	this.dailyProduction = 0;
	this.overallHappiness = new centralPlanningGame.OverallHappiness(this);
	this.happinessFactors = { "Food": new centralPlanningGame.FoodHappiness(this),
							"Savings": new centralPlanningGame.SavingsHappiness(this)};
	this.wageHappiness = [];
	this.averageHappinessDaily = 0;
	this.stats = {"Available Jobs":0};
	this.politics = {"Socialists":0.5};
	var bread = new centralPlanningGame.Bread();
	var farmProduce = new centralPlanningGame.FarmProduce();
	var animalProduce = new centralPlanningGame.AnimalProduce();
	var processedFoods = new centralPlanningGame.ProcessedFoods();
	this.addToReserves( bread );
	this.addToReserves( farmProduce );
	this.addToReserves( animalProduce );
	//this.addToReserves( processedFoods );
};

centralPlanningGame.Settlement.prototype.updatePrices = function() {
	var optVal = this.population*5;
	var changeRange = this.population * 2;
	var minOptVal = optVal - changeRange;
	var maxOptVal = optVal + changeRange;
	var minChange = 0.001;
	var maxChange = 0.03;
	var marketReactivity = 0.2;
	var toleranceRange = 0.01;
	console.log("\nNewDay");
	this.meanDailyPriceChange = 0;
	var totalProduced = 0;
	// If I have applied inflation between now and previous time, privatePrice will be wrong
	// ALSO, if I applied inflation the time before that, will previousPrice be off too?
	// no increases, start at 10 -> 20 -> 40 for 100% inflation (inflation=2). I just need to clock that 20 = 20*2
	for (var productType in this.reserves) {
		for (var productName in this.reserves[productType]) {
			// If product is increasing by at least 10% of current value or 10% of population value but under 95% of population, keep price
			// If product is increasing at all and over 100% population, lower price
			// If product is decreasing, change.
			var product = this.reserves[productType][productName];
			//~ if (productName === "Farm Produce") {
				//~ console.log(productName+ " reserves are " + (product.privateOwned + product.stateOwned) );
				//~ continue;
			//~ }
			if (product.dailyProduction === 0) {
				product.daysInProduction = 0;
			}
			else {
				product.daysInProduction += 1;
			}
			var reserveGrowth = null;
			var elasticityHalfLife = 0.5;
			var newReserve = product.privateOwned + product.stateOwned;
			var minElasticity = 0.1;
			var minPrice = 1;
			var maxChangeDesired = 0.03;
			if (product.previousReserve !== null && product.previousReserve !== 0) {
				reserveChange = newReserve/product.previousReserve - 1;
				// maxChange dampens the price effects
				var maxResChange = 1;
				if (reserveChange > maxResChange) {
					reserveChange = maxResChange;
				}
				else if (reserveChange < -1 * maxResChange) {
					reserveChange = -maxResChange;
				}
				if (product.previousGrowth !== null && product.previousPrice !== 0) {
					priceChange = product.privatePrice/(product.previousPrice*this.previousDailyInflation) - 1;
					this.meanDailyPriceChange += product.privatePrice/product.previousPrice * product.dailyProduction;
					totalProduced += product.dailyProduction;
					//console.log(this.meanDailyPriceChange, totalProduced, product.dailyProduction);
					if (Math.abs(priceChange) > 0.000001) {
						growthChange = reserveChange - product.previousGrowth;
						// Want a link between how much consumption changes with price changes
						// When price increases, growthChange should be negative and vice-versa
						// Problem now is that a positive change in price can have a positive change in growth change (-11 - (-13) = 2) so both positive
						// I.e. an increase in price slows negative growth rate and increases positive growth rate
						// a decrease in price increases negative growth rate and decreases positive growth rate
						// We want increase with decrease, i.e. we want the negative growth rate slowing to be negative, and an decrease in positive growth rate to be positive
						// Here's what we also want: When price goes up but demand also goes up, elasticity should increase!
						elasticity = (-1) * priceChange / growthChange;
						if (elasticity > 0) {
							elasticity = product.priceElasticity * 3;
						}
						product.priceElasticity = product.priceElasticity * elasticityHalfLife + elasticity * (1 - elasticityHalfLife);
						if (product.priceElasticity > -1 * minElasticity) {
							product.priceElasticity = -1 * minElasticity;
						}
						if (this.log) {console.log("Growth change: " + growthChange.toFixed(2) + "(" + reserveChange +", "+ product.previousGrowth +")" + ", Price change: " + (100*priceChange).toFixed(2) + "%, Elasticity: " + elasticity);}
					}
				}
				product.previousGrowth = reserveChange;
				if (this.log) {console.log(product.title + " reserves are growing at " + (reserveChange*100).toFixed(2) + "%" + "% (P:" + product.privatePrice.toFixed(2) + ", R:" + newReserve.toFixed(2) + ", E:" + product.priceElasticity + ")")};
				//console.log(product.previousReserve, newReserve, reserveChange);
			}
			product.previousPrice = product.privatePrice;
			if (product.previousReserve !== null && product.previousReserve !== 0) {
				if ( (reserveChange < 0 && newReserve < optVal) || (reserveChange > 0 && newReserve > optVal) ) {
					// Balance the price
					if (newReserve < minOptVal || newReserve > maxOptVal) {
						var increase = product.priceElasticity * reserveChange * 1.5;
						var localMaxChange = minChange * ( Math.abs(newReserve - optVal) / changeRange )**20;
					}
					else {
						var increase = product.priceElasticity * reserveChange * marketReactivity;
						var localMaxChange = minChange * ( Math.abs(newReserve - optVal) / changeRange )**2;
					}
					if (localMaxChange > maxChange) {
						localMaxChange = maxChange;
					}
					if (increase > localMaxChange) {
						increase = localMaxChange;
					}
					else if (increase < -localMaxChange) {
						increase = -localMaxChange;
					}
					product.privatePrice = product.privatePrice*(1 + increase); 
					if (this.log) {console.log("Price for " + product.title + " changed by " + (increase*100).toFixed(2) + "% (P:" + product.privatePrice.toFixed(2) + ", R:" + newReserve.toFixed(2) + ", E:" + product.priceElasticity + ")")};
					//console.log(localMaxChange, optVal-changeRange, ( Math.abs(newReserve - optVal) / changeRange ));
				}
			}
			else if (newReserve === 0) {
				product.privatePrice = product.privatePrice * (1 + (maxChange*2) );
				if (this.log) {console.log("Price for " + product.title + " changed by " + (maxChange*2*100).toFixed(2) + "%" + "% (P:" + product.privatePrice.toFixed(2) + ", R:" + newReserve.toFixed(2) + ", E:" + product.priceElasticity + ")")};
			}
			product.previousReserve = newReserve; 
			// The smallest coin is of value 1, nothing can drop below this.
			if (product.privatePrice < 1) {
				product.privatePrice = 1;
			}
			product.privatePrice *= this.dailyInflation;
		}
	}
	this.meanDailyPriceChange = this.meanDailyPriceChange / totalProduced;
	this.dailyProduction = totalProduced;
};


// Add citizens
centralPlanningGame.Settlement.prototype.addCitizens = function(number) {
	this.population += number;
	this.wageLevels["0"] += number;
}

// Things are produced throughout the day
centralPlanningGame.Settlement.prototype.updateDaily = function(log) {
	this.log = log;
	var settlement = this;
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
	// To make the changes both more realistic and more gradual, only 5% of the workforce changes job each turn.
	// These guys are pooled together, and then they cycle over the settlement.wageLevels (previous turns wages) and fill those jobs in.
	// We need to know the total number of unemployed when we start, maybe we do this the turn before. Then we go over the wage array backwards and count the population as we go to correct for errors.
	// If I have a business with spare jobs, keep it in an array. Then sort the array by wage. Then consider the unemployed, then go along the bottom of wageLevel companies, and do the thing from before.
	this.businessesEmploying.sort( function(a,b) {
		return b.getOptimumWage(settlement)-a.getOptimumWage(settlement);
	});
	//console.log(this.businessesEmploying);
	if (settlement.availableJobs > 0) {
		if (settlement.wageLevelsArr[0]["businesses"]) {
			var wageIndex = 0;
			var unemployed = settlement.wageLevelsArr[0]["unemployed"];
			var noIncome = settlement.wageLevelsArr[0]["pop"] - unemployed;
		}
		else {
			var unemployed = settlement.wageLevelsArr[0]["pop"];
			var noIncome = 0;
			var wageIndex = 1;
		}
		var bussIndex2 = 0;
		var done = false;
		for (var bussIndex = 0; bussIndex < settlement.businessesEmploying.length; bussIndex++ ) {
			var business = settlement.businessesEmploying[bussIndex];
			var vacancies = business.availableJobs - business.numberWorkers;
			if (unemployed >= vacancies) {
				unemployed -= vacancies;
				business.numberWorkers = business.availableJobs;
				vacancies = 0;
			}
			else {
				vacancies -= unemployed;
				business.numberWorkers += unemployed;
				unemployed = 0;
				while (vacancies > 0) { 
					var business2 = settlement.wageLevelsArr[wageIndex]["businesses"][bussIndex2];
					if (business.getOptimumWage(settlement) < business2.getOptimumWage(settlement)) { // If wage is smaller at the new place, forget about it.
						done = true;
						break;
					}
					else {
						var arr = [business2.numberWorkers*0.1, business2.availableJobs*0.05];
						var waveringEmployees = 2;
						for (var arrIndex = 0; arrIndex < arr.length; arrIndex++) {
							if (arr[arrIndex] > waveringEmployees) {
								waveringEmployees = arr[arrIndex];
							}
						}
						if (waveringEmployees > business2.numberWorkers) {
							waveringEmployees = business2.numberWorkers;
						}
						if (waveringEmployees >= vacancies) {
							business2.numberWorkers -= vacancies;
							business.numberWorkers = business.availableJobs;
							vacancies = 0;
						}
						else {
							vacancies -= waveringEmployees;
							business2.numberWorkers -= waveringEmployees;
							business.numberWorkers += waveringEmployees;
							bussIndex2++;
							if (bussIndex2 >= settlement.wageLevelsArr[wageIndex]["businesses"].length) {
								done = true;
								break;
							}
						}
					}
				}
			}
			if (done === true) {
				break;
			}
		}
	}
	settlement.wageLevels = {};
	settlement.dailyStateIncome = 0;
	settlement.unpaidWorkers = 0;
	settlement.businessesEmploying = [];
	var unemployed = settlement.population;
	// Distribute the education here
	for (buildingName in settlement.production) {
		var privateDailyIncome = 0;
		var privateDailyWages = 0;
		var industry = settlement.production[buildingName];
		industry["dailyIncome"] = 0;
		// Cycle over individual businesses, sell stuff and pay out wages, then calculate wage levels and income gaps
		for (businessIndex in industry["buildings"]) {
			var business = industry["buildings"][businessIndex];
			console.log(business.title + " has " + business.numberWorkers + " workers");
			//business.dailyIncome = 0;
			unemployed -= business.numberWorkers;
			var freeJobs = business.availableJobs - business.numberWorkers;
			settlement.availableJobs += freeJobs;
			if (freeJobs > 0) {
				settlement.businessesEmploying.push(business);
			}
			var product = business.produce();
			var reserve = reserves[product.type][product.title];
			settlement.addToReserves(product);
			var income = 0;
			if (business.ownedBy === "state") {
				income = product.stateOwned*reserve.statePrice;
				settlement.dailyStateIncome += income;
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
			var wage = business.getWage(business.totalIncome - business.totalExpenses, this.averageWage);
			if (wage < 0.0001) {
				settlement.unpaidWorkers += business.numberWorkers;
			}
			business.stats["wage"][0] = wage * (1 - centralPlanningGame.timeModifiers[0]) + business.stats["wage"][0] * centralPlanningGame.timeModifiers[0];
			business.stats["daysExisted"] += 1;
			//console.log(business.title, product, wage, business.totalIncome - business.totalExpenses);
			var wageStr = wage.toString();
			business.dailyExpenses = wage*business.numberWorkers;
			business.totalExpenses += wage*business.numberWorkers;
			business.dailyProfits = business.dailyIncome - wage*business.numberWorkers;
			if (business.ownedBy === "private") {
				settlement.entrepreneurWealth += business.dailyIncome - business.dailyExpenses;
			}
			if (settlement.wageLevels[wageStr]) {
				settlement.wageLevels[wageStr]["pop"] += business.numberWorkers;
				settlement.wageLevels[wageStr]["popDummy"] += business.numberWorkers;
				settlement.wageLevels[wageStr]["businesses"].push(business);
			}
			else {
				settlement.wageLevels[wageStr] = {"wage": parseFloat(wage), "pop": business.numberWorkers, "popDummy": business.numberWorkers, "savings":0, "businesses":[business] };
			}
			reserve.totalUnitsProduced += product.stateOwned+product.privateOwned;
			reserve.dailyProduction += product.stateOwned+product.privateOwned;
			reserve.dailyStateProduction += product.stateOwned;
			reserve.dailyPrivateProduction += product.privateOwned;
		}	
	}
	settlement.unemployed = unemployed;
	if (settlement.wageLevels["0"]) {
		settlement.wageLevels["0"]["pop"] += unemployed;
		settlement.wageLevels["0"]["popDummy"] += unemployed;
		settlement.wageLevels["0"]["unemployed"] = unemployed;
	}
	else {
		settlement.wageLevels["0"] = {"wage": 0, "pop": unemployed, "popDummy": unemployed, "savings":0 };
	}
	var wageArr = [];
	for (var wage in settlement.wageLevels) {
		wageArr.push(settlement.wageLevels[wage]);
	}
	wageArr.sort( function(a,b) {
		return a["wage"]-b["wage"];
	});
	//console.log(wageArr);
	// Match up savings with wages
	var wageIndex = wageArr.length - 1;
	for (var savingsIndex = this.savingsLevels.length-1; savingsIndex >= 0; savingsIndex--) {
		var savings = this.savingsLevels[savingsIndex]["savings"];
		var pop = this.savingsLevels[savingsIndex]["pop"];
		while (savings > 0.00001) {
			// If more pop in wage array, transfer all savings
			if (wageArr[wageIndex]["popDummy"] > pop) {
				wageArr[wageIndex]["popDummy"] -= pop;
				wageArr[wageIndex]["savings"] += savings;
				savings = 0;
			}
			// else, do proportionally
			else {
				var ratio = wageArr[wageIndex]["popDummy"] / pop;
				wageArr[wageIndex]["savings"] += savings * ratio;
				pop -= wageArr[wageIndex]["popDummy"];
				savings -= savings*ratio;
				wageIndex--;
			}
			if (wageIndex < 0) {
				break;
			}
		}
	}
	console.log(wageArr);
	//console.log(settlement.reserves["Food"]["Farm Produce"].privateOwned);
	var originalPopulation = settlement.population;
	settlement.averageWageDaily = 0;
	settlement.averageHappinessDaily = 0;
	settlement.citizenWealth = 0;
	this.savingsLevels = [];
	for (var wageIndex=0; wageIndex < wageArr.length; wageIndex++) {
		// Given that wageLevels is in ascending order, we get maxHappiness spending, remove the amount needed from the reserves, pay the industry and update the population left.
		var wage = wageArr[wageIndex]["wage"];
		var wagePop = wageArr[wageIndex]["pop"];
		var savings = wageArr[wageIndex]["savings"]/wagePop;
		var income = wage+savings;
		settlement.averageWageDaily += wage*wagePop/originalPopulation;
		var spending = settlement.overallHappiness.getSpending(wage+savings, true); 
		var moneySaved = 0;
		//console.log(spending);
		wageArr[wageIndex]["happinessKeys"] = spending["keys"];
		wageArr[wageIndex]["happinessAmounts"] = [];
		wageArr[wageIndex]["wagesSpent"] = [];
		var totalSpent = 0
		for (var happinessKeyIndex=0; happinessKeyIndex<spending["keys"].length; happinessKeyIndex++) {
			var happinessType = spending["keys"][happinessKeyIndex];
			if (happinessType !== "Savings") {
				var result = settlement.happinessFactors[happinessType].getSpending(spending["wagesSpent"][happinessKeyIndex]);
				//console.log(result);
				wageArr[wageIndex]["happinessAmounts"].push(result["value"]);
				wageArr[wageIndex][happinessType] = {};
				wageArr[wageIndex][happinessType]["keys"] = result["keys"];
				wageArr[wageIndex][happinessType]["amounts"] = [];
				wageArr[wageIndex][happinessType]["wagesSpent"] = [];;
				for (var keyIndex=0; keyIndex<result["keys"].length; keyIndex++) {
					var productName = result["keys"][keyIndex];
					var product = settlement.reserves[happinessType][productName];
					var moneySpent = result["wagesSpent"][keyIndex];
					var amountBought = result["amountBought"][keyIndex];
					var bought = settlement.buyCheapestMaxAmount(product, moneySpent); 
					product.privateOwned -= bought[1]*wagePop;
					product.stateOwned -= bought[0]*wagePop;
					totalSpent += bought[2];
					//moneySaved += (moneySpent - bought[2]);
					wageArr[wageIndex][happinessType]["amounts"].push(bought[0]+bought[1]);
					wageArr[wageIndex][happinessType]["wagesSpent"].push(bought[2]);
				}
				wageArr[wageIndex]["wagesSpent"].push(totalSpent);
				//moneySaved += (spending["wagesSpent"][happinessKeyIndex] - totalSpent);
				//console.log(totalSpent,spending["wagesSpent"][happinessKeyIndex]);
			}
			else {
				var savingsKeyIndex = happinessKeyIndex;
				wageArr[wageIndex]["wagesSpent"].push(0);
				wageArr[wageIndex]["happinessAmounts"].push(0);
			}
		}
		var totalSaved  = income - totalSpent;
		if (totalSaved < 0) { 
			totalSaved = 0;
		}
		this.savingsLevels.push({"savings":totalSaved*wagePop, "pop":wagePop});
		//console.log(this.savingsLevels);
		settlement.citizenWealth += wagePop*totalSaved;// Make citizen savings
		wageArr[wageIndex]["happinessAmounts"][savingsKeyIndex] = settlement.happinessFactors["Savings"].calcHappiness(totalSaved, income)["value"];
		wageArr[wageIndex]["wagesSpent"][savingsKeyIndex] = totalSaved;
		var overall = settlement.overallHappiness.calcHappiness(wageArr[wageIndex]["happinessAmounts"], wageArr[wageIndex]["happinessKeys"]);
		//console.log(overall, wageArr[wageIndex]["wagesSpent"][savingsKeyIndex]);
		wageArr[wageIndex]["overallHappiness"] = overall["value"];
		settlement.averageHappinessDaily += overall["value"] * wagePop / originalPopulation;
		// CALCULATE SAVINGS HAPPINESS WITH THINGY REMOVED
		//console.log(spending, wage);
		settlement.population -= wagePop; // Need to update before this stuff will work
	}
	this.wageLevelsArr = wageArr;
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

centralPlanningGame.Settlement.prototype.addBuilding = function(district, building) {
	if (this.districts.indexOf(district) > -1) {
		district.addBuilding(building);
		if (building instanceof centralPlanningGame.Production) {
			if (this.production[building.title]) {
				this.production[building.title]["buildings"].push(building);
			}
			else {
				this.production[building.title] = {};
				this.production[building.title]["buildings"] = [building];
				this.production[building.title]["dailyIncome"] = 0;
				this.production[building.title]["dailyExpenses"] = 0;
				this.production[building.title]["totalIncome"] = 0;
				this.production[building.title]["totalExpenses"] = 0;
				var product = new building.product();
				var productReserve = this.reserves[product.type][product.title];
				if (productReserve.productionBuildings) { 
					productReserve.productionBuildings.push(building);
				}
				else {
					productReserve.productionBuildings = [building];
				}
			}
		}
	}
};


// Things are bought once a day (allows for reserves to build up, so that demand (from reserves) can be compared to daily production to work out prices)
centralPlanningGame.Settlement.prototype.updateSettlementDaily = function() {
	// Buy what has been produced (then add to reserves) then sell
	// this.addCitizens(Math.floor(Math.random() * 3));;
	for (var i=0; i < this.districts.length; i++) {
		let buildings = this.districts[i].buildings;
		for (var j=0; j < buildings.length; j++) {
			//~ if (buildings[j] instanceof centralPlanningGame.Production) {
				//~ var products = buildings[j].produce();
				//~ for (var k = 0; k < products.length; k++) {
					//~ this.addToReserves(products[k]);
				//~ }
			//~ }
		}
	}
}

// New calculations of entrepreneurs opening new businesses, changing wages, workers changing jobs etc... are made on a weekly basis
centralPlanningGame.Settlement.prototype.updateSettlementWeekly = function() {
	;
}

centralPlanningGame.Settlement.prototype.printLog = function() {
	console.log("Log for ", this.name);
	console.log("Population: ", this.population);
	console.log("Num. Districts: ", this.districts.length);
	console.log("Reserves: ", this.reserves);
	console.log("Districts: ", this.districts);
	console.log("Citizen Wealth: ", this.citizenWealth);
}

centralPlanningGame.Settlement.prototype.addDistrict = function(district) {
	var allowed = true;
	for (var i=0; i < this.districts.length; i++) {
		if (this.districts[i].name === district.name) {
			allowed = false;
		}		
	}
	if (allowed === true) {
		this.districts.push(district);
	}
}

centralPlanningGame.Settlement.prototype.addToReserves = function(produce) {
	if (produce.type in this.reserves) {
		if (produce.title in this.reserves[produce.type]) {
			var productReserves = this.reserves[produce.type][produce.title];
			productReserves.stateOwned += produce.stateOwned; 
			productReserves.privateOwned += produce.privateOwned; 
		}
		else {
			this.reserves[produce.type][produce.title] = produce;
		}
	}
	else {
		this.reserves[produce.type] = {};
		this.reserves[produce.type][produce.title] = produce;
	}
}

// Buy a certain value of a certain produce from both state and private for the cheapest possible price, while making sure the total bought isnt larger than reserve/totalPoopulation or 1.
centralPlanningGame.Settlement.prototype.buyCheapestMaxAmount = function(produce, money) {
	if (produce.type in this.reserves) {
		if (produce.title in this.reserves[produce.type]) {
			if (money > -0.00001) {
				var prices = [produce.statePrice, produce.privatePrice];
				var reserves = [produce.stateOwned/this.population, produce.privateOwned/this.population];
				var finalBought = [0, 0];
				var finalSpent = 0;
				if (produce.statePrice <= produce.privatePrice) { var index = 0;}
				else {var index = 1;}
				var otherIndex = (index + 1) % 2
				if (reserves[index] > 1) { 
					reserves[index] = 1;
					reserves[otherIndex] = 0;
				}
				else {
					var remaining = 1 - reserves[index];
					if (reserves[otherIndex] > remaining) {
						reserves[otherIndex] = remaining
					}
				}
				var cost = reserves[index]*prices[index];
				if ( cost > money) { // If there is not enough money to buy all, buy all that we are allowed and can afford
					finalBought[index] = money / prices[index];
					finalSpent = money;
				}
				else { // Otherwise, buy all and move on
					var moneyLeft = money - cost;
					finalBought[index] = reserves[index];
					var cost = reserves[otherIndex]*prices[otherIndex];
					if ( cost > moneyLeft) { // If there is not enough money to buy all, buy all that we are allowed and can afford
						finalBought[otherIndex] = moneyLeft / prices[otherIndex];
						finalSpent = money;
					}
					else { // If not, buy it all
						finalBought[otherIndex] = reserves[otherIndex];
						finalSpent = (money - moneyLeft) + cost;
					}
				}
				finalBought.push(finalSpent); // final Food and money.
				return finalBought;
			}
			else {
				return [0,0,0];
			}
		}
		else {
			return [0,0,0];
		}
	}
	else {
		return [0,0,0];
	}
}

// Buy a certain amount of a certain produce from both state and private for the cheapest possible price, while making sure the total spent isnt larger than totalWage
centralPlanningGame.Settlement.prototype.buyCheapestAmount = function(produce, amount, money) {
	if (produce.type in this.reserves) {
		if (produce.title in this.reserves[produce.type]) {
			//if (amount > 1) { amount = 1; }
			if (money > -0.01) {
				var prices = [produce.statePrice, produce.privatePrice];
				var reserves = [produce.stateOwned/this.population, produce.privateOwned/this.population];
				var finalBought = [0, 0];
				var finalSpent = 0;
				if (produce.statePrice <= produce.privatePrice) { var index = 0;}
				else {var index = 1;}
				var otherIndex = (index + 1) % 2
				//console.log(index, reserves, reserves[index], amount);
				if (reserves[index] > amount) { // If there is enough in cheapest, buy all if can afford
					if (money >= amount*prices[index]-0.0001) { 
						finalBought[index] = amount;
						finalSpent += amount*prices[index];
					}
					else {
						finalBought[index] = money / prices[index];
						finalSpent += money;
					}
				}
				else { // Otherwise, buy what is available/affordable and move on
					var produceLeft = reserves[index]
					if (money >= produceLeft*prices[index]) { // If there is enough money to buy it all, buy it all then buy what you can from the other
						finalBought[index] = produceLeft;
						money -= produceLeft*prices[index];
						finalSpent += produceLeft*prices[index];
						amount = amount - produceLeft
						if (reserves[otherIndex] > amount) {
							if (money >= amount*prices[otherIndex]-0.0001) {
								finalBought[otherIndex] = amount;
								finalSpent += amount*prices[otherIndex];
							}
							else {
								finalBought[otherIndex] = money / prices[otherIndex];
								finalSpent += money;
							}
						}			
					}
					else { // If not, buy what you can, and now there is no money left
						finalBought[index] = money / prices[index];
						finalSpent = money;
					}
				}
				finalBought.push(finalSpent); // final Food and money.
				return finalBought;
			}
			else {
				return [0,0,0];
			}
		}
		else {
			return [0,0,0];
		}
	}
	else {
		return [0,0,0];
	}
};

// Buy a certain amount of a certain produce from both state and private for the cheapest possible price, while making sure the total spent isnt larger than totalWage
centralPlanningGame.Settlement.prototype.buyCheapestAmountIndustry = function(produce, amount, money) {
	if (produce.type in this.reserves) {
		if (produce.title in this.reserves[produce.type]) {
			//if (amount > 1) { amount = 1; }
			if (money > -0.01) {
				produce = this.reserves[produce.type][produce.title];
				var prices = [produce.statePrice, produce.privatePrice];
				var reserves = [produce.stateOwned, produce.privateOwned];
				var finalBought = [0, 0];
				var finalSpent = 0;
				if (produce.statePrice <= produce.privatePrice) { var index = 0;}
				else {var index = 1;}
				var otherIndex = (index + 1) % 2;
				//console.log(index, reserves, reserves[index], amount);
				if (reserves[index] > amount) { // If there is enough in cheapest, buy all if can afford
					if (money >= amount*prices[index]-0.0001) { 
						finalBought[index] = amount;
						finalSpent += amount*prices[index];
					}
					else {
						finalBought[index] = money / prices[index];
						finalSpent += money;
					}
				}
				else { // Otherwise, buy what is available/affordable and move on
					var produceLeft = reserves[index];
					if (money >= produceLeft*prices[index]) { // If there is enough money to buy it all, buy it all then buy what you can from the other
						finalBought[index] = produceLeft;
						money -= produceLeft*prices[index];
						finalSpent += produceLeft*prices[index];
						amount = amount - produceLeft
						if (reserves[otherIndex] > amount) {
							if (money >= amount*prices[otherIndex]-0.0001) {
								finalBought[otherIndex] = amount;
								finalSpent += amount*prices[otherIndex];
							}
							else {
								finalBought[otherIndex] = money / prices[otherIndex];
								finalSpent += money;
							}
						}	
						else {
							finalBought[otherIndex] = reserves[otherIndex]; // WRONG!!!!!!!!!!!!!!!!!!1
							finalSpent += reserves[otherIndex]*prices[otherIndex];
						}		
					}
					else { // If not, buy what you can, and now there is no money left
						finalBought[index] = money / prices[index];
						finalSpent = money;
					}
				}
				finalBought.push(finalSpent); // final Food and money.
				return finalBought;
			}
			else {
				return [0,0,0];
			}
		}
		else {
			return [0,0,0];
		}
	}
	else {
		return [0,0,0];
	}
}

centralPlanningGame.Connection = function(settlement1, settlement2) {
	this.distance = distanceTo(settlement1.coords, settlement2.coords);
};


centralPlanningGame.District = function(name, size) {
	this.name = name;
	this.size = size;
	this.sizeUsed = 0;
	this.buildings = [];
};

centralPlanningGame.District.prototype.addBuilding = function(building) {
	if (building.size < this.size - this.sizeUsed) {
		this.buildings.push(building);
		this.sizeUsed += building.size;
	}
};

centralPlanningGame.Building = function(title, size, dateBuilt) {
	this.title = title;
	this.size = size;
	this.dateBuilt = dateBuilt;
};

centralPlanningGame.Housing = function(title, size, space, rent) {
	centralPlanningGame.Building.call(this, title, size);
	this.space = space;
	this.rent  = rent;
};

// inherit 
centralPlanningGame.Housing.prototype = Object.create(centralPlanningGame.Building.prototype);
// correct the constructor pointer
centralPlanningGame.Housing.prototype.constructor = centralPlanningGame.Housing;







