var centralPlanningGame = {};
centralPlanningGame.canvas = document.getElementById('gameCanvas');
centralPlanningGame.stage = new createjs.Stage(centralPlanningGame.canvas);
centralPlanningGame.canvas.style.backgroundColor = "#CCCCCC";
centralPlanningGame.canvas.style.zIndex = 1;
centralPlanningGame.debug = true;
centralPlanningGame.openWindows = [];
centralPlanningGame.timeModifiers = [Math.pow(0.15, 1/7), Math.pow(0.15, 1/(7*4*2)), Math.pow(0.15, 1/(7*4*12))]; // If we have (a)^{n} = 0.1, a = (0.1)^(1/n)
