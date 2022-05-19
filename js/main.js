// <li class="mix color-2 check2 radio2 option2"><img src="img/vmr-images/0003_0001.png" alt="Image 2"></li>

function generateContent(data) {
  var div = document.createElement("div");
  div.classList.add("col-md-3");
  div.classList.add("col-sm-12");
  var divModelImage = document.createElement("div");
  divModelImage.classList.add("model-image");
  divModelImage.classList.add("animate");

  let innerImg = document.createElement("img");
  innerImg.src = 'img/vmr-images/' + data['Name'] + '.png'
  innerImg.alt = data['Name']

  divModelImage.appendChild(innerImg);
  div.appendChild(divModelImage);

  return div
}

function removeContent() {
  var modelList = document.getElementById("model-gallery")
  while (modelList.firstChild) {
    modelList.removeChild(modelList.firstChild);
  }
}

var curIndex = 0;

function populate(data, num_images = 16) {
  console.log(data);
  var modelList = document.getElementById("model-gallery")
  var arrayLength = data.length;
  var ubound = arrayLength;
  if (curIndex + num_images < arrayLength) {
    ubound = curIndex + num_images
  }
  for (var i = curIndex; i < ubound; i++) {
      var newContent = generateContent(data[i]);
      modelList.appendChild(newContent);
  }
  curIndex = ubound;
}

var data;
var filteredData;

$(document).ready(function($){
  $.ajax({
    type: "GET",
    url: "dataset/dataset.csv",
    dataType: "text",
    async: false,
    success: function(fdata) {
      data = $.csv.toObjects(fdata);
      // we shuffle array to make it always different
      data.sort(() => (Math.random() > .5) ? 1 : -1);
    }
  });

  // create copy of data
  filteredData = {...data};
  populate(data);

  //open/close lateral filter
  $('.cd-filter-trigger').on('click', function(){
    triggerFilter(true);
  });
  $('.cd-filter .cd-close').on('click', function(){
    triggerFilter(false);
  });

  $('#apply-btn').on('click', function(){
    applyFilters();
    triggerFilter(false);
  });

  // this function is called whenever "Filters" is pressed. It applies the
  // "filter-is-visible" class to all elements in elementsToTrigger. The behavior
  // filter-is-visible is determined in style_dataset.css
  function triggerFilter($bool) {
    var elementsToTrigger = $([$('.cd-filter-trigger'), $('.cd-filter'), $('.cd-tab-filter'), $('.cd-gallery')]);
    elementsToTrigger.each(function(){
      $(this).toggleClass('filter-is-visible', $bool);
    });
  }

  // This functionality is for the filters on the top
  // //mobile version - detect click event on filters tab
  // var filter_tab_placeholder = $('.cd-tab-filter .placeholder a'),
  //   filter_tab_placeholder_default_value = 'Select',
  //   filter_tab_placeholder_text = filter_tab_placeholder.text();
  //
  // $('.cd-tab-filter li').on('click', function(event){
  //   //detect which tab filter item was selected
  //   var selected_filter = $(event.target).data('type');
  //
  //   //check if user has clicked the placeholder item
  //   if( $(event.target).is(filter_tab_placeholder) ) {
  //     (filter_tab_placeholder_default_value == filter_tab_placeholder.text()) ? filter_tab_placeholder.text(filter_tab_placeholder_text) : filter_tab_placeholder.text(filter_tab_placeholder_default_value) ;
  //     $('.cd-tab-filter').toggleClass('is-open');
  //
  //   //check if user has clicked a filter already selected
  //   } else if( filter_tab_placeholder.data('type') == selected_filter ) {
  //     filter_tab_placeholder.text($(event.target).text());
  //     $('.cd-tab-filter').removeClass('is-open');
  //
  //   } else {
  //     //close the dropdown and change placeholder text/data-type value
  //     $('.cd-tab-filter').removeClass('is-open');
  //     filter_tab_placeholder.text($(event.target).text()).data('type', selected_filter);
  //     filter_tab_placeholder_text = $(event.target).text();
  //
  //     //add class selected to the selected filter item
  //     $('.cd-tab-filter .selected').removeClass('selected');
  //     $(event.target).addClass('selected');
  //   }
  // });

  // close filter dropdown inside lateral .cd-filter
  // $('.cd-filter-block h4').on('click', function(){
  //   $(this).toggleClass('closed').siblings('.cd-filter-content').slideToggle(300);
  // })
  //
  // //fix lateral filter and gallery on scrolling
  // $(window).on('scroll', function(){
  //   (!window.requestAnimationFrame) ? fixGallery() : window.requestAnimationFrame(fixGallery);
  // });
  //
  // function fixGallery() {
  //   var offsetTop = $('.cd-main-content').offset().top,
  //     scrollTop = $(window).scrollTop();
  //   ( scrollTop >= offsetTop ) ? $('.cd-main-content').addClass('is-fixed') : $('.cd-main-content').removeClass('is-fixed');
  // }
});

function applyFilters(){
  curIndex = 0;
  filteredData = data;
  console.log(filteredData)
  filteredData = applySearchFilter(filteredData);
  removeContent()
  populate(filteredData)
}

