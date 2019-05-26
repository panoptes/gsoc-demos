



/* MENU--HIDE--ON--CLICK */
$(document).on('click', function(event) {
    if ((!$(event.target).closest('#menuButton').length) && ($('#menuButton').attr('aria-expanded')==="true")) {
      // Hide the navbar menu when clicked anywhere else.
      // Code here runs if the target of the event or its parent is neither the navbar or an element whose parent is the navbar
    $('#menuButton').click();
    }
  });
  
  