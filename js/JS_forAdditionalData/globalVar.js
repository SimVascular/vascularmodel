//all global variables to stay organized

//all arrays of datas:
  //data has all the models read in the csv, scrambled
  var data;
  //filteredData has the models that correspond to the filters selected
  var filteredData;
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
  var doneDownloading = false;
  var isOverlayOn = false;
  var isSafeSelected = false;
  var menuBarShowing = false;
  // var modeIsResults = false;
  var selectAllIconApplied = false;
  //default is always "zip"
  var downloadType = "zip";
  //dictionary with the sizes of all the files
  var fileSizes;

  var downloadFunction;

  var countModels;
  var modelsWithResults;
  var countResults;
  var warningHTML = document.getElementById("warning");

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

//returns all possible options under each category
function namesOfValuesPerKey(categoryName, returnSet = false)
{
  var checkboxNameSet = new Set();

  //if the categoryName is a parent, then the options under it are its children
  if(checksIfParent(categoryName))
  {

    //returns an array containing the children of a parent
    var children = getChildrenOfParent(categoryName);
    
    for(var i = 0; i < children.length; i++)
    {
      checkboxNameSet.add(children[i]);
    }
  }
  else
  {
    if(categoryName == "Disease")
    {
      //includes the general disease classifier as potential options for Disease
      checkboxNameSet = namesOfValuesPerKey("General Disease Classifier", true)
    }
    //goes through the data and gets all the possibilities the models offer
    for(var d = 0; d < data.length; d++)
    {
      //if the model has multiple tags separated by an underscore
      if(data[d][categoryName].indexOf("_") != -1)
      {
        //if multiple categories to add separated by "_", different code
        var toAdd = checkboxNameInArrayForm(data[d][categoryName]);
        for(var a = 0; a < toAdd.length; a++)
        {
          //does not add element if "-"
          if (toAdd[a] != "-")
          {
            checkboxNameSet.add(toAdd[a]);
          }
        }
      }
      else
      {
        if (data[d][categoryName] != "-" && data[d][categoryName] != "Healthy" && data[d][categoryName] != "None"){
          checkboxNameSet.add(data[d][categoryName]);
        }
      }
    }
  }
  if(returnSet)
  {
    return checkboxNameSet;
  }

  finalArray = Array.from(checkboxNameSet);
  finalArray.sort();


  //adds category-specific options
  //unshift() places the option at the beginning of the array
  if(categoryName == "Disease")
  {
    finalArray.unshift("Healthy");
  }
  else if (categoryName == "Procedure")
  {
    finalArray.unshift("None");
  }

  return finalArray;
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

  //if contains a .zip, allows for a download
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

// converts Y/N to 1/0
function makeBooleanArray(preservedOrderData, model)
{
  //creates makeshift selectedmodels array
  var array = new Array(preservedOrderData.length);
  array.fill(false);
  var indexOfModel = preservedOrderData.indexOf(model);
  //selects the right index to make true
  array[indexOfModel] = true;
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

//clears the code in the download confirmation box
function clearDoConfirm()
{
  document.getElementById("downloadSize").innerHTML = "";

  warningHTML.innerHTML = "";
  warningHTML.classList.remove("newParagraph");

  document.getElementById("downloadSize").innerHTML = "";
}

//lets us confirm actions with users
function doConfirm(msg, confirmText, downloadFn) {
  //show overlay
  var overlay = document.getElementById("confirmOverlay");
  overlay.style.display = "block";

  //work with scroll
  if(window.location.pathname.includes("/dataset.html"))
  {
    //turns off scroll and sets height to auto
    if (smallScreen) {
      // padding is not necessary on mobile
      $('.html').css({"height": "auto", "overflow-y": "hidden"})
      $('.body').css({"height": "auto", "overflow-y": "hidden"})
    }
    else {
      $('.html').css({"height": "auto", "overflow-y": "hidden", "padding-right": "7px"})
      $('.body').css({"height": "auto", "overflow-y": "hidden", "padding-right": "7px"})
    }

    //sets listener for scroll
    document.querySelector('.body').addEventListener('scroll', preventScroll, {passive: false});
    document.body.style.position = '';

    //saves where the user was before overlay turned on
    var prevBodyY = window.scrollY
    document.body.style.top = `-${prevBodyY}px`;
  }
  //end scroll

  var confirmBox = $("#confirmBox");
  confirmBox.find(".message").text(msg);

  $('#download-confirm-button').text(confirmText)
  bindsButtonConfirmation(".download", downloadFn)
  bindsButtonConfirmation(".no", function no() {
    // make download button visible again if menu is closed
    var downloadButton = document.getElementById("download-confirm-button")
    downloadButton.classList.remove("button-disabled")
  });
  confirmBox.show()
}

function bindsButtonConfirmation(id, fn)
{
  var overlay = document.getElementById("confirmOverlay");
  var confirmBox = $("#confirmBox");
  confirmBox.find(id).unbind().click(function () {
    confirmBox.hide();
    overlay.style.display = "none";

    if(window.location.pathname.includes("/dataset.html"))
    {
      $('.html').css({"overflow-y":"auto", "height": "auto", "padding-right": "0px"})
      $('.body').css({"overflow-y":"auto", "height": "auto", "padding-right": "0px"})

      //resets scrolling
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
      document.querySelector('.body').removeEventListener('scroll', preventScroll);
    }
  });

  confirmBox.find(id).click(fn);
}

//informs user of a message
function informUser(msg, hasOk = false) {
  //gets element informUser
  var informUser = $("#informUser");

  //message is equal to msg passed in parameter
  informUser.find(".message").text(msg);

  informUser.show();

  //reveals the box
  var div = document.getElementById("informUser");
  div.style.display = "block"

  //clears where the Okay button goes
  var goesHere = document.getElementById("okayGoesHere");
  goesHere.innerHTML = "";

  if(hasOk)
  {
    //changes position for clarity
    div.style.top = "300px";

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
    div.style.top = "30px";

    //fades after 1.5 seconds if doesn't have an Okay button
    setTimeout(() => {
      informUser.hide();
    }, 1500);
  }
}

//in globalVar.js for additional data, always crafting url for additional data models
function craftURL(model)
{
    var url = "additionaldata/"
    url += model["Name"] + ".zip";

  return url;
}

function craftDownloadName(modelName)
{
  if(downloadType == "zip")
  {
    return modelName
  }
  else
  {
    return modelName + "_" + downloadType
  }
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
      //come back here
      if(preservedOrderData[i]["Results"] == "1" || downloadType == "zip")
      {
        names.push(preservedOrderData[i]["Name"])
      }
      
    }
  }
  
  var count = 0;

  for(var i = 0 ; i < names.length; i++)
  {
    var size = getSizeIndiv(names[i]);
    // then the fileSize exists (it's not nan)
    if (size[0] == size[0])
    {
      //saves size in bytes
      count += size[0];
    }
  }

  //count is size in bytes
  // count = sizeConverter(count)

  return count;
}

