//global variables of share.js
var models = []
var simModels = []
var boolArray = []
var boolArrayWResults = []
//model is the model being viewed
var model;
//simulationResultsOfModel is an array that has the simulation results of a model
var simulationResultsOfModel= [];
//project is the model when simulation results are viewed
var project = "";
var currentSimulation = "";
var multiModel = false;
var singleModel = false;
var arrayToSearch;
var modelName;
var viewingSimulations = false;
var viewingAdditionalData = false;
var viewingModel = false;

$(document).ready(function($){
    //reads CSV for data
    $.ajax({
      type: "GET",
      url: "dataset/dataset-svprojects.csv",
      dataType: "text",
      async: false,
      success: function(fdata) {
        data = $.csv.toObjects(fdata);
        preservedOrderData = data;
      }
    });

    $.ajax({
        type: "GET",
        url: "dataset/dataset-svresults.csv",
        dataType: "text",
        async: false,
        success: function(fdata) {
          results = $.csv.toObjects(fdata);
        }
    });

    $.ajax({
        type: "GET",
        url: "dataset/additionaldata.csv",
        dataType: "text",
        async: false,
        success: function(fdata) {
            additionalData = $.csv.toObjects(fdata);
        }
    });

    $.ajax({
        type: "GET",
        url: "https://www.vascularmodel.com/dataset/file_sizes.csv",
        dataType: "text",
        async: false,
        success: function(fdata) {
          fileSizes = {};
          fileSizesCsv = $.csv.toObjects(fdata);
          for (var i = 0; i < fileSizesCsv.length; i++) 
          {
            fileSizes[fileSizesCsv[i]['Name']] = fileSizesCsv[i]['Size']
          }
        }
      });

      $.ajax({
        type: "GET",
        url: "https://www.vascularmodel.com/dataset/file_sizes_additionaldata.csv",
        dataType: "text",
        async: false,
        success: function(fdata) {
          addFileSizesCsv = $.csv.toObjects(fdata);
          for (var i = 0; i < addFileSizesCsv.length; i++) 
          {
            fileSizes[addFileSizesCsv[i]['Name']] = addFileSizesCsv[i]['Size']
          }
        }
      });

    //deals with URL input
    getVariable();
});

//reads after ? and sets up page accordingly
function getVariable()
{
    //reads what is after the ?
    const queryString = window.location.search;

    //skips ? and starts at what is after the ?
    var codedName = queryString.substring(1);

    //decodes the info from the URL
    var encodedNames = decodeRLE(encodeATOB(codedName));

    if(encodedNames.length == data.length)
    {
        dataToSearch = data;
        viewingModel = true;

    }
    else if(encodedNames.length == additionalData.length)
    {
        dataToSearch = additionalData;
        viewingAdditionalData = true;
    }
    else if(encodedNames.length == results.length)
    {
        dataToSearch = results;
        viewingSimulations = true;
    }

    var found = false;

    //searches for which are selected
    for(var i = 0; i < encodedNames.length; i++)
    {
        //if Y, records model
        if(encodedNames[i] == "Y")
        {
            models.push(dataToSearch[i]);
            boolArray.push(true);
            found = true;
        }
        else if (encodedNames[i] == "N")
        {
            boolArray.push(false);
        }
    }

    if(!found)
    {
        //error message if no models selected/url not found
        displayRelevant(1);
    }
    else if (models.length == 1)
    {
        //display for one model
        singleModel = true;

        displayRelevant(2);
        model = models[0];

        if(viewingSimulations)
        {
            currentSimulation = model;
            toggleGalleryButton(false);

            var index = data.findIndex(p => p["Name"] == model["Model Name"]);
            project = data[index];

            var model_tab = document.getElementById("model_tab");
            var results_tab = document.getElementById("results_tab");
            
            results_tab.classList.add("selected_tab");
            model_tab.classList.remove("selected_tab");
        }
        else if(viewingModel)
        {
            modelName = model["Name"];
            
            if(model["Results"] == "1")
            {
                project = model;
                toggleGalleryButton(false);
                var index = results.findIndex(p => p["Model Name"] == project["Name"]);
                currentSimulation = results[index];
            }
            else
            {
                toggleGalleryButton(true);
            }
        }

        if(viewingSimulations || model["Results"] == "1")
        {
            for(var r = 0; r < results.length; r++)
            {
                if(project["Name"] == results[r]["Model Name"])
                {
                    simulationResultsOfModel.push(results[r]);
                }
            }
        }

        displayModel();
    }
    else{
        // multiple model display
        multiModel = true;
        
        displayRelevant(3);
        displayTableModels();
    }
}

