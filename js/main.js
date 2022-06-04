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
  "Anastomosis", "BT-Shunt", "CABG", "Fontan", "Glenn", "Norwood", "PA_plasty", "Sano_Shunt", "Subclavian_flap_repair"] 
  
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
/*
function applySearchFilter(partialData){
  var filterApplied = false
  var filteredData = []
  var valueToSearch = document.getElementById('search-field').value.toLowerCase()

  if (valueToSearch == '')
    return [partialData,filterApplied];

  filterApplied = true

  var arrayLength = partialData.length;
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
          if (str1 == valueToSearch && str2 == '1') {
            filteredData.push(partialData[i])
          }
        }
      }
  }

  return [filteredData,filterApplied];
}

function applyModelTypeFilter(partialData){
  var filterApplied = false
  var filteredData = []
  var keys = ['Images', 'Paths', 'Segmentations', 'Models', 'Meshes', 'Simulations'];

  var arrayLength = partialData.length;

  var filter = []
  for (var i = 0;  i < arrayLength; i++) {
    filter.push(true);
  }

  for (var j = 0; j < keys.length; j++) {
    if (document.getElementById('checkbox-' + keys[j]).checked) {
      filterApplied = true
      for (var i = 0; i < arrayLength; i++) {
        if (partialData[i][keys[j]] != '1') {
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

  return [filteredData, filterApplied];
}

function applySexFilter(partialData){
  var filterApplied = false
  var filteredData = []

  var arrayLength = partialData.length;

  var filter = []
  for (var i = 0;  i < arrayLength; i++) {
    filter.push(true);
  }

  if (document.getElementById('checkbox-Male').checked)
  {
    filterApplied = true
    for (var i = 0; i < arrayLength; i++) {
      if (partialData[i]['Sex'] != 'Male') {
        filter[i] = false;
      }
    }
  }
  
  if (document.getElementById('checkbox-Female').checked){
    filterApplied = true
    for (var i = 0; i < arrayLength; i++) {
      if (partialData[i]['Sex'] != 'Female') {
        filter[i] = false;
      }
    }
  }

  for (var i = 0;  i < arrayLength; i++) {
    if (filter[i]) {
      filteredData.push(partialData[i]);
    }
  }

  return [filteredData, filterApplied];
}
*/
function genericFilter(checkboxID, category, keys, partialData){
  var tempFilterApp = false
  var filteredData = []

  var arrayLength = partialData.length;
  
  var filter = []
  for (var i = 0;  i < arrayLength; i++) {
    filter.push(true);
  }

  if (document.getElementById(checkboxID).checked)
  {
    tempFilterApp = true
    for (var i = 0; i < arrayLength; i++) {
      if (partialData[i][category] != keys) {
        filter[i] = false;
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

$("#search-Pediatrics").change(function () {applyFilters();});
$("#search-Adult").change(function () {applyFilters();});

$("#search-Animal").change(function () {applyFilters();});
$("#search-Human").change(function () {applyFilters();});

$("#search-Aorta").change(function () {applyFilters();});
$("#search-Aortofemoral").change(function () {applyFilters();});
$("#search-Cerebrovascular").change(function () {applyFilters();});
$("#search-Coronary").change(function () {applyFilters();});
$("#search-Pulmonary").change(function () {applyFilters();});

$("#search-Healthy").change(function () {applyFilters();});
$("#search-AS").change(function () {applyFilters();});
$("#search-Aneurysm").change(function () {applyFilters();});
$("#search-APOD").change(function () {applyFilters();});
$("#search-CTEPH").change(function () {applyFilters();});
$("#search-CoA").change(function () {applyFilters();});
$("#search-congenital_heart_disease").change(function () {applyFilters();});
$("#search-CAD").change(function () {applyFilters();});
$("#search-HLHS").change(function () {applyFilters();});
$("#search-KD").change(function () {applyFilters();});
$("#search-MS").change(function () {applyFilters();});
$("#search-PH").change(function () {applyFilters();});
$("#search-Stenosis").change(function () {applyFilters();});
$("#search-ToF").change(function () {applyFilters();});
$("#search-WS").change(function () {applyFilters();});

$("#search-Anastomosis").change(function () {applyFilters();});
$("#search-BT-Shunt").change(function () {applyFilters();});
$("#search-CABG").change(function () {applyFilters();});
$("#search-Fontan").change(function () {applyFilters();});
$("#search-Glenn").change(function () {applyFilters();});
$("#search-Norwood").change(function () {applyFilters();});
$("#search-PA_plasty").change(function () {applyFilters();});
$("#search-Sano_Shunt").change(function () {applyFilters();});
$("#search-Subclavian_flap_repair").change(function () {applyFilters();});

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
