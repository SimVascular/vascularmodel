/*----------------------------

JavaScript for Filter Bar

----------------------------*/

var availableFilters = {}

function getFilterMenu()
{
  var allHooks = []
  
  //sets default values for Age
  if (document.getElementById("min-age"))
  {
    availableFilters['Age'] = true
    document.getElementById("min-age").value = 0;
  }
  else
  {
    availableFilters["Age"] = false
  }
  if (document.getElementById("max-age"))
  {
    document.getElementById("max-age").value = 120;
  }

  //generates html of Sex dropdown menu
  var sexSelect = document.getElementById("select-Sex");
  if (sexSelect)
  {
    availableFilters["Sex"] = true
    generateDropDownMenu("Sex", sexSelect)
    allHooks.push(["select-Sex"])
  }
  else
  {
    availableFilters["Sex"] = false
  }

  //generates html of Species dropdown menu
  var speciesSelect = document.getElementById("select-Species");
  if (speciesSelect)
  {
    availableFilters["Species"] = true
    generateDropDownMenu("Species", speciesSelect)
    allHooks.push(["select-Species"])
  }
  else
  {
    availableFilters["Species"] = false
  }

  //generates html of Anatomy checkboxes
  var anatomyUl = document.getElementById("AnatomyUl");
  if (anatomyUl)
  {
    availableFilters["Anatomy"] = true
    var hooks = generateCheckboxUl("Anatomy", anatomyUl)
    allHooks.push(hooks)
  }
  else
  {
    availableFilters["Anatomy"] = false
  }

  //generates html of Disease checkboxes
  var diseaseUl = document.getElementById("DiseaseUl");
  if (diseaseUl)
  {
    availableFilters["Disease"] = true
    var hooks = generateCheckboxUl("Disease", diseaseUl)
    allHooks.push(hooks)
  }
  else
  {
    availableFilters["Disease"] = false
  }

  //generates html of Procedure checkboxes
  var procedureUl = document.getElementById("ProcedureUl");
  if (procedureUl)
  {
    availableFilters["Procedure"] = true
    var hooks = generateCheckboxUl("Procedure", procedureUl)
    allHooks.push(hooks)
  }
  else
  {
    availableFilters["Procedure"] = false
  }

  //generates html of Modality checkboxes
  var modalityUl = document.getElementById("ModalityUl");
  if (modalityUl)
  {
    availableFilters["Image Modality"] = true
    var hooks = generateCheckboxUl("Image Modality", modalityUl)
    allHooks.push(hooks)
  }
  else
  {
    availableFilters["Image Modality"] = false
  }

  //loops through all hooks saved above
  for (var i = 0; i < allHooks.length; i++)
  {
    for(var j = 0; j < allHooks[i].length; j++)
    {
      //adds listeners for each hook
      addHook(allHooks[i][j]);
    }
  }

  headerHooks();
}

function generateCheckboxUl(category, ul, fromParent = false)
{
  //array of the possible options in that category
  checkboxNames = namesOfValuesPerKey(category);

  var hooks = [];

  //loops through options
  for (var i = 0; i < checkboxNames.length; i++) {
    getChildrenOfTree();

    //if it is a parent and not a child
    //if it is both a parent and a child then it will act as a child
    if(checksIfParent(checkboxNames[i]) && (!childrenArray.includes(checkboxNames[i]) || fromParent))
    {      
      var output = makeEmbeddedParent(checkboxNames, checkboxNames[i]);

      var parentHooks = output[0];
      checkboxNames = output[1];
      var parentLi = output[2];
      ul.appendChild(parentLi);

      //adds hooks from parent element
      for(var j = 0; j < parentHooks.length; j++)
      {
        hooks.push(parentHooks[j]);
      }
    }
    else if((!childrenArray.includes(checkboxNames[i]) || fromParent) && checkboxNames[i] != "")
    {
      if(fromParent)
      {
        var newLi = generateCheckboxLi(checkboxNames[i], category);
      }
      else
      {
        var newLi = generateCheckboxLi(checkboxNames[i]);
      }

      ul.appendChild(newLi);
    }

    if(fromParent)
    {
      ul.setAttribute("id", codifyHookandID(category));
    }

    //creates code version of csv string
    var codifyCBN = codifyHookandID(checkboxNames[i]);
    
    //creates hooks for each checkbox
    hooks.push("checkbox-" + codifyCBN)
  }

  //saves hooks; changes were appended to ul
  return hooks;
}

