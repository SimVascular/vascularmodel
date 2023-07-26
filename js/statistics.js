$(document).ready(function($){
    //reads csv file and sets it to the global variable data
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
    
    createCharts();

    window.onresize = createCharts;
});

function setAbbreviations(category) {
  var output = [];

  for(var i = 0; i < abbreviations.length; i++)
  {
    var longName = abbreviations[i][category + " LongName"];
    var shortName = abbreviations[i][category + " ShortName"]
    if(longName != "" && shortName != "")
    {
      output[longName] = shortName; 
    }
  }

  return output;
}

var healthData = [];
var anatomyData = [];
var diseaseData = [];
var sexData = [];
var ageData = [];
var simulationData = [];

// var typeAndMethodData = [];
var arraysUndefined = true;

function createCharts() {
  numbers();

  if(arraysUndefined)
  {
    filters();
  }

  healthChart();
  anatomyChart();

  diseaseChart();
  sexChart();

  ageChart();
  simulationChart();
  // methodChart();
}

function numbers()
{
  var id = "numbers";
  var text = "Our repository has "
  var dataText = data.length + " models";
  var resultsText = results.length + " simulation results";

  var div = document.getElementById(id)

  if(document.documentElement.clientWidth <= 450)
  {
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
  else if(document.documentElement.clientWidth <= 620)
  {
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
    div.textContent = text + dataText + " and " + resultsText;
  }

}

function filters()
{
  healthData = filterForHealth();
  ageData = filterForAge();
  anatomyData = filterForAnatomy();
  diseaseData = filterForDisease();
  simulationData = filterForSimulation();
  sexData = filterForSex();
  // typeData = filterForType();
  arraysUndefined = false;
}

function healthChart()
{
  // chart for health
  var id = "health"
  var width = document.getElementById(id).offsetWidth;

  var title = "Number of Healthy and Diseased Models";
  var downloadfilename = "VMR_Healthy_And_Diseased"
  var x = healthData[0];
  var longLabel = healthData[0];
  var y = healthData[1];

  generatePie(title, downloadfilename, x, longLabel, y, id, width);
}

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
      diseased++;
    }
  }

  return [["Healthy", "Diseased"], [healthy, diseased]];
}

function ageChart()
{
  // chart for age
  var id = "age"
  var width = document.getElementById(id).offsetWidth;

  var title = "Distribution of Age in Years for Human Models";
  var downloadfilename = "VMR_Human_Age_Distribution"

  var modedata = ageData[0];
  var names = ageData[1]

  generateBoxPlot(title, downloadfilename, modedata, names, id, width);
}

function filterForAge()
{
  var humanModeData = new Array(data.length);
  var names = new Array(data.length);

  for(var i = 0 ; i < data.length; i++)
  {
    if(data[i]["Species"] == "Human")
    {
      names.push(data[i]["Name"]);
      humanModeData.push(data[i]["Age"]);
    }
  }

  return [humanModeData, names];
}

function anatomyChart()
{
  // chart for anatomy
  var id = "anatomy"
  var width = document.getElementById(id).offsetWidth;
  var abbs = setAbbreviations("Anatomy");

  var title = "Number of Models per Type of Anatomy";
  var downloadfilename = "VMR_Models_Per_Anatomy"

  var x = abbreviate(anatomyData[0], abbs, width);
  var longLabel = anatomyData[0];
  var y = anatomyData[1];

  generatePie(title, downloadfilename, x, longLabel, y, id, width);
}

function filterForAnatomy() {
  var x = namesOfValuesPerKey("Anatomy");
  var titles = new Set();

  //adds Pulmonary Fontan and Glenn to Pulmonary for simplicity
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

  x = Array.from(titles);

  var output = [];

  for(var t = 0; t < x.length; t++)
  {
      output[x[t]] = 0;
  }

  //adds Pulmonary Fontan and Glenn to Pulmonary for simplicity
  for(var i = 0 ; i < data.length; i++)
  {
    if(data[i]["Anatomy"].includes("Pulmonary"))
    {
      output["Pulmonary"] = output["Pulmonary"] + 1
    }
      output[data[i]["Anatomy"]] = output[data[i]["Anatomy"]] + 1;
  }

  var y = [];

  for(var t = 0; t < x.length; t++)
  {
      y.push(output[x[t]]);
  }

  return [x, y];
}

function diseaseChart()
{
  // chart for anatomy
  var id = "disease"
  var width = document.getElementById(id).offsetWidth;
  var abbs = setAbbreviations("Disease");

  var title = "Number of Models per Type of Disease";
  var downloadfilename = "VMR_Models_Per_Disease"

  
  var x = abbreviate(diseaseData[0], abbs, width, true);
  var longLabel = diseaseData[0];

  var y = diseaseData[1];

  generateBar(title, downloadfilename, x, longLabel, y, id, width);
}

