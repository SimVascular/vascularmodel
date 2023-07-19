/*----------------------------

JavaScript for Filter Bar

----------------------------*/

var availableFilters = {};
var listOfCheckboxLiMade = [];


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

  // Project Must Contain defined in dataset.html
  var titles = ['Images', 'Paths', 'Segmentations', 'Models', 'Meshes', 'Simulations'];

  for(var t = 0; t< titles.length; t++)
  {
    if(document.getElementById("checkbox-" + titles[t] + "_1"))
    {
      availableFilters[titles[t]] = true;
    }
  }

  findModeOfListOfCheckboxLiMade();

  //loops through all hooks saved above
  for (var i = 0; i < allHooks.length; i++)
  {
    for(var j = 0; j < allHooks[i].length; j++)
    {
      //adds listeners for each hook
      addHook(allHooks[i][j]);
    }
  }

  //adds listeners for embedded headers
  headerHooks();
}

function generateCheckboxUl(category, ul, fromParent = false)
{
  //array of the possible options in that category
  checkboxNames = namesOfValuesPerKey(category);

  var hooks = [];

  //loops through options
  for (var i = 0; i < checkboxNames.length; i++) {
    //fills the childrenArray variable in globalVar.js
    getChildrenOfTree();

    //if it is a parent and a child, then it acts as a parent
    if(checksIfParent(checkboxNames[i]) && (!childrenArray.includes(checkboxNames[i]) || fromParent))
    {  
      //generates the parent element already with its children elements appended    
      var output = makeEmbeddedParent(checkboxNames, checkboxNames[i]);

      //returned hooks and the li element
      var parentHooks = output[0];
      ul.appendChild(output[2]);

      //to reset any changes to checkboxNames
      checkboxNames = output[1];

      //adds hooks from parent element
      for(var j = 0; j < parentHooks.length; j++)
      {
        hooks.push(parentHooks[j]);
      }
    }
    // if not a child or it is not both a child and a parent
    else if((!childrenArray.includes(checkboxNames[i]) || fromParent) && checkboxNames[i] != "")
    {
      //generates the li element
      var newLi = generateCheckboxLi(checkboxNames[i], getParentsOfChild(checkboxNames[i]));
      ul.appendChild(newLi);
    }

    //sets correct id for parent checkbox
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

//generates the complete parent li element
function makeEmbeddedParent(checkboxNames, parentName)
{
  var li = document.createElement("li")
  
  var div = document.createElement("div");
  div.classList.add("cd-filter-block");

  //makes name compatible with the html id requirements
  let codifiedName = codifyHookandID(parentName);

  //keeps track of which checkbox li have been made to track duplicates
  listOfCheckboxLiMade.push(codifiedName);

  let input = document.createElement('input');
  input.classList.add("filter");
  input.classList.add(codifiedName);

  //adds the names of the parents to the class of the input element
  //keeps track of the child's parents to access later
  var parents = getParentsOfChild(parentName);
  if(parents != "orphan")
  {
    for(var i = 0; i < parents.length; i++)
    {
      input.classList.add(codifyHookandID(parents[i]));
    }
  }

  //creates the checkbox element for the parent
  input.setAttribute("data-filter", codifiedName);
  input.type = "checkbox";

  //unique ID even if the same checkbox
  var count = listOfCheckboxLiMade.filter(x => x == codifiedName).length;
  input.setAttribute("id", "checkbox-" + codifiedName + "_" + count);

  //creates the box to click
  let checkBox = document.createElement("div");
  checkBox.classList.add("label-before");
  checkBox.classList.add("parent");

  //creates the label to select
  let label = document.createElement('label');
  label.classList.add("checkbox-label");
  label.classList.add("adjustCheckboxForEmbed");
  label.setAttribute("for", "checkbox-" + codifiedName + "_" + count);

  //creates the label's h4 element with the parent's name
  let h4 = document.createElement("h4");
  //default is that the children aren't showing 
  h4.classList.add("closed");
  h4.classList.add("embedded");
  //displays un-codified name
  h4.textContent = parentName;

  label.appendChild(h4);

  //creates the parent's ul element, which will contain its children li
  var parentUl = document.createElement("ul");
  parentUl.classList.add("cd-filter-content");
  parentUl.classList.add("cd-filters");
  parentUl.classList.add("list");
  //default is that the children aren't showing 
  parentUl.style.display = "none";

  //generates li elements to append children li with generateCheckboxUl()
  var hooks = generateCheckboxUl(parentName, parentUl, true);

  //appends changes made to element in the right order
  div.appendChild(input);
  div.appendChild(checkBox);
  div.appendChild(label);
  div.appendChild(parentUl);
  li.appendChild(div);

  //returns necessary for hooks and the li element to append
  return [hooks, checkboxNames, li];
}

//makes the names compaitble for hooks and IDs
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

//creates li elements for filter bar
function generateCheckboxLi(checkboxName, categoryNames = []) 
{
  //creates checkbox li element
  let li = document.createElement('li');
  
  //tracks which checkboxes have been made for duplicates
  let codifiedName = codifyHookandID(checkboxName);
  listOfCheckboxLiMade.push(codifiedName);

  let input = document.createElement('input');
  input.classList.add("filter");

  //categoryNames contains the parents of the li element if it is a child
  if(categoryNames != "orphan")
  {
    for(var i = 0; i < categoryNames.length; i++)
    {
      //adds the parents to the classes of the input element
      input.classList.add(codifyHookandID(categoryNames[i]));
    }
  }
  input.setAttribute("data-filter", codifiedName);
  input.type = "checkbox";
  
  //unique ID even if the same checkbox
  var count = listOfCheckboxLiMade.filter(x => x == codifiedName).length;
  input.setAttribute("id", "checkbox-" + codifiedName + "_" + count);

  //creates checkbox that comes before the li element
  let checkBox = document.createElement("div");
  checkBox.classList.add("label-before");

  //creates the label where the name shows
  let label = document.createElement('label');
  label.classList.add("checkbox-label");
  //adds the unique ID
  label.setAttribute("for", "checkbox-" + codifiedName + "_" + count);
  //displays un-codified name
  label.textContent = checkboxName;

  //appends in the right html order
  li.appendChild(input);
  li.appendChild(checkBox);
  li.appendChild(label);

  return li;
}

//generates the dropdown menus
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

//generates the options for the dropdown menus
function generateOptions(optionName)
{
  //creates option for dropdown menus
  var option = document.createElement("option")
  option.value = optionName;

  option.textContent = optionName;
  option.classList.add("dropdown-content");

  return option;
}

var mode = -1;

//finds the mode for the listOfCheckboxLiMade array
//returns maximum times a name appears in listOfCheckboxLiMade
function findModeOfListOfCheckboxLiMade(){
  var names = [];
  var max = -1;
  for(var i = 0; i < listOfCheckboxLiMade.length; i++)
  {
    //if there is a duplicate
    if(names.includes(listOfCheckboxLiMade[i]))
    {
      max = Math.max(max,(listOfCheckboxLiMade.filter(x => x == listOfCheckboxLiMade[i]).length));
    }
    else
    {
      names.push(listOfCheckboxLiMade[i]);
      max = Math.max(max, 1);
    }
  }

  //sets the value of mode, a global variable
  mode = max;
}

//adds hooks after the html is generated
function addHook(hook) {
  //if the hook comes from a checkbox element
  if(hook.includes("checkbox"))
  {
    //iterates as many times as there are duplicates in the checkboxes
    //to set hooks for all of them
    for(var i = 1; i <= mode; i++)
    {
      $("#" + hook + "_" + i).click(function() {
        //if there is a change in one duplicate, all are selected
        checkSimilarCheckboxes($(this)[0], hook);
        applyFilters();
      });
    }
  }
  else
  {
    $("#" + hook).change(function() {
      applyFilters();
    });
  }
}

//checks checkbox duplicates if one is checked
function checkSimilarCheckboxes(inputElementChecked, hook){
  //iterates for the max number of duplicates
  for(var m = 1; m <= mode; m++)
  {
    //otherSimilarElement is a duplicate of what checkbox was checked
    //it can also be the same as the checkbox that was checked
    var otherSimilarElement = document.getElementById(hook + "_" + m);

    if(otherSimilarElement != null)
    {
      //checks otherSimilarElement is the checkbox was checked
      if(inputElementChecked.checked == true)
      {
        otherSimilarElement.checked = true;
      }
      else
      {
        otherSimilarElement.checked = false;

        //if a child is unchecked, it deselects the parent elements as well
        deselectHeaders(otherSimilarElement.parentNode.childNodes, true);
      }
    } 
  }
}

//if a child element is unchecked, this deselects the parent element as well
function deselectHeaders(current)
{
  //checks if the header should be deselected; if the child is no longer checked
  if(!current[0].checked)
  {
    //iterates until maxParents is false
    //maxParents is false when there are no more parent headers to deselect 
    for(var maxParents = true; maxParents;)
    {
      //takes the path from a parent header to a parent header
      var parentToParent = current[0].parentNode.parentNode.parentNode.parentNode.childNodes

      //takes the path from a child to a parent header
      var childToParent = current[0].parentNode.parentNode.parentNode.childNodes;

      if(typeof (parentToParent[0].checked) == "undefined")
      {
        if (typeof (childToParent[0].checked) == "undefined")
        {
          //if the parent to parent is undefined
          //and the child to child is undefined
          //then there are no more parent headers to deselect
          maxParents = false;
        }
        else
        {
          //updates the current from a child element to a parent element
          current = childToParent;
          //unchecks parent
          current[0].checked = false;
        }
      }
      else
      {
        //updates the current element to the parent of that element
        current = parentToParent;
        //unchecks parent
        current[0].checked = false;
      }
    }
  }
}

//adds hooks for headers
function headerHooks()
{
  //manually checks and unchecks because now the check is a div
  $(".label-before").on('click', function(){

    //simulates that the input element has been clicked
    var inputElement = $(this).siblings()[0];
    inputElement.click();

    //applies filters for new checkboxes checked
    applyFilters();
  });

  //listens for when the checkbox of a parent has been checked
  $(".label-before.parent").on('click', function(){
    var labelElement = $(this).siblings()[1];
  
    var categoryName = codifyHookandID(labelElement.textContent);

    //gets all the children, who have a class with their parent's name
    var childrenOfCategory = $("." + categoryName);

    //checks the status of the parent input element
    var isParentChecked = $(this).siblings()[0].checked;

    for(var i = 0; i < childrenOfCategory.length; i++)
    {
      //checks or unchecks all children according to parent
      if(isParentChecked)
      {
        childrenOfCategory[i].checked = true;
      }
      else
      {
        childrenOfCategory[i].checked = false;
        //if a child is unchecked, it deselects its parent headers
        deselectHeaders(childrenOfCategory[i].parentNode.childNodes, true);
      }
    }

    //applies filters for new checkboxes checked
    applyFilters();
  });

  //closes a parent header when the label is checked
  $('.cd-filter-block h4').on('click', function(){
	  $(this).toggleClass('closed').siblings('.cd-filter-content').slideToggle(300);
  });

  //close filter dropdown inside lateral .cd-filter
  $('.checkbox-label h4').on('click', function(){
    $(this).parent().next('.cd-filter-content').slideToggle(300);

    //cancels out clicking so opening and closing menu has no effect on checkbox
    $(this).parent().siblings()[0].checked = !$(this).parent().siblings()[0].checked;
  });
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
    if (document.getElementById("checkbox-" + IDs[i] + "_1").checked)
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
  if (document.getElementById(checkboxID + "_1").checked)
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
    var categories = searchBarCategories();

    for(var c = 0; c < categories.length; c++)
    {
      var modelSubCategory = partialData[i][categories[c]].toLowerCase();
      var category = categories[c].toLowerCase();

      if(category != "size" && category != "age" && category != "sex")
      {
        //for example selects the valueEntered is "coron" and the model is "coronary"
        if (modelSubCategory.includes(valueEntered))
        {
          filter[i] = true;
          //once the model is selected as true, goes on to next model
          break;
        }

        //includes children if the parent's name is searched
        var parents = getParentsOfChild(partialData[i][categories[c]])

        //filters for similarities between the parents of the child and the valueEntered
        if(parents !== "orphan")
        {
          for(var p = 0; p < parents.length; p++)
          {
            parents[p] = parents[p].toLowerCase();
            if (parents[p].includes(valueEntered))
            {
              filter[i] = true;
              //once the model is selected as true, goes on to next model
              break;
            }
          }
        }
      }
      //specific searching for age
      else if (category == "age")
      {
        //allows user to search pediatric and adult
        if (valueEntered == "pediatric" && parseInt(modelSubCategory) < 18) {
          filter[i] = true;
        }
        else if (valueEntered == "adult" && parseInt(modelSubCategory) >= 18){
          filter[i] = true;
        }
      }
      //specific requirements for sex
      //since "male".includes("female") is true when it should be false
      else if(category == "sex")
      {
        if (valueEntered == modelSubCategory)
        {
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

//searches for which models have simulation results
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