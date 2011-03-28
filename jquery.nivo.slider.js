/*
 * jQuery Nivo Slider v2.5.1
 * http://nivo.dev7studios.com
 *
 * Copyright 2011, Gilbert Pellegrom
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * March 2010
 */

(function($) {

    var NivoSlider = function(element, options){
		//Defaults are below
		var settings = $.extend({}, $.fn.nivoSlider.defaults, options);

        //Useful variables. Play carefully.
        var vars = {
            currentSlide: 0,
            currentImage: '',
            totalSlides: 0,
            randAnim: '',
            running: false,
            paused: false,
            stop: false,
			nivoCaption: null,
			nivoNavigationContainer:null,
			nivoPrevNavigation:null,
			nivoNextNavigation:null,
			nivoControlContainer:null,
			nivoControlItems: [],
			//define them in the places where they are needed to get better sourcecode overview
			parentFunctions: {}
        };

        //Get this slider
        var slider = $(element);
        slider.data('nivo:vars', vars);
        slider.css('position','relative');
        slider.addClass('nivoSlider');

        //Find our slider children
        var kids = slider.children();
        kids.each(function() {
            var child = $(this);
            var link = '';
            if(!child.is('img')){
                if(child.is('a')){
                    child.addClass('nivo-imageLink');
                    link = child;
                }
                child = child.find('img:first');
            }
            //Get img width & height
            var childWidth = child.width();
            if(childWidth == 0) childWidth = child.attr('width');
            var childHeight = child.height();
            if(childHeight == 0) childHeight = child.attr('height');
            //Resize the slider
            if(childWidth > slider.width()){
                slider.width(childWidth);
            }
            if(childHeight > slider.height()){
                slider.height(childHeight);
            }
            if(link != ''){
                link.css('display','none');
            }
            child.css('display','none');
            vars.totalSlides++;
        });

        //Set startSlide
        if(settings.startSlide > 0){
            if(settings.startSlide >= vars.totalSlides) settings.startSlide = vars.totalSlides - 1;
            vars.currentSlide = settings.startSlide;
        }

        //Get initial image
        if($(kids[vars.currentSlide]).is('img')){
            vars.currentImage = $(kids[vars.currentSlide]);
        } else {
            vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
        }

        //Show initial link
        if($(kids[vars.currentSlide]).is('a')){
            $(kids[vars.currentSlide]).css('display','block');
        }

        //Set first background
        slider.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat');

		//function for caption creation
		vars.parentFunctions.createCaption = function() {
			var caption = $('<div class="nivo-caption"><p></p></div>').css({display:'none', opacity:settings.captionOpacity});
			slider.append(
				caption
			);
			return caption;
		};
		if(typeof settings.createCaption != 'function') {
			settings.createCaption = vars.parentFunctions.createCaption
		}

        //Create caption
		vars.nivoCaption = settings.createCaption.call(this);

		// Process caption function
		vars.parentFunctions.changeCaption = function(title) {
			if(vars.nivoCaption.css('display') == 'block'){
				vars.nivoCaption.find('p').fadeOut(settings.animSpeed, function(){
					$(this).html(title);
					$(this).fadeIn(settings.animSpeed);
				});
			} else {
				vars.nivoCaption.find('p').html(title);
			}
		};
		if(typeof settings.changeCaption != 'function') {
			settings.changeCaption = vars.parentFunctions.changeCaption;
		}
		var processCaption = function(settings){
			var nivoCaption = vars.nivoCaption;
			if(nivoCaption == undefined) {
				return;
			}
			if(vars.currentImage.attr('title') != ''){
				var title = vars.currentImage.attr('title');
				if(title.substr(0,1) == '#') title = $(title).html();

				//Call changeFunction. It contains the default functionality if its not overridden
				settings.changeCaption.call(this, title);
				
				nivoCaption.fadeIn(settings.animSpeed);
			} else {
				nivoCaption.fadeOut(settings.animSpeed);
			}
		}

        //Process initial  caption
        processCaption(settings);

        //In the words of Super Mario "let's a go!"
        var timer = 0;
        if(!settings.manualAdvance && kids.length > 1){
            timer = setInterval(function(){nivoRun(slider, kids, settings, false);}, settings.pauseTime);
        }

        //Add Direction nav
        if(settings.directionNav){
			vars.parentFunctions.createNaviContainer = function() {
				var container = $('<div class="nivo-directionNav"></div>');
				slider.append(container);
				return container;
			}
			vars.parentFunctions.createPrevNavigation = function() {
				var nav = $('<a class="nivo-prevNav">'+ settings.prevText +'</a>');
				vars.nivoNavigationContainer.append(nav);
				return nav;
			}
			vars.parentFunctions.createNextNavigation = function() {
				var nav = $('<a class="nivo-nextNav">'+ settings.nextText +'</a>');
				vars.nivoNavigationContainer.append(nav);
				return nav;
			}
			
			var nivoNextNavigation, nivoPrevNavigation;
			nivoNextNavigation = nivoPrevNavigation = false;

			//put the parent functions into place if there are not overridden
			if(typeof settings.createNaviContainer != 'function') {
				settings.createNaviContainer = vars.parentFunctions.createNaviContainer;
			}
			if(typeof settings.createPrevNavigation != 'function') {
				nivoPrevNavigation = true;
				settings.createPrevNavigation = vars.parentFunctions.createPrevNavigation;
			}
			if(typeof settings.createNextNavigation != 'function') {
				nivoNextNavigation = true;
				settings.createNextNavigation = vars.parentFunctions.createNextNavigation;
			}

			//create direction nav
			vars.nivoNavigationContainer = settings.createNaviContainer.call(this);
			vars.nivoPrevNavigation = settings.createPrevNavigation.call(this);
			vars.nivoNextNavigation = settings.createNextNavigation.call(this);

            //Hide Direction nav
            if(settings.directionNavHide){
				vars.parentFunctions.changeNaviContainer = function(mode) {
					if(mode) {
						vars.nivoNavigationContainer.show();
					} else {
						vars.nivoNavigationContainer.hide();
					}
				};
				if(typeof settings.changeNaviContainer != 'function') {
					settings.changeNaviContainer = vars.parentFunctions.changeNaviContainer;
				}
				
				settings.changeNaviContainer.call(this, false);
				slider.hover(function(){
					settings.changeNaviContainer.call(this, true);
				}, function(){
					settings.changeNaviContainer.call(this, false);
				});
            }

			//just for reducing source code redundance
			var nivoPrevFunc = function(){
				if(vars.running) return false;
				clearInterval(timer);
				timer = '';
				vars.currentSlide -= 2;
				nivoRun(slider, kids, settings, 'prev');
			};

			var nivoNextFunc = function(){
                if(vars.running) return false;
                clearInterval(timer);
                timer = '';
                nivoRun(slider, kids, settings, 'next');
            };


			//to be backwards compatible use live motode if they are not set with the custome metode
			if(nivoPrevNavigation) {
	            vars.nivoPrevNavigation.click(nivoPrevFunc);
			} else {
	            $('a.nivo-prevNav', slider).live('click', nivoPrevFunc);
			}

			if(nivoNextNavigation) {
	            vars.nivoNextNavigation.click(nivoNextFunc);
			} else {
				$('a.nivo-nextNav', slider).live('click', nivoNextFunc);
			}
        }

        //Add Control nav
        if(settings.controlNav){
            vars.parentFunctions.createControlContainer = function(){
				var container = $('<div class="nivo-controlNav"></div>');
				slider.append(container);
				return container;
			};
			if(typeof settings.createControlContainer != 'function') {
				settings.createControlContainer = vars.parentFunctions.createControlContainer;
			}
			vars.nivoControlContainer = settings.createControlContainer.call(this);
			
			var nivoControl = vars.nivoControlContainer;

			vars.parentFunctions.createControlItem = function(i, thumb) {
				var controll;
				if(thumb !== false){
					controll = $('<a class="nivo-control" rel="'+ i +'"><img src="'+ thumb + '" alt="" /></a>');
				} else {
					controll = $('<a class="nivo-control" rel="'+ i +'">'+ (i + 1) +'</a>');
				}
				vars.nivoControlContainer.append(controll);
				return controll;
			}
			var createControlContainer = false;
			if(typeof settings.createControlItem != 'function') {
				createControlContainer = true;
				settings.createControlItem = vars.parentFunctions.createControlItem;
			}
            for(var i = 0; i < kids.length; i++){
				if(settings.controlNavThumbs){
					var child = kids.eq(i);
					if(!child.is('img')){
						child = child.find('img:first');
					}
					if (settings.controlNavThumbsFromRel) {
						vars.nivoControlItems[i] = settings.createControlItem.call(this, i, child.attr('rel'));
					} else {
						vars.nivoControlItems[i] = settings.createControlItem.call(this, i, child.attr('src').replace(settings.controlNavThumbsSearch, settings.controlNavThumbsReplace));
					}
				} else {
					vars.nivoControlItems[i] = settings.createControlItem.call(this, i, false);
				}

            }
            //Set initial active link
			vars.nivoControlItems[vars.currentSlide].addClass('active');
			settings.afterActive.call(this, vars);

			//to be backwards compatible use live motode if they are not set with the custome metode
			var getControlClick = function(index) {
				return function() {
					if(vars.running) return false;
					if($(this).hasClass('active')) return false;
					clearInterval(timer);
					timer = '';
					slider.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat');
					if(index === undefined) {
						index = $(this).attr('rel');
					}
					vars.currentSlide = index - 1;
					nivoRun(slider, kids, settings, 'control');
				}
			};
			if(!createControlContainer) {
				$.each(vars.nivoControlItems, function(index, value){
					value.click(getControlClick(index));
				});
			} else {
				$('.nivo-controlNav a', slider).live('click', getControlClick());
			}
        }

        //Keyboard Navigation
        if(settings.keyboardNav){
            $(window).keypress(function(event){
                //Left
                if(event.keyCode == '37'){
                    if(vars.running) return false;
                    clearInterval(timer);
                    timer = '';
                    vars.currentSlide-=2;
                    nivoRun(slider, kids, settings, 'prev');
                }
                //Right
                if(event.keyCode == '39'){
                    if(vars.running) return false;
                    clearInterval(timer);
                    timer = '';
                    nivoRun(slider, kids, settings, 'next');
                }
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
                //Restart the timer
                if(timer == '' && !settings.manualAdvance){
                    timer = setInterval(function(){nivoRun(slider, kids, settings, false);}, settings.pauseTime);
                }
            });
        }

        //Event when Animation finishes
        slider.bind('nivo:animFinished', function(){
            vars.running = false;
            //Hide child links
            $(kids).each(function(){
                if($(this).is('a')){
                    $(this).css('display','none');
                }
            });
            //Show current link
            if($(kids[vars.currentSlide]).is('a')){
                $(kids[vars.currentSlide]).css('display','block');
            }
            //Restart the timer
            if(timer == '' && !vars.paused && !settings.manualAdvance){
                timer = setInterval(function(){nivoRun(slider, kids, settings, false);}, settings.pauseTime);
            }
            //Trigger the afterChange callback
            settings.afterChange.call(this);
        });

        // Add slices for slice animations
        var createSlices = function(slider, settings, vars){
            for(var i = 0; i < settings.slices; i++){
				var sliceWidth = Math.round(slider.width()/settings.slices);
				if(i == settings.slices-1){
					slider.append(
						$('<div class="nivo-slice"></div>').css({
							left:(sliceWidth*i)+'px', width:(slider.width()-(sliceWidth*i))+'px',
							height:'0px',
							opacity:'0',
							background: 'url("'+ vars.currentImage.attr('src') +'") no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0%'
						})
					);
				} else {
					slider.append(
						$('<div class="nivo-slice"></div>').css({
							left:(sliceWidth*i)+'px', width:sliceWidth+'px',
							height:'0px',
							opacity:'0',
							background: 'url("'+ vars.currentImage.attr('src') +'") no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0%'
						})
					);
				}
			}
        }

		// Add boxes for box animations
		var createBoxes = function(slider, settings, vars){
			var boxWidth = Math.round(slider.width()/settings.boxCols);
			var boxHeight = Math.round(slider.height()/settings.boxRows);

			for(var rows = 0; rows < settings.boxRows; rows++){
				for(var cols = 0; cols < settings.boxCols; cols++){
					if(cols == settings.boxCols-1){
						slider.append(
							$('<div class="nivo-box"></div>').css({
								opacity:0,
								left:(boxWidth*cols)+'px',
								top:(boxHeight*rows)+'px',
								width:(slider.width()-(boxWidth*cols))+'px',
								height:boxHeight+'px',
								background: 'url("'+ vars.currentImage.attr('src') +'") no-repeat -'+ ((boxWidth + (cols * boxWidth)) - boxWidth) +'px -'+ ((boxHeight + (rows * boxHeight)) - boxHeight) +'px'
							})
						);
					} else {
						slider.append(
							$('<div class="nivo-box"></div>').css({
								opacity:0,
								left:(boxWidth*cols)+'px',
								top:(boxHeight*rows)+'px',
								width:boxWidth+'px',
								height:boxHeight+'px',
								background: 'url("'+ vars.currentImage.attr('src') +'") no-repeat -'+ ((boxWidth + (cols * boxWidth)) - boxWidth) +'px -'+ ((boxHeight + (rows * boxHeight)) - boxHeight) +'px'
							})
						);
					}
				}
			}
		}

        // Private run method
		var nivoRun = function(slider, kids, settings, nudge){
			//Get our vars
			var vars = slider.data('nivo:vars');

            //Trigger the lastSlide callback
            if(vars && (vars.currentSlide == vars.totalSlides - 1)){
				settings.lastSlide.call(this);
			}

            // Stop
			if((!vars || vars.stop) && !nudge) return false;

			//Trigger the beforeChange callback
			settings.beforeChange.call(this);

			//Set current background before change
			if(!nudge){
				slider.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat');
			} else {
				if(nudge == 'prev'){
					slider.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat');
				}
				if(nudge == 'next'){
					slider.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat');
				}
			}
			vars.currentSlide++;
            //Trigger the slideshowEnd callback
			if(vars.currentSlide == vars.totalSlides){
				vars.currentSlide = 0;
				settings.slideshowEnd.call(this);
			}
			if(vars.currentSlide < 0) vars.currentSlide = (vars.totalSlides - 1);
			//Set vars.currentImage
			if($(kids[vars.currentSlide]).is('img')){
				vars.currentImage = $(kids[vars.currentSlide]);
			} else {
				vars.currentImage = $(kids[vars.currentSlide]).find('img:first');
			}

			//Set active links
			if(settings.controlNav){
				$.each(vars.nivoControlItems, function(index, value) {
					value.removeClass('active');
				});
				vars.nivoControlItems[vars.currentSlide].addClass('active');
			}

			settings.afterActive.call(this, vars);

			//Process caption
			processCaption(settings);

			// Remove any slices from last transition
			$('.nivo-slice', slider).remove();

			// Remove any boxes from last transition
			$('.nivo-box', slider).remove();

			if(settings.effect == 'random'){
				var anims = new Array('sliceDownRight','sliceDownLeft','sliceUpRight','sliceUpLeft','sliceUpDown','sliceUpDownLeft','fold','fade',
                'boxRandom','boxRain','boxRainReverse','boxRainGrow','boxRainGrowReverse');
				vars.randAnim = anims[Math.floor(Math.random()*(anims.length + 1))];
				if(vars.randAnim == undefined) vars.randAnim = 'fade';
			}

            //Run random effect from specified set (eg: effect:'fold,fade')
            if(settings.effect.indexOf(',') != -1){
                var anims = settings.effect.split(',');
                vars.randAnim = anims[Math.floor(Math.random()*(anims.length))];
				if(vars.randAnim == undefined) vars.randAnim = 'fade';
            }

			//Run effects
			vars.running = true;
			if(settings.effect == 'sliceDown' || settings.effect == 'sliceDownRight' || vars.randAnim == 'sliceDownRight' ||
				settings.effect == 'sliceDownLeft' || vars.randAnim == 'sliceDownLeft'){
				createSlices(slider, settings, vars);
				var timeBuff = 0;
				var i = 0;
				var slices = $('.nivo-slice', slider);
				if(settings.effect == 'sliceDownLeft' || vars.randAnim == 'sliceDownLeft') slices = $('.nivo-slice', slider)._reverse();

				slices.each(function(){
					var slice = $(this);
					slice.css({'top': '0px'});
					if(i == settings.slices-1){
						setTimeout(function(){
							slice.animate({height:'100%', opacity:'1.0'}, settings.animSpeed, '', function(){slider.trigger('nivo:animFinished');});
						}, (100 + timeBuff));
					} else {
						setTimeout(function(){
							slice.animate({height:'100%', opacity:'1.0'}, settings.animSpeed);
						}, (100 + timeBuff));
					}
					timeBuff += 50;
					i++;
				});
			}
			else if(settings.effect == 'sliceUp' || settings.effect == 'sliceUpRight' || vars.randAnim == 'sliceUpRight' ||
					settings.effect == 'sliceUpLeft' || vars.randAnim == 'sliceUpLeft'){
				createSlices(slider, settings, vars);
				var timeBuff = 0;
				var i = 0;
				var slices = $('.nivo-slice', slider);
				if(settings.effect == 'sliceUpLeft' || vars.randAnim == 'sliceUpLeft') slices = $('.nivo-slice', slider)._reverse();

				slices.each(function(){
					var slice = $(this);
					slice.css({'bottom': '0px'});
					if(i == settings.slices-1){
						setTimeout(function(){
							slice.animate({height:'100%', opacity:'1.0'}, settings.animSpeed, '', function(){slider.trigger('nivo:animFinished');});
						}, (100 + timeBuff));
					} else {
						setTimeout(function(){
							slice.animate({height:'100%', opacity:'1.0'}, settings.animSpeed);
						}, (100 + timeBuff));
					}
					timeBuff += 50;
					i++;
				});
			}
			else if(settings.effect == 'sliceUpDown' || settings.effect == 'sliceUpDownRight' || vars.randAnim == 'sliceUpDown' ||
					settings.effect == 'sliceUpDownLeft' || vars.randAnim == 'sliceUpDownLeft'){
				createSlices(slider, settings, vars);
				var timeBuff = 0;
				var i = 0;
				var v = 0;
				var slices = $('.nivo-slice', slider);
				if(settings.effect == 'sliceUpDownLeft' || vars.randAnim == 'sliceUpDownLeft') slices = $('.nivo-slice', slider)._reverse();

				slices.each(function(){
					var slice = $(this);
					if(i == 0){
						slice.css('top','0px');
						i++;
					} else {
						slice.css('bottom','0px');
						i = 0;
					}

					if(v == settings.slices-1){
						setTimeout(function(){
							slice.animate({height:'100%', opacity:'1.0'}, settings.animSpeed, '', function(){slider.trigger('nivo:animFinished');});
						}, (100 + timeBuff));
					} else {
						setTimeout(function(){
							slice.animate({height:'100%', opacity:'1.0'}, settings.animSpeed);
						}, (100 + timeBuff));
					}
					timeBuff += 50;
					v++;
				});
			}
			else if(settings.effect == 'fold' || vars.randAnim == 'fold'){
				createSlices(slider, settings, vars);
				var timeBuff = 0;
				var i = 0;

				$('.nivo-slice', slider).each(function(){
					var slice = $(this);
					var origWidth = slice.width();
					slice.css({top:'0px', height:'100%', width:'0px'});
					if(i == settings.slices-1){
						setTimeout(function(){
							slice.animate({width:origWidth, opacity:'1.0'}, settings.animSpeed, '', function(){slider.trigger('nivo:animFinished');});
						}, (100 + timeBuff));
					} else {
						setTimeout(function(){
							slice.animate({width:origWidth, opacity:'1.0'}, settings.animSpeed);
						}, (100 + timeBuff));
					}
					timeBuff += 50;
					i++;
				});
			}
			else if(settings.effect == 'fade' || vars.randAnim == 'fade'){
				createSlices(slider, settings, vars);

				var firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'height': '100%',
                    'width': slider.width() + 'px'
                });

				firstSlice.animate({opacity:'1.0'}, (settings.animSpeed*2), '', function(){slider.trigger('nivo:animFinished');});
			}
            else if(settings.effect == 'slideInRight' || vars.randAnim == 'slideInRight'){
				createSlices(slider, settings, vars);

                var firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'height': '100%',
                    'width': '0px',
                    'opacity': '1'
                });

                firstSlice.animate({width: slider.width() + 'px'}, (settings.animSpeed*2), '', function(){slider.trigger('nivo:animFinished');});
            }
            else if(settings.effect == 'slideInLeft' || vars.randAnim == 'slideInLeft'){
				createSlices(slider, settings, vars);

                var firstSlice = $('.nivo-slice:first', slider);
                firstSlice.css({
                    'height': '100%',
                    'width': '0px',
                    'opacity': '1',
                    'left': '',
                    'right': '0px'
                });

                firstSlice.animate({width: slider.width() + 'px'}, (settings.animSpeed*2), '', function(){
                    // Reset positioning
                    firstSlice.css({
                        'left': '0px',
                        'right': ''
                    });
                    slider.trigger('nivo:animFinished');
                });
            }
			else if(settings.effect == 'boxRandom' || vars.randAnim == 'boxRandom'){
				createBoxes(slider, settings, vars);

				var totalBoxes = settings.boxCols * settings.boxRows;
				var i = 0;
				var timeBuff = 0;

				var boxes = shuffle($('.nivo-box', slider));
				boxes.each(function(){
					var box = $(this);
					if(i == totalBoxes-1){
						setTimeout(function(){
							box.animate({opacity:'1'}, settings.animSpeed, '', function(){slider.trigger('nivo:animFinished');});
						}, (100 + timeBuff));
					} else {
						setTimeout(function(){
							box.animate({opacity:'1'}, settings.animSpeed);
						}, (100 + timeBuff));
					}
					timeBuff += 20;
					i++;
				});
			}
			else if(settings.effect == 'boxRain' || vars.randAnim == 'boxRain' || settings.effect == 'boxRainReverse' || vars.randAnim == 'boxRainReverse' ||
                    settings.effect == 'boxRainGrow' || vars.randAnim == 'boxRainGrow' || settings.effect == 'boxRainGrowReverse' || vars.randAnim == 'boxRainGrowReverse'){
				createBoxes(slider, settings, vars);

				var totalBoxes = settings.boxCols * settings.boxRows;
				var i = 0;
				var timeBuff = 0;

				// Split boxes into 2D array
				var rowIndex = 0;
				var colIndex = 0;
				var box2Darr = new Array();
				box2Darr[rowIndex] = new Array();
				var boxes = $('.nivo-box', slider);
				if(settings.effect == 'boxRainReverse' || vars.randAnim == 'boxRainReverse' ||
                   settings.effect == 'boxRainGrowReverse' || vars.randAnim == 'boxRainGrowReverse'){
					boxes = $('.nivo-box', slider)._reverse();
				}
				boxes.each(function(){
					box2Darr[rowIndex][colIndex] = $(this);
					colIndex++;
					if(colIndex == settings.boxCols){
						rowIndex++;
						colIndex = 0;
						box2Darr[rowIndex] = new Array();
					}
				});

				// Run animation
				for(var cols = 0; cols < (settings.boxCols * 2); cols++){
					var prevCol = cols;
					for(var rows = 0; rows < settings.boxRows; rows++){
						if(prevCol >= 0 && prevCol < settings.boxCols){
							/* Due to some weird JS bug with loop vars
							being used in setTimeout, this is wrapped
							with an anonymous function call */
							(function(row, col, time, i, totalBoxes) {
								var box = $(box2Darr[row][col]);
                                var w = box.width();
                                var h = box.height();
                                if(settings.effect == 'boxRainGrow' || vars.randAnim == 'boxRainGrow' ||
                                   settings.effect == 'boxRainGrowReverse' || vars.randAnim == 'boxRainGrowReverse'){
                                    box.width(0).height(0);
                                }
								if(i == totalBoxes-1){
									setTimeout(function(){
										box.animate({opacity:'1', width:w, height:h}, settings.animSpeed/1.3, '', function(){slider.trigger('nivo:animFinished');});
									}, (100 + time));
								} else {
									setTimeout(function(){
										box.animate({opacity:'1', width:w, height:h}, settings.animSpeed/1.3);
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
		var shuffle = function(arr){
			for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
			return arr;
		}

        // For debugging
        var trace = function(msg){
            if (this.console && typeof console.log != "undefined")
                console.log(msg);
        }

        // Start / Stop
        this.stop = function(){
            if(!$(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = true;
                trace('Stop Slider');
            }
        }

        this.start = function(){
            if($(element).data('nivo:vars').stop){
                $(element).data('nivo:vars').stop = false;
                trace('Start Slider');
            }
        }

        //Trigger the afterLoad callback
        settings.afterLoad.call(this);

		return this;
    };

    $.fn.nivoSlider = function(options) {

        return this.each(function(key, value){
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
		beforeChange: function(){},
		afterChange: function(){},
		slideshowEnd: function(){},
        lastSlide: function(){},
        afterLoad: function(){},
		afterActive: function(){},
		createCaption: null,
		changeCaption: null,
		createNaviContainer: null,
		changeNaviContainer: null,
		createPrevNavigation: null,
		createNextNavigation: null,
		createControlContainer: null,
		createControlItem: null
	};

	$.fn._reverse = [].reverse;

})(jQuery);
