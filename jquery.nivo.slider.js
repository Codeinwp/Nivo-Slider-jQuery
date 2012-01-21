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
			currentSlideIndex: 0,
			currentImage: {},
			totalSlides: 0,
			running: false,
			paused: false,
			stop: false
		};

		// element cache
		var el = {};

		//Get this slider
		el.slider = $(element);
		el.slider.data('nivo:vars', vars);
		el.slider.css('position','relative');
		el.slider.addClass('nivoSlider');

		//Find our slider children
		el.slides = el.slider.children();

		var	slide,
			slidesIndex = el.slides.length,
			slideWidth = 0,
			slideHeight = 0;

		while(--slidesIndex + 1){
			slide = $(el.slides[slidesIndex]);

			if(!slide.is('img')){
				if(slide.is('a')){
					slide.addClass('nivo-imageLink');
				}
				slide = slide.find('img').eq(0);
			}

			//Get img width & height
			slideWidth = slide.width(),
			slideHeight = slide.height();

			if(slideWidth === 0) slideWidth = slide.attr('width');
			if(slideHeight === 0) slideHeight = slide.attr('height');

			//Resize the slider
			if(slideWidth > el.slider.width()){
				el.slider.width(slideWidth);
			}
			if(slideHeight > el.slider.height()){
				el.slider.height(slideHeight);
			}

			slide.css('display','none');

			++vars.totalSlides;
		}

		//If randomStart
		if(settings.randomStart){
			settings.startSlide = Math.floor(Math.random() * vars.totalSlides);
		}

		//Set startSlide
		if(settings.startSlide > 0){
			if(settings.startSlide >= vars.totalSlides){
				settings.startSlide = vars.totalSlides - 1;
			}
			vars.currentSlideIndex = settings.startSlide;
		}

		// add caption elements to element object
		el.currentSlide = $(el.slides[vars.currentSlideIndex]);

		//Get initial image
		if(el.currentSlide.is('img')){
			vars.currentImage.url = el.currentSlide.attr('src');
			vars.currentImage.title = el.currentSlide.attr('title');
		} else {
			var img = el.currentSlide.find('img').eq(0);
			vars.currentImage.url = img.attr('src');
			vars.currentImage.title = img.attr('title');
		}

		//Show initial link
		if(el.currentSlide.is('a')){
			el.currentSlide.css('display','block');
		}

		//Set first background
		el.slider
			.css('background', 'url("'+ vars.currentImage.url +'") no-repeat')
			//Create caption
			.append(
				$('<div class="nivo-caption"><p></p></div>').css({ display: 'none', opacity: settings.captionOpacity })
			);

		// add caption elements to element object
		el.sliderCaption = $('.nivo-caption', el.slider);
		el.sliderCaptionP = el.sliderCaption.find('p');

		// Cross browser default caption opacity
		el.sliderCaption.css('opacity', 0);

		// Process caption function
		var processCaption = function(){
			var title = (vars.currentImage.title) ? vars.currentImage.title : null;

			if(title){
				if(title.substr(0,1) == '#'){
					title = $(title).html();
				}

				if(el.sliderCaption.css('opacity') != 0){
					el.sliderCaptionP.stop().fadeTo(settings.animSpeed, 0, function(){
						el.sliderCaptionP.html(title).stop().fadeTo(settings.animSpeed, 1);
					});
				} else {
					el.sliderCaptionP.html(title);
				}
			}

			el.sliderCaption.stop().fadeTo(settings.animSpeed, (title) ? settings.captionOpacity : 0);
		}

		//Process initial caption
		processCaption();

		//In the words of Super Mario "let's a go!"
		var timer = 0;
		if(!settings.manualAdvance && vars.totalSlides > 1){
			timer = setInterval(function(){ nivoRun(false); }, settings.pauseTime);
		} else {
			// "oh dear!"
			return false;
		}

		//Add Direction nav
		if(settings.directionNav){

			// insert direction controls
			el.slider.append('<div class="nivo-directionNav"><a class="nivo-prevNav" data-dir="prev">'+ settings.prevText +'</a><a class="nivo-nextNav" data-dir="next">'+ settings.nextText +'</a></div>');

			// add direction nav element to element object
			el.sliderDirectionNav = $('.nivo-directionNav', el.slider);

			//Hide Direction nav
			if(settings.directionNavHide){
				el.sliderDirectionNav.hide();

				el.slider.hover(
					function(){
						el.sliderDirectionNav.show();
					},
					function(){
						el.sliderDirectionNav.hide();
					}
				);
			}

			el.sliderDirectionNav
				.children()
				.click(
					function(){
						var dir = $(this).data('dir');
						dir = (dir) ? dir : 'next';

						if(vars.running){
							return false;
						}

						clearInterval(timer);
						timer = null;

						if (dir === 'prev'){
							vars.currentSlideIndex -= 2;
						}
						nivoRun(dir);
					}
				);
		}

		//Add Control nav
		if(settings.controlNav){
			var slide,
				controlHTML = '',
				controlHTMLContent = '',
				i = el.slides.length;

			while(--i + 1){
				if(settings.controlNavThumbs){
					slide = $(el.slides[i]);

					if(!slide.is('img')){
						slide = slide.find('img').eq(0);
					}

					if (settings.controlNavThumbsFromRel) {
						controlHTMLContent = '<img src="'+ slide.attr('rel') + '" alt="" />';
					} else {
						controlHTMLContent = '<img src="'+ slide.attr('src').replace(settings.controlNavThumbsSearch, settings.controlNavThumbsReplace) +'" alt="" />';
					}
				} else {
					controlHTMLContent = i + 1;
				}

				controlHTML = '<a class="nivo-control" data-slide="'+ i +'">'+ controlHTMLContent +'</a>' + controlHTML;
			}

			// append control HTML as a whole
			el.slider.append('<div class="nivo-controlNav">'+ controlHTML +'</div>');

			// add control nav to elements object
			el.sliderControlNav = $('.nivo-controlNav', el.slider);
			el.sliderControlNavLinks = el.sliderControlNav.find('a');

			//Set initial active link
			el.sliderControlNavLinks
				.click(
					function(){
						var anchor = $(this);

						if(vars.running || anchor.hasClass('active')){
							return false;
						}

						clearInterval(timer);
						timer = null;

						el.slider.css('background', 'url("'+ vars.currentImage.url +'") no-repeat');

						vars.currentSlideIndex = anchor.data('slide') - 1;
						nivoRun('control');
					}
				)
				.eq(vars.currentSlideIndex)
				.addClass('active');
		}

		//Keyboard Navigation
		if(settings.keyboardNav){
			$(document).keypress(function(e){
				//Left
				if(e.keyCode == '37'){
					if(vars.running){
						return false;
					}

					clearInterval(timer);
					timer = null;
					vars.currentSlideIndex -= 2;
					nivoRun('prev');
				}
				//Right
				else if(e.keyCode == '39'){
					if(vars.running){
						return false;
					}

					clearInterval(timer);
					timer = null;
					nivoRun('next');
				}
			});
		}

		//For pauseOnHover setting
		if(settings.pauseOnHover){
			el.slider.hover(
				function(){
					vars.paused = true;

					clearInterval(timer);
					timer = null;
				},
				function(){
					vars.paused = false;

					//Restart the timer
					if(timer === null && !settings.manualAdvance){
						timer = setInterval(function(){ nivoRun(false); }, settings.pauseTime);
					}
				}
			);
		}

		//Event when Animation finishes
		el.slider.bind('nivo:animFinished', function(){
			vars.running = false;

			var	link,
				i = el.slides.length;

			//Hide child links
			while(--i + 1){
				link = $(el.slides[i]);

				if(link.is('a')){
					link.css('display','none');
				}
			}

			//Show current link
			if(el.currentSlide.is('a')){
				el.currentSlide.css('display','block');
			}

			//Restart the timer
			if(timer == '' && !vars.paused && !settings.manualAdvance){
				timer = setInterval(function(){ nivoRun(false); }, settings.pauseTime);
			}

			//Trigger the afterChange callback
			settings.afterChange.call(this);
		});

		// Add slices for slice animations
		var createSlices = function(){
			var	sliderImg = vars.currentImage.url,
				sliderWidth = el.slider.width(),
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
			el.slider.append(slicesHTML);
		};

		// Add boxes for box animations
		var createBoxes = function(){
			var	sliderWidth = el.slider.width(),
				boxWidth = Math.round(sliderWidth / settings.boxCols),
				boxHeight = Math.round(el.slider.height() / settings.boxRows),
				boxesHTML = document.createDocumentFragment(),
				offsetLeft = 0,
				rows = 0,
				cols = 0;

			var css = {
				background: 'url("'+ vars.currentImage.url +'") no-repeat',
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
			el.slider.append(boxesHTML);
		};

		// Private run method
		var nivoRun = function(nudge){
			//Get our vars
			var vars = el.slider.data('nivo:vars');

			//Trigger the lastSlide callback
			if(vars && (vars.currentSlideIndex == vars.totalSlides - 1)){
				settings.lastSlide.call(this);
			}

			// Stop
			if((!vars || vars.stop) && !nudge) return false;

			//Trigger the beforeChange callback
			settings.beforeChange.call(this);

			//Set current background before change
			if(!nudge){
				el.slider.css('background','url("'+ vars.currentImage.url +'") no-repeat');
			} else {
				if(nudge == 'prev'){
					el.slider.css('background','url("'+ vars.currentImage.url +'") no-repeat');
				}
				if(nudge == 'next'){
					el.slider.css('background','url("'+ vars.currentImage.url +'") no-repeat');
				}
			}

			// increment current slide
			++vars.currentSlideIndex;

			//Trigger the slideshowEnd callback
			if(vars.currentSlideIndex == vars.totalSlides){
				vars.currentSlideIndex = 0;
				settings.slideshowEnd.call(this);
			}
			else if(vars.currentSlideIndex < 0){
				vars.currentSlideIndex = (vars.totalSlides - 1);
			}

			// update current slide element
			el.currentSlide = $(el.slides[vars.currentSlideIndex]);
			el.currentSlide = (el.currentSlide.is('img')) ? el.currentSlide : el.currentSlide.find('img').eq(0);

			//Set vars.currentImage
			vars.currentImage = {
				url: el.currentSlide.attr('src'),
				title: el.currentSlide.attr('title'),
				transition: el.currentSlide.data('transition')
			}

			//Set active links
			if(settings.controlNav){
				el.sliderControlNavLinks.removeClass('active').eq(vars.currentSlideIndex).addClass('active');
			}

			//Process caption
			processCaption();

			// Remove any slices from last transition
			$('.nivo-slice', el.slider).remove();

			// Remove any boxes from last transition
			$('.nivo-box', el.slider).remove();

			var currentEffect = settings.effect;

			//Generate random effect
			if(settings.effect === 'random'){
				var anims = ['sliceDownRight','sliceDownLeft','sliceUpRight','sliceUpLeft','sliceUpDown','sliceUpDownLeft','fold','fade',
				'boxRandom','boxRain','boxRainReverse','boxRainGrow','boxRainGrowReverse'];

				currentEffect = anims[Math.floor(Math.random() * (anims.length - 1))];
			}

			//Run random effect from specified set (eg: effect:'fold,fade')
			if(settings.effect.indexOf(',') !== -1){
				var anims = settings.effect.split(',');

				currentEffect = anims[Math.floor(Math.random() * anims.length)];
			}

			//Custom transition as defined by "data-transition" attribute
			if(vars.currentImage.transition){
				currentEffect = vars.currentImage.transition;
			}

			//Run effects
			vars.running = true;

			var timedAnimate = function(element, css, speed, buff, end){
				setTimeout(function(){
					element.animate(css, (!speed) ? settings.animSpeed : speed, '', (end) ? function(){ el.slider.trigger('nivo:animFinished'); _log((end) ? 'the end' : ''); } : null);
				}, 100 + buff)
			}

			switch(currentEffect){
				case 'sliceDown':
				case 'sliceDownRight':
				case 'sliceDownLeft':
					createSlices();

					var timeBuff = 0,
						slices = $('.nivo-slice', el.slider),
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
					createSlices();

					var timeBuff = 0,
						slices = $('.nivo-slice', el.slider),
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
					createSlices();

					var timeBuff = 0,
						top = 0,
						slices = $('.nivo-slice', el.slider),
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
					createSlices();

					var	timeBuff = 0,
						slices = $('.nivo-slice', el.slider),
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

				default:
				case 'fade':
					createSlices();

					var firstSlice = $('.nivo-slice', el.slider).eq(0);

					firstSlice
						.css({ height: '100%', width: el.slider.width() +'px' })

						.animate({ opacity: 1 }, (settings.animSpeed * 2), '', function(){
							el.slider.trigger('nivo:animFinished');
						});
				break;

				case 'slideInRight':
					createSlices();

					var firstSlice = $('.nivo-slice', el.slider).eq(0);

					firstSlice
						.css({ height: '100%', width: '0px', opacity: 1})

						.animate({ width: el.slider.width() +'px' }, (settings.animSpeed * 2), '', function(){
							el.slider.trigger('nivo:animFinished');
						});
				break;

				case 'slideInLeft':
					createSlices();

					var firstSlice = $('.nivo-slice', el.slider).eq(0);

					firstSlice
						.css({ height: '100%', width: '0px', opacity: 1, left: '', right: '0px' })

						.animate({ width: el.slider.width() +'px' }, (settings.animSpeed * 2), '', function(){
							// Reset positioning
							firstSlice.css({ left: '0px', right: '' });
							el.slider.trigger('nivo:animFinished');
						});
				break;

				case 'boxRandom':
					createBoxes();

					var totalBoxes = settings.boxCols * settings.boxRows,
						timeBuff = 0,
						boxes = shuffle($('.nivo-box', el.slider)),
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
					createBoxes();

					var totalBoxes = settings.boxCols * settings.boxRows,
						timeBuff = 0,
						box2Darr = new Array(),
						rowIndex = 0,
						colIndex = 0,
						boxes = $('.nivo-box', el.slider),
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
			if(!el.slider.data('nivo:vars').stop){
				el.slider.data('nivo:vars').stop = true;
			}
		}

		this.start = function(){
			if(el.slider.data('nivo:vars').stop){
				el.slider.data('nivo:vars').stop = false;
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