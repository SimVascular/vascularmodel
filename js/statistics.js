$(document).ready(function($){
  // accesses csv files to generate charts dynamically with csv data
  $.ajax({
    type: "GET",
    url: "https://www.vascularmodel.com/dataset/dataset-svprojects.csv",
    dataType: "text",
    async: false,
    success: function(fdata) {
      data = $.csv.toObjects(fdata);
    }
  });

  $.ajax({
    type: "GET",
    url: "https://www.vascularmodel.com/dataset/dataset-abbreviations.csv",
    dataType: "text",
    async: false,
    success: function(fdata) {
      abbreviations = $.csv.toObjects(fdata);
    }
  });

  $.ajax({
    type: "GET",
    url: "https://www.vascularmodel.com/dataset/dataset-diseaseTree.csv",
    dataType: "text",
    async: false,
    success: function(fdata) {
      tree = $.csv.toObjects(fdata);
      parentArray = Object.keys(tree[0]);
    }
  });

  $.ajax({
    type: "GET",
    url: "https://www.vascularmodel.com/dataset/dataset-svresults.csv",
    dataType: "text",
    async: false,
    success: function(fdata) {
      results = $.csv.toObjects(fdata);
    }
  });
  
  // creates the six charts dynamically
  createCharts();

  // when the window is resized, the charts are remade
  // this is because they adjust font size/labels with window width
  window.onresize = createCharts;
});

// reads from the abbreviations csv to get the abbreviations for the labels
function setAbbreviations(category) {
  var output = [];

  for(var i = 0; i < abbreviations.length; i++)
  {
    // csv structure is standardized
    var longName = abbreviations[i][category + " LongName"];
    var shortName = abbreviations[i][category + " ShortName"];

    // accounts for when some rows are empty
    if(longName != "" && shortName != "")
    {
      output[longName] = shortName; 
    }
  }

  return output;
}

// global variables for the filtered data for each chart
var healthData = [];
var anatomyData = [];
var diseaseData = [];
var sexData = [];
var ageData = [];
var simulationData = [];

// arraysUndefined is false when the filters have been run, defining the 
// filtered arrays for each chart
var arraysUndefined = true;

// creates the charts
function createCharts() {
  // updates the number of models/results under "Repository statistics"
  numbers();

  // only runs the filters once with arraysUndefined
  if(arraysUndefined)
  {
    filters();
  }

  // calls the separate functions for each chart
  healthChart();
  anatomyChart();

  diseaseChart();
  sexChart();

  ageChart();
  simulationChart();
}

// updates the number of models/results under "Repository statistics"
function numbers()
{
  var id = "numbers";
  var text = "Our repository has "
  var dataText = data.length + " models";
  var resultsText = results.length + " simulation results";

  var div = document.getElementById(id);
  var windowWidth = document.documentElement.clientWidth;

  // creates span and br elements so the text cuts nicely
  // depending on the window width
  if(windowWidth <= 450)
  {
    // adds two <br> elements with smaller widths
    div.innerHTML = "";

    var span = document.createElement("span");
    span.textContent = text;
    div.appendChild(span);

    div.appendChild(document.createElement("br"))

    var span = document.createElement("span");
    span.textContent = dataText + " and";
    div.appendChild(span);

    div.appendChild(document.createElement("br"))

    var span = document.createElement("span");
    span.textContent = resultsText;
    div.appendChild(span);
  }
  else if(windowWidth <= 620)
  {
    // adds one <br> element with medium widths
    div.innerHTML = "";

    var span = document.createElement("span");
    span.textContent = text;
    div.appendChild(span);

    div.appendChild(document.createElement("br"))

    var span = document.createElement("span");
    span.textContent = dataText + " and " + resultsText;
    div.appendChild(span);
  }
  else
  {
    // sets text normally for larger screen widths
    div.textContent = text + dataText + " and " + resultsText;
  }

}

// filters to fill each global variable array
function filters()
{
  sexData = filterForSex();
  anatomyData = filterForAnatomy();

  healthData = filterForHealth();
  diseaseData = filterForDisease();

  ageData = filterForAge();
  simulationData = filterForSimulation();

  // sets arraysUndefined to false to only run filters() once
  arraysUndefined = false;
}

