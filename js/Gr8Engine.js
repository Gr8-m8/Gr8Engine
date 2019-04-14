const getX = 0;
const getY = 1;

function WindowSize(xORy = 0) {
	if (xORy == 0) {
		return window.innerWidth;
	} else {
		return window.innerHeight;
	}
}

Math.clamp = function (num, min, max) {
	return Math.max(min, Math.min(num, max));
}

//
//	GAME BASE
//

class Game {
	constructor() {

		this.enableUpdate = true;
		this.enableDraw = true;
	}

	ImportImage(importObj) {
		document.getElementById("resources").innerHTML += importObj;
	}

	Imp_Img(name) {
		return "<img src='images/" + name + "' id='" + name + "' />";
	}

	Start(name) {
		document.getElementById("title").innerHTML = "Gr8 m8's " + name;

		setTimeout(Update, 1);
		setTimeout(Draw, 1);
	}
}

var game = new Game();

//
//	RENDERER
//

class Renderer {
	constructor() {
		this.Init();

		this.canvas;// = document.getElementById("canvas");
		this.drawSpace;// = this.canvas.getContext("2d");

		this.backgroundColor = "lightblue"
	}

	Init() {
		this.canvas = document.getElementById("canvas");
		this.drawSpace = this.canvas.getContext("2d");

		this.ReSize();
	}

	ReSize() {
		this.canvas.width = WindowSize(getX);
		this.canvas.height = WindowSize(getY);
	}

	//MESSURMENTUNIT
	MU(amount = 1) {
		return Math.min((this.canvas.clientWidth / 1920) * amount, (this.canvas.clientHeight / 966) * amount);
	}

	//MESSURMENTUNITMAX
	MUM(xORy) {
		var ret;

		if (xORy == 0) {
			ret = this.canvas.clientWidth;
		} else {
			ret = this.canvas.clientHeight;
		}

		return ret;
	}

	ClearDrawspace() {
		this.drawSpace.clearRect(0, 0, this.MUM(getX), this.MUM(getY));
	}

	DrawBackground(color = "white") {
		this.DrawBox(0, 0, this.MUM(getX), this.MUM(getY), color);
	}

	DrawGrid() {
		for (var i = 0; i < this.MUM(getX); i += this.MU()) {
			this.DrawBox(i, 0, 1, this.MUM(getY), "black");
		}

		for (var i = 0; i < this.MUM(getY); i += this.MU()) {
			this.DrawBox(0, i, this.MUM(getX), 1, "black");
		}
	}

	DrawBox(x, y, width, height, color) {
		this.drawSpace.fillStyle = color;
		this.drawSpace.fillRect(x, y, width, height);
	}
}

var RendererClass = new Renderer();

//
//	CURSOR
//

class Cursor {
	constructor() {
		this.position = [0, 0];
		this.size = [1, 1];

		this.dir = [0, 0];
		this.positionOld = [0, 0];

		this.clickPos = [0, 0];
		this.click = false;
	}

	SetCursorPos(x, y) {
		this.positionOld = [this.position[getX], this.position[getY]];

		this.position[getX] = Math.clamp(x, 0, RendererClass.MUM(getX));
		this.position[getY] = Math.clamp(y, 0, RendererClass.MUM(getY));

		this.dir = [this.position[getX] - this.positionOld[getX], this.position[getY] - this.positionOld[getY]];
	}

	Click(state) {
		this.click = state;

		if (this.click) {
			document.getElementById("canvas").style.cursor = "pointer";
			this.clickPos = [this.position[getX], this.position[getY]];
			GOC.PhysicsClick();
		} else {
			document.getElementById("canvas").style.cursor = "default";
		}
	}
}

window.addEventListener("mousemove", (event) => {
	CursorClass.SetCursorPos(event.clientX, event.clientY);
});

window.addEventListener("mousedown", (event) => {
	CursorClass.Click(true);

});

window.addEventListener("mouseup", (event) => {
	CursorClass.Click(false);
});

var CursorClass = new Cursor();

//
//	GAMEOBJECTCONTROLLER
//

class GameObjectController {
	constructor() {
		this.gameobjects = [];

		this.cameraPosition = [0, 0];
	}

	AddGameObject(gameobject) {
		this.gameobjects.push(gameobject);
	}

	RemoveGameObject(gameobject) {
		for (var i = 0; i < this.gameobjects.length; i++) {
			this.gameobjects = this.gameobjects.filter(kp => this.gameobjects[i] != gameobject);
		}
	}

