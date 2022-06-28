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
  //clear all checked boxes
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
  wantsToSelectAllInFiltered = !wantsToSelectAllInFiltered;

  if(wantsToSelectAllInFiltered)
  {
    //selects all filteredData models
    for (var i = 0; i < filteredData.length; i++)
    {
      selectModel(filteredData[i]);
    }
    //updates selectIcon to applied state
    selectIcon = document.getElementById("select-all");
    selectIcon.classList.add("applied");
  }
  else
  {
    //deselects all filteredData models 
    for (var i = 0; i < filteredData.length; i++)
    {
      deselectModel(filteredData[i]);
    }

    //updates selectIcon to unapplied state
    selectIcon = document.getElementById("select-all");
    selectIcon.classList.remove("applied");
  } 

  //parameters should not have an impact
  updateCounters(lastFapplied, filteredData);
}

//downloading model in modalText
$('.download-button-modal').click(function() {
  downloadModel(viewingModel["Name"]);
});

//downloading all selected models
$("#download-all").click(function () {
  //counts number of models to download
  var count = selectedModels.filter(value => value === true).length;
  var message = "";
  var endWord = ""
  //if nothing to download, download-all button has no function
  if (count > 0)
  {
    //informs user what they are downloading depending on their mode
    if(modeIsResults)
    {
      endWord = " simulation result";
    }
    else
    {
      endWord = " model";
    }

    //for the grammar with the "s"
    if(count == 1)
    {
      message = "Are you sure you want to download one " + endWord + "?";
    }
    else
    {
      message = "Are you sure you want to download " + count + endWord + "s?";
    }

    //if the user clicks "yes," downloads all selected models/simulation results
    doConfirm(message, function yes() {
      downloadAllSelectedModels();
    });
  }
});

async function downloadAllSelectedModels(){
  listOfNames = []
  
  for(var i = 0; i < selectedModels.length; i++)
  {
    //index of selectedModels corresponds with preservedOrderData
    if(selectedModels[i])
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
  
  //clears selectedModels
  selectedModels.fill(false);

  //resets page
  scrollToTop();
  removeContent();
  populate([]);

  //not really an error message
  //shows screen with Thank you for downloading!
  errorMessage(true, "justdownloaded");

  //brings user to viewingSelectedModels
  viewingSelectedModels = true;

  //changes counter header to ""
  updateCounters(lastFapplied, filteredData, "justdownloaded");
}

//downloads individual models
function downloadModel(modelToDownloadName)
  {
    //checks what the user wants to download
    if(modeIsResults)
    {
      //different path to folder
      var fileUrl = 'results/' + modelToDownloadName + '.zip';
    }
    else
    {
      //different path to folder
      var fileUrl = 'svprojects/' + modelToDownloadName + '.zip';
    }

    //creates anchor tag to download
    var a = document.createElement("a");
    a.href = fileUrl;
    a.setAttribute("download", modelToDownloadName);
    //simulates click
    a.click();
    
    //sends message to server with user's download
    gtag('event', 'download_' + modelToDownloadName, {
      'send_to': 'G-YVVR1546XJ',
      'event_category': 'Model download',
      'event_label': 'test',
      'value': '1'
  });
}

$("#returnToGalleryButton").click(function () {
    //update select all icon
    document.getElementById("select-all").classList.remove("applied");
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
  //makes selectedModels, in true/false, to array in Y/N
  var binary = boolToYN(selectedModels);
  copyText("https://www.vascularmodel.com/share.html?" + encodeBTOA(encodeRLE(binary)));
  informUser("Link copied");
});

//brings user to view-selected page
$("#view-selected").click(function() {
  viewSelected(true);
});

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
      document.getElementById("select-all").classList.add("applied");
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
    document.getElementById("select-all").classList.remove("applied");

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
});

//proOrRe: projects or results slider
$('#proOrRe').click(function() {
  var element = document.getElementById("switch-input");

  //checks which mode is checked
  if(element.checked)
  {
    //updates global variable modeIsResults 
    modeIsResults = true;
  }
  else
  {
    modeIsResults = false;
  }
    
  //resets filters
  applyFilters();
});

//lets us confirm actions with users
function doConfirm(msg, yesFn, noFn) {
  var confirmBox = $("#confirmBox");
  confirmBox.find(".message").text(msg);

  //hides confirmation after button is clicked
  confirmBox.find(".yes,.no").unbind().click(function () {
      confirmBox.hide();
  });

  //deals with which function to call depending on user input
  confirmBox.find(".yes").click(yesFn);
  confirmBox.find(".no").click(noFn);
  confirmBox.show();
}

//informs user of a message
function informUser(msg) {
  var informUser = $("#informUser");
  informUser.find(".message").text(msg);
  informUser.show();

  //reveals the box with opacity
  var div = document.getElementById("informUser");
  div.style.opacity = 1;

  //fades after 1.5 seconds
  setTimeout(() => {
    informUser.hide();
  }, 1500);
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