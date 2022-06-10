/*----------------------------

JavaScript for Filter Bar

----------------------------*/

function getFilterMenu()
{
  var filterCheckboxes = document.getElementById("filterCheckboxes")
  var categoryName = getFilterTitles();

  var allHooks = []
  var categoryWith1s = []
  
  for(var i = 0; i < categoryName.length; i++)
  {
    if (getNTimesPerCategory(categoryName[i]) == 1)
    {
      categoryWith1s.push(categoryName[i])
    }
    else
    {
      var output = createHeaders(categoryName[i]);
      var div = output[0];
      var hooks = output[1];

      filterCheckboxes.appendChild(div);
      allHooks.push(hooks);
    }
  }

  //create MustContainFilter Section
  output = mustContainHeader(categoryWith1s);
  div = output[0];
  hooks = output[1];

  filterCheckboxes.appendChild(div);
  allHooks.push(hooks);

  for (var i = 0; i < allHooks.length; i++)
  {
    addHooks(allHooks[i]);
  }
}

function createHeaders(categoryName)
{
  if (getNTimesPerCategory(categoryName) == 2)
  {
    var div = createDivWithH4DropDown(categoryName);
    var output = generateDropDownMenu(categoryName);
  }
  else
  {
    //categoryName is the name of the category, e.g., "Age"
    var div = createDivWithH4CheckboxUl(categoryName);
    var output = generateCheckboxUl(categoryName, true);
  }
  
  var insideHeader = output[0]
  var hooks = output[1]

  div.appendChild(insideHeader);

  return [div, hooks];
}

function createDivWithH4CheckboxUl(categoryName)
{
  var div = document.createElement('div');
  div.classList.add("cd-filter-block")

  var h4 = document.createElement('h4');
  h4.classList.add("closed");
  h4.textContent = categoryName;
  
  div.appendChild(h4);

  return div;
}

function createDivWithH4DropDown(categoryName)
{
  var div = document.createElement('div');
  div.classList.add("cd-filter-block")

  var h4 = document.createElement('h4');
  h4.textContent = categoryName;
  
  div.appendChild(h4);

  return div;
}

function addHooks(hooks) {
  for (var i = 0; i < hooks.length; i++) {
    $("#" + hooks[i]).change(function() {applyFilters();});
  }
}

function generateDropDownMenu(categoryName)
{
  var div = document.createElement("div")
  div.classList.add("cd-filter-content");
  div.classList.add("cd-select");
  div.classList.add("cd-filters");
  div.classList.add("list");
  div.setAttribute("style", "display: block");

  var select = document.createElement("select")
  select.classList.add("filter")
  select.setAttribute("id", "select-" + categoryName)
  //select.classList.add("dropbtn");

  var option = document.createElement("option")
  option.value = "none";
  option.textContent = "Select One";
  select.appendChild(option);
  option.classList.add("dropdown-content");

  var hooks = ["select-" + categoryName];

  //separate for Age
  if(categoryName == "Age")
  {
    var checkboxNameArray = ["Adult", "Pediatric"]
  }
  else{
    var checkboxNameSet = new Set();
  
    for(var i = 0; i < data.length; i++)
    {
      checkboxNameSet.add(data[i][categoryName])
    }

    var checkboxNameArray = Array.from(checkboxNameSet);
    checkboxNameArray.sort();
  }

  //checkboxNameArray.length should = 2
  for (var i = 0; i < checkboxNameArray.length; i++) {
      var newOption = generateOptions(checkboxNameArray[i]);
      select.appendChild(newOption);
  }
  
  div.appendChild(select);

  return [div, hooks]
}

function generateOptions(optionName)
{
  var option = document.createElement("option")
  option.value = optionName;

  option.textContent = optionName;
  option.classList.add("dropdown-content");
  return option;
}

function mustContainHeader(categoryName)
{
  var div = createDivWithH4CheckboxUl("Project Must Contain");

  //categoryName is a list with the categoriesWith1
  var output = generateCheckboxUl(categoryName, false);
  var insideHeader = output[0]
  var hooks = output[1]

  div.appendChild(insideHeader);

  return [div, hooks];
}

function generateCheckboxUl(categoryName, needsNameArray)
{
  //needs name if categoryName is not a categoryWith1

  var ul = document.createElement("ul")
  ul.classList.add("cd-filter-content");
  ul.classList.add("cd-filters");
  ul.classList.add("list");

  if(needsNameArray)
  {
    var checkboxNameSet = new Set();
  
    for(var i = 0; i < data.length; i++)
    {
      checkboxNameSet.add(data[i][categoryName])
    }

    categoryName = Array.from(checkboxNameSet);
    categoryName.sort();
  }

  var hooks = []

  for (var i = 0; i < categoryName.length; i++) {
      var newLi = generateCheckboxLi(categoryName[i]);
      ul.appendChild(newLi);
      hooks.push("checkbox-" + categoryName[i])
  }

  return [ul, hooks];
}

