//collapses all h4 headers in filters bar
$("#closeAllButton").click(function() {
  // gets all elements with h4 headings
  var h4Elements = document.getElementsByTagName("h4");
  var changeClass = []
  for(var i = 0; i < h4Elements.length; i++)
  {
    //if the element is open, add to changeClass array
    if(!h4Elements[i].classList.contains('closed'))
    {
      changeClass.push(h4Elements[i]);
    }
  }
  //makes css adjustments to close all menus
  $(changeClass).addClass('closed').siblings(".cd-filter-content").slideToggle(300);
  var contentH4 = document.getElementsByClassName(".cd-filter-content");
  $(contentH4).css({ "display": "none" });
});

//clears all filters in filter bar
$("#clearAllButton").click(function() {
    clearAllFilters();
});

function clearAllFilters(){
  //deselects all checkboxes (including the projects or results button)
  $('input:checkbox').removeAttr('checked');
  
  //reset age filter
  document.getElementById("min-age").value = 0;
  document.getElementById("max-age").value = 120;
  
  //set both dropdown menus to no value
  document.getElementById("select-Sex").value = "all";
  document.getElementById("select-Species").value = "all";
    
  //set search bar to no value
  document.getElementById('search-field').value = "";

  //resets filters
  applyFilters();
}

$("#select-all").click(function() {
    if(viewingSelectedModels)
    {
      //if viewing selected models, deselects them
      deselectAll();
    }
    if(!viewingSelectedModels)
    {
      //updates select-all icon from deselectAll()
      document.getElementById("select-all").classList.remove("cannotSelect");

      //if viewing gallery, selects all filteredData
      selectAllFilteredData();
    }
});

//deselects all models
function deselectAll()
{
  //if at least one model has been selected
  if(selectedModels.filter(value => value === true).length > 0){

    clearDoConfirm();

    //sends a "confirm action" notification
    doConfirm("Are you sure you want to deselect all selected models?", function yes() {
      //if user confirms, clears selectedModels array
      selectedModels.fill(false);
      //removes displayed models
      removeContent();
      updateCounters(lastFapplied, filteredData);
      //shows that there are no models selected
      errorMessage(true, "viewingselected");
      //updates select-all icon to unclickable state
      document.getElementById("select-all").classList.add("cannotSelect");
    });
  }
}

//deselects given model
function deselectModel(model)
{
  //sets value to false in selectedModels
  //index corresponds to preservedOrderData for shareable links
  selectedModels[preservedOrderData.indexOf(model)] = false;

  var element = document.getElementById(model['Name'] + "_isSelected");
  if (element)
    element.classList.remove("selected");
}

//selects given model
function selectModel(model)
{
  //sets value to true in selectedModels
  //index corresponds to preservedOrderData for shareable links
  selectedModels[preservedOrderData.indexOf(model)] = true;
  var element = document.getElementById(model['Name'] + "_isSelected");
  if (element)
    element.classList.add("selected");
}

//selects everything the user is viewing in gallery (filteredData)
function selectAllFilteredData()
{
  //allows for click and unclick
  selectAllIconApplied = !selectAllIconApplied;
  //resets select-all icon
  isSelectAllApplied(selectAllIconApplied);
  
  if(selectAllIconApplied)
  {
    //selects all filteredData models
    for (var i = 0; i < filteredData.length; i++)
    {
      selectModel(filteredData[i]);
    }
  }
  else
  {
    //deselects all filteredData models 
    for (var i = 0; i < filteredData.length; i++)
    {
      deselectModel(filteredData[i]);
    }
  } 

  //parameters should not have an impact
  updateCounters(lastFapplied, filteredData);
}

