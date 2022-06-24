var data;
var filteredData;
var preservedOrderData = [];
var displayedData;
var viewingModel = ''
var curIndex = 0;
var smallScreen = false
var lastFapplied = 0;
var lastFdata = [];
var lastSelectedData = [];
var selectedModels = [];
var viewingSelectedModels = false;
var countBucket = 0;
var wantsToSelectAllInFiltered = false;
var wantsToSelectAllInBucket = false;
var isOverlayOn = false;
var isSafeSelected = false;


//returns the keys of *all* the categories
function getAllCategories()
{
  var allCategories = []

  for (const [key, value] of Object.entries(data[0])) {
    allCategories.push(key);
  }

  return allCategories;
}

function getDetailsTitles()
{
  var allCategories = getAllCategories();
  var mustContainTitles = getMustContainFilterTitles()
  var output = []

  for(var i = 0; i < allCategories.length; i++)
  {
    if(allCategories[i] != "Name" && allCategories[i] != "Animal" && allCategories[i] != "DOI")
    {
      if(!mustContainTitles.includes(allCategories[i]))
      {
        output.push(allCategories[i]);
      }
    }
  }

  return output;
}

function getBareMinimum()
{
  var output = ["Name", "Species", "Anatomy"]

  return output;
}

//returns the keys of all the categories except "Size" and "Name"
function getFilterTitles()
{
  var allCategories = getAllCategories()
  var onlyFilterTitles = []

  for(var i = 0; i < allCategories.length; i++)
  {
    if(allCategories[i] != "Name" && allCategories[i] != "Animal" && allCategories[i] != "Notes" && allCategories[i] != "Size" && allCategories[i] != "DOI")
    {
      onlyFilterTitles.push(allCategories[i])
    }
  }

  return onlyFilterTitles;
}

//returns the keys of the categories skipping "Name" and ending before the MustContain categories
function getCategoryName()
{
  var allCategories = getAllCategories()
  var onlyTheAttributes = []

  //skips Name
  //ends before start of MustContain filters
  for (var i = 1; i < allCategories.indexOf("Images"); i++)
  {
    if(allCategories[i] != "Animal")
      onlyTheAttributes.push(allCategories[i]);
  }

  return onlyTheAttributes;
}

//returns the keys of the categories starting at "Images" and ending at "Size"
function getMustContainFilterTitles()
{
  var allCategoryNames = getAllCategories()
  var returnCategories = []

  for(var i = allCategoryNames.indexOf("Images"); i <= allCategoryNames.indexOf("Simulations"); i++)
  {
    returnCategories.push(allCategoryNames[i])
  }

  return returnCategories;
}

//returns the actual amount of possibilities of values under key
function namesOfValuesPerKey(categoryName)
{
  var checkboxNameSet = new Set();

  for(var d = 0; d < data.length; d++)
  {
    if(data[d][categoryName].indexOf("_") != -1)
    {
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
  if(value > 1)
  {
    return value + " years"
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

function URLMaker(notes)
{ 
  indexOfStartOfTag = notes.indexOf("\\url");

  indexOfStartOfLink = notes.indexOf("(\"");
  indexOfEndOfLink = notes.indexOf("\",", indexOfStartOfLink);
  url = notes.substring(indexOfStartOfLink + 2, indexOfEndOfLink);

  indexOfStartOfWord = notes.indexOf(" \"", indexOfEndOfLink);
  indexOfEndOfWord = notes.indexOf("\")", indexOfStartOfWord);
  word = notes.substring(indexOfStartOfWord + 2, indexOfEndOfWord);

  pBefore = createpBeforeAndAfter(notes.substring(0, indexOfStartOfTag), true);

  var a = document.createElement("a")
  a.setAttribute("href", url);
  a.setAttribute("target", "_blank");
  a.classList.add("link");
  a.textContent = word;

  if(url.includes(".zip"))
  {
    a.setAttribute("download", "");
  }
  pAfter = createpBeforeAndAfter(notes.substring(indexOfEndOfWord + 2), false);
  
  return [pBefore, a, pAfter];
}

function createpBeforeAndAfter(text, isBefore)
{
  if(text.includes("\\n") && !text.includes("\\url"))
  {
    var p = document.createElement("div");
    p.classList.add("newParagraph");
    
    while(text.includes("\\n"))
    {
      var index = text.indexOf("\\n");
      var pDiv = document.createElement("div");
      pDiv.classList.add("newParagraph");
      
      pDiv.textContent = text.substring(0, index);
      text = text.substring(index + 2);
      
      p.appendChild(pDiv);
    }

    if(isBefore)
    {
      p.classList.add("sameLine");
      var pDiv = document.createElement("span");
    }
    else
    {
      pDiv.classList.add("newParagraph");
      var pDiv = document.createElement("div");
    }
    pDiv.textContent = text;
    p.appendChild(pDiv);
  }
  else
  {
    var p = document.createElement("span");
    p.textContent = text;
  }
  return p;
  
}

function copyText(message) {
  navigator.clipboard.writeText(message);
}

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

function decodeRLE(binary) {
  return binary.replace(/(\d+)([ \w])/g, (_, count, chr) => chr.repeat(count));
};

function encodeRLE(binary) {
  return binary.replace(/([ \w])\1+/g, (group, chr) => group.length + chr );
};

function encodeBTOA(code)
{
  code = btoa(code);

  for(var i = 0; i < code.length; i++)
  {
    if(code.charAt(i) == "=")
    {
      code = replaceCharAt(code, i, "^");
    }
    if(code.charAt(i) == "/")
    {
      code = replaceCharAt(i, "~");
    }
  }

  return code;
}

function encodeATOB(code)
{
  for(var i = 0; i < code.length; i++)
  {
    if(code.charAt(i) == "^")
    {
      code = replaceCharAt(code, i, "=");
    }
    if(code.charAt(i) == "~")
    {
      code = replaceCharAt(code, i, "/");
    }
  }
  
  code = atob(code);

  return code;
}

function replaceCharAt(code, i, char)
{
  var newCode = code.substring(0, i);
  newCode += char
  newCode += code.substring(i + 1);
  return newCode;
}

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