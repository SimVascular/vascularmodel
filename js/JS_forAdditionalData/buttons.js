  //clears all filters in filter bar
  $("#clearAllButton").click(function() {
      clearAllFilters();
  });
  
  function clearAllFilters(){
    //set search bar to no value
    document.getElementById('search-field').value = "";
  
    //resets filters
    applyFilters();
  }
  
  //downloading model in modalText
  $('.download-button-modal').click(function() {
    clearDoConfirm();
  
    var message = "Are you sure you want to download " + viewingModel["Name"] + "?";
  
    //updates size with individual model
    var sizeWarning = document.getElementById("downloadSize");
    sizeWarning.textContent = "Size: " + getSizeIndiv(viewingModel)[1];
  
    downloadFunction = function download() {downloadModel(viewingModel["Name"])};
    doConfirm(message, "Download", downloadFunction);
  });
  
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
  
  //PDF button inside modalText
  $('.pdf-button-modal').click(function() {
    //creates anchor tag to download
    var a = document.createElement("a");
    a.href = "https://www.vascularmodel.com/vmr-pdfs/" + viewingModel['Name'] + ".pdf";
    // a.setAttribute("download", viewingModel['Name']);
    a.setAttribute("target", "_blank");
    //simulates click
    a.click();
  });
  
  //PDF button inside modalText
  $('.download-button-additionaldata').click(function() {
    //creates anchor tag to download
    var a = document.createElement("a");
    a.href = "https://www.vascularmodel.com/additionaldata/" + viewingModel['Name'] + ".zip";
    // a.setAttribute("download", viewingModel['Name']);
    a.setAttribute("target", "_blank");
    //simulates click
    a.click();
  });
  
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