//deals with which page to show
function displayRelevant(num) {
    var errorMsg = document.getElementById("errorBlock");
    errorMsg.textContent = "It looks like there are no models to exhibit!";
    
    var whenModelSelected = document.getElementById('whenModelSelected');
    var whenModelsSelected = document.getElementById("whenModelsSelected");

    if(num == 1)
    {
        //shows error message
        showDiv(errorMsg);
        hideDiv(whenModelSelected);
        hideDiv(whenModelsSelected);
    }
    else if (num == 2)
    {
        //shows one model
        hideDiv(errorMsg);
        showDiv(whenModelSelected);
        hideDiv(whenModelsSelected);
    }
    else if (num == 3)
    {
        //shows a table of multiple models
        hideDiv(errorMsg);
        hideDiv(whenModelSelected);
        showDiv(whenModelsSelected);
    }
}

//deals with hiding and showing DIVs
function showDiv(div)
{
    div.classList.remove("hide");
    div.classList.add("show");
}

function hideDiv(div)
{
    div.classList.add("hide");
    div.classList.remove("show");
}

//displaying one model
function displayModel(fromDropdown = false)
{
    //creates tabs if simulation result
    if(viewingSimulations || model["Results"] == "1")
    {
        document.getElementById("tab_for_modal").style.display = "block";
    }

    //clears div if it is full
    var div = document.getElementById("placeModelHere");
    div.innerHTML = "";

    //shows or doesn't show dropdown depending on viewingSimulations
    if(fromDropdown)
    {
        toggleDropDown(true);
    }
    else
    {
        toggleDropDown(false);
    }
    

    //toggles header
    if(viewingSimulations && !fromDropdown)
    {
        var output = createDropDownForResults();
        if(output[0])
        {
            div.appendChild(output[1]);
        }
    }
    else if(viewingModel || viewingAdditionalData)
    {
        var title = document.createElement("h1");
        title.textContent = "You are viewing " + model["Name"] + ".";
        div.appendChild(title);
    }

    div.appendChild(setUpDownload());
      

    //displays image for model but not simulation results
    if(viewingModel || viewingAdditionalData)
    {
        div.appendChild(setUpImage());
    }
    
    div.appendChild(setUpHelpIcon());

    //table of information on model
    if(viewingModel)
    {
        var desc = descriptionForModel();
    }
    else if(viewingSimulations)
    {
        var desc = descriptionForResults();
    }
    else if(viewingAdditionalData)
    {
        var desc = descriptionForAdditional();
    }

    div.appendChild(desc);

    hooks()
}

function setUpImage()
{
    //creates image
    let img = document.createElement("img");
    if(viewingAdditionalData)
    {
        img.src = 'https://www.vascularmodel.com/img/additionaldata-images/' + model['Name'] + '.png';
    }
    else if(viewingModel)
    {
        img.src = 'https://www.vascularmodel.com/img/vmr-images/' + model['Name'] + '.png';
    }
    img.alt = model['Name'];
    img.classList.add("imgContainer");
    img.classList.add("center");

    return img;
}

function setUpDownload()
{
    var downloadButton = document.createElement("div");
    downloadButton.setAttribute("id", "downloadModel");

    var h2 = document.createElement("p");
    h2.classList.add("h2_download_button");

    if(viewingSimulations)
    {
        if(simulationResultsOfModel.length > 1)
        {
            downloadButton.classList.add("viewingSim")
        }
        
        h2.textContent = "Download this simulation result";
    }
    else
    {
        h2.textContent = "Download this model"
    }
    
    var icon = document.createElement("i");
    icon.classList.add("fa-solid");
    icon.classList.add("fa-download");
    icon.classList.add("icon_download_button");

    downloadButton.appendChild(h2);
    downloadButton.appendChild(icon);
    
    return downloadButton;
}

function setUpHelpIcon()
{
    var iconPlace = document.createElement("div");
    iconPlace.setAttribute("id", "helpIndiv")
    iconPlace.textContent = "Help";
    
    var icon = document.createElement("i");
    icon.classList.add("fa-regular");
    icon.classList.add("fa-circle-question");
    icon.style.paddingLeft = "5px";

    iconPlace.appendChild(icon)

    return iconPlace;

}

