var imgs = [];
var frames = [];
var imgPaths = [];
var img = document.createElement("img");
var canvas = document.getElementById("mainCanvas");
var globalAnimationId ;

var ctx = canvas.getContext('2d');
var lastCanvas = canvas.cloneNode(true);
var last = lastCanvas.getContext('2d');
var nextCanvas = canvas.cloneNode(true);
var next = nextCanvas.getContext('2d');


var current = 0;
var op = 1;
var playButton = document.getElementById('playButton');

let i;
let loadedImgs =0 ;
let height = $('#mainCanvas').height();
let width = $('#mainCanvas').width();
let tempCurrent = 0;
let cachedCurrent = 0;

let HERMITE = new Hermite_class();

ctx.imageSmoothingEnabled = false;
last.imageSmoothingEnabled = false;
next.imageSmoothingEnabled = false;

// CANVAS INTITIALIZE
imgPaths.push('assets/vincentiu-night.jpg');
imgPaths.push('assets/exoplanets/milkyway.jpg');
imgPaths.push('assets/02.jpg');

for(i = 0;i<imgPaths.length;i++){
    let temp = new Image();
    imgs.push(temp);
    temp.onload = function () {
            loadedImgs++;
            if (loadedImgs == imgPaths.length) {
               $('#playButton').toggleClass('btn-primary');
               $('#playButton').toggleClass('btn-success');
            }
        };
    temp.src = imgPaths[i]; 
}
// Also resize and resample temporary canvas elements
// Resize
lastCanvas.height = height;
lastCanvas.width = width;

nextCanvas.height = height;
nextCanvas.width = width;

HERMITE.resample_single(canvas, width, height, true);
HERMITE.resample_single(lastCanvas, width, height, true);
HERMITE.resample_single(nextCanvas, width, height, true);

img.src=imgs[1].src;
img.onload = function(){
ctx.drawImage(img,0,0,img.width,img.height,0,0,width,height);
}

// ANIMATION FRAMES
for(i=0;i<5;i++){
  frames.push("Iteration"+i);
  frames.push(imgs[i%3]);
}
frames.push("Iteration"+i)
frames.push("Iteration"+i)
frames.push("Iteration"+i)
frames.push(imgs[0]);
// ANIMATION FRAMES END
function fade() {
  op -= .01;
  
  last.clearRect(0, 0, width, height);
  last.globalAlpha = op;
  last.drawImage(frames[current], 0, 0,frames[current].width,frames[current].height,0,0,width,height);

  next.clearRect(0, 0, width, height);
  next.globalAlpha = 1 - op;
  for(tempCurrent=current+1;tempCurrent<=frames.length;tempCurrent++){
    // Searching for the next image frame other than current frame
    if(typeof(frames[tempCurrent])!=="undefined" && frames[tempCurrent].tagName === "IMG"){
        break;
    } 
    else if (tempCurrent === frames.length){
        tempCurrent = current;
        break;
    }
  }
  next.drawImage(frames[tempCurrent], 0, 0,frames[tempCurrent].width,frames[tempCurrent].height,0,0,width,height);

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(last.canvas, 0, 0);
  ctx.drawImage(next.canvas, 0, 0);

  if (op <= 0) {
    current++;  
    setTimeout(nextImage, 1500);}
  else {
    requestAnimationFrame(fade);
  }  
}

function textDraw(){
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(frames[current],10,10);
    setTimeout(nextImage, 1500);
    current++;
}
function nextImage(){
    if (current >= frames.length ){
        cancelAnimationFrame(globalAnimationId);
    }
    else if (typeof(frames[current])==="string"){
        console.log(frames[current]);
        textDraw();
        // current incremented in textDraw()
    }
    else{
        op = 1;
        fade();
        // current incremented in fade()
    }
}

function play(){
    // restart if animation completed 
    if(current>frames.length){
        current=cachedCurrent;
    }
    else if(current===frames.length){
    current = 0;
    cachedCurrent = 0;
    }
    globalAnimationId = requestAnimationFrame(nextImage);
    playButton.setAttribute('onclick','pause();');
    playButton.innerHTML = 'Pause ';
}

function pause(){
    if (globalAnimationId!=="undefined"){
    cachedCurrent = current;
    current=frames.length+1;
    }
    playButton.setAttribute('onclick','play();');
    playButton.innerHTML = 'Play ';
}