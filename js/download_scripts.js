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

function populate(files, element, dopush) {
  // var iso = new Isotope('#repository');
  let arrayFiles = Object.entries(files)
  let numFiles = arrayFiles.length
  for (var i = 0; i < numFiles; i++) {
    // then the file is in svprojects
    if (arrayFiles[i][1]['dim'] != null) {
      let newContent = generateContent(arrayFiles[i][0],
                                       arrayFiles[i][1])
      element.appendChild(newContent)
      // https://stackoverflow.com/questions/41959740/isotope-not-working-with-appended-html
      $('#repository').isotope('insert', newContent)
    }
  }
}

function generateContent(fileName, fileData) {

  let extDiv = document.createElement("div");
  extDiv.classList.add("col-xs-12")
  extDiv.classList.add("col-sm-4")
  extDiv.classList.add(fileData.class)
  extDiv.classList.add("content-ext-div")

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

let fileDimensions
let aortaFiles
let aortofemoralFiles
let cerebrovascularFiles
let congenitalFiles
let coronaryFiles
let pulmonaryFiles

// function populateFilters() {
//   let menu = document.getElementById("repository_content_area")
//
//   let extDiv = document.createElement('div')
//   extDiv.classList.add('repository_menu')
//   extDiv.id = "filters"
//
//   let menuUl = document.createElement('ul')
//
//   let li0 = document.createElement('li')
//   li.classList.add('active_prot_menu')
//   let a0 = document.createElement('a')
//   a0.href = '#repository_menu'
//   a0['data-filter'] = '*'
//   a0['text'] = 'All'
//   l0.appendChild(a0)
//
//   let li1 = document.createElement('li')
//   let a1 = document.createElement('a')
//   a1.href = '#repository_menu'
//   a1['data-filter'] = '.aorta'
//   a1['text'] = 'Aorta'
//   l1.appendChild(a1)
//
//   let li2 = document.createElement('li')
//   let a2 = document.createElement('a')
//   a2.href = '#repository_menu'
//   a2['data-filter'] = '.aortofemoral'
//   a2['text'] = 'Aortofemoral'
//   l2.appendChild(a2)
//
//   let li3 = document.createElement('li')
//   let a3 = document.createElement('a')
//   a3.href = '#repository_menu'
//   a3['data-filter'] = '.cerebrovascular'
//   a3['text'] = 'Cerebrovascular'
//   l3.appendChild(a3)
//
//   let li4 = document.createElement('li')
//   let a4 = document.createElement('a')
//   a4.href = '#repository_menu'
//   a4['data-filter'] = '.congenital_heart'
//   a4['text'] = 'Congenital'
//   l4.appendChild(a4)
//
//   let li5 = document.createElement('li')
//   let a5 = document.createElement('a')
//   a5.href = '#repository_menu'
//   a5['data-filter'] = '.coronary'
//   a5['text'] = 'Coronary'
//   l5.appendChild(a5)
//
//   let li6 = document.createElement('li')
//   let a6 = document.createElement('a')
//   a6.href = '#repository_menu'
//   a6['data-filter'] = '.pulmonary'
//   a6['text'] = 'Pulmonary'
//   l6.appendChild(a6)
//
//   menuUl.appendChild(l0)
//   menuUl.appendChild(l1)
//   menuUl.appendChild(l2)
//   menuUl.appendChild(l3)
//   menuUl.appendChild(l4)
//   menuUl.appendChild(l5)
//   menuUl.appendChild(l6)
//   extDiv.appendChild(menuUl)
//   menu.appendChild(extDiv)
// }

var content = []
$(window).ready(function() {
  console.log('running this')
  let repoWindow = document.getElementById("repository")

  $.get('repository_text/file_dimensions.txt', function(data) {
    fileDimensions = parseFileDimensions(data)

    $.get('repository_text/aorta.txt', function(data) {
       aortaFiles = parseFile(data, fileDimensions, 'aorta')
       populate(aortaFiles, repoWindow, true)
    }, 'text');

    let aortofemoralFiles
    $.get('repository_text/aortofemoral.txt', function(data) {
       aortofemoralFiles = parseFile(data, fileDimensions, 'aortofemoral')
       populate(aortofemoralFiles, repoWindow, false)
    }, 'text');

    let cerebrovascularFiles
    $.get('repository_text/cerebrovascular.txt', function(data) {
       cerebrovascularFiles = parseFile(data, fileDimensions, 'cerebrovascular')
       populate(cerebrovascularFiles, repoWindow, false)
    }, 'text');

    let congenitalFiles
    $.get('repository_text/congenital_heart.txt', function(data) {
       congenitalFiles = parseFile(data, fileDimensions, 'congenital_heart')
       populate(congenitalFiles, repoWindow, false)
    }, 'text');

    let coronaryFiles
    $.get('repository_text/coronary.txt', function(data) {
       coronaryFiles = parseFile(data, fileDimensions, 'coronary')
       populate(coronaryFiles, repoWindow, false)
    }, 'text');

    let pulmonaryFiles
    $.get('repository_text/pulmonary.txt', function(data) {
       pulmonaryFiles = parseFile(data, fileDimensions, 'pulmonary')
       populate(pulmonaryFiles, repoWindow, false)
    }, 'text');
  }, 'text');
});

// isotope menu
$(window).load(function() {
  $('.repository_menu ul li').click( function(){
  	$('.repository_menu ul li').removeClass('active_prot_menu');
  	$(this).addClass('active_prot_menu');
  });

  var $container = $('#repository');
  $container.isotope({
    itemSelector: '.col-sm-4',
    layoutMode: 'fitRows'
  });

  $('#filters').on( 'click', 'a', function() {
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
  var numModels = selectedModels.length
  if (numModels == 1) {
    $('#modal-greeting')[0].innerText = 'You have selected ' + selectedModels.length.toString() + ' model. Here are the details:'
  }
  else {
    $('#modal-greeting')[0].innerText = 'You have selected ' + selectedModels.length.toString() + ' models. Here are the details:'
  }

  var totalSize = 0
  var details = ''
  for (var i = 0; i < numModels; i++) {
    details = details + (i+1).toString()
    details = details + ': model '
    details = details + selectedModels[i]
    details = details + ', size = '
    details = details + fileDimensions[selectedModels[i]]
    details = details + ' Mb\n'
    totalSize = totalSize + parseInt(fileDimensions[selectedModels[i]])
  }
  $('.details-text')[0].value = details
  $('#modal-closure')[0].innerText = 'Total size = ' + totalSize.toString() + ' Mb'
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
