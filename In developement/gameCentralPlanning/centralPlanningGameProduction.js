centralPlanningGame.Production = function(title, dateBuilt, size, inputs, product, buildingReq, productionPerWorker, workerEducation, baseJobQuality, 
										maxNumberWorkers, collaborative, ownedBy, upkeep) 
{
	centralPlanningGame.Building.call(this, title, size, dateBuilt);
	this.inputs = inputs;
	this.inputStorage = [];
	this.inputShortage = [];
	for (var input in inputs) {
		this.inputStorage.push(0);
		this.inputShortage.push(0);
	}
	this.product = product;
	this.totalUnitsProduced = 0;
	this.dailyUnitsProduced = 0;
	this.wage = 1;
	this.totalIncome = 0;
	this.totalExpenses = 0;
	this.dailyIncome = 0;
	this.dailyExpenses = 0;
	this.dailyExcessDemand = 0;
	this.dailyProfits = 0;
	this.daysInProduction = 0;
	this.productionPerWorker = productionPerWorker;
	this.workerEducation = workerEducation;
	if (collaborative) {
		this.optimumNumberWorkers = maxNumberWorkers;
	}
	else {
		this.optimumNumberWorkers = null;
	}
	this.maxAvailableJobs = maxNumberWorkers; // For now at least.
	this.availableJobs = maxNumberWorkers;
	this.worker
	this.baseJobQuality = baseJobQuality;
	this.jobQuality = baseJobQuality;
	this.numberWorkers = 0;
	this.ownedBy = ownedBy;
	this.upkeep  = upkeep;
	this.closed = false;
	this.stats = {"wage":[1,1,1], "daysExisted":0};
};

// inherit 
centralPlanningGame.Production.prototype = Object.create(centralPlanningGame.Building.prototype);
// correct the constructor pointer
centralPlanningGame.Production.prototype.constructor = centralPlanningGame.Production;

// HAVE I FUCKED IT ALL UP????? WHAT IS THE MULTIPLIER FOR???!?!?
centralPlanningGame.Production.prototype.produce = function()
{
	var productionPerWorker = this.getProductionPerWorker(this.numberWorkers);
	var totalProduced = productionPerWorker*this.numberWorkers;
	var prod = new this.product();
	if (this.inputs) {
		console.log(this.inputStorage);
		var inputsUsed = 0;
		var finalProduction = 0;
		var produced = 0;
		for (var inputIndex in this.inputs) {
			var inputMultiplier = this.inputs[inputIndex][1];
			var inputNum = this.inputStorage[inputIndex];
			if (inputNum > totalProduced - produced) {
				produced = totalProduced;
				finalProduction += inputNum * inputMultiplier;
				this.inputStorage[inputIndex] -= totalProduced;
				break;
			}
			else {
				produced += inputNum;
				finalProduction += inputNum * inputMultiplier;
				this.inputStorage[inputIndex] = 0;
			}
		}
		console.log(this.inputStorage);
	}
	else {
		finalProduction = totalProduced;
	}
	if (this.ownedBy === "state") {
		prod.stateOwned = finalProduction;
	}
	else {
		prod.privateOwned = finalProduction;
	}
	return prod;
};

centralPlanningGame.Production.prototype.theoreticalProduce = function()
{
	var productionPerWorker = this.getProductionPerWorker(this.numberWorkers);
	var totalProduced = productionPerWorker*this.numberWorkers;
	var prod = new this.product();
	if (this.inputs) {
		var inputsUsed = 0;
		var finalProduction = 0;
		var produced = 0;
		for (var inputIndex in this.inputs) {
			var inputMultiplier = this.inputs[inputIndex][1];
			var inputNum = this.inputStorage[inputIndex];
			if (inputNum > totalProduced - produced) {
				produced = totalProduced;
				finalProduction += inputNum * inputMultiplier;
				break;
			}
			else {
				produced += inputNum;
				finalProduction += inputNum * inputMultiplier;
			}
		}
	}
	else {
		finalProduction = totalProduced;
	}
	if (this.ownedBy === "state") {
		prod.stateOwned = finalProduction;
	}
	else {
		prod.privateOwned = finalProduction;
	}
	return [prod, totalProduced - produced];
};

