// <li class="mix color-2 check2 radio2 option2"><img src="img/vmr-images/0003_0001.png" alt="Image 2"></li>

var selectedModel = ''
function addClickListener(data) {
  $('#' + data['Name']).click(function() {
    selectedModel = data['Name']
    $('.details-text').scrollTop(0);
    $('#modal-greeting')[0].innerText = 'You have selected ' + data['Name'] + '.\nHere are the details:'
    $('.modalDialog').css({"opacity":"1", "pointer-events": "auto"})
    // $('.cd-main-content').css({"overflow-y":"hidden", "height": "%100", "padding-right": "15px"});
    // $('.html').css({"margin": "0", "height": "100%", "overflow-y": "hidden", "padding-right": "15px"})
    $('.html').css({"height": "100%", "overflow-y": "hidden", "padding-right": "7px"})
    $('.body').css({"height": "100%", "overflow-y": "hidden", "padding-right": "7px"})

    var details = ''
    details = details + 'Name: ' + data['Name'] + '\n'
    details = details + 'Sex: ' + data['Sex'] + '\n'
    details = details + 'Age: ' + data['Age'] + '\n'
    details = details + 'Species: ' + data['Species'] + '\n'
    details = details + 'Anatomy: ' + data['Anatomy'] + '\n'
    details = details + 'Disease: ' + data['Disease'] + '\n'
    details = details + 'Procedure: ' + data['Procedure'] + '\n'

    var fdrs = ['Images', 'Paths', 'Segmentations', 'Models', 'Meshes', 'Simulations']
    for (var i = 0; i < fdrs.length; i++) {
      if (data[fdrs[i]] == '1') {
        details = details + fdrs[i] + ' available: yes'
      }
      else {
        if (data[fdrs[i]] == '0') {
          details = details + fdrs[i] + ' available: no'
        }
      }
      if (i != fdrs.length-1)
        details = details + '\n'
    }
    var size = parseInt(data['Size']) / 1000000
    $('.details-text')[0].value = details
    $('#modal-closure')[0].innerText = 'The size of this project is ' + size.toFixed(2) + ' Mb (' + (size/1000).toFixed(2) + ' Gb).'
  });
}

function generateContent(modelData) {
  var div = document.createElement("div");
  div.classList.add("col-md-3");
  div.classList.add("col-sm-12");
  var divModelImage = document.createElement("div");
  divModelImage.classList.add("model-image");
  divModelImage.classList.add("animate");

  let aWrap = document.createElement("a");
  aWrap.classList.add("a-img")
  aWrap.setAttribute("id",modelData['Name']);

  let innerImg = document.createElement("img");
  innerImg.src = 'img/vmr-images/' + modelData['Name'] + '.png'
  innerImg.alt = modelData['Name']

  aWrap.appendChild(innerImg)
  divModelImage.appendChild(aWrap);
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

function populate(dataArray, num_images = 24) {
  var modelList = document.getElementById("model-gallery")
  var arrayLength = dataArray.length;
  var ubound = arrayLength;
  if (curIndex + num_images < arrayLength) {
    ubound = curIndex + num_images
  }
  for (var i = curIndex; i < ubound; i++) {
      var newContent = generateContent(dataArray[i]);
      modelList.appendChild(newContent);
      addClickListener(dataArray[i])
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

  checkWidth();

  // create copy of data
  filteredData = data;
  updateCounter(false, data)
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

  //close filter dropdown inside lateral .cd-filter
	$('.cd-filter-block h4').on('click', function(){
		$(this).toggleClass('closed').siblings('.cd-filter-content').slideToggle(300);
	})

  // we apply the filter when enter is pressed on the search field
  $('#search-field').keydown(function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      // if (e.ctrlKey) {
      applyFilters()
      triggerFilter(false);
      return true;
    }
  });

});

$('.close-button-modal').click(function() {
  $('.modalDialog').css({"opacity":"0", "pointer-events": "none"})
  $('.html').css({"overflow-y":"auto", "height": "", "padding-right": "0px"})
  $('.body').css({"overflow-y":"auto", "height": "", "padding-right": "0px"})
});

