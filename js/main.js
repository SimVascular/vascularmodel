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
    
    var details = []
    var categoryName = getCategoryName();

    for(var i = 0; i < categoryName.length; i++)
    {
      details += categoryName[i] + ": " + data[categoryName[i]] + '\n'
    }

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

function getAllCategories()
{
  var allCategories = []

  for (const [key, value] of Object.entries(data[0])) {
    allCategories.push(key);
  }

  return allCategories;
}

function getFilterTitles()
{
  var allCategories = getAllCategories()
  var onlyFilterTitles = []

  for(var i = 0; i < allCategories.length; i++)
  {
    if(allCategories[i] != "Size" && allCategories[i] != "Name")
    {
      onlyFilterTitles.push(allCategories[i])
    }
  }

  return onlyFilterTitles;
}

function getCategoryName()
{
  var allCategories = getAllCategories()
  var onlyTheAttributes = []

  //skips Name
  //ends before start of MustContain filters
  for (var i = 1; i < allCategories.indexOf("Images"); i++)
  {
    onlyTheAttributes.push(allCategories[i]);
  }

  return onlyTheAttributes;
}

function getCheckboxName()
{
  var allCategories = []
  var notDropDownNames = []

  for (const [key, value] of Object.entries(data[0])) {
    allCategories.push(key);
  }

  for (var i = 0; i < allCategories.length; i++)
  {
    if (getNTimesPerCategory(allCategories[i]) != 2 && allCategories[i] != "Name" && allCategories[i] != "Size")
    {
      notDropDownNames.push(allCategories[i]);
    }
  }

  return notDropDownNames;
}

/*function getUorIButton()
{
  var UorIButton = document.getElementById("UorIButton")
  UorIButton.classList.add("cd-UorIButton")
}*/

function getFilterMenu()
{
  var filterCheckboxes = document.getElementById("filterCheckboxes")
  var categoryName = getCategoryName();

  var allHooks = []

  for(var i = 0; i < categoryName.length; i++)
  {
    var div = document.createElement('div');
    div.classList.add("cd-filter-block")

    var h4 = document.createElement('h4');
    h4.classList.add("closed");
    h4.textContent = categoryName[i];

    if (getNTimesPerCategory(categoryName[i]) == 2)
    {
      var output = generateDropDownMenu(categoryName[i]);
    }
    else
    {
      var output = generateCheckboxUl(categoryName[i]);
    }

    var insideContent = output[0]
    var hooks = output[1]

    div.appendChild(h4);
    div.appendChild(insideContent);
    filterCheckboxes.appendChild(div);
    allHooks.push(hooks);
  }

  for (var i = 0; i < allHooks.length; i++)
  {
    addHooks(allHooks[i]);
  }
}

function addHooks(hooks) {
  for (var i = 0; i < hooks.length; i++) {
    $("#" + hooks[i]).change(function() {applyFilters();});
  }
}

function generateDropDownMenu(categoryName)
{
  var div = document.createElement("div")
  div.classList.add("cd-filter-content");
  div.classList.add("cd-select");
  div.classList.add("cd-filters");
  div.classList.add("list");

  var select = document.createElement("select")
  select.classList.add("filter")
  select.setAttribute("id", "select-" + categoryName)
  //select.classList.add("dropbtn");

  var option = document.createElement("option")
  option.value = "none";
  option.textContent = "Select One";
  select.appendChild(option);
  option.classList.add("dropdown-content");

  var hooks = ["select-" + categoryName];

  //separate for Age
  if(categoryName == "Age")
  {
    var checkboxNameArray = ["Adult", "Pediatric"]
  }
  else{
    var checkboxNameSet = new Set();
  
    for(var i = 0; i < data.length; i++)
    {
      checkboxNameSet.add(data[i][categoryName])
    }

    var checkboxNameArray = Array.from(checkboxNameSet);
    checkboxNameArray.sort();
  }

  //checkboxNameArray.length should = 2
  for (var i = 0; i < checkboxNameArray.length; i++) {
      var newOption = generateOptions(checkboxNameArray[i]);
      select.appendChild(newOption);
  }
  
  div.appendChild(select);

  return [div, hooks]
}

function generateOptions(optionName)
{
  var option = document.createElement("option")
  option.value = optionName;

  option.textContent = optionName;
  option.classList.add("dropdown-content");
  return option;
}

