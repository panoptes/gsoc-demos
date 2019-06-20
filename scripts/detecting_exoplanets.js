let animContainer = document.getElementById("animationContainer");
let mainCanvas = document.getElementById('mainCanvas');
let chartCanvas = document.getElementById('chartCanvas');
let chartCtx = chartCanvas.getContext('2d')
let ctx = mainCanvas.getContext("2d");
let cx = mainCanvas.width / 2;
let cy = mainCanvas.height / 2;

let starRadius = 75;
let planetRelativeRadius = 0.1;
let inclination = 30;
let orbitalRadius = 1.5 * starRadius;
let angularPosition = 0; // planet position on the orbit. 0 to 360 degrees.
let orbitalPeriod = 2.2; // Days
let starGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, starRadius);
starGradient.addColorStop(0.15, 'white');
starGradient.addColorStop(1, 'rgba(248, 148, 6, 1)');
let cachedParameters = {
  rStar:starRadius,
  rPlanet:planetRelativeRadius,
  orbit:orbitalRadius,
  inclination:inclination,
}

let maxZoom = 10;
let imgsLoaded = 0;
// X and Y coordinates of the point to zoom to. Default point is (0,0)
let originX = 0;
let originY = 0;
// Initial zoom levels.
let zx = 1;
let zy = 1;
let starSystemAnimationId = 0;
let globalAnimationId = 0;
let globalParameterUpdateFlag = false;
// Timer that hides the controls. Time set in 
let timer = 0;
// Play and pause controls
let current = 0;
let cachedCurrent = 0;
let subtitleText = document.getElementById('subtitles');
let playButton = document.getElementById('playButton');
let kioskButton = document.getElementById('kioskButton');
let animationButton = document.getElementById('animationButton');
let globalAnimationLoop = false; //True to enter kiosk mode.
let updateAnimationParameters = function (r_star = starRadius, relative_planet = planetRelativeRadius, orbital_radius = orbitalRadius, inclination_angle = inclination) {
  globalParameterUpdateFlag = true;
  starRadius = r_star;
  planetRelativeRadius = relative_planet;
  orbitalRadius = orbital_radius;
  inclination = inclination_angle;
}

// Range Sliders for animation parameters
let starSlider = document.getElementById('starSlider');
let inclinationSlider = document.getElementById('inclinationSlider');
let orbitalSlider = document.getElementById('orbitalSlider');
let planetSlider = document.getElementById('planetSlider');

let createSlider = function (slider, start, min, max, sliderLabelId) {
  noUiSlider.create(slider, {
    start: start,
    connect: [true, false],
    range: {
      'min': min,
      'max': max,
    }
  })
  $('#' + sliderLabelId).html(start);
}


// Creating sliders
createSlider(starSlider, starRadius, 0, mainCanvas.width / 3, 'star-radius-label');
createSlider(planetSlider, planetRelativeRadius, 0, 1, 'planet-relative-radius-label');
createSlider(orbitalSlider, orbitalRadius, starRadius * (1 + planetRelativeRadius), Math.min(mainCanvas.height / 2, mainCanvas.width / 2), 'orbital-distance-label');
createSlider(inclinationSlider, inclination, 0, 90, 'inclination-label');
// Update Slider Range
let updateSlider = function (slider, min, max) {
  slider.noUiSlider.updateOptions({
    range: {
      'min': min,
      'max': Math.max(min+1,max),
    }
  });
  let temp = Number(slider.noUiSlider.get());
  // console.log(temp);
  if (isNaN(temp)) {
    temp = min;
    // console.log(min);
  }
  slider.noUiSlider.set(Math.max(temp, min));
  // console.log([min,Math.max(temp,min),temp]);
}
// Disply slider value
starSlider.noUiSlider.on("update", function () {
  let temp = Number(starSlider.noUiSlider.get());
  $("#star-radius-label").html(temp);
  updateSlider(orbitalSlider, starRadius * (1 + planetRelativeRadius), Math.min(mainCanvas.height / 2, mainCanvas.width / 2));
  updateAnimationParameters(temp, planetRelativeRadius, orbitalRadius, inclination);
});
planetSlider.noUiSlider.on("update", function () {
  let temp = Number(planetSlider.noUiSlider.get());
  $("#planet-relative-radius-label").html(temp);
  updateSlider(orbitalSlider, starRadius * (1 + planetRelativeRadius), Math.min(mainCanvas.height / 2, mainCanvas.width / 2));
  updateAnimationParameters(starRadius, temp, orbitalRadius, inclination);
});
orbitalSlider.noUiSlider.on("update", function () {
  let temp = Number(orbitalSlider.noUiSlider.get());
  $("#orbital-distance-label").html(temp);
  updateAnimationParameters(starRadius, planetRelativeRadius, temp, inclination);
});
inclinationSlider.noUiSlider.on("update", function () {
  let temp = Number(inclinationSlider.noUiSlider.get());
  $("#inclination-label").html(temp);
  updateAnimationParameters(starRadius, planetRelativeRadius, orbitalRadius, temp);
});

