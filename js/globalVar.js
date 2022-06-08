var data;
var filteredData;
var selectedModel = ''
var curIndex = 0;
var smallScreen = false
var lastFapplied = 0;
var lastFdata = [];

function getAllCategories()
{
  var allCategories = []

  for (const [key, value] of Object.entries(data[0])) {
    allCategories.push(key);
  }

  return allCategories;
}

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

function getCheckboxName()
{
  var allCategories = []
  var notDropDownNames = []

  for (const [key, value] of Object.entries(data[0])) {
    allCategories.push(key);
  }

  for (var i = 0; i < allCategories.length; i++)
  {
    if (getNTimesPerCategory(allCategories[i]) != 2 && allCategories[i] != "Name" && allCategories[i] != "Size")
    {
      notDropDownNames.push(allCategories[i]);
    }
  }

  return notDropDownNames;
}