$('.download-button-modal').click(function() {
  $('.modalDialog').css({"opacity":"0", "pointer-events": "none"})
  $('.html').css({"overflow-y":"auto", "height": "", "padding-right": "0px"})
  $('.body').css({"overflow-y":"auto", "height": "", "padding-right": "0px"})
  // download tracking
  console.log(data['Name']);
  window.open('svprojects/' + selectedModel + '.zip')
  console.log('svprojects/' + selectedModel + '.zip')
  gtag('event', 'download_' + selectedModel, {
      'send_to': 'G-YVVR1546XJ',
      'event_category': 'Model download',
      'event_label': 'test',
      'value': '1'
  });
});

var smallScreen = false

function checkWidth() {
    if (screen.width >= 769 && (document.documentElement.clientWidth >= 769)) {
        if (smallScreen) {
          smallScreen = false;
          updateCounter(lastFapplied, lastFdata);
        }
    }
    else {
      if (!smallScreen) {
        smallScreen = true;
        updateCounter(lastFapplied, lastFdata);
      }
    }
}
$(window).ready(checkWidth);
$(window).resize(checkWidth);

var lastFapplied = 0;
var lastFdata = [];
function updateCounter(fApplied, fData) {
  lastFdata = fData;
  lastFapplied = fApplied;
  if (smallScreen) {
    if (fApplied) {
      document.getElementById('model-counter').textContent = fData.length + '/' + data.length + ' models'
    }
    else {
      document.getElementById('model-counter').textContent = + fData.length + '/' + data.length + ' models'
    }
  }
  else {
    if (fApplied) {
      document.getElementById('model-counter').textContent = "Filters applied: " + fData.length + '/' + data.length + ' models'
    }
    else {
      document.getElementById('model-counter').textContent = "Filters not applied: " + fData.length + '/' + data.length + ' models'
    }
  }
}

function applyFilters(){
  var filterApplied = false
  curIndex = 0;
  var filteredData = data

  var checkboxID = ['Male', "Female", 
  "Pediatric", "Adult", 
  "Animal", "Human", 
  "Aorta", "Aortofemoral", "Cerebrovascular", "Coronary", "Pulmonary", 
  "Healthy", "AS", "Aneurysm", "APOD", "CTEPH", "CoA", "congenital_heart_disease","CAD", "HLHS", "KD", "MS", "PH", "Stenosis", "ToF", "WS", 
  "Anastomosis", "BT_Shunt", "CABG", "Fontan", "Glenn", "Norwood", "PA_plasty", "Sano_Shunt", "Subclavian_flap_repair"] 
  
  var keys = []
  for(var i = 0; i < checkboxID.length; i++)
  {
    keys.push(checkboxID[i]);
  }

  keys.push("1", "1", "1", "1", "1", "1");
  checkboxID.push("Images", "Paths", "Segmentations", "Models", "Meshes", "Simulations")
  
  var category = []

  // repeat twice
  for(var sex = 0; sex < 2; sex++)
  { category.push('Sex'); }

  // repeat twice
  for(var age = 0; age < 2; age++)
  { category.push("Age"); }

  // repeat twice
  for(var species = 0; species < 2; species++)
  { category.push("Species"); }

  // repeat 5 times
  for(var anatomy = 0; anatomy < 5; anatomy++)
  { category.push("Anatomy"); }

  //repeat 15 times
  for(var disease = 0; disease < 15; disease++)
  { category.push("Disease"); }

  //repeat 9 times
  for(var procedure = 0; procedure < 9; procedure++)
  { category.push("Procedure"); }
  
  category.push('Images', 'Paths', 'Segmentations', 'Models', 'Meshes', 'Simulations');

  for(var i = 0; i < checkboxID.length; i++){
    var filterOutput = genericFilter("checkbox-" + checkboxID[i], category[i], keys[i], filteredData)
    filteredData = filterOutput[0]
    filterApplied = filterApplied || filterOutput[1]
  }

  removeContent();
  scrollToTop();
  populate(filteredData);
  updateCounter(filterApplied, filteredData);
  if (filteredData.length == 0) {
    document.getElementById('error-msg').style.transitionDuration = '0.3s';
    document.getElementById('error-msg').style.opacity = 1;
  }
  else {
    document.getElementById('error-msg').style.transitionDuration = '0s';
    document.getElementById('error-msg').style.opacity = 0;
  }
}