function descriptionForModel() {
    var categoryName = getDetailsTitlesForModel(); 

    var table = document.createElement("table");

    for(var d = 0; d < categoryName.length; d++)
    {
        //new row for each detail
        var newTR = document.createElement("tr");

        //takes in title of detail
        var newHeader = document.createElement("th");
        newHeader.textContent = categoryName[d];
        
        //newColumn is the information on the model
        var newColumn = document.createElement("td");
        var details = "";
        
        var valInCat = model[categoryName[d]];
        
        //if no value is specified in the CSVs
        if(valInCat == "-")
        {
            details += "N/A";
        }
        //deals differently with each information
        else{
            if(categoryName[d] == "Age")
            {
                //gives back most relevant unit
                details += ageCalculator(valInCat);
            }
            else if(categoryName[d] == "Species" && valInCat == "Animal")
            {
                //more specific species
                details += model["Animal"];
            }
            else if(categoryName[d] == "Notes")
            {
                //works with URLs and \n for notes
                if(model["Notes"] != '-')
                {
                    notes = model["Notes"];
                    if(notes.includes("\\url"))
                    {
                        var string = notes;
                        //allows for multiple URLs
                        while(string.includes("\\url"))
                        {
                            var output = URLMaker(string);

                            newColumn.appendChild(output[0]);
                            newColumn.appendChild(output[1]);
                            string = output[2].textContent;
                        }
                    
                        newColumn.appendChild(output[2]);
                    }
                    else
                    {
                        //updates details if not dealing with URLs
                        details += model["Notes"];
                    }
                }
            }
            else if(categoryName[d] == "Size")
            {
                details += getSizeIndiv(model)[1];
            }
            else if(categoryName[d] != "Legacy Name")
            {
                //formats multiple details with "," and "and"
                details += listFormater(valInCat);
            }
            else{
                details += valInCat;
            }
        } //end else

        //details is "" if there was a URL
        if(details != "")
        {
            newColumn.textContent = details;
        }
        
        //appends new detail to table
        newTR.appendChild(newHeader);
        newTR.appendChild(newColumn);
        table.appendChild(newTR)
    }

    return table;
}

function descriptionForResults() {
    var categoryName = getDetailsTitlesForResults(); 
    
    var table = document.createElement("table");

    for(var d = 0; d < categoryName.length; d++)
    {
        //new row for each detail
        var newTR = document.createElement("tr");

        //takes in title of detail
        var newHeader = document.createElement("th");
        newHeader.textContent = categoryName[d];
        
        //newColumn is the information on the model
        var newColumn = document.createElement("td");
        var details = "";
        
        var valInCat = model[categoryName[d]];
        
        //if no value is specified in the CSVs
        if(valInCat == "-")
        {
            details += "N/A";
        }
        //deals differently with each information
        else{
            if(categoryName[d] == "Notes")
            {
                //works with URLs and \n for notes
                if(model["Notes"] != '-')
                {
                    notes = model["Notes"];
                    if(notes.includes("\\url"))
                    {
                        var string = notes;
                        //allows for multiple URLs
                        while(string.includes("\\url"))
                        {
                            var output = URLMaker(string);

                            newColumn.appendChild(output[0]);
                            newColumn.appendChild(output[1]);
                            string = output[2].textContent;
                        }
                    
                        newColumn.appendChild(output[2]);
                    }
                    else
                    {
                        //updates details if not dealing with URLs
                        details += model["Notes"];
                    }
                }
            }
            else if(categoryName[d] == "Size")
            {
                details += getSizeIndiv(model)[1];
            }
            else if(categoryName[d] != "Model Name")
            {
                //formats multiple details with "," and "and"
                details += listFormater(valInCat);
            }
            else{
                details += valInCat;
            }
        } //end else

        //details is "" if there was a URL
        if(details != "")
        {
            newColumn.textContent = details;
        }
        
        //appends new detail to table
        newTR.appendChild(newHeader);
        newTR.appendChild(newColumn);
        table.appendChild(newTR)
    }

    return table;
}