	PhysicsClick() {
		for (var i = 0; i < this.gameobjects.length; i++) {
			this.gameobjects[i].CollisionCheck(CursorClass);
		}
	}

	Update() {
		for (var i = 0; i < this.gameobjects.length; i++) {
			this.gameobjects[i].Update();

			for (var j = 0; j < this.gameobjects.length; j++) {
				if (i != j) {
					this.gameobjects[i].CollisionCheck(this.gameobjects[j]);
				}
			}
		}
	}

	Draw() {
		for (var i = 0; i < this.gameobjects.length; i++) {
			this.gameobjects[i].Draw();
		}
	}
}

var GOC = new GameObjectController();

//				//
// GAMEOBJECT	//
//				//

class GameObject {
	constructor(positionStart, sizeSet, imgSet) {

		this.img = document.getElementById("img_blank");
		this.imgStr = imgSet;
		if (document.getElementById(this.imgStr) != undefined) {
			this.img = document.getElementById(this.imgStr);
		}

		this.rotation = 0;
		this.position = positionStart; //[RendererClass.MU(5), RendererClass.MU(5)];
		this.positionOld = [this.position[getX], this.position[getY]];
		this.size = sizeSet; //[RendererClass.MU(5), RendererClass.MU(5)];

		this.collisionProperties = [["Cursor", console.log, this.constructor.name]];

		this.health = 100;

		GOC.AddGameObject(this);
	}

	Forward() {
		var offset = 90 * Math.PI / 180;
		return [Math.cos((this.rotation - offset)), Math.sin((this.rotation - offset))];
	}

	Move(x, y) {
		this.position = [this.position[getX] + x, this.position[getY] + y];
	}

	Rotete(deg) {
		this.rotation += deg * Math.PI / 180;
	}

	PositionSet(x, y) {
		this.position = [x, y];
	}

	CollisionCheck(gameobject) {
		if (this.position[getX] < gameobject.position[getX] + gameobject.size[getX] &&
			this.position[getX] + this.size[getX] > gameobject.position[getX]) {

			if (this.position[getY] < gameobject.position[getY] + gameobject.size[getY] &&
				this.position[getY] + this.size[getY] > gameobject.position[getY]) {
				this.Collision(gameobject);
			}

		}
	}

	Collision(gameobject) {
		//console.log(gameobject.constructor.name);
		for (var i = 0; i < this.collisionProperties.length; i++) {
			if (this.collisionProperties[i][0] == gameobject.constructor.name) {
				this.collisionProperties[i][1](this.collisionProperties[i][2]);
			}
		}
	}

	CollisionTagsAdd(tag, func, call) {
		this.collisionProperties.push([tag, func, call]);
	}

	HealthManager(amount) {
		this.health += amount;

		if (this.health <= 0) {
			GOC.RemoveGameObject(this);
		}
	}

	Update() {

	}

	Draw() {
		RendererClass.drawSpace.save();

		RendererClass.drawSpace.translate(this.position[getX] + this.size[getX] / 2, this.position[getY] + this.size[getY]/2);
		RendererClass.drawSpace.rotate(this.rotation);

		//RendererClass.DrawBox(-this.size[getX] / 2, - this.size[getY] / 2, this.size[getX], this.size[getY], "black");
		RendererClass.drawSpace.drawImage(this.img, -this.size[getX] / 2, - this.size[getY] / 2, this.size[getX], this.size[getY]);

		RendererClass.drawSpace.restore();
		
	}
}

//			//
//	PUBLIC	//
//			//

window.onresize = function () {
	RendererClass.ReSize();
}

window.onload = function () {
	RendererClass.Init();
}

// KEYCODE	//

var activeKeyes = [];
window.addEventListener("keydown", (event) => {
	//console.log(event.keyCode);

	activeKeyes[event.keyCode] = true;

});

window.addEventListener("keyup", (event) => {
	activeKeyes[event.keyCode] = false;
});

var keycode = {
	"W": 87,
	"A": 65,
	"S": 83,
	"D": 68,

	"UP": 38,
	"LEFT": 37,
	"RIGHT": 39,
	"DOWN": 40,

	"ESC": 27,
	"TAB": 9,
	"CTRL": 17,
	"ALT": 18,
	"ENTER": 13,
	"BACKSPACE": 8,
	"SPACE": 32

}


game.Start("Code Base Engine");

function Update() {

	GOC.Update();

	window.requestAnimationFrame(Update);
}

function Draw() {
	RendererClass.DrawBackground(RendererClass.backgroundColor);

	GOC.Draw();

	window.requestAnimationFrame(Draw);
}

