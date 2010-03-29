/*
 * jQuery Nivo Slider v1.6
 * http://nivo.dev7studios.com
 *
 * Copyright 2010, Gilbert Pellegrom
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * March 2010
 */

(function($) {

	$.fn.nivoSlider = function(options) {
	
		var currentSlide = 0;
		var currentImage = '';
		var totalSlides = 0;
		var randAnim = '';
		var running = false;
		var paused = false;
	
		settings = jQuery.extend({
			effect:'random',
			slices:15,
			animSpeed:500,
			pauseTime:3000,
			directionNav:true,
			directionNavHide:true,
			controlNav:true,
			pauseOnHover:true,
			beforeChange: function(){},
			afterChange: function(){}
		}, options);


		return this.each(function() {
			//Get this slider
			var slider = $(this);
			slider.css('position','relative');
			slider.width('1px');
			slider.height('1px');
			slider.addClass('nivoSlider');
			
			//Find our slider children
			var kids = slider.children();
			kids.each(function() {
				var child = $(this);
				if(!child.is('img')){
					if(child.is('a')){
						child.addClass('nivo-imageLink');
					}
					child = child.find('img:first');
				}
				//Don't ask
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
				child.css('display','none');
				totalSlides++;
			});
			
			//Get initial image
			if($(kids[currentSlide]).is('img')){
				currentImage = $(kids[currentSlide]);
			} else {
				currentImage = $(kids[currentSlide]).find('img:first');
			}
			
			//Show initial link
			if($(kids[currentSlide]).is('a')){
				$(kids[currentSlide]).css('display','block');
			}
			
			//Set first background
			slider.css('background','url('+ currentImage.attr('src') +') no-repeat');
			
			//Add initial slices
			for(var i = 0; i < settings.slices; i++){
				var sliceWidth = Math.round(slider.width()/settings.slices);
				if(i == settings.slices-1){
					slider.append(
						$('<div class="nivo-slice"></div>').css({ left:(sliceWidth*i)+'px', width:(slider.width()-(sliceWidth*i))+'px' })
					);
				} else {
					slider.append(
						$('<div class="nivo-slice"></div>').css({ left:(sliceWidth*i)+'px', width:sliceWidth+'px' })
					);
				}
			}
			
			//Create caption
			slider.append(
				$('<div class="nivo-caption"><p></p></div>').css('display','none')
			);
			//Process initial  caption
			if(currentImage.attr('title') != ''){
				$('.nivo-caption p', slider).html(currentImage.attr('title'));					
				$('.nivo-caption', slider).fadeIn(settings.animSpeed);
			}
			
			//In the words of Super Mario "let's a go!"
			var timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
			
			//Add Direction nav
			if(settings.directionNav){
				slider.append('<div class="nivo-directionNav"><a class="nivo-prevNav">Prev</a><a class="nivo-nextNav">Next</a></div>');
				
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
					if(running) return false;
					clearInterval(timer);
					timer = '';
					currentSlide-=2;
					nivoRun(slider, kids, settings, 'prev');
				});
				
				$('a.nivo-nextNav', slider).live('click', function(){
					if(running) return false;
					clearInterval(timer);
					timer = '';
					nivoRun(slider, kids, settings, 'next');
				});
			}
			
			//Add Control nav
			if(settings.controlNav){
				var nivoControl = $('<div class="nivo-controlNav"></div>');
				slider.append(nivoControl);
				for(var i = 0; i < kids.length; i++){
					nivoControl.append('<a class="nivo-control" rel="'+ i +'">'+ (i + 1) +'</a>');
				}
				//Set initial active link
				$('.nivo-controlNav a:eq('+ currentSlide +')', slider).addClass('active');
				
				$('.nivo-controlNav a', slider).live('click', function(){
					if(running) return false;
					if($(this).hasClass('active')) return false;
					clearInterval(timer);
					timer = '';
					slider.css('background','url('+ currentImage.attr('src') +') no-repeat');
					currentSlide = $(this).attr('rel') - 1;
					nivoRun(slider, kids, settings, 'control');
				});
			}
			
			//For pauseOnHover setting
			if(settings.pauseOnHover){
				slider.hover(function(){
					paused = true;
					clearInterval(timer);
					timer = '';
				}, function(){
					paused = false;
					//Restart the timer
					if(timer == ''){
						timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
					}
				});
			}
			
			//Event when Animation finishes
			slider.bind('nivo:animFinished', function(){ 
				running = false; 
				//Hide child links
				$(kids).each(function(){
					if($(this).is('a')){
						$(this).css('display','none');
					}
				});
				//Show current link
				if($(kids[currentSlide]).is('a')){
					$(kids[currentSlide]).css('display','block');
				}
				//Restart the timer
				if(timer == '' && !paused){
					timer = setInterval(function(){ nivoRun(slider, kids, settings, false); }, settings.pauseTime);
				}
				//Trigger the afterChange callback
				settings.afterChange.call(this);
			});
		});
		
		function nivoRun(slider, kids, settings, nudge){
			//Trigger the beforeChange callback
			settings.beforeChange.call(this);
					
			//Set current background before change
			if(!nudge){
				slider.css('background','url('+ currentImage.attr('src') +') no-repeat');
			} else {
				if(nudge == 'prev'){
					slider.css('background','url('+ currentImage.attr('src') +') no-repeat');
				}
				if(nudge == 'next'){
					slider.css('background','url('+ currentImage.attr('src') +') no-repeat');
				}
			}
			currentSlide++;
			if(currentSlide == totalSlides) currentSlide = 0;
			if(currentSlide < 0) currentSlide = (totalSlides - 1);
			//Set currentImage
			if($(kids[currentSlide]).is('img')){
				currentImage = $(kids[currentSlide]);
			} else {
				currentImage = $(kids[currentSlide]).find('img:first');
			}
			
			//Set acitve links
			if(settings.controlNav){
				$('.nivo-controlNav a', slider).removeClass('active');
				$('.nivo-controlNav a:eq('+ currentSlide +')', slider).addClass('active');
			}
			
			//Process caption
			if(currentImage.attr('title') != ''){
				if($('.nivo-caption', slider).css('display') == 'block'){
					$('.nivo-caption p', slider).fadeOut(settings.animSpeed, function(){
						$(this).html(currentImage.attr('title'));
						$(this).fadeIn(settings.animSpeed);
					});
				} else {
					$('.nivo-caption p', slider).html(currentImage.attr('title'));
				}					
				$('.nivo-caption', slider).fadeIn(settings.animSpeed);
			} else {
				$('.nivo-caption', slider).fadeOut(settings.animSpeed);
			}
			
			//Set new slice backgrounds
			var  i = 0;
			$('.nivo-slice', slider).each(function(){
				var sliceWidth = Math.round(slider.width()/settings.slices);
				$(this).css({ height:'0px', opacity:'0', 
					background: 'url('+ currentImage.attr('src') +') no-repeat -'+ ((sliceWidth + (i * sliceWidth)) - sliceWidth) +'px 0%' });
				i++;
			});
			
			if(settings.effect == 'random'){
				var anims = new Array("sliceDownRight","sliceDownLeft","sliceUpRight","sliceUpLeft","sliceUpDown","sliceUpDownLeft","fold","fade");
				randAnim = anims[Math.floor(Math.random()*(anims.length + 1))];
				if(randAnim == undefined) randAnim = 'fade';
			}
		
			//Run effects
			running = true;
			if(settings.effect == 'sliceDown' || settings.effect == 'sliceDownRight' || randAnim == 'sliceDownRight' ||
				settings.effect == 'sliceDownLeft' || randAnim == 'sliceDownLeft'){
				var timeBuff = 0;
				var i = 0;
				var slices = $('.nivo-slice', slider);
				if(settings.effect == 'sliceDownLeft' || randAnim == 'sliceDownLeft') slices = $('.nivo-slice', slider).reverse();
				slices.each(function(){
					var slice = $(this);
					slice.css('top','0px');
					if(i == settings.slices-1){
						setTimeout(function(){
							slice.animate({ height:'100%', opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
						}, (100 + timeBuff));
					} else {
						setTimeout(function(){
							slice.animate({ height:'100%', opacity:'1.0' }, settings.animSpeed);
						}, (100 + timeBuff));
					}
					timeBuff += 50;
					i++;
				});
			} 
			else if(settings.effect == 'sliceUp' || settings.effect == 'sliceUpRight' || randAnim == 'sliceUpRight' ||
					settings.effect == 'sliceUpLeft' || randAnim == 'sliceUpLeft'){
				var timeBuff = 0;
				var i = 0;
				var slices = $('.nivo-slice', slider);
				if(settings.effect == 'sliceUpLeft' || randAnim == 'sliceUpLeft') slices = $('.nivo-slice', slider).reverse();
				slices.each(function(){
					var slice = $(this);
					slice.css('bottom','0px');
					if(i == settings.slices-1){
						setTimeout(function(){
							slice.animate({ height:'100%', opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
						}, (100 + timeBuff));
					} else {
						setTimeout(function(){
							slice.animate({ height:'100%', opacity:'1.0' }, settings.animSpeed);
						}, (100 + timeBuff));
					}
					timeBuff += 50;
					i++;
				});
			} 
			else if(settings.effect == 'sliceUpDown' || settings.effect == 'sliceUpDownRight' || randAnim == 'sliceUpDown' || 
					settings.effect == 'sliceUpDownLeft' || randAnim == 'sliceUpDownLeft'){
				var timeBuff = 0;
				var i = 0;
				var v = 0;
				var slices = $('.nivo-slice', slider);
				if(settings.effect == 'sliceUpDownLeft' || randAnim == 'sliceUpDownLeft') slices = $('.nivo-slice', slider).reverse();
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
							slice.animate({ height:'100%', opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
						}, (100 + timeBuff));
					} else {
						setTimeout(function(){
							slice.animate({ height:'100%', opacity:'1.0' }, settings.animSpeed);
						}, (100 + timeBuff));
					}
					timeBuff += 50;
					v++;
				});
			} 
			else if(settings.effect == 'fold' || randAnim == 'fold'){
				var timeBuff = 0;
				var i = 0;
				$('.nivo-slice', slider).each(function(){
					var slice = $(this);
					var origWidth = slice.width();
					slice.css({ top:'0px', height:'100%', width:'0px' });
					if(i == settings.slices-1){
						setTimeout(function(){
							slice.animate({ width:origWidth, opacity:'1.0' }, settings.animSpeed, '', function(){ slider.trigger('nivo:animFinished'); });
						}, (100 + timeBuff));
					} else {
						setTimeout(function(){
							slice.animate({ width:origWidth, opacity:'1.0' }, settings.animSpeed);
						}, (100 + timeBuff));
					}
					timeBuff += 50;
					i++;
				});
			}  
			else if(settings.effect == 'fade' || randAnim == 'fade'){
				var i = 0;
				$('.nivo-slice', slider).each(function(){
					$(this).css('height','100%');
					if(i == settings.slices-1){
						$(this).animate({ opacity:'1.0' }, (settings.animSpeed*2), '', function(){ slider.trigger('nivo:animFinished'); });
					} else {
						$(this).animate({ opacity:'1.0' }, (settings.animSpeed*2));
					}
					i++;
				});
			}
		}
	};
	
	$.fn.reverse = [].reverse;
	
})(jQuery);
