$(function(n){var i=1,t=window.location.pathname,o=n(document),a=n(".post-feed"),s=100,r=!1,d=!1,w=window.scrollY,c=window.innerHeight,f=o.height();function l(){w=window.scrollY,e()}function u(){c=window.innerHeight,f=o.height(),e()}function e(){r||requestAnimationFrame(g),r=!0}function g(){if(!d)if(w+c<=f-s)r=!1;else if(i!==maxPages){d=!0;var e=t+"page"+ ++i+"/";n.get(e,function(e){a.append(n(e).find(".post").hide().fadeIn(100))}).fail(function(e){404===e.status&&(window.removeEventListener("scroll",l,{passive:!0}),window.removeEventListener("resize",u))}).always(function(){f=o.height(),r=d=!1})}}t=t.replace(/#(.*)$/g,"").replace("///g","/"),window.addEventListener("scroll",l,{passive:!0}),window.addEventListener("resize",u),g()});
//# sourceMappingURL=infinitescroll.js.map