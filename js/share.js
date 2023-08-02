//global variables of share.js
var models = []

// a boolean array with which models are selected as true
var boolArray = []

//model is the model being viewed
var model;

//simulationResultsOfModel is an array that has the simulation results of a model
var simulationResultsOfModel= [];

//project saves the model when simulation results are viewed
var project = "";

//saves the simulation the user was viewing if they go to the model tab
var currentSimulation = "";

// variables to determine if the user is viewing multiple models or one model
var multiModel = false;
var singleModel = false;

// determines the array to search through for the models selected
// ex: the array with the models or with the results
var arrayToSearch;

// booleans to save the model/result/additional data the user is viewing
var viewingSimulations = false;
var viewingAdditionalData = false;
var viewingModel = false;

$(document).ready(function($){
    //reads CSV for data
    $.ajax({
      type: "GET",
      url: "https://www.vascularmodel.com/dataset/dataset-svprojects.csv",
      dataType: "text",
      async: false,
      success: function(fdata) {
        data = $.csv.toObjects(fdata);
        preservedOrderData = data;
      }
    });

    $.ajax({
        type: "GET",
        url: "https://www.vascularmodel.com/dataset/dataset-svresults.csv",
        dataType: "text",
        async: false,
        success: function(fdata) {
          results = $.csv.toObjects(fdata);
        }
    });

    $.ajax({
        type: "GET",
        url: "https://www.vascularmodel.com/dataset/additionaldata.csv",
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
          // fileSizes is an array with keys and values
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

    // checks for which type of array was shared using the "A" or "R" label
    if(encodedNames.includes("A"))
    {
        dataToSearch = additionalData;
        viewingAdditionalData = true; 
    }
    else if(encodedNames.includes("R"))
    {
        dataToSearch = results;
        viewingSimulations = true;
    }
    else
    {
        dataToSearch = data;
        viewingModel = true;
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

        // this is the case if the shareable link was of a simulation result
        if(viewingSimulations)
        {
            // sets currentSimulation to the simulation result that was shared
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
            // checks if the model has simulation results to determine whether or not
            // to show the tabs
            if(model["Results"] == "1")
            {
                project = model;
                toggleGalleryButton(false);

                // sets default currentSimulation to the first in the dropdown menu
                var index = results.findIndex(p => p["Model Name"] == project["Name"]);
                currentSimulation = results[index];
            }
            else
            {
                // toggles which gallery button to show depending on whether or not
                // there are tabs
                toggleGalleryButton(true);
            }
        }

        if(viewingSimulations || model["Results"] == "1")
        {
            // if the model has simulation results, it fills the simulationResultsOfModel
            // array with all of those results
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

//toggles which page to show
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

//toggles with hide and show classes to help with showing and hiding divs
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
    

    //toggles header depending on what the user is viewing
    if(viewingSimulations && !fromDropdown)
    {
        // creates new dropdown menu if it hasn't been done before
        // and if the user is viewing simulation results
        var output = createDropDownForResults();

        // output[0] is a boolean that determines whether or not
        // something should be appended to the div
        if(output[0])
        {
            div.appendChild(output[1]);
        }
    }
    else if(viewingModel || viewingAdditionalData)
    {
        // has a regular title if not viewing a simulation result
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

    //table of information on model depending on what the user is viewing
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

    // adds hooks at the end, after the html has been generated
    hooks()
}

// sets up the image path depending on the path
function setUpImage()
{
    //creates image
    let img = document.createElement("img");
    if(viewingModel || viewingAdditionalData)
    {
        img.src = pathToFiles + 'vmr-images/' + model['Name'] + '.png';
    }
    img.alt = model['Name'];
    img.classList.add("imgContainer");
    img.classList.add("center");

    return img;
}

// sets up the download link under the name of what the user is viewing
function setUpDownload()
{
    var downloadButton = document.createElement("div");
    downloadButton.setAttribute("id", "downloadModel");

    var h2 = document.createElement("p");
    h2.classList.add("h2_download_button");

    // different text content depending on what the user is viewing
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
    
    // creates download icon
    var icon = document.createElement("i");
    icon.classList.add("fa-solid");
    icon.classList.add("fa-download");
    icon.classList.add("icon_download_button");

    downloadButton.appendChild(h2);
    downloadButton.appendChild(icon);
    
    return downloadButton;
}

// creates the help icon when viewing an individual model
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

// sets up the table for when the user is viewing one model
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

// sets up the table for when the user is viewing a simulation result
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

// sets up the table for when the user is viewing an additional data
function descriptionForAdditional() {
    // only reads and shows notes for additional data
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

    // shows the size of the additional data file
    var sizeContent = document.createElement("p");
    sizeContent.textContent = "Size: " + getSizeIndiv(model)[1];
    sizeContent.style.display = "inline-block";
    sizeContent.style.float = "left";
    sizeContent.style.paddingTop = "15px";
    sizeContent.style.fontSize = "20px";

    // still creates a table for formatting
    var output = document.createElement("table");
    output.appendChild(notesHeader);
    output.appendChild(notesContent);
    output.appendChild(sizeContent);

    return output;
}

// toggles the tabs between Model and Result
// both have the class "tab_in_modal"
$(".tab_in_modal").click(function () {
    viewingAdditionalData = false;

    var model_tab = document.getElementById("model_tab");
    var results_tab = document.getElementById("results_tab");
  
    // checks which tab was clicked using the id attribute
    if($(this).attr('id') == "model_tab")
    {
        // resets tabs and displays model if model tab selected
        model_tab.classList.add("selected_tab");
        results_tab.classList.remove("selected_tab");
    
        viewingModel = true;
        viewingSimulations = false;
        
        // sets model to what is currently being viewed
        model = project;

        // displayModel() will toggle between the different pages the user can view
        displayModel();
    }
    else if($(this).attr('id') == "results_tab")
    {
        // resets tabs and displays simulation result if results tab selected
        results_tab.classList.add("selected_tab");
        model_tab.classList.remove("selected_tab");
    
        viewingSimulations = true;
        viewingModel = false;

        // sets model to what is currently being viewed
        model = currentSimulation;

        var dropdown = document.getElementById("modal_simResults_dropdown");
        dropdown.innerHTML = "";

        // displayModel() will toggle between the different pages the user can view
        displayModel();
    }
  });

  // listener for the simulation results dropdown menu
  $("#modal_simResults_dropdown").change(function () {
    // recrafts the full simulation result file name from the shortened name of the dropdown
    var valueOfDropdown = model['Model Name'] + "_"
    valueOfDropdown += document.getElementById("chooseResult").value;
    valueOfDropdown += ".zip"

    // sets model to the new selected simulation result
    var index = results.findIndex(p => p["Full Simulation File Name"] == valueOfDropdown);
    model = results[index];
    currentSimulation = model;

    // displays a new page for the selected simulation result
    displayModel(true);
  });

  // shows or does not show dropdown depending on parameter
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

  // if showButton = true, displays the return to gallery button outside the tab bar
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

  // creates dropdown menu for simulation results
  function createDropDownForResults()
  {
    var dropdown = document.getElementById("modal_simResults_dropdown");
  
    // options is the array with only the names
    var options = [];
    // and optionModel is the array with the full results object
    var optionModel = [];

    for(var i = 0; i < simulationResultsOfModel.length; i++)
    {
        options.push(simulationResultsOfModel[i]["Short Simulation File Name"]);
        optionModel.push(simulationResultsOfModel[i])
    }

    // different presentation if only one simulation result and no need for a 
    // dropdown menu
    if(options.length == 1)
    {
        // removes the dropdown menu
        toggleDropDown(false);

        // creates header without a dropdown menu
        var title = document.createElement("h1");
        var presentName = optionModel[0]["Model Image Number"] + "_" + options[0];
        title.textContent = "You are viewing " + presentName + ".";

        // returns true that the div needs to append the title element
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

        // creates html for simulation result options
        for(var i = 0; i < options.length; i++)
        {
            //create options under select
            var option = document.createElement("option");
            
            option.setAttribute("value", options[i]);
            
            // crafts the shorter dropdown menu name
            var presentName = optionModel[i]["Model Image Number"] + "_" + options[i];
            option.textContent = presentName;
      
            // selects the currentSimulation in the dropdown menu
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

// opens a new share page with the individual model selected from the multimodel table
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

// creates hooks for the html that was generated after it was created
function hooks(){
    $("#downloadModel").click(function () {
        //clear confirmation message
        clearDoConfirm();

        //updates size with individual model
        var sizeWarning = document.getElementById("downloadSize");

        // different download confirmation message
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

    //listener for go to gallery icon
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

// listener for help button when viewing multiple models
$("#helpTable").click(function () {
    window.open("sharingtutorial.html#Viewing_the_shared_models");
});
