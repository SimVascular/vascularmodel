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
  
  var warningHTML = document.getElementById("warning");
  warningHTML.innerHTML = "";
  warningHTML.classList.remove("newParagraph");

  var putDropDownHere = document.getElementById("putDropDownHere");
  putDropDownHere.innerHTML = "";

  //if nothing to download, download-all button has no function
  if (countModels > 0)
  {
    //informs user what they are downloading depending on their mode
    if(modeIsResults)
    {
      if(countResults != 0)
      {
        difference(countModels, countResults, warningHTML);
        var message = downloadConfirmation(countResults, "simulation result");

        dropDownMenu(putDropDownHere);

        //if the user clicks "yes," downloads all simulation results
        doConfirm(message, function yes() {
          downloadAllModels(modelsWithResults);
        });
      }
      else
      {
        //lets the user know that they cannot download anything
        var message = "Your selected models do not have simulation results to download."

        //specifies that the message is lower and has an Okay button
        informUser(message, "lower", true);
      }
    }
    else
    {
      var message = downloadConfirmation(countModels, "model");

      //if the user clicks "yes," downloads all selected models
      doConfirm(message, function yes() {
        downloadAllModels(selectedModels);
      });
    }
  }
});

function difference(countModels, countResults, warningHTML)
{
  //calculates how many models do not have results
  var difference = countModels - countResults;

  //grammar with plural
  //informs user of simulation results that they cannot havwe
  if(difference == 1)
  {
    var warning = "One model does not have simulation results to download.";

    warningHTML.classList.add("newParagraph");
    warningHTML.textContent = warning;
  }
  else if(difference != 0)
  {
    var warning = difference + " models do not have simulation results to download.";

    warningHTML.classList.add("newParagraph");
    warningHTML.textContent = warning;
  }
}

function downloadConfirmation(count, type)
{
  //download confirmation
  var message = "Are you sure you want to download ";

  if(modeIsResults)
  {
    message += getSumOfSizes(modelsWithResults) + ", ";
  }
  else
  {
    message += getSumOfSizes(selectedModels) + ", ";
  }

  //grammar with plural
  if(count == 1)
  {
    message += "one " + type + "?";
  }
  else if(count != 0)
  {
    message += count + " " + type + "s?";
  }

  return message; 
}

//returns sum of sizes of the arrays selected in the boolArray
function getSumOfSizes(boolArray)
{
  var urlStart = "svprojects/"
  if(modeIsResults)
  {
    urlStart += "results/"
  }
  else
  {
    downloadType = "zip";
  }

  //array with model names
  var names = []

  for(var i = 0; i < boolArray.length; i++)
  {
    if(boolArray[i])
    {
      names.push(preservedOrderData[i]["Name"])
    }
  }
  
  var count = 0;

  for(var i = 0 ; i < names.length; i++)
  {
    //temporary
    names[i] = "0082_0001"
    key = names[i] + "." + downloadType
    var url = urlStart + key;

    //updates dictionary "sizes" with size of file if the file has not already been added
    if(checkFileExist(url) && !(key in sizes))
    {
      // make sync
      getFileSize(url, key);
    }

    count += parseInt(sizes[key]);
  }

  return count;
}

//returns file size given a URL
function getFileSize(url, modelName)
{
  var fileSize = '';
  var http = new XMLHttpRequest();
  http.open('HEAD', url, false);
  http.onreadystatechange = function() {
    if (this.readyState == this.DONE) {
      if (this.status === 200) {
        fileSize = this.getResponseHeader('content-length');

        //saves size in dictionary sizes
        sizes[modelName] = fileSize;
      }
    }
  };
  http.send(); // it will submit request and jump to the next line immediately, without even waiting for request result b/c we used ASYNC XHR call
}

function dropDownMenu(putDropDownHere)
{
  //labels the drop down menu
  var title = document.createElement("div");
  title.textContent = "Choose type: "
  putDropDownHere.appendChild(title)

  //creates the select box
  var select = document.createElement("select");
  select.setAttribute("id", "chooseType");
  select.setAttribute("class", "newParagraph");

  //these values must be exactly the folder type
  //i.e. "vtp", "vtu"
  var options = ["vtp", "vtu"];

  //reset type to default of select
  downloadType = options[0]

  for(var i = 0; i < options.length; i++)
  {
    //create options under select
    var option = document.createElement("option");
    option.setAttribute("value", options[i]);

    //specify what the options are
    if(options[i] == "vtp")
    {
      option.textContent = "Surface Model (.vtp)";
    }
    else if(options[i] == "vtu")
    {
      option.textContent = "Volume Model (.vtu)";
    }
    select.appendChild(option);
  }

  putDropDownHere.appendChild(select);
}

//listener for change in drop down menu
$("#putDropDownHere").click(function () {
  downloadType = document.getElementById("chooseType").value;
  var boolArray = selectedModelsWithResults();
  console.log(getSumOfSizes(boolArray));
});

//deals with downloading multiple models
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
      var fileUrl = 'svprojects/results/' + modelToDownloadName + "." + downloadType;
      console.log(fileUrl)
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

// help button listener
$("#help").click(function () {
  window.open("documentation.html");
});

// //closes video
// $('#vidOverlay').click(function() {
//   closeVideo();
// });

// //shows video with overlay
// function viewVideo(src)
// {
//   //embed video
//   if(!smallScreen)
//   {
//     //show overlay
//     document.getElementById("vidOverlay").style.display = "block";
//     isOverlayOn = true;
  
//     var videoHolder = document.getElementById("holdsYTVideo");
//     videoHolder.setAttribute("style", "height:auto");

//     var video = document.getElementById("video");
//     video.setAttribute("src", src);
  
//     //turns off scroll and sets height to auto
//     $('.html').css({"height": "auto", "overflow-y": "hidden", "padding-right": "7px"})
//     $('.body').css({"height": "auto", "overflow-y": "hidden", "padding-right": "7px"})

//     //sets listener for scroll
//     document.querySelector('.body').addEventListener('scroll', preventScroll, {passive: false});
//     document.body.style.position = '';

//     //saves where the user was before overlay turned on
//     var prevBodyY = window.scrollY
//     document.body.style.top = `-${prevBodyY}px`
//   }
//   else
//   {
//     //opens video link in another window if smallScreen
//     window.open(src);
//   }
// }

// //closes video and overlay
// function closeVideo()
// {
//   //updates variables
//   document.getElementById("vidOverlay").style.display = "none";
//   isSafeSelected = false;
//   isOverlayOn = false;

//   var videoHolder = document.getElementById("holdsYTVideo");
//   videoHolder.setAttribute("style", "height: 0px");

//   var video = document.getElementById("video");
//   video.removeAttribute("src");

//   //resets html, body, modalDialog
//   $('.html').css({"overflow-y":"auto", "height": "auto", "padding-right": "0px"})
//   $('.body').css({"overflow-y":"auto", "height": "auto", "padding-right": "0px"})

//   //resets scrolling
//   const scrollY = document.body.style.top;
//   document.body.style.position = '';
//   document.body.style.top = '';
//   window.scrollTo(0, parseInt(scrollY || '0') * -1);
//   document.querySelector('.body').removeEventListener('scroll', preventScroll);
// }

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