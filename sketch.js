// the frameworks of an eventual soccer game ? i guess
// click canvas to change landscape, use spacebar to drop the ball at the location of ur cursor 

let currentScene = 0; // 0: Favela, 1: Stadium, 2: Beach
let sceneNames = ["Favela", "Stadium", "Beach"];
let favela = [];
let beachCones = [];
let seagulls = [];
let ballPos;
let ballVel;
let sunPosition;
let clouds = [];
let trailPositions = [];
let trailColors = [];
let ballHistory = [];
let ballSize = 125; // Ball size increased by 5x (from 25 to 125)

function setup() {
  createCanvas(800, 800);

  // Initialize favela buildings
  for (let i = 0; i < 3; i++) {
    favela.push(new Building(i));
  }

  // Initialize beach cones - exactly 4 cones
  beachCones = [
    new Cone(150, 650, 35),
    new Cone(300, 650, 30),
    new Cone(500, 650, 40),
    new Cone(650, 650, 25)
  ];

  // Initialize seagulls for beach scene
  for (let i = 0; i < 3; i++) {
    seagulls.push(new Seagull(random(width), random(200, 300), random(0.5, 1.5)));
  }

  // Initialize ball
  ballPos = createVector(width / 2, height / 2);
  ballVel = createVector(random(-2, 2), random(-2, 2));

  // Initialize sun position
  sunPosition = createVector(width / 2, height + 50);

  // Initialize clouds
  for (let i = 0; i < 3; i++) {
    clouds.push({
      x: random(width),
      y: random(100, 150),
      size: random(50, 100),
      speed: random(0.2, 0.5)
    });
  }
}

function draw() {
  // Choose which scene to draw
  switch (currentScene) {
    case 0:
      drawFavela();
      break;
    case 1:
      drawStadium();
      break;
    case 2:
      drawBeach();
      break;
  }

  // Update ball position
  updateBall();
}

function mousePressed() {
  // Change scene on mouse click
  currentScene = (currentScene + 1) % 3;
}

function keyPressed() {
  // Reset ball on spacebar
  if (keyCode === 32) {
    ballPos = createVector(mouseX, mouseY);
    ballVel = createVector(random(-3, 3), random(-3, 3));
    ballHistory = []; // Clear ball history when resetting
  }
}

function updateBall() {
  // Add current position to trail
  ballHistory.push(createVector(ballPos.x, ballPos.y));

  // Generate a random color for the trail
  trailColors.push(color(random(255), random(255), random(255)));

  // Limit trail length
  if (ballHistory.length > 20) {
    ballHistory.shift();
    trailColors.shift();
  }

  // Update ball position
  ballPos.add(ballVel);

  // Bounce off edges
  if (ballPos.x < ballSize / 2 || ballPos.x > width - ballSize / 2) {
    ballVel.x *= -1;
  }
  if (ballPos.y < ballSize / 2 || ballPos.y > height - ballSize / 2) {
    ballVel.y *= -1;
  }

  // Calculate size factor based on x position
  let xFactor = 1 - Math.abs((ballPos.x - width / 2) / (width / 2));
  // Calculate size factor based on y position
  let yFactor = Math.abs((ballPos.y - height / 2) / (height / 2));
  // Combine factors, giving more weight to the x factor
  let sizeFactor = xFactor * 0.7 + yFactor * 0.3;

  // Apply size factor to ball size
  let currentBallSize = ballSize * (0.5 + sizeFactor * 0.5);

  // Draw trail with random color gradient
  noStroke();
  for (let i = 0; i < ballHistory.length; i++) {
    let alpha = map(i, 0, ballHistory.length, 30, 180);
    let size = map(i, 0, ballHistory.length, currentBallSize * 0.5, currentBallSize * 0.9);

    let trailColor = color(red(trailColors[i]), green(trailColors[i]), blue(trailColors[i]), alpha);
    fill(trailColor);

    ellipse(ballHistory[i].x, ballHistory[i].y, size, size);
  }

  // Draw main ball
  fill(255);
  ellipse(ballPos.x, ballPos.y, currentBallSize, currentBallSize);

  // Draw ball pattern (simple pattern)
  fill(0);
  push();
  translate(ballPos.x, ballPos.y);
  rotate(frameCount * 0.05);
  for (let i = 0; i < 5; i++) {
    rotate(TWO_PI / 5);
    ellipse(0, currentBallSize / 3, currentBallSize / 5, currentBallSize / 5);
  }
  pop();

  // Add black circle in the very center of the ball
  fill(0);
  ellipse(ballPos.x, ballPos.y, currentBallSize / 4, currentBallSize / 4);
}

