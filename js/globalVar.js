var data;
var filteredData;
var viewingModel = ''
var curIndex = 0;
var smallScreen = false
var lastFapplied = 0;
var lastFdata = [];
var lastSelectedData = [];
var selectedModels = [];
var viewingSelectedModels;
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

  for(var i = allCategoryNames.indexOf("Images"); i < allCategoryNames.indexOf("Size"); i++)
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