// creates the heathy/diseased chart
function healthChart()
{
  // takes id for where to place the chart
  var id = "health"
  var width = document.getElementById(id).offsetWidth;

  var title = "Number of Healthy and Diseased Models";
  var downloadfilename = "VMR_Healthy_And_Diseased";

  // no abbreviations for the healthy/diseased chart
  var x = healthData[0];
  var longLabel = healthData[0];
  var y = healthData[1];

  // generates pie chart for healthy/diseased chart
  generatePie(title, downloadfilename, x, longLabel, y, id, width);
}

//filters between healthy/diseased models
function filterForHealth()
{
  var healthy = 0;
  var diseased = 0;

  for(var i = 0; i < data.length; i++)
  {
    if(data[i]["Disease"] == "Healthy")
    {
      healthy++;
    }
    else
    {
      // if not healthy, then diseased
      diseased++;
    }
  }

  // returns in the format other arrays are in
  return [["Healthy", "Diseased"], [healthy, diseased]];
}

// creates the chart for age distribution
function ageChart()
{
  // takes id for where to place the chart
  var id = "age"
  var width = document.getElementById(id).offsetWidth;

  var title = "Distribution of Age in Years for Human Models";
  var downloadfilename = "VMR_Human_Age_Distribution"

  var modedata = ageData[0];
  var names = ageData[1]

  // makes a box plot for age distribution
  generateBoxPlot(title, downloadfilename, modedata, names, id, width);
}

// makes an array with all the ages of every human model
// and records the names of each model for labels later
function filterForAge()
{
  var humanModeData = [];
  var names = [];

  for(var i = 0 ; i < data.length; i++)
  {
    // only adds human models into the age distribution chart
    if(data[i]["Species"] == "Human")
    {
      names.push(data[i]["Name"]);
      humanModeData.push(data[i]["Age"]);
    }
  }

  return [humanModeData, names];
}

// creates the chart for anatomy
function anatomyChart()
{
  // takes id for where to place the chart
  var id = "anatomy"
  var width = document.getElementById(id).offsetWidth;

  // abbs has the abbreviations from the csv under the Anatomy header
  var abbs = setAbbreviations("Anatomy");

  var title = "Number of Models per Type of Anatomy";
  var downloadfilename = "VMR_Models_Per_Anatomy"

  // the labels are abbreviated
  var x = abbreviate(anatomyData[0], abbs, width);
  // longLabel is not abbreviated
  var longLabel = anatomyData[0];
  var y = anatomyData[1];

  // generates a pie chart for anatomy
  generatePie(title, downloadfilename, x, longLabel, y, id, width);
}

// filters for the different anatomies and the number of each in the dataset
function filterForAnatomy() {
  // gets all the labels for Anatomy
  var x = namesOfValuesPerKey("Anatomy");
  var titles = new Set();

  //adds Pulmonary Fontan and Pulmonary Glenn to the Pulmonary category for simplicity
  for(var t = 0; t < x.length; t++)
  {
    if(x[t].includes("Pulmonary"))
    {
      titles.add("Pulmonary");
    }
    else
    {
      titles.add(x[t]);
    }
  }

  // re-defines x to the new list of labels
  x = Array.from(titles);

  var output = [];

  // uses keys and values to count how many models there are per label
  for(var t = 0; t < x.length; t++)
  {
      output[x[t]] = 0;
  }

  //adds Pulmonary Fontan and Pulmonary Glenn to the Pulmonary category for simplicity
  for(var i = 0 ; i < data.length; i++)
  {
    if(data[i]["Anatomy"].includes("Pulmonary"))
    {
      output["Pulmonary"] = output["Pulmonary"] + 1
    }
    
    output[data[i]["Anatomy"]] = output[data[i]["Anatomy"]] + 1;
  }

  var y = [];

  // x has the labels
  // y has the numbers
  for(var t = 0; t < x.length; t++)
  {
      y.push(output[x[t]]);
  }

  return [x, y];
}