centralPlanningGame.Production.prototype.getProductionPerWorker = function(numberWorkers)
{
	if (this.optimumNumberWorkers) {
		if (numberWorkers > 0) {
			return this.productionPerWorker*(0.2 + 0.8*(numberWorkers/this.optimumNumberWorkers)**1.6 );
		}
		else {
			return 0;
		}
	}
	else {
		return this.productionPerWorker;
	}
};

centralPlanningGame.Production.prototype.getOptimumWage = function(settlement)
{
	if (this.ownedBy === "workers") {
		var prod = new this.product();
		var outputPrice = settlement.reserves[prod.type][prod.title].privatePrice;
		var costs = 0;
		var numWork = this.numberWorkers;
		if (this.inputs) {
			this.numberWorkers = this.maxNumberWorkers;
			costs += this.buyInputs(settlement, false, true);
		}
		var optimumWage = this.productionPerWorker*outputPrice - costs/this.numberWorkers;
		this.numberWorkers = numWork;
		return optimumWage;
	}
	else {
		return this.wage;
	}
};

centralPlanningGame.Production.prototype.buyInputs = function(settlement, reallyBuy, returnCost) {
	// Now, need outputPrice*production*multiplier - inputPrice*production > wage*numberWorkers, multiplier - inputPrice/outputPrice > wage*numWorkers/outputPrice
	// Now a higher multiplier produces
	if (this.inputs) {
		var numberWorkers = this.numberWorkers;
		this.numberWorkers = this.availableJobs;
		var productionPerWorker = this.getProductionPerWorker(this.numberWorkers);
		var totalProduced = productionPerWorker*this.numberWorkers;
		var inputs = [];
		var prod = new this.product();
		if (this.ownedBy === "state"){
			var outputPrice = settlement.reserves[prod.type][prod.title].statePrice;
		}
		else {
			var outputPrice = settlement.reserves[prod.type][prod.title].privatePrice;
		}
		// I FUCKED THIS ALL UP WITH THE WRONG MULTIPLIER!!!!!!!!!! MULTIPLIER TELLS US HOW MUCH EXTRA IS PRODUCED FROM WHAT IS LOOKED AT
		for (var inputIndex = 0; inputIndex < this.inputs.length; inputIndex++) {
			var inputArr = this.inputs[inputIndex];
			var input = new inputArr[0]();
			var multiplier = inputArr[1];
			var bought = settlement.buyCheapestAmountIndustry(input, totalProduced, 1e99);
			if (outputPrice === 0) { var ratio = multiplier/bought[2];}
			else { var ratio = multiplier*totalProduced*outputPrice - bought[2]; }
			//console.log(this.title, ratio); // profit = income - outgoing = multipler*totalProduced*outgoingPrice - bought[2]
			if (ratio > 0) {// || this.ownedBy!=="workers") {
				inputs.push({"input": input, "inputIndex": inputIndex, "ratio":ratio, "multiplier":multiplier, "bought":bought, "excessDemand":0});
			}
			//~ inputs.push({"input": input, "inputIndex": inputIndex, "ratio":ratio, "multiplier":multiplier, "bought":bought, "excessDemand":0});
		}
		inputs.sort( function(a,b) {
			b["ratio"] - a["ratio"]; // A higher ratio is better
		});
		var produced = 0; 
		var cost = 0;
		// Cycle over the inputs, buying enough to cover production
		for (var inputIndex = 0; inputIndex < this.inputs.length; inputIndex++) {
			// If there is left over production (more stuff to be made)
			var leftOver = totalProduced - produced;
			if (leftOver < 0.0001) {
				break;
			}
			else {
				var obj = inputs[inputIndex];
				var input = obj["input"];
				var multiplier = obj["multiplier"];
				var storage = this.inputStorage[obj["inputIndex"]];
				console.log(leftOver/multiplier, storage);
				// THIS SHIT IS WRONG!!!!!!!!!!!!!!!
				if (leftOver - storage > 0) { // If there is not enough in storage
					leftOver -= storage;
					produced += storage;
					var bought = settlement.buyCheapestAmountIndustry(input, leftOver/multiplier, 1e99);
					produced += (bought[0] + bought[1]);
					var reserve = settlement.reserves[input.type][input.title];
					if (reallyBuy) {
						reserve.stateOwned -= bought[0];
						reserve.privateOwned -= bought[1];
						console.log(this.inputStorage);
						this.inputStorage[obj["inputIndex"]] += bought[0]+bought[1];
						console.log(this.inputStorage);
					}
					cost += bought[2];
					obj["excessDemand"] = leftOver/multiplier - (bought[0]+bought[1]);
				}
				else { // Otherwise, use storage (no need to note this down, get used in produce function)
					produced = totalProduced;
					break
				}
			}
		}
		if (reallyBuy) {
			this.dailyExpenses += cost;
			this.totalExpenses += cost;
		}
		this.numberWorkers = numberWorkers;
		if (returnCost === true) {
			return cost;
		}
		else {
			return inputs;
		}
	}
};

