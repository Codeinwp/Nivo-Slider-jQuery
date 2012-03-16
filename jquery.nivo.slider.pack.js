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
(function(a){var b={},c={};var d=function(d,e){var f=a.extend({},a.fn.nivoSlider.defaults,e);var g={currentSlide:0,currentImage:"",totalSlides:0,running:false,paused:false,stop:false};var h=a(d);h.data("nivo:vars",g);h.css("position","relative");h.addClass("nivoSlider");var i=h.children();i.each(function(){var b=a(this);var c="";if(!b.is("img")){if(b.is("a")){b.addClass("nivo-imageLink");c=b}b=b.find("img:first")}var d=b.width();if(d==0)d=b.attr("width");var e=b.height();if(e==0)e=b.attr("height");if(d>h.width()){h.width(d)}if(e>h.height()){h.height(e)}if(c!=""){c.css("display","none")}b.css("display","none");g.totalSlides++});if(f.randomStart){f.startSlide=Math.floor(Math.random()*g.totalSlides)}if(f.startSlide>0){if(f.startSlide>=g.totalSlides)f.startSlide=g.totalSlides-1;g.currentSlide=f.startSlide}if(a(i[g.currentSlide]).is("img")){g.currentImage=a(i[g.currentSlide])}else{g.currentImage=a(i[g.currentSlide]).find("img:first")}if(a(i[g.currentSlide]).is("a")){a(i[g.currentSlide]).css("display","block")}h.css("background",'url("'+g.currentImage.attr("src")+'") no-repeat');h.append(a('<div class="nivo-caption"><p></p></div>').css({display:"none",opacity:f.captionOpacity}));a("div.nivo-caption",h).css("opacity",0);var j=function(b){var c=a("div.nivo-caption",h);if(g.currentImage.attr("title")!=""&&g.currentImage.attr("title")!=undefined){var d=g.currentImage.attr("title");if(d.substr(0,1)=="#")d=a(d).html();if(c.css("opacity")!=0){c.find("p").stop().fadeTo(b.animSpeed,0,function(){a(this).html(d);a(this).stop().fadeTo(b.animSpeed,1)})}else{c.find("p").html(d)}c.stop().fadeTo(b.animSpeed,b.captionOpacity)}else{c.stop().fadeTo(b.animSpeed,0)}};j(f);var k=0;if(!f.manualAdvance&&i.length>1){k=setInterval(function(){s(h,i,f,false)},f.pauseTime)}if(f.directionNav){h.append('<div class="nivo-directionNav"><a class="nivo-prevNav">'+f.prevText+'</a><a class="nivo-nextNav">'+f.nextText+"</a></div>");if(f.directionNavHide){a("div.nivo-directionNav",h).hide();h.hover(function(){a("div.nivo-directionNav",h).show()},function(){a("div.nivo-directionNav",h).hide()})}a("a.nivo-prevNav",h).live("click",function(){if(g.running)return false;clearInterval(k);k="";g.currentSlide-=2;s(h,i,f,"prev")});a("a.nivo-nextNav",h).live("click",function(){if(g.running)return false;clearInterval(k);k="";s(h,i,f,"next")})}if(f.controlNav){var l=a('<div class="nivo-controlNav"></div>');h.append(l);for(var m=0;m<i.length;m++){if(f.controlNavThumbs){var n=i.eq(m);if(!n.is("img")){n=n.find("img:first")}if(f.controlNavThumbsFromRel){l.append('<a class="nivo-control" rel="'+m+'"><img src="'+n.attr("rel")+'" alt="" /></a>')}else{l.append('<a class="nivo-control" rel="'+m+'"><img src="'+n.attr("src").replace(f.controlNavThumbsSearch,f.controlNavThumbsReplace)+'" alt="" /></a>')}}else{l.append('<a class="nivo-control" rel="'+m+'">'+(m+1)+"</a>")}}a("div.nivo-controlNav a:eq("+g.currentSlide+")",h).addClass("active");a("div.nivo-controlNav a",h).live("click",function(){if(g.running)return false;if(a(this).hasClass("active"))return false;clearInterval(k);k="";h.css("background",'url("'+g.currentImage.attr("src")+'") no-repeat');g.currentSlide=a(this).attr("rel")-1;s(h,i,f,"control")})}if(f.keyboardNav){a(window).keypress(function(a){if(a.keyCode=="37"){if(g.running)return false;clearInterval(k);k="";g.currentSlide-=2;s(h,i,f,"prev")}if(a.keyCode=="39"){if(g.running)return false;clearInterval(k);k="";s(h,i,f,"next")}})}if(f.pauseOnHover){h.hover(function(){g.paused=true;clearInterval(k);k=""},function(){g.paused=false;if(k==""&&!f.manualAdvance){k=setInterval(function(){s(h,i,f,false)},f.pauseTime)}})}h.bind("nivo:animFinished",function(){g.running=false;a(i).each(function(){if(a(this).is("a")){a(this).css("display","none")}});if(a(i[g.currentSlide]).is("a")){a(i[g.currentSlide]).css("display","block")}if(k==""&&!g.paused&&!f.manualAdvance){k=setInterval(function(){s(h,i,f,false)},f.pauseTime)}f.afterChange.call(this)});var o=function(b,d,e){var f="",g="",h=0,i=0;for(i=0;i<d.slices;i++){h=Math.round(b.width()/d.slices);f=b.width()-h*i+"px";g=h*i+"px";if(i==d.slices-1){b.append(a('<div class="nivo-slice"></div>').data({"initial-width":f,"initial-left":g}).css({left:g,width:f,height:"0px",opacity:"0",background:'url("'+e.currentImage.attr("src")+'") no-repeat -'+(h+i*h-h)+"px 0%"}))}else{b.append(a('<div class="nivo-slice"></div>').data({"initial-width":h+"px","initial-left":g}).css({left:g,width:h+"px",height:"0px",opacity:"0",display:"none",background:'url("'+e.currentImage.attr("src")+'") no-repeat -'+(h+i*h-h)+"px 0%"}))}}c=a("div.nivo-slice")};o(h,f,h.data("nivo:vars"));var p=function(b){c.each(function(){a(this).css({opacity:0,top:"auto",bottom:"auto",right:"auto",left:a(this).data("initial-left"),width:a(this).data("initial-width"),height:0,backgroundImage:"url("+b.attr("src")+")"})})};var q=function(c,d,e){var f=Math.round(c.width()/d.boxCols),g,h=Math.round(c.height()/d.boxRows);for(var i=0;i<d.boxRows;i++){for(var j=0;j<d.boxCols;j++){if(j==d.boxCols-1){g=c.width()-f*j+"px";c.append(a('<div class="nivo-box"></div>').data({"initial-width":g,"initial-height":h+"px"}).css({opacity:0,left:f*j+"px",top:h*i+"px",width:c.width()-f*j+"px",height:h+"px",background:'url("'+e.currentImage.attr("src")+'") no-repeat -'+(f+j*f-f)+"px -"+(h+i*h-h)+"px"}))}else{c.append(a('<div class="nivo-box"></div>').data({"initial-width":f+"px","initial-height":h+"px"}).css({opacity:0,left:f*j+"px",top:h*i+"px",width:f+"px",height:h+"px",background:'url("'+e.currentImage.attr("src")+'") no-repeat -'+(f+j*f-f)+"px -"+(h+i*h-h)+"px"}))}}}b=a("div.nivo-box")};q(h,f,h.data("nivo:vars"));var r=function(c){b.each(function(){a(this).css({opacity:0,height:a(this).data("initial-height"),width:a(this).data("initial-width"),backgroundImage:"url("+c.attr("src")+")"})})};var s=function(d,e,f,g){var h=d.data("nivo:vars");if(h&&h.currentSlide==h.totalSlides-1){f.lastSlide.call(this)}if((!h||h.stop)&&!g)return false;f.beforeChange.call(this);d.css("background",'url("'+h.currentImage.attr("src")+'") no-repeat');h.currentSlide++;if(h.currentSlide==h.totalSlides){h.currentSlide=0;f.slideshowEnd.call(this)}if(h.currentSlide<0)h.currentSlide=h.totalSlides-1;if(a(e[h.currentSlide]).is("img")){h.currentImage=a(e[h.currentSlide])}else{h.currentImage=a(e[h.currentSlide]).find("img:first")}if(f.controlNav){a("div.nivo-controlNav a",d).removeClass("active");a("div.nivo-controlNav a:eq("+h.currentSlide+")",d).addClass("active")}j(f);c.hide();b.hide();var i=f.effect;if(f.effect=="random"){var k=new Array("sliceDownRight","sliceDownLeft","sliceUpRight","sliceUpLeft","sliceUpDown","sliceUpDownLeft","fold","fade","boxRandom","boxRain","boxRainReverse","boxRainGrow","boxRainGrowReverse");i=k[Math.floor(Math.random()*(k.length+1))]}if(f.effect.indexOf(",")!=-1){var k=f.effect.split(",");i=k[Math.floor(Math.random()*k.length)]}if(h.currentImage.attr("data-transition")){i=h.currentImage.attr("data-transition")}if(i==undefined)i="fade";h.running=true;if(i=="sliceDown"||i=="sliceDownRight"||i=="sliceDownLeft"){p(h.currentImage);var l=0;var m=0;var n=c;if(i=="sliceDownLeft")n=c._reverse();n.each(function(){var b=a(this);b.css({top:"0px"});if(m==f.slices-1){setTimeout(function(){b.show().animate({height:"100%",opacity:"1.0"},f.animSpeed,"",function(){d.trigger("nivo:animFinished")})},100+l)}else{setTimeout(function(){b.show().animate({height:"100%",opacity:"1.0"},f.animSpeed)},100+l)}l+=50;m++})}else if(i=="sliceUp"||i=="sliceUpRight"||i=="sliceUpLeft"){p(h.currentImage);var l=0;var m=0;var n=c;if(i=="sliceUpLeft")n=c._reverse();n.each(function(){var b=a(this);b.css({bottom:"0px"});if(m==f.slices-1){setTimeout(function(){b.show().animate({height:"100%",opacity:"1.0"},f.animSpeed,"",function(){d.trigger("nivo:animFinished")})},100+l)}else{setTimeout(function(){b.show().animate({height:"100%",opacity:"1.0"},f.animSpeed)},100+l)}l+=50;m++})}else if(i=="sliceUpDown"||i=="sliceUpDownRight"||i=="sliceUpDownLeft"){p(h.currentImage);var l=0;var m=0;var o=0;var n=c;if(i=="sliceUpDownLeft")n=c._reverse();n.each(function(){var b=a(this);if(m==0){b.css("top","0px");m++}else{b.css("bottom","0px");m=0}if(o==f.slices-1){setTimeout(function(){b.show().animate({height:"100%",opacity:"1.0"},f.animSpeed,"",function(){d.trigger("nivo:animFinished")})},100+l)}else{setTimeout(function(){b.show().animate({height:"100%",opacity:"1.0"},f.animSpeed)},100+l)}l+=50;o++})}else if(i=="fold"){var l=0,m=0;p(h.currentImage);c.each(function(){var b=a(this),c=this.style.width;b.css({top:"0px",height:"100%",width:"0px"});if(m==f.slices-1){setTimeout(function(){b.show().animate({width:c,opacity:"1.0"},f.animSpeed,"",function(){d.trigger("nivo:animFinished")})},100+l)}else{setTimeout(function(){b.show().animate({width:c,opacity:"1.0"},f.animSpeed)},100+l)}l+=50;m++})}else if(i=="fade"){p(h.currentImage);var q=a("div.nivo-slice:first");q.css({height:"100%",width:d.width()+"px"});q.show().animate({opacity:"1.0"},f.animSpeed*2,"",function(){d.trigger("nivo:animFinished")})}else if(i=="slideInRight"){p(h.currentImage);var q=a("div.nivo-slice:first");q.css({height:"100%",width:"0px",opacity:"1"});q.show().animate({width:d.width()+"px"},f.animSpeed*2,"",function(){d.trigger("nivo:animFinished")})}else if(i=="slideInLeft"){p(h.currentImage);var q=a("div.nivo-slice:first");q.css({height:"100%",width:"0px",opacity:"1",left:"",right:"0px"});q.show().animate({width:d.width()+"px"},f.animSpeed*2,"",function(){q.css({left:"0px",right:""});d.trigger("nivo:animFinished")})}else if(i=="boxRandom"){r(h.currentImage);var s=f.boxCols*f.boxRows;var m=0;var l=0;var u=t(b);u.each(function(){var b=a(this);if(m==s-1){setTimeout(function(){b.show().animate({opacity:"1"},f.animSpeed,"",function(){d.trigger("nivo:animFinished")})},100+l)}else{setTimeout(function(){b.show().animate({opacity:"1"},f.animSpeed)},100+l)}l+=20;m++})}else if(i=="boxRain"||i=="boxRainReverse"||i=="boxRainGrow"||i=="boxRainGrowReverse"){var s=f.boxCols*f.boxRows;m=0,l=0,rowIndex=0,colIndex=0,box2Darr=new Array,box2Darr[rowIndex]=new Array,u=b,cols=0,rows=0,maxCols=f.boxCols*2,prevCol=0;r(h.currentImage);if(i==="boxRainReverse"||i==="boxRainGrowReverse"){u=b._reverse()}u.each(function(){box2Darr[rowIndex][colIndex]=a(this);colIndex++;if(colIndex==f.boxCols){rowIndex++;colIndex=0;box2Darr[rowIndex]=new Array}});for(cols=0;cols<maxCols;cols++){prevCol=cols;for(rows=0;rows<f.boxRows;rows++){if(prevCol>=0&&prevCol<f.boxCols){(function(b,c,e,g,h){var j=a(box2Darr[b][c]),k=j[0].style.width,l=j[0].style.height;if(i=="boxRainGrow"||i=="boxRainGrowReverse"){j.css({width:0,height:0})}if(g==h-1){setTimeout(function(){j.show().animate({opacity:"1",width:k,height:l},f.animSpeed/1.3,"",function(){d.trigger("nivo:animFinished")})},100+e)}else{setTimeout(function(){j.show().animate({opacity:"1",width:k,height:l},f.animSpeed/1.3)},100+e)}})(rows,prevCol,l,m,s);m++}prevCol--}l+=100}}};var t=function(a){for(var b,c,d=a.length;d;b=parseInt(Math.random()*d),c=a[--d],a[d]=a[b],a[b]=c);return a};var u=function(a){if(this.console&&typeof console.log!="undefined")console.log(a)};this.stop=function(){if(!a(d).data("nivo:vars").stop){a(d).data("nivo:vars").stop=true;u("Stop Slider")}};this.start=function(){if(a(d).data("nivo:vars").stop){a(d).data("nivo:vars").stop=false;u("Start Slider")}};f.afterLoad.call(this);return this};a.fn.nivoSlider=function(b){return this.each(function(c,e){var f=a(this);if(f.data("nivoslider"))return f.data("nivoslider");var g=new d(this,b);f.data("nivoslider",g)})};a.fn.nivoSlider.defaults={effect:"random",slices:15,boxCols:8,boxRows:4,animSpeed:500,pauseTime:3e3,startSlide:0,directionNav:true,directionNavHide:true,controlNav:true,controlNavThumbs:false,controlNavThumbsFromRel:false,controlNavThumbsSearch:".jpg",controlNavThumbsReplace:"_thumb.jpg",keyboardNav:true,pauseOnHover:true,manualAdvance:false,captionOpacity:.8,prevText:"Prev",nextText:"Next",randomStart:false,beforeChange:function(){},afterChange:function(){},slideshowEnd:function(){},lastSlide:function(){},afterLoad:function(){}};a.fn._reverse=[].reverse})(jQuery)