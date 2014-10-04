var map;
var originLat, originLng, destLat, destLng;
var originSet = false;
var destSet = false
function initialize() {
  var mapOptions = {
    center: { lat: 37.772807, lng: -122.41353},
    zoom: 13
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  google.maps.event.addListener(map, 'click', function(event) {
    marker = new google.maps.Marker({position: event.latLng, map: map});
    lat = marker.getPosition().lat();
    lng = marker.getPosition().lng();
    if(originSet == false) {
      assignOrigin(lat, lng);
    }
    else if(destSet == false) {
      assignDest(lat, lng);
      $.post(
        "/get_passing_neighborhoods",
        {
          originLat: originLat,
          originLng: originLng,
          destLat: destLat,
          destLng: destLng
        }, function(data) {
          $('#loading').remove();
          alert(data);
        }
      );
      $('#header').prepend("<h4>Loading...</h4>")
    }
    //  both are assigned
    else {
      // assignOrigin(destLat, destLng);
      // assignDest(lat, lng);
    }
  });
}

function assignOrigin(lat, lng) {
  originLat = lat;
  originLng = lng;
  originSet = true;
}

function assignDest(lat, lng) {
  destLat = lat;
  destLng = lng;
  destSet = true;
}
google.maps.event.addDomListener(window, 'load', initialize);