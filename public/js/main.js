/* jshint -W083 */

var test;
var test2;
var test3;

var local_msg;
var travel_msg;
var pop_msg;
var risk_msg;

var orig = {
    weather_data: [],
    temp: {
        low: ['low'],
        high: ['high'],
        qpf_allday: ['rain'],
        conditions: ['conditions'],
        images: ['images']
    },
    addr: '',
    long_addr: '',
    locality: '',
    county: '',
    state: '',
    state_long: '',
    country: '',
    country_long: '',
    query: '',
    population: -1,
    zip_pop: -1
};

var dest = {
    weather_data: [],
    temp: {
        low: ['low'],
        high: ['high'],
        qpf_allday: ['rain'],
        conditions: ['conditions'],
        images: ['images']
    },
    addr: '',
    long_addr: '',
    locality: '',
    county: '',
    state: '',
    state_long: '',
    country: '',
    country_long: '',
    query: '',
    population: -1,
    zip_pop: -1
};
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
var zika_pop_chart;
var zika_pie_chart;
var chart_weather_orig;
var chart_weather_dest;

var weather_range = [];
var weather_len = 7; // orig_weather_data.length

var travel_mode;

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
var zip_population;
$.getJSON("zip-population.json", function(json) {
    zip_population = json;
});
var county_population;
$.getJSON("county-population.json", function(json) {
    county_population = json;
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
    $('#zika-details').hide();
    $('#zika-cases').hide();
    $('#zika-pop').hide();
    $('#zika-summary').hide();
    $('#zika-reminder').hide();
    $('#route-error').hide();
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

/*$('#data-tabs').on('click', function() {
    console.log('hi');
    $(".data-tab").map(function() {
        $(this).css('background-color', $(this).children().css('background-color'));
    });
});*/

function initMap() {
    $('#weather-spline').on('click', function() {
        $('#weather-spline').addClass('active');
        $('#weather-bar').removeClass('active');
        if (orig.temp.low.length > 1) {
            weatherOrigChart();
        }
        if (dest.temp.low.length > 1) {
            weatherDestChart();
        }
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
        if (orig.temp.low.length > 1) {
            weatherOrigChart();
        }
        if (dest.temp.low.length > 1) {
            weatherDestChart();
        }
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

    $('#zika-graph').on('click', function() {
        $('#zika-graph').addClass('active');
        $('#zika-data').removeClass('active');
        $('#zika-details').hide();
        if (orig_zika.travel !== null || dest_zika.travel !== null) {
            zikaChart();
            $('#zika-chart').show();
            $('#zika-population').show();
        }
    });

    $('#zika-data').on('click', function() {
        $('#zika-data').addClass('active');
        $('#zika-graph').removeClass('active');
        $('#zika-chart').hide();
        $('#zika-population').hide();
        if (orig_zika.travel !== null && dest_zika.travel !== null) {
            zikaDetails();
            $('#zika-details').show();
        }
    });

    var orig_place_id = null;
    var destination_place_id = null;

    var orig_postal_code = null;
    var dest_postal_code = null;

    travel_mode = 'DRIVING';
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
        if (travel_mode == 'AIRPLANE') {
            $('#route-error').html('Google Maps does not support travel by plane. You can view weather and Zika info in the other tabs and look up flights <a target=\'_blank\' href=\'https://www.expedia.com/Flights\'>here</a>.');
            $('#route-error').show();
            $('#route-info').hide();
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
                                orig.long_addr = results[0].formatted_address;
                            } else if (type == 'destination') {
                                dest = results[0];
                                dest.long_addr = results[0].formatted_address;
                            }
                            var temp = results[0].address_components;
                            console.log(temp);
                            for (var c = 0; c < temp.length; c++) {
                                if (temp[c].types[0] == 'postal_code') {
                                    var postal_code = temp[c].short_name;
                                    if (type == 'origin') {
                                        orig.postal_code = postal_code;
                                        try {
                                            orig.zip_pop = zip_population.find(function(zip) {
                                                return zip.zip == postal_code;
                                            }).population;
                                        } catch (err) {
                                            console.log(err);
                                        }
                                        prcpInfoOrigin();
                                    } else if (type == 'destination') {
                                        dest.postal_code = postal_code;
                                        try {
                                            dest.zip_pop = zip_population.find(function(zip) {
                                                return zip.zip == postal_code;
                                            }).population;
                                        } catch (err) {
                                            console.log(err);
                                        }
                                        prcpInfoDest();
                                    }
                                } else if (temp[c].types[0] == 'locality') {
                                    if (type == 'origin') {
                                        orig.locality = temp[c].short_name;
                                    } else {
                                        dest.locality = temp[c].short_name;
                                    }
                                } else if (temp[c].types[0] == 'administrative_area_level_1') {
                                    if (type == 'origin') {
                                        orig.state = temp[c].short_name;
                                        orig.state_long = temp[c].long_name;
                                    } else {
                                        dest.state = temp[c].short_name;
                                        dest.state_long = temp[c].long_name;
                                    }
                                } else if (temp[c].types[0] == 'administrative_area_level_2') {
                                    if (type == 'origin') {
                                        orig.county = temp[c].short_name;
                                        try {
                                            orig.population = county_population.find(function(zip) {
                                                return zip.county == orig.county;
                                            }).population;
                                        } catch (err) {
                                            console.log(err);
                                        }
                                    } else {
                                        dest.county = temp[c].short_name;
                                        try {
                                            dest.population = county_population.find(function(zip) {
                                                return zip.county == dest.county;
                                            }).population;
                                        } catch (err) {
                                            console.log(err);
                                        }
                                    }
                                } else if (temp[c].types[0] == 'country') {
                                    if (type == 'origin') {
                                        orig.country = temp[c].short_name;
                                        orig.country_long = temp[c].long_name;
                                    } else {
                                        dest.country = temp[c].short_name;
                                        dest.country_long = temp[c].long_name;
                                    }
                                }
                            }
                            if (type == 'origin') {
                                if (orig.locality && orig.country) {
                                    orig.addr = orig.country + "/" + orig.locality;
                                    weatherOrig();
                                    zikaOrig();
                                }
                            } else if (type == 'destination') {
                                if (dest.locality && dest.country) {
                                    dest.addr = dest.country + "/" + dest.locality;
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
            cloud_title = "Cloud Info: (" + orig.state_long + " vs " + dest.state_long + ")";
            for (var i = 0; i < 7; i++) {
                conditions.push({
                    'date': temp_weather_range[i],
                    'orig': '<img src=\"' + orig.temp.images[i + 1] +
                            '\" title=\"' + orig.temp.conditions[i + 1] +
                            '\" alt=\"' + orig.temp.conditions[i + 1] + '\">',
                    'dest': '<img src=\"' + dest.temp.images[i + 1] +
                            '\" title=\"' + dest.temp.conditions[i + 1] +
                            '\" alt=\"' + dest.temp.conditions[i + 1] + '\">'
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
            cloud_title = "Cloud Info: (" + orig.state_long + ")";
            for (var j = 0; j < 7; j++) {
                conditions.push({
                    'date': temp_weather_range[j],
                    'orig': '<img src=\"' + orig.temp.images[j + 1] +
                            '\" title=\"' + orig.temp.conditions[j + 1] +
                            '\" alt=\"' + orig.temp.conditions[j + 1] + '\">'
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
            cloud_title = "Cloud Info: (" + dest.state_long + ")";
            for (var k = 0; k < 7; k++) {
                conditions.push({
                    'date': temp_weather_range[k],
                    'dest': '<img src=\"' + dest.temp.images[k + 1] +
                            '\" title=\"' + dest.temp.conditions[k + 1] +
                            '\" alt=\"' + dest.temp.conditions[k + 1] + '\">'
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
        if (orig.country == 'US' && orig.state) {
            if (zika_data[orig.state]) {
                var zika = zika_data[orig.state];
                orig_zika.travel = zika[0].value;
                orig_zika.local = zika[1].value;
                if ($("#zika-graph").hasClass('active')) {
                    zikaChart();
                } else {
                    zikaDetails();
                }
            } else {
                orig_zika.travel = null;
                orig_zika.local = null;
            }
        } else {
            orig_zika.travel = null;
            orig_zika.local = null;
            $('#orig-zika-info').html("No Zika data found for " + orig.country_long + ". Only US data is available.");
        }
    }

    function zikaDest() {
        if (dest.country == 'US' && dest.state) {
            if (zika_data[dest.state]) {
                var zika = zika_data[dest.state];
                dest_zika.travel = zika[0].value;
                dest_zika.local = zika[1].value;
                if ($("#zika-graph").hasClass('active')) {
                    zikaChart();
                } else {
                    zikaDetails();
                }
            } else {
                dest_zika.travel = null;
                dest_zika.local = null;
            }
        } else {
            dest_zika.travel = null;
            dest_zika.local = null;
            $('#dest-zika-info').html("No Zika data found for " + dest.country_long + ". Only US data is available.");
        }
    }

    function zikaChart() {
        var zika_title;
        var zika_pop_title;
        var columns;
        var columns2;
        if (orig_zika.travel !== null && dest_zika.travel !== null) {
            $('#orig-zika-info').hide();
            $('#dest-zika-info').hide();
            zika_title = "Zika Info: (" + orig.state_long + " vs " + dest.state_long + ")";
            zika_pop_title = "Population Info: (" + orig.county + ", " + orig.state + " vs " + dest.county + ", " + dest.state + ")";
            columns = [
                ['type', 'Travel acquired', 'Locally acquired'],
                ['origin', orig_zika.travel, orig_zika.local],
                ['destination', dest_zika.travel, dest_zika.local],
            ];
            columns2 = [
                ['type', 'Population'],
                ['origin', orig.population],
                ['destination', dest.population]
            ];
            //zikaDetails();
            //zikaPieChart();
        } else if (orig_zika.travel !== null) {
            $('#orig-zika-info').hide();
            zika_title = "Zika Info: (" + orig.state_long + ")";
            zika_pop_title = "Population Info: (" + orig.county + ", " + orig.state + ")";
            columns = [
                ['type', 'Travel acquired', 'Locally acquired'],
                ['origin', orig_zika.travel, orig_zika.local],
            ];
            columns2 = [
                ['type', 'Population'],
                ['origin', orig.population]
            ];
        } else if (dest_zika.travel !== null) {
            $('#dest-zika-info').hide();
            zika_title = "Zika Info: (" + dest.state_long + ")";
            zika_pop_title = "Population Info: (" + dest.county + ", " + dest.state + ")";
            columns = [
                ['type', 'Travel acquired', 'Locally acquired'],
                ['destination', dest_zika.travel, dest_zika.local],
            ];
            columns2 = [
                ['type', 'Population'],
                ['destination', dest.population]
            ];
        }

        chart_zika = c3.generate({
            bindto: '#zika-chart',
            size: {
                height: 280
            },
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

        chart_pop_zika = c3.generate({
            bindto: '#zika-population',
            size: {
                height: 280
            },
            title: {
                text: zika_pop_title
            },
            data: {
                x: 'type',
                columns: columns2,
                type: 'bar',
                labels: true
            },
            axis: {
                x: {
                    type: 'category',
                    label: 'County'
                },
                y: {
                    label: 'Number of people',
                    tick: {
                        format: d3.format("0,000")
                    }
                }
            }
        });
        $('#zika-population-chart').show();
    }

    function zikaDetails() {
        var zikarisk_local = -1;
        var zikarisk_travel = -1;
        var zikarisk_pop = -1;
        var risk_percent = -1;

        if (orig_zika.travel !== null && dest_zika.travel !== null) {
            $('#orig-zika-info').hide();
            $('#dest-zika-info').hide();
            local_msg = null;
            travel_msg = null;

            var local_diff = dest_zika.local - orig_zika.local;
            var travel_diff = dest_zika.travel - orig_zika.travel;

            if (orig.country == 'US' && orig.country == dest.country && orig.state == dest.state) {
                local_msg = "You're traveling within the same state, so the number of locally acquired and travel acquired cases of Zika is about the same from your origin to your destination.";
            } else {
                if (local_diff > 0) {
                    local_msg = dest.state_long + " has " + local_diff + " more locally acquired cases of Zika than " + orig.state_long + ". This means that there is more active transmission of the Zika virus by local mosquitoes in " + dest.state_long + " compared to " + orig.state_long + ".";
                    zikarisk_local = true;
                } else if (local_diff < 0) {
                    local_msg = dest.state_long + " has " + (-1 * local_diff) + " less locally acquired cases of Zika than " + orig.state_long + ". This means that there is less active transmission of the Zika virus by local mosquitoes in " + dest.state_long + " compared to " + orig.state_long + ".";
                    zikarisk_local = false;
                } else {
                    local_msg = dest.state_long + " has the same number of locally acquired cases of Zika than " + orig.state_long + ". This means that there is about the same amount of active transmission of the Zika virus by local mosquitoes in " + dest.state_long + " compared to " + orig.state_long + ".";
                    zikarisk_local = false;
                }

                if (travel_diff > 0) {
                    travel_msg = dest.state_long + " has " + travel_diff + " more traveling acquired cases of Zika than " + orig.state_long + ". This means that there are more travelers entering " + dest.state_long + " with the Zika virus compared to " + orig.state_long + ".";
                    zikarisk_travel = true;
                } else if (travel_diff < 0) {
                    travel_msg = dest.state_long + " has " + (-1 * travel_diff) + " less traveling acquired cases of Zika than " + orig.state_long + ". This means that there are fewer travelers entering " + dest.state_long + " with the Zika virus compared to " + orig.state_long + ".";
                    zikarisk_travel = false;
                } else {
                    travel_msg = dest.state_long + " has the same number of traveling acquired cases of Zika than " + orig.state_long + ". This means that there is about the same number of travelers entering " + dest.state_long + " with the Zika virus compared to " + orig.state_long + ".";
                    zikarisk_travel = false;
                }
            }

            if (local_msg) {
                $('#zika-local').html(local_msg);
                $('#zika-local').show();
                $('#zika-cases').show();
                $('#zika-details').show();
                if (!travel_msg) {
                    $('#zika-travel').hide();
                }
            }
            if (travel_msg) {
                $('#zika-travel').html(travel_msg);
                $('#zika-travel').show();
                $('#zika-cases').show();
                $('#zika-details').show();
            }

            if (orig.population && dest.population) {
                var pop_diff = dest.population - orig.population;
                var orig_name = orig.county + ", " + orig.state;
                var dest_name = dest.county + ", " + dest.state;
                if (pop_diff > 0) {
                    pop_msg = dest_name + " has a larger population than " + orig_name + ". Areas that are more populous are at higher risk of infection. You could be more safe if you traveled to a less populous destination.";
                    zikarisk_pop = true;
                } else if (pop_diff < 0) {
                    pop_msg = dest_name + " has a smaller population than " + orig_name + ". Areas that are less populous are at lower risk of infection.";
                    zikarisk_pop = false;
                } else {
                    pop_msg = dest_name + " has the same population as " + orig_name + ". Thus, in this case, population does not affect risk of infection.";
                    zikarisk_pop = false;
                }
                if (pop_msg) {
                    $('#zika-pop-info').html(pop_msg);
                    $('#zika-pop').show();
                    $('#zika-pop-info').show();
                }
                $('#zika-details').show();
            }

            if (orig.country == 'US' && orig.country == dest.country && orig.state == dest.state) {
                risk_percent = 0;
            } else if (zikarisk_local != -1 || zikarisk_travel != -1 || zikarisk_pop != -1) {
                var risk_total = 0;
                var risk_count = 0;
                if (zikarisk_local === false) {
                    risk_total++;
                } else if (zikarisk_local === true) {
                    risk_total++;
                    risk_count++;
                }
                if (zikarisk_travel === false) {
                    risk_total++;
                } else if (zikarisk_travel === true) {
                    risk_total++;
                    risk_count++;
                }
                if (zikarisk_pop === false) {
                    risk_total++;
                } else if (zikarisk_pop === true) {
                    risk_total++;
                    risk_count++;
                }
                risk_percent = risk_count / risk_total;
            }
                console.log(risk_percent);
                if (risk_percent >= 0 && risk_percent < 0.34) {
                    risk_msg = "Overall, your risk of Zika infection for this trip is <span class='green'>LOW</span>.";
                } else if (risk_percent >= 0.34 && risk_percent < 0.67) {
                    risk_msg = "Overall, your risk of Zika infection for this trip is <span class='yellow'>SOMEWHAT LOW</span>.";
                } else if (risk_percent >= 0.67 && risk_percent <= 1) {
                    risk_msg = "Overall, your risk of Zika infection for this trip is <span class='red'>SOMEWHAT HIGH</span>.";
                }
                if (risk_msg) {
                    $('#zika-summary').html(risk_msg);
                    $('#zika-reminder').show();
                    $('#zika-summary').show();
                    $('#zika-details').show();
                }
        } else if (orig_zika.travel !== null) {
            $('#orig-zika-info').hide();
        } else if (dest_zika.travel !== null) {
            $('#dest-zika-info').hide();
        }
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
        if (orig.postal_code && orig.country == 'US') {
            orig_query = orig.postal_code;
            console.log("postal code: " + orig_query);
        } else if (orig.addr) {
            orig_query = orig.addr;
            console.log("addr: " + orig_query);
        }
        if (orig_query) {
            url = "http://api.wunderground.com/api/" + wunderground_key + "/forecast10day/q/" + orig_query + ".json";
            httpGetAsync(url, null, function(data) {
                try {
                    orig.weather_data = JSON.parse(data).forecast.simpleforecast.forecastday;
                } catch (err) {
                    console.log(err);
                    $('#orig-weather-chart').hide();
                    $('#orig-weather-info').html("No weather information found for " + orig.locality + ".");
                    return;
                }

                orig.temp = {
                    low: ['low'],
                    high: ['high'],
                    qpf_allday: ['rain'],
                    conditions: ['conditions'],
                    images: ['images']
                };

                for (var i = 0; i < weather_len; i++) {
                    orig.temp.low.push(orig.weather_data[i].low.fahrenheit);
                    orig.temp.high.push(orig.weather_data[i].high.fahrenheit);
                    orig.temp.qpf_allday.push(orig.weather_data[i].qpf_allday.in);
                    orig.temp.conditions.push(orig.weather_data[i].conditions);
                    orig.temp.images.push(orig.weather_data[i].icon_url);
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
        if (dest.postal_code && dest.country == 'US') {
            dest_query = dest.postal_code;
            console.log("postal code: " + dest_query);
        } else if (dest.addr) {
            dest_query = dest.addr;
            console.log("addr: " + dest_query);
        }
        if (dest_query) {
            url = "http://api.wunderground.com/api/" + wunderground_key + "/forecast10day/q/" + dest_query + ".json";
            httpGetAsync(url, null, function(data) {
                try {
                    var temp = JSON.parse(data);
                    dest.weather_data = JSON.parse(data).forecast.simpleforecast.forecastday;
                } catch (err) {
                    console.log(err);
                    $('#dest-weather-chart').hide();
                    $('#dest-weather-info').html("No weather information found for " + dest.locality + ".");
                    return;
                }

                dest.temp = {
                    low: ['low'],
                    high: ['high'],
                    qpf_allday: ['rain'],
                    conditions: ['conditions'],
                    images: ['images']
                };

                for (var i = 0; i < weather_len; i++) {
                    dest.temp.low.push(dest.weather_data[i].low.fahrenheit);
                    dest.temp.high.push(dest.weather_data[i].high.fahrenheit);
                    dest.temp.qpf_allday.push(dest.weather_data[i].qpf_allday.in);
                    dest.temp.conditions.push(dest.weather_data[i].conditions);
                    dest.temp.images.push(dest.weather_data[i].icon_url);
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
                text: 'Origin Info (' + orig.locality + ')'
            },
            data: {
                x: 'days',
                xFormat: '%m-%d',
                columns: [
                    weather_range,
                    orig.temp.low,
                    orig.temp.high,
                    orig.temp.qpf_allday
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
                text: 'Destination Info (' + dest.locality + ')'
            },
            data: {
                x: 'days',
                xFormat: '%m-%d',
                columns: [
                    weather_range,
                    dest.temp.low,
                    dest.temp.high,
                    dest.temp.qpf_allday
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
        if (orig.postal_code) {
            console.log("origin: " + orig.postal_code);
            dateToday = moment().format('YYYY-MM-DD');
            dateLastWeek = moment().subtract(7, 'days').format('YYYY-MM-DD');
            console.log(dateToday + ", " + dateLastWeek);
            url = "http://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&datatypeid=PRCP&locationid=ZIP:" + orig.postal_code + "&startdate=" + dateLastWeek + "&enddate=" + dateToday + "&limit=5&sortfield=date&sortorder=desc&includemetadata=false";

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
        if (dest.postal_code) {
            console.log("dest: " + dest.postal_code);
            dateToday = moment().format('YYYY-MM-DD');
            dateLastWeek = moment().subtract(7, 'days').format('YYYY-MM-DD');
            console.log(dateToday + ", " + dateLastWeek);
            url = "http://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&datatypeid=PRCP&locationid=ZIP:" + dest.postal_code + "&startdate=" + dateLastWeek + "&enddate=" + dateToday + "&limit=5&sortfield=date&sortorder=desc&includemetadata=false";
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
