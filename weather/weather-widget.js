/*
 * jQuery Weather Widget
 * 2016 Matt O'Connell <mattoconnell408@gmail.com>
 * License: MIT
 */

(function($, ls) {
    "use strict";

    /*
     * Only gets called when we're using $('$el').weatherWidget format
     */
    var WeatherWidget = function(el, customOptions) {
        var _ = this;
        _.$el = $(el).addClass('weather-widget');
        _.defaults = defaults;

        _.init = function() {
            _.pollAPI(customOptions, _.makeWidget);
        };

        if(_.defaults.geoLocate && typeof geoLite !== 'undefined' && typeof geoLite === 'object' && !geoLite.wait) {
                document.body.addEventListener('onLocateSuccess', function() {
                    var coords = {
                        lat: geoLite.lat,
                        lon: geoLite.lon
                    };
                    customOptions = $.extend(customOptions, coords);
                    _.init();
                });
                document.body.addEventListener('onLocateFail', function() {
                    _.init();
                });
        } else {
            _.init();
        }
    };

    /*
     * Default Values
     */
    var defaults = {
        lat: '40.748441',
        lon: '-73.985793',
        url: 'https://api.forecast.io/forecast/',
        key: null,
        cacheTime: 30,
        geoLocate: true,
        celsius: false,
        imgPath: 'bower_components/weather-widget/dist/img/',
        showTitle: true,
        localeDetect: false
    };

    /*
     * Convert fahranheit to celsius
     */
    var convert = function(f) {
        return Math.round((f - 32) * 5/9);
    };

    /*
     * Configure parameters for API
     */
    WeatherWidget.prototype.makeURL = function(options) {
        return options.url + options.key + '/' + options.lat + ',' + options.lon;
    };

    /*
     * Main API polling function
     */
    WeatherWidget.prototype.pollAPI = function(options, callback) {
        options = $.extend(defaults, options);
        var _ = this,
            url = _.makeURL(options),
            data = ls ? ls.get(url, options.cacheTime) : false;
        _.options = options;
        if(data) {
            callback.call(_, data);
            return false;
        }
        $.ajax({
            dataType: 'jsonp',
            url: url,
            success: function(data) {
                if(ls)
                    ls.set(url, data);
                try {
                    if(callback) {
                        callback.call(_, data);
                    }
                } catch(e) {
                    _.$el.hide();
                    console.log('Error: ', e);
                }
            },
            error: function(e) {
                console.log(e);
            }
        });
    };

    var days = [
        'Sonntag',
        'Montag',
        'Dienstag',
        'Mittwoch',
        'Donnerstag',
        'Freitag',
        'Samstag'
    ];

    WeatherWidget.prototype.makeWidget = function(apiData) {

        var shouldConvert = false;
        // If localeDetect is set, convert if not US
        if(this.options.localeDetect) {
            var locale = navigator.language || 'de-de';
            if(!~locale.toLowerCase().indexOf('de-de')) {
                shouldConvert = true;
            }
        }

        // If Celsius option is set, convert
        if(this.options.celsius) {
            shouldConvert = true;
        }

        var currently = apiData.currently,
            hourly = apiData.hourly.data,
            daily = apiData.daily.data,
            _ = this,
            currentTemp = Math.round(shouldConvert ? convert(currently.temperature) : currently.temperature);

        var symbol = shouldConvert ? 'C' : 'F';

        var $widget = $('<div>')
            .addClass('widget')
            .addClass('weather');

        /* Main Header */
        var $header = $('<header>').addClass('title');

        var $expandButton =
            $('<a>')
                .addClass('expand')
                .addClass('more')
                .attr('href', '#')
                .text('7 Tage Vorhersage');

        $header.append(
            $('<h2>')
                .addClass('name')
                .text('Kölner Wetter')
        ).append(
            $('<span>')
                .addClass('description')
                .text('')
        ).append(
            $expandButton
        );

        if(_.options.showTitle) {
            $widget.append($header);
        }

        /* Current Section */
        var $current = $('<section>').addClass('current');
        $current.append(
            $('<img>')
                .addClass('icon')
                .attr('src', _.options.imgPath + currently.icon + '.svg')
        ).append(
            $('<span>')
                .addClass('temperature')
                .html(currentTemp + '&deg;' + symbol)
        ).append(
            $('<span>')
                .addClass('description')
                .text(currently.summary)
        );
        $widget.append($current);


        /* Hours Section */
        var $hourly = $('<section>').addClass('hourly');

        var hourPrototype = $('<div>')
            .addClass('hour')
            .addClass('five')
            .append(
                $('<span>').addClass('time')
            )
            .append(
                $('<img>').addClass('icon')
            )
            .append(
                $('<span>').addClass('temperature')
            );

        for(var i = 0; i < 5; i++) {
            var temp = Math.round(hourly[i + 1].temperature),
                icon = hourly[i + 1].icon,
                hour = (new Date()).getHours() + i,
                ampm = hour >= 12 ? 'pm' : 'am';
            temp = shouldConvert ? convert(temp) : temp;
            if(hour < 10) {
                hour = "0"+hour;
                //hour = Math.abs(23 - hour);
                ampm = 'am';
            }
            //hour = hour % 12;
            //hour = hour ? hour : 12;

            var hourClone = hourPrototype.clone();

            hourClone.find('.time')
                .text(hour);

            hourClone.find('.icon')
                .attr('src', _.options.imgPath + icon + '.svg');

            hourClone.find('.temperature')
                .html(temp + '&deg;');

            $hourly.append(hourClone);
        }
        $widget.append($hourly);

        /* Forecast Section */
        var $expandWrapper = $('<div>')
            .addClass('expand-wrapper')
            .addClass('hide');

        var $forecasts = $('<section>').addClass('forecasts');

        $forecasts.append(
            $('<header>')
                .addClass('forecast')
                .append(
                    $('<span>')
                        .addClass('day')
                        .text('7 Tage Vorhersage')
                )
                .append(
                    $('<span>')
                        .addClass('high')
                        .text('Max')
                )
                .append(
                    $('<span>')
                        .addClass('low')
                        .text('Min')
                )
        );


        for(var k = 0; k < 7; k++) {
            var day = days[new Date(daily[k + 1].time * 1000).getDay()],
                icon = daily[k + 1].icon,
                max = Math.round(daily[k + 1].temperatureMax),
                min = Math.round(daily[k + 1].temperatureMin);
            max = shouldConvert ? convert(max) : max;
            min = shouldConvert ? convert(min) : min;

            $forecasts.append(
                $('<div>')
                    .addClass('forecast')
                    .append(
                        $('<span>')
                            .addClass('day')
                            .text(day)
                    )
                    .append(
                        $('<img>')
                            .addClass('icon')
                            .attr('src', _.options.imgPath + icon + '.svg')
                    )
                    .append(
                        $('<span>')
                            .addClass('high')
                            .html(max + '&deg;')
                    )
                    .append(
                        $('<span>')
                            .addClass('low')
                            .html(min + '&deg;')
                    )
            );
        }

        $expandWrapper.append($forecasts);
        $widget.append($expandWrapper);


        $expandButton.on('click', function(e){
            e.preventDefault();
            if ($expandWrapper.hasClass('hide')) {
                $expandButton.removeClass('more').addClass('less');
                $expandWrapper.stop().slideDown().removeClass('hide');
            } else {
                $expandButton.removeClass('less').addClass('more');
                $expandWrapper.stop().slideUp().addClass('hide');
            }
        });

        _.$el.append($widget);
    };

    // Extend JQuery fn for $('$id').weatherWidget()
    $.fn.weatherWidget = function(options) {
        return this.each(function() {
            (new WeatherWidget(this, options));
        });
    };

    // Extend JQuery for $.weatherWidget()
    // ONLY prototype(static) methods
    $.extend({
        weatherWidget: WeatherWidget.prototype
    });

})(jQuery, typeof lsLite != 'undefined' ? lsLite : null);
