var map;
var originLat, originLng, destLat, destLng;
var originSet = false;
var destSet = false;
var markers = [];
var polyline;
function initialize() {
  var mapOptions = {
    center: { lat: 37.772807, lng: -122.41353},
    zoom: 13
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
  google.maps.event.addListener(map, 'click', function(event) {
    handleClick(event);
  });
}

function handleClick(event) {
  marker = new google.maps.Marker({position: event.latLng, map: map});
    markers.push(marker);
    lat = marker.getPosition().lat();
    lng = marker.getPosition().lng();
    if(originSet == false) {
      assignOrigin(lat, lng);
    }
    else if(destSet == false) {
      assignDest(lat, lng);
      polyline = new google.maps.Polyline({
        path: [
          new google.maps.LatLng(originLat, originLng),
          new google.maps.LatLng(destLat, destLng)
        ],
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      polyline.setMap(map);

      $.post(
        "/get_passing_neighborhoods",
        {
          originLat: originLat,
          originLng: originLng,
          destLat: destLat,
          destLng: destLng
        }, function(data) {
          $('#loading').remove();
          neighborhoods = $.parseJSON(data)
          html = "<ul>";
          for(var i=0; i<neighborhoods.length; ++i) {
            html += "<li>" + neighborhoods[i] + "</li>";
          }
          html += "</ul>";
          $('#result-panel').html(html);
        }
      );
      $('#result-panel').html("<h4 id='loading'>Loading...</h4>")
    }
    //  both are assigned
    else {
      clearMarkers();
      clearPolyline();
      originSet = false;
      destSet = false;
      handleClick(event);
      // assignOrigin(destLat, destLng);
      // assignDest(lat, lng);
    }
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function clearPolyline() {
  polyline.setMap(null);
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