/**
 * Smartmirror
 * ---
 * @author Michael Pomogajko
 * @version 0.1
 * ---
 * Note: Read the README!
 * ---
 */


var months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "November", "Dezember"];

var days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];


function getStations(data) {
    try {
        var buff = [];


        var str = "<span " + data.substring(data.indexOf("class=\"stand"), data.indexOf("<div id=\"mobil_impressum"));

        $($(str)[2]).find('td').each(function () {
            buff.push(this);
        });

        var deps = [];

        for (var i = 0; i < 30; i++) {
            if (i % 3 === 0) {
                var dep = {};
                dep.line = buff[i].innerText;
                dep.to = buff[i + 1].innerText;
                dep.time = buff[i + 2].innerText;
                deps.push(dep);
            }
        }
        fillStations(deps);
        $('#notif').text("");
    } catch (err) {
        $('#notif').text("Error");
    }
}

function getStationBerlin(data) {
    var buff = [];
    var deps = []
//    var str ="<span "+ data.substring(data.indexOf("stationOverview"), data.indexOf("</table"));
//    console.log(str);
    $($(data).find('table')[0]).find('td').each(function() {
        buff.push(this.innerText.replace(/(\r\n|\n|\r)/gm,""));
    });
    console.log(buff);

    for (var i = 0; i < 30; i++) {
        if (i % 3 === 0) {
            var dep = {};
            dep.time = buff[i];
            dep.line = buff[i + 1];
            dep.to = buff[i + 2];
            deps.push(dep);
        }
    }
    fillStations(deps);
    $('#notif').text("");
}

function fillStations(stations) {
    var table = $("#tbody");
    table.html("");

    var destset = ["Weiden West", "Junkersdorf", "Universität", "Sülz"];

    stations.forEach(function (stat) {
        if (destset.indexOf(stat.to) != -1) {
            table.append("<tr class='highlight'><td>" + stat.line + "</td><td>" + stat.to + "</td><td>" + stat.time + "</td></tr>");
        } else {
            table.append("<tr><td>" + stat.line + "</td><td>" + stat.to + "</td><td>" + stat.time + "</td></tr>");
        }
    });
}

function loadClock() {

    // Format: Samstag, 21. Januar 2017

    var displayDate = $('#date');
    var displayClock = $('#clock');

    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var weekday = date.getDay();
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();

    hours < 10 ? hours = "0" + hours : null;
    minutes < 10 ? minutes = "0" + minutes : null;

    displayDate.text(days[weekday] + ", " + day + ". " + months[month] + " " + year);
    displayClock.text(hours + ":" + minutes);
}

function loadDepartures() {
    $.ajax({
        url: "http://www.kvb-koeln.de/qr/" + params.depID,
        type: 'GET',
        success: function (res) {
            console.log(res);
            getStations(res);
            $('#notif').text("");
        },
        error: function (err) {
            console.log("Error");
            console.log(err);
            $('#notif').text("Warning! Old data!");
        }
    });
}

function loadDeparturesBerlin() {
    console.log("loading depts");
    var link = "https://fahrinfo.bvg.de/Fahrinfo/bin/stboard.bin/dn?boardType=depRT&application=FILTER&view=STATIONINFO&maxJourneys=20&REQProduct_5_name=yes&REQProduct_6_name=yes&REQProduct_0_name=yes&REQProduct_1_name=yes&REQProduct_2_name=yes&REQProduct_3_name=yes&REQProduct_4_name=yes&input=+S+Hackescher+Markt+%28Berlin%29&REQ0JourneyStopsSID=A%3D1%40O%3DS+Hackescher+Markt+%28Berlin%29%40X%3D13402359%40Y%3D52522605%40U%3D86%40L%3D900100002%40B%3D1%40p%3D1512043087%40&REQ0JourneyProduct_prod_list_6=0000001000000000&REQ0JourneyProduct_prod_list_0=1000000000000000&REQ0JourneyProduct_prod_list_1=0100000000000000&REQ0JourneyProduct_prod_list_2=0010000000000000&REQ0JourneyProduct_prod_list_3=0001000000000000&REQ0JourneyProduct_prod_list_4=0000100000000000&existBikeEverywhere=yes&selectDate=today&timeselectEnd=Zurücksetzen&start="

    $.ajax({
        url: link,
        type: 'GET',
        success: function (res) {
            console.log("success");
            getStationBerlin(res);
        },
        error: function (err) {
            console.log("Error");
            console.log(err);
        }
    });

}

function loadWeather() {
    var weather = $('#weather').weatherWidget({
        cacheTime: 1,
        lat: 50.941357,
        lon: 6.958307,
        key: params.forecastApi,
        celsius: true,
        imgPath: "./weather/img/"
    });
}

function loadCalendar() {
    var calendar = $('#calendar').fullCalendar({
        googleCalendarApiKey: params.calendarApi,
        locale: "de",
        timeFormat: "HH:mm",
        height: 620,
        eventSources: [
            {
                googleCalendarId: params.calendarIDs[0]
            },
            {
                googleCalendarId: params.calendarIDs[1]
            }
        ]
    });
}


$(function () {

    loadClock();

    loadWeather();

    loadCalendar();

    loadDepartures();

//    loadDeparturesBerlin();

    setInterval(function () {
        $('#calendar').fullCalendar('refetchEvents');
    }, 1000 * 60 * 60);

    setInterval(function () {
        $('#weather').html("");
        loadWeather();
    }, 1000 * 60 * 30);

    setInterval(function () {
        loadDepartures();
    }, 1000 * 15);

    setInterval(function () {
        loadClock();
    }, 1000 * 10);
});
