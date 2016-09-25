$(document).ready(function() {
    var height = $(window).height() - $(".navbar").height() - $("footer").height();
    $("#map").height(height);
    $("#map").css("padding-top", $(".navbar").height());
});

$(window).on('resize', function() {
    var height = $(window).height() - $(".navbar").height() * 2 - $("footer").height();
    $("#map").height(height);
    $("#map").css("padding-top", $(".navbar").height());
});

function initMap() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: {lat: 40.4237095, lng: -86.9233833}
    });
    directionsDisplay.setMap(map);

    var onChangeHandler = function() {
        calculateAndDisplayRoute(directionsService, directionsDisplay);
    };
    document.getElementById('start').addEventListener('change', onChangeHandler);
    document.getElementById('end').addEventListener('change', onChangeHandler);
  }

  function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    directionsService.route({
        origin: document.getElementById('start').value,
        destination: document.getElementById('end').value,
        travelMode: 'DRIVING'
    }, function(response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}
