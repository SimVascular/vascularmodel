jQuery.fn.download_model = function(model_id) {
  window.open('svprojects/' + model_id + '.zip')
}

$("button").click( function() {
 var id = $(this).attr('id');
 console.log(id);
 gtag('event', 'download_' + id.toString(), {
     'send_to': 'G-SRE0G5Y7Y5',
     'event_category': 'Model download',
     'event_label': 'test',
     'value': '1'
 });
});
