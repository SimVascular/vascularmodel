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

function isInViewport(className) {
    var element = document.querySelector('.' + className);
  var rect = element.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom < 0 || rect.top - viewHeight >= 0);
}


// function isInViewport(className) {
//   // Get the an HTML element
//   var element = document.querySelector('.' + className);

//   // Get its bounding client rectangle
//   var bounding = element.getBoundingClientRect();
//   console.log("top: " + bounding.top)
//   console.log("left: " + bounding.left)
//   console.log("right: " + bounding.right + " <= " + window.innerWidth)
//   console.log("bottom: " + bounding.bottom + " <= " + window.innerHeight)
//   // Checking part. Here the code checks if it's *fully* visible
//   // Edit this part if you just want a partial visibility
//   if (
//       (bounding.top >= 0 && bounding.top <= 735)  || bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
//       &&
//       bounding.left >= 0 || bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
//   ) {
//       return true;
//   } else {
//       return false;
//   }
// }

var playAnimation = true;

if (playAnimation && isInViewport("analytics-section")) {
  playAnimation = false;
  setTimeout(() => {
    animateCounters()
  }, 1);
  console.log("sad")
}

window.addEventListener('scroll', function () {
  {
  if (playAnimation && isInViewport("analytics-section")) {
    playAnimation = false;
    setTimeout(() => {
      animateCounters()
    }, 15);
  }
  }
});

function animateCounters()
{
  document.getElementById("modelsCounter").textContent = numberOfModels;
  var countupEls = document.getElementsByClassName('countup');
  var label = ["Users", "Downloads", "Models"]
  for(var i = 0; i < countupEls.length; i++)
  {
    animateCountUp(countupEls[i], label[i])
  }
}

// How long you want the animation to take, in ms
const animationDuration = 1200;
// Calculate how long each ‘frame’ should last if we want to update the animation 60 times per second
const frameDuration = 1000 / 60;
// Use that to calculate how many frames we need to complete the animation
const totalFrames = Math.round( animationDuration / frameDuration );
// An ease-out function that slows the count as it progresses
const easeOutQuad = t => t * ( 2 - t );

// The animation function, which takes an Element
function animateCountUp(el, label) {
  let frame = 0;
  const countTo = parseInt( el.innerHTML, 10 );
  // Start the animation running 60 times per second
  const counter = setInterval( () => {
    frame++;
    // Calculate our progress as a value between 0 and 1
    // Pass that value to our easing function to get our
    // progress on a curve
    const progress = easeOutQuad( frame / totalFrames );
    // Use the progress value to calculate the current count
    const currentCount = Math.round( countTo * progress );

    // If the current count has changed, update the element
    if ( parseInt( el.innerHTML, 10 ) !== currentCount ) {
      el.innerHTML = currentCount;
    }

    // If we’ve reached our last frame, stop the animation
    if ( frame === totalFrames ) {
      clearInterval( counter );
      var number = parseInt(el.textContent)
      el.textContent = number.toLocaleString("en-US");
      if(label != "Models")
      {
        el.textContent += "+";
      }
    }
  }, frameDuration);
};