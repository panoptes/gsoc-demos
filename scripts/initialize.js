let canvas = document.querySelector("canvas");
let cx = canvas.getContext("2d");
let img = document.createElement("img");
var animationControlID;
var imgs = [];
var imgPaths= [];
let i;
let loadedImgs =0 ;
let height = $('#mainCanvas').height();
let width = $('#mainCanvas').width();
let HERMITE = new Hermite_class();
/* settings */
cx.imageSmoothingEnabled=false;

function animateFullScreen(){
  $("#wrapper").toggleClass("fullscreen");
  $("#animationContainer").toggleClass("fullscreen");
  $("#mainCanvas").toggleClass("fullscreen");
}

/* MENU--HIDE--ON--CLICK */
$(document).on('click', function(event) {
  if ((!$(event.target).closest('#menuButton').length) && ($('#menuButton').attr('aria-expanded')==="true")) {
    // Hide the navbar menu when clicked anywhere else.
    // Code here runs if the target of the event or its parent is neither the navbar or an element whose parent is the navbar
  $('#menuButton').click();
    //Seems to cause a bug that triggers menu when a button is pressed on the animation controls.
  }
});

/* CANVAS--INITIALIZE */
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


HERMITE.resample_single(canvas, width, height, true);
img.src=imgs[1].src;
// img = imgs[0];
img.onload = function(){
cx.drawImage(img,0,0,img.width,img.height,0,0,canvas.width,canvas.height);
}


function zoomIn(imgPath, zoomX, zoomY , zoomW, zoomH){
    

}


// Testing the canvas
var frames = [];
for(i=0;i<60;i++){
  frames.push(imgs[i%3]);
}


let myAnimate = function(){
  if(frames.length!==0){
    setTimeout(function(){
    img.src = frames.shift().src;
    cx.drawImage(img,0,0,img.width,img.height,0,0,canvas.width,canvas.height);
    animationControlID = requestAnimationFrame(myAnimate);
    },1000/1);//1FPS
  }
}