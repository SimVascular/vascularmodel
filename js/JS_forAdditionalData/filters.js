/*----------------------------

JavaScript to Apply Filters

----------------------------*/

function applyFilters()
{
  //resets filterApplied, curIndex, filteredData
  var filterApplied = false
  curIndex = 0;
  filteredData = data;

  //filters for search bar
  var filterOutput = searchBarFilter(filteredData);
  filteredData = filterOutput[0];
  filterApplied = filterApplied || filterOutput[1];

  //updates global variable lastFapplied
  lastFapplied = filterApplied;

  //resets page
  removeContent();
  scrollToTop();
  //populates with calculated data 
  populate(filteredData);

  //works with error message
  if (filteredData.length == 0) {
    errorMessage(true, "filter");
  }
  else {
    errorMessage(false, "filter")
  }

  //if filter is applied, no longer viewing selected models
  viewingSelectedModels = false;

  //updates counters --> displays filtered models counter
  updateCounters(filterApplied, filteredData);
}


/*----------------------------

JavaScript for Filter Bar:
  The Search Bar

----------------------------*/

function searchBarFilter(partialData)
{
  //checks for input in search bar
  var valueToSearch = document.getElementById('search-field').value.toLowerCase()

  //if no input, returns array
  if (valueToSearch == '')
  {
    return [partialData, false]
  }
  else
  {
    //if valueToSearch contains a space, multiple entries to search
    if(valueToSearch.indexOf(" ") != -1)
    {
      var output = searchBarFilterMultipleEntries(partialData, valueToSearch)
    }
    else
    {
      //search for that entry
      var output = searchBarFilterOneEntry(partialData, valueToSearch);
    }

    //output[0] is an array of booleans of partialData.length
    var filter = output[0];

    var filteredData = []
      
    for(var i = 0; i < partialData.length; i++)
    {
      if(filter[i])
      {
        //if saved as true, added to filteredData
        filteredData.push(partialData[i]);
      }
    }
    
    //output[1] is whether or not the filter was applied
    return [filteredData, output[1]];
  }
}

//valueEntered is a single value
function searchBarFilterOneEntry(partialData, valueEntered)
{
  //filter is a boolean array that records with "true" which models will be selected
  //its index corresponds to the partialData index
  var filter = new Array(partialData.length);
  filter.fill(false);
  
  //filtering part
  for (var i = 0; i < partialData.length; i++) {

    //these are the categories the search bar filters through
    //it can be updated in the globalVar.js file
    var categories = ["Name","Notes","Citation"]

    for(var c = 0; c < categories.length; c++)
    {
      var modelSubCategory = partialData[i][categories[c]].toLowerCase();

    //for example selects the valueEntered is "coron" and the model is "coronary"
    if (modelSubCategory.includes(valueEntered))
    {
        filter[i] = true;

        //once the model is selected as true, goes on to next model
        break;
    }
    }
  }

  //returns array with booleans of which to keep
  return [filter, true];
}

//allows user to search for multiple entries
function searchBarFilterMultipleEntries(partialData, valueToSearch)
{
  //translates string with " " into an array
  var valuesToSearch = valueToSearchInArrayForm(valueToSearch);
  for(var v = 0; v < valuesToSearch.length; v++)
  {
    //sends each value individually to be searched
    var output = searchBarFilterOneEntry(partialData, valuesToSearch[v])

    //records the boolean filter array from the oneEntry function
    tempFilter = output[0];

    //if first iteration
    if (v == 0)
    {
      //sets filter with tempFilter
      filter = tempFilter;
    }
    else
    {
      for(var f = 0; f < filter.length; f++)
      {
        //takes intersection
        //ex: "female coronary" will show up models that are both female and coronary
        filter[f] = tempFilter[f] && filter[f];
      }
    }
  }

  //returns array of booleans of which to keep
  return [filter, true];
}