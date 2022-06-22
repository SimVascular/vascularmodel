$(document).ready(function($){
    $.ajax({
      type: "GET",
      url: "dataset/dataset.csv",
      dataType: "text",
      async: false,
      success: function(fdata) {
        data = $.csv.toObjects(fdata);
        // we shuffle array to make it always different
        data.sort(() => (Math.random() > .5) ? 1 : -1);
      }
    });

    getVariable();
});

function getVariable()
{
    const queryString = window.location.search;
    var modelName = queryString.substring(1);
    var found;
    for(var i = 0; i < data.length; i++)
    {
        if(data[i]["Name"] == modelName)
        {
            model = data[i];
            console.log(model);
            found = true;
        }
    }

    if(!found)
    {
        displayErrorMessage(true);
    }
    else
    {
        displayErrorMessage(false);
        displayModel(model);
    }
}

function displayErrorMessage(isOn) {
    var errorMsg = document.getElementById('error-msg');
    errorMsg.textContent = "It looks like there are no models to exhibit!";
    var displayingModel = document.getElementById('displayedModel');

    if(isOn)
    {
        errorMsg.style.opacity = 1;
        displayingModel.style.opacity = 0;
    }
    else
    {
        errorMsg.style.opacity = 0;
        displayingModel.style.opacity = 1;
    }
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
        var details = "" 
        
        var valInCat = model[categoryName[d]];
        
        if(valInCat == "-")
        {
            details = "N/A";
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
            else
            {
                if(valInCat.indexOf("_") == -1)
                {
                    details += valInCat;
                }
                else
                {
                    details += listFormater(valInCat)
                }
            } //end else if more than one detail
        } //end else

        newColumn.textContent = details;

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