//downloading model in modalText
$('.download-button-modal').click(function() {
  clearDoConfirm();

  var message = "Are you sure you want to download " + viewingModel["Name"] + "?";

  //resets downloadtype as well
  if(viewingModel["Results"] == "1")
  {
    dropDown(putDropDownHere, "all");
  }
  else
  {
    dropDown(putDropDownHere, "no results");
  }

  //updates size with individual model
  var sizeWarning = document.getElementById("downloadSize");
  sizeWarning.textContent = "Size: " + getSizeIndiv(viewingModel["Name"])[1];

  doConfirm(message, function (){
    downloadModel(viewingModel["Name"]);
  });
});

//downloading all selected models
$("#download-all").click(function () {
  clearDoConfirm();
  
  //counts number of selected models
  countModels = selectedModels.filter(value => value === true).length;

  //modelsWithResults is a boolean array of all the models with results and that are selected
  modelsWithResults = selectedModelsWithResults();
  countResults = modelsWithResults.filter(value => value === true).length;

  //if nothing to download, download-all button has no function
  if (countModels > 0)
  {
    //dropDown defines downloadType
    if(countResults == 0)
    {
      dropDown(putDropDownHere, "no results");
    }
    else
    {
      dropDown(putDropDownHere, "all");
    }

    var message = downloadConfirmation(countModels, "model", selectedModels);

    //if the user clicks "yes," downloads all selected models
    doConfirm(message, function yes() {
      downloadAllModels();
    });
  }
});

//deals with downloading multiple models
async function downloadAllModels(){
  var boolModels = selectedModels;

  //if downloadType != zip, takes selectedModels and only works with those that have results
  if(downloadType != "zip")
  {
    for(var i = 0 ; i < boolModels.length; i++)
    {
      if(boolModels[i] && preservedOrderData[i]["Results"] != "1") 
      {
        boolModels[i] = false;
      }
    }
  }
  
  listOfNames = []

  for(var i = 0; i < boolModels.length; i++)
  {
    //index of boolModels corresponds with preservedOrderData
    if(boolModels[i])
    {
      //takes in list of names of all the models to download
      listOfNames.push(preservedOrderData[i]["Name"])
    }
  }

  //sends to download all models
  for(var i = 0; i < listOfNames.length; i++)
  {
    downloadModel(listOfNames[i]);
    await new Promise(r => setTimeout(r, 3));
  }

  //selected models not cleared

  //resets page
  scrollToTop();
  removeContent();
  populate([]);
  doneDownloading = true;

  //menuBarShowing will be changed to false
  menuBarShowing = true;
  toggleMenuBar();

  //not really an error message
  //shows screen with Thank you for downloading!
  errorMessage(true, "justdownloaded");

  //brings user to viewingSelectedModels
  viewingSelectedModels = true;
  document.getElementById("view-selected").classList.add("applied");

  //changes counter header to ""
  updateCounters(lastFapplied, filteredData, "justdownloaded");
}

//listener for button that appears after someone downloaded models
$("#returnToGalleryButton").click(function () {
    //update select all icon
    isSelectAllApplied(false);
    document.getElementById("view-selected").classList.remove("applied");

    //brings user to gallery
    viewingSelectedModels = false;
    removeContent();
    scrollToTop();
    curIndex = 0;
    populate(filteredData);

    //updates counters
    updateCounters(lastFapplied, filteredData);

    //updates error message, in case there is an error
    if (filteredData.length == 0) {
      errorMessage(true, "filter")
    }
    else {
      errorMessage(false, "filter")
    }
});

//share button inside modalText
$('.shareableLink-button-modal').click(function() {
  //creates array with all N except for the model
  var array = makeshiftSelectedModels(preservedOrderData, viewingModel);
  //copies encoded URL to clipboard
  copyText("https://www.vascularmodel.com/share.html?" + encodeBTOA(encodeRLE(array)));
  informUser("Link copied");
});

//share-all button
//makes a shareable link for all selected models
$('#sharelink-all').click(function() {
  //only copies something if models are selected
  if(selectedModels.filter(value => value === true).length > 0)
  {
    //makes selectedModels, in true/false, to array in Y/N
    var binary = boolToYN(selectedModels);
    copyText("https://www.vascularmodel.com/share.html?" + encodeBTOA(encodeRLE(binary)));
    informUser("Link copied");
  }  
});

