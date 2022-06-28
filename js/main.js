$(document).ready(function($){
  $.ajax({
    type: "GET",
    url: "dataset/dataset.csv",
    dataType: "text",
    async: false,
    success: function(fdata) {
      data = $.csv.toObjects(fdata);
      for(var i = 0; i < data.length; i++)
      {
        preservedOrderData.push(data[i]);
      }
      // we shuffle array to make it always different
      data.sort(() => (Math.random() > .5) ? 1 : -1);
    }
  });

  filteredData = data;
  checkWidth();
  // create copy of data
  initializeSelectedModels();
  updateCounters(false, data);
  getFilterMenu();
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

  $('#min-age').keydown(function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      // if (e.ctrlKey) {
      applyFilters();
      triggerFilter(false);
      return true;
    }
  });

  $('#max-age').keydown(function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      // if (e.ctrlKey) {
      applyFilters()
      triggerFilter(false);
      return true;
    }
  });
});

function addClickListener(model) {
  $('#' + model['Name']  + "_details").click(function() {greetingText(model); checkOverlay();});
  $('#' + model['Name']).click(function() {updatedSelectedList(model);});
}

$("#safeOfOverlayClick").click(function() {isSafeSelected = true;});

$('#overlay').click(function() {
  checkOverlay();
  isSafeSelected = !isSafeSelected;
});

$('.close-button-modal').click(function() {
  overlayOff();
});

function deselectAll()
{
  //if at least one model has been selected
  if(selectedModels.filter(value => value === true).length > 0){
    //sends a "confirm action" notification
    doConfirm("Are you sure you want to deselect all selected models?", function yes() {
      selectedModels.fill(false);
      removeContent();
      updateCounters(lastFapplied, filteredData);
      errorMessage(true, "viewingselected");
      document.getElementById("select-all").classList.add("cannotSelect");
    });
  }
}

function doConfirm(msg, yesFn, noFn) {
  var confirmBox = $("#confirmBox");
  confirmBox.find(".message").text(msg);
  confirmBox.find(".yes,.no").unbind().click(function () {
      confirmBox.hide();
  });
  confirmBox.find(".yes").click(yesFn);
  confirmBox.find(".no").click(noFn);
  confirmBox.show();
}

function updatedSelectedList(model)
{
  selectedModels[preservedOrderData.indexOf(model)] = !selectedModels[preservedOrderData.indexOf(model)];
  var menu = document.getElementById("menu-bar");

  if(selectedModels[preservedOrderData.indexOf(model)])
  {
    var element = document.getElementById(model['Name'] + "_isSelected");
    element.classList.add("selected");
    menu.classList.add("selected");
  }
  else
  {
    var element = document.getElementById(model['Name'] + "_isSelected");
    element.classList.remove("selected");
  }

  updateCounters(lastFapplied, filteredData);
  countBucket++;
  var tempCounter = countBucket;

  //remove class that allows for animation of bucket
  setTimeout(() => {
    if(tempCounter == countBucket) {
      menu.classList.remove("selected");
    }
  }, 750);
}

function greetingText(data)
{
  viewingModel = data;
  $('.details-text').scrollTop(0);
  $('#modal-greeting')[0].innerText = 'You are viewing ' + data['Name'] + '.\nHere are the details:'

  var details = []
  var categoryName = getCategoryName();

  for(var d = 0; d < categoryName.length; d++)
  {
    var valInCat = data[categoryName[d]];
    if(valInCat == "-")
    {
      details += categoryName[d] + ": N/A";
    }
    else{
      if(categoryName[d] == "Age")
      {
        details += categoryName[d] + ": " + ageCalculator(valInCat);
      }
      else if(categoryName[d] == "Species" && valInCat == "Animal")
      {
        details += categoryName[d] + ": " + data["Animal"];
      }
      else
      {
        if(valInCat.indexOf("_") == -1)
        {
          details += categoryName[d] + ": " + valInCat;
        }
        else
        {
          details += categoryName[d] + "s: ";

          details += listFormater(valInCat)
        }
      } //end else if more than one detail
    }

    details += '\n';

  } //end for-loop through categoryName

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

  var modalclosure = document.getElementById("modal-closure");
  modalclosure.innerHTML = "";

  if(data["Notes"] != '-')
  {
    notes = data["Notes"];

    if(notes.includes("\\url"))
    {
      var string = notes;
      while(string.includes("\\url"))
      {
        var output = URLMaker(string);

        modalclosure.appendChild(output[0]);
        modalclosure.appendChild(output[1]);
        string = output[2].textContent;
      }
      
      modalclosure.appendChild(output[2]);

      var sizeText = document.createElement("div");
      sizeText.classList.add("newParagraph");
      sizeText.textContent = '\n\nThe size of this project is ' + size.toFixed(2) + ' MB (' + (size/1000).toFixed(2) + ' GB).';
      modalclosure.appendChild(sizeText);
    }
    else
    {
      var text = document.createElement("span");
      text.classList.add("newParagraph");
      text.textContent = data["Notes"];
      modalclosure.appendChild(text);

      var sizeText = document.createElement("div");
      sizeText.classList.add("newParagraph");
      sizeText.textContent = '\n\nThe size of this project is ' + size.toFixed(2) + ' MB (' + (size/1000).toFixed(2) + ' GB).';
      modalclosure.appendChild(sizeText);
    }
  }
  else
  {
    modalclosure.innerText = 'The size of this project is ' + size.toFixed(2) + ' MB (' + (size/1000).toFixed(2) + ' GB).'
  }
}

