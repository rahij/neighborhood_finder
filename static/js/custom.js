$('document').ready(function(){
  google.maps.event.addListener(map, 'click', function(event) {
    marker = new google.maps.Marker({position: event.latLng, map: map});
  });
})