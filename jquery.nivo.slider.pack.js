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
(function(e){var n=null;function s(){return function(){}}function y(u,q){function v(a){for(var b,e,c=a.length;c;b=parseInt(Math.random()*c),e=a[--c],a[c]=a[b],a[b]=e);return a}function m(d){var h=a.a.data("nivo:vars");if(h&&!h.stop||d){d?(d=="prev"&&a.a.css("background",'url("'+h.b.url+'") no-repeat'),d=="next"&&a.a.css("background",'url("'+h.b.url+'") no-repeat')):a.a.css("background",'url("'+h.b.url+'") no-repeat');++h.d;if(h.d==h.i)h.d=0;else if(h.d<0)h.d=h.i-1;a.c=e(a.h[h.d]);a.c=a.c.is("img")?a.c:a.c.find("img").eq(0);h.b={url:a.c.attr("src"),
title:a.c.attr("title"),z:a.c.data("transition")};b.u&&a.w.removeClass("active").eq(h.d).addClass("active");w();e(".nivo-slice",a.a).remove();e(".nivo-box",a.a).remove();var c=b.n;b.n==="random"&&(d=["sliceDownRight","sliceDownLeft","sliceUpRight","sliceUpLeft","sliceUpDown","sliceUpDownLeft","fold","fade","boxRandom","boxRain","boxRainReverse","boxRainGrow","boxRainGrowReverse"],c=d[Math.floor(Math.random()*(d.length-1))]);b.n.indexOf(",")!==-1&&(d=b.n.split(","),c=d[Math.floor(Math.random()*d.length)]);
if(h.b.z)c=h.b.z;h.j=!0;h=function(d,c,e,h,f){setTimeout(function(){d.animate(c,!e?b.f:e,"",f?function(){a.a.trigger("nivo:animFinished")}:n)},100+h)};switch(c){case "sliceDown":case "sliceDownRight":case "sliceDownLeft":r();var d=0,l=e(".nivo-slice",a.a),j=0;c==="sliceDownLeft"&&(l=l.m());do c=e(l[j]),c.css({top:"0px"}),h(c,{height:"100%",opacity:1},n,d,j===b.e-1?!0:!1),d+=50;while(++j<b.e);break;case "sliceUp":case "sliceUpRight":case "sliceUpLeft":r();d=0;l=e(".nivo-slice",a.a);j=0;c==="sliceUpLeft"&&
(l=l.m());do c=e(l[j]),c.css({bottom:"0px"}),h(c,{height:"100%",opacity:1},n,d,j===b.e-1?!0:!1),d+=50;while(++j<b.e);break;case "sliceUpDown":case "sliceUpDownRight":case "sliceUpDownLeft":r();var k=d=0,l=e(".nivo-slice",a.a),j=0;c==="sliceUpDownLeft"&&(l=l.m());do c=e(l[j]),k?c.css("top","0px"):c.css("bottom","0px"),k=!k,h(c,{height:"100%",opacity:1},n,d,j===b.e-1?!0:!1),d+=50;while(++j<b.e);break;case "fold":r();d=0;l=e(".nivo-slice",a.a);k=j=0;do c=e(l[j]),k=c.width(),c.css({top:"0px",height:"100%",
width:"0px"}),h(c,{width:k+"px",opacity:1},n,d,j===b.e-1?!0:!1),d+=50;while(++j<b.e);break;default:case "fade":r();var f=e(".nivo-slice",a.a).eq(0);f.css({height:"100%",width:a.a.width()+"px"}).animate({opacity:1},b.f*2,"",function(){a.a.trigger("nivo:animFinished")});break;case "slideInRight":r();f=e(".nivo-slice",a.a).eq(0);f.css({height:"100%",width:"0px",opacity:1}).animate({width:a.a.width()+"px"},b.f*2,"",function(){a.a.trigger("nivo:animFinished")});break;case "slideInLeft":r();f=e(".nivo-slice",
a.a).eq(0);f.css({height:"100%",width:"0px",opacity:1,left:"",right:"0px"}).animate({width:a.a.width()+"px"},b.f*2,"",function(){f.css({left:"0px",right:""});a.a.trigger("nivo:animFinished")});break;case "boxRandom":x();var l=b.g*b.k,d=0,g=v(e(".nivo-box",a.a)),i=0;do k=e(g[i]),h(k,{opacity:1},n,d,i===l-1?!0:!1),d+=20;while(++i<l);break;case "boxRain":case "boxRainReverse":case "boxRainGrow":case "boxRainGrowReverse":x();var l=b.g*b.k,d=0,j=[],o=k=0,g=e(".nivo-box",a.a),i=0;if(c=="boxRainReverse"||
c=="boxRainGrowReverse")g=g.m();j[k]=[];do j[k][o]=g[i],++o,o===b.g&&(++k,j[k]=[],o=0);while(++i<l);var m=o=i=g=0,p=0,q=0;do{o=g;do o>=0&&o<b.g&&(k=e(j[i][o]),p=k.width(),q=k.height(),(c=="boxRainGrow"||c=="boxRainGrowReverse")&&k.width(0).height(0),h(k,{width:p,height:q,opacity:1},b.f/1.3,d,++m===l?!0:!1)),--o;while(++i<b.k);i=0;d+=100}while(++g<b.g*2)}}}function x(){var d=a.a.width(),h=Math.round(d/b.g),f=Math.round(a.a.height()/b.k),l=document.createDocumentFragment(),j=0,k=0,g=0,i={background:'url("'+
c.b.url+'") no-repeat',backgroundPosition:"",left:"",top:"",width:"",height:f+"px",opacity:0};do{i.top=f*k+"px";i.width=h+"px";do{j=h*g;i.left=h*g+"px";i.backgroundPosition="-"+(h+j-h)+"px -"+(f+k*f-f)+"px";if(g===b.g-1)i.width=d-j+"px";l.appendChild(e('<div class="nivo-box"></div>').css(i)[0])}while(++g<b.g);g=0}while(++k<b.k);a.a.append(l)}function r(){var d=c.b.url,f=a.a.width(),g=0,i=document.createDocumentFragment(),j,k,m={background:"",left:"",width:"",height:"0px",opacity:0};do{j=Math.round(f/
b.e);k=j*g;m.left=k+"px";m.background='url("'+d+'") no-repeat -'+(j+k-j)+"px 0%";m.width=j+"px";if(g==b.e-1)m.width=f-k+"px";i.appendChild(e('<div class="nivo-slice"></div>').css(m)[0])}while(++g<b.e);a.a.append(i)}function w(){var d=c.b.title?c.b.title:n;d&&(d.substr(0,1)=="#"&&(d=e(d).html()),a.o.css("opacity")!=0?a.s.stop().fadeTo(b.f,0,function(){a.s.html(d).stop().fadeTo(b.f,1)}):a.s.html(d));a.o.stop().fadeTo(b.f,d?b.t:0)}var b=e.extend({},e.fn.nivoSlider.F,q),c={d:0,b:{},i:0,j:!1,paused:!1,stop:!1},
a={};a.a=e(u);a.a.data("nivo:vars",c);a.a.css("position","relative");a.a.addClass("nivoSlider");a.h=a.a.children();for(var f,p=a.h.length,i=0,t=0;--p+1;)f=e(a.h[p]),f.is("img")||(f.is("a")&&f.addClass("nivo-imageLink"),f=f.find("img").eq(0)),i=f.width(),t=f.height(),i===0&&(i=f.attr("width")),t===0&&(t=f.attr("height")),i>a.a.width()&&a.a.width(i),t>a.a.height()&&a.a.height(t),f.css("display","none"),++c.i;if(b.M)b.l=Math.floor(Math.random()*c.i);if(b.l>0){if(b.l>=c.i)b.l=c.i-1;c.d=b.l}a.c=e(a.h[c.d]);
a.c.is("img")?(c.b.url=a.c.attr("src"),c.b.title=a.c.attr("title")):(f=a.c.find("img").eq(0),c.b.url=f.attr("src"),c.b.title=f.attr("title"));a.c.is("a")&&a.c.css("display","block");a.a.css("background",'url("'+c.b.url+'") no-repeat').append(e('<div class="nivo-caption"><p></p></div>').css({display:"none",opacity:b.t}));a.o=e(".nivo-caption",a.a);a.s=a.o.find("p");a.o.css("opacity",0);w();var g=0;if(c.i>1)b.q||(g=setInterval(function(){m(!1)},b.r));else return!1;if(b.G)a.a.append('<div class="nivo-directionNav"><a class="nivo-prevNav" data-dir="prev">'+
b.L+'</a><a class="nivo-nextNav" data-dir="next">'+b.J+"</a></div>"),a.p=e(".nivo-directionNav",a.a),b.H&&(a.p.hide(),a.a.hover(function(){a.p.show()},function(){a.p.hide()})),a.p.children().click(function(){var a=e(this).data("dir"),a=a?a:"next";if(c.j)return!1;clearInterval(g);g=n;a==="prev"&&(c.d-=2);m(a)});if(b.u){f=p="";for(i=a.h.length;--i+1;)b.A?(f=e(a.h[i]),f.is("img")||(f=f.find("img").eq(0)),f=b.B?'<img src="'+f.attr("rel")+'" alt="" />':'<img src="'+f.attr("src").replace(b.D,b.C)+'" alt="" />'):
f=i+1,p='<a class="nivo-control" data-slide="'+i+'">'+f+"</a>"+p;a.a.append('<div class="nivo-controlNav">'+p+"</div>");a.N=e(".nivo-controlNav",a.a);a.w=a.N.find("a");a.w.click(function(){var b=e(this);if(c.j||b.hasClass("active"))return!1;clearInterval(g);g=n;a.a.css("background",'url("'+c.b.url+'") no-repeat');c.d=b.data("slide")-1;m("control")}).eq(c.d).addClass("active")}b.I&&e(document).keydown(function(a){a=a.keyCode?a.keyCode:a.which;if(a===37||a===63234){if(c.j)return!1;clearInterval(g);
g=n;c.d-=2;m("prev")}else if(a===39||a===63235){if(c.j)return!1;clearInterval(g);g=n;m("next")}});b.K&&a.a.hover(function(){c.paused=!0;clearInterval(g);g=n},function(){c.paused=!1;g===n&&!b.q&&(g=setInterval(function(){m(!1)},b.r))});a.a.bind("nivo:animFinished",function(){c.j=!1;for(var d,f=a.h.length;--f+1;)d=e(a.h[f]),d.is("a")&&d.css("display","none");a.c.is("a")&&a.c.css("display","block");g==""&&!c.paused&&!b.q&&(g=setInterval(function(){m(!1)},b.r))});this.stop=function(){if(!a.a.data("nivo:vars").stop)a.a.data("nivo:vars").stop=
!0};this.start=function(){if(a.a.data("nivo:vars").stop)a.a.data("nivo:vars").stop=!1};return this}e.fn.nivoSlider=function(u){return this.each(function(){var q=e(this);if(q.data("nivoslider"))return q.data("nivoslider");var v=new y(this,u);q.data("nivoslider",v)})};e.fn.nivoSlider.F={n:"random",e:15,g:8,k:4,f:500,r:3E3,l:0,G:!0,H:!0,u:!0,A:!1,B:!1,D:".jpg",C:"_thumb.jpg",I:!0,K:!0,q:!1,t:0.8,L:"Prev",J:"Next",M:!1,Q:s(),O:s(),S:s(),R:s(),P:s()};e.fn.m=[].reverse})(jQuery);