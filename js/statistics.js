var parentArray = [];

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

function createCharts() {
  var width = document.documentElement.clientWidth;

  var abbs = setAbbreviations("Anatomy");
  var anatomyData = filterForAnatomy(data, abbs, width);
  var title = "Number of Models per Type of Anatomy"
  var x = anatomyData[0];
  var y = anatomyData[1];

  generateChart(title, x, y, "anatomy", width);
}

function filterForAnatomy(data, abbs, width) {
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
  
  //changes x-axis labels to abbreviations if the width is small
  if(width <= 825)
  {
    for(var i = 0; i < x.length; i++)
    {
      x[i] = abbs[x[i]]
    }
  }
  
  return [x, y];
}

function generateChart(titletext, xdata, ydata, id, width) {
  var output = responsiveForSizing(titletext, width);
  var titlesize = output[0];
  var bodysize = output[1];
  var titletext_post = output[2]; 
   
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
        }
        }
      ];

    var layout = {
      title: {
        text: titletext_post,
        font: {
          size: titlesize
        },
      },

      font: {
        // dark2
        color: "#3a596e",
        family: ["Poppins", "sans-serif"],
        size: bodysize
      },

      // showlegend: false,

      modebar: {
        activecolor: "#6195b8"
      },

      margin: {
        pad: 15
      },
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

      // -'2D', zoom2d, pan2d, select2d, lasso2d, zoomIn2d, zoomOut2d, autoScale2d, resetScale2d
      // -'3D', zoom3d, pan3d, orbitRotation, tableRotation, handleDrag3d, resetCameraDefault3d, resetCameraLastSave3d, hoverClosest3d
      // -'Cartesian', hoverClosestCartesian, hoverCompareCartesian
      // -'Geo', zoomInGeo, zoomOutGeo, resetGeo, hoverClosestGeo
      // -'Other', hoverClosestGl2d, hoverClosestPie, toggleHover, resetViews, toImage, sendDataToCloud, toggleSpikelines, resetViewMapbox

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
  var half = parseInt(spaceCount/2);
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