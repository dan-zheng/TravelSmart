$(document).ready(function() {
    $('#fullpage').fullpage({
        anchors: ['start', 'app'],
        paddingTop: '64px',
        paddingBottom: '42px',
    });
    var pad = 10;
    var pad2 = 20;
    var height = $(window).height() - $(".navbar").height() - $("footer").height() - pad2;
    console.log($('#info').height());
    $("#map").height(height);
    $("#data").height(height - $('#info').height() - pad2);
});

$(window).on('resize', function() {
    var pad = 10;
    var pad2 = 20;
    var height = $(window).height() - $(".navbar").height() - $("footer").height() - pad2;
    $("#map").height(height);
    $("#data").height(height - $('#info').height() - pad2);
});

$('#myModal').on('shown.bs.modal', function() {
    $('#myInput').focus();
});

$('#go-to-app').on('click', function() {
    $.fn.fullpage.moveTo('app');
})

function initMap() {
    var origin_place_id = null;
    var destination_place_id = null;
    var travel_mode = 'WALKING';
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: {
            lat: 40.4237095,
            lng: -86.9233833
        },
        scrollwheel: false
    });
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    directionsDisplay.setMap(map);

    var geocoder = new google.maps.Geocoder;

    var origin_input = document.getElementById('origin-input');
    var destination_input = document.getElementById('destination-input');
    var modes = document.getElementById('mode-selector');

    var inputs = document.getElementById('inputs');

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputs);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(modes);

    var origin_autocomplete = new google.maps.places.Autocomplete(origin_input);
    origin_autocomplete.bindTo('bounds', map);
    var destination_autocomplete = new google.maps.places.Autocomplete(destination_input);
    destination_autocomplete.bindTo('bounds', map);

    // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.
    function setupClickListener(id, mode) {
        var radioButton = document.getElementById(id);
        radioButton.addEventListener('click', function() {
            travel_mode = mode;
        });
    }

    function expandViewportToFitPlace(map, place) {
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);
        }
    }

    origin_autocomplete.addListener('place_changed', function() {
        var place = origin_autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }
        expandViewportToFitPlace(map, place);
        geocodeAddress(place.formatted_address);

        // If the place has a geometry, store its place ID and route if we have
        // the other place ID
        origin_place_id = place.place_id;
        route(origin_place_id, destination_place_id, travel_mode,
            directionsService, directionsDisplay);
    });

    destination_autocomplete.addListener('place_changed', function() {
        var place = destination_autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }
        expandViewportToFitPlace(map, place);
        geocodeAddress(place.formatted_address);

        // If the place has a geometry, store its place ID and route if we have
        // the other place ID
        destination_place_id = place.place_id;
        route(origin_place_id, destination_place_id, travel_mode,
            directionsService, directionsDisplay);
    });

    document.getElementById('mode').addEventListener('change', function() {
        travel_mode = document.getElementById('mode').value;
        route(origin_place_id, destination_place_id, travel_mode,
            directionsService, directionsDisplay);
    });

    function route(origin_place_id, destination_place_id, travel_mode,
        directionsService, directionsDisplay) {
        if (!origin_place_id || !destination_place_id) {
            return;
        }

        directionsService.route({
            origin: {
                'placeId': origin_place_id
            },
            destination: {
                'placeId': destination_place_id
            },
            travelMode: travel_mode
        }, function(response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }

    function geocodeAddress(address) {
        geocoder.geocode({
            'address': address
        }, function(results, status) {
            if (status == 'OK') {
                /*map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });*/
                console.log(results[0].geometry.location.lat() + "," + results[0].geometry.location.lng());
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    $('.controls').show();
}
