/*
 * jQuery Nivo Slider v2.7.1
 * http://nivo.dev7studios.com
 *
 * Copyright 2011, Gilbert Pellegrom
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * January 2012
 */

(function($){

	var NivoSlider = function(element, options)
	{
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
		slider.css('position','relative');
		slider.addClass('nivoSlider');

		//Find our slider children
		var kids = slider.children(),
			kidsCount = kids.length,
			kidsIndex = 0,
			child,
			childWidth = 0,
			childHeight = 0,
			link = '';

		do{
			child = $(kids[kidsIndex]);

			if(!child.is('img')){
				if(child.is('a')){
					child.addClass('nivo-imageLink');
					link = child;
				}
				child = child.find('img').eq(0);
			}

			//Get img width & height
			childWidth = child.width(),
			childHeight = child.height();

			if(childWidth === 0) childWidth = child.attr('width');
			if(childHeight === 0) childHeight = child.attr('height');

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

			++vars.totalSlides;
		}
		while(++kidsIndex < kidsCount);

		//If randomStart
		if(settings.randomStart){
			settings.startSlide = Math.floor(Math.random() * vars.totalSlides);
		}

		//Set startSlide
		if(settings.startSlide > 0){
			if(settings.startSlide >= vars.totalSlides){
				settings.startSlide = vars.totalSlides - 1;
			}
			vars.currentSlide = settings.startSlide;
		}

		var el = $(kids[vars.currentSlide]);

		//Get initial image
		if(el.is('img')){
			vars.currentImage = el;
		} else {
			vars.currentImage = el.find('img').eq(0);
		}

		//Show initial link
		if(el.is('a')){
			el.css('display','block');
		}

		//Set first background
		slider.css('background', 'url("'+ vars.currentImage.attr('src') +'") no-repeat');

		//Create caption
		slider.append(
			$('<div class="nivo-caption"><p></p></div>').css({ display: 'none', opacity: settings.captionOpacity })
		);

		// Cross browser default caption opacity
		$('.nivo-caption', slider).css('opacity', 0);

		// Process caption function
		var processCaption = function(settings){
			var nivoCaption = $('.nivo-caption', slider),
				title = (vars.currentImage.attr('title')) ? vars.currentImage.attr('title') : '';

			if(title){
				if(title.substr(0,1) == '#') title = $(title).html();

				if(nivoCaption.css('opacity') != 0){
					nivoCaption.find('p').stop().fadeTo(settings.animSpeed, 0, function(){
						$(this).html(title).stop().fadeTo(settings.animSpeed, 1);
					});
				} else {
					nivoCaption.find('p').html(title);
				}
				nivoCaption.stop().fadeTo(settings.animSpeed, settings.captionOpacity);
			} else {
				nivoCaption.stop().fadeTo(settings.animSpeed, 0);
			}
		}

		//Process initial  caption
		processCaption(settings);

		//In the words of Super Mario "let's a go!"
		var timer = 0;
		if(!settings.manualAdvance && kids.length > 1){
			timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
		}

		//Add Direction nav
		if(settings.directionNav){
			slider.append('<div class="nivo-directionNav"><a class="nivo-prevNav">'+ settings.prevText +'</a><a class="nivo-nextNav">'+ settings.nextText +'</a></div>');

			//Hide Direction nav
			if(settings.directionNavHide){
				$('.nivo-directionNav', slider).hide();

				slider.hover(function(){
					$('.nivo-directionNav', slider).show();
				}, function(){
					$('.nivo-directionNav', slider).hide();
				});
			}

			$('a.nivo-prevNav', slider).live('click', function(){
				if(vars.running){
					return false;
				}

				clearInterval(timer);
				timer = '';
				vars.currentSlide -= 2;
				nivoRun(slider, kids, settings, 'prev');
			});

			$('a.nivo-nextNav', slider).live('click', function(){
				if(vars.running){
					return false;
				}

				clearInterval(timer);
				timer = '';
				nivoRun(slider, kids, settings, 'next');
			});
		}

		//Add Control nav
		if(settings.controlNav){
			var nivoControl = $('<div class="nivo-controlNav"></div>'),
				slide,
				controlHTML = '',
				i = 0;

			slider.append(nivoControl);

			do{
				if(settings.controlNavThumbs){
					slide = kids.eq(i);

					if(!slide.is('img')){
						slide = slide.find('img').eq(0);
					}

					if (settings.controlNavThumbsFromRel) {
						controlHTML = '<img src="'+ slide.attr('rel') + '" alt="" />';
					} else {
						controlHTML = '<img src="'+ slide.attr('src').replace(settings.controlNavThumbsSearch, settings.controlNavThumbsReplace) +'" alt="" />';
					}
				} else {
					controlHTML = i + 1;
				}

				nivoControl.append('<a class="nivo-control" rel="'+ i +'">'+ controlHTML +'</a>');
			}
			while(++i < kids.length);

			//Set initial active link
			$('.nivo-controlNav a', slider).eq(vars.currentSlide).addClass('active');

			$('.nivo-controlNav a', slider).live('click', function(){
				var anchor = $(this);

				if(vars.running || anchor.hasClass('active')){
					return false;
				}

				clearInterval(timer);
				timer = '';
				slider.css('background','url("'+ vars.currentImage.attr('src') +'") no-repeat');
				vars.currentSlide = anchor.attr('rel') - 1;
				nivoRun(slider, kids, settings, 'control');
			});
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
				timer = null;
			}, function(){
				vars.paused = false;
				//Restart the timer
				if(timer === null && !settings.manualAdvance){
					timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
				}
			});
		}

		//Event when Animation finishes
		slider.bind('nivo:animFinished', function(){
			vars.running = false;

			var	link,
				i = kids.length,
				el = $(kids[vars.currentSlide]);

			//Hide child links
			while(--i + 1){
				link = $(kids[i]);

				if(link.is('a')){
					link.css('display','none');
				}
			}

			//Show current link
			if(el.is('a')){
				el.css('display','block');
			}

			//Restart the timer
			if(timer == '' && !vars.paused && !settings.manualAdvance){
				timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
			}

			//Trigger the afterChange callback
			settings.afterChange.call(this);
		});

		// Add slices for slice animations
		var createSlices = function(){
			var	sliderImg = vars.currentImage.attr('src'),
				sliderWidth = slider.width(),
				slices = 0,
				slicesHTML = document.createDocumentFragment(),
				sliceWidth,
				offset;

			var css = {
				background: '',
				left: '',
				width: '',
				height: '0px',
				opacity: 0
			};

			do{
				sliceWidth = Math.round(sliderWidth / settings.slices);
				offset = sliceWidth * slices;

				css.left = offset +'px';
				css.background = 'url("'+ sliderImg +'") no-repeat -'+ ((sliceWidth + offset) - sliceWidth) +'px 0%';
				css.width = sliceWidth +'px';

				// fix up uneven spacing
				if(slices == settings.slices - 1){
					css.width = (sliderWidth - offset) +'px';
				}

				// add slice to fragment - use jQuery to add css
				slicesHTML.appendChild($('<div class="nivo-slice"></div>').css(css)[0]);
			}
			while(++slices < settings.slices);

			// insert slices as a whole
			slider.append(slicesHTML);
		};

		// Add boxes for box animations
		var createBoxes = function(){
			var	sliderWidth = slider.width(),
				boxWidth = Math.round(sliderWidth / settings.boxCols),
				boxHeight = Math.round(slider.height() / settings.boxRows),
				boxesHTML = document.createDocumentFragment(),
				offsetLeft = 0,
				rows = 0,
				cols = 0;

			var css = {
				background: 'url("'+ vars.currentImage.attr('src') +'") no-repeat',
				backgroundPosition: '',
				left: '',
				top: '',
				width: '',
				height: boxHeight +'px',
				opacity: 0
			};

			do{
				// row specific styles
				css.top = (boxHeight * rows) +'px';
				css.width = boxWidth +'px';

				do{
					offsetLeft = boxWidth * cols;

					// column specific styles
					css.left = (boxWidth * cols) +'px';
					css.backgroundPosition = '-'+ ((boxWidth + offsetLeft) - boxWidth) +'px -'+ ((boxHeight + (rows * boxHeight)) - boxHeight) +'px';

					// fix up uneven spacing
					if(cols === settings.boxCols - 1){
						css.width = (sliderWidth - offsetLeft) +'px';
					}

					// add box to fragment - use jQuery to add css
					boxesHTML.appendChild($('<div class="nivo-box"></div>').css(css)[0]);
				}
				while(++cols < settings.boxCols);

				// reset columns
				cols = 0;
			}
			while(++rows < settings.boxRows);

			// insert boxes as a whole
			slider.append(boxesHTML);
		};

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

			var currentElement = $(kids[vars.currentSlide]);
			//Set vars.currentImage
			vars.currentImage = (currentElement.is('img')) ? currentElement : currentElement.find('img').eq(0);

			//Set active links
			if(settings.controlNav){
				$('.nivo-controlNav a', slider).removeClass('active').eq(vars.currentSlide).addClass('active');
			}

			//Process caption
			processCaption(settings);

			// Remove any slices from last transition
			$('.nivo-slice', slider).remove();

			// Remove any boxes from last transition
			$('.nivo-box', slider).remove();

			var currentEffect = settings.effect;

			//Generate random effect
			if(settings.effect === 'random'){
				var anims = ['sliceDownRight','sliceDownLeft','sliceUpRight','sliceUpLeft','sliceUpDown','sliceUpDownLeft','fold','fade',
				'boxRandom','boxRain','boxRainReverse','boxRainGrow','boxRainGrowReverse'];

				currentEffect = anims[Math.floor(Math.random() * (anims.length - 1))];
				if(currentEffect === undefined){
					currentEffect = 'fade';
				}
			}

			//Run random effect from specified set (eg: effect:'fold,fade')
			if(settings.effect.indexOf(',') !== -1){
				var anims = settings.effect.split(',');

				currentEffect = anims[Math.floor(Math.random() * anims.length)];

				if(currentEffect == undefined){
					currentEffect = 'fade';
				}
			}

			//Custom transition as defined by "data-transition" attribute
			if(vars.currentImage.attr('data-transition')){
				currentEffect = vars.currentImage.attr('data-transition');
			}

			//Run effects
			vars.running = true;

			var timedAnimate = function(el, css, speed, buff, end){
				setTimeout(function(){
					el.animate(css, (!speed) ? settings.animSpeed : speed, '', (end) ? function(){ slider.trigger('nivo:animFinished') } : null);
				}, 100 + buff)
			}

			switch(currentEffect){
				case 'sliceDown':
				case 'sliceDownRight':
				case 'sliceDownLeft':
					createSlices(slider, settings, vars);

					var timeBuff = 0,
						slices = $('.nivo-slice', slider),
						sliceIndex = 0,
						slice;

					if(currentEffect === 'sliceDownLeft'){
						slices = slices._reverse();
					}

					do{
						slice = $(slices[sliceIndex]);

						slice.css({ 'top': '0px' });

						timedAnimate(slice, { height: '100%', opacity: 1 }, null, timeBuff, (sliceIndex === settings.slices - 1) ? true : false);

						timeBuff += 50;
					}
					while(++sliceIndex < settings.slices);
				break;

				case 'sliceUp':
				case 'sliceUpRight':
				case 'sliceUpLeft':
					createSlices(slider, settings, vars);

					var timeBuff = 0,
						slices = $('.nivo-slice', slider),
						sliceIndex = 0,
						slice;

					if(currentEffect === 'sliceUpLeft'){
						slices = slices._reverse();
					}

					do{
						slice = $(slices[sliceIndex]);

						slice.css({ 'bottom': '0px' });

						timedAnimate(slice, { height: '100%', opacity: 1 }, null, timeBuff, (sliceIndex === settings.slices - 1) ? true : false);

						timeBuff += 50;
					}
					while(++sliceIndex < settings.slices);
				break;

				case 'sliceUpDown':
				case 'sliceUpDownRight':
				case 'sliceUpDownLeft':
					createSlices(slider, settings, vars);

					var timeBuff = 0,
						top = 0,
						slices = $('.nivo-slice', slider),
						sliceIndex = 0,
						slice;

					if(currentEffect === 'sliceUpDownLeft'){
						slices = slices._reverse();
					}

					do{
						slice = $(slices[sliceIndex]);

						if(top){
							slice.css('top', '0px');
						} else {
							slice.css('bottom', '0px');
						}
						// flip bool
						top = !top;

						timedAnimate(slice, { height: '100%', opacity: 1 }, null, timeBuff, (sliceIndex === settings.slices - 1) ? true : false);

						timeBuff += 50;
					}
					while(++sliceIndex < settings.slices);
				break;

				case 'fold':
					createSlices(slider, settings, vars);

					var	timeBuff = 0,
						slices = $('.nivo-slice', slider),
						sliceIndex = 0,
						slice,
						sliceWidth = 0;

					do{
						slice = $(slices[sliceIndex]);
						sliceWidth = slice.width();

						slice.css({ top: '0px', height: '100%', width: '0px' });

						timedAnimate(slice, { width: sliceWidth +'px', opacity: 1 }, null, timeBuff, (sliceIndex === settings.slices - 1) ? true : false);

						timeBuff += 50;
					}
					while(++sliceIndex < settings.slices);
				break;

				case 'fade':
					createSlices(slider, settings, vars);

					var firstSlice = $('.nivo-slice', slider).eq(0);

					firstSlice
						.css({ height: '100%', width: slider.width() +'px' })

						.animate({ opacity: 1 }, (settings.animSpeed * 2), '', function(){
							slider.trigger('nivo:animFinished');
						});
				break;

				case 'slideInRight':
					createSlices(slider, settings, vars);

					var firstSlice = $('.nivo-slice', slider).eq(0);

					firstSlice
						.css({ height: '100%', width: '0px', opacity: 1})

						.animate({ width: slider.width() +'px' }, (settings.animSpeed * 2), '', function(){
							slider.trigger('nivo:animFinished');
						});
				break;

				case 'slideInLeft':
					createSlices(slider, settings, vars);

					var firstSlice = $('.nivo-slice', slider).eq(0);

					firstSlice
						.css({ height: '100%', width: '0px', opacity: 1, left: '', right: '0px' })

						.animate({ width: slider.width() +'px' }, (settings.animSpeed * 2), '', function(){
							// Reset positioning
							firstSlice.css({ left: '0px', right: '' });
							slider.trigger('nivo:animFinished');
						});
				break;

				case 'boxRandom':
					createBoxes(slider, settings, vars);

					var totalBoxes = settings.boxCols * settings.boxRows,
						timeBuff = 0,
						boxes = shuffle($('.nivo-box', slider)),
						boxIndex = 0,
						box;

					do{
						box = $(boxes[boxIndex]);

						timedAnimate(box, { opacity: 1 }, null, timeBuff, (boxIndex === totalBoxes - 1) ? true : false);

						timeBuff += 20;
					}
					while(++boxIndex < totalBoxes);
				break;

				case 'boxRain':
				case 'boxRainReverse':
				case 'boxRainGrow':
				case 'boxRainGrowReverse':
					createBoxes(slider, settings, vars);

					var totalBoxes = settings.boxCols * settings.boxRows,
						timeBuff = 0,
						box2Darr = new Array(),
						rowIndex = 0,
						colIndex = 0,
						boxes = $('.nivo-box', slider),
						boxIndex = 0;

					if(currentEffect == 'boxRainReverse' || currentEffect == 'boxRainGrowReverse'){
						boxes = boxes._reverse();
					}

					// Split boxes into 2D array
					box2Darr[rowIndex] = new Array();

					do{
						box2Darr[rowIndex][colIndex] = boxes[boxIndex];
						++colIndex;

						if(colIndex === settings.boxCols){
							++rowIndex;
							box2Darr[rowIndex] = new Array();

							// reset column
							colIndex = 0;
						}
					}
					while(++boxIndex < totalBoxes);

					var cols = 0,
						rows = 0,
						curCol = 0,
						i = 0,
						box,
						boxWidth = 0,
						boxHeight = 0;

					// Run animation
					do{
						curCol = cols;

						do{
							++i;

							if(curCol >= 0 && curCol < settings.boxCols){
								box = $(box2Darr[rows][curCol]);
								boxWidth = box.width();
								boxHeight = box.height();

								if(currentEffect == 'boxRainGrow' || currentEffect == 'boxRainGrowReverse'){
									box.width(0).height(0);
								}

								timedAnimate(box, { width: boxWidth, height: boxHeight, opacity: 1}, settings.animSpeed / 1.3, timeBuff, (i === totalBoxes) ? true : false);
							}

							--curCol;
						}
						while(++rows < settings.boxRows);

						// reset rows
						rows = 0;

						timeBuff += 100;
					}
					while(++cols < (settings.boxCols * 2));
				break;
			}
		}

		// Shuffle an array
		var shuffle = function(arr){
			for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
			return arr;
		}

		// Start / Stop
		this.stop = function(){
			if(!$(element).data('nivo:vars').stop){
				$(element).data('nivo:vars').stop = true;
			}
		}

		this.start = function(){
			if($(element).data('nivo:vars').stop){
				$(element).data('nivo:vars').stop = false;
			}
		}

		//Trigger the afterLoad callback
		settings.afterLoad.call(this);

		return this;
	};
	$.fn.nivoSlider = function(options){
		return this.each(function(key, value){
			var element = $(this);
			// Return early if this element already has a plugin instance
			if (element.data('nivoslider')){
				return element.data('nivoslider');
			}
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
		beforeChange: function(){},
		afterChange: function(){},
		slideshowEnd: function(){},
		lastSlide: function(){},
		afterLoad: function(){}
	};
	
	$.fn._reverse = [].reverse;

})(jQuery);