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

$('#opening_filter').click(function() {
  var a = document.createElement("a");
  a.href = "#Opening_the_filter_menu";
  a.click();
  offsetAnchor();
});

$('#top').click(function() {
  scrollToTop()
});


function scrollToTop() {
  window.scrollTo({top: 0, behavior: 'smooth'});
}