// creates the chart for disease
function diseaseChart()
{
  // takes id for where to place the chart
  var id = "disease"
  var width = document.getElementById(id).offsetWidth;

  // abbs has the abbreviations from the csv under the Disease header
  var abbs = setAbbreviations("Disease");

  var title = "Number of Models per Type of Disease";
  var downloadfilename = "VMR_Models_Per_Disease"

  // x is the abbreviated labels
  var x = abbreviate(diseaseData[0], abbs, width, true);
  // longLabel is the full name of the labels
  var longLabel = diseaseData[0];
  var y = diseaseData[1];

  // creates a bar graph for disease
  generateBar(title, downloadfilename, x, longLabel, y, id, width);
}

// filters for the different disease and the number of each in the dataset
function filterForDisease()
{
  var x = new Set();

  // gets all of the disease labels from the models
  var allDisease = namesOfValuesPerKey("Disease");

  // gets all the diseases that are subcategories under parent categories
  var children = getChildrenOfTree();

  // adds all parents to the list of Disease labels
  for(var i = 0; i < parentArray.length; i++)
  {
    // excludes the children from the list of Disease labels
    if(!children.includes(parentArray[i]))
    {
      x.add(parentArray[i])
    }
  }

  for(var i = 0; i < allDisease.length; i++)
  {
    // excludes the children and "Healthy" from the list of Disease labels
    if(!children.includes(allDisease[i]) && allDisease[i] != "Healthy")
    {
      x.add(allDisease[i])
    }
  }

  // sorts the labels in alphabetical order
  x = Array.from(x).sort();

  var output = [];

  for(var t = 0; t < x.length; t++)
  {
      output[x[t]] = 0;
  }

  // adds numbers from children models to their parent models
  for(var i = 0 ; i < data.length; i++)
  {
    if(children.includes(data[i]["Disease"]))
    {
      var parents = getParentsOfChild(data[i]["Disease"]);
      
      // accounts for children that have multiple parents
      for (var p = 0; p < parents.length; p++)
      {
        // only adds numbers to parents that aren't children themselves
        if(!children.includes(parents[p]))
        {
          output[parents[p]]++;
        }
      }
    }
    // if not a child or healthy, adds to respective disease category
    else if(data[i]["Disease"] != "Healthy")
    {
      output[data[i]["Disease"]]++;
    }
  }

  // boolean that determines whether or not an "Other" category was made
  var otherCategory = false;
  var keepX = [];

  // combine ones that are very small
  for(var t = 0; t < x.length; t++)
  {
    // adds all the labels that have less than 10 models into the "Other" category
    if(output[x[t]] <= 10)
    {
      //if first time, sets output["Other"] value
      if(!otherCategory)
      {
        output["Other"] = 0;
      }

      output["Other"] += output[x[t]];

      otherCategory = true;
    }
    else
    {
      // removes the labels whose values were transferred to the "Other" category
      keepX.push(x[t])
    }
  }
  
  x = keepX;

  // adds the "Other" category to the Disease labels if applicable
  if(otherCategory)
  {
    x.push("Other");
  }

  var y = [];

  // x is the labels
  // y is the numbers

  for(var t = 0; t < x.length; t++)
  {
      y.push(output[x[t]]);
  }

  return [x, y];
}

// creates the chart for sex
function sexChart()
{
  // takes id for where to place the chart
  var id = "sex"
  var width = document.getElementById(id).offsetWidth;

  var title = "Number of Human Models Per Sex";
  var downloadfilename = "VMR_Models_Per_Sex";

  // no abbreviations for sex
  var x = sexData[0];
  var longLabel = sexData[0];
  var y = sexData[1];

  //accounts for the number of human models that do not have their sex specified
  // and adds a note about that number under the chart
  var unspecified = sexData[2];
  document.getElementById("unspecified").textContent = "Note: Information on the sex of " + unspecified + " human models is not avaliable"

  // generates a bar graph for sex
  generateBar(title, downloadfilename, x, longLabel, y, id, width);
}

