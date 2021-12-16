 $("a").click( function() {
  var id = $(this).attr('id');
  console.log(id);
  gtag('event', id, {
      'send_to': 'G-SRE0G5Y7Y5',
      'event_category': 'Model download',
      'event_label': 'test',
      'value': '1'
  });
 });
