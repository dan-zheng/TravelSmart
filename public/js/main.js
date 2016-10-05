var test;
var test2;
var test3;

var origin_prcp_data;
var dest_prcp_data;

var origin_weather_data;
var dest_weather_data;
var origin_temp = [];
var dest_temp = [];

var wunderground_key = "3510f4f7049cf703";
tokenHeader = [];
tokenHeader.push({
    key: 'token',
    value: 'QRWRVTBiNZNtlQSCkvELsaXCoLGAHRKm'
});

$(document).ready(function() {
    $('#fullpage').fullpage({
        anchors: ['start', 'app'],
        paddingTop: '64px',
        paddingBottom: '42px',
    });
    var pad = 20;
    var height = $(window).height() - $(".navbar").height() - $("footer").height() - pad;
    $("#map").height(height);
    $("#data").height(height - $('#info').height() - pad);

    $("#data").tabs();
});

$(window).on('resize', function() {
    var pad = 20;
    var height = $(window).height() - $(".navbar").height() - $("footer").height() - pad;
    $("#map").height(height);
    $("#data").height(height - $('#info').height() - pad);
});

$('#myModal').on('shown.bs.modal', function() {
    $('#myInput').focus();
});

$('#go-to-app').on('click', function() {
    $.fn.fullpage.moveTo('app');
});