centralPlanningGame.Production.prototype.getTheoreticalIncome = function(numberWorkers, reserves) {
	var prod = new this.product();
	var reserve = reserves[prod.type][prod.title];
	var income = 0;
	var productionPerWorker = this.getProductionPerWorker(numberWorkers);
	var totalProduce = productionPerWorker*this.numberOfWorkers;
	if (ownedBy === "state") {
		
	}
	else {	
		
	}
};


centralPlanningGame.Production.prototype.calculateJobQuality = function(averageWage) {
	if (averageWage === 0) {
		this.jobQuality = 1;
	}
	else {
		var x = (this.wage / averageWave);
		var wageModifier = (1-Math.exp(-7*x**2.3))*x**0.7;
		this.jobQuality = wageModifier*this.baseJobQuality;
	}
};

centralPlanningGame.Production.prototype.getWage = function(profits, meanWage) {
	if (this.ownedBy === "workers") {
		if (profits < 0 || this.numberWorkers === 0) {
			this.wage = 0;
		}
		else {
			this.wage = profits/this.numberWorkers;
		}
		//~ var min = meanWage * 0.01;
		//~ var min2 = this.dailyIncome * 0.01;
		//~ if (min2 < min) {
			//~ min = min2;
		//~ }
		//~ if (this.wage < min) {
			//~ this.wage = min;
			//~ if (profits < -30*this.dailyIncome || this.stats["daysExisted"] > 30) {
				//~ this.closed = true;
				//~ this.numberWorkers = 0;
			//~ }
		//~ }
		//console.log(this.wage, this.title);
		return this.wage;
	}
	else {
		return this.wage;
	}
};

centralPlanningGame.Production.prototype.setJobsGetTheoreticalWage = function(profits, productPrice) {
	if (this.ownedBy === "workers") {
		var theoreticalIncome = 0;
		var bestCase = [0,0];
		for (var i=this.availableJobs; i > 0 ; i--) {
			this.numberWorkers = i;
			theoreticalIncome = this.theoreticalProduce()*productPrice;
			if (theoreticalIncome/this.numberWorkers > bestCase[0]) {
				bestCase[0] = theoreticalIncome/this.numberWorkers;
				bestCase[1] = i;
			}
			else {
				break;
			}
		}
		this.numberWorkers = 0;
		this.availableJobs = bestCase[1];
		return (this.totalIncome-this.totalExpenses)/this.numberWorkers + bestCase; // WTH IS THIS?!?!??!?! DIVISION BY 0?!?!!?!?!??!?!?!
	}
	else {
		return this.wage;
	}
};

centralPlanningGame.StripFarms = function(dateBuilt) 
{
	centralPlanningGame.Production.call(this, "Strip Farms", dateBuilt, 10, null, centralPlanningGame.FarmProduce, null, 0.95, 0, 0.15, 
										20, false, "workers", 0);
	this.availableJobs = 20;
	this.maxAvailableJobs = 20;
}

// inherit 
centralPlanningGame.StripFarms.prototype = Object.create(centralPlanningGame.Production.prototype);
// correct the constructor pointer
centralPlanningGame.StripFarms.prototype.constructor = centralPlanningGame.StripFarms;


centralPlanningGame.WoodCollectors = function(dateBuilt) 
{
	centralPlanningGame.Production.call(this, "Wood Collectors", dateBuilt, 10, null, centralPlanningGame.Wood, null, 1, 0, 0.2, 
										20, false, null, 0);
}

// inherit 
centralPlanningGame.WoodCollectors.prototype = Object.create(centralPlanningGame.Production.prototype);
// correct the constructor pointer
centralPlanningGame.WoodCollectors.prototype.constructor = centralPlanningGame.WoodCollectors;

