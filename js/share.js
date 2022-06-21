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
            var model = data[i];
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

function displayModel(model)
{
    var div = document.getElementById("displayedModel");
    var title = document.createElement("h1");
    title.textContent = "You are viewing model: " + model["Name"] + ".";

    let img = document.createElement("img");
    img.src = 'img/vmr-images/' + model['Name'] + '.png'
    img.alt = model['Name'];
    img.classList.add("imgContainer");

    var desc = getDescription(model);

    div.appendChild(title);
    div.appendChild(img);
    div.appendChild(desc);
}

function getDescription(model)
{
    var ul = document.createElement("ul");
    var categoryName = getCategoryName();

    for(var d = 0; d < categoryName.length; d++)
    {
        var li = document.createElement("li");
        
        var details = "";   
        
        var valInCat = model[categoryName[d]];
        
        if(valInCat == "-")
        {
            details = categoryName[d] + ": N/A";
        }
        
        else{
            if(categoryName[d] == "Age")
            {
                details += categoryName[d] + ": " + ageCalculator(valInCat);
            }
            else if(categoryName[d] == "Species" && valInCat == "Animal")
            {
                details += categoryName[d] + ": " + model["Animal"];
            }
            else
            {
                if(valInCat.indexOf("_") == -1)
                {
                details += categoryName[d] + ": " + valInCat;
                }
                else
                {
                details += categoryName[d] + "s: ";

                details += listFormater(valInCat)
                }
            } //end else if more than one detail
        } //end else

        li.textContent = details;
        ul.appendChild(li)
  }

  return ul;
}
