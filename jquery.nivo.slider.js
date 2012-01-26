/**
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
			previousSlideIndex: 0,
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
		el.linkSlides = el.slider.children('a') || false;

		var	slide,
			slidesIndex = el.slides.length,
			slideWidth = 0,
			slideHeight = 0;

		while(--slidesIndex + 1){
			slide = $(el.slides[slidesIndex]);

			if(!slide.is('img')){
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

		// attach class to anchors
		if(el.linkSlides){
			el.linkSlides.addClass('nivo-imageLink');
		}

		//If randomStart
		if(settings.randomStart){
			settings.startSlide = Math.floor(Math.random() * vars.totalSlides);
		}

		//Set startSlide
		if(settings.startSlide > 0){
			// limit startslide at total slides count
			if(settings.startSlide >= vars.totalSlides){
				settings.startSlide = vars.totalSlides - 1;
			}

			vars.previousSlideIndex = settings.startSlide - 1;
			vars.currentSlideIndex = settings.startSlide;
		}

		// add current slide element to element object
		el.currentSlide = $(el.slides[vars.currentSlideIndex]);

		//Get initial image
		vars.currentImage = (el.currentSlide.is('img')) ? el.currentSlide : el.currentSlide.find('img').eq(0);
		vars.currentImage = {
			url: vars.currentImage.attr('src'),
			title: vars.currentImage.attr('title')
		};

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
			var title = vars.currentImage.title || null;

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

		// we need more than one slide!
		if(vars.totalSlides < 2){
			return false;
		}

		var timer = null;

		//In the words of Super Mario "let's a go!"
		if(!settings.manualAdvance){
			timer = setInterval(function(){ nivoRun(false); }, settings.pauseTime);
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
						var dir = $(this).data('dir') || 'next';

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
			$(document).keydown(function(e){
				var code = e.keyCode || e.which;

				if(vars.running){
					return false;
				}

				clearInterval(timer);
				timer = null;

				//Left
				if(code === 37 || code === 63234){
					vars.currentSlideIndex -= 2;
					nivoRun('prev');
				}
				//Right
				else if(code === 39 || code === 63235){
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
						timer = setInterval(function(){ nivoRun(false);	}, settings.pauseTime);
					}
				}
			);
		}

		//Event when Animation finishes
		el.slider.bind('nivo:animFinished', function(){
			vars.running = false;

			//Show current link
			if(el.currentSlide.is('a')){
				el.currentSlide.css('display','block');
			}

			//Restart the timer
			if(timer === null && !vars.paused && !settings.manualAdvance){
				timer = setInterval(function(){ nivoRun(false); }, settings.pauseTime);
			}

			//Trigger the afterChange callback
			settings.afterChange.call(this);
		});

		// Add slices for slice animations
		var createSlices = function(slices){
			var	sliderWidth = el.slider.width(),
				i = 0,
				sliceLimit = slices || settings.slices,
				slicesHTML = document.createDocumentFragment(),
				sliceWidth,
				offset;

			var	css = {
				background: '',
				left: '',
				width: '',
				height: '0',
				opacity: 0
			};

			do{
				sliceWidth = Math.round(sliderWidth / sliceLimit);
				offset = sliceWidth * i;

				css.left = offset +'px';
				css.background = 'url("'+ vars.currentImage.url +'") no-repeat -'+ ((sliceWidth + offset) - sliceWidth) +'px 0%';
				css.width = sliceWidth +'px';

				// fix up uneven spacing
				if(i === sliceLimit - 1){
					css.width = (sliderWidth - offset) +'px';
				}

				// add slice to fragment - use jQuery to add css
				slicesHTML.appendChild($('<div class="nivo-slice"></div>').css(css)[0]);
			}
			while(++i < sliceLimit);

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
				row = 0,
				col = 0;

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
				css.top = (boxHeight * row) +'px';
				css.width = boxWidth +'px';

				do{
					offsetLeft = boxWidth * col;

					// column specific styles
					css.left = offsetLeft +'px';
					css.backgroundPosition = '-'+ ((boxWidth + offsetLeft) - boxWidth) +'px -'+ ((boxHeight + (row * boxHeight)) - boxHeight) +'px';

					// fix up uneven spacing
					if(col === settings.boxCols - 1){
						css.width = (sliderWidth - offsetLeft) +'px';
					}

					// add box to fragment - use jQuery to add css
					boxesHTML.appendChild($('<div class="nivo-box"></div>').css(css)[0]);
				}
				while(++col < settings.boxCols);

				// reset columns
				col = 0;
			}
			while(++row < settings.boxRows);

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
			if((!vars || vars.stop) && !nudge){
				return false;
			}

			//Trigger the beforeChange callback
			settings.beforeChange.call(this);

			//Set current background before change
			el.slider.css('background','url("'+ vars.currentImage.url +'") no-repeat');

			// previous index is stored at the end of this function

			// increment current index
			++vars.currentSlideIndex;

			if(vars.currentSlideIndex >= vars.totalSlides){
				vars.currentSlideIndex = 0;

				//Trigger the slideshowEnd callback
				settings.slideshowEnd.call(this);
			}
			else if(vars.currentSlideIndex < 0){
				vars.currentSlideIndex = vars.totalSlides - 1;
			}

			// update previous slide element
			el.previousSlide = el.currentSlide;

			// update current slide element
			el.currentSlide = $(el.slides[vars.currentSlideIndex]);

			//Set slide images
			vars.previousImage = vars.currentImage;

			vars.currentImage = (el.currentSlide.is('img')) ? el.currentSlide : el.currentSlide.find('img').eq(0);
			vars.currentImage = {
				url: vars.currentImage.attr('src'),
				title: vars.currentImage.attr('title'),
				transition: vars.currentImage.data('transition')
			};

			//Set active links
			if(settings.controlNav){
				el.sliderControlNavLinks.removeClass('active').eq(vars.currentSlideIndex).addClass('active');
			}

			// hide links
			if(el.linkSlides){
				el.linkSlides.css('display','none');
			}

			//Process caption
			processCaption();

			// Remove any slices from last transition
			$('.nivo-slice', el.slider).remove();
			// Remove any boxes from last transition
			$('.nivo-box', el.slider).remove();

			var currentEffect = settings.effect || 'fade';

			//Generate random effect
			if(settings.effect === 'random'){
				var anims = ['sliceDownRight','sliceDownLeft','sliceUpRight','sliceUpLeft','sliceUpDown','sliceUpDownLeft','fold','fade',
				'cycle','boxRandom','boxRain','boxRainReverse','boxRainGrow','boxRainGrowReverse'];

				currentEffect = anims[Math.floor(Math.random() * (anims.length - 1))];
			}
			//Run random effect from specified set (eg: effect:'fold,fade')
			else if(settings.effect.indexOf(',') !== -1){
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
					element.animate(css, (speed || settings.animSpeed), '', (end && function(){ el.slider.trigger('nivo:animFinished'); }));
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

						slice.css({ 'top': '0' });

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

						slice.css({ 'bottom': '0' });

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
							slice.css('top', '0');
						} else {
							slice.css('bottom', '0');
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

						slice.css({ top: '0', height: '100%', width: '0' });

						timedAnimate(slice, { width: sliceWidth +'px', opacity: 1 }, null, timeBuff, (sliceIndex === settings.slices - 1) ? true : false);

						timeBuff += 50;
					}
					while(++sliceIndex < settings.slices);
				break;

				default:
				case 'fade':
					createSlices(1);

					var slice = $('.nivo-slice', el.slider);

					slice
						.css({ width: el.slider.width() +'px', height: '100%' })

						.animate({ opacity: 1 }, (settings.animSpeed * 2), '', function(){
							el.slider.trigger('nivo:animFinished');
						});
				break;

				case 'cycle':
				case 'cycleLeft':
				case 'cycleRight':
					createSlices(1);

					var	sliderWidth = el.slider.width(),
						slice = $('.nivo-slice', el.slider),
						cycleLeft = (currentEffect === 'cycleLeft' || (currentEffect === 'cycle' && (nudge === 'prev' ||  (nudge === 'control' && vars.currentSlideIndex < vars.previousSlideIndex)))) ? true : false,
						css1, css2,
						sliceHTML = document.createDocumentFragment();

					css1 = {
						position: 'absolute',
						right: (cycleLeft) ? '0' : sliderWidth +'px',
						background: 'url("'+ vars.previousImage.url +'")',
 						width: sliderWidth +'px',
 						height: '100%'
 					};

					css2 = {
						position: 'absolute',
						right: (cycleLeft) ? sliderWidth +'px' : '0',
						background: 'url("'+ vars.currentImage.url +'")',
						width: sliderWidth +'px',
						height: '100%'
					};

					sliceHTML.appendChild($('<div></div>').css(css1)[0]);
					sliceHTML.appendChild($('<div></div>').css(css2)[0]);
					slice.html(sliceHTML);

					var css = {
						left: (cycleLeft) ? -sliderWidth +'px' : '0',
						width: (sliderWidth * 2) +'px',
						height: '100%',
						opacity: 1
					};

					slice
						.css(css)

						.animate({ left: ((cycleLeft) ? '0' : -sliderWidth +'px') }, (settings.animSpeed * 2), '', function(){
							el.slider.trigger('nivo:animFinished');
						});
				break;

				case 'slideInHorizontal':
				case 'slideInLeft':
				case 'slideInRight':
					createSlices(1);

					var	slice = $('.nivo-slice', el.slider),
						slideInLeft = (currentEffect === 'slideInLeft' || (currentEffect === 'slideInHorizontal' && (nudge === 'prev' ||  (nudge === 'control' && vars.currentSlideIndex < vars.previousSlideIndex)))) ? true : false;

					var	css = {
						left: (slideInLeft) ? '0' : '',
						right: (slideInLeft) ? '' : '0',
						backgroundPosition: (slideInLeft) ? '100% 0' : '0 0',
						width: '0',
						height: '100%',
						opacity: 1
					};

					slice
						.css(css)

						.animate({ width: '100%' }, (settings.animSpeed * 2), '', function(){
							el.slider.trigger('nivo:animFinished');
						});
				break;

				case 'slideInVertical':
				case 'slideInTop':
				case 'slideInBottom':
					createSlices(1);

					var	slice = $('.nivo-slice', el.slider),
						slideInTop = (currentEffect === 'slideInTop' || (currentEffect === 'slideInVertical' && (nudge === 'prev' ||  (nudge === 'control' && vars.currentSlideIndex > vars.previousSlideIndex)))) ? true : false;

					var	css = {
						top: (slideInTop) ? '0' : '',
						bottom: (slideInTop) ? '' : '0',
						backgroundPosition: (slideInTop) ? '0 100%' : '0 0',
						width: '100%',
						height: '0',
						opacity: 1
					};

					slice
						.css(css)

						.animate({ height: '100%' }, (settings.animSpeed * 2), '', function(){
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
						boxIndex = 0,
						i = totalBoxes;

					if(currentEffect == 'boxRainReverse' || currentEffect == 'boxRainGrowReverse'){
						boxes = boxes._reverse();
					}

					// Split boxes into 2D array
					box2Darr[rowIndex] = new Array();

					do{
						box2Darr[rowIndex][colIndex] = boxes[boxIndex];
						++colIndex;
						++boxIndex;

						if(colIndex === settings.boxCols){
							++rowIndex;
							box2Darr[rowIndex] = new Array();

							// reset column
							colIndex = 0;
						}
					}
					while(--i);

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
							if(curCol >= 0 && curCol < settings.boxCols){
								box = $(box2Darr[rows][curCol]);
								boxWidth = box.width();
								boxHeight = box.height();

								if(currentEffect == 'boxRainGrow' || currentEffect == 'boxRainGrowReverse'){
									box.width(0).height(0);
								}

								timedAnimate(box, { width: boxWidth, height: boxHeight, opacity: 1}, settings.animSpeed / 1.3, timeBuff, (++i === totalBoxes) ? true : false);
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

			// save current index as previous index
			vars.previousSlideIndex = vars.currentSlideIndex;
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
		};

		this.start = function(){
			if(el.slider.data('nivo:vars').stop){
				el.slider.data('nivo:vars').stop = false;
			}
		};

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