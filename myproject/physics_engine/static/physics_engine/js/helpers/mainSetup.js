var physicsEngine = {};

physicsEngine.defaultColour = "#00FF00";
physicsEngine.canvas = document.getElementById("physicsCanvas");
physicsEngine.ctx = physicsEngine.canvas.getContext("2d");

physicsEngine.canvas.width = 700;
physicsEngine.canvas.height = 550;

physicsEngine.fps = 10;

physicsEngine.g = 0.045;
physicsEngine.sideOffset = 40;
physicsEngine.heatMap = false;

physicsEngine.colours = [
"#FF0000", 
"#00FF00",
"#0000FF",
"#FFFF00",
"#00FFFF",
"#FF00FF",
];

physicsEngine.log = false;
