function loadXML(filePath) {
  var result = null
  var xmlhttp = new XMLHttpRequest()
  xmlhttp.open("GET", filePath, true)
  xmlhttp.send()
  return xmlhttp
}

function readTXT(xmlHttpFile) {
  var result = null
  if (xmlHttpFile.status == 200) {
    result = xmlHttpFile.responseText
  }
  return result
}

let selectedModels = []
let selectionColor = '#4caf50'
let downlaodButtonActivated = false
let xmlhttp = loadXML('repository_text/aorta.txt')
console.log(readTXT(xmlhttp))
// console.log(loadFile('repository_text/aorta.txt'))

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
