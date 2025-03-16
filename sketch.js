// the frameworks of an eventual soccer game ? i guess
// click canvas to change landscape, use spacebar to drop the ball at the location of ur cursor, use arrow keys for direction

let currentScene = 0; // 0: StreetPitch, 1: Wembley Mate, 2: Rio Beach
let sceneNames = ["StreetPitch", "Wembley Mate", "Rio Beach"];
let StreetPitch = [];
let RioBeachCones = [];
let seagulls = [];
let sunPosition;
let clouds = [];
let ballPos;
let ballVel;
let trailPositions = [];
let trailColors = [];
let ballHistory = [];
let ballSize = 125; // Ball size increased by 5x (from 25 to 125)
let confetti = [];
let isConfettiActive = false;
let confettiTimer = 0;
let confettiDuration = 120; // 2 seconds at 60 FPS
let colorPalette;
let colorSeed = 10;


function setup() {
  createCanvas(800, 800);
  colorPalette = generateColorPalette(colorSeed);
  initializeStreetPitch();
  initializeRioBeach();
  initializeBall();
  initializeSunAndClouds();
}



// yay fun colors we have here
function generateColorPalette(seed) {
  randomSeed(seed);
  let palette = [];
  let bias = random() > 0.5 ? "warm" : "cool";
  
  for (let i = 0; i < 5; i++) {
    let r = bias === "warm" ? random(150, 255) : random(0, 200);
    let g = random(50, 200);
    let b = bias === "cool" ? random(150, 255) : random(0, 200);
    
    palette.push(color(r, g, b));
  }
  return palette;
}



// initialize street pitch array w building class
function initializeStreetPitch() {
  for (let i = 0; i < 3; i++) {
    StreetPitch.push(new Building(i));
  }
}

function initializeRioBeach() {
  RioBeachCones = [
    new Cone(150, 650, 35),
    new Cone(300, 650, 30),
    new Cone(500, 650, 40),
    new Cone(650, 650, 25),
  ];
  for (let i = 0; i < 3; i++) {
    seagulls.push(
      new Seagull(random(width), random(200, 300), random(0.5, 1.5))
    );
  }
}

function initializeBall() {
  let startX = width / 2 + random(-20, 20);
  let startY = height / 2 + random(-10, 10);
  
  let speedX = random(-2, 2);
  let speedY = random(-2, 2);
  
  ballPos = createVector(startX, startY);
  ballVel = createVector(speedX, speedY);
}

function initializeSunAndClouds() {
  sunPosition = createVector(width / 2, height + 50);
  for (let i = 0; i < 3; i++) {
    clouds.push({
      x: random(width),
      y: random(100, 150),
      size: random(50, 100),
      speed: random(0.2, 0.5),
    });
  }
}

// draw my stuff man!
function draw() {
  switch (currentScene) {
    case 0:
      drawStreetPitch();
      break;
    case 1:
      drawWembley();
      break;
    case 2:
      drawRioBeach();
      break;
  }
  
  updateBall();
  checkGoalCollision();

  if (isConfettiActive) {
    updateAndDrawConfetti();
  }
}

// change landscape on mouse press
function mousePressed() {
  currentScene = (currentScene + 1) % 3;
  colorSeed = random(100); // Change color palette on scene change
  colorPalette = generateColorPalette(colorSeed);
}

function keyPressed() {
  if (keyCode === 32) {
    resetBallPosition(mouseX, mouseY);
  }

  // have some fun with the arrow keys
  if (keyCode === LEFT_ARROW) {
    ballVel.x -= 1;
  }
  if (keyCode === RIGHT_ARROW) {
    ballVel.x += 1;
  }
  if (keyCode === UP_ARROW) {
    ballVel.y -= 1;
  }
  if (keyCode === DOWN_ARROW) {
    ballVel.y += 1;
  }
}

//--------------------------------------------------------------------------------------------------------------------
// perplexity AI use here to nail the ball functions - goal is to have the soccer ball move around the screen, bounce off edges, and leave a motion blur train while maintainigna rotating effect. also, this section is responsible for the changing in sizes of the ball according to its proximity to certain edges of the canvas. 
// central function – calls the three proceeding functions to update + draw ball
function updateBall() {
  updateBallTrail();
  updateBallPosition();
  drawBall();
}

// adds the current ball pos to ballHistory + creates random trail colors on ball to give motion effect
function updateBallTrail() {
  ballHistory.push(createVector(ballPos.x, ballPos.y));
  trailColors.push(color(random(255), random(255), random(255)));

  if (ballHistory.length > 20) {
    ballHistory.shift();
    trailColors.shift();
  }
}

