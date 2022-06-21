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

    var desc = document.createElement("div");

    div.appendChild(title);
    div.appendChild(img);
    div.appendChild(desc);
}