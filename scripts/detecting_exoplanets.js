let animContainer = document.getElementById("animationContainer");
let canvas = document.getElementById('mainCanvas');
let chartCanvas = document.getElementById('chartCanvas');
let chartCtx = chartCanvas.getContext('2d')
let ctx = canvas.getContext("2d");
let cx = canvas.width/2;
let cy = canvas.height/2;

let starRadius = 75;
let planetRelativeRadius = 0.1 ;
let inclination = 30;
let orbitalRadius = 1.5 * starRadius;
let angularPosition = 0; // planet position on the orbit. 0 to 360 degrees.
let orbitalPeriod = 1; // Days
let starGradient = ctx.createRadialGradient(cx,cy,0,cx,cy,starRadius);
starGradient.addColorStop(0.15,'white');
starGradient.addColorStop(1,'rgba(248, 148, 6, 1)');

let maxZoom  = 10;
let imgsLoaded = 0;
let scaleX = 1;
let scaleY =1;
// X and Y coordinates of the point to zoom to. Default point is (0,0)
let originX = 0;
let originY = 0;
// Initial zoom levels.
let zx = 1;
let zy = 1;
let globalAnimationId = 0;
// Controls hide timer
let timer = 0;

// Full screen controls
function customRequestFullScreen(){
    
  if (animContainer.requestFullscreen) {
      animContainer.requestFullscreen();
    } else if (animContainer.mozRequestFullScreen) { /* Firefox */
      animContainer.mozRequestFullScreen();
    } else if (animContainer.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      animContainer.webkitRequestFullscreen();
    } else if (animContainer.msRequestFullscreen) { /* IE/Edge */
      animContainer.msRequestFullscreen();
    }
    
  screen.orientation.lock('landscape').then(toggleFullScreen,toggleFullScreen);    
  $('#fullScreenButton').attr('onclick','customExitFullScreen();');
  $('#fullScreenButton').html('Exit Full Screen');
}

function toggleFullScreen(){
  //Called when promise returns from customRequestFullScreen
  $('#animationContainer').addClass('fullscreen');
  $('#mainCanvas').addClass('fullscreen');
  $('#chartCanvas').addClass('fullscreen');
  $('#animationControls').addClass('fullscreen');
  $('#mainCanvas').on('mousemove',hideControls);
  $('#mainCanvas').on('touchstart',hideControls);
  $('#chartCanvas').on('mousemove',hideControls);
  $('#chartCanvas').on('touchstart',hideControls);
  hideControls();
}

let hideControls= function(){
  $('#animationControls').css('display','inline-flex');
  clearTimeout(timer);
  timer = setTimeout(function(){$('#animationControls').fadeOut();},1000);
}

function customExitFullScreen(){
  document.exitFullscreen();
  screen.orientation.unlock();
  $('#animationContainer').removeClass('fullscreen');
  $('#mainCanvas').removeClass('fullscreen');
  $('#chartCanvas').removeClass('fullscreen');
  $('#animationControls').removeClass('fullscreen');
  clearTimeout(timer);
  $('#mainCanvas').off();
  $('#chartCanvas').off();
  $('#animationControls').css('display','inline-flex');
  fullScreenButton.setAttribute('onclick','customRequestFullScreen();');
  fullScreenButton.innerHTML = 'Full Screen';
}

