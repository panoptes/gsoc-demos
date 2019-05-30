var imgs = [];
var frames = [];
var imgPaths = [];
var img = document.createElement("img");
var canvas = document.getElementById("mainCanvas");
var animContainer = document.getElementById('animationContainer');
var globalAnimationId ;
var fullScreenElement;
var folderName = 'assets/exoplanets/';

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

let lines = [];
let linesXOffset = [];
let linesYOffset = [];
let canvasText = '';
let textWidth = 0;
let fontSize = "10px";
let fontStyle = "Arial"

let HERMITE = new Hermite_class();

ctx.imageSmoothingEnabled = false;
last.imageSmoothingEnabled = false;
next.imageSmoothingEnabled = false;

// CANVAS INTITIALIZE
/* Load all images that are to be used in the animation*/ 
imgPaths.push(folderName+'generic-space-tim-foster.jpg');
imgPaths.push(folderName+'milkyway.jpg');
imgPaths.push(folderName+'milkyway_sun.jpg');
imgPaths.push(folderName+'solarsystem.jpg');
imgPaths.push(folderName+'51pegasib.jpg');
imgPaths.push(folderName+'trappist.jpg');
imgPaths.push(folderName+'habitablezone.jpg');
imgPaths.push(folderName+'kepler_186f.jpg');
imgPaths.push(folderName+'kepler.jpg');
imgPaths.push(folderName+'panoptes.jpg');

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
/* When all  images are successfully loaded the Play button turns green */
// Also resize and resample temporary canvas elements

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
frames.push(imgs[0]);
frames.push('Welcome! Today we’ll be learning about exoplanets !');
frames.push(imgs[0]);
frames.push('Our Universe is made up of countless galaxies like our Milky Way. When we look up at the night sky, essentially everything we see is part of our Milky Way Galaxy.  This is an all sky image showing what our galaxy looks like.');
frames.push(imgs[1]);
frames.push('This is how our galaxy would appear to an outside observer. Our sun is one among the countless stars in our galaxy. Each faint speck is a star like our sun.');
frames.push(imgs[2]);
frames.push('Planets including our Earth orbit the sun.');
frames.push(imgs[3]);
frames.push('Most of the countless stars in the universe also have planets orbiting them.These planets outside our solar system are called exoplanets.');
frames.push(imgs[3]);
frames.push('The first exoplanet found orbiting a star like our sun was 51 Pegasi b ');
frames.push(imgs[4]);
frames.push('Since then over 3000 exoplanets have been discovered including star systems similar to our solar system');
frames.push(imgs[5]);
frames.push('The search for exoplanets is also tied to the search for extraterrestrial life.');
frames.push(imgs[0]);
frames.push('Each star has a region around it where water can exist in liquid form as on Earth. This region is called the habitable zone');
frames.push(imgs[0]);
frames.push(imgs[6]);
frames.push('Water was an important factor in the evolution of life on Earth and its presence might be necessary to create the conditions capable of supporting life. ');
frames.push(imgs[7]);
frames.push('There are many projects both ground based and in space dedicated to this search. The most successful of them is the Kepler mission.');
frames.push(imgs[8]);
frames.push(imgs[9]);
frames.push('Project PANOPTES is a citizen science project that aims to make it easy for anyone to build a low cost, robotic telescope that can be used to detect transiting exoplanets.');
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
    setTimeout(nextImage, 2000/speedFactor);}
  else {
    requestAnimationFrame(fade);
  }  
}

function textDraw(canvasId,canvasContext,canvasText,fontStyle="sans-serif"){
    
    let fontSize = $('#mainCanvas').attr('height')/25;
    let words = canvasText.split(' ');
    let line = '';
    let xOffset = 0;
    let yOffset = 0;
    
    resampleAllCanvas();
    lines = [];
    ctx.font = fontSize+"px "+fontStyle;
    width = $('#'+canvasId).width();
    height = $('#'+canvasId).height();
    textWidth = canvasContext.measureText(canvasText).width;
    // This loop splits the text into lines
    for(i=0 ; i<words.length;i++){
        if(canvasContext.measureText(line + words[i] + ' ').width<width){
            line += words[i] + ' ';
        }
        else{
            lines.push(line);
            line = words[i]+' ';
        }

    }
    lines.push(line);
    // This loop prints the lines at the bottom and center-aligned.
    for(i=0 ;i<lines.length;i++){
        textWidth = ctx.measureText(lines[i]).width;
        ctx.fillStyle = "#FFFFFF";
        xOffset = (width-textWidth)/2;
        yOffset = height-fontSize*(lines.length-i);
        ctx.fillText(lines[i],xOffset,yOffset);
    }
    setTimeout(nextImage, words.length*400/speedFactor);
    current++;
}

function nextImage(){
    if (current >= frames.length ){
        cancelAnimationFrame(globalAnimationId);
        playButton.setAttribute('onclick','play();');
        playButton.innerHTML = '<i class="fa fa-play"></i>';
        // if all frames have been played, ends animation and changes the Pause button to play button.
    }
    else if (typeof(frames[current])==="string"){
        console.log(frames[current]);
        textDraw('mainCanvas',ctx,frames[current]);
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
    resampleAllCanvas();
    if(current>frames.length){
        current=cachedCurrent;
    }
    else if(current===frames.length){
    current = 0;
    cachedCurrent = 0;
    }
    globalAnimationId = requestAnimationFrame(nextImage);
    playButton.setAttribute('onclick','pause();');
    playButton.innerHTML = '<i class="fa fa-pause"></i>';
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

