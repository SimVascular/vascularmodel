$(document).ready(function($){
    //reads csv file and sets it to the global variable data
    $.ajax({
      type: "GET",
      url: "dataset/dataset-svprojects.csv",
      dataType: "text",
      async: false,
      success: function(fdata) {
        data = $.csv.toObjects(fdata);
      }
    });

    $.ajax({
      type: "GET",
      url: "dataset/dataset-abbreviations.csv",
      dataType: "text",
      async: false,
      success: function(fdata) {
        abbreviations = $.csv.toObjects(fdata);
      }
    });

    $.ajax({
      type: "GET",
      url: "dataset/dataset-diseaseTree.csv",
      dataType: "text",
      async: false,
      success: function(fdata) {
        tree = $.csv.toObjects(fdata);
        parentArray = Object.keys(tree[0]);
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
var ageData = [];
var anatomyData = [];
var diseaseData = [];

function createCharts() {
  healthChart();
  ageChart();
  
  anatomyChart();
  diseaseChart();

  // simulation results chart + surface vs volume
  // simulation method
}

function healthChart()
{
  // chart for health
  var id = "health"
  var width = document.getElementById(id).offsetWidth;

  if(healthData.length == 0)
  {
    //only filters and defines anatomyData once
    healthData = filterForHealth();
  }

  var title = "Number of Healthy and Diseased Models";
  var x = healthData[0];
  var longLabel = healthData[0];
  var y = healthData[1];

  generateBar(title, x, longLabel, y, id, width);
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

  if(ageData.length == 0)
  {
    //only filters and defines ageData once
    ageData = filterForAge();
  }

  var title = "Distribution of Age in Years";
  var modedata = ageData;

  generateBoxPlot(title, modedata, id, width);
}

function filterForAge()
{
  var modedata = new Array(data.length);

  for(var i = 0 ; i < data.length; i++)
  {
    modedata[i] = data[i]["Age"];
  }

  return modedata;
}

function anatomyChart()
{
  // chart for anatomy
  var id = "anatomy"
  var width = document.getElementById(id).offsetWidth;
  var abbs = setAbbreviations("Anatomy");

  if(anatomyData.length == 0)
  {
    //only filters and defines anatomyData once
    anatomyData = filterForAnatomy();
  }

  var title = "Number of Models per Type of Anatomy";
  var x = abbreviate(anatomyData[0], abbs, width);
  var longLabel = anatomyData[0];
  var y = anatomyData[1];

  generateBar(title, x, longLabel, y, id, width);
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

  if(diseaseData.length == 0)
  {
    //only filters and defines diseaseData once
    diseaseData = filterForDisease();
  }

  var title = "Number of Models per Type of Disease";
  
  var x = abbreviate(diseaseData[0], abbs, width, true);
  var longLabel = diseaseData[0];

  var y = diseaseData[1];

  generateBar(title, x, longLabel, y, id, width);
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

function generateBoxPlot(titletext, modedata, id, width)
{
  var data = [
    {
      name: "",
      x: modedata,
      type: 'box',
      marker: {
        color: '#6195b8',
        line: {
          width: 1.5
        }
      },
      boxpoints: "all",
      hoverinfo: "x",
      orientation: "h",
      hoverlabel : {
        bgcolor: "#cee7f8",
        bordercolor: '#3a596e'
      }
    }
  ];
 
  generateChart(titletext, data, id, width);
}

function generateBar(titletext, xdata, longLabel, ydata, id, width) {
  var data = [
    {
      x: xdata,
      y: ydata,
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
      text: longLabel,
      hovertemplate:
            "<b> %{y:,.0f} </b>" +
            " %{text} <br>" +
            "<extra></extra>"
    }
  ];

  generateChart(titletext, data, id, width);
}

function generateChart(titletext, data, id, width)
{
  var output = responsiveForSizing(titletext, width);
  
  var titlesize = output[0];
  var bodysize = output[1];
  var titletext_post = output[2];

  var layout = {
    title: {
      text: titletext_post,
      font: {
        size: titlesize
      },
    },

    xaxis: {
      zeroline: true
    },

    yaxis: {
      // zeroline: false,
    },

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
    }
  };

  var config = {
    toImageButtonOptions: {
      format: 'png', // one of png, svg, jpeg, webp
      filename: 'ModelsPerAnatomy',
      height: 500,
      width: 700,
      scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
    },

    // responsive: true,

    displayModeBar: true,

    modeBarButtonsToRemove: ['zoom2d', "pan2d", "lasso2d", "select2d", "resetScale2d"],

    displaylogo: false
  }
  
  Plotly.newPlot(id, data, layout, config);
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
    var titlesize = 25;
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