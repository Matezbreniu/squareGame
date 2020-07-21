const scoreBoard = document.querySelector('.scoreBoard');
const actualScore = document.querySelector('.scoreBoard__actualScore');
const highestScore = document.querySelector('.scoreBoard__highestScore');
const restartBtn = document.querySelector('.scoreBoard__reset');
const startBtn = document.querySelector('.gameStart');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', {alpha: false});

let canvasWidth;
let canvasHeight;
let ratio;
const setCanvas = () => {
  canvasWidth = document.body.clientWidth;
  canvasHeight = 300;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ratio = canvasWidth / 1000;
};
setCanvas();

let gameSpeed = 7 * ratio;
let score = 000;
let bestScore = 000;

const strokeWidth = 2;
const gravity = 0.5;
const jumpPower = 12;
const boardLevel = canvasHeight - 50;
const maxObstacleHeight =
  Math.pow(jumpPower, 2) / (gravity * 2) + jumpPower / 2;
let isCollision = false;

const obstacle = {
  x: 0,
  width: 10,
  height: 0,
  getHeight() {
    const minHeight = 50;
    const height = -(
      minHeight +
      Math.random() * (maxObstacleHeight - minHeight * 1.4)
    );
    return height;
  },
  update() {
    for (let i = 0; i < gameSpeed; i++) {
      this.x -= 1;
    }
    if (this.x <= 0) {
      this.x = canvasWidth;
      this.height = this.getHeight();
      setActualScore();
    }
  },
  draw() {
    ctx.strokeRect(this.x, boardLevel, this.width, this.height);
  },
  start() {
    this.x = canvasWidth;
    this.height = this.getHeight();
  },
};
const square = {
  x: 0,
  y: 0, //position
  dy: 0, //acceleration
  size: 20, //height and width of square
  onGround: false,
  jumpPower: -jumpPower, //lower number higher jump
  update() {
    this.dy += gravity;
    this.y += this.dy;
    if (square.y + square.size >= boardLevel) {
      // has hit ground
      square.y = boardLevel - square.size; // place on ground
      square.dy = 0; // stop delta y
      square.onGround = true;
    } else {
      square.onGround = false;
    }
  },
  draw() {
    ctx.strokeRect(this.x, this.y, this.size, this.size);
  },
  start() {
    this.x = this.size * 2;
    this.y = boardLevel - this.size;
    this.onGround = true;
    this.dy = 0;
  },
};

const gameStrokes = () => {
  ctx.strokeStyle = 'white';
  ctx.lineWidth = strokeWidth;
  ctx.lineJoin = 'miter';
};

const drawBoard = () => {
  ctx.beginPath();
  ctx.moveTo(0, boardLevel);
  ctx.lineTo(canvasWidth, boardLevel);
  ctx.stroke();
};

const checkCollision = () => {
  const obstacleTouchSquare =
    obstacle.x - strokeWidth <= square.x + square.size;
  const obstaclePassedSquare =
    obstacle.x + obstacle.width + strokeWidth < square.x;
  const squareAboveObstacle =
    boardLevel - square.y - square.size - strokeWidth > -obstacle.height;

  if (obstacleTouchSquare && !obstaclePassedSquare) {
    if (!squareAboveObstacle) {
      isCollision = true;
    }
  }
};

const setActualScore = () => {
  score++;
  const scoreLength = Math.floor(Math.log10(score)) + 1;
  for (let i = scoreLength; i < 3; i++) {
    score = '0' + score;
  }
  actualScore.textContent = score;
  if (score !== 0 && score % 5 === 0) {
    if (gameSpeed < 14) {
      gameSpeed += 1;
    }
  }
};

const setHighestScore = () => {
  const highestScore = document.querySelector('.scoreBoard__highestScore');
  if (score > bestScore) {
    bestScore = score;
  }
  highestScore.textContent = bestScore;
};

const gameEnd = () => {
  scoreBoard.classList.add('gameEnd');
  setHighestScore();
};

const restart = () => {
  score = '000';
  gameSpeed = 7 * ratio;
  isCollision = false;
  actualScore.textContent = score;
  scoreBoard.classList.remove('gameEnd');
  gameStart();
};

const game = () => {
  ctx.fillRect(0, 0, canvasWidth, canvasHeight); //canvas reset
  drawBoard();
  square.update();
  obstacle.update();
  checkCollision();
  square.draw();
  obstacle.draw();
  if (!isCollision) {
    requestAnimationFrame(game);
  } else {
    gameEnd();
  }
};

const gameStart = () => {
  square.start();
  obstacle.start();
  gameStrokes();
  game();
};

document.addEventListener('keydown', (e) => {
  e.preventDefault();
  if (e.key === 'ArrowUp' && square.onGround) {
    square.dy = square.jumpPower;
  }
});

window.addEventListener('resize', setCanvas);

restartBtn.addEventListener('click', restart);
startBtn.addEventListener('click', () => {
  startBtn.remove();
  gameStart();
});
