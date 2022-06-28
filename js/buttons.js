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
  
    applyFilters();
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
  selectedModels[preservedOrderData.indexOf(model)] = false;
  var element = document.getElementById(model['Name'] + "_isSelected");
  if (element)
    element.classList.remove("selected");
}

function selectModel(model)
{
  selectedModels[preservedOrderData.indexOf(model)] = true;
  var element = document.getElementById(model['Name'] + "_isSelected");
  if (element)
    element.classList.add("selected");
}

$('.download-button-modal').click(function() {
    downloadModel(viewingModel["Name"]);
});

$('#proOrRe').click(function() {
    var element = document.getElementById("switch-input");
  
    if(element.checked)
    {
      modeIsResults = true;
    }
    else
    {
      modeIsResults = false;
    }
  
    applyFilters();
});

$('#sharelink-all').click(function() {
    var binary = boolToYN(selectedModels);
    copyText("https://www.vascularmodel.com/share.html?" + encodeBTOA(encodeRLE(binary)));
    informUser("Link copied");
  });
  
  $('.shareableLink-button-modal').click(function() {
    var array = makeshiftSelectedModels(preservedOrderData, viewingModel);
    copyText("https://www.vascularmodel.com/share.html?" + encodeBTOA(encodeRLE(array)));
    informUser("Link copied");
});

$("#download-all").click(function () {
    var count = selectedModels.filter(value => value === true).length;
    var message = "";
    if (count > 0)
    {
      if(count == 1)
      {
        message = "Are you sure you want to download 1 model?"
      }
      else
      {
        message = "Are you sure you want to download " + count + " models?"
      }
      
      doConfirm(message, function yes() {
        downloadAllSelectedModels();
      });
    }
  });
  
  function downloadModel(modelToDownloadName)
  {
    if(modeIsResults)
    {
      var fileUrl = 'results/' + modelToDownloadName + '.zip';
    }
    else
    {
      var fileUrl = 'svprojects/' + modelToDownloadName + '.zip';
    }
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

async function downloadAllSelectedModels(){

    listOfNames = []
  
    for(var i = 0; i < selectedModels.length; i++)
    {
      if(selectedModels[i])
      {
        listOfNames.push(preservedOrderData[i]["Name"])
      }
    }
  
    for(var i = 0; i < listOfNames.length; i++)
    {
      downloadModel(listOfNames[i]);
      await new Promise(r => setTimeout(r, 3));
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

function viewSelected(flipViewingSelectedModels, moveToTop = true) {
    if (flipViewingSelectedModels)
      viewingSelectedModels = !viewingSelectedModels;
  
    if(viewingSelectedModels)
    {
      triggerFilter(false);
  
      displayedData = []
  
      for(var i = 0; i < data.length; i++)
      {
        if(selectedModels[i])
        {
          displayedData.push(preservedOrderData[i])
        }
      }
  
      removeContent();
      if (moveToTop)
        scrollToTop();
      curIndex = 0;
      populate(displayedData);
  
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
  }

$("#view-selected").click(function() {
    viewSelected(true);
});

$("#menu-bar").click(function() {
    menuBarShowing = !menuBarShowing;
    var features = document.getElementById("features");
    var menuBar = document.getElementById("menu-bar");
  
  
    if (menuBarShowing)
    {
      features.classList.add("features-is-visible");
      menuBar.classList.add("features-is-visible");
    }
    else
    {
      features.classList.remove("features-is-visible");
      menuBar.classList.remove("features-is-visible");
    }
});