// Exit full screen view by using the back button instead of the fullscreen button 
var onFullScreenChange = function(){
  fullScreenElement = document.fullscreenElement ||
  document.msFullscreenElement ||
  document.mozFullScreenElement ||
  document.webkitFullscreenElement;
  if(!!fullScreenElement===false){
  $('#animationContainer').removeClass('fullscreen');
  $('#mainCanvas').removeClass('fullscreen');
  $('#chartCanvas').removeClass('fullscreen');
  $('#animationControls').removeClass('fullscreen');
  clearTimeout(timer);
  $('#mainCanvas').off();
  $('#chartCanvas').off();
  $('#animationControls').css('display','inline-flex');
  fullScreenButton.setAttribute('onclick','customRequestFullScreen();');
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

let drawSemiOrbit = function(ctx,cx, cy, radius, inclination ,direction) {
  let rx = radius;
  let ry = rx*Math.sin(inclination%180*Math.PI/180);
  ctx.beginPath();
  ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI,direction);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "grey";
  ctx.stroke();
}

let drawStar = function(ctx ,cx, cy, radius){
  ctx.beginPath();
  ctx.arc(cx,cy,radius,0,2*Math.PI);
  ctx.closePath();
  ctx.fillStyle = starGradient;
  ctx.fill();
}

let drawPlanet = function(ctx,cx,cy,angularPosition,radius,orbitalRadius){
  let rx = orbitalRadius;
  let ry = orbitalRadius*Math.sin(inclination*Math.PI/180);
  let orbitX = cx;
  let orbitY = cy;
  let planetX = orbitX-rx*Math.cos(angularPosition*Math.PI/180);
  let planetY = orbitY+ry*Math.sin(angularPosition*Math.PI/180);
  ctx.beginPath();
  ctx.fillStyle="#000000";
  ctx.arc(planetX,planetY,radius,0,2*Math.PI);
  ctx.closePath();
  ctx.fill();
  // console.log([planetX,planetY]);
}

let zoomSequence = function(){
  zx+=0.02;
  zy+=0.02;
  if(zx>=10){cancelAnimationFrame(globalAnimationId);ctx.resetTransform();
  ctx.drawImage(img,0,0);drawSystemAndCurve();return 0;}
  // console.log(zx);
  ctx.save();
  ctx.scale(zx,zy);
  ctx.drawImage(img,-originX,-originY);
  ctx.restore();
  requestAnimationFrame(zoomSequence);
}

let zoomToStar = function(originX = 0,originY = 0){
  scaleX = canvas.width/img.width;
  scaleY = canvas.height/img.height;
  ctx.scale(scaleX,scaleY);
  // Translate origin to point to be zoomed to
  ctx.translate(originX,originY);
  // Draw image with the zoom point remaining same at every zoom level
  ctx.drawImage(img,-originX,-originY);
  globalAnimationId = requestAnimationFrame(zoomSequence);
}

let drawStarSystem = function(starRadius,orbitalRadius,inclination,angularPosition){
  let [height,width]=resizeCanvas('mainCanvas');
  let centerX = width/2;
  let centerY = height/2;
  if(angularPosition<=180){
   drawSemiOrbit(ctx,centerX,centerY,orbitalRadius,inclination,1); 
   drawStar(ctx,centerX,centerY,starRadius);
   drawSemiOrbit(ctx,centerX,centerY,orbitalRadius,inclination,0); 
   drawPlanet(ctx,centerX,centerY,angularPosition,planetRelativeRadius*starRadius,orbitalRadius);
  //  console.log(angularPosition);
  }
  else{
    drawSemiOrbit(ctx,centerX,centerY,orbitalRadius,inclination,1); 
    drawPlanet(ctx,centerX,centerY,angularPosition,planetRelativeRadius*starRadius,orbitalRadius);
    drawStar(ctx,centerX,centerY,starRadius);
    drawSemiOrbit(ctx,centerX,centerY,orbitalRadius,inclination,0);
  }
}

let calcTransitParameters = function(r_star,r_planet,orbitalRadius,inclination){
  let rx = orbitalRadius;
  let ry = rx*Math.sin(inclination*Math.PI/180);
  let angularPositions = [];
  let d = [];
  let z = 0;
  let p = 0;
  let res = [];
  let i = 0;
  for(i=0;i<=180;i+=0.1){
    angularPositions.push(i);
  }
  let a = 0;
  for(i=0;i<angularPositions.length;i++){
    a = angularPositions[i];
    dx = -rx*Math.cos(a*Math.PI/180);
    dy = ry*Math.sin(a*Math.PI/180);
    /* Using cartesian distance between two points which here are the center 
    (0,0) and the point on the ellipstical orbit given by: 
    (-rx * cos(angularPosition), ry * sin(angularPosition))
    */
    d.push(Math.sqrt(dx*dx + dy*dy));
  }

  for(i=0;i<d.length;i++){
    z = d[i]/r_star;   
    p = r_planet/r_star;
    let temp=0;
    if((1+p)<z){
        temp = 0;}    
    else if(z<=(1-p)){
        temp = p*p;}
    else if(z<=(p-1)){
        temp = 1;}
    else if((Math.abs(1-p)<z) && (z<=1+p)){
        k1 = Math.acos((1-p*p+z*z)/(2*z));
        k0 = Math.acos((p*p+z*z-1)/(2*p*z));
        temp=(p*p*k0 + k1 - Math.sqrt(z*z - Math.pow((1+z*z-p*p),2)/4))/Math.PI;
      }
    res.push(temp);
  }
  res = res.map(function(a){return 1-a;});
  return {
    z: z,
    p: p,
    distances: d,
    relativeBrightness: res,
    transitDepth: res.reduce(function(a,b){return Math.min(a,b);}),
  }
}

let drawTransitCurve = function(canvasId,transitParameters){
  [height,width] = resizeCanvas(canvasId);
  let canvas = document.getElementById(canvasId);
  let ctx = canvas.getContext('2d');
  let pixelX = 0;
  let pixelY = 0;
  let pixelCoords = [];
  let dataAxisXMax = 3600;
  let dataAxisXMin = 0;
  let dataAxisYMax = 100;
  let dataAxisYMin = Math.floor(transitParameters.transitDepth*100 - 1);
  paddingSides = Math.round(0.12 * width);
  paddingTopBottom = Math.round(0.12 * height);
  let canvasXRange = width-2*paddingSides;
  let canvasYRange = height-2*paddingTopBottom;
  let gridLinesX = 36;
  let gridLinesY = 20;
  ctx.strokeStyle = "#dfdfdf";
  ctx.translate(0.5,0.5);
  ctx.beginPath();
  // Chart outline
  ctx.rect(paddingSides,paddingTopBottom,canvasXRange,canvasYRange);
  // Chart grid
  for(let dist = 0;dist<canvasYRange;dist+=canvasYRange/gridLinesY){
    ctx.moveTo(paddingSides,paddingTopBottom+dist);
    ctx.lineTo(paddingSides+canvasXRange,paddingTopBottom+dist);
  }
  for(let dist = 0;dist<canvasXRange;dist+=canvasXRange/gridLinesX){
    ctx.moveTo(paddingSides+dist,paddingTopBottom);
    ctx.lineTo(paddingSides+dist,paddingTopBottom+canvasYRange);
  }
  ctx.stroke();

  let xOffset = paddingSides;
  let yOffset = paddingTopBottom;
  let fontSize = paddingTopBottom/3;
  let text = "Transit Light Curve"
  ctx.font = fontSize + "px Verdana";
  let startX = width/2 - ctx.measureText(text).width/2;
  ctx.fillText(text,startX,2*paddingTopBottom/3);
  // Transit Light Curve drawing to chartCanavs
  relativeBrightness = transitParameters.relativeBrightness;
  let xAxisPoints = 2*(relativeBrightness.length-1);
  for(let index = 0;index<xAxisPoints;index++){
    if(index<relativeBrightness.length){
    [pixelX , pixelY] = mapToCanvas(canvasXRange,canvasYRange,dataAxisXMin,dataAxisYMin,index,100*relativeBrightness[index],dataAxisXMax,dataAxisYMax);
    }
    else{
    [pixelX , pixelY] = mapToCanvas(canvasXRange,canvasYRange,dataAxisXMin,dataAxisYMin,index,100,xAxisPoints,dataAxisYMax);
    }
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(xOffset+pixelX,yOffset+pixelY,1,1);
    pixelCoords.push([pixelX,pixelY]);
  }
  
  for(let i=0,j=0;i<=gridLinesX || j<=gridLinesY;i+=4,j+=4){
   let valueX = dataAxisXMin + i * (dataAxisXMax-dataAxisXMin)/gridLinesX;
   let valueY = dataAxisYMax - j * (dataAxisYMax-dataAxisYMin)/gridLinesY;
   ctx.fillStyle = "#1f1f1f";
   ctx.font = fontSize/1.2 + "px Verdana";
   if(i<gridLinesX){
    ctx.fillText(Math.round(10*valueX/dataAxisXMax)/10,paddingSides + i * canvasXRange/gridLinesX,height-2/7*paddingTopBottom);
   }
   else if(i=gridLinesX){
    ctx.fillText(Math.round(10*valueX/dataAxisXMax)/10+" days",paddingSides + i * canvasXRange/gridLinesX,height-2/7*paddingTopBottom);
   }
   if(j<=gridLinesY){
    ctx.fillText(valueY+"%",1/7*paddingSides,paddingTopBottom + j * canvasYRange/gridLinesY);
   }

  }
  
  return pixelCoords;
}

function resizeCanvas(canvasId){
  let canvas = document.getElementById(canvasId);
  let height = $('#'+canvasId).height();
  let width = $('#'+canvasId).width();
  // Resize canvas rendering grid to css canvas dimensions
  canvas.height = height;
  canvas.width = width; 
  return [height,width];
}

function mapToCanvas(canvasXRange,canvasYRange,dataAxisXMin,dataAxisYMin,dataPointX,dataPointY,dataAxisXMax,dataAxisYMax){
  let canvasPointX = (canvasXRange * (dataPointX - dataAxisXMin) / (dataAxisXMax-dataAxisXMin));
  let canvasPointY = (canvasYRange * (dataAxisYMax - dataPointY) / (dataAxisYMax-dataAxisYMin));
  return [canvasPointX,canvasPointY];
}

let drawSystemAndCurve = function(){
  angularPosition += 1;
  angularPosition %= 360;
  let h = canvas.height;
  let w = canvas.width;
  /*if (h != $('#mainCanvas').css('height') || w!= $('#mainCanvas').css('width')) {
  [h,w] = resizeCanvas('mainCanvas');
  }*/
  drawStarSystem(starRadius,orbitalRadius,inclination,angularPosition);
  // transit curve update
  /*if (h != $('#chartCanvas').css('height') || w!= $('#chartCanvas').css('width')) {
    let obj =calcTransitParameters(starRadius,planetRelativeRadius*starRadius,orbitalRadius,0);
    pixelCoords = drawTransitCurve("chartCanvas",obj);
    console.log('called'+h+""+w);
  }*/
  chartCtx.fillStyle = "#000000";
  let [tempX,tempY] = pixelCoords[angularPosition*9+1];
  
  chartCtx.beginPath();
  chartCtx.clearRect(0,0,chartCanvas.width,chartCanvas.height);
  chartCtx.drawImage(basePlot,0,0);
  chartCtx.ellipse(paddingSides + tempX , paddingTopBottom + tempY,10,10,0,0,Math.PI*2);
  chartCtx.closePath();
  chartCtx.fill();
  requestAnimationFrame(drawSystemAndCurve);
}

let img = new Image();
let imgPath = "https://live.staticflickr.com/3820/10563093726_2945540bb8_b.jpg";
img.src = imgPath;
img.onload = function(){
  originX = img.width /2;
  originY = 2*img.height /3;
  // Once image loads, get animation controls ready.
  zoomToStar(originX,originY);
}

let obj =calcTransitParameters(starRadius,planetRelativeRadius*starRadius,orbitalRadius,0);
let basePlot = new Image();

pixelCoords = drawTransitCurve("chartCanvas",obj);

basePlot.src = chartCanvas.toDataURL();