function initMap() {
    var origin_place_id = null;
    var destination_place_id = null;
    var origin_postal_code = null;
    var dest_postal_code = null;
    var travel_mode = 'WALKING';
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: {
            lat: 40.4237095,
            lng: -86.9233833
        },
        scrollwheel: false
    });
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(map);

    var geocoder = new google.maps.Geocoder();

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
        console.log(place);
        geocodeAddress(place.formatted_address, 'origin');

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
        geocodeAddress(place.formatted_address, 'destination');

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

    function geocodeAddress(address, type) {
        geocoder.geocode({
            'address': address
        }, function(results, status) {
            if (status == 'OK') {
                console.log(results[0].geometry.location.lat() + "," + results[0].geometry.location.lng());
                var latlng = {
                    lat: parseFloat(results[0].geometry.location.lat()),
                    lng: parseFloat(results[0].geometry.location.lng())
                };
                geocoder.geocode({
                    'location': latlng
                }, function(results, status) {
                    if (status === 'OK') {
                        if (results[0]) {
                            var temp = results[0].address_components;
                            for (var c = 0; c < temp.length; c++) {
                                if (temp[c].types[0] == 'postal_code') {
                                    var postal_code = temp[c].short_name;
                                    //console.log(postal_code);
                                    if (type == 'origin') {
                                        origin_postal_code = postal_code;
                                        test = origin_postal_code;
                                        //prcpInfoOrigin();
                                        weatherOrigin();
                                    } else if (type == 'destination') {
                                        dest_postal_code = postal_code;
                                        test2 = dest_postal_code;
                                        //prcpInfoDest();
                                        weatherDest();
                                    }
                                }
                            }
                        } else {
                            window.alert('No results found');
                        }
                    } else {
                        window.alert('Geocoder failed due to: ' + status);
                    }
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    function weatherOrigin() {
        var url;
        if (origin_postal_code) {
            url = "http://api.wunderground.com/api/" + wunderground_key + "/forecast10day/q/" + origin_postal_code + ".json";
            httpGetAsync(url, null, function(data) {
                origin_weather_data = JSON.parse(data).forecast.simpleforecast.forecastday;
                for (var i = 0; i < origin_weather_data.length; i++) {
                    origin_temp.push({
                        low: origin_weather_data[i].low.fahrenheit,
                        high: origin_weather_data[i].high.fahrenheit
                    });
                }
                console.log(origin_temp);
                $('#orig-weather').html(JSON.stringify(origin_temp));
                //console.log(origin_weather_data);
            });
        }
    }

    function weatherDest() {
        var url;
        if (dest_postal_code) {
            url = "http://api.wunderground.com/api/" + wunderground_key + "/forecast10day/q/" + dest_postal_code + ".json";
            httpGetAsync(url, null, function(data) {
                dest_weather_data = JSON.parse(data).forecast.simpleforecast.forecastday;
                for (var i = 0; i < dest_weather_data.length; i++) {
                    dest_temp.push({
                        low: dest_weather_data[i].low.fahrenheit,
                        high: dest_weather_data[i].high.fahrenheit
                    });
                }
                $('#dest-weather').html(JSON.stringify(dest_temp));
                //console.log(dest_weather_data);
            });
        }
    }

    function prcpInfoOrigin() {
        var dateToday, dateLastWeek, url;
        if (origin_postal_code) {
            console.log("origin: " + origin_postal_code);
            dateToday = moment().format('YYYY-MM-DD');
            dateLastWeek = moment().subtract(7, 'days').format('YYYY-MM-DD');
            console.log(dateToday + ", " + dateLastWeek);
            url = "http://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&datatypeid=PRCP&locationid=ZIP:" + origin_postal_code + "&startdate=" + dateLastWeek + "&enddate=" + dateToday + "&limit=5&sortfield=date&sortorder=desc&includemetadata=false";

            httpGetAsync(url, tokenHeader, function(data) {
                origin_prcp_data = JSON.parse(data);
                console.log(origin_prcp_data);
            });
        } else {
            console.log("origin fail");
        }
    }

    function prcpInfoDest() {
        var dateToday, dateLastWeek, url;
        if (dest_postal_code) {
            console.log("dest: " + dest_postal_code);
            dateToday = moment().format('YYYY-MM-DD');
            dateLastWeek = moment().subtract(7, 'days').format('YYYY-MM-DD');
            console.log(dateToday + ", " + dateLastWeek);
            url = "http://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&datatypeid=PRCP&locationid=ZIP:" + dest_postal_code + "&startdate=" + dateLastWeek + "&enddate=" + dateToday + "&limit=5&sortfield=date&sortorder=desc&includemetadata=false";
            tokenHeader = [];
            tokenHeader.push({
                key: 'token',
                value: 'QRWRVTBiNZNtlQSCkvELsaXCoLGAHRKm'
            });
            httpGetAsync(url, tokenHeader, function(data) {
                dest_prcp_data = JSON.parse(data);
                console.log(dest_prcp_data);
            });
        } else {
            console.log("dest fail");
        }
    }

    function httpGetAsync(url, headers, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                //console.log("YEP: " + url);
                callback(xmlHttp.responseText);
            } else {
                //console.log("NOPE: " + url);
            }
        };
        xmlHttp.open("GET", url, true); // true for asynchronous
        if (headers) {
            console.log(headers);
            for (var i = 0; i < headers.length; i++) {
                console.log("header " + i);
                xmlHttp.setRequestHeader(headers[i].key, headers[i].value);
            }
        }
        xmlHttp.send(null);
    }

    $('.controls').show();
}

var HttpClient = function() {
    this.get = function(url, headers, callback) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(xmlHttp.responseText);
        };
        xmlHttp.open("GET", url, true); // true for asynchronous
        if (headers) {
            for (var i = 0; i < headers.length; i++) {
                xmlHttp.setRequestHeader(headers[i].key, headers[i].value);
            }
        }
        xmlHttp.send(null);
    };
};
/*
function httpGetAsync(url, headers, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    };
    xmlHttp.open("GET", url, true); // true for asynchronous
    if (headers) {
        console.log(headers);
        for (var i = 0; i < headers.length; i++) {
            console.log("header " + i);
            xmlHttp.setRequestHeader(headers[i].key, headers[i].value);
        }
    }
    xmlHttp.send(null);
}*/

origin_postal_code = "47907";
dest_postal_code = "47304";

function testOrigin() {
    if (origin_postal_code) {
        console.log("origin: " + origin_postal_code);
        dateToday = moment().format('YYYY-MM-DD');
        dateLastWeek = moment().subtract(7, 'days').format('YYYY-MM-DD');
        console.log(dateToday + ", " + dateLastWeek);
        url = "http://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&datatypeid=PRCP&locationid=ZIP:" + origin_postal_code + "&startdate=" + dateLastWeek + "&enddate=" + dateToday + "&limit=7&sortfield=date&sortorder=desc&includemetadata=false";
        tokenHeader = [];
        tokenHeader.push({
            key: 'token',
            value: 'QRWRVTBiNZNtlQSCkvELsaXCoLGAHRKm'
        });
        var aClient = new HttpClient();
        aClient.get(url, tokenHeader, function(data) {
            origin_prcp_data = JSON.parse(data);
        });
    }
}

function testDest() {
    if (dest_postal_code) {
        console.log("dest: " + dest_postal_code);
        dateToday = moment().format('YYYY-MM-DD');
        dateLastWeek = moment().subtract(7, 'days').format('YYYY-MM-DD');
        url = "http://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&datatypeid=PRCP&locationid=ZIP:" + dest_postal_code + "&startdate=" + dateLastWeek + "&enddate=" + dateToday + "&limit=5&sortfield=date&sortorder=desc&includemetadata=false";
        tokenHeader = [];
        tokenHeader.push({
            key: 'token',
            value: 'QRWRVTBiNZNtlQSCkvELsaXCoLGAHRKm'
        });
        var aClient = new HttpClient();
        aClient.get(url, tokenHeader, function(data) {
            dest_prcp_data = JSON.parse(data);
            console.log(dest_prcp_data);
        });
    }
}

//testOrigin();
//testDest();