// function that converts height/width string to number
// Eg: "326.47px" to 326.47
function dimensionsFromString(str) {
  str = str.substr(0, str.indexOf('px'));
  return Number(str);
}
// Full screen controls
function customRequestFullScreen() {
  if (animContainer.requestFullscreen) {
    animContainer.requestFullscreen();
  } else if (animContainer.mozRequestFullScreen) { /* Firefox */
    animContainer.mozRequestFullScreen();
  } else if (animContainer.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    animContainer.webkitRequestFullscreen();
  } else if (animContainer.msRequestFullscreen) { /* IE/Edge */
    animContainer.msRequestFullscreen();
  }
  screen.orientation.lock('landscape').then(toggleFullScreen, toggleFullScreen);
  $('#fullScreenButton').attr('onclick', 'customExitFullScreen();');
  $('#fullScreenButton').html('Exit Full Screen');
}

function toggleFullScreen() {
  //Called when promise returns from customRequestFullScreen
  $('#animationContainer').addClass('fullscreen');
  $('#mainCanvas').addClass('fullscreen');
  $('#chartCanvas').addClass('fullscreen');
  $('#animationControls').addClass('fullscreen');
  $('#mainCanvas').on('mousemove', hideControls);
  $('#mainCanvas').on('touchstart', hideControls);
  $('#chartCanvas').on('mousemove', hideControls);
  $('#chartCanvas').on('touchstart', hideControls);
  hideControls();
}

let hideControls = function () {
  $('#animationControls').css('display', 'inline-flex');
  clearTimeout(timer);
  timer = setTimeout(function () { $('#animationControls').fadeOut(); }, 1000);
}

function customExitFullScreen() {
  document.exitFullscreen();
  screen.orientation.unlock();
  $('#animationContainer').removeClass('fullscreen');
  $('#mainCanvas').removeClass('fullscreen');
  $('#chartCanvas').removeClass('fullscreen');
  $('#animationControls').removeClass('fullscreen');
  clearTimeout(timer);
  $('#mainCanvas').off();
  $('#chartCanvas').off();
  $('#animationControls').css('display', 'inline-flex');
  fullScreenButton.setAttribute('onclick', 'customRequestFullScreen();');
  fullScreenButton.innerHTML = 'Full Screen';
}

// Exit full screen view by using the back button instead of the fullscreen button 
var onFullScreenChange = function () {
  fullScreenElement = document.fullscreenElement ||
    document.msFullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement;
  if (!!fullScreenElement === false) {
    $('#animationContainer').removeClass('fullscreen');
    $('#mainCanvas').removeClass('fullscreen');
    $('#chartCanvas').removeClass('fullscreen');
    $('#animationControls').removeClass('fullscreen');
    clearTimeout(timer);
    $('#mainCanvas').off();
    $('#chartCanvas').off();
    $('#animationControls').css('display', 'inline-flex');
    fullScreenButton.setAttribute('onclick', 'customRequestFullScreen();');
    fullScreenButton.innerHTML = 'Full Screen';
  }

}

if (document.onfullscreenchange === null)
  document.onfullscreenchange = onFullScreenChange;
else if (document.onmsfullscreenchange === null)
  document.onmsfullscreenchange = onFullScreenChange;
else if (document.onmozfullscreenchange === null)
  document.onmozfullscreenchange = onFullScreenChange;
else if (document.onwebkitfullscreenchange === null)
  document.onwebkitfullscreenchange = onFullScreenChange;

