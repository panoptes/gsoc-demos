let canvas = document.querySelector("canvas");
let cx = canvas.getContext("2d");
let img = document.createElement("img");


function myFullScreenToggler(buttonId){
  $(buttonId).toggleClass("fullscreen");
}

// Hide the menu on clicking outside it.
// Accomplished by telling the button to click itself if clicked outisde the menu and menu is open.
$(document).on('click', function(event) {
  if ((!$(event.target).closest('#menuButton').length) && (!$('#menuButton').hasClass('collapsed'))) {
    // Hide the navbar menu when clicked anywhere else.
    // Code here runs if the target of the event or its parent is neither the navbar or an element whose parent is the navbar
  $('#menuButton').click();
  }
});

// Testing the canvas
cx.imageSmoothingEnabled=false;
img.src = "assets/02.jpg";
img.addEventListener("load", () => {
  cx.drawImage(img,0,0,img.width,img.height,0,0,canvas.width,canvas.height);
});