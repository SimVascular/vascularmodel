/*----------------------------

JavaScript for Filter Bar

----------------------------*/

function getFilterMenu()
{
  var allHooks = []

  var sexSelect = document.getElementById("select-Sex");
  generateDropDownMenu("Sex", sexSelect)
  allHooks.push(["select-Sex"])

  var speciesSelect = document.getElementById("select-Species");
  generateDropDownMenu("Species", speciesSelect)
  allHooks.push(["select-Species"])

  var anatomyUl = document.getElementById("AnatomyUl");
  var hooks = generateCheckboxUl("Anatomy", anatomyUl)
  allHooks.push(hooks)

  var diseaseUl = document.getElementById("DiseaseUl");
  var hooks = generateCheckboxUl("Disease", diseaseUl)
  allHooks.push(hooks)

  var procedureUl = document.getElementById("ProcedureUl");
  var hooks = generateCheckboxUl("Procedure", procedureUl)
  allHooks.push(hooks)

  for (var i = 0; i < allHooks.length; i++)
  {
    addHooks(allHooks[i]);
  }
}

function generateCheckboxUl(category, ul)
{
  checkboxName = namesOfValuesPerKey(category);

  var hooks = []

  for (var i = 0; i < checkboxName.length; i++) {
    var codifyCBN = codifyHookandID(checkboxName[i])
    var newLi = generateCheckboxLi(checkboxName[i]);
    ul.appendChild(newLi);
    hooks.push("checkbox-" + codifyCBN)
  }

  return hooks;
}

function codifyHookandID(checkboxName)
{
  if(checkboxName.indexOf(" ") == -1)
  {
    return checkboxName;
  }
  else{
    var codifiedName = "";

    var indexOfSpace = checkboxName.indexOf(" ");

    while(indexOfSpace != -1)
    {
      codifiedName += checkboxName.substring(0, indexOfSpace) + "-";
      checkboxName = checkboxName.substring(indexOfSpace + 1);
      indexOfSpace = checkboxName.indexOf(" ");
    }

    codifiedName += checkboxName;

    return codifiedName;
  }
}

function generateCheckboxLi(checkboxName) 
{
  let li = document.createElement('li');
  
  let codifiedName = codifyHookandID(checkboxName);

  let input = document.createElement('input');
  input.classList.add("filter");
  input.setAttribute("data-filter", codifiedName);
  input.type = "checkbox";
  input.setAttribute("id", "checkbox-" + codifiedName);

  let label = document.createElement('label');
  label.classList.add("checkbox-label");
  label.setAttribute("for", "checkbox-" + codifiedName);
  label.textContent = checkboxName;

  li.appendChild(input);
  li.appendChild(label);

  return li;
}

function generateDropDownMenu(categoryName, select)
{
  var option = document.createElement("option")
  option.value = "all";
  option.textContent = "Select One";
  select.appendChild(option);
  option.classList.add("dropdown-content");

  var checkboxNameSet = new Set();
  
  for(var i = 0; i < data.length; i++)
  {
    if (data[i][categoryName] != "-")
      checkboxNameSet.add(data[i][categoryName])
  }

  var checkboxNameArray = Array.from(checkboxNameSet);
  checkboxNameArray.sort();
  
  //checkboxNameArray.length should = 2
  for (var i = 0; i < checkboxNameArray.length; i++) {
      var newOption = generateOptions(checkboxNameArray[i]);
      select.appendChild(newOption);
  }
}

function generateOptions(optionName)
{
  var option = document.createElement("option")
  option.value = optionName;

  option.textContent = optionName;
  option.classList.add("dropdown-content");
  return option;
}

function addHooks(hooks) {  
  for (var i = 0; i < hooks.length; i++) {
    $("#" + hooks[i]).change(function() {applyFilters(); console.log("#" + hooks[i] + " apply filters")});
    console.log("#" + hooks[i] + " hook created")
  }
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
    
    if(titles[t] == "Age")
    {
      filterOutput = ageFilter(filteredData)
      filteredData = filterOutput[0]
      filterApplied = filterApplied || filterOutput[1]
    }
    else if (titles[t] == "Sex" || titles[t] == "Species")
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

  lastFapplied = filterApplied;

  removeContent();
  scrollToTop();
  populate(filteredData);

  if (filteredData.length == 0) {
    errorMessage(true, "filter");
  }
  else {
    errorMessage(false, "filter")
  }

  //if filter is applied, clear viewing selected models view

  //updates viewingSelectedModels
  viewingSelectedModels = false;

  //updates counters --> displays filtered models counter
  updateCounters(filterApplied, filteredData);
}

function getNTimes()
{
  var nTimesRepeat = []
  var listOfNames = getFilterTitles();

  for(var i = 0; i < listOfNames.length; i ++)
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
    var noRepeatArray = namesOfValuesPerKey(categoryName);
    nTimesRepeat = noRepeatArray.length;
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
  var checkboxNames = namesOfValuesPerKey(categoryName);
  
  //if ID
  if(!isKey)
  {
    //IDs use the codified version of the name
    for(var i = 0; i < checkboxNames.length; i++)
    {
      checkboxNames[i] = codifyHookandID(checkboxNames[i]);
    }
  }
  if (checkboxNames.includes("1"))
  {
    if (!isKey)
    {
      checkboxNames = [categoryName];
    }
    else
    {
      checkboxNames = [1];
    }
  }

  //if key and not , fill with "english names" && not codified names
  return checkboxNames;
}

/*----------------------------

JavaScript for Filter Bar:
  The Three Different Types of Filters

----------------------------*/
function ageFilter(partialData)
{
  var minVal = parseFloat(document.getElementById("min-age").value);
  var maxVal = parseFloat(document.getElementById("max-age").value);

  if(isNaN(minVal) && isNaN(maxVal))
  {
    return [partialData, false] 
  }
  else
  {
    var filteredData = [];

    for (var i = 0; i < partialData.length; i++) {
      for (const [key, value] of Object.entries(partialData[i])) {
        var category = key.toLowerCase();
        var subCategory = value.toLowerCase();
        var push = false;
        if(category == "age")
        {
          if(isNaN(minVal) && parseFloat(subCategory) <= maxVal)
          {
            push = true;
          }
          else if (isNaN(maxVal) && parseFloat(subCategory) >= minVal)
          {
            push = true;
          }
          else if(parseFloat(subCategory) >= minVal && parseFloat(subCategory) <= maxVal)
          {
            push = true;
          }
          if(push)
          {
            filteredData.push(partialData[i]);
          }
        }
      }
    }
    
    return [filteredData, true];
  }
}

function dropDownFilter(categoryName, partialData)
{
  var valueToSearch = document.getElementById("select-" + categoryName).value.toLowerCase()

  if(valueToSearch == 'all')
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
      if (partialData[i][category].includes(key)) {
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
      categoriesWith1s.push(allCategories[i].toLowerCase())
    }
  }
      
  //filtering part
  for (var i = 0; i < partialData.length; i++) {
    for (const [key, value] of Object.entries(partialData[i])) {
      var category = key.toLowerCase();
      var subCategory = value.toLowerCase();
  
      if (!categoriesWith1s.includes(category))
      {
        if (subCategory.includes(valueToSearch) && category != "size" && category != "age")
        {
          filter[i] = true;
            
          if (valueToSearch == "male" && subCategory == "female")
          {
            filter[i] = false;
          }
        }
        
        if(category == "age"){
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