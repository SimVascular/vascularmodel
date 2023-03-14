$(document).ready(function($){
  //reads csv file and sets it to the global variable data
  $.ajax({
    type: "GET",
    url: "dataset/dataset.csv",
    dataType: "text",
    async: false,
    success: function(fdata) {
      data = $.csv.toObjects(fdata);
      //saves the csv order of the models in preservedOrderData
      for(var i = 0; i < data.length; i++)
      {
        preservedOrderData.push(data[i]);
      }
      // we shuffle array to make it always different
      data.sort(() => (Math.random() > .5) ? 1 : -1);
    }
  });
  $.ajax({
    type: "GET",
    url: "dataset/file_sizes.csv",
    dataType: "text",
    async: false,
    success: function(fdata) {
      fileSizes = {};
      fileSizesCsv = $.csv.toObjects(fdata);
      var arrayLength = fileSizesCsv.length;
      for (var i = 0; i < arrayLength; i++) 
      {
        fileSizes[fileSizesCsv[i]['Name']] = fileSizesCsv[i]['Size']
      }
    }
  });
  //create copy of data
  filteredData = data;

  //checks width of screen for smallScreen variable
  checkWidth();

  //sets selectedModels all to false
  initializeSelectedModels();

  //sets counters that defaults to "filter"
  updateCounters(false, data);

  //creates html for filters
  //this function is in filters.js
  getFilterMenu();

  //populates gallery with all models
  populate(data);
});

//checks width of screen and updates counters as needed
function checkWidth() {
  //at 767px, screen is considered "small"
  if (screen.width >= 767 && (document.documentElement.clientWidth >= 767)) {
    if (smallScreen) {
      //updates smallScreen
      smallScreen = false;
      //updates counters
      updateCounters(lastFapplied, filteredData);
    }
  }
  else {
    if (!smallScreen) {
      //updates smallScreen
      smallScreen = true;
      //updates counters
      updateCounters(lastFapplied, filteredData);
    }
  }
}

//sets selectedModels all to false
function initializeSelectedModels()
{
  selectedModels = new Array(data.length);
  selectedModels.fill(false);
}

