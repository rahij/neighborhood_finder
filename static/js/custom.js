var map;
var originLat, originLng, destLat, destLng;
var originSet = false;
var destSet = false;
var markers = [];
var polyline;
var polygons = [];
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
      drawPolyline();
      $.post(
        "/get_passing_neighborhoods",
        {
          originLat: originLat,
          originLng: originLng,
          destLat: destLat,
          destLng: destLng
        }, function(data) {
          $('#loading').remove();
          $('#result-panel').html(format_neighborhoods(data));
        }
      );
      $('#result-panel').html("<h4 id='loading'>Loading...</h4>")
    }

    //  both are assigned
    else {
      clearMarkers();
      clearPolyline();
      clearPolygons();
      originSet = false;
      destSet = false;
      handleClick(event);
    }
}

function drawBoundaries(boundary_list) {
  var boundaryCoords = [];

  for(var i=0; i < boundary_list.length; ++i) {
    boundaryCoords.push(new google.maps.LatLng(boundary_list[i][1], boundary_list[i][0]));
  }

  // Construct the polygon.
  polygon = new google.maps.Polygon({
    paths: boundaryCoords,
    strokeColor: '#000000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35
  });

  polygon.setMap(map);
  polygons.push(polygon);
}

function format_neighborhoods(data) {
  neighborhoods = $.parseJSON(data)

  html = "<ul>";
  for(var i=0; i<neighborhoods.length; ++i) {
    html += "<li>" + neighborhoods[i][1] + "</li>";
    drawBoundaries(neighborhoods[i][0]);
  }
  html += "</ul>";
  return html;
}

function drawPolyline() {
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
}

function clearPolygons() {
  for (var i = 0; i < polygons.length; i++) {
    polygons[i].setMap(null);
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