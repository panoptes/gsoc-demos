let canvas = document.getElementById('mainCanvas');
let ctx = canvas.getContext("2d");
let cx = canvas.width/2;
let cy = canvas.height/2;

let starRadius = 150;
let planetRelativeRadius = 0.1 ;
let inclination = 30;
let orbitalDistance = 1.5 * starRadius;
let angularPosition = 0; // planet position on the orbit. 0 to 360 degrees.
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

let drawPlanet = function(ctx,angularPosition,radius){
  let rx = orbitalDistance;
  let ry = orbitalDistance*Math.sin(inclination*Math.PI/180);
  let orbitX = cx;
  let orbitY = cy;
  let planetX = orbitX-rx*Math.cos(Math.PI-angularPosition*Math.PI/180);
  let planetY = orbitY-ry*Math.sin(Math.PI-angularPosition*Math.PI/180);
  ctx.beginPath();
  ctx.fillStyle=starGradient;
  ctx.arc(planetX,planetY,radius,0,2*Math.PI);
  ctx.closePath();
  ctx.fill();
}

let zoomSequence = function(){
  zx+=0.02;
  zy+=0.02;
  if(zx>=10){cancelAnimationFrame(globalAnimationId);ctx.resetTransform();
  ctx.drawImage(img,0,0);return 0;}
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


let img = new Image();
let imgPath = "https://live.staticflickr.com/3820/10563093726_2945540bb8_b.jpg";
img.src = imgPath;
img.onload = function(){
  originX = img.width /2;
  originY = 2*img.height /3;
  // Once image loads, get animation controls ready.
  zoomToStar(originX,originY);
}

let starSystemAnimate = function(){
  if(angularPosition<=180){
   drawPlanet(ctx,angularPosition,canvas.height/2,canvas.width/2);
  }
  else{

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
  }
}

let drawChartCanvasLayout = function(canvasId,transitParameters){
  [height,width] = resizeCanvas(canvasId);
  let canvas = document.getElementById(canvasId);
  let ctx = canvas.getContext('2d');
  let pixelIndex = 0;
  let pixelX = 0;
  let pixelY = 0;
  let pixelCoords = [];

  paddingSides = (0.075 * width);
  paddingTopBottom = (0.075 * height);
  let canvasXRange = width-2*paddingSides;
  let canvasYRange = height-2*paddingTopBottom;
  ctx.strokeStyle = "#3f3f3f";
  ctx.translate(0.5,0.5);
  ctx.rect(paddingSides,paddingTopBottom,canvasXRange,canvasYRange);
  ctx.stroke();
  let xOffset = paddingSides;
  let yOffset = paddingTopBottom;
  
  relativeBrightness = transitParameters.relativeBrightness;
  let xAxisPoints = 2*(relativeBrightness.length-1);
  for(let index = 0;index<xAxisPoints;index++){
    if(index<relativeBrightness.length){
    [pixelX , pixelY] = mapToCanvas(canvasXRange,canvasYRange,0,0.98,index,relativeBrightness[index],3600,1);
    }
    else{
    [pixelX , pixelY] = mapToCanvas(canvasXRange,canvasYRange,0,0.98,index,1,xAxisPoints,1);
    }
    ctx.fillStyle = "#770000";
    ctx.fillRect(xOffset+pixelX,yOffset+pixelY,1,1);
    pixelCoords.push([pixelX,pixelY]);
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

resizeCanvas('chartCanvas');
let obj =calcTransitParameters(starRadius,planetRelativeRadius*starRadius*1.2,orbitalDistance,0);
k = drawChartCanvasLayout("chartCanvas",obj);

