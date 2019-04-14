game.ImportImage(game.Imp_Img("img_fish.png"));

class Fish extends GameObject {
	constructor(setKey) {
		super([Math.random() * RendererClass.MUM(getX), Math.random() * RendererClass.MUM(getY)], [RendererClass.MU(50), RendererClass.MU(50)], "img_fish.png");
		this.speed = 1;
		this.rotspeed = 3;
		this.level = 1;

		this.rotation = Math.random() * 360 * Math.PI / 180;

		this.CollisionTagsAdd("Food", this.Upgrade, "");

		this.key = setKey;
	}

	Swim() {
		this.Rotete(1 * this.rotspeed);
		this.Move(this.Forward()[getX] * this.speed, this.Forward()[getY] * this.speed);

		if (activeKeyes[this.key]) {
			this.Rotete(-2 * this.rotspeed);
		}
	}

	Upgrade() {
		this.speed++;

		if (this.speed >= 8 + 2 * this.level) {
			this.speed -= 8;
			this.level++;

			this.size = [RendererClass.MU(50 + 10 * this.level), RendererClass.MU(50 + 10 * this.level)];
		}
	}

	Update() {
		this.Swim();

		if (this.position[getX] > RendererClass.MUM(getX) + 1) {
			this.PositionSet(0 - this.size[getX], this.position[getY]);
		}


		if (this.position[getX] < 0 - this.size[getX] - 1) {
			this.PositionSet(RendererClass.MUM(getX), this.position[getY]);
		}


		if (this.position[getY] > RendererClass.MUM(getY) + 1) {
			this.PositionSet(this.position[getX], 0 - this.size[getY]);
		}

		if (this.position[getY] < 0 - this.size[getY] - 1) {
			this.PositionSet(this.position[getX], RendererClass.MUM(getY));
		}
	}
}

var go1 = new Fish(keycode.W);
var go2 = new Fish(keycode.UP);

class Food extends GameObject {
	constructor() {
		super([Math.random() * RendererClass.MUM(getX), Math.random() * RendererClass.MUM(getY)], [RendererClass.MU(50), RendererClass.MU(50)], "img_fish.png");

		this.CollisionTagsAdd("Fish", this.PositionSet, Math.random() * RendererClass.MUM(getX), Math.random() * RendererClass.MUM(getY));
	}
}

var food = new Food();

game.Start("Test_Game");

RendererClass.backgroundColor = "royalblue";