// monitors if ball hits edges of cvnas + reverses ball direction upon hitting
//moves ball velocity to ball position
function updateBallPosition() {
  ballPos.add(ballVel);

  if (ballPos.x < ballSize / 2 || ballPos.x > width - ballSize / 2) {
    ballVel.x *= -1;
  }
  if (ballPos.y < ballSize / 2 || ballPos.y > height - ballSize / 2) {
    ballVel.y *= -1;
  }
}

//calculates ball position based on its pos
function drawBall() {
  let sizeFactor = calculateSizeFactor(ballPos.x, ballPos.y);
  let currentBallSize = ballSize * (0.5 + sizeFactor * 0.5);

  drawBallTrail(currentBallSize);
  drawMainBall(currentBallSize);
  drawBallPattern(currentBallSize);
  drawBallCenter(currentBallSize);
}

// calculates how big ball should be based on its location on cavnas
function calculateSizeFactor(x, y) {
  let xFactor = 1 - Math.abs((x - width / 2) / (width / 2));
  let yFactor = Math.abs((y - height / 2) / (height / 2));
  return xFactor * 0.7 + yFactor * 0.3;
}

//uses ball history to draw train behind the ball so it gives a motion effect – each layer in the trail is a differing opcaty
function drawBallTrail(currentBallSize) {
  noStroke();
  for (let i = 0; i < ballHistory.length; i++) {
    let alpha = map(i, 0, ballHistory.length, 30, 180);
    let size = map(
      i,
      0,
      ballHistory.length,
      currentBallSize * 0.5,
      currentBallSize * 0.9
    );

    let trailColor = color(
      red(trailColors[i]),
      green(trailColors[i]),
      blue(trailColors[i]),
      alpha
    );
    fill(trailColor);
    ellipse(ballHistory[i].x, ballHistory[i].y, size, size);
  }
}

//draw the main white ball shape
function drawMainBall(currentBallSize) {
  fill(255);
  ellipse(ballPos.x, ballPos.y, currentBallSize, currentBallSize);
}

// draw rotating black circles to give movement effect
function drawBallPattern(currentBallSize) {
  fill(0);
  push();
  translate(ballPos.x, ballPos.y);
  rotate(frameCount * 0.05);
  for (let i = 0; i < 5; i++) {
    rotate(TWO_PI / 5);
    ellipse(0, currentBallSize / 3, currentBallSize / 5, currentBallSize / 5);
  }
  pop();
}

// draw the central black ball
function drawBallCenter(currentBallSize) {
  fill(0);
  ellipse(ballPos.x, ballPos.y, currentBallSize / 4, currentBallSize / 4);
}


//clears trail history + reset positon
function resetBallPosition(x, y) {
  ballPos = createVector(x, y);
  ballVel = createVector(random(-3, 3), random(-3, 3));
  ballHistory = []; // reset ball
}

// shared fields on wembley and favela street pitch
function drawSoccerField(fieldColor, includeCircle) {
  fill(fieldColor);
  rect(0, 470, width, 330);

  fill(255);
  rect(width / 2 - 5, 470, 10, 330);

  if (includeCircle) {
    fill(255);
    ellipse(width / 2, 635, 20, 20);
  }
}

function drawGoals() {
  drawGoal(40, 600, 0.8); // left golazo
  drawGoal(760, 600, -0.8); // right golazo
}

function drawGoal(x, y, scaleFactor) {
  push();
  translate(x, y);
  scale(scaleFactor, 0.8);
  fill(255);
  rect(0, 0, 10, 100);
  rect(0, 0, 60, 10);
  rect(60, 0, 10, 100);
  noFill();
  stroke(255);
  strokeWeight(2);
  beginShape();
  vertex(0, 0);
  vertex(60, 0);
  vertex(60, 100);
  vertex(0, 100);
  endShape(CLOSE);
  pop();
}
// End of AI use
//--------------------------------------------------------------------------------------------------------------------

// landscape 0: street pitch
function drawStreetPitch() {
  drawStreetPitchBackground();

  for (let building of StreetPitch) {
    building.display();
  }

  drawStreetPitchWall();
  drawSoccerField(color(100, 100, 100), true);
  drawGoals();
}

function drawStreetPitchBackground() {
  background(colorPalette[0]); // palette
  drawStars();
  drawLightGlow();
}

function drawStreetPitchWall() {
  for (let i = 0; i < 50; i++) {
    let alpha = map(i, 0, 50, 255, 100);
    fill(colorPalette[1], alpha);
    rect(0, 430 + i, width, 1);
  }
}