// Animation Support Methods
let drawStarField = function (ctx,width,height,zoom) {

  // ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);
  for (i = 0; i < 1000/zoom; i++) {

    let x = Math.floor(Math.random() * width * zoom);
    let y = Math.floor(Math.random() * height * zoom);
    let radius = Math.floor(Math.random() * 2.5 * zoom );

    let a = Math.random();
    let colors = ["rgba(255,255,255,", "rgba(255,165,0,", "rgba(0,128,255,", "rgba(255,255,255,", "rgba(255,255,255,"];
    let index = Math.round(Math.random() * colors.length);
    ctx.beginPath();
    ctx.arc(x, y, radius, Math.PI * 2, 0, false);
    ctx.fillStyle = colors[index] + a + ")";
    ctx.fill();
    ctx.closePath();
    // console.log(a);
  }
}

let drawSemiOrbit = function (ctx, cx, cy, radius, inclination, direction) {
  let rx = radius;
  let ry = rx * (1 - Math.cos(inclination % 180 * Math.PI / 180));
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI, direction);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "grey";
  ctx.stroke();
}

let drawStar = function (ctx, cx, cy, radius) {
  starGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  starGradient.addColorStop(0.15, 'white');
  starGradient.addColorStop(1, 'rgba(248, 148, 6, 1)');
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fillStyle = starGradient;
  ctx.fill();
}

let drawPlanet = function (ctx, cx, cy, angularPosition, radius, orbitalRadius) {
  let rx = orbitalRadius;
  let ry = orbitalRadius * (1 - Math.cos(inclination * Math.PI / 180));
  let orbitX = cx;
  let orbitY = cy;
  let planetX = orbitX - rx * Math.cos(angularPosition * Math.PI / 180);
  let planetY = orbitY + ry * Math.sin(angularPosition * Math.PI / 180);
  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.arc(planetX, planetY, radius, 0, 2 * Math.PI);
  ctx.closePath();
  ctx.fill();
  // console.log([planetX,planetY]);
}

let zoomSequence = function () {
  zx += 0.05;
  zy += 0.05;
  if (zx >= 10) {
    cancelAnimationFrame(globalAnimationId); ctx.resetTransform();
    resizeCanvas('mainCanvas');
    drawStarField(ctx,mainCanvas.width,mainCanvas.height,10);
    img.src = mainCanvas.toDataURL();
    nextSequence(); 
    zx = 1;
    zy = 1;
    return 0;
  }
  resizeCanvas('mainCanvas');
  drawStarField(ctx,mainCanvas.width,mainCanvas.height,zx);
  img.src = mainCanvas.toDataURL();
  ctx.drawImage(img,0,0);
  drawStarSystem(starRadius,orbitalRadius,inclination,angularPosition,zx/10);
  requestAnimationFrame(zoomSequence);
}

let drawStarSystem = function (starRadius, orbitalRadius, inclination, angularPosition,zoom = 1) {
  let height = mainCanvas.height;
  let width = mainCanvas.width;
  // Resizing clears the canvas.
  let centerX = width / 2;
  let centerY = height / 2;
  ctx.drawImage(img,0,0);
  starRadius *= zoom;
  orbitalRadius *= zoom;
  if (angularPosition <= 180) {
    drawSemiOrbit(ctx, centerX, centerY, orbitalRadius, inclination, 1);
    drawStar(ctx, centerX, centerY, starRadius);
    drawSemiOrbit(ctx, centerX, centerY, orbitalRadius, inclination, 0);
    drawPlanet(ctx, centerX, centerY, angularPosition, planetRelativeRadius * starRadius, orbitalRadius);
    //  console.log(angularPosition);
  }
  else {
    drawSemiOrbit(ctx, centerX, centerY, orbitalRadius, inclination, 1);
    drawPlanet(ctx, centerX, centerY, angularPosition, planetRelativeRadius * starRadius, orbitalRadius);
    drawStar(ctx, centerX, centerY, starRadius);
    drawSemiOrbit(ctx, centerX, centerY, orbitalRadius, inclination, 0);
  }
}

