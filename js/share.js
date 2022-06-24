$(document).ready(function($){
    $.ajax({
      type: "GET",
      url: "dataset/dataset.csv",
      dataType: "text",
      async: false,
      success: function(fdata) {
        data = $.csv.toObjects(fdata);
        preservedOrderData = JSON.parse(JSON.stringify(data));
        // we shuffle array to make it always different
        data.sort(() => (Math.random() > .5) ? 1 : -1);
      }
    });

    getVariable();
});

var models = []
var model;

function getVariable()
{
    const queryString = window.location.search;
    //skips ? and starts at what is after the ?
    var codedName = queryString.substring(1);

    var encodedNames = decodeRLE(atob(codedName));
    var found = false;

    for(var i = 0; i < encodedNames.length; i++)
    {
        if(encodedNames[i] == "Y")
        {
            models.push(preservedOrderData[i]);
            found = true;
        }
    }

    if(!found)
    {
        displayErrorMessage(1);
    }
    else if (models.length == 1)
    {
        displayErrorMessage(2);
        model = models[0];
        displayModel(model);
    }
    else{
        displayErrorMessage(3);
        displayTableModels(models);
    }
}

function displayErrorMessage(num) {
    var errorMsg = document.getElementById("errorBlock");
    errorMsg.textContent = "It looks like there are no models to exhibit!";
    
    var whenModelSelected = document.getElementById('whenModelSelected');
    var whenModelsSelected = document.getElementById("whenModelsSelected");

    if(num == 1)
    {
        showDiv(errorMsg);
        hideDiv(whenModelSelected);
        hideDiv(whenModelsSelected);
    }
    else if (num == 2)
    {
        hideDiv(errorMsg);
        showDiv(whenModelSelected);
        hideDiv(whenModelsSelected);
    }
    else if (num == 3)
    {
        hideDiv(errorMsg);
        hideDiv(whenModelSelected);
        showDiv(whenModelsSelected);
    }
}

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

function displayModel()
{
    var div = document.getElementById("displayedModel");
    var title = document.createElement("h1");
    title.textContent = "You are viewing " + model["Name"] + ".";

    let img = document.createElement("img");
    img.src = 'img/vmr-images/' + model['Name'] + '.png'
    img.alt = model['Name'];
    img.classList.add("imgContainer");
    img.classList.add("center");

    var desc = getDescription(model);

    div.appendChild(title);
    div.appendChild(img);
    div.appendChild(desc);
}

function getDescription()
{
    var table = document.createElement("table");
    var categoryName = getDetailsTitles();

    for(var d = 0; d < categoryName.length; d++)
    {
        var newTR = document.createElement("tr");

        var newHeader = document.createElement("th");
        newHeader.textContent = categoryName[d];
        
        var newColumn = document.createElement("td");
        var details = "";
        
        var valInCat = model[categoryName[d]];
        
        if(valInCat == "-")
        {
            details += "N/A";
        }
        
        else{
            if(categoryName[d] == "Age")
            {
                details += ageCalculator(valInCat);
            }
            else if(categoryName[d] == "Species" && valInCat == "Animal")
            {
                details += model["Animal"];
            }
            else if(categoryName[d] == "Notes")
            {
                if(model["Notes"] != '-')
                {
                    notes = model["Notes"];
                    if(notes.includes("\\url"))
                    {                    
                        var output = URLMaker(notes);
                        newColumn.appendChild(output[0]);
                        newColumn.appendChild(output[1]);
                        newColumn.appendChild(output[2]);
                    }
                    else
                    {
                        details = notes;
                    }
                }
            }
            else if(categoryName[d] == "Size")
            {
                var size = parseInt(model['Size']) / 1000000
                details += size.toFixed(2) + ' MB (' + (size/1000).toFixed(2) + ' GB)';
            }
            else
            {
                details += listFormater(valInCat);
            } //end else if more than one detail
        } //end else

        if(details != "")
        {
            newColumn.textContent = details;
        }
    
        newTR.appendChild(newHeader);
        newTR.appendChild(newColumn);
        table.appendChild(newTR)
  }

  return table;
}

$("#downloadModel").click(function () {
    downloadModel();
    console.log("download");
});

function downloadModel()
{
  var modelName = model["Name"];

  var fileUrl = 'svprojects/' + modelName + '.zip';
  var a = document.createElement("a");
  a.href = fileUrl;
  a.setAttribute("download", modelName);
  a.click();

  gtag('event', 'download_' + modelName, {
    'send_to': 'G-YVVR1546XJ',
    'event_category': 'Model download',
    'event_label': 'test',
    'value': '1'
});
}

$("#goToGallery").click(function () {
    goToGallery();
});

function goToGallery() {
    var a = document.createElement("a");
    a.href = "dataset.html";
    a.click();
}

function displayTableModels(models)
{
    var div = document.getElementById("modelsTable");
    var title = document.createElement("h1");
    title.textContent = models.length + " models have been shared with you.";
    
    var table = document.createElement("table");
    var categoryNames = getBareMinimum();

    var titleRow = document.createElement("tr");
    for(var c = 0; c < categoryNames.length; c++)
    {
        var newTitle = document.createElement("th");
        newTitle.textContent = categoryNames[c];

        titleRow.appendChild(newTitle);
    }
    table.appendChild(titleRow);
    
    var modelNames = []
    for(var m = 0; m < models.length; m++)
    {
        var modelRow = document.createElement("tr");
        modelRow.classList.add("modelRow");
        modelRow.setAttribute("id", models[m]["Name"] + "_row");
        modelNames.push(models[m]["Name"])

        for(var c = 0; c < categoryNames.length; c++)
        {   
            var newDetail = document.createElement("td");
            var string = models[m][categoryNames[c]];
            if(categoryNames[c] != "Name")
                string = listFormater(string);
            newDetail.textContent = string;
            
            if(categoryNames[c] == "Species" && string == "Animal")
            {
                newDetail.textContent = models[m]["Animal"];
            }

            modelRow.appendChild(newDetail);
        }

        table.appendChild(modelRow);
    }

    div.appendChild(table);
    createHook(modelNames);
}

function createHook(modelNames)
{
    for(var i = 0; i < modelNames.length; i++)
    {
        var modelName = modelNames[i];
        $('#' + modelName + "_row").click(function() {goToModel(modelName);}); 
    }
}

function goToModel(modelName){
    window.open("share.html?" + modelName)
}