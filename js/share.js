//two global variables of share.js
var models = []
var boolArray = []
var model;

$(document).ready(function($){
    //reads CSV for data
    $.ajax({
      type: "GET",
      url: "dataset/dataset.csv",
      dataType: "text",
      async: false,
      success: function(fdata) {
        data = $.csv.toObjects(fdata);
        preservedOrderData = data;
      }
    });

    //deals with URL input
    getVariable();
});

function getVariable()
{
    //reads what is after the ?
    const queryString = window.location.search;
    //skips ? and starts at what is after the ?
    var codedName = queryString.substring(1);

    //decodes the info from the URL
    var encodedNames = decodeRLE(encodeATOB(codedName));
    var found = false;

    //searches for which are selected
    for(var i = 0; i < encodedNames.length; i++)
    {
        if(encodedNames[i] == "Y")
        {
            models.push(data[i]);
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
        //error message if no model
        displayErrorMessage(1);
    }
    else if (models.length == 1)
    {
        //display for one model
        displayErrorMessage(2);
        model = models[0];
        displayModel(model);
    }
    else{
        // multiple model display
        displayErrorMessage(3);
        displayTableModels();
    }
}

//deals with which page to show
function displayErrorMessage(num) {
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
function displayModel()
{
    //creates "header"
    var div = document.getElementById("displayedModel");
    var title = document.createElement("h1");
    title.textContent = "You are viewing " + model["Name"] + ".";

    //creates image
    let img = document.createElement("img");
    img.src = 'img/vmr-images/' + model['Name'] + '.png'
    img.alt = model['Name'];
    img.classList.add("imgContainer");
    img.classList.add("center");

    //table of information on model
    var desc = getDescription(model);

    //appends all to div
    div.appendChild(title);
    div.appendChild(img);
    div.appendChild(desc);

    //creates inside of icons
    createIcons();
}

//deals with table of information
function getDescription()
{
    var table = document.createElement("table");
    var categoryName = getDetailsTitles();

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
                //deals with units for size
                var size = parseInt(model['Size']) / 1000000
                details += size.toFixed(2) + ' MB (' + (size/1000).toFixed(2) + ' GB)';
            }
            else
            {
                //formats multiple details with "," and "and"
                details += listFormater(valInCat);
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

    var simModels = []

    for(var i = 0; i < models.length; i++)
    {
        if(models[i]["Results"] == "1")
        {
            simModels.push(models[i]);
        }
    }

    if(simModels.length == 0)
    {
        var simButton = document.getElementById("holdsSimButton");
        simButton.innerHTML = "";
    }
    
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
    var array = makeshiftSelectedModels(data, model)

    //opens new window with encoded model
    window.open("share.html?" + encodeBTOA(encodeRLE(array)));
}

//creates the icons
function createIcons()
{
    //fills downloadModel with an icon
    var downloadModel = document.getElementById("downloadModel");
    var icon = document.createElement("i");
    icon.classList.add("fa-solid");
    icon.classList.add("fa-download");
    icon.classList.add("featuresIcons")
    downloadModel.appendChild(icon);

    //fills goToGallery with an icon
    var goToGallery = document.getElementById("goToGallery");
    var icon = document.createElement("i");
    icon.classList.add("fa-solid");
    icon.classList.add("fa-image");
    icon.classList.add("featuresIcons")
    goToGallery.appendChild(icon);
}

//button to download all models in table
$("#download-all-models").click(function () {
    clearDoConfirm();

    //resets variables
    downloadType = "zip";

    //confirmation before downloading
    var message = downloadConfirmation(models.length, "model", boolArray)

    //if the user clicks "yes," downloads all selected models
    doConfirm(message, function yes() {
        downloadAll(models);
    });
});

//button to download all simulation results in table
//if this button exists, there are simulation results to download
$("#download-all-sim").click(function () {
    clearDoConfirm();

    var simModels = []

    for(var i = 0; i < models.length; i++)
    {
        if(models[i]["Results"] == "1")
        {
            simModels.push(models[i]);
        }
    }

    var countModels = models.length;
    var countResults = simModels.length;

    difference(countModels, countResults, warningHTML); 

    var type = "simulation result";
    
    //resets downloadtype
    dropDown(putDropDownHere, "only results");

    var message = downloadConfirmation(countResults, type, boolArray);

    //if the user clicks "yes," downloads all selected models
    doConfirm(message, function yes() {
        downloadAll(simModels);
    });
});

async function downloadAll(array)
{
    listOfNames = []

    for(var i = 0; i < array.length; i++)
    {
        //takes in list of names of all the models to download
        listOfNames.push(array[i]["Name"])
    }

    //sends to download all models
    for(var i = 0; i < listOfNames.length; i++)
    {
        downloadModel(listOfNames[i]);
        await new Promise(r => setTimeout(r, 3));
    }
}

//icon to download model
$("#downloadModel").click(function () {
    clearDoConfirm();

    //resets downloadtype as well
    if(model["Results"] == "1")
    {
        dropDown(putDropDownHere, "all");
    }
    else
    {
        dropDown(putDropDownHere, "no results");
    }
    
    //updates size with individual model
    var sizeWarning = document.getElementById("downloadSize");
    sizeWarning.textContent = "Size: " + getSizeIndiv(model["Name"])[1];

    doConfirm("Are you sure you want to download " + model["Name"] + "?", function yes(){
        downloadModel(model["Name"]);
    })
});

//go to gallery icon
$("#goToGallery").click(function () {
    goToGallery();
});

//brings user to dataset.html
function goToGallery() {
    //creates anchor tag and simulates click
    var a = document.createElement("a");
    a.href = "dataset.html";
    a.click();
}

//listener for change in drop down menu
$("#putDropDownHere").click(function () {
    downloadType = document.getElementById("chooseType").value;
    
    updateSize(boolArray)
});