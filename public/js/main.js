var test;
var test2;
var test3;


var dest;
var orig_addr;
var dest_addr;
var orig_weather_data;
var dest_weather_data;
var orig_temp = {
    low: ['low'],
    high: ['high'],
    qpf_allday: ['rain'],
    conditions: ['conditions']
};
var dest_temp = {
    low: ['low'],
    high: ['high'],
    qpf_allday: ['rain'],
    conditions: ['conditions']
};
var orig_long_addr;
var dest_long_addr;
var orig_locality;
var orig_state;
var orig_state_long;
var orig_country;
var dest_locality;
var dest_state;
var dest_state_long;
var dest_country;
var orig_prcp_data;
var dest_prcp_data;
var orig_zika = {
    local: null,
    travel: null
};
var dest_zika = {
    local: null,
    travel: null
};
var total_zika = {
    local: null,
    travel: null
};

var zika_chart;
var zika_pie_chart;
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

var zika_data;
$.getJSON("zika-data.json", function(json) {
    zika_data = json;
    total_zika.travel = zika_data.total_us[0].value;
    total_zika.local = zika_data.total_us[1].value;
});

var wunderground_key = "6901a5ba64a062c1";
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
    $("#zika-threat").height(route_height);
    $("#route-info").height(route_height - $("#route-heading").height() - 10);
    $('#weather-clouds-chart').hide();
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
    $("#zika-threat").height(route_height);
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
    $('#orig-weather-chart').show();
    $('#dest-weather-chart').show();
    $('#weather-clouds-chart').hide();
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
    $('#orig-weather-chart').show();
    $('#dest-weather-chart').show();
    $('#weather-clouds-chart').hide();
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
    $('#weather-clouds').on('click', function() {
        if ($("#weather-clouds").hasClass('active')) {
            $('#weather-clouds').removeClass('active');
            $('#orig-weather-chart').show();
            $('#dest-weather-chart').show();
            $('#weather-clouds-chart').hide();
        } else {
            weatherCloudChart();
            $('#weather-clouds').addClass('active');
            $('#orig-weather-chart').hide();
            $('#dest-weather-chart').hide();
            $('#weather-clouds-chart').show();
        }
        /*
        if (orig_temp.low.length >= weather_len + 1) {
            weatherOrig();
            if (dest_temp.low.length >= weather_len + 1) {
                weatherDest();
            }
        } else if (dest_temp.low.length >= weather_len + 1) {
            weatherDest();
        }*/
    });

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
        geocodeAddress(place.formatted_address, 'origin');
        $('#orig-route-info').hide();

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
        $('#dest-route-info').hide();

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
                                orig = results[0];
                                orig_long_addr = results[0].formatted_address;
                            } else if (type == 'destination') {
                                dest = results[0];
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
                                } else if (temp[c].types[0] == 'administrative_area_level_1') {
                                    if (type == 'origin') {
                                        orig_state = temp[c].short_name;
                                        orig_state_long = temp[c].long_name;
                                        console.log(orig_state);
                                    } else {
                                        dest_state = temp[c].short_name;
                                        dest_state_long = temp[c].long_name;
                                        console.log(dest_state);
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
                                    zikaOrig();
                                }
                            } else if (type == 'destination') {
                                if (dest_locality && dest_country) {
                                    dest_addr = dest_country + "/" + dest_locality;
                                    weatherDest();
                                    zikaDest();
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

    function weatherCloudChart() {
        getWeatherRange();
        var cloud_title;
        var conditions = [];
        var columns = [];
        var temp_weather_range = weather_range.slice();
        temp_weather_range.shift();
        console.log(weather_range);
        console.log(temp_weather_range);
        $('#orig-weather-chart').hide();
        $('#dest-weather-chart').hide();
        if (orig_zika.travel !== null && dest_zika.travel !== null) {
            $('#orig-weather-info').hide();
            $('#dest-weather-info').hide();
            cloud_title = "Cloud Info: (" + orig_state_long + " vs " + dest_state_long + ")";
            for (var i = 0; i < 7; i++) {
                conditions.push({
                    'date': temp_weather_range[i],
                    'orig': orig_temp.conditions[i + 1],
                    'dest': dest_temp.conditions[i + 1]
                });
            }
            columns = [{
                head: 'Date',
                cl: 'center',
                html: ƒ('date')
            }, {
                head: 'Origin',
                cl: 'title',
                html: ƒ('orig')
            }, {
                head: 'Destination',
                cl: 'title',
                html: ƒ('dest')
            }];
            //zikaPieChart();
        } else if (orig_zika.travel !== null) {
            $('#orig-weather-info').hide();
            cloud_title = "Cloud Info: (" + orig_state_long + ")";
            for (var j = 0; j < 7; j++) {
                conditions.push({
                    'date': temp_weather_range[j],
                    'orig': orig_temp.conditions[j + 1]
                });
            }
            columns = [{
                head: 'Date',
                cl: 'center',
                html: ƒ('date')
            }, {
                head: 'Origin',
                cl: 'title',
                html: ƒ('orig')
            }];
        } else if (dest_zika.travel !== null) {
            $('#dest-weather-info').hide();
            cloud_title = "Cloud Info: (" + dest_state_long + ")";
            for (var k = 0; k < 7; k++) {
                conditions.push({
                    'date': temp_weather_range[k],
                    'dest': dest_temp.conditions[k + 1]
                });
            }
            columns = [{
                head: 'Date',
                cl: 'center',
                html: ƒ('date')
            }, {
                head: 'Destination',
                cl: 'title',
                html: ƒ('dest')
            }];
        }

        d3.select('#weather-clouds-chart').select('table').remove();

        cloudTable = d3.select('#weather-clouds-chart')
            .append('table').style('margin', 'auto');

        console.log(conditions);

        // create table header
        cloudTable.append('thead').append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th')
            .attr('class', ƒ('cl'))
            .text(ƒ('head'));

        // create table body
        cloudTable.append('tbody')
            .selectAll('tr')
            .data(conditions).enter()
            .append('tr')
            .selectAll('td')
            .data(function(row, i) {
                var test4 = columns.map(function(c) {
                    var cell = {};
                    d3.keys(c).forEach(function(k) {
                        cell[k] = typeof c[k] == 'function' ? c[k](row, i) : c[k];
                    });
                    return cell;
                });
                console.log(test4);
                return test4;
            }).enter()
            .append('td')
            .html(ƒ('html'))
            .attr('class', ƒ('cl'));

        $('#weather-clouds-chart').show();
    }

    function zikaOrig() {
        if (orig_country == 'US' && orig_state) {
            if (zika_data[orig_state]) {
                var zika = zika_data[orig_state];
                orig_zika.travel = zika[0].value;
                orig_zika.local = zika[1].value;
                zikaChart();
            } else {
                orig_zika.travel = null;
                orig_zika.local = null;
            }
        } else {
            orig_zika.travel = null;
            orig_zika.local = null;
            $('#orig-zika-info').html("No Zika data found for " + orig_country + ". Only US data is available.");
        }
    }

    function zikaDest() {
        if (dest_country == 'US' && dest_state) {
            if (zika_data[dest_state]) {
                var zika = zika_data[dest_state];
                dest_zika.travel = zika[0].value;
                dest_zika.local = zika[1].value;
                zikaChart();
            } else {
                dest_zika.travel = null;
                dest_zika.local = null;
            }
        } else {
            dest_zika.travel = null;
            dest_zika.local = null;
            $('#dest-zika-info').html("No Zika data found for " + dest_country + ". Only US data is available.");
        }
    }

    function zikaChart() {
        var zika_title;
        var columns;
        if (orig_zika.travel !== null && dest_zika.travel !== null) {
            $('#orig-zika-info').hide();
            $('#dest-zika-info').hide();
            zika_title = "Zika Info: (" + orig_state_long + " vs " + dest_state_long + ")";
            columns = [
                ['type', 'Travel acquired', 'Locally acquired'],
                ['origin', orig_zika.travel, orig_zika.local],
                ['destination', dest_zika.travel, dest_zika.local],
            ];
            //zikaPieChart();
        } else if (orig_zika.travel !== null) {
            $('#orig-zika-info').hide();
            zika_title = "Zika Info: (" + orig_state_long + ")";
            columns = [
                ['type', 'Travel acquired', 'Locally acquired'],
                ['origin', orig_zika.travel, orig_zika.local],
            ];
        } else if (dest_zika.travel !== null) {
            $('#dest-zika-info').hide();
            zika_title = "Zika Info: (" + dest_state_long + ")";
            columns = [
                ['type', 'Travel acquired', 'Locally acquired'],
                ['destination', dest_zika.travel, dest_zika.local],
            ];
        }
        chart_zika = c3.generate({
            bindto: '#zika-chart',
            title: {
                text: zika_title
            },
            data: {
                x: 'type',
                columns: columns,
                type: 'bar',
                labels: true
            },
            axis: {
                x: {
                    type: 'category',
                    label: 'Method of acquisition'
                },
                y: {
                    label: 'Number of recorded cases'
                }
            }
        });
        $('#zika-chart').show();
    }

    /*function zikaPieChart() {
        var zika_title;
        var columns;
        if (orig_zika.travel !== null && dest_zika.travel !== null) {
            $('#orig-zika-info').hide();
            $('#dest-zika-info').hide();
            zika_title = "Zika Comparisons";
            columns = [
                ['total', total_zika.travel + total_zika.local],
                ['origin', orig_zika.travel + orig_zika.local],
                ['destination', dest_zika.travel + dest_zika.local],
            ];
        }
        chart_pie_zika = c3.generate({
            bindto: '#zika-pie-chart',
            title: {
                text: zika_title
            },
            data: {
                columns: columns,
                type: 'pie',
                labels: true
            },
            pie: {
                label: {
                    format: function(value, ratio, id) {
                        return value;
                    }
                }
            }
        });
        $('#zika-pie-chart').show();
    }*/

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
                    qpf_allday: ['rain'],
                    conditions: ['conditions']
                };

                for (var i = 0; i < weather_len; i++) {
                    orig_temp.low.push(orig_weather_data[i].low.fahrenheit);
                    orig_temp.high.push(orig_weather_data[i].high.fahrenheit);
                    orig_temp.qpf_allday.push(orig_weather_data[i].qpf_allday.in);
                    orig_temp.conditions.push(orig_weather_data[i].conditions);
                }

                if ($("#weather-clouds").hasClass('active')) {
                    weatherCloudChart();
                } else {
                    weatherOrigChart();
                }

                /*if (!$("#weather-clouds-chart").is(":visible")) {
                    weatherOrigChart();
                } else {
                    weatherCloudChart();
                }*/
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
                    qpf_allday: ['rain'],
                    conditions: ['conditions']
                };

                for (var i = 0; i < weather_len; i++) {
                    dest_temp.low.push(dest_weather_data[i].low.fahrenheit);
                    dest_temp.high.push(dest_weather_data[i].high.fahrenheit);
                    dest_temp.qpf_allday.push(dest_weather_data[i].qpf_allday.in);
                    dest_temp.conditions.push(dest_weather_data[i].conditions);
                }

                if ($("#weather-clouds").hasClass('active')) {
                    weatherCloudChart();
                } else {
                    weatherDestChart();
                }

                /*if (!$("#weather-clouds-chart").is(":visible")) {
                    weatherDestChart();
                } else {
                    weatherCloudChart();
                }*/
            });
        } else {
            $('#dest-weather-chart').hide();
            $('#dest-weather-info').html("No weather information found.");
        }
    }

    function weatherOrigChart() {
        $('#orig-weather-info').hide();
        getWeatherRange();
        var type;
        if ($("#weather-spline").hasClass('active')) {
            type = 'area-spline';
        } else if ($("#weather-bar").hasClass('active')) {
            type = 'bar';
        }
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
                type: type,
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

    function weatherDestChart() {
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
