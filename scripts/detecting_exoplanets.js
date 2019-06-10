let canvas = document.getElementById('mainCanvas');
let ctx = canvas.getContext("2d");
let cx = canvas.width/2;
let cy = canvas.height/2;

let starRadius = 150;
let planetRelativeRadius = 0.1 ;
let inclination = 30;
let orbitalDistance = 50;
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
  console.log(zx);
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