// need x farm products BasicBakery production, so prod per worker*numworkers gives total prod, so would need 
centralPlanningGame.BasicBakery = function(dateBuilt) 
{																			// Products and multiplier (i.e. 1 farm produce makes 1.1 pieces of bread)
	centralPlanningGame.Production.call(this, "Basic Bakery", dateBuilt, 10, [ [centralPlanningGame.FarmProduce, 1.1] ], centralPlanningGame.Bread, null, 2, 0, 0.15, 
										10, true, "workers", 0);
	this.availableJobs = 10;
	this.maxAvailableJobs = 10;
}

// inherit 
centralPlanningGame.BasicBakery.prototype = Object.create(centralPlanningGame.Production.prototype);
// correct the constructor pointer
centralPlanningGame.BasicBakery.prototype.constructor = centralPlanningGame.BasicBakery;


// need x farm products per production, so prod per worker*numworkers gives total prod, so would need 
centralPlanningGame.HuntingCabin = function(dateBuilt) 
{																			
	centralPlanningGame.Production.call(this, "Hunting Cabin", dateBuilt, 10, null, centralPlanningGame.AnimalProduce, null, 0.85, 0, 0.15, 
										10, false, "workers", 0);
	this.availableJobs = 10;
	this.maxAvailableJobs = 10;
}
// inherit 
centralPlanningGame.HuntingCabin.prototype = Object.create(centralPlanningGame.Production.prototype);
// correct the constructor pointer
centralPlanningGame.HuntingCabin.prototype.constructor = centralPlanningGame.HuntingCabin;









centralPlanningGame.Product = function(title, type) {
	this.title = title;
	this.type = type;
	this.stateOwned = 0;
	this.statePrice = 0;
	this.maxStatePrice = null;
	this.privateOwned = 0;
	this.privatePrice = 1;
	this.productionBuildings = [];
	this.totalProduced = 0;
	this.totalSold = 0;
	this.previousReserve = null;
	this.previousPrice = null;
	this.previousGrowth = null;
	this.priceElasticity = -0.1;
};

centralPlanningGame.Wood = function() {
	centralPlanningGame.Product.call(this, "Wood", "Construction");
};

centralPlanningGame.Food = function(title, baseQuality) {
	centralPlanningGame.Product.call(this, title, "Food");
	this.baseQuality = baseQuality;
	this.quality = baseQuality;
};

// inherit 
centralPlanningGame.Food.prototype = Object.create(centralPlanningGame.Product.prototype);
// correct the constructor pointer
centralPlanningGame.Food.prototype.constructor = centralPlanningGame.Food;

//centralPlanningGame.Farm

centralPlanningGame.Bread = function() {
	centralPlanningGame.Food.call(this, "Bread", 0.22);
};

// inherit 
centralPlanningGame.Bread.prototype = Object.create(centralPlanningGame.Food.prototype);
// correct the constructor pointer
centralPlanningGame.Bread.prototype.constructor = centralPlanningGame.Bread;


centralPlanningGame.FarmProduce = function() {
	centralPlanningGame.Food.call(this, "Farm Produce", 0.15);
};

// inherit 
centralPlanningGame.FarmProduce.prototype = Object.create(centralPlanningGame.Food.prototype);
// correct the constructor pointer
centralPlanningGame.FarmProduce.prototype.constructor = centralPlanningGame.Bread;


centralPlanningGame.AnimalProduce = function() {
	centralPlanningGame.Food.call(this, "Animal Produce", 0.28);
};

// inherit 
centralPlanningGame.AnimalProduce.prototype = Object.create(centralPlanningGame.Food.prototype);
// correct the constructor pointer
centralPlanningGame.AnimalProduce.prototype.constructor = centralPlanningGame.AnimalProduce;


centralPlanningGame.ProcessedFoods = function() {
	centralPlanningGame.Food.call(this, "Processed Food", 0.34);
};

// inherit 
centralPlanningGame.ProcessedFoods.prototype = Object.create(centralPlanningGame.Food.prototype);
// correct the constructor pointer
centralPlanningGame.ProcessedFoods.prototype.constructor = centralPlanningGame.ProcessedFoods;