function filterForDisease()
{
  var x = new Set();
  var allDisease = namesOfValuesPerKey("Disease");
  var children = getChildrenOfTree();

  for(var i = 0; i < parentArray.length; i++)
  {
    if(!children.includes(parentArray[i]))
    {
      x.add(parentArray[i])
    }
  }

  for(var i = 0; i < allDisease.length; i++)
  {
    if(!children.includes(allDisease[i]) && allDisease[i] != "Healthy")
    {
      x.add(allDisease[i])
    }
  }

  x = Array.from(x).sort();

  var output = [];

  for(var t = 0; t < x.length; t++)
  {
      output[x[t]] = 0;
  }

  //adds Pulmonary Fontan and Glenn to Pulmonary for simplicity
  for(var i = 0 ; i < data.length; i++)
  {
    if(children.includes(data[i]["Disease"]))
    {
      var parents = getParentsOfChild(data[i]["Disease"]);
      
      for (var p = 0; p < parents.length; p++)
      {
        if(!children.includes(parents[p]))
        {
          output[parents[p]]++;
        }
      }
      
    }
    else if(data[i]["Disease"] != "Healthy")
    {
      output[data[i]["Disease"]]++;
    }
  }

  var otherCategory = false;
  var keepX = [];

  // combine ones that are very small
  for(var t = 0; t < x.length; t++)
  {
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
      keepX.push(x[t])
    }
  }
  
  x = keepX;

  if(otherCategory)
  {
    x.push("Other");
  }

  var y = [];

  for(var t = 0; t < x.length; t++)
  {
      y.push(output[x[t]]);
  }

  return [x, y]
  
}

function sexChart()
{
  // chart for sex
  var id = "sex"
  var width = document.getElementById(id).offsetWidth;

  var title = "Number of Human Models Per Sex";
  var downloadfilename = "VMR_Models_Per_Sex"
  var x = sexData[0];
  var longLabel = sexData[0];
  var y = sexData[1];

  var unspecified = sexData[2];
  document.getElementById("unspecified").textContent = "Note: Information on the sex of " + unspecified + " human models is not avaliable"

  generateBar(title, downloadfilename, x, longLabel, y, id, width);
}

function filterForSex()
{
  var male = 0;
  var female = 0;
  var unspecified = 0;

  for(var i = 0; i < data.length; i++)
  {
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
      else
      {
        unspecified++;
      }
    }
  }

  return [["Male", "Female"], [male, female], unspecified];
}

function simulationChart()
{
  // chart for health
  var id = "simulation"
  var width = document.getElementById(id).offsetWidth;
  var abbs = [];
  abbs["With Results"] = "With";
  abbs["Without Results"] = "Without";

  var title = "Number of Models With and Without Simulation Results";
  var downloadfilename = "VMR_With_And_Without_Results"

  var x = abbreviate(simulationData[0], abbs, width);
  var longLabel = simulationData[0];
  var y = simulationData[1];

  generatePie(title, downloadfilename, x, longLabel, y, id, width);
}

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

  return [["With Results", "Without Results"], [withResults, withoutResults]];
}

// function methodChart()
// {
//   // chart for anatomy
//   var id = "method"
//   var width = document.getElementById(id).offsetWidth;
//   var abbs = setAbbreviations("Method");

//   var title = "Number of Result Types Per Simulation Method";
//   var downloadfilename = "VMR_Types_Per_Method";

//   if(typeAndMethodData.length == 0)
//   {
//     typeAndMethodData = filterForType();
//   }
  
//   var vtpData = typeAndMethodData[0];
//   var vtuData = typeAndMethodData[1];
//   var methodNames = abbreviate(typeAndMethodData[2], abbs, width);
//   var typeNames = ["VTP", "VTU"];

//   generateDoubleBar(title, downloadfilename, methodNames, typeNames, vtpData, vtuData, id, width);
// }

// function filterForType()
// {
//   //returns all possible simulation methods
//   var methodNames = resultsNamesOfValuesPerKey("Simulation Method");

//   var vtpData = new Array(methodNames.length);
//   var vtuData = new Array(methodNames.length);

//   for(var i = 0; i < methodNames.length; i++)
//   {
//     vtpData[i] = 0;
//     vtuData[i] = 0;
//   }

//   for(var i = 0; i < results.length; i++)
//   {
//     var index = methodNames.indexOf(results[i]["Simulation Method"]);
//     if(results[i]["Results File Type"] == "Surface (vtp)")
//     {
//       vtpData[index] = vtpData[index] + 1;
//     }
//     else if(results[i]["Results File Type"] == "Volume (vtu)")
//     {
//       vtuData[index] = vtuData[index] + 1;
//     }
//   }

//   return [vtpData, vtuData, methodNames]
// }

