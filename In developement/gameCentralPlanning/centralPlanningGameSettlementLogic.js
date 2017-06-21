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

centralPlanningGame.Settlement = function(name, coordinates) {
	this.name = name;
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
	this.wageLevels = [{"0":0}];
	this.citizenWealth = 0;
	this.entrepreneurWealth = 0;
	this.averageWage = 0;
	this.wageStDev = 0;
	this.overallHappiness = new centralPlanningGame.OverallHappiness(this);
	this.happinessFactors = { "Food": new centralPlanningGame.FoodHappiness(this),
							"Savings": new centralPlanningGame.SavingsHappiness(this)};
	var bread = new centralPlanningGame.Bread();
	var farmProduce = new centralPlanningGame.FarmProduce();
	var animalProduce = new centralPlanningGame.AnimalProduce();
	var processedFoods = new centralPlanningGame.ProcessedFoods();
	this.addToReserves( bread );
	this.addToReserves( farmProduce );
	this.addToReserves( animalProduce );
	this.addToReserves( processedFoods );
};

// Add citizens
centralPlanningGame.Settlement.prototype.addCitizens = function(number) {
	this.population += number;
	this.wageLevels["0"] += number;
}

// Things are produced throughout the day
centralPlanningGame.Settlement.prototype.updateSettlement = function() {

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
	this.districts.push(district);
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