let calcTransitParameters = function (r_star, r_planet, orbitalRadius, inclination) {
  let rx = orbitalRadius;
  let ry = rx * (1 - Math.cos(inclination * Math.PI / 180));
  let angularPositions = [];
  let d = [];
  let z = 0;
  let p = 0;
  let res = [];
  let i = 0;
  for (i = 0; i <= 180; i += 0.1) {
    angularPositions.push(i);
  }
  let a = 0;
  for (i = 0; i < angularPositions.length; i++) {
    a = angularPositions[i];
    dx = -rx * Math.cos(a * Math.PI / 180);
    dy = ry * Math.sin(a * Math.PI / 180);
    /* Using cartesian distance between two points which here are the center 
    (0,0) and the point on the ellipstical orbit given by: 
    (-rx * cos(angularPosition), ry * sin(angularPosition))
    */
    d.push(Math.sqrt(dx * dx + dy * dy));
  }

  for (i = 0; i < d.length; i++) {
    z = d[i] / r_star;
    p = r_planet / r_star;
    let temp = 0;
    if ((1 + p) < z) {
      temp = 0;
    }
    else if (z <= (1 - p)) {
      temp = p * p;
    }
    else if (z <= (p - 1)) {
      temp = 1;
    }
    else if ((Math.abs(1 - p) < z) && (z <= 1 + p)) {
      k1 = Math.acos((1 - p * p + z * z) / (2 * z));
      k0 = Math.acos((p * p + z * z - 1) / (2 * p * z));
      temp = (p * p * k0 + k1 - Math.sqrt(z * z - Math.pow((1 + z * z - p * p), 2) / 4)) / Math.PI;
    }
    res.push(temp);
  }
  res = res.map(function (a) { return 1 - a; });
  return {
    z: z,
    p: p,
    distances: d,
    relativeBrightness: res,
    transitDepth: res.reduce(function (a, b) { return Math.min(a, b); }),
  }
}

let drawTransitCurve = function (canvasId, transitParameters) {
  let mainCanvas = document.getElementById(canvasId);
  let ctx = mainCanvas.getContext('2d');
  [height, width] = resizeCanvas(canvasId);
  let pixelX = 0;
  let pixelY = 0;
  let pixelCoords = [];
  let dataAxisXMax = 3600;
  let dataAxisXMin = 0;
  let dataAxisYMax = 100;
  let dataAxisYMin = Math.floor(transitParameters.transitDepth * 100 - 1);
  paddingSides = Math.round(0.12 * width);
  paddingTopBottom = Math.round(0.12 * height);
  let canvasXRange = width - 2 * paddingSides;
  let canvasYRange = height - 2 * paddingTopBottom;
  let gridLinesX = 36;
  let gridLinesY = 20;
  ctx.strokeStyle = "#dfdfdf";
  ctx.translate(0.5, 0.5);
  ctx.beginPath();
  // Chart outline
  ctx.rect(paddingSides, paddingTopBottom, canvasXRange, canvasYRange);
  // Chart grid
  for (let dist = 0; dist < canvasYRange; dist += canvasYRange / gridLinesY) {
    ctx.moveTo(paddingSides, paddingTopBottom + dist);
    ctx.lineTo(paddingSides + canvasXRange, paddingTopBottom + dist);
  }
  for (let dist = 0; dist < canvasXRange; dist += canvasXRange / gridLinesX) {
    ctx.moveTo(paddingSides + dist, paddingTopBottom);
    ctx.lineTo(paddingSides + dist, paddingTopBottom + canvasYRange);
  }
  ctx.stroke();

  let xOffset = paddingSides;
  let yOffset = paddingTopBottom;
  let fontSize = Math.min(paddingTopBottom / 3, 20);
  let text = "Transit Light Curve"
  ctx.font = fontSize + "px Verdana";
  let startX = width / 2 - ctx.measureText(text).width / 2;
  ctx.fillText(text, startX, 2 * paddingTopBottom / 3);
  // Transit Light Curve drawing to chartCanavs
  relativeBrightness = transitParameters.relativeBrightness;
  let xAxisPoints = 2 * (relativeBrightness.length - 1);
  for (let index = 0; index <= xAxisPoints; index++) {
    if (index < relativeBrightness.length) {
      [pixelX, pixelY] = mapToCanvas(canvasXRange, canvasYRange, dataAxisXMin, dataAxisYMin, index, 100 * relativeBrightness[index], dataAxisXMax, dataAxisYMax);
    }
    else {
      [pixelX, pixelY] = mapToCanvas(canvasXRange, canvasYRange, dataAxisXMin, dataAxisYMin, index, 100, xAxisPoints, dataAxisYMax);
    }
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(xOffset + pixelX, yOffset + pixelY, 1, 1);
    pixelCoords.push([pixelX, pixelY]);
  }

  for (let i = 0, j = 0; i <= gridLinesX || j <= gridLinesY; i += 4, j += 4) {
    let valueX = dataAxisXMin + i * (dataAxisXMax - dataAxisXMin) / gridLinesX;
    let valueY = dataAxisYMax - j * (dataAxisYMax - dataAxisYMin) / gridLinesY;
    ctx.fillStyle = "#1f1f1f";
    ctx.font = fontSize / 1.2 + "px Verdana";
    if (i < gridLinesX) {
      ctx.fillText(Math.round(orbitalPeriod * 10 * valueX / dataAxisXMax) / 10, paddingSides + i * canvasXRange / gridLinesX, height - 2 / 7 * paddingTopBottom);
    }
    else if (i = gridLinesX) {
      ctx.fillText(Math.round(orbitalPeriod * 10 * valueX / dataAxisXMax) / 10 + " days", paddingSides + i * canvasXRange / gridLinesX, height - 2 / 7 * paddingTopBottom);
    }
    if (j <= gridLinesY) {
      ctx.fillText(valueY + "%", 1 / 7 * paddingSides, paddingTopBottom + j * canvasYRange / gridLinesY);
    }

  }

  return pixelCoords;
}

