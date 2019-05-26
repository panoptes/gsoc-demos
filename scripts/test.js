var imgs = [];
var frames = [];
var imgPaths = [];
var img = document.createElement("img");
var canvas = document.getElementById("mainCanvas");
var animContainer = document.getElementById('animationContainer');
var globalAnimationId ;
var fullScreenElement;

var ctx = canvas.getContext('2d');
var lastCanvas = canvas.cloneNode(true);
var last = lastCanvas.getContext('2d');
var nextCanvas = canvas.cloneNode(true);
var next = nextCanvas.getContext('2d');


var current = 0;
var op = 1;
var playButton = document.getElementById('playButton');
var fullScreenButton = document.getElementById('fullScreenButton');
let speedFactor = 1;
var timer;

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
let resampleAllCanvas=function(){
height = $('#mainCanvas').height();
width = $('#mainCanvas').width();
lastCanvas.height = height;
lastCanvas.width = width;

nextCanvas.height = height;
nextCanvas.width = width;

HERMITE.resample_single(canvas, width, height, true);
HERMITE.resample_single(lastCanvas, width, height, true);
HERMITE.resample_single(nextCanvas, width, height, true);
}
img.src=imgs[1].src;
img.onload = function(){
ctx.drawImage(img,0,0,img.width,img.height,0,0,width,height);
}
resampleAllCanvas();
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

/* CANVAS ANIMATION FUNCTIONS */
function fade() {
  op -= .01 * speedFactor;
  
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
    setTimeout(nextImage, 1500/speedFactor);}
  else {
    requestAnimationFrame(fade);
  }  
}

function textDraw(){
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(frames[current],10,10);
    setTimeout(nextImage, 1500/speedFactor);
    current++;
}

function nextImage(){
    if (current >= frames.length ){
        cancelAnimationFrame(globalAnimationId);
        playButton.setAttribute('onclick','play();');
        playButton.innerHTML = 'Play ';
        // if all frames have been played, ends animation and changes the Pause button to play button.
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
/* CANVAS ANIMATION FUNCTIONS END */
/* Play and Pause Animation. Bound to play button */
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
/* Play and Pause ended */
/* SPEED BUTTON */
function setAnimationSpeedFactor(speed){
    if (speed >= 0.5 && speed <= 2){
        speedFactor = speed;
    }
    // Speed range to be within 0.5 to 2
    // Just a precaution
    else{
        console.log("Please set speed within 0.5 and 2");
    }
}

/* Full Screen Controls*/ 
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
    $('#animationControls').addClass('fullscreen');
    $('#mainCanvas').on('mousemove',hideControls);
    $('#mainCanvas').on('touchstart',hideControls);

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
    $('#animationControls').removeClass('fullscreen');
    clearTimeout(timer);
    $('#mainCanvas').off();
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
    $('#animationControls').removeClass('fullscreen');
    clearTimeout(timer);
    $('#mainCanvas').off();
    $('#animationControls').css('display','inline-flex');
    fullScreenButton.setAttribute('onclick','customRequestFullScreen();');
    fullScreenButton.innerHTML = 'Full Screen';
    }
    resampleAllCanvas();
}

if (document.onfullscreenchange === null)
	document.onfullscreenchange = onFullScreenChange;
else if (document.onmsfullscreenchange === null)
	document.onmsfullscreenchange = onFullScreenChange;
else if (document.onmozfullscreenchange === null)
	document.onmozfullscreenchange = onFullScreenChange;
else if (document.onwebkitfullscreenchange === null)
	document.onwebkitfullscreenchange = onFullScreenChange;