// Draw a standardized soccer field with the specified color
function drawSoccerField(fieldColor, includeCircle) {
  // Draw field with specified color
  fill(fieldColor);
  rect(0, 470, width, 330);

  // Draw center line
  fill(255);
  rect(width / 2 - 5, 470, 10, 330);

  // Draw center circle if requested
  if (includeCircle) {
    fill(255);
    ellipse(width / 2, 635, 20, 20);
  }
}

function drawGoals() {
  // Left goal
  push();
  translate(40, 600);
  scale(0.8, 0.8);
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

  // Right goal
  push();
  translate(760, 600);
  scale(-0.8, 0.8);
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

// ---------- SCENE 0: FAVELA ----------
function drawFavela() {
  // Enhanced night sky background with stars
  background(5, 5, 30); // Darker blue for night sky

  // Add stars to the night sky
  drawStars();

  // Add a soft glow around the buildings to simulate light pollution
  drawLightGlow();

  // Draw favela buildings
  for (let building of favela) {
    building.display();
  }

  // Draw wall - thicker and full width, with blue color
  fill(0, 0, 150);
  rect(0, 430, width, 50); // Thicker blue wall at full width

  // Draw the soccer field - grey concrete (with circle)
  drawSoccerField(color(100, 100, 100), true);

  // Add goals
  drawGoals();
}

// New function to draw stars in the night sky
function drawStars() {
  fill(255, 255, 255, 200);
  noStroke();
  for (let i = 0; i < 100; i++) {
    let starSize = random(1, 3);
    let x = random(width);
    let y = random(180); // Only draw stars above the buildings
    ellipse(x, y, starSize, starSize);
  }
}

// New function to create a light glow effect from the buildings
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

// ---------- SCENE 1: STADIUM ----------
function drawStadium() {
  // Sky
  background(100, 200, 230);

  // Draw distant curved stadium roof
  noFill();
  stroke(0);
  strokeWeight(2);
  arc(width / 2, 350, width * 1.2, 500, PI, TWO_PI);
  noStroke();

  // Draw ocean layers with black lines between them
  fill(0, 0, 100);
  rect(0, 230, width, 80);

  // Add black line between first and second blue section
  fill(0);
  rect(0, 310, width, 2);

  fill(0, 0, 120);
  rect(0, 312, width, 78); // Adjusted y position and height to accommodate the line

  // Add black line between second and third blue section
  fill(0);
  rect(0, 390, width, 2);

  fill(0, 0, 140);
  rect(0, 392, width, 28); // Adjusted y position and height to accommodate the line

  // Draw concrete base - REDUCED TO HALF HEIGHT
  fill(200);
  rect(0, 420, width, 50);

  // Draw the soccer field - green grass (with circle)
  drawSoccerField(color(0, 150, 0), true);

  // Add goals
  drawGoals();

  // Draw clouds
  updateClouds();
}

function updateClouds() {
  fill(255);
  for (let cloud of clouds) {
    ellipse(cloud.x, cloud.y, cloud.size, cloud.size * 0.6);
    ellipse(cloud.x + cloud.size * 0.4, cloud.y - cloud.size * 0.1, cloud.size * 0.8, cloud.size * 0.5);
    ellipse(cloud.x - cloud.size * 0.4, cloud.y, cloud.size * 0.7, cloud.size * 0.5);

    // Move cloud
    cloud.x += cloud.speed;
    if (cloud.x > width + cloud.size) {
      cloud.x = -cloud.size;
    }
  }
}

// ---------- SCENE 2: BEACH ----------
function drawBeach() {
  // Sky gradient from dark blue to orange
  drawSkyGradient();

  // Draw ocean
  fill(0, 0, 120);
  rect(0, 480, width, 70);

  // Draw shallow water
  fill(100, 200, 230);
  rect(0, 550, width, 50);

  // Draw sand
  fill(255, 255, 100);
  rect(0, 600, width, 200);

  // Draw cones - exactly 4 cones
  for (let cone of beachCones) {
    cone.display();
  }

  // Draw seagulls
  for (let seagull of seagulls) {
    seagull.update();
    seagull.display();
  }

  // Update sun position (rising/setting effect)
  animateSun();
}

function drawSkyGradient() {
  // Create gradient from dark blue to reddish
  for (let y = 0; y < 480; y++) {
    let inter = map(y, 0, 480, 0, 1);
    let c = lerpColor(color(20, 0, 60), color(200, 50, 20), inter);
    stroke(c);
    line(0, y, width, y);
  }
  noStroke();
}

function animateSun() {
  // Make sun rise and set
  sunPosition.y = 650 + sin(frameCount * 0.01) * 50;
}

// ---------- CLASSES ----------
class Building {
  constructor(position) {
    // Calculate building position based on the canvas
    let totalWidth = width; // Buildings span the whole width
    this.width = totalWidth / 3;
    this.position = position;
    this.x = position * this.width;

    // Different heights for each building
    let heights = [230, 280, 250]; // Left, middle, right building heights
    this.height = heights[position];
    this.y = 430 - this.height; // Calculate y position based on height

    // Building colors based on image (dark red, green, dark blue)
    let colors = [
      color(150, 40, 40),   // Dark red for first building
      color(40, 100, 50),   // Green for second building
      color(30, 60, 100)    // Dark blue for third building
    ];
    this.color = colors[position];

    this.windows = [];

    // Create four windows for each building in a 2x2 grid
    // Windows are now more centralized and closer together
    let windowSize = 60;
    let windowSpacing = 35; // Reduced spacing between windows

    // Calculate the center of the building
    let centerX = this.x + this.width / 2;
    let centerY = this.y + this.height / 2;

    // Total width and height of the window group
    let totalWindowWidth = (2 * windowSize) + windowSpacing;
    let totalWindowHeight = (2 * windowSize) + windowSpacing;

    // Top-left corner of the window group
    let startX = centerX - totalWindowWidth / 2;
    let startY = centerY - totalWindowHeight / 2;

    // Create 2x2 grid of windows
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        this.windows.push({
          x: startX + col * (windowSize + windowSpacing),
          y: startY + row * (windowSize + windowSpacing),
          size: windowSize
        });
      }
    }
  }

  display() {
    // Draw building
    fill(this.color);
    rect(this.x, this.y, this.width, this.height);

    // Draw windows
    fill(255, 255, 100); // Yellow windows
    for (let window of this.windows) {
      rect(window.x, window.y, window.size, window.size);
    }
  }
}

class Cone {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color(255, 100, 0);
  }

  display() {
    fill(this.color);
    triangle(
      this.x, this.y - this.size,
      this.x - this.size / 2, this.y,
      this.x + this.size / 2, this.y
    );
  }
}

class Seagull {
  constructor(x, y, speed) {
    this.position = createVector(x, y);
    this.velocity = createVector(speed, 0);
    this.size = random(15, 25);
    this.wingOffset = 0;
  }

  update() {
    // Move seagull
    this.position.add(this.velocity);

    // Wrap around screen
    if (this.position.x > width + this.size) {
      this.position.x = -this.size;
      this.position.y = random(100, 300);
    }

    // Flap wings
    this.wingOffset = sin(frameCount * 0.2) * 10;
  }

  display() {
    push();
    translate(this.position.x, this.position.y);

    // Draw wings
    stroke(0);
    strokeWeight(1);
    line(0, 0, -this.size, this.wingOffset);
    line(0, 0, this.size, this.wingOffset);

    // Draw body
    fill(255);
    noStroke();
    ellipse(0, 0, this.size * 0.8, this.size * 0.4);
    pop();
  }
}