function resizeCanvas(canvasId) {
  let mainCanvas = document.getElementById(canvasId);
  let height = $('#' + canvasId).height();
  let width = $('#' + canvasId).width();
  // Resize mainCanvas rendering grid to css mainCanvas dimensions
  mainCanvas.height = height;
  mainCanvas.width = width;
  return [height, width];
}

function mapToCanvas(canvasXRange, canvasYRange, dataAxisXMin, dataAxisYMin, dataPointX, dataPointY, dataAxisXMax, dataAxisYMax) {
  let canvasPointX = (canvasXRange * (dataPointX - dataAxisXMin) / (dataAxisXMax - dataAxisXMin));
  let canvasPointY = (canvasYRange * (dataAxisYMax - dataPointY) / (dataAxisYMax - dataAxisYMin));
  return [canvasPointX, canvasPointY];
}

let drawSystemAndCurve = function () {
  angularPosition += 1;
  angularPosition %= 360;
  let cssH = Math.floor(dimensionsFromString($('#chartCanvas').css('height')));
  let cssW = Math.floor(dimensionsFromString($('#chartCanvas').css('width')));
  let mainCssH = Math.floor(dimensionsFromString($('#mainCanvas').css('height')));
  let mainCssW = Math.floor(dimensionsFromString($('#mainCanvas').css('width')));
  // Main Canvas update
  if ( mainCssH!= mainCanvas.height || mainCssW != mainCanvas.width ) {
    let [h,w] = resizeCanvas('mainCanvas');
    drawStarField(ctx,w,h,10);
    img.src = mainCanvas.toDataURL();
  }
  

  // transit curve update
  if (cssH != chartCanvas.height || cssW != chartCanvas.width || globalParameterUpdateFlag) {
    let obj = calcTransitParameters(starRadius, planetRelativeRadius * starRadius, orbitalRadius, inclination);
    pixelCoords = drawTransitCurve("chartCanvas", obj);
    basePlot.src = chartCanvas.toDataURL();
    // Update the base plot when curve is redrawn.
    globalParameterUpdateFlag = false;
  }
  drawStarSystem(starRadius, orbitalRadius, inclination, angularPosition);
  chartCtx.fillStyle = "white";
  let [tempX, tempY] = pixelCoords[angularPosition * 10];
  chartCtx.beginPath();
  chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
  chartCtx.drawImage(basePlot, 0, 0);
  chartCtx.ellipse(paddingSides + tempX, paddingTopBottom + tempY, 6, 6, 0, 0, Math.PI * 2);
  chartCtx.closePath();
  chartCtx.fill();
  starSystemAnimationId = requestAnimationFrame(drawSystemAndCurve);
}


