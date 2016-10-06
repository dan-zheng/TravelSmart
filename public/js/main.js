var test;
var test2;
var test3;

var orig_prcp_data;
var dest_prcp_data;

var orig_addr;
var dest_addr;
var orig_weather_data;
var dest_weather_data;
var orig_temp = {
    low: ['low'],
    high: ['high'],
    qpf_allday: ['rain']
};
var dest_temp = {
    low: ['low'],
    high: ['high'],
    qpf_allday: ['rain']
};
var orig_long_addr;
var dest_long_addr;
var orig_locality;
var orig_country;
var dest_locality;
var dest_country;

var chart_weather_orig;
var chart_weather_dest;

var weather_range = [];

var weather_len = 7; // orig_weather_data.length

function getWeatherRange() {
    weather_range = ['days'];
    for (var i = 0; i < weather_len; i++) {
        var temp_date = moment().add(i, 'days').format('MM-DD');
        weather_range.push(temp_date);
    }
}

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
        normalScrollElements: '#weather-info, #route-info'
    });
    var pad = 20;
    var height = $(window).height() - $(".navbar").height() - $("footer").height() - pad;
    $("#map").height(height);
    $("#sidebar").height(height);
    var route_height = $("#data").height() - $("#data-tabs").height() - 10;
    $("#route").height(route_height);
    $("#weather").height(route_height);
    $("#viral-threat").height(route_height);
    $("#route-info").height(route_height - $("#route-heading").height() - 10);
    /*var maxHeight = Math.max.apply(null, $(".data-tab").map(function() {
        console.log($(this).height() );
        return $(this).height() - 16;
    }).get());*/

    $("#data").tabs();
});

$(window).on('resize', function() {
    var pad = 20;
    var height = $(window).height() - $(".navbar").height() - $("footer").height() - pad;
    $("#map").height(height);
    $("#sidebar").height(height);
    var route_height = $("#data").height() - $("#data-tabs").height() - 10;
    $("#route").height(route_height);
    $("#weather").height(route_height);
    $("#viral-threat").height(route_height);
    $("#route-info").height(route_height - $("#route-heading").height() - 10);
    /*var maxHeight = Math.max.apply(null, $(".data-tab").map(function() {
        console.log($(this).height());
        return $(this).height() - 16;
    }).get());
    $(".data-tab").map(function() {
        $(this).children().height(maxHeight);
    });*/
});

$('#myModal').on('shown.bs.modal', function() {
    $('#myInput').focus();
});

$('#go-to-app').on('click', function() {
    $.fn.fullpage.moveTo('app');
});

$('#weather-spline').on('click', function() {
    $('#weather-spline').addClass('active');
    $('#weather-bar').removeClass('active');
    if (chart_weather_orig) {
        chart_weather_orig.transform('area-spline');
    }
    if (chart_weather_dest) {
        chart_weather_dest.transform('area-spline');
    }
});

$('#weather-bar').on('click', function() {
    $('#weather-bar').addClass('active');
    $('#weather-spline').removeClass('active');
    if (chart_weather_orig) {
        chart_weather_orig.transform('bar');
    }
    if (chart_weather_dest) {
        chart_weather_dest.transform('bar');
    }
});

/*$('#data-tabs').on('click', function() {
    console.log('hi');
    $(".data-tab").map(function() {
        $(this).css('background-color', $(this).children().css('background-color'));
    });
});*/

