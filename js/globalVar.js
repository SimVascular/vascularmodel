//all global variables to stay organized

//all arrays of datas:
  //data has all the models read in the csv, scrambled
  var data;
  //filteredData has the models that correspond to the filters selected
  var filteredData;
  //hasResultsData is the models that have simulation results
  var hasResultsData;
  //preservedOrderData is data read from the csv but unscrambled
  var preservedOrderData = [];
  //displayedData is the data that is displayed in the view selected models
  var displayedData;
  //selectedModels is an array of booleans that contains which models are selected by the user
  var selectedModels = [];

//other global variables:
  var viewingModel = '';
  var curIndex = 0;
  var smallScreen = false
  var lastFapplied = 0;
  var lastFdata = [];
  var lastSelectedData = [];
  var viewingSelectedModels = false;
  var isOverlayOn = false;
  var isSafeSelected = false;
  var menuBarShowing = false;
  var modeIsResults = false;
  var selectAllIconApplied = false;
  // if nothing is selected, will download vtp files
  var downloadType = "vtp";
  //dictionary with the sizes of all the files
  var sizes = {};

//returns the keys of all the categories except "Results"
function getAllCategories()
{
  var allCategories = []

  for (const [key, value] of Object.entries(data[0])) {
    if(key != "Results")
      allCategories.push(key);
  }
  return allCategories;
}

//returns titles for the share multiple models table
function getBareMinimum()
{
  var output = ["Name", "Species", "Anatomy"]

  return output;
}

//returns titles for the share.html table
function getDetailsTitles()
{
  var output = ["Sex", "Age", "Species", "Anatomy", "Disease", "Procedure", "Notes", "Size"]

  return output;
}

//excludes titles that aren't filtered in the filter bar
function getFilterTitles()
{
  var output = ["Age", "Sex", "Species", "Anatomy", "Disease", "Procedure", "Images", "Paths", "Segmentations", "Models", "Meshes", "Simulations"]

  return output;
}

//returns the different categories someone can filter through
function getCategoryName()
{
  var output = ["Sex", "Age", "Species", "Anatomy", "Disease", "Procedure"];

  return output;
}

//returns the titles under ProjectMustContain
function getMustContainFilterTitles()
{
  var output = ["Images", "Paths", "Segmentations", "Models", "Meshes", "Simulations"];
  
  return output;
}

//returns all possible options under each category
function namesOfValuesPerKey(categoryName)
{
  var checkboxNameSet = new Set();

  //does not add element if "-"
  for(var d = 0; d < data.length; d++)
  {
    if(data[d][categoryName].indexOf("_") != -1)
    {
      //if multiple categories to add separated by "_", different code
      var toAdd = checkboxNameInArrayForm(data[d][categoryName]);
      for(var a = 0; a < toAdd.length; a++)
      {
        if (toAdd[a] != "-")
          checkboxNameSet.add(toAdd[a]);
      }
    }
    else
    {
      if (data[d][categoryName] != "-")
        checkboxNameSet.add(data[d][categoryName]);
    }
  }

  categoryName = Array.from(checkboxNameSet);
  categoryName.sort();

  return categoryName;
}

//returns an array taking in a string
//delimiter = "_"
function checkboxNameInArrayForm(checkboxNameArr)
{
  var array = []
  var indexOfSpace = checkboxNameArr.indexOf("_");

  while(indexOfSpace != -1)
  {
    array.push(checkboxNameArr.substring(0, indexOfSpace));
    checkboxNameArr = checkboxNameArr.substring(indexOfSpace + 1);
    indexOfSpace = checkboxNameArr.indexOf("_")
  }

  array.push(checkboxNameArr);

  return array;
}

//grammar for commas and ands
function listFormater(string)
{
  //delimtiter "_" interferes with some names of models
  if(string.indexOf("_") == -1)
  {
    return string;
  }

  var output = ""
  valInCat = checkboxNameInArrayForm(string);

  var numOfDetails = valInCat.length;

  if(numOfDetails == 2)
  {
    output = valInCat[0] + " and " + valInCat[1];
  }
  else
  {
    for(var v = 0; v < numOfDetails - 1; v++)
    {
      output = valInCat[v] + ", ";
    }

    output += "and " + valInCat[numOfDetails - 1];
  }

  return output;
}