function makeEmbeddedParent(checkboxNames, parentName)
{
  var li = document.createElement("li")
  
  var div = document.createElement("div");
  div.classList.add("cd-filter-block");

  let codifiedName = codifyHookandID(parentName);

  let input = document.createElement('input');
  input.classList.add("filter");
  input.setAttribute("data-filter", codifiedName);
  input.type = "checkbox";
  //sets id that is the same as the hook later created
  input.setAttribute("id", "checkbox-" + codifiedName);

  let label = document.createElement('label');
  label.classList.add("checkbox-label");
  label.classList.add("adjustCheckboxForEmbed");
  label.setAttribute("for", "checkbox-" + codifiedName);

  let h4 = document.createElement("h4");
  h4.classList.add("closed");
  h4.classList.add("embedded");
  //displays un-codified name
  h4.textContent = parentName;

  label.appendChild(h4);

  var parentUl = document.createElement("ul");
  parentUl.classList.add("cd-filter-content");
  parentUl.classList.add("cd-filters");
  parentUl.classList.add("list");
  parentUl.style.display = "none";
  // parentUl.style.display = "block";
  var hooks = generateCheckboxUl(parentName, parentUl, true);

  //changes made to element
  div.appendChild(input);
  div.appendChild(label);
  div.appendChild(parentUl);
  li.appendChild(div);

  return [hooks, checkboxNames, li];
}

