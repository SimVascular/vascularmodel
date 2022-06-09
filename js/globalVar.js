var data;
var filteredData;
var viewingModel = ''
var curIndex = 0;
var smallScreen = false
var lastFapplied = 0;
var lastFdata = [];
var lastSelectedData = [];
var selectedModels = [];

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
    if(allCategories[i] != "Size" && allCategories[i] != "Name")
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