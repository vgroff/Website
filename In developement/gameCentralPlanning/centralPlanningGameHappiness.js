// Do Overall happiness next

// Future notes on happiness:
// - Factor in inertia, don't consider end happiness? Just update current happiness via inertia setting

// NOTES:
// Anything that is technically impossible (e.g. buying negative number from reserves, buying more than there is etc..., is resolved later)
// Do I just want to write a custom solve for the individual happinesses, then use a findMyMaximum for the wage distribution?
// I could write in and satisfy constraints a lot more easily. I know the total wage to spend so I know how I can change individual things w.r.t others.
// Would be recursive. Start with spending all on e.g. meat, then reduce it, and increase all others proprtionally to their wage until local maximum found. 
// Then do the same on each of the others (recursively) e.g. farm products next. Toss away any branches that aren't doing well, and stop when there is no more convergence.
// Possibly seed some points to start with too, possibly including past successes?

// IMPORTANT THING TO RESOLVE:
// - Need to give the computer a decent guess, which means

// EARLY TESTS TO DO:
// - Make sure private/public working fine by setting both prices to 0
// - Turn on wages, try different prices


// Rough notes:
// How to calculate quality as a variety factor? Could calculate quality normally and add a "variety" factor.
// Let's suppose I can get a quality number, e.g. averaging. How do I add in variety? Essentially I want them to be in the same ratio as their quality rating
// How do i achieve that?
// Could I just skew the quality factor I get from averaging?

// TO DO NOW!!!!!!!!!!
// CITIZENS JUST NEED TO DECIDE HOW MUCH OF EACH PRODUCT THEY ARE BUYING, NOT FROM WHOM THEY ARE BUYING IT!!!!! PRICES CAN THEN BE CALCULATED ON THE FLY BY BUYING FROM WHOMEVER IS CHEAPER!!!!
// Food quality

//////////////////////////////////////////////////////////////////
/////////////// GENERAL HAPPINESS FRAMEWORK //////////////////////
//////////////////////////////////////////////////////////////////

centralPlanningGame.Happiness = function(type, settlement) {
	this.type = type;
	this.settlement = settlement;
	this.currentValue = 0.0;
	this.endValue = 0.0;	
	this.inertia = 0;	
	this.causes  = {};
	this.effects = {};
};


centralPlanningGame.Happiness.prototype.findMax = function(productDist, productKeys, productKeyIndex, wagesLeft, amountLeft, wagesToTry, wagesTried)  { // wagesToTry MUST BE IN INCREASING ORDER
	var possibleWages = wagesToTry[productKeyIndex];
	var newFoodsBought = [];
	var newWagesTried = [];
	var currentValue = null;
	// For each possible amount spent on a certain food, if we can afford it, update the array of FoodsBought and go down the recrusion. At the end, calculate happiness and compare to maximum
	for (var i=0; i < possibleWages.length; i++) {
		let moneySpent = possibleWages[i]["wage"];
		//console.log("hi", wagesLeft, moneySpent, i);
		if ( (wagesLeft - moneySpent) > -0.00001) {
			if ( productKeyIndex === (productKeys.length - 1) ) {
				// calculate happiness, compare to existing maximum and update if needed. 
				// make sure maxAmount passed into buyCheapest is the smallest of total/pop and amountLeft
				var amountBought = possibleWages[i]["amount"];
				var newAmountLeft = amountLeft - amountBought;
				if ( newAmountLeft >= 0 ) {
					newProductDist = productDist.slice();
					newProductDist.push(amountBought);	
					var result = this.calcHappiness(newProductDist, productKeys, false);
					//console.log("result", result);
					var happiness = result["value"];
					if (happiness > this.currentMaxima[0]["value"]) {
						//console.log(happiness, this.currentMaxima);
						this.currentMaxima[0]["value"] = happiness;
						this.currentMaxima[0]["amountBought"] = newProductDist;
						newWagesTried = wagesTried.slice();
						newWagesTried.push(moneySpent);
						this.currentMaxima[0]["wagesSpent"] = newWagesTried;
						this.currentMaxima.sort( function(a,b) {
							return a["value"] - b["value"];
						});
					}
				}
			}
			else {
				// go down recursion, updating wagesLeft and amountLeft as you go. Don't pass down any wage savings (shouldnt if we use the above).
				var amountBought = possibleWages[i]["amount"];
				var newAmountLeft = amountLeft - amountBought;
				if ( newAmountLeft >= 0 ) {
					newProductDist = productDist.slice();
					newProductDist.push(amountBought);
					newWagesTried = wagesTried.slice();
					newWagesTried.push(moneySpent);
					this.findMax(newProductDist, productKeys, productKeyIndex+1, wagesLeft - moneySpent, newAmountLeft, wagesToTry, newWagesTried);
				}
			}
		}
		else {
			break;
		}
	}
}

