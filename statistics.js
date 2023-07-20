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
    
    var anatomyData = filterForAnatomy(data);
    var x = anatomyData[0];
    var y = anatomyData[1]
    generateChart(x, y);
});

function filterForAnatomy(data) {
    var titles = namesOfValuesPerKey("Anatomy");
    var output = [];

    for(var t = 0; t < titles.length; t++)
    {
        output[titles[t]] = 0;
    }


    for(var i = 0 ; i < data.length; i++)
    {
        output[data[i]["Anatomy"]] = output[data[i]["Anatomy"]] + 1;
    }

    var y = [];

    for(var t = 0; t < titles.length; t++)
    {
        y.push(output[titles[t]]);
    }
    
    return [titles, y];
}

function generateChart(xdata, ydata) {
    var data = [
        {
          x: xdata,
          y: ydata,
          type: 'bar'
        }
      ];
      
      Plotly.newPlot('myDiv', data);
}