function preventScroll(e){
    e.preventDefault();
    e.stopPropagation();

    return false;
}

function overlayOn(){
  document.getElementById("overlay").style.display = "block";
  isOverlayOn = true;

  $('.modalDialog').css({"opacity":"1", "pointer-events": "auto"})

  var prevBodyY = window.scrollY
  if (smallScreen) {
    // padding is not necessary on mobile
    $('.html').css({"height": "auto", "overflow-y": "hidden"})
    $('.body').css({"height": "auto", "overflow-y": "hidden"})
  }
  else {
    $('.html').css({"height": "auto", "overflow-y": "hidden", "padding-right": "7px"})
    $('.body').css({"height": "auto", "overflow-y": "hidden", "padding-right": "7px"})
  }
  document.querySelector('.body').addEventListener('scroll', preventScroll, {passive: false});
  document.body.style.position = '';
  document.body.style.top = `-${prevBodyY}px`;
}

function overlayOff(){
  document.getElementById("overlay").style.display = "none";
  isSafeSelected = true;
  isOverlayOn = false;

  $('.modalDialog').css({"opacity":"0", "pointer-events": "none"})
  $('.html').css({"overflow-y":"auto", "height": "auto", "padding-right": "0px"})
  $('.body').css({"overflow-y":"auto", "height": "auto", "padding-right": "0px"})

  const scrollY = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
  document.querySelector('.body').removeEventListener('scroll', preventScroll);
}

function checkOverlay(){
  //enters when magnifying glass is clicked on
  //enters when clicks outside of details panel
  if(!isSafeSelected)
  {
    isOverlayOn = !isOverlayOn;
    if(isOverlayOn)
    {
      overlayOn();
    }
    else{
      overlayOff();
    }
  }
}

