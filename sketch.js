let stadiumIndex = 0;
const stadiums = [];

function setup() {
  createCanvas(800, 600);
  stadiums.push(drawMaracana);
  stadiums.push(drawWembley);
  stadiums.push(drawFNBStadium);
  stadiums.push(drawMCG);
  stadiums.push(drawAzteca);
}

function draw() {
  background(0);
  stadiums[stadiumIndex]();
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    stadiumIndex = (stadiumIndex + 1) % stadiums.length;
  } else if (keyCode === LEFT_ARROW) {
    stadiumIndex = (stadiumIndex - 1 + stadiums.length) % stadiums.length;
  }
}

function drawMaracana() {
  background(20, 50, 120);
  fill(50, 200, 50);
  arc(width / 2, height, width, height / 2, PI, TWO_PI); // Field
  fill(200);
  arc(width / 2, height - 50, width * 1.2, height / 3, PI, TWO_PI); // Stadium seating
  fill(255);
  ellipse(width / 2, height - 250, 30, 30); // Stadium lights
}

function drawWembley() {
  background(30, 30, 80);
  fill(60, 180, 60);
  arc(width / 2, height, width, height / 2, PI, TWO_PI);
  fill(180);
  arc(width / 2, height - 60, width * 1.1, height / 3, PI, TWO_PI);
  fill(255, 255, 0);
  rect(width / 2 - 100, height - 200, 200, 10); // Iconic Wembley arch (simplified)
}

function drawFNBStadium() {
  background(100, 50, 20);
  fill(100, 150, 50);
  arc(width / 2, height, width, height / 2, PI, TWO_PI);
  fill(180, 90, 40);
  arc(width / 2, height - 70, width * 1.3, height / 2, PI, TWO_PI);
  fill(255);
  ellipse(width / 2 - 200, height - 200, 30, 30);
  ellipse(width / 2 + 200, height - 200, 30, 30);
}

function drawMCG() {
  background(10, 70, 30);
  fill(50, 160, 50);
  arc(width / 2, height, width, height / 2, PI, TWO_PI);
  fill(170);
  arc(width / 2, height - 80, width * 1.15, height / 3, PI, TWO_PI);
  fill(255);
  for (let i = 0; i < 5; i++) {
    ellipse(width / 2 - 150 + i * 75, height - 250, 20, 20);
  } // Stadium lights
}

function drawAzteca() {
  background(80, 10, 10);
  fill(30, 140, 30);
  arc(width / 2, height, width, height / 2, PI, TWO_PI);
  fill(120);
  arc(width / 2, height - 40, width * 1.25, height / 3, PI, TWO_PI);
  fill(255);
  for (let i = 0; i < 6; i++) {
    ellipse(width / 2 - 200 + i * 80, height - 230, 25, 25);
  } // Stadium lights
}