//brings user to view-selected page
$("#view-selected").click(function() {
  viewSelected(true);
});

//function to view selected models
function viewSelected(flipViewingSelectedModels, moveToTop = true) {
  if (flipViewingSelectedModels)
  {
    //allows user to click and unclick
    viewingSelectedModels = !viewingSelectedModels;
  }
  
  //if user is in viewingSelectedModels mode
  if(viewingSelectedModels)
  {
    //closes filter bar
    triggerFilter(false);
  
    //resets displayedData global variable
    displayedData = []
  
    for(var i = 0; i < data.length; i++)
    {
      if(selectedModels[i])
      {
        //saves models to display
        displayedData.push(preservedOrderData[i])
      }
    }

    //resets page
    removeContent();
    if (moveToTop)
      scrollToTop();
    curIndex = 0;
    populate(displayedData);
    
    //works with error message
    if (displayedData.length == 0) {
      errorMessage(true, "viewingselected")
    }
    else {
      errorMessage(false, "viewingselected")
    }
  
    //parameters should not have an impact
    updateCounters(lastFapplied, filteredData);
  
    //update select all icon
    if(displayedData.length > 0)
    {
      isSelectAllApplied(true);
    }
    else
    {
      //user cannot click on select-all if there is nothing to deselect
      document.getElementById("select-all").classList.add("cannotSelect");
    }
  }
  else
  {
    //update select all icon
    isSelectAllApplied(false);

    //reset page
    removeContent();
    scrollToTop();
    curIndex = 0;
    populate(filteredData);
    updateCounters(lastFapplied, filteredData);
    
    //works with error message
    if (filteredData.length == 0) {
      errorMessage(true, "filter")
    }
    else {
      errorMessage(false, "filter")
    }
  }
}

//works with menu bar
$("#menu-bar").click(function() {
  toggleMenuBar();
});

//turns menu bar on and off
function toggleMenuBar()
{
  //allows user to click and unclick
  menuBarShowing = !menuBarShowing;

  var features = document.getElementById("features");
  var menuBar = document.getElementById("menu-bar");

  if (menuBarShowing)
  {
    //reveals features and moves menuBar
    features.classList.add("features-is-visible");
    menuBar.classList.add("features-is-visible");
  }
  else
  {
    //hides features and moves menuBar
    features.classList.remove("features-is-visible");
    menuBar.classList.remove("features-is-visible");
  }
}

// help button listeners
$("#help").click(function () {
  window.open("gallerytutorial.html");
});

$("#helpFilters").click(function () {
  window.open("filtertutorial.html");
});

$("#helpMenu").click(function () {
  window.open("menututorial.html");
  menuBarShowing = true;
  toggleMenuBar()
});

//function to prevent user from scrolling
function preventScroll(e){
  e.preventDefault();
  e.stopPropagation();

  return false;
}

// listeners for ProjectMustContain and search bar
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

//proOrRe: projects or results slider
$('#proOrRe').click(function() {
  applyFilters();
});

//listener for change in drop down menu
$("#putDropDownHere").click(function () {
  downloadType = document.getElementById("chooseType").value;

  //clear variables
  warningHTML.innerHTML = "";
  warningHTML.classList.remove("newParagraph");
  
  //if viewing model (and therefore the modal greeting's overlay is on)
  if(isOverlayOn)
  {
    //updates size with one model
    updateSize(makeBooleanArray(preservedOrderData, viewingModel));
  }
  else
  {
    //asks to confirm download differently depending on type selected
    if(downloadType == "zip")
    {
      var msg = downloadConfirmation(countModels, "model", selectedModels);
    }
    else
    {
      var msg = downloadConfirmation(countResults, "simulation result", modelsWithResults);
      //difference tells the user how many models have simulation results to download
      difference(countModels, countResults, warningHTML)
    }

    //updates message with download confirmation
    updateMessage(msg);
  }
});