function ageCalculator(value)
{
  //calculates age in the most relevant unit
  //rounds to the nearest 100s
  if(value > 1)
  {
    return Math.round(value*100)/100 + " years"
  }
  else
  {
    var months = value * 12;
    var weeks = value * 52;
    var days = value * 365;
    if (months > 1)
    {
      return Math.round(months*100)/100 + " months"
    }
    else if (weeks > 1)
    {
      return Math.round(weeks*100)/100 + " weeks"
    }
    else {
      return Math.round(days*100)/100 + " days"
    }
  }
}

//reads "\url()" format in URL
function URLMaker(notes)
{
  indexOfStartOfTag = notes.indexOf("\\url");

  indexOfStartOfLink = notes.indexOf("(\"");
  indexOfEndOfLink = notes.indexOf("\",", indexOfStartOfLink);
  //extracts URL from notes
  url = notes.substring(indexOfStartOfLink + 2, indexOfEndOfLink);

  indexOfStartOfWord = notes.indexOf(" \"", indexOfEndOfLink);
  indexOfEndOfWord = notes.indexOf("\")", indexOfStartOfWord);
  //extracts word that stands for URL from notes
  word = notes.substring(indexOfStartOfWord + 2, indexOfEndOfWord);

  //creates span/div before URL
  pBefore = createpBeforeAndAfter(notes.substring(0, indexOfStartOfTag), true);

  //creates anchor element with URL
  var a = document.createElement("a")
  a.setAttribute("href", url);
  a.setAttribute("target", "_blank");
  a.classList.add("link");
  a.textContent = word;

  //if contains a .zip, allows for a downlaod
  if(url.includes(".zip"))
  {
    a.setAttribute("download", "");
  }

  //creates span/div after URL
  pAfter = createpBeforeAndAfter(notes.substring(indexOfEndOfWord + 2), false);
  
  //returns elements to be appended after
  return [pBefore, a, pAfter];
}

//creates span/div before/after URL
function createpBeforeAndAfter(text, isBefore)
{
  //\n conflicts with \url reading
  if(text.includes("\\n") && !text.includes("\\url"))
  {
    //returns p as a DIV with new lines in the form of new elements
    p = newLineNoURL(text, isBefore);
  }
  else
  {
    //creates span if not \n or if URL
    var p = document.createElement("span");
    p.textContent = text;
  }

  return p;
}

//works with \n in CSV to add a new line
function newLineNoURL(text, isBefore)
{
  //creates div if \n
  var p = document.createElement("div");
  p.classList.add("newParagraph");
  
  //allows for multiple \n
  while(text.includes("\\n"))
  {
    var index = text.indexOf("\\n");
    var pDiv = document.createElement("div");
    pDiv.classList.add("newParagraph");
    
    //appends textContent between each \n
    pDiv.textContent = text.substring(0, index);
    text = text.substring(index + 2);
    
    p.appendChild(pDiv);
  }

  //checks whether element is pBefore or pAfter
  //doesn't want to make a line break if there is a URL later
  if(isBefore)
  {
    //if before, creates a span so that there is no line break before the URL
    p.classList.add("sameLine");
    p.classList.remove("newParagraph");
    var pDiv = document.createElement("span");
  }
  else
  {
    //creates div to have a line break
    pDiv.classList.add("newParagraph");
    var pDiv = document.createElement("div");
  }

  //appends last element to div
  pDiv.textContent = text;
  p.appendChild(pDiv);

  return p;
}

//function to copy the shareable links
function copyText(message) {
  navigator.clipboard.writeText(message);
}

//converts boolean array to an array with Y and N
function boolToYN(array)
{
  binary = "";
  for(var i = 0; i < array.length; i++)
  {
    if(array[i])
    {
      binary += "Y"
    }
    else
    {
      binary += "N"
    }
  }
  return binary;
}