function generateContent(modelData) {
  var div = document.createElement("div");
  div.classList.add("col-lg-3");
  div.classList.add("col-md-4");
  div.classList.add("col-sm-6");
  div.classList.add("col-12");

  var divModelImage = document.createElement("div");
  divModelImage.classList.add("model-image");
  divModelImage.classList.add("animate");
  divModelImage.setAttribute("id",modelData['Name'] + "_isSelected");

  if(selectedModels[preservedOrderData.indexOf(modelData)])
  {
    divModelImage.classList.add("selected");
  }

  let aWrap = document.createElement("a");
  aWrap.classList.add("a-img")
  // aWrap.setAttribute("id",modelData['Name']);

  let detailsImg = document.createElement("i");
  detailsImg.classList.add("fa-solid");
  detailsImg.classList.add("fa-pink");
  detailsImg.classList.add("fa-magnifying-glass");
  detailsImg.classList.add("top-left");
  detailsImg.setAttribute("title", "View Details");
  detailsImg.setAttribute("id",modelData['Name'] + "_details");

  let innerImg = document.createElement("img");
  innerImg.src = 'img/vmr-images/' + modelData['Name'] + '.png'
  innerImg.alt = modelData['Name']
  innerImg.setAttribute("id",modelData['Name']);

  aWrap.appendChild(innerImg)
  aWrap.appendChild(detailsImg)
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

function populate(dataArray, num_images = 24) {
  //clears not-allowed function when data is repopulated on select all icon
  document.getElementById("select-all").classList.remove("cannotSelect");
  document.getElementById("select-all").classList.remove("applied");

  //clears confirm message if data repopulated
  $("#confirmBox").hide();

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

// this function is called whenever "Filters" is pressed. It applies the
// "filter-is-visible" class to all elements in elementsToTrigger. The behavior
// filter-is-visible is determined in style_dataset.css
function triggerFilter($bool) {
  var elementsToTrigger = $([$('.cd-filter-trigger'), $('.cd-filter'), $('.cd-tab-filter'), $('.cd-gallery')]);
  elementsToTrigger.each(function(){
    $(this).toggleClass('filter-is-visible', $bool);
  });
}

function checkWidth() {
    if (screen.width >= 767 && (document.documentElement.clientWidth >= 767)) {
        if (smallScreen) {
          smallScreen = false;
          updateCounters(lastFapplied, filteredData);
        }
    }
    else {
      if (!smallScreen) {
        smallScreen = true;
        updateCounters(lastFapplied, filteredData);
      }
    }
}

function initializeSelectedModels()
{
  selectedModels = new Array(data.length);
  selectedModels.fill(false);
}

$(window).ready(checkWidth);
$(window).resize(checkWidth);

function updateCounters(fApplied, fData, string)
{
  //update counter of selected models on bucket
  var count = selectedModels.filter(value => value === true).length;
  document.getElementById('selected-counter').textContent = count;

  var counterPanel = document.getElementById("counterPanel");

  var totalLength;
  if(modeIsResults)
  {
    totalLength = hasResultsData.length;
  }
  else
  {
    totalLength = data.length;
  }

  if(string == "justdownloaded")
  {
    counterPanel.textContent = "";
  }
  else if (viewingSelectedModels)
  {
    if (smallScreen) {
      counterPanel.textContent = count + " selected";
    }
    else {
      if (count == 1) {
        counterPanel.textContent = count + " model selected";
      }
      else {
        counterPanel.textContent = count + " models selected";
      }
    }

    //updates icon status
    viewSelectedIcon = document.getElementById("view-selected");
    viewSelectedIcon.classList.add("applied");
  }
  else if (!viewingSelectedModels)
  {
    // lastFdata = fData;
    lastFapplied = fApplied;
    if (smallScreen) {
      if (fApplied) {
        counterPanel.textContent = fData.length + '/' + totalLength + ' models'
      }
      else {
        counterPanel.textContent = fData.length + '/' + totalLength + ' models'
      }
    }
    else {
      if (fApplied) {
        counterPanel.textContent = "Filters applied: " + fData.length + '/' + totalLength + ' models'
      }
      else {
        document.getElementById("counterPanel").textContent = "Filters not applied: " + fData.length + '/' + totalLength + ' models'
      }
    }
    //updates icon status
    viewSelectedIcon = document.getElementById("view-selected");
    viewSelectedIcon.classList.remove("applied");
  }
}

window.addEventListener('scroll', () => {
  var footerHeight = $('#contact-section').height();
  // var footerHeight = document.getElementById("contact-section").height()
  var padding = 50;
  var dataToPopulate;
  if(!viewingSelectedModels) {
    dataToPopulate = filteredData;
  }
  else {
    dataToPopulate = displayedData;
  }
  if (window.scrollY + window.innerHeight + footerHeight + padding>= document.documentElement.scrollHeight) {
    populate(dataToPopulate, 8);
  }
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

function errorMessage(isOn, whichToDisplay)
{
  var errorMsg = document.getElementById('error-msg');
  var button = document.getElementById("returnToGalleryButton");

  //determines which message is showing
  if(whichToDisplay == "filter")
  {
    errorMsg.textContent = "It looks like there are no results matching the filters! Please consider using less restrictive rules.";
    button.style.transitionDuration = '0s';
    button.style.opacity = 0;
  }
  else if(whichToDisplay == "viewingselected")
  {
    errorMsg.textContent = "It looks like no models are currently selected!";
    button.style.transitionDuration = '0s';
    button.style.opacity = 0;
  }
  else if(whichToDisplay == "justdownloaded")
  {
    errorMsg.textContent = "Thank you for downloading!";
    button.style.transitionDuration = '0.3s';
    button.style.opacity = 1;
  }

  //whether or not the error message is visible/displayed
  if(isOn)
  {
    errorMsg.style.transitionDuration = '0.3s';
    errorMsg.style.opacity = 1;
  }
  else
  {
    errorMsg.style.transitionDuration = '0s';
    errorMsg.style.opacity = 0;
    button.style.transitionDuration = '0s';
    button.style.opacity = 0;
  }
}