function generateCheckboxLi(checkboxName) 
{
  let li = document.createElement('li');
  
  let input = document.createElement('input');
  input.classList.add("filter");
  input.setAttribute("data-filter", checkboxName);
  input.type = "checkbox";
  input.setAttribute("id", "checkbox-" + checkboxName);

  let label = document.createElement('label');
  label.classList.add("checkbox-label");
  label.setAttribute("for", "checkbox-" + checkboxName)
  label.textContent = checkboxName;

  li.appendChild(input);
  li.appendChild(label);

  return li;
}

/*----------------------------

JavaScript to Apply Filters

----------------------------*/

function applyFilters()
{
  var filterApplied = false
  curIndex = 0;
  filteredData = data;
  
  var nTimes = getNTimes();

  var filterOutput;

  var titles = getFilterTitles();

  for(var t = 0; t < titles.length; t++){
    
    if (getNTimesPerCategory(titles[t]) == 2)
    {
      filterOutput = dropDownFilter(titles[t], filteredData)
      filteredData = filterOutput[0]
      filterApplied = filterApplied || filterOutput[1]
    }
    else {
      var whichToKeep = new Array(filteredData.length)
      //if a box is checked in the category
      if (isChecked(titles[t]))
      {    
        whichToKeep.fill(false);

        for(var i = 0; i < nTimes[t]; i++)
        {
          IDs = checkboxNamesPerCategory(titles[t], false)
          keys = checkboxNamesPerCategory(titles[t], true)
          filterOutput = checkboxFilter("checkbox-" + IDs[i], titles[t], keys[i], filteredData, whichToKeep)
          whichToKeep = filterOutput[0]
          filterApplied = filterApplied || filterOutput[1]
        }
      }
      else{
        whichToKeep.fill(true);
      }
      //whichToKeep and filteredData should have the same length
      filteredData = updatedFilteredData(whichToKeep, filteredData);
    }
  }

  filterOutput = searchBarFilter(filteredData);
  filteredData = filterOutput[0]
  filterApplied = filterApplied || filterOutput[1]

  removeContent();
  scrollToTop();
  populate(filteredData);
  updateFilterAppliedCounter(filterApplied, filteredData);
  if (filteredData.length == 0) {
    errorMessage(true, true);
  }
  else {
    errorMessage(false, true)
  }
}

function getNTimes()
{
  var nTimesRepeat = []
  var listOfNames = getAllCategories();

  //skips Name and Size
  for(var i = 1; i < listOfNames.length - 1; i ++)
  {
    nTimesRepeat.push(getNTimesPerCategory(listOfNames[i]));
  }
  
  return nTimesRepeat;
}

function getNTimesPerCategory(categoryName)
{
  var nTimesRepeat = 0;
  var categoryNames = getMustContainFilterTitles();
  
  if (categoryName == "Age")
  {
    nTimesRepeat = 2;
  }
  else if (categoryNames.includes(categoryName))
  {
    nTimesRepeat = 1;
  }
  else
  {
    var noRepeatArray = new Set();
    for(var dI = 0; dI < data.length; dI++)
    {
      noRepeatArray.add(data[dI][categoryName])
    }
    nTimesRepeat = noRepeatArray.size;
  }

  return nTimesRepeat;
}

function isChecked(title)
{
  IDs = checkboxNamesPerCategory(title, false)

  for(var i = 0; i < IDs.length; i++)
  {
    if (document.getElementById("checkbox-" + IDs[i]).checked)
    {
      return true;
    }
  }  
}

function updatedFilteredData(whichToKeep, filteredData)
{
  var updatedFilteredData = []

  for (var i = 0 ; i < filteredData.length; i++)
  {
    if (whichToKeep[i])
    {
      updatedFilteredData.push(filteredData[i]);
    }
  }

  return updatedFilteredData;
}

function checkboxNamesPerCategory(categoryName, isKey)
{
  var checkboxNames = []
  var checkboxNameSet = new Set();
          
  for(var dI = 0; dI < data.length; dI++)
  {
    checkboxNameSet.add(data[dI][categoryName])
  }

  var checkboxNames = Array.from(checkboxNameSet);

  if (!isKey && checkboxNames.includes("1"))
  {
    checkboxNames = [categoryName]
  }
  return checkboxNames;
}