//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
////////////////////OVERALL HAPPINESS/////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

centralPlanningGame.OverallHappiness = function(settlement) {
	centralPlanningGame.Happiness.call(this, "Overall", settlement);
};

// inherit 
centralPlanningGame.OverallHappiness.prototype = Object.create(centralPlanningGame.Happiness.prototype);
// correct the constructor pointer
centralPlanningGame.OverallHappiness.prototype.constructor = centralPlanningGame.OverallHappiness;

centralPlanningGame.OverallHappiness.prototype.calcHappiness = function(happinessAmount, happinessKeys) {
	var totalHappiness = 0;
	var foodWeighting = 10;
	var savingsWeighting = 1;
	var totalWeighting = foodWeighting + savingsWeighting;
	var overallModifier = 1;
	for (var i=0; i<happinessKeys.length; i++) {
		if (happinessKeys[i] === "Food") {
			totalHappiness += happinessAmount[i]*foodWeighting/totalWeighting;
			if (happinessAmount[i] < 0.35) {
				overallModifier *= (happinessAmount[i]/0.35)**2 
			}
		}
		else if (happinessKeys[i] === "Savings") {
			totalHappiness += happinessAmount[i]*savingsWeighting/totalWeighting;
		}
	}
	totalHappiness *= overallModifier;
	return {"value":totalHappiness};
};

// SHOULD ALSO PRE-COMPUTE THESE!!!!!!
centralPlanningGame.OverallHappiness.prototype.getSpending = function(wage, roughEstimate) {
	if (roughEstimate === true) { 
		var numFirstMaxima = 1;
	} 
	else {
		var numFirstMaxima = 2;
	}
	this.currentMaxima = [];
	var happinessKeys = Object.keys(this.settlement.happinessFactors);
	for (var i =0;  i<numFirstMaxima; i++) {
		this.currentMaxima.push({"value": -1, "amountBought":[], "wagesSpent":[], "keys":happinessKeys}); // "amountBought" in this case is the amount of happiness
	}
	var wagesToTry = [];
	// fill in wagesToTry
	var fraction = 20;
	var firstSteps = 20;
	var stepSize = 0;
	for (var i = 0; i < happinessKeys.length; i++) {
		var lastResult = -1;
		wagesToTry.push([]);
		var noIncrease = false;
		stepSize = wage/firstSteps;
		var lastHappiness = -1;
		var happinessName = happinessKeys[i];
		for (var j = 0; j < firstSteps+1; j++) {
			var moneySpent = j*stepSize;
			if (happinessName === "Savings") { 
				if ( Math.abs(wage) > 0.0001 ) {
					var maxima = this.settlement.happinessFactors["Savings"].calcHappiness(moneySpent, wage);
				}
				else {
					var maxima = {"value": 0};
				}				
			}
			else { 
				var maxima = this.settlement.happinessFactors[happinessName].getSpending(moneySpent, true);
			}
			if (maxima["value"] > lastHappiness*1.0005) { 
				lastHappiness = maxima["value"];
			}
			else { break; }
			//bought = this.settlement.buyCheapestMaxAmount(food, moneySpent);
			wagesToTry[i].push({"amount": maxima["value"], "wage": moneySpent});
		}
	}
	// Could dig back through array to find amounts and maxima?
	//console.log("try", wagesToTry);
	this.findMax([], happinessKeys, 0, wage, 1000, wagesToTry, [] );
	//console.log(this.currentMaxima);
	return this.currentMaxima[this.currentMaxima.length - 1];
};


