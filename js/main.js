// <li class="mix color-2 check2 radio2 option2"><img src="img/vmr-images/0003_0001.png" alt="Image 2"></li>

$("#closeAllButton").click(function() {
  var h4Elements = document.getElementsByTagName("h4");
  var changeClass = []
  for(var i = 0; i < h4Elements.length; i++)
  {
    if(!h4Elements[i].classList.contains('closed'))
    {
      changeClass.push(h4Elements[i]);
    }
  }
  $(changeClass).addClass('closed').siblings(".cd-filter-content").slideToggle(300);
  var contentH4 = document.getElementsByClassName(".cd-filter-content");
  $(contentH4).css({ "display": "none" });
});


function addClickListener(model) {
  $('#' + model['Name']  + "_details").click(function() {greetingText(model); checkOverlay(); console.log("through magnif");});
  $('#' + model['Name']).click(function() {updatedSelectedList(model);});
}

$("#select-all").click(function() {
  if(viewingSelectedModels)
  {
    deselectAll();
  }
  if(!viewingSelectedModels)
  {
    document.getElementById("select-all").classList.remove("cannotSelect");
    selectAllFilteredData();
  }
});

$("#safeOfOverlayClick").click(function() {isSafeSelected = true; console.log("safe true")});

$('#overlay').click(function() {
  checkOverlay();
  isSafeSelected = !isSafeSelected;

  console.log("through overlay; safe now: " + isSafeSelected);
});

$('.close-button-modal').click(function() {
  overlayOff();
  console.log("through close");
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

function selectAllFilteredData()
{
  wantsToSelectAllInFiltered = !wantsToSelectAllInFiltered;

  if(wantsToSelectAllInFiltered)
  {
    for (var i = 0; i < filteredData.length; i++)
    {
      selectModel(filteredData[i]);
    }
    selectIcon = document.getElementById("select-all");
    selectIcon.classList.add("applied");
  }
  else
  {
    for (var i = 0; i < filteredData.length; i++)
    {
      deselectModel(filteredData[i]);
    }

    selectIcon = document.getElementById("select-all");
    selectIcon.classList.remove("applied");
  }
  //parameters should not have an impact
  updateCounters(lastFapplied, filteredData);
}

function deselectModel(model)
{
  selectedModels[data.indexOf(model)] = false;
  var element = document.getElementById(model['Name'] + "_isSelected");
  if (element)
    element.classList.remove("selected");
}

function selectModel(model)
{
  selectedModels[data.indexOf(model)] = true;
  var element = document.getElementById(model['Name'] + "_isSelected");
  if (element)
    element.classList.add("selected");
}

function updatedSelectedList(model)
{
  selectedModels[data.indexOf(model)] = !selectedModels[data.indexOf(model)];
  var bucket = document.getElementById("view-selected");

  if(selectedModels[data.indexOf(model)])
  {
    var element = document.getElementById(model['Name'] + "_isSelected");
    element.classList.add("selected");
    bucket.classList.add("selected");
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
      bucket.classList.remove("selected");
    }
  }, 750);
}

function greetingText(data)
{
  viewingModel = data['Name'];
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
      modalclosure.innerHTML = "";
      indexOfStartOfTag = notes.indexOf("\\url");

      indexOfStartOfLink = notes.indexOf("(\"");
      indexOfEndOfLink = notes.indexOf("\",", indexOfStartOfLink);
      url = notes.substring(indexOfStartOfLink + 2, indexOfEndOfLink);

      indexOfStartOfWord = notes.indexOf(" \"", indexOfEndOfLink);
      indexOfEndOfWord = notes.indexOf("\")", indexOfStartOfWord);
      word = notes.substring(indexOfStartOfWord + 2, indexOfEndOfWord);

      var pBefore = document.createElement("span");
      pBefore.textContent = notes.substring(0, indexOfStartOfTag);
      modalclosure.appendChild(pBefore);

      var a = document.createElement("a")
      a.setAttribute("href", url);
      a.setAttribute("target", "_blank");
      a.classList.add("link");
      a.textContent = word;

      if(url.includes(".zip"))
      {
        a.setAttribute("download", "");
      }

      modalclosure.appendChild(a);

      var pAfter = document.createElement("span");
      pAfter.textContent = notes.substring(indexOfEndOfWord + 2);
      modalclosure.appendChild(pAfter);

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

//grammar for commas and ands
function listFormater(string)
{
  var output = ""
  valInCat = checkboxNameInArrayForm(string);

  var numOfDetails = valInCat.length;

  if(numOfDetails == 2)
  {
    output = valInCat[0] + " and " + valInCat[1];
  }
  else
  {
    for(var v = 0; v < numOfDetails - 1; v++)
    {
      output = valInCat[v] + ", ";
    }

    output += "and " + valInCat[numOfDetails - 1];
  }

  return output;
}

function ageCalculator(value)
{
  if(value > 1)
  {
    return value + " years"
  }
  else
  {
    var months = value * 12;
    var weeks = value * 52;
    var days = value * 365;
    if (months > 1)
    {
      return Math.round(months*100)/100 + " months"
    }
    else if (weeks > 1)
    {
      return Math.round(weeks*100)/100 + " weeks"
    }
    else {
      return Math.round(days*100)/100 + " days"
    }
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
  div.classList.add("col-md-3");
  div.classList.add("col-sm-12");

  var divModelImage = document.createElement("div");
  divModelImage.classList.add("model-image");
  divModelImage.classList.add("animate");
  divModelImage.setAttribute("id",modelData['Name'] + "_isSelected");

  if(selectedModels[data.indexOf(modelData)])
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
      console.log("#search-field2 apply filters")
      applyFilters()
      triggerFilter(false);
      return true;
    }
  });

  $('#min-age').keydown(function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      // if (e.ctrlKey) {
      console.log("#min-age apply filters")
      applyFilters();
      triggerFilter(false);
      return true;
    }
  });

  $('#max-age').keydown(function (e) {
    if (e.keyCode == 13) {
      e.preventDefault();
      // if (e.ctrlKey) {
      console.log("#max-age apply filters")
      applyFilters()
      triggerFilter(false);
      return true;
    }
  });
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