function generateCheckboxUl(categoryName)
{
  var ul = document.createElement("ul")
  ul.classList.add("cd-filter-content");
  ul.classList.add("cd-filters");
  ul.classList.add("list");
  
  var checkboxNameSet = new Set();
  
  for(var i = 0; i < data.length; i++)
  {
    checkboxNameSet.add(data[i][categoryName])
  }

  var checkboxNameArray = Array.from(checkboxNameSet);
  checkboxNameArray.sort();

  var hooks = []
  
  for (var i = 0; i < checkboxNameArray.length; i++) {
      var newLi = generateCheckboxLi(checkboxNameArray[i]);
      ul.appendChild(newLi);
      hooks.push("checkbox-" + checkboxNameArray[i])
  }

  return [ul, hooks];
}

function generateCheckboxLi(checkboxName) {
  let li = document.createElement('li');
  
  let input = document.createElement('input');
  input.classList.add("filter");
  input.setAttribute("data-filter", checkboxName);
  input.type = "checkbox";
  input.setAttribute("id", "checkbox-" + checkboxName);

  let label = document.createElement('label');
  label.classList.add("checkbox-label");
  label.setAttribute("for", "checkbox-" + checkboxName)
  label.textContent = checkboxName;

  li.appendChild(input);
  li.appendChild(label);

  return li;
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

function getNTimesPerCategory(categoryName)
{
  var nTimesRepeat = 0;

  var categoryNames = []
  var allCategoryNames = []

  for (const [key, value] of Object.entries(data[0])) {
    allCategoryNames.push(key);
  }
    
  for(var i = allCategoryNames.indexOf("Images"); i < allCategoryNames.indexOf("Size"); i++)
  {
    categoryNames.push(allCategoryNames[i])
  }
  
  if (categoryName == "Age")
  {
    nTimesRepeat = 2;
  }
  else if (categoryNames.includes(categoryName))
  {
    nTimesRepeat = 1;
  }
  else
  {
    var noRepeatArray = new Set();
    for(var dI = 0; dI < data.length; dI++)
    {
      noRepeatArray.add(data[dI][categoryName])
    }
    nTimesRepeat = noRepeatArray.size;
  }

  return nTimesRepeat;
}

function getNTimes()
{
  var nTimesRepeat = []
  var listOfNames = getAllCategories();

  //skips Name and Size
  for(var i = 1; i < listOfNames.length - 1; i ++)
  {
    nTimesRepeat.push(getNTimesPerCategory(listOfNames[i]));
  }
  
  return nTimesRepeat;
}

function applyFilters(){
  var filterApplied = false
  curIndex = 0;
  var filteredData = data;
  /*
  var IDs = fillIDs();
  var keys = fillKeys();
  
  var categoryName = getCheckboxName();*/
  var nTimes = getNTimes();/*
  var category = []

  for(var i = 0; i < categoryName.length; i++)
  {
    category = fillCategory(category, nTimes[i], categoryName[i]);
  }*/

  var filterOutput;

  var titles = getFilterTitles();

  for(var t = 0; t < titles.length; t++){
    
    if (getNTimesPerCategory(titles[t]) == 2)
    {
      filterOutput = dropDownFilter(titles[t], filteredData)
      filteredData = filterOutput[0]
      filterApplied = filterApplied || filterOutput[1]
    }
    else {
      var whichToKeep = []
      //if a box is checked in the category
      if (isChecked(titles[t]))
      {    
        for (var i = 0;  i < filteredData.length; i++) {
          whichToKeep.push(false);
        }

        for(var i = 0; i < nTimes[t]; i++)
        {
          IDs = checkboxNamesPerCategory(titles[t], false)
          keys = checkboxNamesPerCategory(titles[t], true)
          filterOutput = checkboxFilter("checkbox-" + IDs[i], titles[t], keys[i], filteredData, whichToKeep)
          whichToKeep = filterOutput[0]
          filterApplied = filterApplied || filterOutput[1]
        }
      }
      else{
        for (var i = 0;  i < filteredData.length; i++) {
          whichToKeep.push(true);
        }
      }
      //whichToKeep and filteredData should have the same length
      filteredData = updatedFilteredData(whichToKeep, filteredData);
    }
  }

  filterOutput = applySearchFilter(filteredData);
  filteredData = filterOutput[0]
  filterApplied = filterApplied || filterOutput[1]

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

function updatedFilteredData(whichToKeep, filteredData)
{
  var updatedFilteredData = []

  for (var i = 0 ; i < filteredData.length; i++)
  {
    if (whichToKeep[i])
    {
      updatedFilteredData.push(filteredData[i]);
    }
  }

  return updatedFilteredData;
}

function isChecked(title)
{
  IDs = checkboxNamesPerCategory(title, false)

  for(var i = 0; i < IDs.length; i++)
  {
    if (document.getElementById("checkbox-" + IDs[i]).checked)
    {
      return true;
    }
  }  
}

function checkboxNamesPerCategory(categoryName, isKey)
{
  var checkboxNames = []
  var checkboxNameSet = new Set();
          
  for(var dI = 0; dI < data.length; dI++)
  {
    checkboxNameSet.add(data[dI][categoryName])
  }

  var checkboxNames = Array.from(checkboxNameSet);

  if (!isKey && checkboxNames.includes("1"))
  {
    checkboxNames = [categoryName]
  }
  return checkboxNames;
}

function fillCategory(category, n, categoryName)
{
  for(var i = 0; i < n; i++)
  {
    category.push(categoryName);
  }
  
  return category;
}

function dropDownFilter(categoryName, partialData){

  var valueToSearch = document.getElementById("select-" + categoryName).value.toLowerCase()

  if(valueToSearch == 'none')
  {
    return [partialData, false];
  }
  else
  {
    var filteredData = []
    var arrayLength = partialData.length;

    for (var i = 0; i < arrayLength; i++) {
      for (const [key, value] of Object.entries(partialData[i])) {
        var category = key.toLowerCase();
        var option = value.toLowerCase();
        
        if (category == categoryName.toLowerCase()) {
          var pushValue = false;

          if (option == valueToSearch) 
          {
            pushValue = true; 
          }

          //different for Age
          if(category.toLowerCase() == "age")
          {
            if (valueToSearch == "pediatric" && parseInt(option) < 18) {
              pushValue = true;
            }
            else if (valueToSearch == "adult" && parseInt(option) >= 18){
              pushValue = true;
            }
          }

          if (pushValue)
            filteredData.push(partialData[i]);
        }
      }
    }

    return [filteredData, true];
  }
}

function checkboxFilter(checkboxID, category, key, partialData, whichToKeep){
  
  if (document.getElementById(checkboxID).checked)
  {
    var arrayLength = partialData.length;
  
    for (var i = 0; i < arrayLength; i++) {
      if (partialData[i][category] == key) {
        whichToKeep[i] = true;
      }
    }
  
    return [whichToKeep, true];
  }

  //nothing checked; returns same array as input
  return [whichToKeep, false]
}

function applySearchFilter(partialData){
  var valueToSearch = document.getElementById('search-field').value.toLowerCase()

  if (valueToSearch == '')
  {
    return [partialData, false]
  }
  else
  {
    var filteredData = new Set()
    var arrayLength = partialData.length;
    var allCategories = getAllCategories();
    var categoriesWith1s = []

    for(var i = 0; i < allCategories.length; i++)
    {
      if (getNTimesPerCategory(allCategories[i]) == 1)
      {
        categoriesWith1s.push(allCategories[i])
      }
    }
    

    for (var i = 0; i < arrayLength; i++) {
      for (const [key, value] of Object.entries(partialData[i])) {
        var category = key.toLowerCase();
        var input = value.toLowerCase();

        if (!categoriesWith1s.includes(category))
        {
          if (input.includes(valueToSearch)) {
            filteredData.add(partialData[i])
          }
        }
        else
        {
          if (category == valueToSearch && input == '1') {
            filteredData.add(partialData[i])
          }
        }

      }
    }

    filteredData = Array.from(filteredData);

    return [filteredData, true];
  }
}

function getOptionsUnderCategory(categoryName)
{
  var optionsSet = new Set();
          
  for(var dI = 0; dI < data.length; dI++)
  {
    optionsSet.add(data[dI][categoryName])
  }

  var options = Array.from(optionsSet);

  return options;
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