function initMap() {
    var orig_place_id = null;
    var destination_place_id = null;

    var orig_postal_code = null;
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
    directionsDisplay.setPanel(document.getElementById('route-info'));

    var geocoder = new google.maps.Geocoder();

    var orig_input = document.getElementById('orig-input');
    var dest_input = document.getElementById('dest-input');
    var modes = document.getElementById('mode-selector');

    var inputs = document.getElementById('inputs');

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(inputs);

    var orig_autocomplete = new google.maps.places.Autocomplete(orig_input);
    orig_autocomplete.bindTo('bounds', map);
    var dest_autocomplete = new google.maps.places.Autocomplete(dest_input);
    dest_autocomplete.bindTo('bounds', map);

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

    orig_autocomplete.addListener('place_changed', function() {
        var place = orig_autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }
        expandViewportToFitPlace(map, place);
        console.log(place);
        geocodeAddress(place.formatted_address, 'origin');

        // If the place has a geometry, store its place ID and route if we have
        // the other place ID
        orig_place_id = place.place_id;
        route(orig_place_id, destination_place_id, travel_mode,
            directionsService, directionsDisplay);
    });

    dest_autocomplete.addListener('place_changed', function() {
        var place = dest_autocomplete.getPlace();
        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }
        expandViewportToFitPlace(map, place);
        geocodeAddress(place.formatted_address, 'destination');

        // If the place has a geometry, store its place ID and route if we have
        // the other place ID
        destination_place_id = place.place_id;
        route(orig_place_id, destination_place_id, travel_mode,
            directionsService, directionsDisplay);
    });

    document.getElementById('mode').addEventListener('change', function() {
        travel_mode = document.getElementById('mode').value;
        route(orig_place_id, destination_place_id, travel_mode,
            directionsService, directionsDisplay);
    });

    function route(orig_place_id, destination_place_id, travel_mode,
        directionsService, directionsDisplay) {
        if (!orig_place_id || !destination_place_id) {
            return;
        }

        directionsService.route({
            origin: {
                'placeId': orig_place_id
            },
            destination: {
                'placeId': destination_place_id
            },
            travelMode: travel_mode
        }, function(response, status) {
            if (status === 'OK') {
                directionsDisplay.setDirections(response);
                $('#route-error').hide();
                $('#route-info').show();
            } else {
                $('#route-error').html('Route finding failed due to ' + status + ".");
                $('#route-error').show();
                $('#route-info').hide();
                window.alert('Route finding failed due to ' + status + ".");
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
                            if (type == 'origin') {
                                orig_long_addr = results[0].formatted_address;
                            } else if (type == 'destination') {
                                dest_long_addr = results[0].formatted_address;
                            }
                            var temp = results[0].address_components;
                            console.log(results[0]);
                            for (var c = 0; c < temp.length; c++) {
                                if (temp[c].types[0] == 'postal_code') {
                                    var postal_code = temp[c].short_name;
                                    //console.log(postal_code);
                                    if (type == 'origin') {
                                        orig_postal_code = postal_code;
                                        test = orig_postal_code;
                                        //prcpInfoOrigin();
                                        //callback();
                                    } else if (type == 'destination') {
                                        dest_postal_code = postal_code;
                                        test2 = dest_postal_code;
                                        //prcpInfoDest();
                                        //callback();
                                    }
                                } else if (temp[c].types[0] == 'locality') {
                                    if (type == 'origin') {
                                        orig_locality = temp[c].short_name;
                                    } else {
                                        dest_locality = temp[c].short_name;
                                    }
                                } else if (temp[c].types[0] == 'country') {
                                    if (type == 'origin') {
                                        orig_country = temp[c].short_name;
                                    } else {
                                        dest_country = temp[c].short_name;
                                    }
                                }
                            }
                            if (type == 'origin') {
                                if (orig_locality && orig_country) {
                                    orig_addr = orig_country + "/" + orig_locality;
                                    weatherOrig();
                                }
                            } else if (type == 'destination') {
                                if (dest_locality && dest_country) {
                                    dest_addr = dest_country + "/" + dest_locality;
                                    weatherDest();
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

    function weatherOrig() {
        var url;
        var orig_query;
        if (orig_postal_code && orig_country == 'US') {
            orig_query = orig_postal_code;
            console.log("postal code: " + orig_query);
        } else if (orig_addr) {
            orig_query = orig_addr;
            console.log("addr: " + orig_query);
        }
        if (orig_query) {
            url = "http://api.wunderground.com/api/" + wunderground_key + "/forecast10day/q/" + orig_query + ".json";
            httpGetAsync(url, null, function(data) {
                try {
                    orig_weather_data = JSON.parse(data).forecast.simpleforecast.forecastday;
                } catch (err) {
                    console.log(err);
                    $('#orig-weather-chart').hide();
                    $('#orig-weather-info').html("No weather information found for " + orig_locality + ".");
                }

                orig_temp = {
                    low: ['low'],
                    high: ['high'],
                    qpf_allday: ['rain']
                };

                for (var i = 0; i < weather_len; i++) {
                    orig_temp.low.push(orig_weather_data[i].low.fahrenheit);
                    orig_temp.high.push(orig_weather_data[i].high.fahrenheit);
                    orig_temp.qpf_allday.push(orig_weather_data[i].qpf_allday.in);
                }

                weatherOrigGraph();
            });
        } else {
            $('#orig-weather-chart').hide();
            $('#orig-weather-info').html("No weather information found.");
        }
    }

    function weatherDest() {
        var url;
        var dest_query;
        if (dest_postal_code && orig_country == 'US') {
            dest_query = dest_postal_code;
            console.log("postal code: " + dest_query);
        } else if (dest_addr) {
            dest_query = dest_addr;
            console.log("addr: " + dest_query);
        }
        if (dest_query) {
            url = "http://api.wunderground.com/api/" + wunderground_key + "/forecast10day/q/" + dest_query + ".json";
            httpGetAsync(url, null, function(data) {
                try {
                    dest_weather_data = JSON.parse(data).forecast.simpleforecast.forecastday;
                } catch (err) {
                    console.log(err);
                    $('#dest-weather-chart').hide();
                    $('#dest-weather-info').html("No weather information found for " + dest_locality + ".");
                }

                dest_temp = {
                    low: ['low'],
                    high: ['high'],
                    qpf_allday: ['rain']
                };

                for (var i = 0; i < weather_len; i++) {
                    dest_temp.low.push(dest_weather_data[i].low.fahrenheit);
                    dest_temp.high.push(dest_weather_data[i].high.fahrenheit);
                    dest_temp.qpf_allday.push(dest_weather_data[i].qpf_allday.in);
                }

                weatherDestGraph();
            });
        } else {
            $('#dest-weather-chart').hide();
            $('#dest-weather-info').html("No weather information found.");
        }
    }

    function weatherOrigGraph() {
        $('#orig-weather-info').hide();
        getWeatherRange();
        chart_weather_orig = c3.generate({
            bindto: '#orig-weather-chart',
            title: {
                text: 'Origin Info (' + orig_locality + ')'
            },
            data: {
                x: 'days',
                xFormat: '%m-%d',
                columns: [
                    weather_range,
                    orig_temp.low,
                    orig_temp.high,
                    orig_temp.qpf_allday
                ],
                axes: {
                    low: 'y',
                    high: 'y',
                    rain: 'y2'
                },
                type: 'area-spline',
                labels: true
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%m-%d'
                    }
                },
                y: {
                    label: 'Temperature (°F)'
                },
                y2: {
                    label: 'Precipitation (inches)',
                    padding: {
                        top: 200,
                        bottom: 0
                    },
                    show: true
                }
            }
        });
        $('#orig-weather-chart').show();
    }

    function weatherDestGraph() {
        $('#dest-weather-info').hide();
        getWeatherRange();
        chart_weather_dest = c3.generate({
            bindto: '#dest-weather-chart',
            title: {
                text: 'Destination Info (' + dest_locality + ')'
            },
            data: {
                x: 'days',
                xFormat: '%m-%d',
                columns: [
                    weather_range,
                    dest_temp.low,
                    dest_temp.high,
                    dest_temp.qpf_allday
                ],
                axes: {
                    low: 'y',
                    high: 'y',
                    rain: 'y2'
                },
                type: 'area-spline',
                labels: true
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%m-%d'
                    }
                },
                y: {
                    label: 'Temperature (°F)'
                },
                y2: {
                    label: 'Precipitation (inches)',
                    padding: {
                        top: 200,
                        bottom: 0
                    },
                    show: true
                }
            }
        });
        $('#dest-weather-chart').show();
    }

    function prcpInfoOrigin() {
        var dateToday, dateLastWeek, url;
        if (orig_postal_code) {
            console.log("origin: " + orig_postal_code);
            dateToday = moment().format('YYYY-MM-DD');
            dateLastWeek = moment().subtract(7, 'days').format('YYYY-MM-DD');
            console.log(dateToday + ", " + dateLastWeek);
            url = "http://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&datatypeid=PRCP&locationid=ZIP:" + orig_postal_code + "&startdate=" + dateLastWeek + "&enddate=" + dateToday + "&limit=5&sortfield=date&sortorder=desc&includemetadata=false";

            httpGetAsync(url, tokenHeader, function(data) {
                orig_prcp_data = JSON.parse(data);
                console.log(orig_prcp_data);
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