function drawStars() {
  fill(255, 255, 255, 200);
  noStroke();
  for (let i = 0; i < 100; i++) {
    let starSize = random(1, 3);
    let x = random(width);
    let y = random(180);
    ellipse(x, y, starSize, starSize);
  }
}

function drawLightGlow() {
  noStroke();
  fill(255, 255, 100, 10);
  for (let i = 0; i < 5; i++) {
    let size = 200 + i * 50;
    let alpha = 10 - i * 2;
    fill(255, 255, 100, alpha);
    ellipse(width / 2, 300, size, size);
  }
}

// landscape 1: Wembley
function drawWembley() {
  drawWembleyBackground();
  drawWembleyRoofs();
  drawWembleySeating();
  drawWembleyBase();
  drawSoccerField(colorPalette[2], true); // palette
  drawGoals();
  updateClouds();
}

function drawWembleyBackground() {
  background(colorPalette[3]); // palette
}

function drawWembleyRoofs() {
  noFill();
  stroke(0);
  strokeWeight(2);
  arc(width / 2, 350, width * 1.2, 500, PI, TWO_PI);
  noStroke();
}

function drawWembleySeating() {
  fill(0, 0, 100);
  rect(0, 230, width, 80);
  fill(0);
  rect(0, 310, width, 2);
  fill(0, 0, 120);
  rect(0, 312, width, 78);
  fill(0);
  rect(0, 390, width, 2);
  fill(0, 0, 140);
  rect(0, 392, width, 28);
}

function drawWembleyBase() {
  fill(200);
  rect(0, 420, width, 50);
}

function updateClouds() {
  fill(255);
  for (let cloud of clouds) {
    let wobble = random(-2, 2); // Slight variation in shape
    ellipse(cloud.x, cloud.y + wobble, cloud.size, cloud.size * 0.6 + wobble);
    ellipse(cloud.x + cloud.size * 0.4, cloud.y - cloud.size * 0.1 + wobble, cloud.size * 0.8, cloud.size * 0.5);
    ellipse(cloud.x - cloud.size * 0.4, cloud.y + wobble, cloud.size * 0.7, cloud.size * 0.5);

    cloud.x += cloud.speed;
    if (cloud.x > width + cloud.size) {
      cloud.x = -cloud.size;
    }
  }
}

// landscape 2: rio beach soccer
function drawRioBeach() {
  drawRioBeachSky();
  drawRioBeachOceanAndSand();

  for (let cone of RioBeachCones) {
    cone.display();
  }
  for (let seagull of seagulls) {
    seagull.update();
    seagull.display();
  }

  animateSun();
}

function drawRioBeachSky() {
  drawSkyGradient();
}

function drawRioBeachOceanAndSand() {
  fill(0, 0, 120);
  rect(0, 480, width, 70);
  fill(100, 200, 230);
  rect(0, 550, width, 50);
  fill(255, 255, 100);
  rect(0, 600, width, 200);
}

function drawSkyGradient() {
  for (let y = 0; y < 480; y++) {
    let inter = map(y, 0, 480, 0, 1);
    let c = lerpColor(color(20, 0, 60), color(200, 50, 20), inter);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();
}

function animateSun() {
  sunPosition.y = 650 + sin(frameCount * 0.01) * 50;
}

// classes
//using a class to reduce the complexity of the building shapes + windows
class Building {
  constructor(index) {
    let sceneWidth = width;
    let predefinedHeights = [230, 280, 250]; 

    this.width = sceneWidth / 3;
    this.index = index;
    this.x = index * this.width;
    this.height = predefinedHeights[index];
    this.y = 430 - this.height;

    let buildingColors = [
      colorPalette[0],
      colorPalette[1],
      colorPalette[2],
    ];
    this.color = buildingColors[index];

    this.windows = [];
    this.createWindows();
  }

  createWindows() {
    let windowSize = 60;
    let windowSpacing = 35;
    let centerX = this.x + this.width / 2;
    let centerY = this.y + this.height / 2;
    let totalWindowWidth = 2 * windowSize + windowSpacing;
    let totalWindowHeight = 2 * windowSize + windowSpacing;
    let startX = centerX - totalWindowWidth / 2;
    let startY = centerY - totalWindowHeight / 2;

    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        this.windows.push({
          x: startX + col * (windowSize + windowSpacing),
          y: startY + row * (windowSize + windowSpacing),
          size: windowSize,
        });
      }
    }
  }

  display() {
    fill(this.color);
    rect(this.x, this.y, this.width, this.height);

    fill(255, 255, 100);
    for (let window of this.windows) {
      rect(window.x, window.y, window.size, window.size);
    }
  }
}