$('.download-button-modal').click(function() {
  overlayOff();
  // download tracking
  window.open('svprojects/' + viewingModel + '.zip')
});

$("#download-all").click(function () {
  if (selectedModels.filter(value => value === true).length > 0)
  {
    downloadAllSelectedModels();
  }
});

function downloadModel(modelToDownloadName)
{
  var fileUrl = 'svprojects/' + modelToDownloadName + '.zip';
  var a = document.createElement("a");
  a.href = fileUrl;
  a.setAttribute("download", modelToDownloadName);
  a.click();

  gtag('event', 'download_' + modelToDownloadName, {
    'send_to': 'G-YVVR1546XJ',
    'event_category': 'Model download',
    'event_label': 'test',
    'value': '1'
});
}

function downloadAllSelectedModels(){

  listOfNames = []

  for(var i = 0; i < selectedModels.length; i++)
  {
    if(selectedModels[i])
    {
      listOfNames.push(data[i]["Name"])
    }
  }

  for(var i = 0; i < listOfNames.length; i++)
  {
    downloadModel(listOfNames[i]);
  }

  selectedModels.fill(false);
  scrollToTop();
  removeContent();
  populate([]);
  errorMessage(true, "justdownloaded")
  viewingSelectedModels = true;
  updateCounters(lastFapplied, filteredData, "justdownloaded");
}

$("#returnToGalleryButton").click(function () {
  //update select all icon
  document.getElementById("select-all").classList.remove("applied");
  document.getElementById("view-selected").classList.remove("applied");

  viewingSelectedModels = false;
  removeContent();
  scrollToTop();
  curIndex = 0;
  populate(filteredData);
  updateCounters(lastFapplied, filteredData);

  if (filteredData.length == 0) {
    errorMessage(true, "filter")
  }
  else {
    errorMessage(false, "filter")
  }
});

$("#checkbox-Images").change(function () {
  applyFilters();
});

$("#checkbox-Paths").change(function () {
  applyFilters();
});

$("#checkbox-Segmentations").change(function () {
  applyFilters();
});

$("#checkbox-Models").change(function () {
  applyFilters();
});

$("#checkbox-Meshes").change(function () {
  applyFilters();
});

$("#checkbox-Simulations").change(function () {
  applyFilters();
});

function checkWidth() {
    if (screen.width >= 769 && (document.documentElement.clientWidth >= 769)) {
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
      counterPanel.textContent = count + " models selected";
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
        counterPanel.textContent = fData.length + '/' + data.length + ' models'
      }
      else {
        counterPanel.textContent = fData.length + '/' + data.length + ' models'
      }
    }
    else {
      if (fApplied) {
        counterPanel.textContent = "Filters applied: " + fData.length + '/' + data.length + ' models'
      }
      else {
        document.getElementById("counterPanel").textContent = "Filters not applied: " + fData.length + '/' + data.length + ' models'
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
  if(!viewingSelectedModels)
  {
    if (window.scrollY + window.innerHeight + footerHeight + padding>= document.documentElement.scrollHeight) {
      populate(filteredData, 8);
    }
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

$("#view-selected").click(function() {
  viewingSelectedModels = !viewingSelectedModels;

  if(viewingSelectedModels)
  {
    triggerFilter(false);

    var display = []

    for(var i = 0; i < data.length; i++)
    {
      if(selectedModels[i])
      {
        display.push(data[i])
      }
    }

    removeContent();
    scrollToTop();
    curIndex = 0;
    populate(display);

    if (display.length == 0) {
      errorMessage(true, "viewingselected")
    }
    else {
      errorMessage(false, "viewingselected")
    }

    //parameters should not have an impact
    updateCounters(lastFapplied, filteredData);

    //update select all icon
    if(display.length > 0)
    {
      document.getElementById("select-all").classList.add("applied");
    }
    else
    {
      document.getElementById("select-all").classList.add("cannotSelect");
    }
  }
  else
  {
    //update select all icon
    document.getElementById("select-all").classList.remove("applied");

    removeContent();
    scrollToTop();
    curIndex = 0;
    populate(filteredData);
    updateCounters(lastFapplied, filteredData);

    if (filteredData.length == 0) {
      errorMessage(true, "filter")
    }
    else {
      errorMessage(false, "filter")
    }
  }

});

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