function descriptionForAdditional() {
    var notesHeader = document.createElement("h4");
    notesHeader.textContent = "Here are the associated notes:"
    notesHeader.classList.add("newParagraph");
    notesHeader.style.display = "inline-block";
    notesHeader.style.width = "100%";
    notesHeader.style.float = "left";
    notesHeader.style.position = "relative";

    var notesContent = document.createElement("div");
    notesContent.style.display = "inline-block";
    notesContent.style.float = "left";

    //works with URLs and \n for notes
    if(model["Notes"] != '-')
    {
        notes = model["Notes"];
        if(notes.includes("\\url"))
        {
            var string = notes;
            //allows for multiple URLs
            while(string.includes("\\url"))
            {
                var output = URLMaker(string);

                notesContent.appendChild(output[0]);
                notesContent.appendChild(output[1]);
                string = output[2].textContent;
            }
        
            notesContent.appendChild(output[2]);
        }
        else
        {
            //updates with text content if not dealing with URLs
            notesContent.textContent = model["Notes"];
        }
    }

    var sizeContent = document.createElement("p");
    sizeContent.textContent = "Size: " + getSizeIndiv(model)[1];
    sizeContent.style.display = "inline-block";
    sizeContent.style.float = "left";
    sizeContent.style.paddingTop = "15px";
    sizeContent.style.fontSize = "20px";

    var output = document.createElement("table");
    output.appendChild(notesHeader);
    output.appendChild(notesContent);
    output.appendChild(sizeContent);

    return output;
}

$(".tab_in_modal").click(function () {
    var model_tab = document.getElementById("model_tab");
    var results_tab = document.getElementById("results_tab");
  
    if($(this).attr('id') == "model_tab")
    {
      model_tab.classList.add("selected_tab");
      results_tab.classList.remove("selected_tab");
  
      viewingModel = true;
      viewingSimulations = false;
      viewingAdditionalData = false;
      model = project;
      displayModel();
    }
    else if($(this).attr('id') == "results_tab")
    {
      results_tab.classList.add("selected_tab");
      model_tab.classList.remove("selected_tab");
  
      viewingSimulations = true;
      viewingModel = false;
      viewingAdditionalData = false;

      model = currentSimulation;

      var dropdown = document.getElementById("modal_simResults_dropdown");
      dropdown.innerHTML = "";

      displayModel();
    }
  });

  $("#modal_simResults_dropdown").change(function () {
    var valueOfDropdown = model['Model Name'] + "_"
    valueOfDropdown += document.getElementById("chooseResult").value;
    valueOfDropdown += ".zip"
    var index = results.findIndex(p => p["Full Simulation File Name"] == valueOfDropdown);
    model = results[index];
    currentSimulation = model;
    toggleDropDown(false)
    displayModel(true);
  });

  function toggleDropDown(showDropDown)
  {
    var dropdown = document.getElementById("modal_simResults_dropdown");

    if(showDropDown)
    {
        dropdown.style.display = "block"; 
    }
    else
    {
        dropdown.style.display = "none"; 
    }
  }

  function toggleGalleryButton(showButton)
  {
    var backToGallery = document.getElementById("galleryWhenNoSim")

    if(showButton)
    {
        backToGallery.style.display = "block";
    }
    else
    {
        backToGallery.style.display = "none";
    }
  }

  function createDropDownForResults()
  {
    var dropdown = document.getElementById("modal_simResults_dropdown");
  
    var options = [];
    var optionModel = [];

    for(var i = 0; i < simulationResultsOfModel.length; i++)
    {
        options.push(simulationResultsOfModel[i]["Short Simulation File Name"]);
        optionModel.push(simulationResultsOfModel[i])
    }

    if(options.length == 1)
    {
        toggleDropDown(false);

        var title = document.createElement("h1");
        var presentName = optionModel[0]["Model Image Number"] + "_" + options[0];

        title.textContent = "You are viewing " + presentName + ".";
        return [true, title];
    }
    else
    {
        //access and display dropdown element
        toggleDropDown(true);

        //labels the drop down menu
        var title = document.createElement("div");
        title.classList.add("header_results");
        title.textContent = "You are viewing";
        dropdown.appendChild(title);

        //creates the select box
        var select = document.createElement("select");
        select.setAttribute("id", "chooseResult");
        select.classList.add("select_dropdown");

        for(var i = 0; i < options.length; i++)
        {
            //create options under select
            var option = document.createElement("option");
            
            option.setAttribute("value", options[i]);
            
            var presentName = optionModel[i]["Model Image Number"] + "_" + options[i];
            option.textContent = presentName;
      
            if(options[i] == currentSimulation["Short Simulation File Name"])
            {
                option.selected = true;
            }

            select.appendChild(option);
        }
    
        dropdown.appendChild(select);

        return [false];
    }

  }

