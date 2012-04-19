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
(function(a){var b=function(b,c){var d=a.extend({},a.fn.nivoSlider.defaults,c);var e={currentSlide:0,currentImage:"",totalSlides:0,running:false,paused:false,stop:false};var f=a(b);f.data("nivo:vars",e);f.css("position","relative");f.addClass("nivoSlider");var g=f.children();g.each(function(){var b=a(this);var c="";if(!b.is("img")){if(b.is("a")){b.addClass("nivo-imageLink");c=b}b=b.find("img:first")}var d=b.width();if(d==0)d=b.attr("width");var g=b.height();if(g==0)g=b.attr("height");if(d>f.width()){f.width(d)}if(g>f.height()){f.height(g)}if(c!=""){c.css("display","none")}b.css("display","none");e.totalSlides++});if(d.randomStart){d.startSlide=Math.floor(Math.random()*e.totalSlides)}if(d.startSlide>0){if(d.startSlide>=e.totalSlides)d.startSlide=e.totalSlides-1;e.currentSlide=d.startSlide}if(a(g[e.currentSlide]).is("img")){e.currentImage=a(g[e.currentSlide])}else{e.currentImage=a(g[e.currentSlide]).find("img:first")}if(a(g[e.currentSlide]).is("a")){a(g[e.currentSlide]).css("display","block")}f.css("background",'url("'+e.currentImage.attr("src")+'") no-repeat');f.append(a('<div class="nivo-caption"><p></p></div>').css({display:"none",opacity:d.captionOpacity}));a("div.nivo-caption",f).css("opacity",0);var h=function(b){var c=a("div.nivo-caption",f);if(e.currentImage.attr("title")!=""&&e.currentImage.attr("title")!=undefined){var d=e.currentImage.attr("title");if(d.substr(0,1)=="#")d=a(d).html();if(c.css("opacity")!=0){c.find("p").stop().fadeTo(b.animSpeed,0,function(){a(this).html(d);a(this).stop().fadeTo(b.animSpeed,1)})}else{c.find("p").html(d)}c.stop().fadeTo(b.animSpeed,b.captionOpacity)}else{c.stop().fadeTo(b.animSpeed,0)}};h(d);var i=0;if(!d.manualAdvance&&g.length>1){i=setInterval(function(){q(f,g,d,false)},d.pauseTime)}if(d.directionNav){f.append('<div class="nivo-directionNav"><a class="nivo-prevNav">'+d.prevText+'</a><a class="nivo-nextNav">'+d.nextText+"</a></div>");if(d.directionNavHide){a("div.nivo-directionNav",f).hide();f.hover(function(){a("div.nivo-directionNav",f).show()},function(){a("div.nivo-directionNav",f).hide()})}a("a.nivo-prevNav",f).live("click",function(){if(e.running)return false;clearInterval(i);i="";e.currentSlide-=2;q(f,g,d,"prev")});a("a.nivo-nextNav",f).live("click",function(){if(e.running)return false;clearInterval(i);i="";q(f,g,d,"next")})}if(d.controlNav){var j=a('<div class="nivo-controlNav"></div>');f.append(j);for(var k=0;k<g.length;k++){if(d.controlNavThumbs){var l=g.eq(k);if(!l.is("img")){l=l.find("img:first")}if(d.controlNavThumbsFromRel){j.append('<a class="nivo-control" rel="'+k+'"><img src="'+l.attr("rel")+'" alt="" /></a>')}else{j.append('<a class="nivo-control" rel="'+k+'"><img src="'+l.attr("src").replace(d.controlNavThumbsSearch,d.controlNavThumbsReplace)+'" alt="" /></a>')}}else{j.append('<a class="nivo-control" rel="'+k+'">'+(k+1)+"</a>")}}a("div.nivo-controlNav a:eq("+e.currentSlide+")",f).addClass("active");a("div.nivo-controlNav a",f).live("click",function(){if(e.running)return false;if(a(this).hasClass("active"))return false;clearInterval(i);i="";f.css("background",'url("'+e.currentImage.attr("src")+'") no-repeat');e.currentSlide=a(this).attr("rel")-1;q(f,g,d,"control")})}if(d.keyboardNav){a(window).keypress(function(a){if(a.keyCode=="37"){if(e.running)return false;clearInterval(i);i="";e.currentSlide-=2;q(f,g,d,"prev")}if(a.keyCode=="39"){if(e.running)return false;clearInterval(i);i="";q(f,g,d,"next")}})}if(d.pauseOnHover){f.hover(function(){e.paused=true;clearInterval(i);i=""},function(){e.paused=false;if(i==""&&!d.manualAdvance){i=setInterval(function(){q(f,g,d,false)},d.pauseTime)}})}f.bind("nivo:animFinished",function(){e.running=false;a(g).each(function(){if(a(this).is("a")){a(this).css("display","none")}});if(a(g[e.currentSlide]).is("a")){a(g[e.currentSlide]).css("display","block")}if(i==""&&!e.paused&&!d.manualAdvance){i=setInterval(function(){q(f,g,d,false)},d.pauseTime)}d.afterChange.call(this)});var m=function(b,c,d){var e="",f="",g=0,h=0;for(h=0;h<c.slices;h++){g=Math.round(b.width()/c.slices);e=b.width()-g*h+"px";f=g*h+"px";if(h==c.slices-1){b.append(a('<div class="nivo-slice"></div>').data({initialwidth:e,initialleft:f}).css({left:f,width:e,height:"0px",opacity:"0",background:'#fff url("'+d.currentImage.attr("src")+'") no-repeat -'+(g+h*g-g)+"px 0%"}))}else{b.append(a('<div class="nivo-slice"></div>').data({initialwidth:g+"px",initialleft:f}).css({left:f,width:g+"px",height:"0px",opacity:"0",display:"none",background:'#fff url("'+d.currentImage.attr("src")+'") no-repeat -'+(g+h*g-g)+"px 0%"}))}}};m(f,d,f.data("nivo:vars"));var n=function(b,c){b.each(function(){a(this).css({opacity:0,top:"auto",bottom:"auto",right:"auto",left:a(this).data("initialleft"),width:a(this).data("initialwidth"),height:0,backgroundImage:"url("+c.attr("src")+")"})})};var o=function(b,c,d){var e=Math.round(b.width()/c.boxCols),f,g=Math.round(b.height()/c.boxRows);for(var h=0;h<c.boxRows;h++){for(var i=0;i<c.boxCols;i++){if(i==c.boxCols-1){f=b.width()-e*i+"px";b.append(a('<div class="nivo-box"></div>').data({initialwidth:f,initialheight:g+"px"}).css({opacity:0,left:e*i+"px",top:g*h+"px",width:b.width()-e*i+"px",height:g+"px",background:'#fff url("'+d.currentImage.attr("src")+'") no-repeat -'+(e+i*e-e)+"px -"+(g+h*g-g)+"px"}))}else{b.append(a('<div class="nivo-box"></div>').data({initialwidth:e+"px",initialheight:g+"px"}).css({opacity:0,left:e*i+"px",top:g*h+"px",width:e+"px",height:g+"px",background:'#fff url("'+d.currentImage.attr("src")+'") no-repeat -'+(e+i*e-e)+"px -"+(g+h*g-g)+"px"}))}}}};o(f,d,f.data("nivo:vars"));var p=function(b,c){b.each(function(){a(this).css({opacity:0,height:a(this).data("initialheight"),width:a(this).data("initialwidth"),backgroundImage:"url("+c.attr("src")+")"})})};var q=function(b,c,d,e){var f=b.data("nivo:vars"),g=a("div.nivo-slice",b),i=a("div.nivo-box",b);if(f&&f.currentSlide==f.totalSlides-1){d.lastSlide.call(this)}if((!f||f.stop)&&!e)return false;d.beforeChange.call(this);b.css("background",'url("'+f.currentImage.attr("src")+'") no-repeat');f.currentSlide++;if(f.currentSlide==f.totalSlides){f.currentSlide=0;d.slideshowEnd.call(this)}if(f.currentSlide<0)f.currentSlide=f.totalSlides-1;if(a(c[f.currentSlide]).is("img")){f.currentImage=a(c[f.currentSlide])}else{f.currentImage=a(c[f.currentSlide]).find("img:first")}if(d.controlNav){a("div.nivo-controlNav a",b).removeClass("active");a("div.nivo-controlNav a:eq("+f.currentSlide+")",b).addClass("active")}h(d);g.hide();i.hide();var j=d.effect;if(d.effect=="random"){var k=new Array("sliceDownRight","sliceDownLeft","sliceUpRight","sliceUpLeft","sliceUpDown","sliceUpDownLeft","fold","fade","boxRandom","boxRain","boxRainReverse","boxRainGrow","boxRainGrowReverse");j=k[Math.floor(Math.random()*(k.length+1))]}if(d.effect.indexOf(",")!=-1){var k=d.effect.split(",");j=k[Math.floor(Math.random()*k.length)]}if(f.currentImage.attr("data-transition")){j=f.currentImage.attr("data-transition")}if(j==undefined)j="fade";f.running=true;if(j=="sliceDown"||j=="sliceDownRight"||j=="sliceDownLeft"){n(g,f.currentImage);var l=0;var m=0;var o=g;if(j=="sliceDownLeft")o=g._reverse();o.each(function(){var c=a(this);c.css({top:"0px"});if(m==d.slices-1){setTimeout(function(){c.show().animate({height:"100%",opacity:"1.0"},d.animSpeed,"",function(){b.trigger("nivo:animFinished")})},100+l)}else{setTimeout(function(){c.show().animate({height:"100%",opacity:"1.0"},d.animSpeed)},100+l)}l+=50;m++})}else if(j=="sliceUp"||j=="sliceUpRight"||j=="sliceUpLeft"){n(g,f.currentImage);var l=0;var m=0;var o=g;if(j=="sliceUpLeft")o=g._reverse();o.each(function(){var c=a(this);c.css({bottom:"0px"});if(m==d.slices-1){setTimeout(function(){c.show().animate({height:"100%",opacity:"1.0"},d.animSpeed,"",function(){b.trigger("nivo:animFinished")})},100+l)}else{setTimeout(function(){c.show().animate({height:"100%",opacity:"1.0"},d.animSpeed)},100+l)}l+=50;m++})}else if(j=="sliceUpDown"||j=="sliceUpDownRight"||j=="sliceUpDownLeft"){n(g,f.currentImage);var l=0;var m=0;var q=0;var o=g;if(j=="sliceUpDownLeft")o=g._reverse();o.each(function(){var c=a(this);if(m==0){c.css("top","0px");m++}else{c.css("bottom","0px");m=0}if(q==d.slices-1){setTimeout(function(){c.show().animate({height:"100%",opacity:"1.0"},d.animSpeed,"",function(){b.trigger("nivo:animFinished")})},100+l)}else{setTimeout(function(){c.show().animate({height:"100%",opacity:"1.0"},d.animSpeed)},100+l)}l+=50;q++})}else if(j=="fold"){var l=0,m=0;n(g,f.currentImage);g.each(function(){var c=a(this),e=this.style.width;c.css({top:"0px",height:"100%",width:"0px"});if(m==d.slices-1){setTimeout(function(){c.show().animate({width:e,opacity:"1.0"},d.animSpeed,"",function(){b.trigger("nivo:animFinished")})},100+l)}else{setTimeout(function(){c.show().animate({width:e,opacity:"1.0"},d.animSpeed)},100+l)}l+=50;m++})}else if(j=="fade"){n(g,f.currentImage);var s=a(g[0]);s.css({height:"100%",width:b.width()+"px"});s.show().animate({opacity:"1.0"},d.animSpeed*2,"",function(){b.trigger("nivo:animFinished")})}else if(j=="slideInRight"){n(g,f.currentImage);var s=a(g[0]);s.css({height:"100%",width:"0px",opacity:"1"});s.show().animate({width:b.width()+"px"},d.animSpeed*2,"",function(){b.trigger("nivo:animFinished")})}else if(j=="slideInLeft"){n(g,f.currentImage);var s=a(g[0]);s.css({height:"100%",width:"0px",opacity:"1",left:"",right:"0px"});s.show().animate({width:b.width()+"px"},d.animSpeed*2,"",function(){s.css({left:"0px",right:""});b.trigger("nivo:animFinished")})}else if(j=="boxRandom"){p(i,f.currentImage);var t=d.boxCols*d.boxRows;var m=0;var l=0;var u=r(i);u.each(function(){var c=a(this);if(m==t-1){setTimeout(function(){c.show().animate({opacity:"1"},d.animSpeed,"",function(){b.trigger("nivo:animFinished")})},100+l)}else{setTimeout(function(){c.show().animate({opacity:"1"},d.animSpeed)},100+l)}l+=20;m++})}else if(j=="boxRain"||j=="boxRainReverse"||j=="boxRainGrow"||j=="boxRainGrowReverse"){var t=d.boxCols*d.boxRows;m=0,l=0,rowIndex=0,colIndex=0,box2Darr=new Array,box2Darr[rowIndex]=new Array,u=i,cols=0,rows=0,maxCols=d.boxCols*2,prevCol=0;p(i,f.currentImage);if(j==="boxRainReverse"||j==="boxRainGrowReverse"){u=i._reverse()}u.each(function(){box2Darr[rowIndex][colIndex]=a(this);colIndex++;if(colIndex==d.boxCols){rowIndex++;colIndex=0;box2Darr[rowIndex]=new Array}});for(cols=0;cols<maxCols;cols++){prevCol=cols;for(rows=0;rows<d.boxRows;rows++){if(prevCol>=0&&prevCol<d.boxCols){(function(c,e,f,g,h){var i=a(box2Darr[c][e]),k=i[0].style.width,l=i[0].style.height;if(j=="boxRainGrow"||j=="boxRainGrowReverse"){i.css({width:0,height:0})}if(g==h-1){setTimeout(function(){i.show().animate({opacity:"1",width:k,height:l},d.animSpeed/1.3,"",function(){b.trigger("nivo:animFinished")})},100+f)}else{setTimeout(function(){i.show().animate({opacity:"1",width:k,height:l},d.animSpeed/1.3)},100+f)}})(rows,prevCol,l,m,t);m++}prevCol--}l+=100}}};var r=function(a){for(var b,c,d=a.length;d;b=parseInt(Math.random()*d),c=a[--d],a[d]=a[b],a[b]=c);return a};var s=function(a){if(this.console&&typeof console.log!="undefined")console.log(a)};this.stop=function(){if(!a(b).data("nivo:vars").stop){a(b).data("nivo:vars").stop=true;s("Stop Slider")}};this.start=function(){if(a(b).data("nivo:vars").stop){a(b).data("nivo:vars").stop=false;s("Start Slider")}};d.afterLoad.call(this);return this};a.fn.nivoSlider=function(c){return this.each(function(d,e){var f=a(this);if(f.data("nivoslider"))return f.data("nivoslider");var g=new b(this,c);f.data("nivoslider",g)})};a.fn.nivoSlider.defaults={effect:"random",slices:15,boxCols:8,boxRows:4,animSpeed:500,pauseTime:3e3,startSlide:0,directionNav:true,directionNavHide:true,controlNav:true,controlNavThumbs:false,controlNavThumbsFromRel:false,controlNavThumbsSearch:".jpg",controlNavThumbsReplace:"_thumb.jpg",keyboardNav:true,pauseOnHover:true,manualAdvance:false,captionOpacity:.8,prevText:"Prev",nextText:"Next",randomStart:false,beforeChange:function(){},afterChange:function(){},slideshowEnd:function(){},lastSlide:function(){},afterLoad:function(){}};a.fn._reverse=[].reverse})(jQuery)