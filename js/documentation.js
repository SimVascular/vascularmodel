// The function actually applying the offset
function offsetAnchor() {
    console.log("enters")
    if (location.hash.length !== 0) {
      window.scrollTo(window.scrollX, window.scrollY - 100);
    }
  }
  
  // Captures click events of all <a> elements with href starting with #
  $(document).on('click', 'a[href^="#"]', function(event) {
    // Click events are captured before hashchanges. Timeout
    // causes offsetAnchor to be called after the page jump.
    window.setTimeout(function() {
      offsetAnchor();
    }, 0);
  });
  
  // Set the offset when entering page with hash present in the url
  window.setTimeout(offsetAnchor, 0);

$('.select').click(function() {
  var array = $('.select');
  for(var i = 0; i < array.length; i++)
  {
    var goTo = array[i].value;
  }
  var a = document.createElement("a");
  a.href = "#" + goTo;
  a.click();
  for(var i = 0; i < array.length; i++)
  {
    array[i].value = "none"
  }
});
