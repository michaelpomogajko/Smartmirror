var forecastapi = "c15c48c01880d073edbbdff872853b14";
var calapi = "AIzaSyDW7fB2DD_JngTXtuCIuvlnSOYH0nji_E8";

function getStations(data){
    var buff = [];

    var str = data.substring(data.indexOf("<span class=\"stand"), data.indexOf("<div id=\"mobil_impressum"));

    $($(str)[2]).find('td').each(function(){
        buff.push(this);
    });

    var deps = [];

    for (var i = 0; i < 30; i++) {
        if(i%3 === 0){
            var dep = {};
            dep.line = buff[i].innerText;
            dep.to = buff[i+1].innerText;
            dep.time = buff[i+2].innerText;
            deps.push(dep);
        }
    }
    fillStations(deps);

}

function fillStations(stations){
    var time = $("#deptime");
    time.html(now());
    var table = $("#tbody");
    table.html("");

    stations.forEach(function(stat){
        table.append(`<tr>
            <td>${stat.line}</td>
            <td>${stat.to}</td>
            <td>${stat.time}</td>
            </tr>`);
    });
}


function loadDepartures(){
    $.ajax({
        url: 'http://www.kvb-koeln.de/qr/517/',
        type: 'GET',
        success: function(res){
            getStations(res.responseText);
        }
    });
}

function loadWeather(){
    var weather = $('#weather').weatherWidget({
        cacheTime: 1,
        lat: 50.941357,
        lon: 6.958307,
        key: secret.forecastapi,
        celsius: true,
        imgPath:"/weather/"
    });
}

function loadCalendar(){
    var calendar = $('#calendar').fullCalendar({
        googleCalendarApiKey: secret.calendarapi,
        locale: "de",
        timeFormat: "HH:mm",
        eventSources: [
            {
                googleCalendarId: secret.calendar_privat
            },
            {
                googleCalendarId: secret.calendar_fh
            }
        ]
    });
}

function now(){
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();

    if (hours < 10) {
        hours = "0"+hours;
    }

    if (minutes < 10) {
        minutes = "0"+minutes;
    }

    return `${hours}:${minutes}`;
}

$(function(){
    loadWeather();

    loadCalendar();

    loadDepartures();
});


setInterval(function(){
    $('#calendar').fullCalendar('refetchEvents');
}, 1000*10);

setInterval(function(){
    $('#weather').html("");
    loadWeather();
}, 1000*60*10);

setInterval(function(){
    loadDepartures();
}, 1000*10);
