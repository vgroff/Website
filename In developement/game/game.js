

var stage = new createjs.Stage("gameCanvas");

var circle = new createjs.Shape();
circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 10);
circle.x = 0;
circle.y = 0;
stage.addChild(circle);

stage.update()

//Update stage will render next frame
createjs.Ticker.addEventListener("tick", updateStage);
createjs.Ticker.setFPS(60)

var date = new Date();

function updateStage() {
 //Circle will move 10 units to the right.
	newDate = new Date();
	//console.log(newDate.getTime() - date.getTime());
	date = newDate;
	circle.x += 5;
	//Will cause the circle to wrap back
	if (circle.x > stage.canvas.width) { circle.x = 0; }
	stage.update();
}

// Going to need to decide how to split this up.
// UI should clearly be listened for and then queued into updateStage
// Going to need classes for player and for NPCs
// Going to need classes for stages (here neighbourhood)
// Going to need classes for weapons
