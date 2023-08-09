$(document).ready(function($){
    //reads csv file and sets it to the global variable data
    $.ajax({
      type: "GET",
      url: "https://www.vascularmodel.com/dataset/dataset-svprojects.csv",
      dataType: "text",
      async: false,
      success: function(fdata) {
        numberOfModels = $.csv.toObjects(fdata).length;
      }
    });
});

//checks if the user is viewing the analytics section
function isInViewport(className) {
    var element = document.querySelector('.' + className);
  var rect = element.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}

//boolean to check if the animation has already been played once
var playAnimation = true;

// if the user loads the page already viewing the analytics section
// the animation immediately runs
if (playAnimation && isInViewport("analytics-section")) {
  playAnimation = false;
  // very slight delay to allow the dataset to be read before animating the
  // modelcount display
  setTimeout(() => {
    animateCounters()
  }, 1);
}

// listener for when the user scroll until they scroll to the analytics section
// then the animation plays
window.addEventListener('scroll', function () {
  {
  if (playAnimation && isInViewport("analytics-section")) {
    playAnimation = false;
    // slight delay to let the user scroll into the section
    setTimeout(() => {
      animateCounters()
    }, 15);
  }
  }
});

// sets up the counters
function animateCounters()
{
  var countupEls = document.getElementsByClassName('countup');

  // update analytic numbers here
  var numbers = [7000, 12000, numberOfModels];
  var label = ["Users", "Downloads", "Models"];

  for(var i = 0; i < countupEls.length; i++)
  {
    animateCountUp(countupEls[i], numbers[i], label[i])
  }
}

// sets up global variables for the animation counter

// How long you want the animation to take, in ms
const animationDuration = 1200;
// Calculate how long each ‘frame’ should last if we want to update the animation 60 times per second
const frameDuration = 1000 / 60;
// Use that to calculate how many frames we need to complete the animation
const totalFrames = Math.round( animationDuration / frameDuration );
// An ease-out function that slows the count as it progresses
const easeOutQuad = t => t * ( 2 - t );

// The animation function, which takes an Element
function animateCountUp(el, number, label) {
  let frame = 0;
  const countTo = number;
  // Start the animation running 60 times per second
  const counter = setInterval( () => {
    frame+=1;
    // Calculate our progress as a value between 0 and 1
    // Pass that value to our easing function to get our
    // progress on a curve
    const progress = easeOutQuad( frame / totalFrames );
    // Use the progress value to calculate the current count
    const currentCount = Math.round( countTo * progress );

    // If the current count has changed, update the element
    if ( parseInt( el.innerHTML, 10 ) !== currentCount ) {
      var number = currentCount.toLocaleString("en-US")
      el.innerHTML = number;
      el.style.opacity = progress;
    }

    // If we’ve reached our last frame, stop the animation
    if ( frame >= totalFrames ) {
      clearInterval( counter );
      var number = el.textContent;
      el.textContent = number.toLocaleString("en-US");
      // adds a "+" after counters that aren't that of the model counter
      if(label != "Models")
      {
        el.textContent += "+";
      }
    }
  }, frameDuration);
};