import '../css/style.css';
import background from '../img/background.png';
import hills from '../img/hills.png';
import platform from '../img/platform.png';
import platformSmallTall from '../img/platformSmallTall.png';
import spriteRunLeft from '../img/spriteRunLeft.png';
import spriteRunRight from '../img/spriteRunRight.png';
import spriteStandLeft from '../img/spriteStandLeft.png';
import spriteStandRight from '../img/spriteStandRight.png';

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;
// canvas.width = 1024;
// canvas.height = 576;

addEventListener('resize', () => {
	canvas.width = innerWidth;
	canvas.height = innerHeight;
});

const gravity = 2;
class Player {
	constructor() {
		this.position = {
			x: 100,
			y: 100,
		};
		this.velocity = {
			x: 0,
			y: 0,
		};
		this.width = 66;
		this.height = 150;
		this.speed = 10;
		this.frames = 0;
		this.sprites = {
			stand: {
				right: createImage(spriteStandRight),
				left: createImage(spriteStandLeft),
				cropWidth: 177,
				width: this.width,
			},
			run: {
				right: createImage(spriteRunRight),
				left: createImage(spriteRunLeft),
				cropWidth: 341,
				width: 127.875,
			},
		};
		this.currentSprite = this.sprites.stand.right;
		this.currentCropWidth = 177;
	}

	draw() {
		context.drawImage(this.currentSprite, this.currentCropWidth * this.frames, 0, this.currentCropWidth, 400, this.position.x, this.position.y, this.width, this.height);
	}

	update() {
		this.frames++;

		if (this.frames > 59 && (this.currentSprite === this.sprites.stand.right || this.currentSprite === this.sprites.stand.left)) {
			this.frames = 0;
		} else if (this.frames > 29 && (this.currentSprite === this.sprites.run.right || this.currentSprite === this.sprites.run.left)) {
			this.frames = 0;
		}

		this.draw();
		this.position.x += this.velocity.x;
		this.position.y += this.velocity.y;

		if (this.position.y + this.height + this.velocity.y <= canvas.height) this.velocity.y += gravity;
	}
}

class Platform {
	constructor({ x, y, image }) {
		this.position = {
			x,
			y,
		};
		this.image = image;
		this.width = image.width;
		this.height = image.height;
	}

	draw() {
		context.drawImage(this.image, this.position.x, this.position.y);
	}

	update() {
		this.draw();
	}
}
class GenericObject {
	constructor({ x, y, image }) {
		this.position = {
			x,
			y,
		};
		this.image = image;
		this.width = image.width;
		this.height = image.height;
	}

	draw() {
		context.drawImage(this.image, this.position.x, this.position.y);
	}

	update() {
		this.draw();
	}
}

const createImage = (imageSrc) => {
	const image = new Image();

	image.src = imageSrc;

	return image;
};

let player = new Player();
let platformImage = createImage(platform);
let platformSmallTallImage = createImage(platformSmallTall);
let platforms = [];
let genericObjects = [];

let lastKey;
const keys = {
	right: {
		pressed: false,
	},
	left: {
		pressed: false,
	},
};

let scrollOffset = 0;

const init = () => {
	player = new Player();
	platformImage = createImage(platform);
	platformSmallTallImage = createImage(platformSmallTall);
	platforms = [
		new Platform({ x: platformImage.width * 5 + 298 - platformSmallTallImage.width, y: 350, image: platformSmallTallImage }),
		new Platform({ x: -1, y: 550, image: platformImage }),
		new Platform({ x: platformImage.width - 3, y: 550, image: platformImage }),
		new Platform({ x: platformImage.width * 2 + 100, y: 550, image: platformImage }),
		new Platform({ x: platformImage.width * 3 + 300, y: 550, image: platformImage }),
		new Platform({ x: platformImage.width * 4 + 298, y: 550, image: platformImage }),
		new Platform({ x: platformImage.width * 5 + 698, y: 550, image: platformImage }),
	];
	genericObjects = [new GenericObject({ x: -1, y: -1, image: createImage(background) }), new GenericObject({ x: -1, y: -1, image: createImage(hills) })];

	scrollOffset = 0;
};

let animationId;
const animate = () => {
	animationId = requestAnimationFrame(animate);
	context.fillStyle = 'white';
	context.fillRect(0, 0, canvas.width, canvas.height);
	genericObjects.forEach((genericObject) => {
		genericObject.update();
	});
	platforms.forEach((platform) => {
		platform.update();
	});
	player.update();

	// Player Movement
	if (keys.right.pressed && player.position.x < 400) {
		player.velocity.x = player.speed;
	} else if ((keys.left.pressed && player.position.x > 100) || (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)) {
		player.velocity.x = -player.speed;
	} else {
		player.velocity.x = 0;

		if (keys.right.pressed) {
			scrollOffset += player.speed;
			platforms.forEach((platform) => {
				platform.position.x -= player.speed;
			});
			genericObjects.forEach((genericObject) => {
				genericObject.position.x -= player.speed * 0.66;
			});
		} else if (keys.left.pressed && scrollOffset > 0) {
			scrollOffset -= player.speed;
			platforms.forEach((platform) => {
				platform.position.x += player.speed;
			});
			genericObjects.forEach((genericObject) => {
				genericObject.position.x += player.speed * 0.66;
			});
		}
	}

	// Platform Collision Detection
	platforms.forEach((platform) => {
		if (
			player.position.y + player.height <= platform.position.y &&
			player.position.y + player.height + player.velocity.y >= platform.position.y &&
			player.position.x + player.width >= platform.position.x &&
			player.position.x <= platform.position.x + platform.width
		) {
			player.velocity.y = 0;
		}
	});

	// Sprite State Switcher
	if (keys.right.pressed && lastKey === 'right' && player.currentSprite !== player.sprites.run.right) {
		player.frames = 1;
		player.currentSprite = player.sprites.run.right;
		player.currentCropWidth = player.sprites.run.cropWidth;
		player.width = player.sprites.run.width;
	} else if (keys.left.pressed && lastKey === 'left' && player.currentSprite !== player.sprites.run.left) {
		player.currentSprite = player.sprites.run.left;
		player.currentCropWidth = player.sprites.run.cropWidth;
		player.width = player.sprites.run.width;
	} else if (!keys.right.pressed && lastKey === 'right' && player.currentSprite !== player.sprites.stand.right) {
		player.currentSprite = player.sprites.stand.right;
		player.currentCropWidth = player.sprites.stand.cropWidth;
		player.width = player.sprites.stand.width;
	} else if (!keys.left.pressed && lastKey === 'left' && player.currentSprite !== player.sprites.stand.left) {
		player.currentSprite = player.sprites.stand.left;
		player.currentCropWidth = player.sprites.stand.cropWidth;
		player.width = player.sprites.stand.width;
	}

	// Game Cleared
	if (scrollOffset > platformImage.width * 5 + 298) console.log('win');

	// Game Over
	if (player.position.y > canvas.height) {
		cancelAnimationFrame(animationId);
		setTimeout(() => {
			init();
			animate();
		}, 3000);
	}
};

init();
animate();

addEventListener('keydown', ({ keyCode }) => {
	switch (keyCode) {
		case 65:
			keys.left.pressed = true;
			lastKey = 'left';
			break;
		case 68:
			keys.right.pressed = true;
			lastKey = 'right';
			break;
		case 87:
			player.velocity.y -= 25;
			break;
	}
});

addEventListener('keyup', ({ keyCode }) => {
	switch (keyCode) {
		case 65:
			keys.left.pressed = false;
			break;
		case 68:
			keys.right.pressed = false;
			break;
	}
});