//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
////////////////////////FOOD HAPPINESS////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

centralPlanningGame.FoodHappiness = function(settlement) {
	centralPlanningGame.Happiness.call(this, "Food", settlement);
};

// inherit 
centralPlanningGame.FoodHappiness.prototype = Object.create(centralPlanningGame.Happiness.prototype);
// correct the constructor pointer
centralPlanningGame.FoodHappiness.prototype.constructor = centralPlanningGame.FoodHappiness;

centralPlanningGame.FoodHappiness.prototype.calcHappiness = function(foodsBought, foodKeys, save) {
	var foodReserves = this.settlement.reserves["Food"];
	var quantity = 0;
	var quantitySq = 0;
	var maxQuantity = 0;
	var quality = 0;
	for (var i=0; i<foodsBought.length; i++) {
		let food = foodReserves[foodKeys[i]];
		let foodQuantity = foodsBought[i];
		if (foodQuantity > maxQuantity) {maxQuantity = foodQuantity;}
		quantity += foodQuantity; // this will be 1 at most
		quantitySq += foodQuantity**2;
	}
	// Do stdev's/mean here? lower standard deviation means a higher variety factor
	var meanQuantity = quantity;
	if (quantity !== 0) { 
		// var ratio = quantity/meanQuantity;
		var meanQuantity = quantity/foodsBought.length;
		var quantityVariation = ( (quantitySq/foodsBought.length) - (meanQuantity)**2 ) / (meanQuantity);
		if (quantityVariation < 0.05) {quantityVariation = 0.05;}
		//console.log(meanQuantity, quantityVariation, foodsBought);
		for (var i=0; i<foodsBought.length; i++) {
			let food = foodReserves[foodKeys[i]];
			let foodQuantity = foodsBought[i];
			quality += foodQuantity*food.quality*(1+(0.95-quantityVariation))**2; // This can be over 1
		}
		
	}
	else {
		quality = 0;
	}
	var quantityFactor = quantity**0.75;
	var qualityFactor = quality**1.7;
	if (qualityFactor > 1.1) { qualityFactor = 1.1; } // High quality food means people need to eat a little less
	var foodHappiness = 0.35*quantityFactor + 0.65*quantityFactor*qualityFactor;
	if (foodHappiness > 1) { foodHappiness = 1;}
	//console.log(foodsBought, foodHappiness);
	if (save === true) {
		this.endValue = foodHappiness;
		this.causes["quality"] = qualityFactor;
		this.causes["quantity"] = quantityFactor;
	}
	return {"value":foodHappiness};
};