//accounts for when the code is invalid
//decodes RLE to Y and N string
function decodeRLE(binary) {
  if(binary == "invalid code")
  {
    return "invalid code";
  }

  return binary.replace(/(\d+)([ \w])/g, (_, count, chr) => chr.repeat(count));
};

//encodes Y and N to RLE
function encodeRLE(binary) {
  return binary.replace(/([ \w])\1+/g, (group, chr) => group.length + chr );
};

//takes in RLE, gives out base64 conversion
function encodeBTOA(code)
{
  code = btoa(code);

  //accounts for reserved characters URL
  for(var i = 0; i < code.length; i++)
  {
    if(code.charAt(i) == "=")
    {
      code = replaceCharAt(code, i, "_");
    }
    if(code.charAt(i) == "/")
    {
      code = replaceCharAt(i, "-");
    }
  }

  return code;
}

//takes in base64 and returns RLE
function encodeATOB(code)
{
  //un-does conversions for URL
  for(var i = 0; i < code.length; i++)
  {
    if(code.charAt(i) == "_")
    {
      code = replaceCharAt(code, i, "=");
    }
    if(code.charAt(i) == "-")
    {
      code = replaceCharAt(code, i, "/");
    }
  }
  
  //checks if valid code
  if(!isBase64(code))
  {
    return "invalid code";
  }

  code = atob(code);
  
  return code;
}

//function to check if str is valid base64
function isBase64(str) {
  if (str ==='' || str.trim() ===''){ return false; }
  try {
      return btoa(atob(str)) == str;
  } catch (err) {
      return false;
  }
}

//function to help with character replacements
function replaceCharAt(code, i, char)
{
  var newCode = code.substring(0, i);
  newCode += char
  newCode += code.substring(i + 1);
  return newCode;
}

//creates array of N except for one Y
function makeshiftSelectedModels(preservedOrderData, model)
{
  //creates makeshift selectedmodels array
  var array = new Array(preservedOrderData.length);
  array.fill("N");
  var indexOfModel = preservedOrderData.indexOf(model);
  //selects the right index to make true
  array[indexOfModel] = "Y";
  array = array.toString().replaceAll(',', '')
  return array;
}

//translates string with spaces to an array
function valueToSearchInArrayForm(valueToSearch)
{
  var array = []
  var indexOfSpace = valueToSearch.indexOf(" ");

  while(indexOfSpace != -1)
  {
    array.push(valueToSearch.substring(0, indexOfSpace));
    valueToSearch = valueToSearch.substring(indexOfSpace + 1);
    indexOfSpace = valueToSearch.indexOf(" ")
  }

  array.push(valueToSearch);

  return array;
}

//returns an array of booleans of the selected models that has results
function selectedModelsWithResults()
{
  var withResults = [];

  for(var i = 0; i < selectedModels.length; i++)
  {
    //if is selected and has results
    if(selectedModels[i] && preservedOrderData[i]["Results"] == "1")
    {
      withResults[i] = true;
    }
    else
    {
      withResults[i] = false;
    }
  }

  return withResults;
}

//updates the select-all icon
//updates global variable selectAllIconApplied and the class the element select-all has
function isSelectAllApplied(bool)
{
  if(bool)
  {
    selectAllIconApplied = true;
    document.getElementById("select-all").classList.add("applied");
  }
  else
  {
    selectAllIconApplied = false;
    document.getElementById("select-all").classList.remove("applied");
  }
}

//lets us confirm actions with users
function doConfirm(msg, yesFn, noFn) {
  var confirmBox = $("#confirmBox");
  confirmBox.find(".message").text(msg);

  //hides confirmation after button is clicked
  confirmBox.find(".yes,.no").unbind().click(function () {
      confirmBox.hide();
  });

  //deals with which function to call depending on user input
  confirmBox.find(".yes").click(yesFn);
  confirmBox.find(".no").click(noFn);
  confirmBox.show();
}

