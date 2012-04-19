/*
* jQuery Nivo Slider v2.7.1
* http://nivo.dev7studios.com
*
* Copyright 2011, Gilbert Pellegrom
* Free to use and abuse under the MIT license.
* http://www.opensource.org/licenses/mit-license.php
* 
* March 2010
* Modified in February 2012
*/

(function($) {
    var NivoSlider = function(element, options) {
        //Defaults are below
        var settings = $.extend({}, $.fn.nivoSlider.defaults, options);

        //Useful variables. Play carefully.
        var vars = {
            currentSlide: 0,
            currentImage: '',
            totalSlides: 0,
            running: false,
            paused: false,
            stop: false
        };

        //Get this slider
        var slider = $(element);
        slider.data('nivo:vars', vars);
        slider.css('position', 'relative');
        slider.addClass('nivoSlider');

        //Find our slider children
        var kids = slider.children();
        kids.each(function() {
            var child = $(this);
            var link = '';
            if (!child.is('img')) {
                if (child.is('a')) {
                    child.addClass('nivo-imageLink');
                    link = child;
                }
                child = child.find('img:first');
            }
            //Get img width & height
            var childWidth = child.width();
            if (childWidth == 0) childWidth = child.attr('width');
            var childHeight = child.height();
            if (childHeight == 0) childHeight = child.attr('height');
            //Resize the slider
            if (childWidth > slider.width()) {
                slider.width(childWidth);
            }
            if (childHeight > slider.height()) {
                slider.height(childHeight);
            }
            if (link != '') {
                link.css('display', 'none');
            }
            child.css('display', 'none');
            vars.totalSlides++;
        });

        //If randomStart
        if (settings.randomStart) {
            settings.startSlide = Math.floor(Math.random() * vars.totalSlides);
        }

        //Set startSlide
        if (settings.startSlide > 0) {
            if (settings.startSlide >= vars.totalSlides) settings.startSlide = vars.totalSlides - 1;
            vars.currentSlide = settings.startSlide;
        }

        //Get initial image
        if ($(kids[vars.currentSlide]).is('img')) {
            vars.currentImage = $(kids[vars.currentSlide]);
        } else {
            vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
        }

        //Show initial link
        if ($(kids[vars.currentSlide]).is('a')) {
            $(kids[vars.currentSlide]).css('display', 'block');
        }

        //Set first background
        slider.css('background', 'url("' + vars.currentImage.attr('src') + '") no-repeat');

        //Create caption
        slider.append(
            $('<div class="nivo-caption"><p></p></div>').css({ display: 'none', opacity: settings.captionOpacity })
        );

        // Cross browser default caption opacity
        $('div.nivo-caption', slider).css('opacity', 0);

        // Process caption function
        var processCaption = function(settings) {
            var nivoCaption = $('div.nivo-caption', slider);
            if (vars.currentImage.attr('title') != '' && vars.currentImage.attr('title') != undefined) {
                var title = vars.currentImage.attr('title');
                if (title.substr(0, 1) == '#') title = $(title).html();

                if (nivoCaption.css('opacity') != 0) {
                    nivoCaption.find('p').stop().fadeTo(settings.animSpeed, 0, function() {
                        $(this).html(title);
                        $(this).stop().fadeTo(settings.animSpeed, 1);
                    });
                } else {
                    nivoCaption.find('p').html(title);
                }
                nivoCaption.stop().fadeTo(settings.animSpeed, settings.captionOpacity);
            } else {
                nivoCaption.stop().fadeTo(settings.animSpeed, 0);
            }
        };

        //Process initial  caption
        processCaption(settings);

        //In the words of Super Mario "let's a go!"
        var timer = 0;
        if (!settings.manualAdvance && kids.length > 1) {
            timer = setInterval(function() { nivoRun(slider, kids, settings, false); }, settings.pauseTime);
        }

        //Add Direction nav
        if (settings.directionNav) {
            slider.append('<div class="nivo-directionNav"><a class="nivo-prevNav">' + settings.prevText + '</a><a class="nivo-nextNav">' + settings.nextText + '</a></div>');

            //Hide Direction nav
            if (settings.directionNavHide) {
                $('div.nivo-directionNav', slider).hide();
                slider.hover(function() {
                    $('div.nivo-directionNav', slider).show();
                }, function() {
                    $('div.nivo-directionNav', slider).hide();
                });
            }

            $('a.nivo-prevNav', slider).live('click', function() {
                if (vars.running) return false;
                clearInterval(timer);
                timer = '';
                vars.currentSlide -= 2;
                nivoRun(slider, kids, settings, 'prev');
            });

            $('a.nivo-nextNav', slider).live('click', function() {
                if (vars.running) return false;
                clearInterval(timer);
                timer = '';
                nivoRun(slider, kids, settings, 'next');
            });
        }

        //Add Control nav
        if (settings.controlNav) {
            var nivoControl = $('<div class="nivo-controlNav"></div>');
            slider.append(nivoControl);
            for (var i = 0; i < kids.length; i++) {
                if (settings.controlNavThumbs) {
                    var child = kids.eq(i);
                    if (!child.is('img')) {
                        child = child.find('img:first');
                    }
                    if (settings.controlNavThumbsFromRel) {
                        nivoControl.append('<a class="nivo-control" rel="' + i + '"><img src="' + child.attr('rel') + '" alt="" /></a>');
                    } else {
                        nivoControl.append('<a class="nivo-control" rel="' + i + '"><img src="' + child.attr('src').replace(settings.controlNavThumbsSearch, settings.controlNavThumbsReplace) + '" alt="" /></a>');
                    }
                } else {
                    nivoControl.append('<a class="nivo-control" rel="' + i + '">' + (i + 1) + '</a>');
                }

            }
            //Set initial active link
            $('div.nivo-controlNav a:eq(' + vars.currentSlide + ')', slider).addClass('active');

            $('div.nivo-controlNav a', slider).live('click', function() {
                if (vars.running) return false;
                if ($(this).hasClass('active')) return false;
                clearInterval(timer);
                timer = '';
                slider.css('background', 'url("' + vars.currentImage.attr('src') + '") no-repeat');
                vars.currentSlide = $(this).attr('rel') - 1;
                nivoRun(slider, kids, settings, 'control');
            });
        }

        //Keyboard Navigation
        if (settings.keyboardNav) {
            $(window).keypress(function(event) {
                //Left
                if (event.keyCode == '37') {
                    if (vars.running) return false;
                    clearInterval(timer);
                    timer = '';
                    vars.currentSlide -= 2;
                    nivoRun(slider, kids, settings, 'prev');
                }
                //Right
                if (event.keyCode == '39') {
                    if (vars.running) return false;
                    clearInterval(timer);
                    timer = '';
                    nivoRun(slider, kids, settings, 'next');
                }
            });
        }

        //For pauseOnHover setting
        if (settings.pauseOnHover) {
            slider.hover(function() {
                vars.paused = true;
                clearInterval(timer);
                timer = '';
            }, function() {
                vars.paused = false;
                //Restart the timer
                if (timer == '' && !settings.manualAdvance) {
                    timer = setInterval(function() { nivoRun(slider, kids, settings, false); }, settings.pauseTime);
                }
            });
        }

        //Event when Animation finishes
        slider.bind('nivo:animFinished', function() {
            vars.running = false;
            //Hide child links
            $(kids).each(function() {
                if ($(this).is('a')) {
                    $(this).css('display', 'none');
                }
            });
            //Show current link
            if ($(kids[vars.currentSlide]).is('a')) {
                $(kids[vars.currentSlide]).css('display', 'block');
            }
            //Restart the timer
            if (timer == '' && !vars.paused && !settings.manualAdvance) {
                timer = setInterval(function() { nivoRun(slider, kids, settings, false); }, settings.pauseTime);
            }
            //Trigger the afterChange callback
            settings.afterChange.call(this);
        });

        // Add slices for slice animations
        var createSlices = function(slider, settings, vars) {
            var initialWidth = '',
                initialLeft = '',
                sliceWidth = 0,
                i = 0;
            for (i = 0; i < settings.slices; i++) {
                sliceWidth = Math.round(slider.width() / settings.slices);
                initialWidth = (slider.width() - (sliceWidth * i)) + 'px';
                initialLeft = (sliceWidth * i) + 'px';
                if (i == settings.slices - 1) {
                    slider.append(
                        $('<div class="nivo-slice"></div>').data({
                            'initialwidth': initialWidth,
                            'initialleft': initialLeft
                        }).css({
                            left: initialLeft, width: initialWidth,
                            height: '0px',
                            opacity: '0',
                            background: '#fff url("' + vars.currentImage.attr('src') + '") no-repeat -' + ((sliceWidth + (i * sliceWidth)) - sliceWidth) + 'px 0%'
                        })
                    );
                } else {
                    slider.append(
                        $('<div class="nivo-slice"></div>').data({
                            'initialwidth': sliceWidth + 'px',
                            'initialleft': initialLeft
                        }).css({
                            left: initialLeft, width: sliceWidth + 'px',
                            height: '0px',
                            opacity: '0',
                            display: 'none',
                            background: '#fff url("' + vars.currentImage.attr('src') + '") no-repeat -' + ((sliceWidth + (i * sliceWidth)) - sliceWidth) + 'px 0%'
                        })
                    );
                }
            }
        };
        
        createSlices(slider, settings, slider.data('nivo:vars'));

        var updateSlices = function($nslices, currentImage) {
            $nslices.each(function() {
                $(this).css({
                    opacity: 0,
                    top: 'auto',
                    bottom: 'auto',
                    right: 'auto',
                    left: $(this).data('initialleft'),
                    width: $(this).data('initialwidth'),
                    height: 0,
                    backgroundImage: 'url(' + currentImage.attr('src') + ')'
                });
            });
        };

        // Add boxes for box animations
        var createBoxes = function(slider, settings, vars) {
            var boxWidth = Math.round(slider.width() / settings.boxCols),
                initialWidth,
                boxHeight = Math.round(slider.height() / settings.boxRows);

            for (var rows = 0; rows < settings.boxRows; rows++) {
                for (var cols = 0; cols < settings.boxCols; cols++) {
                    if (cols == settings.boxCols - 1) {
                        initialWidth = (slider.width() - (boxWidth * cols)) + 'px';
                        slider.append(
                            $('<div class="nivo-box"></div>').data({
                                'initialwidth': initialWidth,
                                'initialheight': boxHeight + 'px'
                            }).css({
                                opacity: 0,
                                left: (boxWidth * cols) + 'px',
                                top: (boxHeight * rows) + 'px',
                                width: (slider.width() - (boxWidth * cols)) + 'px',
                                height: boxHeight + 'px',
                                background: '#fff url("' + vars.currentImage.attr('src') + '") no-repeat -' + ((boxWidth + (cols * boxWidth)) - boxWidth) + 'px -' + ((boxHeight + (rows * boxHeight)) - boxHeight) + 'px'
                            })
                        );
                    } else {
                        slider.append(
                            $('<div class="nivo-box"></div>').data({
                                'initialwidth': boxWidth + 'px',
                                'initialheight': boxHeight + 'px'
                            }).css({
                                opacity: 0,
                                left: (boxWidth * cols) + 'px',
                                top: (boxHeight * rows) + 'px',
                                width: boxWidth + 'px',
                                height: boxHeight + 'px',
                                background: '#fff url("' + vars.currentImage.attr('src') + '") no-repeat -' + ((boxWidth + (cols * boxWidth)) - boxWidth) + 'px -' + ((boxHeight + (rows * boxHeight)) - boxHeight) + 'px'
                            })
                        );
                    }
                }
            }
        };

        createBoxes(slider, settings, slider.data('nivo:vars'));

        var updateBoxes = function($nboxes, currentImage) {
            $nboxes.each(function() {
                $(this).css({
                    opacity: 0,
                    height: $(this).data('initialheight'),
                    width: $(this).data('initialwidth'),
                    backgroundImage: 'url(' + currentImage.attr('src') + ')'
                });
            });
        };

        // Private run method
        var nivoRun = function(slider, kids, settings, nudge) {
            var vars = slider.data('nivo:vars'),
                $nslices = $('div.nivo-slice', slider),
                $nboxes = $('div.nivo-box', slider);

            //Trigger the lastSlide callback
            if (vars && (vars.currentSlide == vars.totalSlides - 1)) {
                settings.lastSlide.call(this);
            }

            // Stop
            if ((!vars || vars.stop) && !nudge) return false;

            //Trigger the beforeChange callback
            settings.beforeChange.call(this);

            //Set current background before change
            slider.css('background', 'url("' + vars.currentImage.attr('src') + '") no-repeat');

            vars.currentSlide++;
            //Trigger the slideshowEnd callback
            if (vars.currentSlide == vars.totalSlides) {
                vars.currentSlide = 0;
                settings.slideshowEnd.call(this);
            }
            if (vars.currentSlide < 0) vars.currentSlide = (vars.totalSlides - 1);
            //Set vars.currentImage
            if ($(kids[vars.currentSlide]).is('img')) {
                vars.currentImage = $(kids[vars.currentSlide]);
            } else {
                vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
            }
            
            //Set active links
            if (settings.controlNav) {
                $('div.nivo-controlNav a', slider).removeClass('active');
                $('div.nivo-controlNav a:eq(' + vars.currentSlide + ')', slider).addClass('active');
            }

            //Process caption
            processCaption(settings);

            // Remove any slices/boxes from last transition
            $nslices.hide();
            $nboxes.hide();

            var currentEffect = settings.effect;
            //Generate random effect
            if (settings.effect == 'random') {
                var anims = new Array('sliceDownRight', 'sliceDownLeft', 'sliceUpRight', 'sliceUpLeft', 'sliceUpDown', 'sliceUpDownLeft', 'fold', 'fade',
                'boxRandom', 'boxRain', 'boxRainReverse', 'boxRainGrow', 'boxRainGrowReverse');
                currentEffect = anims[Math.floor(Math.random() * (anims.length + 1))];
            }

            //Run random effect from specified set (eg: effect:'fold,fade')
            if (settings.effect.indexOf(',') != -1) {
                var anims = settings.effect.split(',');
                currentEffect = anims[Math.floor(Math.random() * (anims.length))];
            }

            //Custom transition as defined by "data-transition" attribute
            if (vars.currentImage.attr('data-transition')) {
                currentEffect = vars.currentImage.attr('data-transition');
            }

            if (currentEffect == undefined) currentEffect = 'fade';

            //Run effects
            vars.running = true;
            if (currentEffect == 'sliceDown' || currentEffect == 'sliceDownRight' || currentEffect == 'sliceDownLeft') {
                updateSlices($nslices, vars.currentImage);
                var timeBuff = 0;
                var i = 0;
                var slices = $nslices;
                if (currentEffect == 'sliceDownLeft') slices = $nslices._reverse();

                slices.each(function() {
                    var slice = $(this);
                    slice.css({ 'top': '0px' });
                    if (i == settings.slices - 1) {
                        setTimeout(function() {
                            slice.show().animate({ height: '100%', opacity: '1.0' }, settings.animSpeed, '', function() { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function() {
                            slice.show().animate({ height: '100%', opacity: '1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            }
            else if (currentEffect == 'sliceUp' || currentEffect == 'sliceUpRight' || currentEffect == 'sliceUpLeft') {
                updateSlices($nslices, vars.currentImage);
                var timeBuff = 0;
                var i = 0;
                var slices = $nslices;
                if (currentEffect == 'sliceUpLeft') slices = $nslices._reverse();

                slices.each(function() {
                    var slice = $(this);
                    slice.css({ 'bottom': '0px' });
                    if (i == settings.slices - 1) {
                        setTimeout(function() {
                            slice.show().animate({ height: '100%', opacity: '1.0' }, settings.animSpeed, '', function() { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function() {
                            slice.show().animate({ height: '100%', opacity: '1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            }
            else if (currentEffect == 'sliceUpDown' || currentEffect == 'sliceUpDownRight' || currentEffect == 'sliceUpDownLeft') {
                updateSlices($nslices, vars.currentImage);
                var timeBuff = 0;
                var i = 0;
                var v = 0;
                var slices = $nslices;
                if (currentEffect == 'sliceUpDownLeft') slices = $nslices._reverse();

                slices.each(function() {
                    var slice = $(this);
                    if (i == 0) {
                        slice.css('top', '0px');
                        i++;
                    } else {
                        slice.css('bottom', '0px');
                        i = 0;
                    }

                    if (v == settings.slices - 1) {
                        setTimeout(function() {
                            slice.show().animate({ height: '100%', opacity: '1.0' }, settings.animSpeed, '', function() { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function() {
                            slice.show().animate({ height: '100%', opacity: '1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    v++;
                });
            }
            else if (currentEffect == 'fold') {
                var timeBuff = 0,
                    i = 0;

                updateSlices($nslices, vars.currentImage);
                $nslices.each(function() {
                    var slice = $(this),
                        origWidth = this.style.width;
                    slice.css({ top: '0px', height: '100%', width: '0px' });
                    if (i == settings.slices - 1) {
                        setTimeout(function() {
                            slice.show().animate({ width: origWidth, opacity: '1.0' }, settings.animSpeed, '', function() { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function() {
                            slice.show().animate({ width: origWidth, opacity: '1.0' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 50;
                    i++;
                });
            }
            else if (currentEffect == 'fade') {
                updateSlices($nslices, vars.currentImage);
                var firstSlice = $($nslices[0]);
                firstSlice.css({
                    'height': '100%',
                    'width': slider.width() + 'px'
                });
                firstSlice.show().animate({ opacity: '1.0' }, (settings.animSpeed * 2), '', function() { slider.trigger('nivo:animFinished'); });
            }
            else if (currentEffect == 'slideInRight') {
                updateSlices($nslices, vars.currentImage);
                var firstSlice = $($nslices[0]);
                firstSlice.css({
                    'height': '100%',
                    'width': '0px',
                    'opacity': '1'
                });

                firstSlice.show().animate({ width: slider.width() + 'px' }, (settings.animSpeed * 2), '', function() { slider.trigger('nivo:animFinished'); });
            }
            else if (currentEffect == 'slideInLeft') {
                updateSlices($nslices, vars.currentImage);
                var firstSlice = $($nslices[0]);
                firstSlice.css({
                    'height': '100%',
                    'width': '0px',
                    'opacity': '1',
                    'left': '',
                    'right': '0px'
                });

                firstSlice.show().animate({ width: slider.width() + 'px' }, (settings.animSpeed * 2), '', function() {
                    // Reset positioning
                    firstSlice.css({
                        'left': '0px',
                        'right': ''
                    });
                    slider.trigger('nivo:animFinished');
                });
            }
            else if (currentEffect == 'boxRandom') {
                updateBoxes($nboxes, vars.currentImage);
                var totalBoxes = settings.boxCols * settings.boxRows;
                var i = 0;
                var timeBuff = 0;

                var boxes = shuffle($nboxes);
                boxes.each(function() {
                    var box = $(this);
                    if (i == totalBoxes - 1) {
                        setTimeout(function() {
                            box.show().animate({ opacity: '1' }, settings.animSpeed, '', function() { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff));
                    } else {
                        setTimeout(function() {
                            box.show().animate({ opacity: '1' }, settings.animSpeed);
                        }, (100 + timeBuff));
                    }
                    timeBuff += 20;
                    i++;
                });
            }
            else if (currentEffect == 'boxRain' || currentEffect == 'boxRainReverse' || currentEffect == 'boxRainGrow' || currentEffect == 'boxRainGrowReverse') {
                var totalBoxes = settings.boxCols * settings.boxRows
                i = 0,
                    timeBuff = 0,
                // Split boxes into 2D array
                    rowIndex = 0,
                    colIndex = 0,
                    box2Darr = new Array(),
                    box2Darr[rowIndex] = new Array(),
                    boxes = $nboxes,
                    cols = 0,
                    rows = 0,
                    maxCols = settings.boxCols * 2,
                    prevCol = 0;

                updateBoxes($nboxes, vars.currentImage);
                if (currentEffect === 'boxRainReverse' || currentEffect === 'boxRainGrowReverse') {
                    boxes = $nboxes._reverse();
                }
                boxes.each(function() {
                    box2Darr[rowIndex][colIndex] = $(this);
                    colIndex++;
                    if (colIndex == settings.boxCols) {
                        rowIndex++;
                        colIndex = 0;
                        box2Darr[rowIndex] = new Array();
                    }
                });

                // Run animation
                for (cols = 0; cols < maxCols; cols++) {
                    prevCol = cols;
                    for (rows = 0; rows < settings.boxRows; rows++) {
                        if (prevCol >= 0 && prevCol < settings.boxCols) {
                            /* Due to some weird JS bug with loop vars 
                            being used in setTimeout, this is wrapped
                            with an anonymous function call */
                            (function(row, col, time, i, totalBoxes) {
                                var box = $(box2Darr[row][col]),
                                    w = box[0].style.width,
                                    h = box[0].style.height;
                                if (currentEffect == 'boxRainGrow' || currentEffect == 'boxRainGrowReverse') {
                                    box.css({ width: 0, height: 0 });
                                }
                                if (i == totalBoxes - 1) {
                                    setTimeout(function() {
                                        box.show().animate({ opacity: '1', width: w, height: h }, settings.animSpeed / 1.3, '', function() { slider.trigger('nivo:animFinished'); });
                                    }, (100 + time));
                                } else {
                                    setTimeout(function() {
                                        box.show().animate({ opacity: '1', width: w, height: h }, settings.animSpeed / 1.3);
                                    }, (100 + time));
                                }
                            })(rows, prevCol, timeBuff, i, totalBoxes);
                            i++;
                        }
                        prevCol--;
                    }
                    timeBuff += 100;
                }
            }
        }

        // Shuffle an array
        var shuffle = function(arr) {
            for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
            return arr;
        }

        // For debugging
        var trace = function(msg) {
            if (this.console && typeof console.log != "undefined")
                console.log(msg);
        }

        // Start / Stop
        this.stop = function() {
            if (!$(element).data('nivo:vars').stop) {
                $(element).data('nivo:vars').stop = true;
                trace('Stop Slider');
            }
        }

        this.start = function() {
            if ($(element).data('nivo:vars').stop) {
                $(element).data('nivo:vars').stop = false;
                trace('Start Slider');
            }
        }

        //Trigger the afterLoad callback
        settings.afterLoad.call(this);

        return this;
    };

    $.fn.nivoSlider = function(options) {

        return this.each(function(key, value) {
            var element = $(this);
            // Return early if this element already has a plugin instance
            if (element.data('nivoslider')) return element.data('nivoslider');
            // Pass options to plugin constructor
            var nivoslider = new NivoSlider(this, options);
            // Store plugin object in this element's data
            element.data('nivoslider', nivoslider);
        });

    };

    //Default settings
    $.fn.nivoSlider.defaults = {
        effect: 'random',
        slices: 15,
        boxCols: 8,
        boxRows: 4,
        animSpeed: 500,
        pauseTime: 3000,
        startSlide: 0,
        directionNav: true,
        directionNavHide: true,
        controlNav: true,
        controlNavThumbs: false,
        controlNavThumbsFromRel: false,
        controlNavThumbsSearch: '.jpg',
        controlNavThumbsReplace: '_thumb.jpg',
        keyboardNav: true,
        pauseOnHover: true,
        manualAdvance: false,
        captionOpacity: 0.8,
        prevText: 'Prev',
        nextText: 'Next',
        randomStart: false,
        beforeChange: function() { },
        afterChange: function() { },
        slideshowEnd: function() { },
        lastSlide: function() { },
        afterLoad: function() { }
    };

    $.fn._reverse = [].reverse;

})(jQuery);