// filters for the different sex and the number of each in the dataset
function filterForSex()
{
  var male = 0;
  var female = 0;
  var unspecified = 0;

  for(var i = 0; i < data.length; i++)
  {
    // only makes chart about sex of human models
    if(data[i]["Species"] == "Human")
    {
      if(data[i]["Sex"] == "Male")
      {
        male++;
      }
      else if(data[i]["Sex"] == "Female")
      {
        female++;
      }
      // if entry neither "Male" nor "Female," adds to unspecified number
      else
      {
        unspecified++;
      }
    }
  }

  // returns in the format of other filtered data arrays
  return [["Male", "Female"], [male, female], unspecified];
}

// creates the chart for simulation results
function simulationChart()
{
  // takes id for where to place the chart
  var id = "simulation"
  var width = document.getElementById(id).offsetWidth;

  // creates makeshift abbreviations array
  var abbs = [];
  abbs["With Results"] = "With";
  abbs["Without Results"] = "Without";

  var title = "Number of Models With and Without Simulation Results";
  var downloadfilename = "VMR_With_And_Without_Results"

  // x is abbreviated labels
  var x = abbreviate(simulationData[0], abbs, width);
  // longLabel is the full label
  var longLabel = simulationData[0];
  var y = simulationData[1];

  // generates pie chart for simulation results
  generatePie(title, downloadfilename, x, longLabel, y, id, width);
}

// filters for the number of models with and without simulation results
function filterForSimulation(){
  var withoutResults = 0;
  var withResults = 0;

  for(var i = 0; i < data.length; i++)
  {
    if(data[i]["Results"] == "1")
    {
      withResults++;
    }
    else
    {
      withoutResults++;
    }
  }

  // returns the array in the default format
  return [["With Results", "Without Results"], [withResults, withoutResults]];
}

// toggles with width to apply the abbreviations
//changes x-axis labels to abbreviations if the width is small
function abbreviate(x, abbs, width, early = false) {
  // window threshold to apply abbreviations is 767px wide
  var meetWidth = (width <= 767)
  if(early)
  {
    // this option always applies abbreviations
    meetWidth = true;
  }
  if(meetWidth)
  {
    var shortenedX = [];

    for(var i = 0; i < x.length; i++)
    {
      // if abbreviation not defined, displays
      if(typeof abbs[x[i]] != "undefined")
      {
        shortenedX[i] = abbs[x[i]]
      }
      else
      {
        shortenedX[i] = x[i]
      }
      
    }

    return shortenedX;
  }
  else
  {
    return x;
  }  
}

// function to generate a box plot from parameters
function generateBoxPlot(titletext, downloadfilename, modedata, names, id, width)
{
  var data = [
    {
      // only one trace, so no name is specified
      name:"",
      x: modedata,
      type: 'box',
      marker: {
        color: '#3a596e',
        line: {
          width: 1.5
        }
      },
      // shows points under the boxplot
      boxpoints: "all",
      jitter: 0.3,
      pointpos: -1.8,
      // horizontal box plot
      orientation: "h",
      hoverlabel : {
        bgcolor: "#fdecee",
        bordercolor: "black"
      },
      textposition: "none",
      // shows the names and the value when you hover on data
      text: names,
      hoverinfo: "text+x",
    }
  ];
 
  // generates chart with data settings defined above
  generateChart(titletext, downloadfilename, data, id, width);
}

// function to generate a pie chart from parameters
function generatePie(titletext, downloadfilename, xdata, longLabel, ydata, id, width)
{
  var data = [
    {
      values: ydata,
      labels: xdata,
      type: 'pie',
      marker: {
        color: '#6195b8',
        line: {
            width: 2.5
        }
      },
      hoverlabel : {
        bgcolor: "#fdecee",
        bordercolor: "black"
      },
      // text shows on hover, so it displays the full, long label
      text: longLabel,
      // shows label and percent outside of pie chart
      textinfo: "label+percent",
      textposition: "outside",
      // template for what hovering on a section looks like
      hovertemplate:
        "<b> %{percent}</b> %{text} <br>" +
        " %{value} models <br>" +
        "<extra></extra>"
    }
  ];

  // generates chart with data settings defined above
  generateChart(titletext, downloadfilename, data, id, width);
}