//gets size of individual models given their name
function getSizeIndiv(model)
{
  var url = craftURL(model);

  var size = parseInt(fileSizes[url]);

  //returns bytes and readable version of size
  return [size, sizeConverter(size)];
}

//updates where the size is defined in the confirmbox
function updateSize(boolArray)
{
  var sizeWarning = document.getElementById("downloadSize");
  sizeWarning.textContent = "Size: " + sizeConverter(getSumOfSizes(boolArray));
}

//updates confirmation message
function updateMessage(msg)
{
  var confirmBox = $("#confirmBox");
  confirmBox.find(".message").text(msg);
}

//creates the download confirmation message given the number of models
//also updates the size given which models are selected
function downloadConfirmation(count, type, boolArray)
{
  updateSize(boolArray)
  
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

//calculates warning to tell user which models dont have simulation results
function difference(countModels, countResults, warningHTML)
{
  //calculates how many models do not have results
  var difference = countModels - countResults;

  //grammar with plural
  //informs user of simulation results that they cannot havwe
  if(difference == 1)
  {
    var warning = "One model does not have simulation results to download.";
  }
  else if(difference != 0)
  {
    var warning = difference + " models do not have simulation results to download.";
  }

  warningHTML.classList.add("newParagraph");
  warningHTML.textContent = warning;
}

//calculates warning to tell user which models dont have simulation results
function maxDownloadMessage(downloadGb, maxGb, warningHTML)
{

  var warning = "The total size of the download is " + downloadGb.toFixed(2) + 
                " GB, " + 
                " but we currently support downloads of up to " + maxGb + " GB."

  warningHTML.classList.add("newParagraph");
  warningHTML.textContent = warning;
}

//downloads individual models
function downloadModel(modelName)
  {
    //creates link of what the user wants to download
    var fileUrl = craftURL(modelName);

    //creates anchor tag to download
    var a = document.createElement("a");
    a.href = fileUrl;
    a.setAttribute("download", craftDownloadName(modelName));
    //simulates click
    a.click();
    
    if(downloadType != "zip")
    {
      //sends message to server with user's download
      gtag('event', 'download_results_' + modelName + "." + downloadType, {
        'send_to': 'G-YVVR1546XJ',
        'event_category': 'Model download',
        'event_label': 'test',
        'value': '1'
      });
    }
    else
    {
      //sends message to server with user's download
      gtag('event', 'download_' + modelName, {
        'send_to': 'G-YVVR1546XJ',
        'event_category': 'Model download',
        'event_label': 'test',
        'value': '1'
      });
    }
}