// Speed this up via a narrowing down technique. Cut the space into hypercubes (bin them on the fly).
// e.g. Do firstSteps = 8, then cut the space in half along every axis. Pick the cube which does best and continue.
// OR, allow for multiple maximums to exist, and take those further. Need to get a way to "save" to wagesToTry used to achieve the maximum. Just pass it down!
// NOTES:
// - Need to do a sorted array for the maximums, because they are currently being overriden by each other. i.e. a new maximum will just override the old one instead of bumping it to second place.
// - Otherwise working ok. Current tactic is to look at getting 1 solution from the first estimate, then run it through the second wageToTry and to get 2 maxima and refine these one last time.
// - I think we need a better way of calculating quality of food too...
// - Get rid of the stepSize = bought[2]/firstSteps;, replace with stepSize = wage/firstSteps - not a good idea.
centralPlanningGame.FoodHappiness.prototype.getSpending = function(wage, roughEstimate)  {
	var foodReserves = this.settlement.reserves["Food"];
	var foodKeys = Object.keys(foodReserves);
	var population = this.settlement.population;
	var nFoods = foodKeys.length;
	var foodsBought = new Array(nFoods-1);
	if (roughEstimate === true) { 
		var numFirstMaxima = 1;
	} 
	else {
		var numFirstMaxima = 2;
	}
	this.currentMaxima = [];
	for (var i =0;  i<numFirstMaxima; i++) {
		this.currentMaxima.push({"value": -1, "amountBought":[], "wagesSpent":[], "keys": foodKeys, "quality":0, "quantity":0});
	}
	var wagesToTry = [];
	// fill in wagesToTry
	var firstSteps = 5;
	var stepSize = 0;
	for (var i = 0; i < foodKeys.length; i++) {
		wagesToTry.push([]);
		var noIncrease = false;
		var food = foodReserves[foodKeys[i]];
		var bought = this.settlement.buyCheapestMaxAmount(food, wage);
		if (bought[0]+bought[1] < 0.000001 ) {
			wagesToTry[i].push({"amount": 0, "wage": 0});
			continue;
		}
		stepSize = bought[2]/firstSteps;
		for (var j = 0; j < firstSteps+1; j++) {
			var moneySpent = j*stepSize;
			if (food.statePrice !== 0 || food.stateOwned === 0) { // if the statePrice is 0 and stateOwned is not equal to 0, this fails
				bought = this.settlement.buyCheapestMaxAmount(food, moneySpent);
				if ( Math.abs(moneySpent - bought[2]) < 0.0001) {
					wagesToTry[i].push({"amount": bought[0] + bought[1], "wage": moneySpent});
				}
				else if (moneySpent > bought[2]) {
					wagesToTry[i].push({"amount": bought[0] + bought[1], "wage": moneySpent});
					break;
				}
			}
			else {
				var amount = j / firstSteps;
				//console.log("HOHO", amount);
				bought = this.settlement.buyCheapestAmount(food, amount, moneySpent);
				if ( Math.abs(moneySpent - bought[2]) < 0.0001) {
					wagesToTry[i].push({"amount": bought[0]+bought[1], "wage": bought[2]});
				}
				else if ( moneySpent > bought[2]) {
					wagesToTry[i].push({"amount": bought[0]+bought[1], "wage": bought[2]});
				}
				if (Math.abs(bought[0]+bought[1] - previousAmount) < 0.0001) {
					break;
				}
				var previousAmount = bought[0]+bought[1];
			}
		}
	}
	var foodsBought = [];
	//console.log(foodKeys);
	//console.time("First findMax");
	this.findMax([], foodKeys, 0, wage, 1, wagesToTry, []);
	//console.log(wagesToTry, this.currentMaxima);
	//console.log(this.currentMaxima);
	//console.timeEnd("First findMax");
	//for (k = 0; k < this.currentMaxima.length; k++) {console.log(this.currentMaxima[k]["value"],this.currentMaxima[k]["foodsBought"],this.currentMaxima[k]["wagesSpent"]);}
	// console.log(this.causes["quantity"], this.causes["quality"]);
	// Need to do it around the previous value, divide previous stepSize*2 by number of steps. so for 1/4, wage is 1 so first time get 0.25, then for second 0.5 allows it to go between 0.5 and 0, so divide it into quarters too.
	// Start at max stepsize/2, so stepSize
	var secondSteps = 8;
	var even = false;
	if (secondSteps % 2 === 0) {
		even = true;
	}
	//var wagesToTry = [];;
	var wagesToTryTotal = []
	for (var k = 0; k < this.currentMaxima.length; k++) {
		var wagesToTry = [];
		wagesToTryTotal.push(wagesToTry);
		for (var i = 0; i < foodKeys.length; i++) {
			wagesToTry.push([]);
			var noIncrease = false;
			var food = foodReserves[foodKeys[i]];
			var bought = this.settlement.buyCheapestMaxAmount(food, wage);
			var firstStepSize = bought[2]/firstSteps;
			stepSize = firstStepSize * 2 / secondSteps;
			var start = this.currentMaxima[k]["wagesSpent"][i] - firstStepSize;
			//console.log(start, even, firstStepSize, this.currentMaxima[k]["wagesSpent"][i]);
			if (start < 0) { 
				if (!even) {
					start = -0.5*stepSize;
				}
				else {
					start = 0;
				}				
			}
			start += 0.5*stepSize;
			for (var j = 0; j < secondSteps; j++) {
				moneySpent = j*stepSize+start;
				//bought = this.settlement.buyCheapestMaxAmount(food, moneySpent);
				if (food.statePrice !== 0 || food.stateOwned === 0) { // if the statePrice is 0 and stateOwned is not equal to 0, this fails
					bought = this.settlement.buyCheapestMaxAmount(food, moneySpent);
					if ( Math.abs(moneySpent - bought[2]) < 0.0001) {
						wagesToTry[i].push({"amount": bought[0] + bought[1], "wage": moneySpent});
					}
					else if (moneySpent > bought[2]) {
						wagesToTry[i].push({"amount": bought[0] + bought[1], "wage": moneySpent});
						break;
					}
				}
				else { // In which case, buy by amount, not wage.
					var firstStepSizeAmount = 1 / firstSteps;
					var start2 = this.currentMaxima[k]["amountBought"][i] - firstStepSizeAmount;
					var stepSize2 = firstStepSizeAmount * 2 / secondSteps;
					if (start2 < 0) { 
						if (!even) {
							start2 = -0.5*stepSize2;
						}
						else {
							start2 = 0;
						}				
					}
					start2 += 0.5*stepSize2;
					var endAmount = start2 + (secondSteps-1)*stepSize2
					if (endAmount > 1) {
						var overFlow =  endAmount - 1;
						start2 -= overFlow;
					}
					var amount = start2 + j * stepSize2;
					bought = this.settlement.buyCheapestAmount(food, amount, moneySpent);
					if ( Math.abs(moneySpent - bought[2]) < 0.0001) {
						wagesToTry[i].push({"amount": bought[0]+bought[1], "wage": bought[2]});
					}
					else if ( moneySpent > bought[2]) {
						wagesToTry[i].push({"amount": bought[0]+bought[1], "wage": bought[2]});
					}
				}
				
			}
		}
		//console.log(wagesToTry);
		//console.time("Second findMax"+k);
		this.findMax([], foodKeys, 0, wage, 1, wagesToTry, []);
		//console.timeEnd("Second findMax"+k);
		//for (l = 0; l < this.currentMaxima.length; l++) {console.log(this.currentMaxima[l]["value"], this.currentMaxima[l]["quantity"], this.currentMaxima[l]["quality"], this.currentMaxima[l]["foodsBought"],this.currentMaxima[k]["wagesSpent"]);}
	}
	for (var k = 0; k < this.currentMaxima.length; k++) {
		//console.log(wagesToTryTotal[k]);
		this.findMax([], foodKeys, 0, wage, 1, wagesToTryTotal[k], []);
	}
	var result = this.currentMaxima[this.currentMaxima.length - 1];
	return result;
}


//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
/////////////////////SAVINGS HAPPINESS////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

centralPlanningGame.SavingsHappiness = function(settlement) {
	centralPlanningGame.Happiness.call(this, "Savings", settlement);
};

// inherit 
centralPlanningGame.SavingsHappiness.prototype = Object.create(centralPlanningGame.Happiness.prototype);
// correct the constructor pointer
centralPlanningGame.SavingsHappiness.prototype.constructor = centralPlanningGame.SavingsHappiness;

centralPlanningGame.SavingsHappiness.prototype.calcHappiness = function(moneySpent, wage) {
	if (wage > 0) {
		var happiness = (moneySpent/wage)**0.8;
		return {"value":happiness};
	}
	else {
		return {"value":0};
	}
}