/* ANIMATION SEQUENCES STORED AS OBJECTS IN AN ARRAY */
let frames = [];
// SEQUENCE 1 - ZOOMSEQUENCE
frames.push({
  sequence:zoomSequence,
  subtitles: "When we look up at the night sky, we see countless stars. A large number of them have planets like our own Earth orbiting them",
});
// SEQUENCE 2 - STAR-SYSTEM ORBIT
frames.push({
  sequence:function(){resetSystemParameters();drawSystemAndCurve();setTimeout(nextSequence,8000);},
  subtitles:"These exoplanets can’t be seen directly because they are hidden in the glare of their star.",
});
// SEQEUNCE 3 - ONLY SUBTITLES
frames.push({
  sequence:function(){resetSystemParameters();setTimeout(nextSequence,8000);},
  subtitles:"Instead we use the transit method to detect these exoplanets. The principle is simple, when an exoplanet passes in front of its star during its orbit, the light coming from the star is partially blocked by the planet",
})
// SEQEUNCE 4 - ONLY SUBTITLES
frames.push({
  sequence:function(){resetSystemParameters();setTimeout(nextSequence,8000);},
  subtitles:"By watching how the star’s brightness changes, we can identify if there are any exoplanets in its orbit and examine their properties",
})
// SEQUENCE 5 - INCLINATION SET TO 90 DEG
frames.push({
  sequence:function(){resetSystemParameters();inclinationSlider.noUiSlider.set(90);cacheSystemParameters(false,false,false,true);setTimeout(nextSequence,10000);},
  subtitles: "When the planet’s orbit is inclined at 90 degrees from our position on Earth, the planet doesn’t cross the surface of the star and hence there is no change in the brightness of the star. We cannot detect exoplanets oriented this way using the transit method.",
});
// SEQUENCE 6 - INCLINATION SET TO 0 DEG
frames.push({
  sequence:function(){resetSystemParameters();inclinationSlider.noUiSlider.set(0);cacheSystemParameters(false,false,false,true);setTimeout(nextSequence,10000);},
  subtitles: "The decrease in brightness is maximum when the planet orbits at an inclination of 0 degrees -- the planet’s orbit is in line with the view from Earth."
});
// SEQUENCE 7 - INCLINATION CHANGES TILL TRANSIT DEPTH IS 0
frames.push({
  sequence:function(){resetSystemParameters();inclinationSlider.noUiSlider.set(75);cacheSystemParameters(false,false,false,true);setTimeout(nextSequence,10000);},
  subtitles:"For inclinations which are not 0, the planet may cross in front of the star, but it depends on how big the star is and how far away from the star the planet orbits.  At some point, as you increase the inclination, the planet will no longer transit and this method won’t see it.",
});
// SEQEUNCE 8 - CHANGE ORBITAL DISTANCE
frames.push({
  sequence:function(){resetSystemParameters();orbitalSlider.noUiSlider.set(123);cacheSystemParameters(false,false,true,false);setTimeout(nextSequence,10000);},
  subtitles:"If the planet does cross in front of the star, the distance of the exoplanet from the star doesn’t affect the depth of transit light curve, but it will effect the period (how long between transits) and their duration (how long the transit lasts)."
});
// SEQUENCE 9 - INCREASE PLANET RELATIVE RADIUS 
frames.push({
  sequence:function(){resetSystemParameters();planetSlider.noUiSlider.set(0.5);cacheSystemParameters(false,true,false,false);setTimeout(nextSequence,10000);},
  subtitles: "The relative size of the exoplanet with respect to the star affects the depth of the transit. The larger the planet, the bigger the decrease in the relative brightness of the star"
});
// SEQEUNCE 10 - DECREASE  PLANET RELATIVE RADIUS
frames.push({
  sequence:function(){resetSystemParameters();planetSlider.noUiSlider.set(0.1);cacheSystemParameters(false,true,false,false);setTimeout(nextSequence,10000);},
  subtitles: "The smaller the planet, lesser is the decrease in the relative brightness of the star. Play around with the parameters and see the changes to the transit light curve"
})
/* ANIMATION SEQUNECES END */
/* Play and Pause Animation. Bound to play button */
function play(){
  // restart if animation completed 
  if(current>frames.length){
      current=cachedCurrent;
  }
  else if(current===frames.length){
  cancelAnimationFrame(starSystemAnimationId);
  current = 0;
  cachedCurrent = 0;
  // 
  }
  // TO prevent multiple star system animations being called.
  globalAnimationId = requestAnimationFrame(nextSequence);
  playButton.setAttribute('onclick','pause();');
  playButton.innerHTML = '<i class="fa fa-pause"></i>';
}