function abbreviate(x, abbs, width, early = false) {
  //changes x-axis labels to abbreviations if the width is small
  var meetWidth = width <= 767
  if(early)
  {
    meetWidth = true;
  }
  if(meetWidth)
  {
    var shortenedX = [];

    for(var i = 0; i < x.length; i++)
    {
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

function generateBoxPlot(titletext, downloadfilename, modedata, names, id, width)
{
  var data = [
    {
      name:"",
      x: modedata,
      type: 'box',
      marker: {
        color: '#3a596e',
        line: {
          width: 1.5
        }
      },
      boxpoints: "all",
      jitter: 0.3,
      pointpos: -1.8,
      orientation: "h",
      hoverlabel : {
        bgcolor: "#cee7f8",
        bordercolor: '#3a596e'
      },
      textposition: "none",
      text: names,
      hoverinfo: "text+x",
    }
  ];
 
  generateChart(titletext, downloadfilename, data, id, width);
}

function generatePie(titletext, downloadfilename, xdata, longLabel, ydata, id, width)
{
  var data = [
    {
      values: ydata,
      labels: xdata,
      type: 'pie',
      marker: {
        color: '#3a596e',
        line: {
            width: 2.5
        }
      },
      hoverlabel : {
        bgcolor: "#cee7f8",
        bordercolor: '#3a596e'
      },
      text: longLabel,
      hoverinfo: "text+value+percent",
      textinfo: "label+percent",
      textposition: "outside",
      hovertemplate:
        "<b> %{percent}</b> %{text} <br>" +
        " %{value} models <br>" +
        "<extra></extra>"
    }
  ];

  generateChart(titletext, downloadfilename, data, id, width);
}

function generateDoubleBar(titletext, downloadfilename, bottomNames, legendNames, data1, data2, id, width)
{
  var trace1 = {
    x: bottomNames,
    y: data1,
    name: legendNames[0],
    type: 'bar',
    marker: {
      color: '#3a596e',
      line: {
          width: 2.5
      }
    },
    hoverlabel : {
      bgcolor: "#cee7f8",
      bordercolor: '#3a596e'
    },
    textposition: "none",
    text: [legendNames[0], legendNames[0]],
    hovertemplate:
          "<b> %{y} </b>" +
          " %{x} %{text} <br>" +
          "<extra></extra>"
  };

  var trace2 = {
    x: bottomNames,
    y: data2,
    name: legendNames[1],
    type: 'bar',
    marker: {
      color: '#6195b8',
      line: {
          width: 2.5
      }
    },
    hoverlabel : {
      bgcolor: "#cee7f8",
      bordercolor: '#3a596e'
    },
    textposition: "none",
    text: [legendNames[1], legendNames[1]],
    hovertemplate:
          "<b> %{y} </b>" +
          " %{x} %{text} <br>" +
          "<extra></extra>"
  };

  var data = [trace1, trace2];

  generateChart(titletext, downloadfilename, data, id, width, true);
}

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
        bgcolor: "#cee7f8",
        bordercolor: '#3a596e'
      },
      textposition: "none",
      text: longLabel,
      hovertemplate:
            "<b> %{y:,.0f} </b>" +
            " %{text} <br>" +
            "<extra></extra>"
    }
  ];

  generateChart(titletext, downloadfilename, data, id, width);
}

function generateChart(titletext, downloadfilename, data, id, width, showLegend = false)
{
  var output = responsiveForSizing(titletext, width);
  
  var titlesize = output[0];
  var bodysize = output[1];
  var titletext_post = output[2];
  
  var layout = createLayout(titlesize, bodysize, titletext_post, showLegend);

  var config = {
    toImageButtonOptions: {
      format: 'png', // one of png, svg, jpeg, webp
      filename: downloadfilename,
      // height: 500,
      // width: 700,
      scale: 8 // Multiply title/legend/axis/canvas sizes by this factor
    },

    // responsive: true,

    displayModeBar: true,

    modeBarButtonsToRemove: ['zoom2d', "pan2d", "lasso2d", "select2d", "resetScale2d"],

    displaylogo: false
  }
  
  Plotly.newPlot(id, data, layout, config);
}

function createLayout(titlesize, bodysize, titletext_post, showLegend)
{
  if(showLegend)
  {
    return layout = {
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
  
      showlegend: true,
  
      modebar: {
        activecolor: "#6195b8"
      },
  
      margin: {
        pad: 15,
      }
    };
  }
  else
  {
    return layout = {
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
  
      showlegend: false,
  
      modebar: {
        activecolor: "#6195b8"
      },
  
      margin: {
        pad: 15,
      },

      colorway: ["#fdecee", "#d8b4c4", "#b39bb3",
      "#8a84a0", "#626e89", "#3a596e"]
    };
  }
}

function responsiveForSizing(title_pre, width)
{
  var titlesize;
  var bodysize;

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

function insertBreak(title){
  var array = title.split(" ");
  var spaceCount = array.length - 1;
  var half = parseInt(spaceCount/2 + 0.5);
  var title_post = "";

  for(var i = 0; i < array.length; i++)
  {
    title_post += array[i];
    if(i == half - 1)
    {
      title_post += "<br>";
    }
    else if(i != spaceCount)
    {
      title_post += " ";
    }
  }

  return title_post;
}