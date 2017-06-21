centralPlanningGame.Production = function(title, dateBuilt, size, inputs, product, buildingReq, productionPerWorker, workerEducation, baseJobQuality, 
										optimumNumberWorkers, ownedBy, upkeep) 
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
	this.wage = 0;
	this.totalIncome = 0;
	this.totalExpenses = 0;
	this.dailyIncome = 0;
	this.dailyExpenses = 0;
	this.dailyExcessDemand = 0;
	this.dailyProfits = 0;
	this.productionPerWorker = productionPerWorker;
	this.workerEducation = workerEducation;
	this.optimumNumberWorkers = optimumNumberWorkers;
	this.maxAvailableJobs = optimumNumberWorkers; // For now at least.
	this.availableJobs = optimumNumberWorkers;
	this.employees = 0;
	this.baseJobQuality = baseJobQuality;
	this.jobQuality = baseJobQuality;
	this.numberWorkers = 0;
	this.ownedBy = ownedBy;
	this.upkeep  = upkeep;
};

// inherit 
centralPlanningGame.Production.prototype = Object.create(centralPlanningGame.Building.prototype);
// correct the constructor pointer
centralPlanningGame.Production.prototype.constructor = centralPlanningGame.Production;

centralPlanningGame.Production.prototype.produce = function()
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
				this.inputStorage[inputIndex] -= totalProduced;
				break;
			}
			else {
				produced += inputNum;
				finalProduction += inputNum * inputMultiplier;
				this.inputStorage[inputIndex] = 0;
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
		return this.productionPerWorker*(numberWorkers/this.optimumNumberWorkers)**1.6;
	}
	else {
		return this.productionPerWorker;
	}
};

centralPlanningGame.Production.prototype.buyInputs = function(settlement, reallyBuy) {
	// Now, need outputPrice*production*multiplier - inputPrice*production > wage*numberWorkers, multiplier - inputPrice/outputPrice > wage*numWorkers/outputPrice
	// Now a higher multiplier produces
	var numberWorkers = this.numberWorkers;
	this.numberWorkers = this.availableJobs;
	var productionPerWorker = this.getProductionPerWorker(this.numberWorkers);
	var totalProduced = productionPerWorker*this.numberWorkers;
	var inputs = [];
	var prod = new this.product();
	var outputPrice = settlement.reserves[prod.type][prod.title].privatePrice;
	for (var inputIndex in this.inputs) {
		var inputArr = this.inputs[inputIndex];
		var input = new inputArr[0]();
		var multiplier = inputArr[1];
		var bought = settlement.buyCheapestAmountIndustry(input, totalProduced, 1e99);
		var ratio = multiplier - bought[2]/outputPrice;
		inputs.push({"input": input, "inputIndex": inputIndex, "ratio":ratio, "multiplier":multiplier, "bought":bought, "excessDemand":0});
	}
	inputs.sort( function(a,b) {
		a["ratio"] - b["ratio"]; // A low ratio is better
	});
	var produced = 0; 
	var cost = 0;
	for (var inputIndex in inputs) {
		var leftOver = totalProduced - produced;
		if (leftOver < 0.0001) {
			break;
		}
		else {
			var obj = inputs[inputIndex];
			var input = obj["input"];
			var multiplier = input["multiplier"];
			var storage = this.inputStorage[obj["inputIndex"]];
			if (leftOver - storage > 0) {
				leftOver -= storage;
				produced += storage;
				var bought = settlement.buyCheapestAmountIndustry(input, leftOver, 1e99);
				produced += (bought[0] + bought[1]);
				var reserve = settlement.reserves[input.type][input.title];
				if (reallyBuy) {
					reserve.stateOwned -= bought[0];
					reserve.privateOwned -= bought[1];
					this.inputStorage[obj["inputIndex"]] += bought[0]+bought[1];
				}
				cost += bought[2];
				obj["excessDemand"] = leftOver - (bought[0]+bought[1]);
			}
			else {
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
	return inputs;
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

centralPlanningGame.Production.prototype.getWage = function(profits) {
	if (this.ownedBy === "workers") {
		if (profits < 0) {
			return 0;
		}
		if (this.numberWorkers === 0) {
			return 0;
		}
		this.wage = profits/this.numberWorkers;
		return profits/this.numberWorkers;
	}
	else {
		return this.wage;
	}
};

centralPlanningGame.Production.prototype.setJobsGetTheoreticalWage = function(profits, productPrice) {
	if (this.ownedBy === "workers") {
		var theoreticalIncome = 0;
		var bestCase = [0,0];
		for (var i=this.availableJobs; i >0 ; i--) {
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
		return (this.totalIncome-this.totalExpenses)/this.numberWorkers + bestCase;
	}
	else {
		return this.wage;
	}
};

centralPlanningGame.StripFarms = function(dateBuilt) 
{
	centralPlanningGame.Production.call(this, "Strip Farms", dateBuilt, 10, null, centralPlanningGame.FarmProduce, null, 1.05, 0, 0.15, 
										null, "workers", 0);
	this.availableJobs = 20;
}

// inherit 
centralPlanningGame.StripFarms.prototype = Object.create(centralPlanningGame.Production.prototype);
// correct the constructor pointer
centralPlanningGame.StripFarms.prototype.constructor = centralPlanningGame.StripFarms;


centralPlanningGame.WoodCollectors = function(dateBuilt) 
{
	centralPlanningGame.Production.call(this, "Wood Collectors", dateBuilt, 10, null, centralPlanningGame.Wood, null, 1, 0, 0.2, 
										20, null, 0);
}

// inherit 
centralPlanningGame.WoodCollectors.prototype = Object.create(centralPlanningGame.Production.prototype);
// correct the constructor pointer
centralPlanningGame.WoodCollectors.prototype.constructor = centralPlanningGame.WoodCollectors;

// need x farm products per production, so prod per worker*numworkers gives total prod, so would need 
centralPlanningGame.SmallBakery = function(dateBuilt) 
{																			// Products and multiplier (i.e. farm produce makes 1.2 pieces of bread)
	centralPlanningGame.Production.call(this, "Small Bakery", dateBuilt, 10, [ [centralPlanningGame.FarmProduce, 1.1] ], centralPlanningGame.Bread, null, 2, 0, 0.15, 
										10, "workers", 0);
	this.availableJobs = 10;
}

// inherit 
centralPlanningGame.SmallBakery.prototype = Object.create(centralPlanningGame.Production.prototype);
// correct the constructor pointer
centralPlanningGame.SmallBakery.prototype.constructor = centralPlanningGame.Bakery;












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
	centralPlanningGame.Food.call(this, "Farm Produce", 0.14);
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
