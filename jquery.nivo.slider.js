/*
 * jQuery Nivo Slider v3.0.1
 * http://nivo.dev7studios.com
 *
 * Copyright 2012, Dev7studios
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {
    var NivoSlider = function(element, options){
        // Defaults are below
        var settings = $.extend({}, $.fn.nivoSlider.defaults, options);

        // Useful variables. Play carefully.
        var vars = {
            currentSlide: 0,
            currentImage: '',
            totalSlides: 0,
            running: false,
            paused: false,
            stop: false,
            controlNavEl: false
        };

        // Get this slider
        var slider = $(element);
        slider.data('nivo:vars', vars).addClass('nivoSlider');

        // Find our slider children
        var kids = slider.children();
        kids.each(function() {
            var child = $(this),
                link = '';
            if(!child.is('img')){
                if(child.is('a')){
                    child.addClass('nivo-imageLink');
                    link = child;
                }
                child = child.find('img:first');
            }

            if(link !== ''){
                link.css('display','none');
            }
            child.css('display','none');
            vars.totalSlides++;
        });
         
        // If randomStart
        if(settings.randomStart){
            settings.startSlide = Math.floor(Math.random() * vars.totalSlides);
        }
        
        // Set startSlide
        if(settings.startSlide > 0){
            if(settings.startSlide >= vars.totalSlides) { settings.startSlide = vars.totalSlides - 1; }
            vars.currentSlide = settings.startSlide;
        }
        
        // Get initial image
        if($(kids[vars.currentSlide]).is('img')){
            vars.currentImage = $(kids[vars.currentSlide]);
        } else {
            vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
        }
        
        // Show initial link
        if($(kids[vars.currentSlide]).is('a')){
            $(kids[vars.currentSlide]).css('display','block');
        }
        
        // Set first background
        var sliderImg = $('<img class="nivo-main-image" src="#" />');
        sliderImg.attr('src', vars.currentImage.attr('src')).show();
        slider.append($('<div style="background:' + settings.backgroundColor + '; height: 100%;"/>').append(sliderImg));

        // Detect Window Resize
        $(window).resize(function() {
            slider.children('img').width(slider.width());
            sliderImg.attr('src', vars.currentImage.attr('src'));
            sliderImg.stop().height('auto');
            $('.nivo-slice', slider).hide();
            $('.nivo-box', slider).hide();
        });

        //Create caption
        slider.append(
            $('<div class="nivo-caption"><div class="nivo-caption-bg" style="opacity:' + settings.captionOpacity + '"></div><p class="nivo-caption-content"></p></div>').css({ display: 'none' })
        );

        // Cross browser default caption opacity
        $('div.nivo-caption-bg', slider).css('opacity', 0);
		
		slider.mouseenter(function () {
			slider.addClass('hover');
		}).mouseleave(function () {
			slider.removeClass('hover');
		});

        
        
        // Process caption function
        var processCaption = function(settings){
            var nivoCaption = $('div.nivo-caption', slider);
            if (vars.currentImage.attr('title') != '' && vars.currentImage.attr('title') != undefined) {
                var title = vars.currentImage.attr('title'),
                    $title = {},
                    minHeight = 36,
                    maxHeight = 80,
                    justTextHeight = 50;
                
                nivoCaption.height(function(){
                    return (slider.is('.hover')) ? maxHeight : minHeight;
                    }).data('minHeight', minHeight).data('maxHeight', maxHeight) //set the default height values of the caption container
                    .find('p').html("").end(); //empty the caption container
                nivoCaption.find('div.nivo-caption-bg').height(maxHeight);
                if (title.substr(0, 1) == '#') {
                    $title = $('<div id="tmpTitleWrap"></div>').append($(title).html());
                    if (!$title.find(".captionHeadline")[0]) {
                        $title.find('.captionText').attr("style", "padding-top: 10px");
                        nivoCaption
                            .height(justTextHeight)
                            .data('minHeight', justTextHeight)
                            .data('maxHeight', justTextHeight);
                    }
                    title = $title.html();
                }
                
                if (nivoCaption.find('div.nivo-caption-bg').css('opacity') != 0) {
                    nivoCaption.find('p').stop().fadeTo(settings.animSpeed, 0, function() {
                        $(this).html(title);
                        $(this).stop().fadeTo(settings.animSpeed, 1);
                    });
                } else {
                    nivoCaption.find('p').html(title);
                }
                nivoCaption
                    .find('.nivo-caption-bg').stop().fadeTo(settings.animSpeed, settings.captionOpacity)
                    .end().show();
            } else {
                nivoCaption.hide().find('.nivo-caption-bg').stop().fadeTo(settings.animSpeed, 0)
                    .end();
            }
        }
        
        //Process initial  caption
        processCaption(settings);
        
        // In the words of Super Mario "let's a go!"
        var timer = 0;
        if(!settings.manualAdvance && kids.length > 1){
            timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
        }
        
        // Add Direction nav
        if(settings.directionNav){
            slider.append('<div class="nivo-directionNav"><a class="nivo-prevNav">'+ settings.prevText +'</a><a class="nivo-nextNav">'+ settings.nextText +'</a></div>');
            
            // Hide Direction nav
            if(settings.directionNavHide){
                $('.nivo-directionNav', slider).hide();
                slider.hover(function(){
                    $('.nivo-directionNav', slider).show();
                }, function(){
                    $('.nivo-directionNav', slider).hide();
                });
            }
            
            $('a.nivo-prevNav', slider).live('click', function(){
                if(vars.running) { return false; }
                clearInterval(timer);
                timer = '';
                vars.currentSlide -= 2;
                nivoRun(slider, kids, settings, 'prev');
            });
            
            $('a.nivo-nextNav', slider).live('click', function(){
                if(vars.running) { return false; }
                clearInterval(timer);
                timer = '';
                nivoRun(slider, kids, settings, 'next');
            });
        }
        
        // Add Control nav
        if(settings.controlNav){
            var buttons = '';
            vars.controlNavEl = $('<div class="nivo-controlNav"></div>');
            slider.after(vars.controlNavEl);
            for(var i = 0; i < kids.length; i++){
                if(settings.controlNavThumbs){
                    vars.controlNavEl.addClass('nivo-thumbs-enabled');
                    var child = kids.eq(i);
                    if(!child.is('img')){
                        child = child.find('img:first');
                    }
                    if (child.attr('data-thumb')) buttons += '<a class="nivo-control" rel="'+ i +'"><img src="'+ child.attr('data-thumb') +'" alt="" /></a>';
                } else {
                    buttons += '<a class="nivo-control" rel="'+ i +'"><span class="nivo-nav-num">'+ (i + 1) +'</span></a>';
                }
            }
            vars.controlNavEl.append(buttons);

            //Set initial active link
            $('a:eq('+ vars.currentSlide +')', vars.controlNavEl).addClass('active');
            
            $('a', vars.controlNavEl).bind('click', function(){
                if(vars.running) return false;
                if($(this).hasClass('active')) return false;
                clearInterval(timer);
                timer = '';
                sliderImg.attr('src', vars.currentImage.attr('src'));
                vars.currentSlide = $(this).attr('rel') - 1;
                nivoRun(slider, kids, settings, 'control');
            });
        }
        
        //For pauseOnHover setting
        if(settings.pauseOnHover){
            slider.hover(function(){
                vars.paused = true;
                clearInterval(timer);
                timer = '';
            }, function(){
                vars.paused = false;
                // Restart the timer
                if(timer === '' && !settings.manualAdvance){
                    timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
                }
            });
        }
        
        // Event when Animation finishes
        slider.bind('nivo:animFinished', function(){
            sliderImg.attr('src', vars.currentImage.attr('src'));
            vars.running = false; 
            // Hide child links
            $(kids).each(function(){
                if($(this).is('a')){
                   $(this).css('display','none');
                }
            });
            // Show current link
            if($(kids[vars.currentSlide]).is('a')){
                $(kids[vars.currentSlide]).css('display','block');
            }
            slider.trigger('nivo:beforeSlideChange');
            // Restart the timer
            if(timer === '' && !vars.paused && !settings.manualAdvance){
                timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
            }
            // Trigger the afterChange callback
            settings.afterChange.call(this);
        }); 
        
        var createSlices = function(slider, settings, vars) {
            var i = 0,
                slices = '';
            for(i = 0; i < settings.slices; i++){
                slices += '<div class="nivo-slice" style="background-color: ' + settings.backgroundColor + ';" name="'+i+'"><img src="' + vars.currentImage.attr('src') + '" /></div>'
            }
            slider.append(slices);
            updateSlices($('div.nivo-slice', slider), vars.currentImage);
        };
        
        var updateSlices = function($nslices, currentImage) {
            var $currentImg = $('img[src="'+ currentImage.attr('src') +'"]', slider).not('.nivo-main-image,.nivo-control img'),
                $currentImgParent = ($currentImg.parent().is('a')) ? ($currentImg.parent().css('display','block')) : {},
                sliceWidth = Math.ceil(slider.width()/settings.slices),
                sliceHeight = ($currentImgParent[0]) ? $currentImg.parent().height() : $currentImg.height(),
                i = 0;

            $nslices.each(function() {
                i = parseInt($(this).attr('name'), 10);
                $(this).css({
                    opacity: 0,
                    top: 'auto',
                    bottom: 'auto',
                    right: '0',
                    left: sliceWidth * i + 'px',
                    width: sliceWidth + 'px',
                    height: 0
                }).find('img').attr('src', currentImage.attr('src')).attr('width', slider.width()).stop().css({
                    width: slider.width(),
                    left: '-' + sliceWidth * i + 'px',
                    top: 0
                }, settings.animSpeed);
            });
        };
        
        createSlices(slider, settings, slider.data('nivo:vars'));

        // Add boxes for box animations
        var createBoxes = function(slider, settings, vars) {
            var rows = 0,
                cols = 0,
                boxes = '';
            for(rows = 0; rows < settings.boxRows; rows++){
                for(cols = 0; cols < settings.boxCols; cols++){
                    boxes += '<div class="nivo-box" name="'+ cols +'" rel="'+ rows +'" style="background-color: ' + settings.backgroundColor + ';"><img src="'+ vars.currentImage.attr('src') +'" /></div>';
                }
            }
            slider.append(boxes);
        };
        
        var updateBoxes = function($nboxes, currentImage) {
            var boxWidth = Math.ceil(slider.width()/settings.boxCols),
                boxHeight = Math.round(slider.height() / settings.boxRows),
                rows = 0,
                cols = 0;
            $nboxes.each(function() {
                rows = $(this).attr('rel');
                cols = $(this).attr('name');
                $(this).css({
                    opacity: 0,
                    left: (boxWidth*cols) + 'px',
                    top:(boxHeight*rows)+'px',
                    width: boxWidth + 'px',
                    height: boxHeight + 'px'
                }).find('img').attr('src', currentImage.attr('src')).attr('width', slider.width()).stop().css({
                    width: slider.width() +'px',
                    top: '-' + (boxHeight*rows) +'px',
                    left: '-' + (boxWidth*cols) +'px',
                    height: 'auto'
                });
                
            });
        };

        createBoxes(slider, settings, slider.data('nivo:vars'));
        
        // Private run method
        var nivoRun = function(slider, kids, settings, nudge){
            // Get our vars
            var vars = slider.data('nivo:vars'),
                $nslices = $('div.nivo-slice', slider),
                $nboxes = $('div.nivo-box', slider);
            
            // Trigger the lastSlide callback
            if(vars && (vars.currentSlide === vars.totalSlides - 1)){ 
                settings.lastSlide.call(this);
            }
            
            // Stop
            if((!vars || vars.stop) && !nudge) { return false; }
            
            // Trigger the beforeChange callback
            settings.beforeChange.call(this);

            // Set current background before change
            if(!nudge){
                sliderImg.attr('src', vars.currentImage.attr('src'));
            } else {
                if(nudge === 'prev'){
                    sliderImg.attr('src', vars.currentImage.attr('src'));
                }
                if(nudge === 'next'){
                    sliderImg.attr('src', vars.currentImage.attr('src'));
                }
            }
            
            vars.currentSlide++;
            // Trigger the slideshowEnd callback
            if(vars.currentSlide === vars.totalSlides){ 
                vars.currentSlide = 0;
                settings.slideshowEnd.call(this);
            }
            if(vars.currentSlide < 0) { vars.currentSlide = (vars.totalSlides - 1); }
            // Set vars.currentImage
            if($(kids[vars.currentSlide]).is('img')){
                vars.currentImage = $(kids[vars.currentSlide]);
            } else {
                vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
            }
            
            // Set active links
            if(settings.controlNav){
                $('a', vars.controlNavEl).removeClass('active');
                $('a:eq('+ vars.currentSlide +')', vars.controlNavEl).addClass('active');
            }
            
            // Process caption
            processCaption(settings);            
            
            // Remove any slices from last transition
            $nslices.hide();
            
            // Remove any boxes from last transition
            $nboxes.hide();
            
            var currentEffect = settings.effect,
                anims = '';
                
            // Generate random effect
            if(settings.effect === 'random'){
                anims = new Array('sliceDownRight','sliceDownLeft','sliceUpRight','sliceUpLeft','sliceUpDownRight','sliceUpDownLeft','foldLeft', 'foldRight', 'fade',
                'boxRandom','boxRain','boxRainReverse','boxRainGrow','boxRainGrowReverse');
                currentEffect = anims[Math.floor(Math.random()*(anims.length + 1))];
                if(currentEffect === undefined) { currentEffect = 'fade'; }
            }

            // Run random effect from specified set (eg: effect:'fold,fade')
            if(settings.effect.indexOf(',') !== -1){
                anims = settings.effect.split(',');
                currentEffect = anims[Math.floor(Math.random()*(anims.length))];
                if(currentEffect === undefined) { currentEffect = 'fade'; }
            }
            
            // Custom transition as defined by "data-transition" attribute
            if(vars.currentImage.attr('data-transition')){
                currentEffect = vars.currentImage.attr('data-transition');
            }
            switch (nudge) {
            case 'next':
                currentEffect = currentEffect.replace("Right", "Left");
                if (currentEffect == 'boxRain' || currentEffect == 'boxRainGrow') {
                    currentEffect += 'Reverse';
                }
                break;
            case 'prev':
                currentEffect = currentEffect.replace("Left", "Right");
                currentEffect = currentEffect.replace("Reverse", "");
                break;
            default:
                break;
            }
            // Run effects
            vars.running = true;
            var timeBuff = 0,
                i = 0,
                slices = '',
                firstSlice = '',
                totalBoxes = '',
                boxes = '',
                v = 0;
            
            if(currentEffect === 'sliceDown' || currentEffect === 'sliceDownRight' || currentEffect === 'sliceDownLeft'){
                updateSlices($nslices, vars.currentImage);
                timeBuff = 0;
                i = 0;
                slices = $nslices;
                if (currentEffect == 'sliceDownLeft') slices = $nslices._reverse();

                slices.each(function() {
                    var slice = $(this);
                    slice.css({ 'top': '0px' });
                    if (i == settings.slices - 1) {
                        setTimeout(function() {
                            slice.show().animate({ height: '100%', opacity: '1.0' }, settings.animSpeed, '', function() { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff), 'JavaScript');
                    } else {
                        setTimeout(function() {
                            slice.show().animate({ height: '100%', opacity: '1.0' }, settings.animSpeed);
                        }, (100 + timeBuff), 'JavaScript');
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if(currentEffect === 'sliceUp' || currentEffect === 'sliceUpRight' || currentEffect === 'sliceUpLeft'){
                updateSlices($nslices, vars.currentImage);
                timeBuff = 0;
                i = 0;
                slices = $nslices;
                if (currentEffect == 'sliceUpLeft') slices = $nslices._reverse();

                slices.each(function() {
                    var slice = $(this);
                    slice.css({ 'bottom': '0px' });
                    if (i == settings.slices - 1) {
                        setTimeout(function() {
                            slice.show().animate({ height: '100%', opacity: '1.0' }, settings.animSpeed, '', function() { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff), 'JavaScript');
                    } else {
                        setTimeout(function() {
                            slice.show().animate({ height: '100%', opacity: '1.0' }, settings.animSpeed);
                        }, (100 + timeBuff), 'JavaScript');
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if(currentEffect === 'sliceUpDownRight' || currentEffect === 'sliceUpDownRight' || currentEffect === 'sliceUpDownLeft'){
                updateSlices($nslices, vars.currentImage);
                timeBuff = 0;
                i = 0;
                v = 0;
                slices = $nslices;
                if (currentEffect === 'sliceUpDownLeft') slices = $nslices._reverse();

                slices.each(function() {
                    var slice = $(this).height(0);
                    if (i === 0) {
                        slice.css('top', '0px');
                        i = 1;
                    } else {
                        slice.css('bottom', '0px');
                        i = 0;
                    }

                    if (v == settings.slices - 1) {
                        setTimeout(function() {
                            slice.show().animate({ height: '100%', opacity: '1.0' }, settings.animSpeed, '', function() { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff), 'JavaScript');
                    } else {
                        setTimeout(function() {
                            slice.show().animate({ height: '100%', opacity: '1.0' }, settings.animSpeed);
                        }, (100 + timeBuff), 'JavaScript');
                    }
                    timeBuff += 50;
                    v++;
                });
            } else if(currentEffect === 'foldLeft' || currentEffect === 'foldRight'){
                updateSlices($nslices, vars.currentImage);
                slices = $nslices;
                if (currentEffect === 'foldLeft') slices = $nslices._reverse();
                slices.each(function() {
                    var slice = $(this),
                        origWidth = this.style.width;
                    slice.css({ top: '0px', height: '100%', width: '0px' });
                    if (i == settings.slices - 1) {
                        setTimeout(function() {
                            slice.show().animate({ width: origWidth, opacity: '1.0' }, settings.animSpeed, '', function() { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff), 'JavaScript');
                    } else {
                        setTimeout(function() {
                            slice.show().animate({ width: origWidth, opacity: '1.0' }, settings.animSpeed);
                        }, (100 + timeBuff), 'JavaScript');
                    }
                    timeBuff += 50;
                    i++;
                });
            } else if(currentEffect === 'fade'){
                updateSlices($nslices, vars.currentImage);
                firstSlice = $($nslices[0]);
                firstSlice.css({
                    'height': '100%',
                    'top': '0',
                    'width': slider.width() + 'px'
                });
                firstSlice.show().animate({ opacity: '1.0' }, (settings.animSpeed * 2), '', function() { slider.trigger('nivo:animFinished'); });
            } else if(currentEffect === 'slideInRight'){
                updateSlices($nslices, vars.currentImage);
                firstSlice = $($nslices[0]);
                firstSlice.css({
                    'height': '100%',
                    'top': '0px',
                    'width': '0px',
                    'opacity': '1'
                });

                firstSlice.show().animate({ width: slider.width() + 'px' }, (settings.animSpeed * 2), '', function() { slider.trigger('nivo:animFinished'); });
            } else if(currentEffect === 'slideInLeft'){
                updateSlices($nslices, vars.currentImage);
                firstSlice = $($nslices[0]);
                firstSlice.css({
                    'height': '100%',
                    'top': '0px',
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
            } else if(currentEffect === 'boxRandom'){
                updateBoxes($nboxes, vars.currentImage);
                totalBoxes = settings.boxCols * settings.boxRows;
                i = 0;
                timeBuff = 0;

                var boxes = shuffle($nboxes);
                boxes.each(function() {
                    var box = $(this);
                    if (i == totalBoxes - 1) {
                        setTimeout(function() {
                            box.show().animate({ opacity: '1' }, settings.animSpeed, '', function() { slider.trigger('nivo:animFinished'); });
                        }, (100 + timeBuff), 'JavaScript');
                    } else {
                        setTimeout(function() {
                            box.show().animate({ opacity: '1' }, settings.animSpeed);
                        }, (100 + timeBuff), 'JavaScript');
                    }
                    timeBuff += 20;
                    i++;
                });
            } else if(currentEffect === 'boxRain' || currentEffect === 'boxRainReverse' || currentEffect === 'boxRainGrow' || currentEffect === 'boxRainGrowReverse'){
                totalBoxes = settings.boxCols * settings.boxRows;
                i = 0;
                timeBuff = 0;
                var rowIndex = 0,
                    colIndex = 0,
                    box2Darr = new Array(),
                    boxes = $nboxes,
                    cols = 0,
                    rows = 0,
                    maxCols = settings.boxCols * 2,
                    prevCol = 0;
                box2Darr[rowIndex] = new Array();
                updateBoxes($nboxes, vars.currentImage);
                if (currentEffect === 'boxRainReverse' || currentEffect === 'boxRainGrowReverse') {
                    boxes = $nboxes._reverse();
                }
                boxes.each(function() {
                    //box2Darr[rowIndex] = new Array();
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
                                    }, (100 + time), 'JavaScript');
                                } else {
                                    setTimeout(function() {
                                        box.show().animate({ opacity: '1', width: w, height: h }, settings.animSpeed / 1.3);
                                    }, (100 + time), 'JavaScript');
                                }
                            })(rows, prevCol, timeBuff, i, totalBoxes);
                            i++;
                        }
                        prevCol--;
                    }
                    timeBuff += 100;
                }
            }
        };
        
        if ($.fn.touchwipe) {
            slider.touchwipe({
                 wipeLeft: function(e, touchStart) {
                    var goToNext = function () {
                        clearInterval(timer);
                        timer = '';
                        nivoRun(slider, kids, settings, 'next');
                    };
                    e.preventDefault();
                    touchStart.preventDefault();
                    if (vars.running) {
                        slider.one('nivo:beforeSlideChange', function(){
                            goToNext();
                        });
                    } else {
                        goToNext();
                    }
                    //}
                 },
                 wipeRight: function(e, touchStart) { 
                    var goToPrev = function () {
                        clearInterval(timer);
                        vars.currentSlide -= 2;
                        timer = '';
                        nivoRun(slider, kids, settings, 'prev');
                    };
                    e.preventDefault();
                    touchStart.preventDefault();
                    if (vars.running) {
                        slider.one('nivo:beforeSlideChange', function(){
                            goToPrev();
                        });
                    } else {
                        goToPrev();
                    }
                 },
                 min_move_x: 1,
                 min_move_y: 1,
                 preventDefaultEvents: false
            });    
        }
        
        // Shuffle an array
        var shuffle = function(arr){
            for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i, 10), x = arr[--i], arr[i] = arr[j], arr[j] = x);
            return arr;
        };
        
        // For debugging
        var trace = function(msg){
            if(this.console && typeof console.log !== 'undefined') { console.log(msg); }
        };
        
        // Start / Stop
        this.stop = function(){
            if(!$(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = true;
                trace('Stop Slider');
            }
        };
        
        this.start = function(){
            if($(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = false;
                trace('Start Slider');
            }
        };
        
        // Trigger the afterLoad callback
        settings.afterLoad.call(this);
        
        return this;
    };
        
    $.fn.nivoSlider = function(options) {
        return this.each(function(key, value){
            var element = $(this);
            // Return early if this element already has a plugin instance
            if (element.data('nivoslider')) { return element.data('nivoslider'); }
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
        captionOpacity: 0.8,
        pauseOnHover: true,
        manualAdvance: false,
        prevText: 'Prev',
        nextText: 'Next',
        randomStart: false,
        backgroundColor: "transparent",
        beforeChange: function(){},
        afterChange: function(){},
        slideshowEnd: function(){},
        lastSlide: function(){},
        afterLoad: function(){}
    };

    $.fn._reverse = [].reverse;
    
})(jQuery);