function updateCounters(fApplied, fData, string)
{
  //update counter of selected models on bucket
  var count = selectedModels.filter(value => value === true).length;
  document.getElementById('selected-counter').textContent = count;

  //the header bar with the counters
  var counterPanel = document.getElementById("counterPanel");

  //totalLength is the total number of models possible in the current mode
  var totalLength = data.length;

  //custom string for when someone just downloaded models
  if(string == "justdownloaded")
  {
    counterPanel.textContent = "";
  }
  else if (viewingSelectedModels)
  {
    //if viewingSelectedModels, shows number of models selected
    if (smallScreen) {
      counterPanel.textContent = count + " selected";
    }
    else {
      //grammar for plural
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
    //updates global variables
    lastFdata = fData;
    lastFapplied = fApplied;

    //if not viewingSelectedModels, shows number of models in gallery
    if (smallScreen) {
      //no specification of whether or not the filter is applied
      counterPanel.textContent = fData.length + '/' + totalLength + ' models';

      if(document.getElementById("putHelpWordHere") !== null)
      {
        //clears HTML to allow for dynamic putHelpWordHere
        document.getElementById("putHelpWordHere").innerHTML = "";
      }
      
    }
    else {
      if (fApplied) {
        counterPanel.textContent = "Filters applied: " + fData.length + '/' + totalLength + ' models'
      }
      else {
        document.getElementById("counterPanel").textContent = "Filters not applied: " + fData.length + '/' + totalLength + ' models'
      }
      
      if(document.getElementById("putHelpWordHere") !== null)
      {
        //adds text if the screen is not small
        document.getElementById("putHelpWordHere").textContent = "Help  ";
      }
    }

    //updates icon status
    viewSelectedIcon = document.getElementById("view-selected");
    viewSelectedIcon.classList.remove("applied");
  }
} //end updateCounters

//code for modal-greeting
function greetingText(data)
{
  //sets global var viewingModel
  viewingModel = data;

  $('.details-text').scrollTop(0);

  //modal's first line
  $('#modal-greeting')[0].innerText = 'You are viewing ' + data['Name'] + '.\nHere are the details:'

  //details inside window
  var details = "";
  //all categories displayed in window
  var categoryName = getCategoryName();

  for(var d = 0; d < categoryName.length; d++)
  {
    //valInCat is the value in the category
    var valInCat = data[categoryName[d]];

    //accounts for when value is not specified
    if(valInCat == "-")
    {
      details += categoryName[d] + ": N/A";
    }
    else{
      //deals with age for most relevant unit
      if(categoryName[d] == "Age")
      {
        details += categoryName[d] + ": " + ageCalculator(valInCat);
      }
      //specifies species if can be more specific
      else if(categoryName[d] == "Species" && valInCat == "Animal")
      {
        details += categoryName[d] + ": " + data["Animal"];
      }
      else
      {
        //accounts for when there are multiple details, separated by a "_"
        if(valInCat.indexOf("_") == -1)
        {
          details += categoryName[d] + ": " + valInCat;
        }
        else
        {
          //formats multiple details
          details += categoryName[d] + "s: ";

          details += listFormater(valInCat)
        }
      } //end else if more than one detail
    }

    //adds new line per detail
    details += '\n';

  } //end for-loop through categoryName

  //formatting for whether or not each fdr is avaliable
  var fdrs = ['Images', 'Paths', 'Segmentations', 'Models', 'Meshes', 'Simulations']
  for (var i = 0; i < fdrs.length; i++) {
    //changes "1" to "yes" and "0" to "no"
    if (data[fdrs[i]] == '1') {
      details = details + fdrs[i] + ' available: yes'
    }
    else {
      if (data[fdrs[i]] == '0') {
        details = details + fdrs[i] + ' available: no'
      }
    }
    //adds new line after everything except the last detail
    if (i != fdrs.length - 1)
    {
      details += '\n'
    }
  }
  //adds details to window
  $('.details-text')[0].value = details

  downloadType = "zip";
  var size = getSizeIndiv(viewingModel["Name"]);

  //gets element after the window
  var modalclosure = document.getElementById("modal-closure");
  modalclosure.innerHTML = "";

  //accounts for when there are no additional notes
  if(data["Notes"] != '-')
  {
    notes = data["Notes"];

    //allows for URLs in the Notes
    if(notes.includes("\\url"))
    {
      var string = notes;
      //allows for multiple URLs
      while(string.includes("\\url"))
      {
        var output = URLMaker(string);

        modalclosure.appendChild(output[0]);
        modalclosure.appendChild(output[1]);
        string = output[2].textContent;
      }
      
      //adds last element since loop skips it
      modalclosure.appendChild(output[2]);
    }
    else
    {
      //if no URL, adds notes as regular text
      if (data["Notes"].includes("\\n"))
      {
        //allows for new lines in notes that don't have URLs
        var text = newLineNoURL(data["Notes"], true)
      }
      else
      {
        //if no new line, creates regular span
        var text = document.createElement("span");
        text.classList.add("newParagraph");
        text.textContent = data["Notes"];
      }

      modalclosure.appendChild(text);
    }

    //after notes, prints size
    var sizeText = document.createElement("div");
    sizeText.classList.add("newParagraph");
    sizeText.textContent = '\n\nThe size of this project is ' + sizeConverter(size);

    modalclosure.appendChild(sizeText);
  }
  else
  {
    //if no notes, only prints size
    modalclosure.innerText = 'The size of this project is ' + sizeConverter(size);
  }
} //end greetingText()

//code for 3D embed
function threeDEmbed(data)
{
  //sets global var viewingModel
  viewingModel = data;

  //modal's first line
  $('#3Dmodal-greeting')[0].innerText = 'You are viewing ' + data['Name'] + '.\nHere is the 3D visualization:'

} //end threeDembed()

//function to prevent overlay from exiting when the user clicks on the modal
$("#safeOfOverlayClick").click(function() {isSafeSelected = true;});

//deals with clicking on the overlay
$('#overlay').click(function() {
  //checks if safe was selected
  checkOverlay();
  //allows for click and unclick
  isSafeSelected = !isSafeSelected;
});

//deals with clicking on the overlay
$('#threeDOverlay').click(function() {
  //checks if safe was selected
  check3DOverlay();
  //allows for click and unclick
  isSafeSelected = !isSafeSelected;
});

//turns off the overlay when the X is clicked
$('.close-button-modal').click(function() {
  overlayOff();
  threeDOverlayOff();
});

//checks status of overlay
function checkOverlay(){
  //if user clicked on overlay and not modalDialog
  if(!isSafeSelected)
  {
    //updates overlay
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

function check3DOverlay(){
  //if user clicked on overlay and not modalDialog
  if(!isSafeSelected)
  {
    //updates overlay
    is3DOverlayOn = !is3DOverlayOn;
    if(is3DOverlayOn)
    {
      threeDOverlayOn();
    }
    else{
      threeDOverlayOff();
    }
  }
}

//turns overlay and all accompanying elements on
function overlayOn(){
  //updates displat and global variable isOverlayOn
  document.getElementById("overlay").style.display = "block";
  isOverlayOn = true;

  //opens modalDialog
  $('.modalDialog').css({"opacity":"1", "pointer-events": "auto"})

  //turns off scroll and sets height to auto
  if (smallScreen) {
    // padding is not necessary on mobile
    $('.html').css({"height": "auto", "overflow-y": "hidden"})
    $('.body').css({"height": "auto", "overflow-y": "hidden"})
  }
  else {
    $('.html').css({"height": "auto", "overflow-y": "hidden", "padding-right": "7px"})
    $('.body').css({"height": "auto", "overflow-y": "hidden", "padding-right": "7px"})
  }

  //sets listener for scroll
  document.querySelector('.body').addEventListener('scroll', preventScroll, {passive: false});
  document.body.style.position = '';

  //saves where the user was before overlay turned on
  var prevBodyY = window.scrollY
  document.body.style.top = `-${prevBodyY}px`;
}

//turns 3Doverlay and all accompanying elements on
function threeDOverlayOn(){
  //updates displat and global variable is3DOverlayOn
  document.getElementById("threeDOverlay").style.display = "block";
  is3DOverlayOn = true;

  //opens modalDialog
  $('.modalDialog').css({"opacity":"1", "pointer-events": "auto"})

  //turns off scroll and sets height to auto
  if (smallScreen) {
    // padding is not necessary on mobile
    $('.html').css({"height": "auto", "overflow-y": "hidden"})
    $('.body').css({"height": "auto", "overflow-y": "hidden"})
  }
  else {
    $('.html').css({"height": "auto", "overflow-y": "hidden", "padding-right": "7px"})
    $('.body').css({"height": "auto", "overflow-y": "hidden", "padding-right": "7px"})
  }

  //sets listener for scroll
  document.querySelector('.body').addEventListener('scroll', preventScroll, {passive: false});
  document.body.style.position = '';

  //saves where the user was before overlay turned on
  var prevBodyY = window.scrollY
  document.body.style.top = `-${prevBodyY}px`;
}

//deals with turning overlay off
function overlayOff(){
  //updates variables
  document.getElementById("overlay").style.display = "none";
  isSafeSelected = true;
  isOverlayOn = false;

  //resets html, body, modalDialog
  $('.modalDialog').css({"opacity":"0", "pointer-events": "none"})
  $('.html').css({"overflow-y":"auto", "height": "auto", "padding-right": "0px"})
  $('.body').css({"overflow-y":"auto", "height": "auto", "padding-right": "0px"})

  //resets scrolling
  const scrollY = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
  document.querySelector('.body').removeEventListener('scroll', preventScroll);
}

//deals with turning overlay off
function threeDOverlayOff(){
  //updates variables
  document.getElementById("threeDOverlay").style.display = "none";
  isSafeSelected = true;
  is3DOverlayOn = false;

  //resets html, body, modalDialog
  $('.modalDialog').css({"opacity":"0", "pointer-events": "none"})
  $('.html').css({"overflow-y":"auto", "height": "auto", "padding-right": "0px"})
  $('.body').css({"overflow-y":"auto", "height": "auto", "padding-right": "0px"})

  //resets scrolling
  const scrollY = document.body.style.top;
  document.body.style.position = '';
  document.body.style.top = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
  document.querySelector('.body').removeEventListener('scroll', preventScroll);
}

//function to prevent user from scrolling
function preventScroll(e){
  e.preventDefault();
  e.stopPropagation();

  return false;
}

function populate(dataArray, num_images = 24) {
  //clears not-allowed function when data is repopulated on select all icon
  document.getElementById("select-all").classList.remove("cannotSelect");
  isSelectAllApplied(false);

  //clears confirm message if data repopulated
  $("#confirmBox").hide();

  //model-gallery is where models are appended
  var modelList = document.getElementById("model-gallery")

  var arrayLength = dataArray.length;
  //curIndex for the infinite scroll feature
  var ubound = arrayLength;
  //updates ubound
  if (curIndex + num_images < arrayLength) {
    ubound = curIndex + num_images
  }
  //generates content in regards to bounds
  for (var i = curIndex; i < ubound; i++) {
    //newContent is the model img/div
    var newContent = generateContent(dataArray[i]);
    modelList.appendChild(newContent);
    //hooks for models
    addClickListener(dataArray[i])
  }
  //updates bounds/stopping point
  curIndex = ubound;
}

//generates individual gallery object
function generateContent(modelData) {
  //creates div for place in gallery
  var div = document.createElement("div");
  //allows for different number of columns depending on width
  div.classList.add("col-lg-3");
  div.classList.add("col-md-4");
  div.classList.add("col-sm-6");
  div.classList.add("col-12");

  //div to hold image specifically
  var divModelImage = document.createElement("div");
  //formatting of box holding image
  divModelImage.classList.add("model-image");
  //hover animation
  divModelImage.classList.add("animate");
  //ID for hook to select model
  divModelImage.setAttribute("id",modelData['Name'] + "_isSelected");
  divModelImage.setAttribute("title", "Select " + modelData["Name"]);

  //if model is selected, show that upon loading
  if(selectedModels[preservedOrderData.indexOf(modelData)])
  {
    divModelImage.classList.add("selected");
  }

  //creates magnifying glass icon on the top-left
  let detailsImg = document.createElement("i");
  detailsImg.classList.add("fa-solid");
  detailsImg.classList.add("fa-magnifying-glass");
  detailsImg.classList.add("top-left");
  //lingering mouse over icon will say "View Details"
  detailsImg.setAttribute("title", "View Details");
  //creates ID for hook to open modalDialog
  detailsImg.setAttribute("id",modelData['Name'] + "_details");

  let microscapeButton = document.createElement("i");
  microscapeButton.classList.add("microscape-button");
  //microscapeButton.href = "http://vascularmodelrepository.s3-website-us-east-1.amazonaws.com/";
  microscapeButton.setAttribute("id",modelData['Name'] + "_3D");

  let mcpImgHover = document.createElement("img");
  mcpImgHover.classList.add("icon-hover");
  mcpImgHover.src = 'img/group-logos/MCP_Icon_BlueOverWhite.png'

  let mcpImg = document.createElement("img");
  mcpImg.classList.add("icon");
  mcpImg.src = 'img/group-logos/MCP_Icon_GreyOverAlpha.png'
  
  //creates image of model
  let innerImg = document.createElement("img");
  innerImg.src = 'img/vmr-images/' + modelData['Name'] + '.png'
  innerImg.alt = modelData['Name']
  innerImg.setAttribute("id",modelData['Name']);

  divModelImage.appendChild(innerImg);
  divModelImage.appendChild(detailsImg);
  divModelImage.appendChild(microscapeButton);
  microscapeButton.appendChild(mcpImg);
  microscapeButton.appendChild(mcpImgHover);
  div.appendChild(divModelImage);

  return div
}

//function to add listeners to each model and its magnifying glass
function addClickListener(model) {
  modelName =  model['Name'];
  //magnifying glass --> modalgreeting and overlay
  $('#' + modelName  + "_details").click(function() {greetingText(model); checkOverlay();});
  //microscape button --> modalgreeting and overlay
  $('#' + modelName  + "_3D").click(function() {threeDEmbed(model); check3DOverlay();});
  // selects model if you click on it
  $('#' + modelName).click(function() {updatedSelectedList(model);});

  // //show 3D version of model if you click on it
  // $("#" + modelName + "_3D").click(function() {show3D(model);});
}

//removes models from gallery
function removeContent() {
  var modelList = document.getElementById("model-gallery")
  while (modelList.firstChild) {
    modelList.removeChild(modelList.firstChild);
  }
}

//updates selectedModels when a change has been made
function updatedSelectedList(model)
{
  //allows user to click and unclick model
  selectedModels[preservedOrderData.indexOf(model)] = !selectedModels[preservedOrderData.indexOf(model)];
  //gets element to animate it after a model is selected
  var menu = document.getElementById("menu-bar");

  //selectedModels index depends on preservedOrderData
  if(selectedModels[preservedOrderData.indexOf(model)])
  {
    //selects model
    var element = document.getElementById(model['Name'] + "_isSelected");
    element.classList.add("selected");
    //adds animation class
    menu.classList.add("selected");
  }
  else
  {
    //deselects model
    var element = document.getElementById(model['Name'] + "_isSelected");
    element.classList.remove("selected");
  }

  //updates counters
  updateCounters(lastFapplied, filteredData);

  //remove class that allows for animation of menu bar
  setTimeout(() => {
    menu.classList.remove("selected");
  }, 750);
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

//listener for scroll to kick in infinite scroll
window.addEventListener('scroll', () => {
  var footerHeight = $('#contact-section').height();
  // var footerHeight = document.getElementById("contact-section").height()
  var padding = 50;
  var dataToPopulate;

  //which gallery is the scrolling filling?
  if(!viewingSelectedModels) {
    dataToPopulate = filteredData;
  }
  else {
    dataToPopulate = displayedData;
  }

  if(doneDownloading)
  {
    dataToPopulate = [];
  }

  //populates with 8 more models when someone scrolls
  if (window.scrollY + window.innerHeight + footerHeight + padding>= document.documentElement.scrollHeight) {
    populate(dataToPopulate, 8);
  }
});

//function to reset scroll
function scrollToTop() {
  window.scrollTo(0, 0);
}

//function that works with error message
function errorMessage(isOn, whichToDisplay)
{
  var errorMsg = document.getElementById('error-msg');
  var button = document.getElementById("returnToGalleryButton");

  //determines which message is showing
  if(whichToDisplay == "filter")
  {
    //shows the error message for the filter
    errorMsg.textContent = "It looks like there are no results matching the filters! Please consider using less restrictive rules.";
    button.style.transitionDuration = '0s';
    button.style.opacity = 0;
  }
  else if(whichToDisplay == "viewingselected")
  {
    //shows the error message for selected models page
    errorMsg.textContent = "It looks like no models are currently selected!";
    button.style.transitionDuration = '0s';
    button.style.opacity = 0;
  }
  else if(whichToDisplay == "justdownloaded")
  {
    //shows the message to thank the user
    errorMsg.textContent = "Thank you for downloading!";
    //show the button to return to gallery
    button.style.transitionDuration = '0.3s';
    button.style.opacity = 1;
  }

  //whether or not the error message is visible/displayed
  if(isOn)
  {
    //when button is showing is shown above 
    errorMsg.style.transitionDuration = '0.3s';
    errorMsg.style.opacity = 1;
  }
  else
  {
    //hides both if error message is not on
    errorMsg.style.transitionDuration = '0s';
    errorMsg.style.opacity = 0;
    button.style.transitionDuration = '0s';
    button.style.opacity = 0;
  }

  if(button.style.opacity == 0)
  {
    doneDownloading = false;
  }
}

// HOOKS FOR MAIN

//open/close lateral filter
//sets listeners for Close button
$('.cd-filter-trigger').on('click', function(){
  triggerFilter(true);
});

$('.cd-filter .cd-close').on('click', function(){
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
    applyFilters()
    //closes filter bar
    triggerFilter(false);
    return true;
  }
});

//apply filter with enter is pressed on age fields
$('#min-age').keydown(function (e) {
  if (e.keyCode == 13) {
    e.preventDefault();
    // if (e.ctrlKey) {
    applyFilters();
    //closes filter bar
    triggerFilter(false);
    return true;
  }
});

$('#max-age').keydown(function (e) {
  if (e.keyCode == 13) {
    e.preventDefault();
    applyFilters();
    //closes filter bar
    triggerFilter(false);
    return true;
  }
});

//hooks that check width
$(window).ready(checkWidth);
$(window).resize(checkWidth);

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