//using a class to easily maintain the soccer cones on the beach landscape
class Cone {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = colorPalette[4]; //palette
  }

  display() {
    fill(this.color);
    triangle(
      this.x,
      this.y - this.size,
      this.x - this.size / 2,
      this.y,
      this.x + this.size / 2,
      this.y
    );
  }
}

// using a class to have moving seagull elements in my graphic
class Seagull {
  constructor(x, y, speed) {
    this.position = createVector(x, y);
    this.velocity = createVector(speed, 0);
    this.size = random(15, 25);
    this.wingOffset = 0;
    this.bodyColor = colorPalette[1]; //palette
  }

  update() {
    this.position.add(this.velocity);

    if (this.position.x > width + this.size) {
      this.position.x = -this.size;
      this.position.y = random(100, 300);
    }

    this.wingOffset = sin(frameCount * 0.2) * 10;
  }

  display() {
    push();
    translate(this.position.x, this.position.y);

    stroke(0);
    strokeWeight(1);
    line(0, 0, -this.size, this.wingOffset);
    line(0, 0, this.size, this.wingOffset);

    fill(this.bodyColor); //palette
    noStroke();
    ellipse(0, 0, this.size * 0.8, this.size * 0.4);
    pop();
  }
}

// confeffit function (for when a user crosses the goal line upon collison)
function checkGoalCollision() {
  if (isConfettiActive) return;

  let currentBallRadius = calculateBallRadius(ballPos.x, ballPos.y);

  // left goal boundaries
  let leftGoalX = 40;
  let leftGoalY = 600;
  let leftGoalWidth = 48;
  let leftGoalHeight = 80;

  // right goal boundaries
  let rightGoalX = 760 - 48;
  let rightGoalY = 600;
  let rightGoalWidth = 48;
  let rightGoalHeight = 80;

  if (
    circleRectCollision(
      ballPos.x,
      ballPos.y,
      currentBallRadius,
      leftGoalX,
      leftGoalY,
      leftGoalWidth,
      leftGoalHeight
    )
  ) {
    handleGoalCollision(ballPos.x, ballPos.y);
  } else if (
    circleRectCollision(
      ballPos.x,
      ballPos.y,
      currentBallRadius,
      rightGoalX,
      rightGoalY,
      rightGoalWidth,
      rightGoalHeight
    )
  ) {
    handleGoalCollision(ballPos.x, ballPos.y);
  }
}

function calculateBallRadius(x, y) {
  let sizeFactor = calculateSizeFactor(x, y);
  return (ballSize * (0.5 + sizeFactor * 0.5)) / 2;
}

function handleGoalCollision(x, y) {
  createConfettiFun(x, y);
  changeScene();
}

function changeScene() {
  currentScene = (currentScene + 1) % 3;
  resetBallPosition(width / 2, height / 2);
}

function circleRectCollision(circleX, circleY, radius, rectX, rectY, rectW, rectH) {
  let closestX = constrain(circleX, rectX, rectX + rectW);
  let closestY = constrain(circleY, rectY, rectY + rectH);
  let distanceX = circleX - closestX;
  let distanceY = circleY - closestY;

  let distanceSquared = distanceX * distanceX + distanceY * distanceY;
  return distanceSquared < radius * radius;
}

function createConfettiFun(x, y) {
  confetti = [];
  isConfettiActive = true;
  confettiTimer = confettiDuration;

  for (let i = 0; i < 100; i++) {
    confetti.push({
      x: x,
      y: y,
      size: random(5, 10),
      color: color(random(255), random(255), random(255)),
      vx: random(-5, 5),
      vy: random(-10, -2),
      gravity: random(0.1, 0.3),
      rotation: random(TWO_PI),
      rotationSpeed: random(-0.1, 0.1),
    });
  }
}

function updateAndDrawConfetti() {
  confettiTimer--;
  if (confettiTimer <= 0) {
    isConfettiActive = false;
    return;
  }

  for (let particle of confetti) {
    updateConfettiParticle(particle);
    drawConfettiParticle(particle);
  }
}

function updateConfettiParticle(p) {
  p.x += p.vx;
  p.y += p.vy;
  p.vy += p.gravity;
  p.rotation += p.rotationSpeed;
}

function drawConfettiParticle(p) {
  push();
  translate(p.x, p.y);
  rotate(p.rotation);
  fill(p.color);
  noStroke();
  ellipse(0, 0, p.size, p.size);
  pop();
}