function codifyHookandID(checkboxName)
{
  //if no spaces to replace
  if(checkboxName.indexOf(" ") == -1)
  {
    return checkboxName;
  }
  else{
    //replaces spaces with "-"
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

function generateCheckboxLi(checkboxName, categoryName = "-") 
{
  //creates checkbox li element
  let li = document.createElement('li');
  
  let codifiedName = codifyHookandID(checkboxName);

  let input = document.createElement('input');
  input.classList.add("filter");
  if(categoryName != "-")
  {
    input.classList.add(codifyHookandID(categoryName));
  }
  input.setAttribute("data-filter", codifiedName);
  input.type = "checkbox";
  //sets id that is the same as the hook later created
  input.setAttribute("id", "checkbox-" + codifiedName);

  let label = document.createElement('label');
  label.classList.add("checkbox-label");
  label.setAttribute("for", "checkbox-" + codifiedName);
  //displays un-codified name
  label.textContent = checkboxName;

  li.appendChild(input);
  li.appendChild(label);

  return li;
}

function generateDropDownMenu(categoryName, select)
{
  //creates option that selects all choices
  var option = document.createElement("option")
  option.value = "all";
  option.textContent = "Select One";
  select.appendChild(option);
  option.classList.add("dropdown-content");

  //possible options of dropdown menu
  var categoryNames = namesOfValuesPerKey(categoryName);
  
  for (var i = 0; i < categoryNames.length; i++) {
    //generates each option and appends
    var newOption = generateOptions(categoryNames[i]);
    select.appendChild(newOption);
  }
}

function generateOptions(optionName)
{
  //creates option for dropdown menus
  var option = document.createElement("option")
  option.value = optionName;

  option.textContent = optionName;
  option.classList.add("dropdown-content");

  return option;
}

function addHook(hook) { 
  //takes in hook and creates a listener 
  $("#" + hook).change(function() {applyFilters();});
}


function headerHooks()
{
  //close filter dropdown inside lateral .cd-filter
  $('.checkbox-label h4').on('click', function(){
    console.log("clicked in h4")
    $(this).parent().next('.cd-filter-content').slideToggle(300);

    var categoryName = codifyHookandID(this.textContent);
    var childrenOfCategory = document.getElementsByClassName(categoryName);

    for(var i = 0; i < childrenOfCategory.length; i++)
    {
      if($(this).parent().siblings()[0].checked)
      {
        childrenOfCategory[i].checked = false;
      }
      else
      {
        childrenOfCategory[i].checked = true;
      }
    }

    applyFilters();
  })

  //close filter dropdown inside lateral .cd-filter
  $('.cd-filter-block h4').on('click', function(){
	  $(this).toggleClass('closed').siblings('.cd-filter-content').slideToggle(300);
  })

  //if parent is clicked
  //click all children

  //if parent is unclicked
  //unclick all children

}

/*----------------------------

JavaScript to Apply Filters

----------------------------*/

function applyFilters()
{
  //resets filterApplied, curIndex, filteredData
  var filterApplied = false
  curIndex = 0;
  filteredData = data;

  //declares filterOutput
  var filterOutput;

  //sets up values
  var nTimes = getNTimes();
  var titles = getFilterTitles();

  //per type of filter
  for(var t = 0; t < titles.length; t++){
    if (availableFilters[titles[t]])
    {
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
        //takes union, not intersection between checkboxes
        var whichToKeep = new Array(filteredData.length)
        //if a box is checked in the category
        if (isChecked(titles[t]))
        {    
          whichToKeep.fill(false);

          for(var i = 0; i < nTimes[t]; i++)
          {
            //ID is related to the hook. Key is the value in the CSV
            IDs = checkboxNamesPerCategory(titles[t], false)
            keys = checkboxNamesPerCategory(titles[t], true)
            //sends each checkbox into the filter
            filterOutput = checkboxFilter("checkbox-" + IDs[i], titles[t], keys[i], filteredData, whichToKeep)
            //saves changes in whichToKeep
            whichToKeep = filterOutput[0]
            filterApplied = filterApplied || filterOutput[1]
          }
        }
        else{
          //if not checked, return all values
          whichToKeep.fill(true);
        }

        //keeps the ones set to be kept
        filteredData = updatedFilteredData(whichToKeep, filteredData);
      }
    }
  }
  //filters for search bar
  filterOutput = searchBarFilter(filteredData);
  filteredData = filterOutput[0];
  filterApplied = filterApplied || filterOutput[1];

  //filters for whether or not a model has simulation results
  filterOutput = hasResults(filteredData);
  filteredData = filterOutput[0]
  filterApplied = filterApplied || filterOutput[1]

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

//takes in the amount of options there are under each category in getFilterTitles()
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

//calculates the number of options per category
function getNTimesPerCategory(categoryName)
{
  var nTimesRepeat = 0;
  //accounts for when the value is "0" or "1"
  var categoryNames = getMustContainFilterTitles();
  
  //hard codes for Age; there will be many different ages
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

//checks if at least one checkbox is checked
function isChecked(title)
{
  //gets all IDs, which are related to the hook
  IDs = checkboxNamesPerCategory(title, false)

  for(var i = 0; i < IDs.length; i++)
  {
    //if any of the checkboxes are checked, return true
    if (document.getElementById("checkbox-" + IDs[i]).checked)
    {
      return true;
    }
  }  
}

function updatedFilteredData(whichToKeep, filteredData)
{
  //takes in an array of booleans whichToKeep and updates filteredData
  var updatedFilteredData = []

  for (var i = 0 ; i < filteredData.length; i++)
  {
    if (whichToKeep[i])
    {
      //keeps the trues in whichToKeep
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
    //since they are related to the hook
    for(var i = 0; i < checkboxNames.length; i++)
    {
      checkboxNames[i] = codifyHookandID(checkboxNames[i]);
    }
  }
  if (checkboxNames.includes("1"))
  {
    //accounts for when there is a "0" or "1" instead of values
    if (!isKey)
    {
      checkboxNames = [categoryName];
    }
    else
    {
      //the filter will save the ones that = "1"
      checkboxNames = [1];
    }
  }

  //if key and not id, fill with "english names" && not codified names
  return checkboxNames;
}

/*----------------------------

JavaScript for Filter Bar:
  The Three to Four Different Types of Filters

----------------------------*/
function ageFilter(partialData)
{
  //takes in input from filter
  var minAgeFilter = document.getElementById("min-age")
  var maxAgeFilter = document.getElementById("max-age")
  if (minAgeFilter != null)
  {
    var minVal = parseFloat(minAgeFilter.value);
  }
  if (maxAgeFilter != null)
  {
    var maxVal = parseFloat(maxAgeFilter.value);
  }
  //checks if input has no impact on filtering
  if((isNaN(minVal) || minVal == 0) && (isNaN(maxVal) || maxVal == 120))
  {
    return [partialData, false] 
  }
  else
  {
    var filteredData = [];
    //traverses all elements in partialdata
    for (var i = 0; i < partialData.length; i++) {
      //default: element is not kept
      var push = false;
      //only checks under "Age" category
      var element = partialData[i]["Age"];
      
      //checks for NaN values to avoid
      if(isNaN(minVal) && parseFloat(element) <= maxVal)
      {
        //if within max bounds
        //and no min defined
        push = true;
      }
      else if (isNaN(maxVal) && parseFloat(element) >= minVal)
      {
        //if within min bounds
        //and no max defined
        push = true;
      }
      else if(parseFloat(element) >= minVal && parseFloat(element) <= maxVal)
      {
        //if within min and max
        push = true;
      }
      if(push)
      {
        //if saved, adds to filteredData
        filteredData.push(partialData[i]);
      }
    }
    
    return [filteredData, true];
  }
}

function dropDownFilter(categoryName, partialData)
{
  //reads which is selected in dropdown menu
  if (document.getElementById("select-" + categoryName))
    {
    var valueToSearch = document.getElementById("select-" + categoryName).value.toLowerCase()

    //if nothing specified
    if(valueToSearch == 'all')
    {
      return [partialData, false];
    }
    else
    {
      var filteredData = []

      for (var i = 0; i < partialData.length; i++) {
        //only searches under category
        var element = partialData[i][categoryName].toLowerCase();

        //if valueToSearch and current element align
        if (element == valueToSearch) 
        {
          //saves element in filteredData
          filteredData.push(partialData[i]);
        }
      }

      return [filteredData, true];
    }
  }
  return partialData;
}

function checkboxFilter(checkboxID, category, key, partialData, whichToKeep)
{
  //checks if checkbox is checked
  if (document.getElementById(checkboxID).checked)
  {  
    for (var i = 0; i < partialData.length; i++) {
      if (partialData[i][category].includes(key)) {
        //if element under that category in csv == key, saves model
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

function searchBarFilterOneEntry(partialData, valueToSearch)
{
  //set up variables
  var filter = new Array(partialData.length);
  filter.fill(false);

  var allCategories = getAllCategories();
  
  //categoriesWith1s is an array with i.e. "Images", "Simulations"
  var categoriesWith1s = []
  
  // if we only have one element we put all categories which is not right
  if (data.length > 1)
  {
    for(var i = 0; i < allCategories.length; i++)
    {
      if (getNTimesPerCategory(allCategories[i]) == 1)
      {
        categoriesWith1s.push(allCategories[i].toLowerCase())
      }
    }
  }
   
  //filtering part
  for (var i = 0; i < partialData.length; i++) {
    //traverses through all keys and values
    for (const [key, value] of Object.entries(partialData[i])) {
      var category = key.toLowerCase();
      var subCategory = value.toLowerCase();
      
      if (!categoriesWith1s.includes(category))
      {
        //excludes "size" and "age" becaue they interfere with "name"
        if (subCategory.includes(valueToSearch) && category != "size" && category != "age")
        {
          //if includes, saves
          filter[i] = true;
          
          //accounts that female .includes() male is true
          if (valueToSearch == "male" && subCategory == "female")
          {
            filter[i] = false;
          }
        }
        
        //differences for age
        if(category == "age"){
          //allows user to search pediatric and adult
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
        //if categoryWith1s, search is different
        if (category == valueToSearch && subCategory == '1') {
          filter[i] = true;
        }
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
  var filter = []
  
  for(var v = 0; v < valuesToSearch.length; v++)
  {
    //sends each value individually to be searched
    var output = searchBarFilterOneEntry(partialData, valuesToSearch[v])

    tempFilter = output[0];

    //if first iteration
    if (v == 0)
    {
      filter = tempFilter;
    }
    else
    {
      for(var f = 0; f < filter.length; f++)
      {
        //takes intersection
        filter[f] = tempFilter[f] && filter[f];
      }
    }
  }
  //returns array of booleans of which to keep
  return [filter, true];
}

function hasResults(partialData){
  if(document.getElementById("switch-input") && 
     document.getElementById("switch-input").checked)
  {
    var filteredData = []

      for (var i = 0; i < partialData.length; i++) {
        if(partialData[i]["Results"] == "1")
        {
          //saves in both arrays
          filteredData.push(partialData[i]);
        }
      }

    return [filteredData, true];
  }
  else
  {
    return [partialData, false];
  }
  
}