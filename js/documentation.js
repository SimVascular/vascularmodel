//sets up the accordian in the tutorial for the menubar
var acc = document.getElementsByClassName("tOCDropDown");
var i;

//opens the panels corresponding to the drop down menu that was clicked
for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    /* Toggle between adding and removing the "active" class,
    to highlight the button that controls the panel */
    this.classList.toggle("selected");
    var number = this.id.substring(this.id.length - 3)

    /* Toggle between hiding and showing the active panel */
    var panel = document.getElementById("panel" + number);

    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}

//clicking on skipToTop icon triggers scrollToTop() function
$('#top').click(function() {
  scrollToTop()
});

//smooth scrolling to return to top
function scrollToTop() {
  window.scrollTo({top: 0, behavior: 'smooth'});
}