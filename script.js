var forecastapi = "c15c48c01880d073edbbdff872853b14";
var calapi = "AIzaSyDW7fB2DD_JngTXtuCIuvlnSOYH0nji_E8";

var monate = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "November", "Dezember"];

var tage = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

var punkt = false;

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
        imgPath:"./weather/img/"
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
//function startTime() {
//    var time = $('#time h1');
//    var datum = $('#time p');
//    var today = new Date();
//    var h = today.getHours();
//    var month = today.getMonth();
//    var date = today.getDate();
//    var day = today.getDay();
//    var year = today.getFullYear();
//    var m = today.getMinutes();
//    var s = today.getSeconds();
//    m = checkTime(m);
//    s = checkTime(s);
//    if(punkt){
//        punkt = !punkt;
//        time[0].innerHTML = h + ":" + m;
//    } else {
//        punkt = !punkt;
//        time[0].innerHTML = h + "    " + m;
//    }
//
//    time[0].innerHTML = h + ":" + m;
//    datum[0].innterHTML = tage[day] + ", "+ date+ ". " + monate[month] +" "+ year;
//
//    var t = setTimeout(startTime, 500);
//}
//function checkTime(i) {
//    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
//    return i;
//}

function todayFont(){
    var date = new Date().getDate();

    $('.fc-day-number').each(function(){
        if(this.innerHTML == date){
            $(this).addClass("today");
        }
    });
}

$(function(){
    loadWeather();

    loadCalendar();

    loadDepartures();

    todayFont();
});




//setInterval(function(){
//    $('#calendar').fullCalendar('refetchEvents');
//}, 1000*10);
//
//setInterval(function(){
//    $('#weather').html("");
//    loadWeather();
//}, 1000*60*10);
//
//setInterval(function(){
//    loadDepartures();
//}, 1000*10);