//function to display multiple models in a table
function displayTableModels()
{
    //creates "header"
    var div = document.getElementById("tableHeader");
    var h1 = document.createElement("h1");
    h1.classList.add("titleForTableModels");
    h1.textContent = "You are viewing " + models.length + " models.";
    div.appendChild(h1);

    //buttons then in the html
    
    //creates table
    var output = createMultiModelTable();

    //adds table to multiple models page
    var modelsTable = document.getElementById("modelsTable")
    modelsTable.appendChild(output[0]);

    //creates loop for hooks outside of function to avoid bug
    for(var i = 0; i < output[1].length; i++)
    {
        createHook(output[1][i]);
    }
}

//creates table when multiple models are selected
function createMultiModelTable()
{
    var table = document.createElement("table");
    var categoryNames = getBareMinimum();

    //appends all titles in one row
    var titleRow = document.createElement("tr");
    for(var c = 0; c < categoryNames.length; c++)
    {
        var newTitle = document.createElement("th");
        newTitle.textContent = categoryNames[c];

        titleRow.appendChild(newTitle);
    }
    table.appendChild(titleRow);

    var hooks = []
    //cycles through all the models
    for(var m = 0; m < models.length; m++)
    {
        //new row per model
        var modelRow = document.createElement("tr");
        modelRow.classList.add("modelRow");
        //gives ID so the row is click-able
        modelRow.setAttribute("id", models[m]["Name"] + "_row");
        modelRow.setAttribute("title", "View " + models[m]["Name"]);

        for(var c = 0; c < categoryNames.length; c++)
        {  
            var newDetail = document.createElement("td");

            //string is the detail
            var string = models[m][categoryNames[c]];

            //accounts for multiple details
            if(categoryNames[c] != "Name")
                string = listFormater(string);
            
            newDetail.textContent = string;
            
            if(categoryNames[c] == "Species" && string == "Animal")
            {
                //more specific species
                newDetail.textContent = models[m]["Animal"];
            }
            //adds details to row
            modelRow.appendChild(newDetail);
        }

        table.appendChild(modelRow);

        //saves model to later create hook
        hooks.push(models[m]);
    }

    return [table, hooks]
}

//creates hooks for the rows of the models in the table
function createHook(model)
{
    //click on the row, goes to view the individual model
    $('#' + model["Name"] + "_row").click(function() {goToModel(model);});
}

function goToModel(model){
    //creates shareable URL
    var array = makeshiftSelectedModels(dataToSearch, model)

    //opens new window with encoded model
    window.open("share.html?" + encodeBTOA(encodeRLE(array)));
}

//listener to download all models when viewing table
$("#download-all-models").click(function () {
    //clears confirm message
    clearDoConfirm();

    //counts number of selected models
    countModels = models.length;
    // countResults = simModels.length;

    //if nothing to download, download-all button has no function
    if (countModels > 0)
    {
        var message = downloadConfirmation(countModels, "model", boolArray);

        //if the user clicks "yes," downloads all selected models
        doConfirm(message, "Download", function yes() {
            downloadAll();
        });
    }
});

//deals with downloading all models
async function downloadAll()
{
    //sends to download all models
    for(var i = 0; i < models.length; i++)
    {
        downloadModel(models[i]);
        await new Promise(r => setTimeout(r, 3));
    }
}

function hooks(){
    $("#downloadModel").click(function () {
        //clear confirmation message
        clearDoConfirm();

        //updates size with individual model
        var sizeWarning = document.getElementById("downloadSize");

        if(viewingSimulations)
        {
            doConfirm("Are you sure you want to download the simulation result " + model["Model Image Number"] + "_" + model["Short Simulation File Name"] + "?", "Download", function yes(){
                downloadModel(model);
            })

            sizeWarning.textContent = "Size: " + getSizeIndiv(model)[1];
        }
        else
        {
            doConfirm("Are you sure you want to download the model " + model["Name"] + "?", "Download", function yes(){
                downloadModel(model);
            })

            sizeWarning.textContent = "Size: " + getSizeIndiv(model)[1];
        }
    }); 

    //listeners for help buttons
    $("#helpIndiv").click(function () {
        window.open("sharingtutorial.html#Viewing_the_shared_model");
    });

    //go to gallery icon
    $(".goToGallery").click(function () {
        goToGallery();
    });
}

//brings user to dataset.html
function goToGallery() {
    //creates anchor tag and simulates click
    var a = document.createElement("a");
    a.href = "dataset.html";
    a.click();
}

$("#helpTable").click(function () {
    window.open("sharingtutorial.html#Viewing_the_shared_models");
});