function genericFilter(checkboxID, category, keys, partialData){
  var tempFilterApp = false
  var filteredData = []

  var arrayLength = partialData.length;
  
  //automatically returns everything if nothing selected
  var filter = []
  for (var i = 0;  i < arrayLength; i++) {
    filter.push(true);
  }
  
  if (document.getElementById(checkboxID).checked)
  {
    tempFilterApp = true

    //because the sorting for Age is more complicated
    if (category == "Age")
    {
      if (checkboxID == 'checkbox-Pediatric')
      {
        for (var i = 0; i < arrayLength; i++) {
          if (partialData[i][category] >= 18) {
            filter[i] = false;
          }
        }
      }
      else if (checkboxID == 'checkbox-Adult')
      {
        for (var i = 0; i < arrayLength; i++) {
          if (partialData[i][category] < 18) {
            filter[i] = false;
          }
        }
      }
    }
    else {
      for (var i = 0; i < arrayLength; i++) {
        if (partialData[i][category] != keys) {
          filter[i] = false;
        }
      }
    }
  }

  for (var i = 0;  i < arrayLength; i++) {
    if (filter[i]) {
      filteredData.push(partialData[i]);
    }
  }

  return [filteredData, tempFilterApp];
}

window.addEventListener('scroll', () => {
  var footerHeight = $('#contact-section').height();
  // var footerHeight = document.getElementById("contact-section").height()
  var padding = 50;
  if (window.scrollY + window.innerHeight + footerHeight + padding>= document.documentElement.scrollHeight) {
    populate(filteredData, 8);
  }
});


$("#search-field").change(function () {applyFilters();});

$("#checkbox-Male").change(function () {applyFilters();});
$("#checkbox-Female").change(function () {applyFilters();});

$("#checkbox-Pediatric").change(function () {applyFilters();});
$("#checkbox-Adult").change(function () {applyFilters();});

$("#checkbox-Animal").change(function () {applyFilters();});
$("#checkbox-Human").change(function () {applyFilters();});

$("#checkbox-Aorta").change(function () {applyFilters();});
$("#checkbox-Aortofemoral").change(function () {applyFilters();});
$("#checkbox-Cerebrovascular").change(function () {applyFilters();});
$("#checkbox-Coronary").change(function () {applyFilters();});
$("#checkbox-Pulmonary").change(function () {applyFilters();});

$("#checkbox-Healthy").change(function () {applyFilters();});
$("#checkbox-AS").change(function () {applyFilters();});
$("#checkbox-Aneurysm").change(function () {applyFilters();});
$("#checkbox-APOD").change(function () {applyFilters();});
$("#checkbox-CTEPH").change(function () {applyFilters();});
$("#checkbox-CoA").change(function () {applyFilters();});
$("#checkbox-congenital_heart_disease").change(function () {applyFilters();});
$("#checkbox-CAD").change(function () {applyFilters();});
$("#checkbox-HLHS").change(function () {applyFilters();});
$("#checkbox-KD").change(function () {applyFilters();});
$("#checkbox-MS").change(function () {applyFilters();});
$("#checkbox-PH").change(function () {applyFilters();});
$("#checkbox-Stenosis").change(function () {applyFilters();});
$("#checkbox-ToF").change(function () {applyFilters();});
$("#checkbox-WS").change(function () {applyFilters();});

$("#checkbox-Anastomosis").change(function () {applyFilters();});
$("#checkbox-BT_Shunt").change(function () {applyFilters();});
$("#checkbox-CABG").change(function () {applyFilters();});
$("#checkbox-Fontan").change(function () {applyFilters();});
$("#checkbox-Glenn").change(function () {applyFilters();});
$("#checkbox-Norwood").change(function () {applyFilters();});
$("#checkbox-PA_plasty").change(function () {applyFilters();});
$("#checkbox-Sano_Shunt").change(function () {applyFilters();});
$("#checkbox-Subclavian_flap_repair").change(function () {applyFilters();});

$("#checkbox-Images").change(function () {applyFilters();});
$("#checkbox-Paths").change(function () {applyFilters();});
$("#checkbox-Segmentations").change(function () {applyFilters();});
$("#checkbox-Models").change(function () {applyFilters();});
$("#checkbox-Meshes").change(function () {applyFilters();});
$("#checkbox-Simulations").change(function () {applyFilters();});

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

function scrollToTop() {
  window.scrollTo(0, 0);
}

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
}