function pause(){
  if (globalAnimationId!=="undefined"){
  cachedCurrent = current;
  current=frames.length+1;
  }
  playButton.setAttribute('onclick','play();');
  playButton.innerHTML = '<i class="fa fa-play"></i>';
}

function cacheSystemParameters(r_star=true,r_planet=true,orbital_radius=true,inclination_angle=true){
  if(r_star){cachedParameters.rStar = starRadius;}
  if(r_planet){cachedParameters.rPlanet = planetRelativeRadius;}
  if(orbital_radius){cachedParameters.orbit = orbitalRadius;}
  if(inclination_angle){cachedParameters.inclination = inclination;}
}
function resetSystemParameters(){
  starSlider.noUiSlider.set(cachedParameters.rStar);
  inclinationSlider.noUiSlider.set(cachedParameters.inclination);
  planetSlider.noUiSlider.set(cachedParameters.rPlanet);
  orbitalSlider.noUiSlider.set(cachedParameters.orbit);
}
// Kiosk mode i.e Animation looping
let setKioskMode = function(){
  globalAnimationLoop = true;
  fullScreenButton.click();
  $('#kioskButton').addClass('active');
  $('#animationButton').removeClass('active');
  $('#sandboxButton').removeClass('active');
  $('#parameterControls').addClass('hidden');
  $('#playButton').removeClass('hidden');
}

// Toggle Playground and Animation modes
let setAnimationMode  = function(){
  globalAnimationLoop = false;
  $('#kioskButton').removeClass('active');
  $('#animationButton').addClass('active');
  $('#sandboxButton').removeClass('active');
  $('#parameterControls').addClass('hidden');
  $('#playButton').removeClass('hidden');
}

let setSandboxMode = function(){
  globalAnimationLoop = false;
  $('#kioskButton').removeClass('active');
  $('#animationButton').removeClass('active');
  $('#sandboxButton').addClass('active');
  $('#parameterControls').removeClass('hidden');
  $('#playButton').addClass('hidden');
  if(current > frames.length){
  void(0);
  // If already paused do nothing.
  }
  else{
  pause();  
  }
}
kioskButton.onclick = setKioskMode;
animationButton.onclick = setAnimationMode;
sandboxButton.onclick = setSandboxMode;
// Playground --> Animation Controls not rendered.
// Animation --> PLayground sliders not rendered.
function nextSequence(){
  if((current===frames.length) && (globalAnimationLoop)){
    cancelAnimationFrame(starSystemAnimationId);
    cancelAnimationFrame(globalAnimationId);
    play();
  }
  else if (current === frames.length ){
      cancelAnimationFrame(globalAnimationId);
      playButton.setAttribute('onclick','play();');
      playButton.innerHTML = '<i class="fa fa-play"></i>';
      $('#sandboxButton').click();
      // if all frames have been played, ends animation and changes the Pause button to play button.
  }
  else if (current > frames.length ){
    cancelAnimationFrame(globalAnimationId);
    playButton.setAttribute('onclick','play();');
    playButton.innerHTML = '<i class="fa fa-play"></i>';
    
    // if pause button is pressed.
}
  else{
    globalAnimationId = requestAnimationFrame(frames[current].sequence);
    subtitleText.innerText = frames[current].subtitles; 
    current++;  
  }
}

let obj = calcTransitParameters(starRadius, planetRelativeRadius * starRadius, orbitalRadius, 0);
let basePlot = new Image();
pixelCoords = drawTransitCurve("chartCanvas", obj);
basePlot.src = chartCanvas.toDataURL();
let img = new Image();
resizeCanvas('mainCanvas');
// drawStarField(ctx,mainCanvas.width,mainCanvas.height,1);
// img.src = mainCanvas.toDataURL();