function applySearchFilter(partialData){
  var filteredData = []
  var valueToSearch = document.getElementById('search-field').value.toLowerCase()

  if (valueToSearch == '')
    return partialData;

  var arrayLength = partialData.length;
  console.log(partialData);
  console.log(arrayLength);
  for (var i = 0; i < arrayLength; i++) {
      for (const [key, value] of Object.entries(partialData[i])) {
        var str1 = key.toLowerCase();
        var str2 = value.toLowerCase();
        // we check if the value is in the name
        if (str1 == 'name') {
          if (str2.includes(valueToSearch)) {
            filteredData.push(partialData[i])
          }
        }
        else if (str1 == 'type') {
          if (str2.includes(valueToSearch)) {
            filteredData.push(partialData[i])
          }
        }
        else { // we check if the value is a tag and if the value is 1
          console.log(str1)
          console.log(valueToSearch)
          if (str1 == valueToSearch && str2 == '1') {
            filteredData.push(partialData[i])
          }
        }
      }
  }
  console.log(filteredData)
  return filteredData;
}

window.addEventListener('scroll', () => {
  var footerHeight = $('#contact-section').height();
  // var footerHeight = document.getElementById("contact-section").height()
  console.log(footerHeight)
  var padding = 50;
  if (window.scrollY + window.innerHeight + footerHeight + padding>= document.documentElement.scrollHeight) {
    console.log(window.innerHeight)
    populate(filteredData, 4);
  }
});

$(window).load(function(){
  /************************************
    MitItUp filter settings
    More details:
    https://mixitup.kunkalabs.com/
    or:
    http://codepen.io/patrickkunka/
  *************************************/

  // buttonFilter.init();
  // $('.cd-gallery ul').mixItUp({
  //     controls: {
  //       enable: false
  //     },
  //     callbacks: {
  //       onMixStart: function(){
  //         $('.cd-fail-message').fadeOut(200);
  //       },
  //         onMixFail: function(){
  //           $('.cd-fail-message').fadeIn(200);
  //       }
  //     }
  // });

  // search filtering
  // credits http://codepen.io/edprats/pen/pzAdg
  // var inputText;
  // var $matching = $();
  //
  // var delay = (function(){
  //   var timer = 0;
  //   return function(callback, ms){
  //     clearTimeout (timer);
  //       timer = setTimeout(callback, ms);
  //   };
  // })();
  //
  // $(".cd-filter-content input[type='search']").keyup(function(){
  //     // Delay function invoked to make sure user stopped typing
  //     delay(function(){
  //       inputText = $(".cd-filter-content input[type='search']").val().toLowerCase();
  //        // Check to see if input field is empty
  //       if ((inputText.length) > 0) {
  //           $('.mix').each(function() {
  //             var $this = $(this);
  //
  //             // add item to be filtered out if input text matches items inside the title
  //             if($this.attr('class').toLowerCase().match(inputText)) {
  //                 $matching = $matching.add(this);
  //             } else {
  //                 // removes any previously matched item
  //                 $matching = $matching.not(this);
  //             }
  //           });
  //           $('.cd-gallery ul').mixItUp('filter', $matching);
  //       } else {
  //           // resets the filter to show all item if input is empty
  //           $('.cd-gallery ul').mixItUp('filter', 'all');
  //       }
  //     }, 200 );
  // });
});

/*****************************************************
  MixItUp - Define a single object literal
  to contain all filter custom functionality
*****************************************************/
var buttonFilter = {
    // Declare any variables we will need as properties of the object
    $filters: null,
    groups: [],
    outputArray: [],
    outputString: '',

    // The "init" method will run on document ready and cache any jQuery objects we will need.
    init: function(){
      var self = this; // As a best practice, in each method we will asign "this" to the variable "self" so that it remains scope-agnostic. We will use it to refer to the parent "buttonFilter" object so that we can share methods and properties between all parts of the object.

      self.$filters = $('.cd-main-content');
      self.$container = $('.cd-gallery ul');

      self.$filters.find('.cd-filters').each(function(){
          var $this = $(this);

        self.groups.push({
            $inputs: $this.find('.filter'),
            active: '',
            tracker: false
        });
      });

      self.bindHandlers();
    },

    // The "bindHandlers" method will listen for whenever a button is clicked.
    bindHandlers: function(){
      var self = this;

      self.$filters.on('click', 'a', function(e){
          self.parseFilters();
      });
      self.$filters.on('change', function(){
        self.parseFilters();
      });
    },

    parseFilters: function(){
      var self = this;

      // loop through each filter group and grap the active filter from each one.
      for(var i = 0, group; group = self.groups[i]; i++){
        group.active = [];
        group.$inputs.each(function(){
          var $this = $(this);
          if($this.is('input[type="radio"]') || $this.is('input[type="checkbox"]')) {
            if($this.is(':checked') ) {
              group.active.push($this.attr('data-filter'));
            }
          } else if($this.is('select')){
            group.active.push($this.val());
          } else if( $this.find('.selected').length > 0 ) {
            group.active.push($this.attr('data-filter'));
          }
        });
      }
      self.concatenate();
    },

    concatenate: function(){
      var self = this;

      self.outputString = ''; // Reset output string

      for(var i = 0, group; group = self.groups[i]; i++){
          self.outputString += group.active;
      }

      // If the output string is empty, show all rather than none:
      !self.outputString.length && (self.outputString = 'all');

      // Send the output string to MixItUp via the 'filter' method:
    if(self.$container.mixItUp('isLoaded')){
        self.$container.mixItUp('filter', self.outputString);
    }
    }
};