/*----------------------------

JavaScript for Filter Bar:
  The Three Different Types of Filters

----------------------------*/

function dropDownFilter(categoryName, partialData)
{
  var valueToSearch = document.getElementById("select-" + categoryName).value.toLowerCase()

  if(valueToSearch == 'none')
  {
    return [partialData, false];
  }
  else
  {
    var filteredData = []
    var arrayLength = partialData.length;

    for (var i = 0; i < arrayLength; i++) {
      for (const [key, value] of Object.entries(partialData[i])) {
        var category = key.toLowerCase();
        var option = value.toLowerCase();
        
        if (category == categoryName.toLowerCase()) {
          var pushValue = false;

          if (option == valueToSearch) 
          {
            pushValue = true; 
          }

          //different for Age
          if(category.toLowerCase() == "age")
          {
            if (valueToSearch == "pediatric" && parseInt(option) < 18) {
              pushValue = true;
            }
            else if (valueToSearch == "adult" && parseInt(option) >= 18){
              pushValue = true;
            }
          }

          if (pushValue)
            filteredData.push(partialData[i]);
        }
      }
    }

    return [filteredData, true];
  }
}

function checkboxFilter(checkboxID, category, key, partialData, whichToKeep)
{
  
  if (document.getElementById(checkboxID).checked)
  {
    var arrayLength = partialData.length;
  
    for (var i = 0; i < arrayLength; i++) {
      if (partialData[i][category] == key) {
        whichToKeep[i] = true;
      }
    }
  
    return [whichToKeep, true];
  }

  //nothing checked; returns same array as input
  return [whichToKeep, false]
}

function searchBarFilter(partialData)
{
    var valueToSearch = document.getElementById('search-field').value.toLowerCase()
  
    if (valueToSearch == '')
    {
      return [partialData, false]
    }
    else
    {
      //if valueToSearch contains a space
      if(valueToSearch.indexOf(" ") != -1)
      {
        var output = searchBarFilterMultipleEntries(partialData, valueToSearch)
      }
      else
      {
        var output = searchBarFilterOneEntry(partialData, valueToSearch);
      }
      //output[0] is filter w booleans length of partialData.length
      
      var filter = output[0];
      var filteredData = []
      
      for(var i = 0; i < partialData.length; i++)
      {
        if(filter[i])
        {
          filteredData.push(partialData[i]);
        }
      }
      return [filteredData, output[1]];
  }
}

function searchBarFilterOneEntry(partialData, valueToSearch)
{
  //set up variables
  var filter = new Array(partialData.length);
  filter.fill(false);

  var allCategories = getAllCategories();
  var categoriesWith1s = []
  
  for(var i = 0; i < allCategories.length; i++)
  {
    if (getNTimesPerCategory(allCategories[i]) == 1)
    {
      categoriesWith1s.push(allCategories[i])
    }
  }
      
  //filtering part
  for (var i = 0; i < partialData.length; i++) {
    for (const [key, value] of Object.entries(partialData[i])) {
      var category = key.toLowerCase();
      var subCategory = value.toLowerCase();
  
      if (!categoriesWith1s.includes(category))
      {
        if (subCategory.includes(valueToSearch))
        {
          filter[i] = true;
          
          if (valueToSearch == "male" && subCategory == "female")
          {
            filter[i] = false;
          }
        }
        //separate case for age since subCategory is in numbers and search bar input is a string
        else if(category.toLowerCase() == "age")
        {
          if (valueToSearch == "pediatric" && parseInt(subCategory) < 18) {
            filter[i] = true;
          }
          else if (valueToSearch == "adult" && parseInt(subCategory) >= 18){
            filter[i] = true;
          }
        }
      }
      else
      {
        if (category == valueToSearch && subCategory == '1') {
          filter[i] = true;
        }
      }
    }
  }
    
  return [filter, true];
}

function searchBarFilterMultipleEntries(partialData, valueToSearch)
{
  var valuesToSearch = valueToSearchInArrayForm(valueToSearch);
  var filter = []
  
  for(var v = 0; v < valuesToSearch.length; v++)
  {
    var output = searchBarFilterOneEntry(partialData, valuesToSearch[v])
    //imagine output[0] is tempFilter
    tempFilter = output[0];

    if (v == 0)
    {
      filter = tempFilter;
    }
    else
    {
      for(var f = 0; f < filter.length; f++)
      {
        filter[f] = tempFilter[f] && filter[f];
      }
    }
  }
    
  return [filter, true];
}

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

//listener for the search bar
$("#search-field").change(function () {applyFilters();});