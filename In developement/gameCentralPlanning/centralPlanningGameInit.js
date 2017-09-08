var centralPlanningGame = {};
centralPlanningGame.canvas = document.getElementById('gameCanvas');
centralPlanningGame.stage = new createjs.Stage(centralPlanningGame.canvas);
centralPlanningGame.canvas.style.backgroundColor = "#CCCCCC";
centralPlanningGame.canvas.style.zIndex = 1;
centralPlanningGame.debug = true;
centralPlanningGame.openWindows = [];