//informs user of a message
function informUser(msg, string = "", hasOk = false) {
  //gets element informUser
  var informUser = $("#informUser");

  //message is equal to msg passed in parameter
  informUser.find(".message").text(msg);

  informUser.show();

  //reveals the box with opacity
  var div = document.getElementById("informUser");
  div.style.opacity = 1;

  //changes position of alert for clarity
  if(string == "lower")
  {
    div.setAttribute("style", "top: 300px");
  }
  else
  {
    div.setAttribute("style", "top: 30px")
  }

  //clears where the Okay button goes
  var goesHere = document.getElementById("okayGoesHere");
  goesHere.innerHTML = "";

  if(hasOk)
  {
    //if has an okay button, creates it
    var span = document.createElement("span");
    span.classList.add("button");
    span.classList.add("yes");
    span.textContent = "Okay";
    goesHere.appendChild(span);

    //hides informUser box after button is clicked
    informUser.find(".yes").unbind().click(function () {
      informUser.hide();
    });
  }
  else
  {
    //fades after 1.5 seconds if doesn't have an Okay button
    setTimeout(() => {
      informUser.hide();
    }, 1500);
  }
}

//checks if a file exists given url
function checkFileExist(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('HEAD', url, false);
  xhr.send();
   
  if (xhr.status == "404") {
      return false;
  } else {
      return true;
  }
}

function craftURL(modelName)
{
  if(modeIsResults)
  {
    var url = "svresults/"
  }
  else
  {
    var url = "svprojects/"
    downloadType = "zip";
  }

  url += modelName + "." + downloadType;

  return url;
}

//deals with units for size
function sizeConverter(size)
{
  size = parseInt(size) / 1000000;

  size = size.toFixed(2) + ' MB (' + (size/1000).toFixed(2) + ' GB).'

  return size;
}

//returns sum of sizes of the arrays selected in the boolArray
function getSumOfSizes(boolArray)
{
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
    count += getSizeIndiv(names[i]);
  }

  //count is size in bytes
  count = sizeConverter(count)

  return count;
}

function getSizeIndiv(modelName)
{
  var key = modelName + "." + downloadType;

  var url = craftURL(modelName);

  //updates dictionary "sizes" with size of file if the file has not already been added
  if(checkFileExist(url) && !(key in sizes))
  {
    getFileSize(url, key);
  }

  return parseInt(sizes[key]);
}

//returns file size given a URL
function getFileSize(url, key)
{
  var fileSize = '';
  var http = new XMLHttpRequest();
  http.open('HEAD', url, false);

  http.onreadystatechange = function() {
    if (this.readyState == this.DONE) {
      if (this.status === 200) {
        fileSize = this.getResponseHeader('content-length');

        //saves size in dictionary sizes
        sizes[key] = fileSize;
      }
    }
  };

  http.send();
}

function downloadConfirmation(count, type)
{
  var sizeWarning = document.getElementById("downloadSize");
  sizeWarning.textContent = "Size: ";

  if(modeIsResults)
  {
    sizeWarning.textContent += getSumOfSizes(selectedModelsWithResults());
  }
  else
  {
    sizeWarning.textContent += getSumOfSizes(selectedModels);
  }

  //download confirmation
  var message = "Are you sure you want to download ";

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

function dropDown(putDropDownHere, allChoices)
{
  //labels the drop down menu
  var title = document.createElement("div");
  title.textContent = "Choose file type: ";
  putDropDownHere.appendChild(title)

  //creates the select box
  var select = document.createElement("select");
  select.setAttribute("id", "chooseType");
  select.setAttribute("class", "spaceBelow");

  //these values must be exactly the folder type
  //i.e. "vtp", "vtu"
  var options = []
  if(allChoices)
  {
    options.push("zip");
  }
  options.push("vtp");
  options.push("vtu");

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
    else if (options[i] == "zip")
    {
      option.textContent = "Project (.zip)";
    }
    select.appendChild(option);
  }

  putDropDownHere.appendChild(select);
}