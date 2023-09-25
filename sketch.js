/* jshint esversion: 8 */ // Initialise ES8 to use Async functions

// Dynamic Identity Project for the ANU Institude for Climate, Energy & Disaster Solutions
// By Kate, Diane and Zac

// Prompt the user to see whether to generate a static or interactive screen design
var generation = prompt(
  "Type 1 to generate a static design, or 0 to generate a interactive screen design"
);
while (generation != "0" && generation != "1") {
  generation = prompt(
    "You did not respond with a valid number. Type 1 to generate a static design, or 0 to generate a interactive screen design"
  );
}

// Initialise some variables
// Variables to create the images
var fanPic = "";
var randomPexelsImage;

// Variables to track weather data
var days;
var windgust;
var windspeed;

// Variables for the music data
let fft;
let windChimes;
let soundVolume;
let currentSize = 1.5;
let sizeSpeed = 0.1;

// Variables for the fan
var angle = 0;
var fanSide;

// An async function to fetch live weather data from the Visual Crossing API
async function getWeather() {
  // Await our get request, then assign the json to an object
  var response = await fetch( "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/Canberra?unitGroup=metric&include=days&key=APIKEY&contentType=json",
    {
      method: "GET",
      headers: {},
    }
  );
  if (!response.ok) {
    throw response;
  }
  var data = await response.json();
  // Using the newly assigned object, grab the current windgust and windspeed
  days = data.days;
  windgust = days[0].windgust;
  windspeed = days[0].windspeed;
}

// An async function to fetch a random nature image from the Pexels
async function getImage(){
    fetch("https://api.pexels.com/v1/search?query=nature", {
    headers: {
      Authorization: "APIKEY",
    },
  })
    // Await our get request, then assign the json to an object
    .then((response) => response.json())
    .then((data) => {
      // Using the newly assigned object, grab the image and load it into the Canvas
      var randomPexelsImage = data.photos[Math.floor(Math.random() * data.photos.length)];
      var imageUrl = randomPexelsImage.src.large2x;
      fanPic = loadImage(imageUrl);
    });
}

// Our preload function
function preload() {
  getWeather();
  getImage();
  windChimes = loadSound("windchimes_cut.mp3"); // Load our music
  fanSide = random([0, 400]); // Generate a random side of the canvas to place the fan on
}

// Our setup function
function setup() {
  createCanvas(400, 650);
  angleMode(DEGREES);
  frameRate(90);

  // Intialise the FFT algorithm, setting its input to our audiofile
  fft = new p5.FFT();
  fft.setInput(windChimes);

  if (generation === "0") {
    windChimes.play(); // Play the music if in an interactive setting
  }
}

// Our draw function
function draw() {
  // If statements to check whether we're generating a static or moving design
  if (generation === "1") {
    background(255, 255, 255);
    fan(fanSide, 325, 1.5); // Call the fan function
    noLoop();
  } else if (generation === "0") {
    background(255, 255, 255);

    // Analyze the given FFT, add its results to the array spectrum
    var spectrum = fft.analyze();
    var sum = 0;
    
    // Iterate over the array and calculate an average
    for (let i = 0; i < spectrum.length; i++) {
      sum += spectrum[i];
    }
    var average = sum / spectrum.length;
    // Map the average energy level values within the desired size range
    var fanSize = map(average, 0, 255, 0.5, 5);
    // Use lerp to apply a smooth motion to the movement animations between the two desired max and minimum sizes
    currentSize = lerp(currentSize, fanSize, sizeSpeed);
    
    // Draw the fans
    fan(400, 325, 1);
    fan(100, 325, currentSize * 0.5);
  }
}

// The fan function. This function generates our fan and rotates it accordingly
function fan(xpos, ypos, fanSize) {
  for (let i = 0; i < 7; i++) {
    // Run the blade() function 6 times.
    push();
    translate(xpos, ypos);
    rotate(angle + i * windgust * 2); // Determine the spacing of the fan based on the days windgust
    blade(fanSize);
  }
  if (windspeed) {
    angle += windspeed / 7; // Change the angle of the fan in accordance with the days windspeed
  }
}

// The blade function. This draws blades in groups of 3, clipping the grabbed image behind it.
function blade(fanSize) {
  scale(fanSize);

  drawingContext.save();
  fill(0);
  noStroke();
  beginShape();
  vertex(0, -10);
  vertex(-25, -70);
  vertex(0, -200);
  vertex(0, -10);
  endShape();
  drawingContext.clip();
  image(fanPic, -300, -300, height + 50, width + 50);
  drawingContext.restore();

  drawingContext.save();
  beginShape();
  vertex(10, 5);
  vertex(65, 15);
  vertex(150, 110);
  vertex(10, 5);
  endShape();
  drawingContext.clip();
  image(fanPic, -300, -300, height + 50, width + 50);
  drawingContext.restore();

  drawingContext.save();
  beginShape();
  vertex(-10, 5);
  vertex(-25, 50);
  vertex(-150, 110);
  vertex(-10, 5);
  endShape();
  drawingContext.clip();
  image(fanPic, -300, -300, height + 50, width + 50);
  drawingContext.restore();
  fancenter();
  pop();
}

// The fan center function. Draws the center of the fan.
function fancenter() {
  drawingContext.save();
  noStroke();
  beginShape();
  ellipse(0, 0, 20, 20);
  endShape();
  drawingContext.clip();
  image(fanPic, -300, -300, height, width);
  drawingContext.restore();
}
