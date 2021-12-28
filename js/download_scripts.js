let selectedModels = []
let selectionColor = '#4caf50'
let downlaodButtonActivated = false

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

function populate(files, element) {
  console.log('running this')
  let arrayFiles = Object.entries(files)
  let numFiles = arrayFiles.length
  for (var i = 0; i < numFiles; i++) {
    // then the file is in svprojects
    if (arrayFiles[i][1]['dim'] != null) {
      element.appendChild(generateContent(arrayFiles[i][0], arrayFiles[i][1]))
    }
  }
}

function generateContent(fileName, fileData) {
  let extDiv = document.createElement("div");
  extDiv.classList.add("col-xs-12")
  extDiv.classList.add("col-sm-4")
  extDiv.classList.add(fileData.class)

  let innerDiv = document.createElement("div");
  innerDiv.classList.add("repository_single_content")
  innerDiv.id = fileName

  let innerImg = document.createElement("img");
  innerImg.src = fileData.image
  innerImg.alt = fileName

  let innerInnerDiv = document.createElement("div")

  let innerA = document.createElement("a");
  innerA.id = fileName
  innerA.text = fileName

  innerInnerDiv.appendChild(innerA)
  innerDiv.appendChild(innerImg)
  innerDiv.appendChild(innerInnerDiv)
  extDiv.appendChild(innerDiv)

  return extDiv
}

$(window).ready(function() {
  let repoWindow = document.getElementById("repository")

  let fileDimensions;
  $.get('repository_text/file_dimensions.txt', function(data) {
    fileDimensions = parseFileDimensions(data)
  }, 'text');

  let aortaFiles
  $.get('repository_text/aorta.txt', function(data) {
     console.log('running aorta')
     aortaFiles = parseFile(data, fileDimensions, 'aorta')
     populate(aortaFiles, repoWindow)
  }, 'text');

  let aortofemoralFiles
  $.get('repository_text/aortofemoral.txt', function(data) {
     aortofemoralFiles = parseFile(data, fileDimensions, 'aortofemoral')
     populate(aortofemoralFiles, repoWindow)
  }, 'text');

  let cerebrovascularFiles
  $.get('repository_text/cerebrovascular.txt', function(data) {
     cerebrovascularFiles = parseFile(data, fileDimensions, 'cerebrovascular')
     populate(cerebrovascularFiles, repoWindow)
  }, 'text');

  let congenitalFiles
  $.get('repository_text/congenital_heart.txt', function(data) {
     congenitalFiles = parseFile(data, fileDimensions, 'congenital_heart')
     populate(congenitalFiles, repoWindow)
  }, 'text');

  let coronaryFiles
  $.get('repository_text/coronary.txt', function(data) {
     coronaryFiles = parseFile(data, fileDimensions, 'coronary')
     populate(coronaryFiles, repoWindow)
  }, 'text');

  let pulmonaryFiles
  $.get('repository_text/pulmonary.txt', function(data) {
     pulmonaryFiles = parseFile(data, fileDimensions, 'pulmonary')
     populate(pulmonaryFiles, repoWindow)
  }, 'text');
});

// isotope menu
$(window).load(function() {
  $(document).on('click', '.repository_menu ul li', function(){
    $('.repository_menu ul li').removeClass('active_prot_menu');
    $(this).addClass('active_prot_menu');
  });

  var $container = $('#repository');
  $container.isotope({
    itemSelector: '.col-sm-4',
    layoutMode: 'fitRows'
  });

  $('#filters').on('click', 'a', function() {
    var filterValue = $(this).attr('data-filter');
    $container.isotope({ filter: filterValue });
    return false;
  });

  $(document).on('click', '.repository_single_content', function() {
    let contentStyle = getComputedStyle($(this)[0])
    let backcolor = hexc(contentStyle['background-color'])

    if (backcolor != selectionColor) {
     selectModel($(this)[0])
    }
    else {
     deselectModel($(this)[0])
    }
  });

  $(document).on('click', '#select-btn', function() {
    let visibleElements = $('.repository_single_content:visible')
    var arrayLength = visibleElements.length;

    for (var i = 0; i < arrayLength; i++) {
      selectModel(visibleElements[i])
    }
  });

  $(document).on('click', '#deselect-btn', function() {
    let visibleElements = $('.repository_single_content:visible')
    var arrayLength = visibleElements.length;

    for (var i = 0; i < arrayLength; i++) {
      deselectModel(visibleElements[i])
    }
  });

});

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