// function to generate bar graph from parameters
function generateBar(titletext, downloadfilename, xdata, longLabel, ydata, id, width) {
  var data = [
    {
      x: xdata,
      y: ydata,
      type: 'bar',
      marker: {
        color: '#3a596e',
        line: {
            width: 2.5
        }
      },
      hoverlabel : {
        bgcolor: "#fdecee",
        bordercolor: "black"
      },
      textposition: "none",
      // text shows on hover, so it displays the full, long label
      text: longLabel,
      // template for what hovering on a bar looks like
      hovertemplate:
            "<b> %{y:,.0f} </b>" +
            " %{text} <br>" +
            "<extra></extra>"
    }
  ];

  // generates chart with data settings defined above
  generateChart(titletext, downloadfilename, data, id, width);
}

// function to generate a chart from parameters
function generateChart(titletext, downloadfilename, data, id, width)
{
  // determines sizing of text and body that is then used throughout
  var output = responsiveForSizing(titletext, width);
  var titlesize = output[0];
  var bodysize = output[1];
  var titletext_post = output[2];
  
  // creates layout with determined parameters and sizing
  var layout = {
    title: {
      text: titletext_post,
      font: {
        size: titlesize
      }
    },

    barmode: 'stack',

    font: {
      // dark2
      color: "#3a596e",
      family: ["Poppins", "sans-serif"],
      size: bodysize
    },

    // does not show legend for any chart
    showlegend: false,

    modebar: {
      activecolor: "#6195b8"
    },

    margin: {
      pad: 15,
    },

    // determines the color spectrum of the pie charts
    colorway: ["#fdecee", "#d8b4c4", "#b39bb3",
    "#8a84a0", "#626e89", "#3a596e"]
  };

  // gives downloaded chart a specific name
  var config = {
    toImageButtonOptions: {
      format: 'png', // one of png, svg, jpeg, webp
      filename: downloadfilename,
      scale: 8 // Multiply title/legend/axis/canvas sizes by this factor
    },

    // responsive: true,

    // always has the buttons showing
    displayModeBar: true,

    // removes the buttons that aren't applicable
    modeBarButtonsToRemove: ['zoom2d', "pan2d", "lasso2d", "select2d", "resetScale2d"],

    // removes the plotly logo
    displaylogo: false
  }
  
  // creates the plot using plotly
  Plotly.newPlot(id, data, layout, config);
}

// toggles between different sizes depending on width
function responsiveForSizing(title_pre, width)
{
  var titlesize;
  var bodysize;

  // inserts breaks in title if still too big
  if(width <= 430)
  {
    var titlesize = 15;
    var bodysize = 10;
    var titletext = insertBreak(title_pre);
  }
  else if(width <= 550)
  {
    var titlesize = 17;
    var bodysize = 12;
    var titletext = insertBreak(title_pre);
  }
  else if(width <= 767)
  {
    var titlesize = 20;
    var bodysize = 17;
    var titletext = title_pre;
  }
  else
  {
    if(title_pre.length >= 47)
    {
      // smaller title if it is longer
      var titlesize = 22;
    }
    else
    {
      var titlesize = 25;
    }
    var bodysize = 17;
    var titletext = title_pre;
  }

  return [titlesize, bodysize, titletext]
}

// inserts break at halfway point in title
function insertBreak(title){
  var array = title.split(" ");
  var spaceCount = array.length - 1;

  // finds halfway point in the title
  var half = parseInt(spaceCount/2 + 0.5);
  var title_post = "";

  for(var i = 0; i < array.length; i++)
  {
    title_post += array[i];
    // adds a break at halfway point
    // otherwise, adds space
    if(i == half - 1)
    {
      title_post += "<br>";
    }
    else if(i != spaceCount)
    {
      title_post += " ";
    }
  }

  // returns the formatted array
  return title_post;
}