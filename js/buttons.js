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
  //checks if project or results button is checked
  var proOrReStatus = document.getElementById("switch-input").checked;
  //deselects all checkboxes (including the projects or results button)
  $('input:checkbox').removeAttr('checked');
  //checks status
  if(proOrReStatus)
  {
    //reverts if checkbox was wrongfully unchecked
    document.getElementById("switch-input").checked = true;
  }
  
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
  downloadModel(viewingModel["Name"]);
});

//downloading all selected models
$("#download-all").click(function () {
  //counts number of selected models
  var countModels = selectedModels.filter(value => value === true).length;

  //modelsWithResults is a boolean array of all the models with results and that are selected
  var modelsWithResults = selectedModelsWithResults();
  var countResults = modelsWithResults.filter(value => value === true).length;
  
  var message = "";

  //if nothing to download, download-all button has no function
  if (countModels > 0)
  {
    //informs user what they are downloading depending on their mode
    if(modeIsResults)
    {
      if(countResults != 0)
      {
        //calculates how many models do not have results
        var difference = countModels - countResults;

        //grammar with plural
        //informs user of simulation results that they cannot havwe
        if(difference == 1)
        {
          message = "One model does not have simulation results to download.";
        }
        else if(difference != 0)
        {
          message = difference + " models do not have simulation results to download.";
        }

        //download confirmation
        message += "\\n\\nAre you sure you want to download ";

        //grammar with plural
        if(countResults == 1)
        {
          message += "one simulation result?";
        }
        else if(countResults != 0)
        {
          message += countResults + " simulation results?";
        }

        //if the user clicks "yes," downloads all simulation results
        doConfirm(message, function yes() {
          downloadAllModels(modelsWithResults);
        });
      }
      else
      {
        message = "Your selected models do not have simulation results to download."
        informUser(message, "lower", true);
      }
    }
    else
    {
      //confirmation to download when user is not viewing simulation results
      message = "Are you sure you want to download ";
      if(countModels == 1)
      {
        message += "one model?";
      }
      else
      {
        message += countModels + " models?";
      }

      //if the user clicks "yes," downloads all selected models
      doConfirm(message, function yes() {
        downloadAllModels(selectedModels);
      });
    }
  }
});

async function downloadAllModels(boolModels){
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
  
  //clears boolModels
  boolModels.fill(false);

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
  
  var selectIconStatus = selectAllIconApplied;
  //resets filters
  applyFilters();

  if(selectIconStatus)
  {
    isSelectAllApplied(true);
  }
  
});

//lets us confirm actions with users
function doConfirm(msg, yesFn, noFn) {
  var confirmBox = $("#confirmBox");
  if(msg.includes("\\n"))
  {
    confirmBox.find(".message")[0].innerHTML = "";
    confirmBox.find(".message")[0].appendChild(newLineNoURL(msg, false));
  }
  else
  {
    confirmBox.find(".message").text(msg);
  }

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
function informUser(msg, string = "", hasOk = false) {
  var informUser = $("#informUser");
  informUser.find(".message").text(msg);
  informUser.show();

  //reveals the box with opacity
  var div = document.getElementById("informUser");
  div.style.opacity = 1;

  //changes position of alert for clarity
  if(string == "lower")
  {
    div.setAttribute("style", "top: 300px");
  }
  else
  {
    div.setAttribute("style", "top: 30px")
  }

  //clears where the Okay button goes
  var goesHere = document.getElementById("okayGoesHere");
  goesHere.innerHTML = "";

  if(hasOk)
  {
    //if has an okay button, creates it
    var span = document.createElement("span");
    span.classList.add("button");
    span.classList.add("yes");
    span.textContent = "Okay";
    goesHere.appendChild(span);

    //hides informUser box after button is clicked
    informUser.find(".yes").unbind().click(function () {
      informUser.hide();
    });
  }
  else
  {
    //fades after 1.5 seconds if doesn't have an Okay button
    setTimeout(() => {
      informUser.hide();
    }, 1500);
  }
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