// retrieving repository info
function parseFileDimensions(data) {
  let dimensionDict = {}
  let models = data.split(/\r?\n/)
  let numModels = models.length
  for (var i = 0; i < numModels; ++i) {
    if (models[i] != null && models[i].length > 0) {
      if (models[i][0] != '#') {
        let model = models[i].split(/\t/)
        dimensionDict[model[1].replace('.zip','')] = model[0].replace('M','');
      }
    }
  }
  return dimensionDict
}

$.get('repository_text/file_dimensions.txt', function(data) {
  fileDimensions = parseFileDimensions(data)
}, 'text');

function parseFile(data, fDimensions, fileClass) {
  let modelDict = {}
  let models = data.split(/\r?\n/)
  let numModels = models.length
  for (var i = 0; i < numModels; ++i) {
    if (models[i] != null && models[i].length > 0) {
      if (models[i][0] != '#') {
        fileData = {path: 'svprojects/' + models[i] + '.zip',
                    dim: fDimensions[models[i]],
                    image: 'repository_img/' + models[i] + '.png',
                    class: fileClass}
        modelDict[models[i]] = fileData
      }
    }
  }
  return modelDict
}

$.get('repository_text/aorta.txt', function(data) {
   aortaFiles = parseFile(data, fileDimensions, 'aorta')
}, 'text');

$.get('repository_text/aortofemoral.txt', function(data) {
   aortofemoralFiles = parseFile(data, fileDimensions, 'aortofemoral')
}, 'text');

$.get('repository_text/cerebrovascular.txt', function(data) {
   cerebrovascularFiles = parseFile(data, fileDimensions, 'cerebrovascular')
}, 'text');

$.get('repository_text/congenital_heart.txt', function(data) {
   congenitalFiles = parseFile(data, fileDimensions, 'congenital_heart')
}, 'text');

$.get('repository_text/coronary.txt', function(data) {
   coronaryFiles = parseFile(data, fileDimensions, 'coronary')
}, 'text');

$.get('repository_text/pulmonary.txt', function(data) {
   pulmonaryFiles = parseFile(data, fileDimensions, 'pulmonary')
}, 'text');


// populating window
let repoWindow = document.getElementById("repository")

function generateContent(fileData) {
  let extDiv = document.createElement("div");
  extDiv.classList.add("col-xs-12")
  extDiv.classList.add("col-sm-4")
  extDiv.classList.add(fileData.class)

  let innerDiv = document.createElement("div");
  innerDiv.classList.add("repository_single_content")
  innerDiv.id = fileData
}

function populate(files, element) {
  let numFiles = files.length
  for (const [key, value] of Object.entries(numFiles)) {
    console.log(key);
    console.log(value);
  }
  // for (var i = 0; i < numFiles; i++) {
  //   if (files[i]['dim'] != null) {
  //     element.appendChild(generateContent(files[i]));
  //   }
  // }
}

populate(aortaFiles, repoWindow)

// selecting models

let selectedModels = []
let selectionColor = '#4caf50'
let downlaodButtonActivated = false

function hexc(colorval) {
  var parts = colorval.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  delete(parts[0]);
  for (var i = 1; i <= 3; ++i) {
    parts[i] = parseInt(parts[i]).toString(16);
    if (parts[i].length == 1) parts[i] = '0' + parts[i];
  }
  color = '#' + parts.join('');
  return color
}

$(".download-button").click( function() {
  updateModalDialog()
});

function updateNumSelectedModels() {
  document.getElementById("numSelectedModels").innerHTML = selectedModels.length.toString();
}

function updateModalDialog() {
  if (selectedModels.length == 1) {
    $('#modal-greeting')[0].innerText = 'You have selected ' + selectedModels.length.toString() + ' model'
  }
  else {
    $('#modal-greeting')[0].innerText = 'You have selected ' + selectedModels.length.toString() + ' models'
  }
}

function activateDownloadButton() {
  downlaodButtonActivated = true
  $('.download-button')[0].style.background = selectionColor
  $('.download-button')[0].style.cursor = 'pointer'
}

function deactivateDownloadButton() {
  downlaodButtonActivated = false
  $('.download-button')[0].style.background = '#b5b5b5'
  $('.download-button')[0].style.cursor = 'default'
}

function selectModel(element) {
  let id = element.getAttribute('id')
  element.style.background = selectionColor
  if (!selectedModels.includes(id)) {
    selectedModels.push(id)
  }
  activateDownloadButton()
  updateNumSelectedModels()
}

function deselectModel(element) {
  let id = element.getAttribute('id')
  element.style.background = '#05080b'
  selectedModels = selectedModels.filter(function(value, index, arr){
       return value != id;
   });
   if (selectedModels.length == 0)
   {
     deactivateDownloadButton()
   }
   updateNumSelectedModels()
}

$('.repository_single_content').click( function() {
  let contentStyle = getComputedStyle($(this)[0])
  let backcolor = hexc(contentStyle['background-color'])

  if (backcolor != selectionColor) {
   selectModel($(this)[0])
  }
  else {
   deselectModel($(this)[0])
  }
});

$( "#select-btn" ).click(function() {
  let visibleElements = $('.repository_single_content:visible')
  var arrayLength = visibleElements.length;

  for (var i = 0; i < arrayLength; i++) {
    selectModel(visibleElements[i])
  }
});

$( "#deselect-btn" ).click(function() {
  let visibleElements = $('.repository_single_content:visible')
  var arrayLength = visibleElements.length;

  for (var i = 0; i < arrayLength; i++) {
    deselectModel(visibleElements[i])
  }
});
