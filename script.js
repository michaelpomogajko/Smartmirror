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

    var depset = new Set(["Weiden West", "Junkersdorf", "Universität", "Sülz"]);

    stations.forEach(function(stat){
        if(depset.has(stat.to)) {

            table.append("<tr><td>"+stat.line+"</td><td>"+stat.to+"</td><td>"+stat.time+"</td></tr>");

            /* ECMA6
            table.append(`<tr class="highlight">
                <td>${stat.line}</td>
                <td>${stat.to}</td>
                <td>${stat.time}</td>
                </tr>`);

            */

        } else {
            table.append("<tr><td>"+stat.line+"</td><td>"+stat.to+"</td><td>"+stat.time+"</td></tr>");
        }
    });
}

function loadClock(){

    // Format: Samstag, 21. Januar 2017

    var displayDate = $('#date');
    var displayClock = $('#clock');

    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var day = date.getDay();
    var hours = date.getHours();
    var minutes = date.getMinutes();

    hours < 10 ? hours = "0"+hours:null;
    minutes < 10 ? minutes = "0"+minutes:null;

    displayDate.text(days[day] +", "+day+". "+months[month]+" "+year);
    displayClock.text(hours+":"+minutes);
}

function loadDepartures(){
    $.ajax({
        url: "http://www.kvb-koeln.de/qr/"+params.depID,
        type: 'GET',
        success: function(res){
            getStations(res.responseText);
            $('#notif').text("");
        },
        error: function(err){
            $('#notif').text("Warning! Old data!");
        }
    });
}

function loadWeather(){
    var weather = $('#weather').weatherWidget({
        cacheTime: 1,
        lat: 50.941357,
        lon: 6.958307,
        key: params.forecastApi,
        celsius: true,
        imgPath:"./weather/img/"
    });
}

function loadCalendar(){
    var calendar = $('#calendar').fullCalendar({
        googleCalendarApiKey: params.calendarApi,
        locale: "de",
        timeFormat: "HH:mm",
        height: 650,
        eventSources: [
            {
                googleCalendarId: params.calenderaIDs[0]
            },
            {
                googleCalendarId: params.calenderaIDs[1]
            }
        ]
    });
}


function todayBackgroundColor(){
    var date = new Date().getDate();

    $('.fc-day-number').each(function(){
        if(this.innerHTML == date){
            $(this).addClass("today");
        }
    });
}

$(function(){
    todayBackgroundColor();

    loadClock();

    loadWeather();

    loadCalendar();

    loadDepartures();


    setInterval(function(){
        $('#calendar').fullCalendar('refetchEvents');
    }, 1000*60*60);

    setInterval(function(){
        $('#weather').html("");
        loadWeather();
    }, 1000*60*30);

    setInterval(function(){
        loadDepartures();
    }, 1000*10);

    setInterval(function(){
        loadClock();
    }, 1000*10);


});
