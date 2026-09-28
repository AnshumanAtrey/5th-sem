// This is an external script, included here, and in one line, for performance.
/* PluginDetect v0.8.6 www.pinlady.net/PluginDetect/license/ [ isMinVersion hasMimeType onDetectionDone ] [ Java Flash ] */ var PluginDetect={version:"0.8.6",name:"PluginDetect",openTag:"<",isDefined:function(b){return typeof b!="undefined"},isArray:function(b){return(/array/i).test(Object.prototype.toString.call(b))},isFunc:function(b){return typeof b=="function"},isString:function(b){return typeof b=="string"},isNum:function(b){return typeof b=="number"},isStrNum:function(b){return(typeof b=="string"&&(/\d/).test(b))},getNumRegx:/[\d][\d\.\_,\-]*/,splitNumRegx:/[\.\_,\-]/g,getNum:function(b,c){var d=this,a=d.isStrNum(b)?(d.isDefined(c)?new RegExp(c):d.getNumRegx).exec(b):null;return a?a[0]:null},compareNums:function(h,f,d){var e=this,c,b,a,g=parseInt;if(e.isStrNum(h)&&e.isStrNum(f)){if(e.isDefined(d)&&d.compareNums){return d.compareNums(h,f)}c=h.split(e.splitNumRegx);b=f.split(e.splitNumRegx);for(a=0;a<Math.min(c.length,b.length);a++){if(g(c[a],10)>g(b[a],10)){return 1}if(g(c[a],10)<g(b[a],10)){return -1}}}return 0},formatNum:function(b,c){var d=this,a,e;if(!d.isStrNum(b)){return null}if(!d.isNum(c)){c=4}c--;e=b.replace(/\s/g,"").split(d.splitNumRegx).concat(["0","0","0","0"]);for(a=0;a<4;a++){if(/^(0+)(.+)$/.test(e[a])){e[a]=RegExp.$2}if(a>c||!(/\d/).test(e[a])){e[a]="0"}}return e.slice(0,4).join(",")},getPROP:function(d,b,a){var c;try{if(d){a=d[b]}}catch(c){}return a},findNavPlugin:function(l,e,c){var j=this,h=new RegExp(l,"i"),d=(!j.isDefined(e)||e)?/\d/:0,k=c?new RegExp(c,"i"):0,a=navigator.plugins,g="",f,b,m;for(f=0;f<a.length;f++){m=a[f].description||g;b=a[f].name||g;if((h.test(m)&&(!d||d.test(RegExp.leftContext+RegExp.rightContext)))||(h.test(b)&&(!d||d.test(RegExp.leftContext+RegExp.rightContext)))){if(!k||!(k.test(m)||k.test(b))){return a[f]}}}return null},getMimeEnabledPlugin:function(k,m,c){var e=this,f,b=new RegExp(m,"i"),h="",g=c?new RegExp(c,"i"):0,a,l,d,j=e.isString(k)?[k]:k;for(d=0;d<j.length;d++){if((f=e.hasMimeType(j[d]))&&(f=f.enabledPlugin)){l=f.description||h;a=f.name||h;if(b.test(l)||b.test(a)){if(!g||!(g.test(l)||g.test(a))){return f}}}}return 0},getVersionDelimiter:",",findPlugin:function(d){var c=this,b,d,a={status:-3,plugin:0};if(c.DOM){c.DOM.initDiv()}if(!c.isString(d)){return a}if(d.length==1){c.getVersionDelimiter=d;return a}d=d.toLowerCase().replace(/\s/g,"");b=c.Plugins[d];if(!b||!b.getVersion){return a}a.plugin=b;a.status=1;return a},getPluginFileVersion:function(f,b){var h=this,e,d,g,a,c=-1;if(h.OS>2||!f||!f.version||!(e=h.getNum(f.version))){return b}if(!b){return e}e=h.formatNum(e);b=h.formatNum(b);d=b.split(h.splitNumRegx);g=e.split(h.splitNumRegx);for(a=0;a<d.length;a++){if(c>-1&&a>c&&d[a]!="0"){return b}if(g[a]!=d[a]){if(c==-1){c=a}if(d[a]!="0"){return b}}}return e},AXO:window.ActiveXObject,getAXO:function(a){var d=null,c,b=this;try{d=new b.AXO(a)}catch(c){};return d},browser:{},INIT:function(){this.init.library(this)},init:{$:1,hasRun:0,objProperties:function(d,e,b){var a,c={};if(e&&b){if(e[b[0]]===1&&!d.isArray(e)&&!d.isFunc(e)&&!d.isString(e)&&!d.isNum(e)){for(a=0;a<b.length;a=a+2){e[b[a]]=b[a+1];c[b[a]]=1}}for(a in e){if(!c[a]&&e[a]&&e[a][b[0]]===1){this.objProperties(d,e[a],b)}}}},publicMethods:function(c,f){var g=this,b=g.$,a,d;if(c&&f){for(a in c){try{if(b.isFunc(c[a])){f[a]=c[a](f)}}catch(d){}}}},plugin:function(a,c){var d=this,b=d.$;if(a){d.objProperties(b,a,["$",b,"$$",a]);if(!b.isDefined(a.getVersionDone)){a.installed=null;a.version=null;a.version0=null;a.getVersionDone=null;a.pluginName=c}}},detectIE:function(){var init=this,$=init.$,browser=$.browser,doc=document,e,x,tmp,userAgent=navigator.userAgent||"",progid,progid1,progid2;tmp=doc.documentMode;try{doc.documentMode=""}catch(e){}browser.isIE=$.isNum(doc.documentMode)?!0:eval("/*@cc_on!@*/!1");try{doc.documentMode=tmp}catch(e){};browser.verIE=null;if(browser.isIE){browser.verIE=($.isNum(doc.documentMode)&&doc.documentMode>=7?doc.documentMode:0)||((/^(?:.*?[^a-zA-Z])??(?:MSIE|rv\s*\:)\s*(\d+\.?\d*)/i).test(userAgent)?parseFloat(RegExp.$1,10):7)};browser.ActiveXEnabled=!1;browser.ActiveXFilteringEnabled=!1;if(browser.isIE){try{browser.ActiveXFilteringEnabled=window.external.msActiveXFilteringEnabled()}catch(e){}progid1=["Msxml2.XMLHTTP","Msxml2.DOMDocument","Microsoft.XMLDOM","TDCCtl.TDCCtl","Shell.UIHelper","HtmlDlgSafeHelper.HtmlDlgSafeHelper","Scripting.Dictionary"];progid2=["WMPlayer.OCX","ShockwaveFlash.ShockwaveFlash","AgControl.AgControl",];progid=progid1.concat(progid2);for(x=0;x<progid.length;x++){if($.getAXO(progid[x])){browser.ActiveXEnabled=!0;if(!$.dbug){break}}}if(browser.ActiveXEnabled&&browser.ActiveXFilteringEnabled){for(x=0;x<progid2.length;x++){if($.getAXO(progid2[x])){browser.ActiveXFilteringEnabled=!1;break}}}}},detectNonIE:function(){var f=this,d=this.$,a=d.browser,e=navigator,c=a.isIE?"":e.userAgent||"",g=e.vendor||"",b=e.product||"";a.isGecko=(/Gecko/i).test(b)&&(/Gecko\s*\/\s*\d/i).test(c);a.verGecko=a.isGecko?d.formatNum((/rv\s*\:\s*([\.\,\d]+)/i).test(c)?RegExp.$1:"0.9"):null;a.isChrome=(/(Chrome|CriOS)\s*\/\s*(\d[\d\.]*)/i).test(c);a.verChrome=a.isChrome?d.formatNum(RegExp.$2):null;a.isSafari=!a.isChrome&&((/Apple/i).test(g)||!g)&&(/Safari\s*\/\s*(\d[\d\.]*)/i).test(c);a.verSafari=a.isSafari&&(/Version\s*\/\s*(\d[\d\.]*)/i).test(c)?d.formatNum(RegExp.$1):null;a.isOpera=(/Opera\s*[\/]?\s*(\d+\.?\d*)/i).test(c);a.verOpera=a.isOpera&&((/Version\s*\/\s*(\d+\.?\d*)/i).test(c)||1)?parseFloat(RegExp.$1,10):null},detectPlatform:function(){var e=this,d=e.$,b,a=navigator.platform||"";d.OS=100;if(a){var c=["Win",1,"Mac",2,"Linux",3,"FreeBSD",4,"iPhone",21.1,"iPod",21.2,"iPad",21.3,"Win.*CE",22.1,"Win.*Mobile",22.2,"Pocket\\s*PC",22.3,"",100];for(b=c.length-2;b>=0;b=b-2){if(c[b]&&new RegExp(c[b],"i").test(a)){d.OS=c[b+1];break}}}},library:function(c){var e=this,d=document,b,a;c.init.objProperties(c,c,["$",c]);for(a in c.Plugins){c.init.plugin(c.Plugins[a],a)}e.publicMethods(c.PUBLIC,c);c.win.init();c.head=d.getElementsByTagName("head")[0]||d.getElementsByTagName("body")[0]||d.body||null;e.detectPlatform();e.detectIE();e.detectNonIE();c.init.hasRun=1}},ev:{$:1,handler:function(d,c,b,a){return function(){d(c,b,a)}},fPush:function(b,a){var c=this,d=c.$;if(d.isArray(a)&&(d.isFunc(b)||(d.isArray(b)&&b.length>0&&d.isFunc(b[0])))){a.push(b)}},callArray:function(a){var b=this,d=b.$,c;if(d.isArray(a)){while(a.length){c=a[0];a.splice(0,1);b.call(c)}}},call:function(d){var b=this,c=b.$,a=c.isArray(d)?d.length:-1;if(a>0&&c.isFunc(d[0])){d[0](c,a>1?d[1]:0,a>2?d[2]:0,a>3?d[3]:0)}else{if(c.isFunc(d)){d(c)}}}},PUBLIC:{isMinVersion:function(b){var a=function(j,h,e,d){var f=b.findPlugin(j),g,c=-1;if(f.status<0){return f.status}g=f.plugin;h=b.formatNum(b.isNum(h)?h.toString():(b.isStrNum(h)?b.getNum(h):"0"));if(g.getVersionDone!=1){g.getVersion(h,e,d);if(g.getVersionDone===null){g.getVersionDone=1}}if(g.installed!==null){c=g.installed<=0.5?g.installed:(g.installed==0.7?1:(g.version===null?0:(b.compareNums(g.version,h,g)>=0?1:-0.1)))};return c};return a},onDetectionDone:function(b){var a=function(j,h,d,c){var e=b.findPlugin(j),k,g;if(e.status==-3){return -1}g=e.plugin;if(!b.isArray(g.funcs)){g.funcs=[]};if(g.getVersionDone!=1){k=b.getVersion?b.getVersion(j,d,c):b.isMinVersion(j,"0",d,c)}if(g.installed!=-0.5&&g.installed!=0.5){b.ev.call(h);return 1}b.ev.fPush(h,g.funcs);return 0};return a},hasMimeType:function(b){var a=function(d){if(!b.browser.isIE&&d&&navigator&&navigator.mimeTypes){var g,f,c,e=b.isArray(d)?d:(b.isString(d)?[d]:[]);for(c=0;c<e.length;c++){if(b.isString(e[c])&&/[^\s]/.test(e[c])){g=navigator.mimeTypes[e[c]];f=g?g.enabledPlugin:0;if(f&&(f.name||f.description)){return g}}}}return null};return a},z:0},codebase:{$:1,isDisabled:function(){var b=this,c=b.$,a=c.browser;return a.ActiveXEnabled&&a.isIE&&a.verIE>=7?0:1},checkGarbage:function(d){var b=this,c=b.$,a;if(c.browser.isIE&&d&&c.getPROP(d.firstChild,"object")){a=c.getPROP(d.firstChild,"readyState");if(c.isNum(a)&&a!=4){b.garbage=1;return 1}}return 0},emptyGarbage:function(){var a=this,b=a.$,c;if(b.browser.isIE&&a.garbage){try{window.CollectGarbage()}catch(c){}a.garbage=0}},init:function(e){if(!e.init){var c=this,d=c.$,a,b;e.init=1;e.min=0;e.max=0;e.hasRun=0;e.version=null;e.L=0;e.altHTML="";e.span=document.createElement("span");e.tagA='<object width="1" height="1" style="display:none;" codebase="#version=';b=e.classID||e.$$.classID||"";e.tagB='" '+((/clsid\s*:/i).test(b)?'classid="':'type="')+b+'">'+e.altHTML+d.openTag+"/object>";for(a=0;a<e.Lower.length;a++){e.Lower[a]=d.formatNum(e.Lower[a]);e.Upper[a]=d.formatNum(e.Upper[a])}}},isActiveXObject:function(i,b){var f=this,g=f.$,a=0,h,d=i.$$,c=i.span;if(i.min&&g.compareNums(b,i.min)<=0){return 1}if(i.max&&g.compareNums(b,i.max)>=0){return 0}c.innerHTML=i.tagA+b+i.tagB;if(g.getPROP(c.firstChild,"object")){a=1};f.checkGarbage(c);c.innerHTML="";if(a){i.min=b}else{i.max=b}return a},convert_:function(f,a,b,e){var d=f.convert[a],c=f.$;return d?(c.isFunc(d)?c.formatNum(d(b.split(c.splitNumRegx),e).join(",")):b):d},convert:function(h,c,g){var e=this,f=h.$,b,a,d;c=f.formatNum(c);a={v:c,x:-1};if(c){for(b=0;b<h.Lower.length;b++){d=e.convert_(h,b,h.Lower[b]);if(d&&f.compareNums(c,g?d:h.Lower[b])>=0&&(!b||f.compareNums(c,g?e.convert_(h,b,h.Upper[b]):h.Upper[b])<0)){a.v=e.convert_(h,b,c,g);a.x=b;break}}}return a},isMin:function(g,f){var d=this,e=g.$,c,b,a=0;d.init(g);if(!e.isStrNum(f)||d.isDisabled()){return a};if(!g.L){g.L={};for(c=0;c<g.Lower.length;c++){if(d.isActiveXObject(g,g.Lower[c])){g.L=d.convert(g,g.Lower[c]);break}}}if(g.L.v){b=d.convert(g,f,1);if(b.x>=0){a=(g.L.x==b.x?d.isActiveXObject(g,b.v):e.compareNums(f,g.L.v)<=0)?1:-1}};return a},search:function(g){var k=this,h=k.$,i=g.$$,b=0,c;k.init(g);return g.version}},win:{$:1,loaded:false,hasRun:0,init:function(){var b=this,a=b.$;if(!b.hasRun){b.hasRun=1;b.runFuncs=a.ev.handler(b.$$runFuncs,a);b.cleanup=a.ev.handler(b.$$cleanup,a);b.addEvent("load",b.runFuncs);b.addEvent("unload",b.cleanup)}},addEvent:function(c,b){var e=this,d=e.$,a=window;if(d.isFunc(b)){if(a.addEventListener){a.addEventListener(c,b,false)}else{if(a.attachEvent){a.attachEvent("on"+c,b)}else{a["on"+c]=e.concatFn(b,a["on"+c])}}}},concatFn:function(d,c){return function(){d();if(typeof c=="function"){c()}}},funcs0:[],funcs:[],$$cleanup:function(b){if(b){for(var a in b){b[a]=0}b=0}},count:0,countMax:1,intervalLength:50,$$runFuncs:function(a){if(!a||a.win.loaded){return}var b=a.win;if(b.count<b.countMax&&b.funcs0.length){setTimeout(b.runFuncs,b.intervalLength)}else{b.loaded=true;a.ev.callArray(b.funcs0);a.ev.callArray(b.funcs);if(a.DOM){a.DOM.onDoneEmptyDiv()}}b.count++}},DOM:{$:1,isEnabled:{$:1,objectTag:function(){var a=this.$;return a.browser.isIE?a.browser.ActiveXEnabled:1},objectProperty:function(){var a=this.$;return a.browser.isIE&&a.browser.verIE>=7?1:0}},div:null,divID:"plugindetect",divClass:"doNotRemove",divWidth:50,getDiv:function(){var a=this;return a.div||document.getElementById(a.divID)||null},isDivPermanent:function(){var b=this,c=b.$,a=b.getDiv();return a&&c.isString(a.className)&&a.className.toLowerCase().indexOf(b.divClass.toLowerCase())>-1?1:0},initDiv:function(b){var c=this,d=c.$,a;if(!c.div){a=c.getDiv();if(a){c.div=a}else{if(b){c.div=document.createElement("div");c.div.id=c.divID}}if(c.div){c.setStyle(c.div,c.defaultStyle.concat(["display","block","width",c.divWidth+"px","height",(c.pluginSize+3)+"px","fontSize",(c.pluginSize+3)+"px","lineHeight",(c.pluginSize+3)+"px"]));if(!a){c.setStyle(c.div,["position","absolute","right","0px","top","0px"]);c.insertDivInBody(c.div)}}}},pluginSize:1,altHTML:"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",emptyNode:function(c){var b=this,d=b.$,a,f;if(c){if(d.browser.isIE){b.setStyle(c,["display","none"])}try{c.innerHTML=""}catch(f){}}},LASTfuncs:[],onDoneEmptyDiv:function(){var f=this,g=f.$,b,d,c,a,h;f.initDiv();if(!g.win.loaded||g.win.funcs0.length||g.win.funcs.length){return}for(b in g.Plugins){d=g.Plugins[b];if(d){if(d.OTF==3||(d.funcs&&d.funcs.length)){return}}}g.ev.callArray(f.LASTfuncs);a=f.getDiv();if(a){if(f.isDivPermanent()){}else{if(a.childNodes){for(b=a.childNodes.length-1;b>=0;b--){c=a.childNodes[b];f.emptyNode(c)}try{a.innerHTML=""}catch(h){}}if(a.parentNode){try{a.parentNode.removeChild(a)}catch(h){}a=null;f.div=null}}}},width:function(){var g=this,e=g.DOM,f=e.$,d=g.span,b,c,a=-1;b=d&&f.isNum(d.scrollWidth)?d.scrollWidth:a;c=d&&f.isNum(d.offsetWidth)?d.offsetWidth:a;return c>0?c:(b>0?b:Math.max(c,b))},obj:function(b){var d=this,c=d.span,a=c&&c.firstChild?c.firstChild:null;return a},readyState:function(){var b=this,a=b.DOM.$;return a.browser.isIE?a.getPROP(b.obj(),"readyState"):b.undefined},objectProperty:function(){var d=this,b=d.DOM,c=b.$,a;if(b.isEnabled.objectProperty()){a=c.getPROP(d.obj(),"object")}return a},getTagStatus:function(b,m,r,p,f,h){var s=this,d=s.$,q;if(!b||!b.span){return -2}var k=b.width(),c=b.readyState(),a=b.objectProperty();if(a){return 1.5}var g=/clsid\s*\:/i,o=r&&g.test(r.outerHTML||"")?r:(p&&g.test(p.outerHTML||"")?p:0),i=r&&!g.test(r.outerHTML||"")?r:(p&&!g.test(p.outerHTML||"")?p:0),l=b&&g.test(b.outerHTML||"")?o:i;if(!m||!m.span||!l||!l.span){return 0}var j=l.width(),n=m.width(),t=l.readyState();if(k<0||j<0||n<=s.pluginSize){return 0}if(h&&!b.pi&&d.isDefined(a)&&d.browser.isIE&&b.tagName==l.tagName&&b.time<=l.time&&k===j&&c===0&&t!==0){b.pi=1}if(j<n){return b.pi?-0.1:0}if(k>=n){if(!b.winLoaded&&d.win.loaded){return b.pi?-0.5:-1}if(d.isNum(f)){if(!d.isNum(b.count2)){b.count2=f}if(f-b.count2>0){return b.pi?-0.5:-1}}}try{if(k==s.pluginSize&&(!d.browser.isIE||c===4)){if(!b.winLoaded&&d.win.loaded){return 1}if(b.winLoaded&&d.isNum(f)){if(!d.isNum(b.count)){b.count=f}if(f-b.count>=5){return 1}}}}catch(q){}return b.pi?-0.1:0},setStyle:function(b,h){var c=this,d=c.$,g=b.style,a,f;if(g&&h){for(a=0;a<h.length;a=a+2){try{g[h[a]]=h[a+1]}catch(f){}}}},insertDivInBody:function(a,h){var j=this,d=j.$,g,b="pd33993399",c=null,i=h?window.top.document:window.document,f=i.getElementsByTagName("body")[0]||i.body;if(!f){try{i.write('<div id="'+b+'">.'+d.openTag+"/div>");c=i.getElementById(b)}catch(g){}}f=i.getElementsByTagName("body")[0]||i.body;if(f){f.insertBefore(a,f.firstChild);if(c){f.removeChild(c)}}},defaultStyle:["verticalAlign","baseline","outlineStyle","none","borderStyle","none","padding","0px","margin","0px","visibility","visible"],insert:function(b,i,g,h,c,q,o){var s=this,f=s.$,r,t=document,v,m,p=t.createElement("span"),k,a,l="outline-style:none;border-style:none;padding:0px;margin:0px;visibility:"+(q?"hidden;":"visible;")+"display:inline;";if(!f.isDefined(h)){h=""}if(f.isString(b)&&(/[^\s]/).test(b)){b=b.toLowerCase().replace(/\s/g,"");v=f.openTag+b+" ";v+='style="'+l+'" ';var j=1,u=1;for(k=0;k<i.length;k=k+2){if(/[^\s]/.test(i[k+1])){v+=i[k]+'="'+i[k+1]+'" '}if((/width/i).test(i[k])){j=0}if((/height/i).test(i[k])){u=0}}v+=(j?'width="'+s.pluginSize+'" ':"")+(u?'height="'+s.pluginSize+'" ':"");v+=">";for(k=0;k<g.length;k=k+2){if(/[^\s]/.test(g[k+1])){v+=f.openTag+'param name="'+g[k]+'" value="'+g[k+1]+'" />'}}v+=h+f.openTag+"/"+b+">"}else{b="";v=h}if(!o){s.initDiv(1)}var n=o||s.getDiv();m={span:null,winLoaded:f.win.loaded,tagName:b,outerHTML:v,DOM:s,time:new Date().getTime(),width:s.width,obj:s.obj,readyState:s.readyState,objectProperty:s.objectProperty};if(n&&n.parentNode){s.setStyle(p,s.defaultStyle.concat(["display","inline"]).concat(o?[]:["fontSize",(s.pluginSize+3)+"px","lineHeight",(s.pluginSize+3)+"px"]));n.appendChild(p);try{p.innerHTML=v}catch(r){};m.span=p;m.winLoaded=f.win.loaded}return m}},file:{$:1,any:"fileStorageAny999",valid:"fileStorageValid999",save:function(d,f,c){var b=this,e=b.$,a;if(d&&e.isDefined(c)){if(!d[b.any]){d[b.any]=[]}if(!d[b.valid]){d[b.valid]=[]}d[b.any].push(c);a=b.split(f,c);if(a){d[b.valid].push(a)}}},getValidLength:function(a){return a&&a[this.valid]?a[this.valid].length:0},getAnyLength:function(a){return a&&a[this.any]?a[this.any].length:0},getValid:function(c,a){var b=this;return c&&c[b.valid]?b.get(c[b.valid],a):null},getAny:function(c,a){var b=this;return c&&c[b.any]?b.get(c[b.any],a):null},get:function(d,a){var c=d.length-1,b=this.$.isNum(a)?a:c;return(b<0||b>c)?null:d[b]},split:function(g,c){var b=this,e=b.$,f=null,a,d;g=g?g.replace(".","\\."):"";d=new RegExp("^(.*[^\\/])("+g+"\\s*)$");if(e.isString(c)&&d.test(c)){a=(RegExp.$1).split("/");f={name:a[a.length-1],ext:RegExp.$2,full:c};a[a.length-1]="";f.path=a.join("/")}return f},z:0},Plugins:{java:{$:1,mimeType:["application/x-java-applet","application/x-java-vm","application/x-java-bean"],mimeType_dummy:"application/dummymimejavaapplet",classID:"clsid:8AD9C840-044E-11D1-B3E9-00805F499D93",classID_dummy:"clsid:8AD9C840-044E-11D1-B3E9-BA9876543210",navigator:{$:1,a:(function(){var b,a=!0;try{a=window.navigator.javaEnabled()}catch(b){}return a})(),javaEnabled:function(){return this.a},mimeObj:0,pluginObj:0},OTF:null,getVerifyTagsDefault:function(){return[1,this.applet.isDisabled.VerifyTagsDefault_1()?0:1,1]},getVersion:function(j,g,i){var b=this,d=b.$,e,a=b.applet,h=b.verify,k=b.navigator,f=null,l=null,c=null;if(b.getVersionDone===null){b.OTF=0;k.mimeObj=d.hasMimeType(b.mimeType);if(k.mimeObj){k.pluginObj=k.mimeObj.enabledPlugin}if(h){h.begin()}}a.setVerifyTagsArray(i);d.file.save(b,".jar",g);if(b.getVersionDone===0){if(a.should_Insert_Query_Any()){e=a.insert_Query_Any(j);b.setPluginStatus(e[0],e[1],f,j)}return}if((!f||d.dbug)&&b.navMime.query().version){f=b.navMime.version}if((!f||d.dbug)&&b.DTK.query(d.dbug).version){f=b.DTK.version}if((!f||d.dbug)&&b.navPlugin.query().version){f=b.navPlugin.version}if(b.nonAppletDetectionOk(f)){c=f}b.setPluginStatus(c,l,f,j);if(a.should_Insert_Query_Any()){e=a.insert_Query_Any(j);if(e[0]){c=e[0];l=e[1]}}b.setPluginStatus(c,l,f,j)},nonAppletDetectionOk:function(b){var d=this,e=d.$,a=d.navigator,c=1;if(!b||!a.javaEnabled()||(!e.browser.isIE&&!a.mimeObj)||(e.browser.isIE&&!e.browser.ActiveXEnabled)){c=0}else{if(e.OS>=20){}else{if(d.info&&d.info.getPlugin2Status()<0&&d.info.BrowserRequiresPlugin2()){c=0}}}return c},setPluginStatus:function(d,i,g,h){var b=this,e=b.$,f,c=0,a=b.applet;g=g||b.version0;f=a.isRange(d);if(f){if(a.setRange(f,h)==d){c=f}d=0}if(b.OTF<3){b.installed=c?(c>0?0.7:-0.1):(d?1:(g?-0.2:-1))}if(b.OTF==2&&b.NOTF&&!b.applet.getResult()[0]){b.installed=g?-0.2:-1}if(b.OTF==3&&b.installed!=-0.5&&b.installed!=0.5){b.installed=(b.NOTF.isJavaActive(1)==1?0.5:-0.5)}if(b.OTF==4&&(b.installed==-0.5||b.installed==0.5)){if(d){b.installed=1}else{if(c){b.installed=c>0?0.7:-0.1}else{if(b.NOTF.isJavaActive(1)==1){if(g){b.installed=1;d=g}else{b.installed=0}}else{if(g){b.installed=-0.2}else{b.installed=-1}}}}}if(g){b.version0=e.formatNum(e.getNum(g))}if(d&&!c){b.version=e.formatNum(e.getNum(d))}if(i&&e.isString(i)){b.vendor=i}if(!b.vendor){b.vendor=""}if(b.verify&&b.verify.isEnabled()){b.getVersionDone=0}else{if(b.getVersionDone!=1){if(b.OTF<2){b.getVersionDone=0}else{b.getVersionDone=b.applet.can_Insert_Query_Any()?0:1}}};e.codebase.emptyGarbage()},DTK:{$:1,hasRun:0,status:null,VERSIONS:[],version:"",HTML:null,Plugin2Status:null,classID:["clsid:CAFEEFAC-DEC7-0000-0001-ABCDEFFEDCBA","clsid:CAFEEFAC-DEC7-0000-0000-ABCDEFFEDCBA"],mimeType:["application/java-deployment-toolkit","application/npruntime-scriptable-plugin;DeploymentToolkit"],isDisabled:function(a){var c=this,d=c.$,b=d.browser;if(!a&&(!d.DOM.isEnabled.objectTag()||(b.isGecko&&d.compareNums(b.verGecko,d.formatNum("1.6"))<=0)||(b.isSafari&&d.OS==1&&(!b.verSafari||d.compareNums(b.verSafari,"5,1,0,0")<0))||b.isChrome)){return 1}return 0},query:function(n){var l=this,h=l.$,f=l.$$,k,m,i,a=h.DOM.altHTML,g={},b,d=null,j=null,c=(l.hasRun||l.isDisabled(n));l.hasRun=1;if(c){return l}l.status=0;if(h.browser.isIE){for(m=0;m<l.classID.length;m++){l.HTML=h.DOM.insert("object",["classid",l.classID[m]],[],a);d=l.HTML.obj();if(h.getPROP(d,"jvms")){break}}}else{i=h.hasMimeType(l.mimeType);if(i&&i.type){l.HTML=h.DOM.insert("object",["type",i.type],[],a);d=l.HTML.obj()}}if(d){try{b=h.getPROP(d,"jvms");if(b){j=b.getLength();if(h.isNum(j)){l.status=j>0?1:-1;for(m=0;m<j;m++){i=h.getNum(b.get(j-1-m).version);if(i){l.VERSIONS.push(i);g["a"+h.formatNum(i)]=1}}}}}catch(k){}}i=0;for(m in g){i++}if(i&&i!==l.VERSIONS.length){l.VERSIONS=[]}if(l.VERSIONS.length){l.version=h.formatNum(l.VERSIONS[0])};return l}},navMime:{$:1,hasRun:0,mimetype:"",version:"",length:0,mimeObj:0,pluginObj:0,isDisabled:function(){var b=this,d=b.$,c=b.$$,a=c.navigator;if(d.browser.isIE||!a.mimeObj||!a.pluginObj){return 1}return 0},query:function(){var i=this,f=i.$,a=i.$$,b=(i.hasRun||i.isDisabled());i.hasRun=1;if(b){return i};var n=/^\s*application\/x-java-applet;jpi-version\s*=\s*(\d.*)$/i,g,l,j,d="",h="a",o,m,k={},c=f.formatNum("0");for(l=0;l<navigator.mimeTypes.length;l++){o=navigator.mimeTypes[l];m=o?o.enabledPlugin:0;g=o&&n.test(o.type||d)?f.formatNum(f.getNum(RegExp.$1)):0;if(g&&m&&(m.description||m.name)){if(!k[h+g]){i.length++}k[h+g]=o.type;if(f.compareNums(g,c)>0){c=g}}}g=k[h+c];if(g){o=f.hasMimeType(g);i.mimeObj=o;i.pluginObj=o?o.enabledPlugin:0;i.mimetype=g;i.version=c};return i}},navPlugin:{$:1,hasRun:0,version:"",isDisabled:function(){var d=this,c=d.$,b=d.$$,a=b.navigator;if(c.browser.isIE||!a.mimeObj||!a.pluginObj){return 1}return 0},query:function(){var m=this,e=m.$,c=m.$$,h=c.navigator,j,l,k,g,d,a,i,f=0,b=(m.hasRun||m.isDisabled());m.hasRun=1;if(b){return m};a=h.pluginObj.name||"";i=h.pluginObj.description||"";if(!f||e.dbug){g=/Java.*TM.*Platform[^\d]*(\d+)(?:[\.,_](\d*))?(?:\s*[Update]+\s*(\d*))?/i;if((g.test(a)||g.test(i))&&parseInt(RegExp.$1,10)>=5){f="1,"+RegExp.$1+","+(RegExp.$2?RegExp.$2:"0")+","+(RegExp.$3?RegExp.$3:"0")}}if(!f||e.dbug){g=/Java[^\d]*Plug-in/i;l=g.test(i)?e.formatNum(e.getNum(i)):0;k=g.test(a)?e.formatNum(e.getNum(a)):0;if(l&&(e.compareNums(l,e.formatNum("1,3"))<0||e.compareNums(l,e.formatNum("2"))>=0)){l=0}if(k&&(e.compareNums(k,e.formatNum("1,3"))<0||e.compareNums(k,e.formatNum("2"))>=0)){k=0}d=l&&k?(e.compareNums(l,k)>0?l:k):(l||k);if(d){f=d}}if(!f&&e.browser.isSafari&&e.OS==2){j=e.findNavPlugin("Java.*\\d.*Plug-in.*Cocoa",0);if(j){l=e.getNum(j.description);if(l){f=l}}};if(f){m.version=e.formatNum(f)};return m}},applet:{$:1,codebase:{$:1,isMin:function(a){return this.$.codebase.isMin(this,a)},search:function(){return this.$.codebase.search(this)},ParamTags:'<param name="code" value="A19999.class" /><param name="codebase_lookup" value="false" />',DIGITMAX:[[16,64],[6,0,512],0,[1,5,2,256],0,[1,4,1,1],[1,4,0,64],[1,3,2,32]],DIGITMIN:[1,0,0,0],Upper:["999","10","5,0,20","1,5,0,20","1,4,1,20","1,4,1,2","1,4,1","1,4"],Lower:["10","5,0,20","1,5,0,20","1,4,1,20","1,4,1,2","1,4,1","1,4","0"],convert:[function(b,a){return a?[parseInt(b[0],10)>1?"99":parseInt(b[1],10)+3+"",b[3],"0","0"]:["1",parseInt(b[0],10)-3+"","0",b[1]]},function(b,a){return a?[b[1],b[2],b[3]+"0","0"]:["1",b[0],b[1],b[2].substring(0,b[2].length-1||1)]},0,function(b,a){return a?[b[0],b[1],b[2],b[3]+"0"]:[b[0],b[1],b[2],b[3].substring(0,b[3].length-1||1)]},0,1,function(b,a){return a?[b[0],b[1],b[2],b[3]+"0"]:[b[0],b[1],b[2],b[3].substring(0,b[3].length-1||1)]},1]},results:[[null,null],[null,null],[null,null],[null,null]],getResult:function(){var b=this,d=b.results,a,c=[];for(a=d.length-1;a>=0;a--){c=d[a];if(c[0]){break}}c=[].concat(c);return c},DummySpanTagHTML:0,HTML:[0,0,0,0],active:[0,0,0,0],DummyObjTagHTML:0,DummyObjTagHTML2:0,allowed:[1,1,1,1],VerifyTagsHas:function(c){var d=this,b;for(b=0;b<d.allowed.length;b++){if(d.allowed[b]===c){return 1}}return 0},saveAsVerifyTagsArray:function(c){var b=this,d=b.$,a;if(d.isArray(c)){for(a=1;a<b.allowed.length;a++){if(c.length>a-1&&d.isNum(c[a-1])){if(c[a-1]<0){c[a-1]=0}if(c[a-1]>3){c[a-1]=3}b.allowed[a]=c[a-1]}}b.allowed[0]=b.allowed[3]}},setVerifyTagsArray:function(d){var b=this,c=b.$,a=b.$$;if(a.getVersionDone===null){b.saveAsVerifyTagsArray(a.getVerifyTagsDefault())}if(c.dbug){b.saveAsVerifyTagsArray([3,3,3])}else{if(d){b.saveAsVerifyTagsArray(d)}}},isDisabled:{$:1,single:function(d){var a=this,c=a.$,b=a.$$;if(d==0){return c.codebase.isDisabled()}if((d==3&&!c.browser.isIE)||a.all()){return 1}if(d==1||d==3){return !c.DOM.isEnabled.objectTag()}if(d==2){return a.AppletTag()}},aA_:null,all:function(){var c=this,f=c.$,e=c.$$,b=e.navigator,a=0,d=f.browser;if(c.aA_===null){if(f.OS>=20){a=0}else{if(d.verOpera&&d.verOpera<11&&!b.javaEnabled()){a=1}else{if((d.verGecko&&f.compareNums(d.verGecko,f.formatNum("2"))<0)&&!b.mimeObj){a=1}else{if(c.AppletTag()&&!f.DOM.isEnabled.objectTag()){a=1}}}};c.aA_=a}return c.aA_},AppletTag:function(){var b=this,d=b.$,c=b.$$,a=c.navigator;return d.browser.isIE?!a.javaEnabled():0},VerifyTagsDefault_1:function(){var b=this.$,a=b.browser;if(b.OS>=20){return 1}if((a.isIE&&(a.verIE<9||!a.ActiveXEnabled))||(a.verGecko&&b.compareNums(a.verGecko,b.formatNum("2"))<0)||(a.isSafari&&(!a.verSafari||b.compareNums(a.verSafari,b.formatNum("4"))<0))||(a.verOpera&&a.verOpera<10)){return 0}return 1},z:0},can_Insert_Query:function(d){var b=this,c=b.results[0][0],a=b.getResult()[0];if(b.HTML[d]||(d==0&&c!==null&&!b.isRange(c))||(d==0&&a&&!b.isRange(a))){return 0}return !b.isDisabled.single(d)},can_Insert_Query_Any:function(){var b=this,a;for(a=0;a<b.results.length;a++){if(b.can_Insert_Query(a)){return 1}}return 0},should_Insert_Query:function(e){var c=this,f=c.allowed,d=c.$,b=c.$$,a=c.getResult()[0];a=a&&(e>0||!c.isRange(a));if(!c.can_Insert_Query(e)||f[e]===0){return 0}if(f[e]==3||(f[e]==2.8&&!a)){return 1}if(!b.nonAppletDetectionOk(b.version0)){if(f[e]==2||(f[e]==1&&!a)){return 1}}return 0},should_Insert_Query_Any:function(){var b=this,a;for(a=0;a<b.allowed.length;a++){if(b.should_Insert_Query(a)){return 1}}return 0},query:function(f){var j,a=this,i=a.$,d=a.$$,k=null,l=null,b=a.results,c,h,g=a.HTML[f];if(!g||!g.obj()||b[f][0]||d.bridgeDisabled||(i.dbug&&d.OTF<3)){return}c=g.obj();h=g.readyState();if(1){try{k=i.getNum(c.getVersion()+"");l=c.getVendor()+"";c.statusbar(i.win.loaded?" ":" ")}catch(j){};if(k&&i.isStrNum(k)){b[f]=[k,l];a.active[f]=2}}},isRange:function(a){return(/^[<>]/).test(a||"")?(a.charAt(0)==">"?1:-1):0},setRange:function(b,a){return(b?(b>0?">":"<"):"")+(this.$.isString(a)?a:"")},insertJavaTag:function(g,n,h,o,m){var e=this,c=e.$,k=e.$$,r="A.class",b=c.file.getValid(k),f=b.name+b.ext,q=b.path;var i=["archive",f,"code",r],l=(o?["width",o]:[]).concat(m?["height",m]:[]),j=["mayscript","true"],p=["scriptable","true","codebase_lookup","false"].concat(j),a=k.navigator,d=!c.browser.isIE&&a.mimeObj&&a.mimeObj.type?a.mimeObj.type:k.mimeType[0];if(g==1){return c.browser.isIE?c.DOM.insert("object",["type",d].concat(l),["codebase",q].concat(i).concat(p),h,k,0,n):c.DOM.insert("object",["type",d].concat(l),["codebase",q].concat(i).concat(p),h,k,0,n)}if(g==2){return c.browser.isIE?c.DOM.insert("applet",["alt",h].concat(j).concat(i).concat(l),["codebase",q].concat(p),h,k,0,n):c.DOM.insert("applet",["codebase",q,"alt",h].concat(j).concat(i).concat(l),[].concat(p),h,k,0,n)}if(g==3){return c.browser.isIE?c.DOM.insert("object",["classid",k.classID].concat(l),["codebase",q].concat(i).concat(p),h,k,0,n):c.DOM.insert()}if(g==4){return c.DOM.insert("embed",["codebase",q].concat(i).concat(["type",d]).concat(p).concat(l),[],h,k,0,n)}},insert_Query_Any:function(h){var b=this,d=b.$,c=b.$$,f=b.results,i=b.HTML,a=d.DOM.altHTML,e,g=d.file.getValid(c);if(b.should_Insert_Query(0)){if(c.OTF<2){c.OTF=2};f[0]=[0,0];e=h?b.codebase.isMin(h):b.codebase.search();if(e){f[0][0]=h?b.setRange(e,h):e}b.active[0]=e?1.5:-1}if(!g){return b.getResult()}if(!b.DummySpanTagHTML){b.DummySpanTagHTML=d.DOM.insert("",[],[],a)}if(b.should_Insert_Query(1)){if(c.OTF<2){c.OTF=2};i[1]=b.insertJavaTag(1,0,a);f[1]=[0,0];b.query(1)}if(b.should_Insert_Query(2)){if(c.OTF<2){c.OTF=2};i[2]=b.insertJavaTag(2,0,a);f[2]=[0,0];b.query(2)}if(b.should_Insert_Query(3)){if(c.OTF<2){c.OTF=2};i[3]=b.insertJavaTag(3,0,a);f[3]=[0,0];b.query(3)}if(d.DOM.isEnabled.objectTag()){if(!b.DummyObjTagHTML&&(i[1]||i[2])){b.DummyObjTagHTML=d.DOM.insert("object",["type",c.mimeType_dummy],[],a)}if(!b.DummyObjTagHTML2&&i[3]){b.DummyObjTagHTML2=d.DOM.insert("object",["classid",c.classID_dummy],[],a)}}c.NOTF.begin();return b.getResult()}},NOTF:{$:1,count:0,countMax:25,intervalLength:250,begin:function(){var c=this,b=c.$,a=c.$$;if(a.OTF<3&&c.shouldContinueQuery()){a.OTF=3;c.onIntervalQuery=b.ev.handler(c.$$onIntervalQuery,c);if(!b.win.loaded){b.win.funcs0.push([c.winOnLoadQuery,c])}setTimeout(c.onIntervalQuery,c.intervalLength)}},shouldContinueQuery:function(){var f=this,e=f.$,c=f.$$,b=c.applet,a,d=0;if(e.win.loaded&&f.count>f.countMax){return 0}for(a=0;a<b.results.length;a++){if(b.HTML[a]){if(!e.win.loaded&&f.count>f.countMax&&e.codebase.checkGarbage(b.HTML[a].span)){d=1;b.HTML[a].DELETE=1}if(!d&&!b.results[a][0]&&(b.allowed[a]>=2||(b.allowed[a]==1&&!b.getResult()[0]))&&f.isAppletActive(a)>=0){return 1}}};return 0},isJavaActive:function(d){var f=this,c=f.$$,a,b,e=-9;for(a=0;a<c.applet.HTML.length;a++){b=f.isAppletActive(a,d);if(b>e){e=b}}return e},isAppletActive:function(e,g){var h=this,f=h.$,b=h.$$,l=b.navigator,a=b.applet,i=a.HTML[e],d=a.active,k,c=0,j,m=d[e];if(g||m>=1.5||!i||!i.span){return m};j=f.DOM.getTagStatus(i,a.DummySpanTagHTML,a.DummyObjTagHTML,a.DummyObjTagHTML2,h.count);for(k=0;k<d.length;k++){if(d[k]>0){c=1}}if(j!=1){m=j}else{if(f.browser.isIE||(b.version0&&l.javaEnabled()&&l.mimeObj&&(i.tagName=="object"||c))){m=1}else{m=0}}d[e]=m;return m},winOnLoadQuery:function(c,d){var b=d.$$,a;if(b.OTF==3){a=d.queryAllApplets();d.queryCompleted(a)}},$$onIntervalQuery:function(d){var c=d.$,b=d.$$,a;if(b.OTF==3){a=d.queryAllApplets();if(!d.shouldContinueQuery()){d.queryCompleted(a)}}d.count++;if(b.OTF==3){setTimeout(d.onIntervalQuery,d.intervalLength)}},queryAllApplets:function(){var f=this,e=f.$,d=f.$$,c=d.applet,b,a;for(b=0;b<c.results.length;b++){c.query(b)}a=c.getResult();return a},queryCompleted:function(c){var g=this,f=g.$,e=g.$$,d=e.applet,b;if(e.OTF>=4){return}e.OTF=4;var a=g.isJavaActive();for(b=0;b<d.HTML.length;b++){if(d.HTML[b]&&d.HTML[b].DELETE){f.DOM.emptyNode(d.HTML[b].span);d.HTML[b].span=null}}e.setPluginStatus(c[0],c[1],0);if(f.onDetectionDone&&e.funcs){f.ev.callArray(e.funcs)}if(f.DOM){f.DOM.onDoneEmptyDiv()}}},zz:0},flash:{$:1,mimeType:"application/x-shockwave-flash",progID:"ShockwaveFlash.ShockwaveFlash",classID:"clsid:D27CDB6E-AE6D-11CF-96B8-444553540000",getVersion:function(){var b=function(i){if(!i){return null}var e=/[\d][\d\,\.\s]*[rRdD]{0,1}[\d\,]*/.exec(i);return e?e[0].replace(/[rRdD\.]/g,",").replace(/\s/g,""):null};var j=this,g=j.$,k,h,l=null,c=null,a=null,f,m,d;if(!g.browser.isIE){m=g.hasMimeType(j.mimeType);if(m&&g.DOM.isEnabled.objectTag()){f=g.DOM.insert("object",["type",j.mimeType],[],"",j).obj();try{l=g.getNum(f.GetVariable("$version"))}catch(k){}}if(!l){d=m?m.enabledPlugin:null;if(d&&d.description){l=b(d.description)}if(l){l=g.getPluginFileVersion(d,l)}}}else{for(h=15;h>2;h--){c=g.getAXO(j.progID+"."+h);if(c){a=h.toString();break}}if(!c){c=g.getAXO(j.progID)}if(a=="6"){try{c.AllowScriptAccess="always"}catch(k){return"6,0,21,0"}}try{l=b(c.GetVariable("$version"))}catch(k){}if(!l&&a){l=a}}j.installed=l?1:-1;j.version=g.formatNum(l);return true}},zz:0}};PluginDetect.INIT();

YUI.add('moodle-mod_oucontent-oucontent', function(Y) {
    M.mod_oucontent = {
        pix : null,
        jsstrings : '',
        isguest: false,
        flashinstalled : -99,
        javainstalled : -99,
        nextappletid : 1,
        loadedapplets : 0,
        responseforms : [],
        altformatsextra : false,

        init : function(str, pix, isguest) {
            if (typeof ALTFORMATS_EXTRA !== "undefined") {
                this.altformatsextra = ALTFORMATS_EXTRA;
            }

            this.jsstrings = str;
            this.pix = pix;
            this.isguest = isguest;
            var t = this;
            // Prepare onload.
            Y.on('load', this.page_on_load, window, this);

            // Init single/multi choice.
            var singlechoicefn = function(node) {
                var id = node.get('id').substring(4);
                t.toggle_choice_answers(id);
            };
            var multiplechoicefn = function(node) {
                var id = node.get('id').substring(4);
                t.toggle_choice_answers(id);
                t.update_reveal_button(node);
            };
            Y.all('form.oucontent-singlechoice-form').each(singlechoicefn);
            Y.all('form.oucontent-multichoice-form').each(multiplechoicefn);

            // Init Flash etc.
            Y.all('div.oucontent-activecontent').each(function(node) {
                var type = node.get('oucontenttype'), params = node.get('oucontentparams');
                switch (type) {
                    case 'flash' :
                        t.show_flash(node.get('id'), params.file,
                            params.width, params.height, params.vars, params.sesskey,
                            params.userid, params.activityid, params.itemid, params.courseid,
                            params.preview);
                        break;
                    case 'html5' :
                        t.show_html(node.get('id'), params.file,
                            params.width, params.height, params.vars, params.sesskey,
                            params.userid, params.activityid, params.itemid, params.courseid,
                            params.preview, params.allowguests);
                        break;
                    case 'java' :
                        t.show_java(node.get('id'), params.java, params.width, params.height,
                            params.appletclass, params.javavars);
                        break;
                    case 'openmark' :
                        t.show_openmark(node.get('id'), params.om, params.width, params.height);
                        break;
                }
            });

            if (Y.one('div.oucontent-referenceitem')) {
                var boxes = document.getElementsByName("refboxes");
                if (boxes.length !== 0) {
                    // Get last box.
                    var lastbox = Y.one(boxes[boxes.length - 1]);
                    var lastcheckbox = lastbox.ancestor('.oucontent-referenceitem');
                    // Create div node to hold export and select all buttons.
                    var refitemdiv = Y.Node.create('<div class="refitemdiv">');
                    refitemdiv.appendChild(Y.Node.create('<br/>'));
                    var vbutton = Y.Node.create('<input type="button" />');
                    vbutton.set('value', M.mod_oucontent.jsstrings.exportselectedrefs);
                    vbutton.set('id', 'exportselectedrefs');
                    refitemdiv.appendChild(vbutton);
                    vbutton.on('click', M.mod_oucontent.refs_export_selected, vbutton);
                    refitemdiv.appendChild(Y.Node.create('&nbsp;'));
                    var selectallbutton = Y.Node.create('<input type="button" />');
                    selectallbutton.set('value', M.mod_oucontent.jsstrings.selectall);
                    selectallbutton.set('id', 'selectall');
                    refitemdiv.appendChild(selectallbutton);
                    // Insert nodes.
                    lastcheckbox.insert(refitemdiv, 'after');
                    selectallbutton.on('click', M.mod_oucontent.refs_select_all, selectallbutton);
                    // Add listener to checkboxes to update buttons if checkboxes clicked.
                    for (i = 0; i < boxes.length; i++) {
                        var box = Y.one(boxes[i]);
                        box.on('click', M.mod_oucontent.refs_update_buttons, box);
                    }
                    // Make initial call to refs_update_buttons.
                    M.mod_oucontent.refs_update_buttons();
                }
            }
        },

        // Note: This method is called from mod/audiorecorder.
        init_audio_recorder : function(id, java, width, height, appletclass, javavars) {
            this.show_java(id, java, width, height, appletclass, javavars);
        },

        page_on_load : function () {
            // Check for reload - certain dynamic content requires that pages are
            // reloaded if you go Back or Forward to them.
            var reload = document.getElementById('oucontent_require_reload');
            if (reload) {
                if (Number(reload.value) === 1) {
                    reload.value = 0;
                    window.location.reload();
                    return;
                } else {
                    reload.value = 1;
                }
            }

            // Find referenced anchor tag and its parents.
            var hash = document.location.hash;
            var hashParents = [];
            if (hash) {
                var hashEl = document.getElementById(hash.substring(1));
                if (hashEl) {
                    for (; hashEl; hashEl = hashEl.parentNode) {
                        hashParents.push(hashEl);
                    }
                }
            }

            // Create toggle links for SAQ items.
            var divs = document.getElementsByTagName('div');
            this.dynamic_links(divs, hashParents, 'saq');

            // Create toggle links for ITQ items.
            var elements = document.getElementsByTagName('li');
            this.dynamic_links(elements, hashParents, 'itq');

            // Find rights info links
            var links = document.getElementsByTagName('a');
            for (var i = 0; i < links.length; i++) {
                var link = links[i];
                if (link.className === 'oucontent-rightslink') {
                    link.href = '#';
                    link.onclick = this.do_rights_link(link);
                    // Hide box if visible (CSS means it won't be anyway except on export).
                    var box = link.nextSibling;
                    box.style.display = 'none';
                }
            }

            // Init any free-text responses.
            M.mod_oucontent.freeresponse.init();
            if (this.responseforms.length > 0) {
                window.onbeforeunload = function(event) {
                    return M.mod_oucontent.freeresponse.checkforms(event);
                };
            }

            // Init alternative formats.
            M.mod_oucontent.altformats.init();

            if (document.body.className.indexOf('ie7') !== -1) {
                this.ie7_botched_tables();
            }
            if (document.body.className.indexOf('ie7') !== -1) {
                setTimeout(function () { M.mod_oucontent.force_ie_repaint(); }, 500);
                window.onresize = function() {
                    setTimeout(function () { M.mod_oucontent.force_ie_repaint(); }, 50);
                };
            }
        },

        do_rights_link : function (link) {
            return function() {
                var box = link.nextSibling;
                if (box.style.display === 'block') {
                    box.style.display = 'none';
                    link.title = M.mod_oucontent.jsstrings.show_rights_info.replace(/(<([^>]+)>)/ig,"");
                } else {
                    box.style.display = 'block';
                    link.title = M.mod_oucontent.jsstrings.hide_rights_info.replace(/(<([^>]+)>)/ig,"");
                }
                return false;
            };
        },

        ie7_botched_tables : function () {
            var tablesArray = [];
            var tables = document.getElementsByTagName('table');
            for (var j = 0; j < tables.length; j++) {
                tablesArray[j] = tables[j];
            }
            for (var i = 0; i < tablesArray.length; i++) {
                var table = tablesArray[i];
                var div = table.parentNode;

                if (div.className.indexOf('oucontent-table') !== -1) {
                    var desiredWidth = div.scrollWidth;
                    if (div.clientWidth < desiredWidth) {
                        var desiredTable = table.clientWidth;

                        // Create parent container
                        var container = document.createElement('div');
                        container.style.position = 'relative';
                        table.parentNode.insertBefore(container, table);
                        container.style.minHeight = table.offsetHeight + 'px';
                        table.parentNode.removeChild(table);

                        // Clone table and stick it into right place
                        table.style.width = (desiredTable) + 'px';
                        table.style.position = 'absolute';
                        table.style.top = '0px';
                        table.style.left = '0px';
                        container.appendChild(table);
                    }
                }
            }
        },

        dynamic_links : function (elements, hashParents, type) {
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
                var isInHash = false;
                for (var j = 0; j < hashParents.length; j++) {
                    if (hashParents[j] === element) {
                        isInHash = true;
                        break;
                    }
                }
                var isDiscussion = element.className === 'oucontent-saq-discussion';
                var isAnswer = element.className === 'oucontent-saq-answer';
                if (isDiscussion || isAnswer) {
                    // In CSS, but needed for export.
                    element.style.display = 'none';

                    // Detect whether a discussion is next.
                    if (isDiscussion && element.hasRevealLink) {
                        continue;
                    }

                    var newElement = document.createElement('div');
                    newElement.className = 'oucontent-' + type + '-toggle';
                    var newLink = document.createElement('a');
                    newLink.href = '#';

                    newLink.className = 'oucontent-' + type + '-toggle-link osep-smallbutton';
                    newElement.appendChild(newLink);
                    var hidetext = document.createElement('span');

                    // The word we're using after 'Reveal' or 'Hide'.
                    if (isDiscussion) {
                        // Check if the discussion has a alias.
                        var discussionclassname = element.children[0].className;
                        if (discussionclassname.indexOf("oucontent-discussionhasalias") === -1 &&
                            discussionclassname.indexOf("oucontent-discussionhastype") === -1) {
                            newLink.reveal = document.createElement('span');
                            newLink.reveal.innerHTML = M.mod_oucontent.jsstrings.interaction_reveal_discussion;
                            newLink.appendChild(newLink.reveal);
                            hidetext.innerHTML = M.mod_oucontent.jsstrings.interaction_hide_discussion;
                        } else {
                            // There is going to be a heading (may be h3/h4/etc) with the
                            // oucontent-h4 class containing text with the name.
                            var answerNameText = Y.one(element).one('.oucontent-h4').get('text');
                            var answerName;
                            if (Y.one(element).one('.oucontent-h4 > span[lang=de]')) {
                                // Text should not be set to lower case as #1 is first word.
                                answerName = answerNameText;
                            } else {
                                answerName = answerNameText.toLowerCase();
                            }
                            newLink.reveal = document.createElement('span');
                            newLink.reveal.innerHTML = M.mod_oucontent.jsstrings.interaction_reveal.replace(
                                '#1',answerName);
                            newLink.appendChild(newLink.reveal);
                            hidetext.innerHTML = M.mod_oucontent.jsstrings.interaction_hide.replace(
                                '#1',answerName);
                        }

                    } else {
                        // Check if answer has a type set as 'Specimen answer'.
                        var answerclassname = element.firstChild.className;
                        newLink.reveal = document.createElement('span');
                        if (answerclassname && answerclassname.indexOf("oucontent-specimen-answer") !== -1) {
                            newLink.reveal.innerHTML = M.mod_oucontent.jsstrings.interaction_reveal_specimen_answer;
                            hidetext.innerHTML = M.mod_oucontent.jsstrings.interaction_hide_specimen_answer;
                        } else {
                            newLink.reveal.innerHTML = M.mod_oucontent.jsstrings.interaction_reveal_answer;
                            hidetext.innerHTML = M.mod_oucontent.jsstrings.interaction_hide_answer;
                        }
                        newLink.appendChild(newLink.reveal);
                    }
                    newLink.flag = hidetext;

                    var targetStyle = null;
                    if (type === 'itq') {
                        targetStyle = 'list-item';
                    }
                    var toggleFunction = this.toggle_function(newLink,element, targetStyle);
                    if (isAnswer) {
                        sibling = this.next_sibling(element);
                        if (sibling && sibling.className === 'oucontent-saq-discussion') {
                            sibling.hasRevealLink = true;
                            targets = [element, sibling];
                            toggleFunction = this.toggle_function(newLink, targets, targetStyle);
                        }
                    }

                    newLink.onclick = toggleFunction;
                    newLink.tabIndex = 0;
                    newLink.onkeypress = newLink.onclick;
                    switch (type) {
                        case 'itq':
                            // append to previous list item.
                            var previousElement = this.previous_sibling(element);
                            previousElement.appendChild(newElement);
                            break;
                        default:
                            element.parentNode.insertBefore(newElement,element);
                            break;
                    }

                    element.parentNode.className += ' oucontent-' + type + '-withtoggle';
                    i++; // To account for the element we just added

                    if (isInHash) {
                        newLink.onclick('programmatic');
                        // The below line looks stupid but works, because previously the
                        // browser didn't jump to the hash on account that it was hidden.
                        location.hash = location.hash;
                    }
                }

                if (element.className === 'oucontent-closewindow') {
                    var a = document.createElement('a');
                    a.onclick = function() { window.close(); };
                    a.href = '#';
                    a.innerHTML = M.mod_oucontent.jsstrings.close_transcript;
                    element.appendChild(a);
                }
            }
        },

        toggle_function : function (link, targets, targetStyle) {
            return function(e) {
                if (e !== 'programmatic') {
                    var ev = e ? e : window.event;
                    if (ev.type === 'keypress' && Number(ev.which) !== 32 && Number(ev.which) !== 13) {
                        return true;
                    }
                }
                if (!M.mod_oucontent.is_array(targets)){
                    targets = [targets];
                }

                if (!targetStyle) {
                    targetStyle = 'block';
                }
                // Check if hiding and mess about with the button.
                var hide;
                if (link.firstChild === link.flag) {
                    hide = true;
                    link.appendChild(link.reveal);
                    link.removeChild(link.flag);
                } else {
                    hide = false;
                    link.appendChild(link.flag);
                    link.removeChild(link.reveal);
                }
                // Hide or show all targets.
                for (var i = 0; i < targets.length; i++){
                    target = targets[i];
                    if (hide) {
                        target.style.display = 'none';
                    } else {
                        target.style.display = targetStyle;
                    }
                }

                M.mod_oucontent.force_ie_repaint();
                return false;
            };
        },

        /*
        * Function to get a correct previous sibling node from the dom
        * http://v3.thewatchmakerproject.com/journal/329/finding-html-elements-using-javascript-nextsibling-and-previoussibling
        */
        previous_sibling : function (node) {
            do {
                node = node.previousSibling;
            } while (node && Number(node.nodeType) !== 1);
            return node;
        },

        /*
         * Function to get a correct next sibling node from the dom.
         * http://v3.thewatchmakerproject.com/journal/329/finding-html-elements-using-javascript-nextsibling-and-previoussibling
         */
        next_sibling : function (node) {
            do {
                node = node.nextSibling;
            } while (node && Number(node.nodeType) !== 1);
            return node;
        },

        force_ie_repaint : function () {
            // IE7 needs a forced repaint.
            if (document.body.className.indexOf('ie7') !== -1) {
                var mc = document.getElementById('middle-column');
                if (!mc) {
                    // Used on other pages.
                    return;
                }
                if (mc.className.indexOf('evilfrog') === -1) {
                    mc.className += " evilfrog";
                } else {
                    mc.className = mc.className.replace(' evilfrog','');
                }
            }
        },

        /*
         * Is the passed object an array.
         * http://www.breakingpar.com/bkp/home.nsf/0/87256B280015193F87256C720080D723
         * @param obj object object to be checked
         * @return bool
         */
        is_array: function(obj) {
            if (!obj.constructor || obj.constructor.toString().indexOf("Array") === -1) {
                return false;
            }

            return true;
        },

        /**
         * This function open the transcript window. It is called from stage1.xsl.
         * @param url The url of the transcript window
         */
        open_transcript : function(url) {
            window.open(url,'transcript','width=450,height=550,location=yes,status=yes,resizable=yes,scrollbars=yes');
            return false;
        },

        build_focusable_list : function(list, element) {
            // Exclude items that are invisible or disabled.
            if (element.style.visibility.toLowerCase() === 'hidden' ||
                element.style.display.toLowerCase() === 'none' ||
                element.offsetWidth == 0 ||
                (typeof element.disabled !== 'undefined' && element.disabled)) {
                return;
            }

            // Tabindex check: see
            // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
            var attr = element.getAttributeNode("tabindex");
            var specifiedTabIndex = attr ? attr.specified : false;

            // Include elements with manually specified tabindex; links; form controls.
            if (specifiedTabIndex ||
                (element.nodeName.toLowerCase() === 'a' && typeof element.href !== 'undefined' && element.href) ||
                (element.nodeName.toLowerCase() === 'input' && element.type.toLowerCase() !== 'hidden') ||
                (element.nodeName.toLowerCase() === 'textarea')) {
                list[list.length] = element;
            }

            // Do children.
            for (var child = element.firstChild; child !== null; child = child.nextSibling) {
                if (child.nodeType === 1) {
                    this.build_focusable_list(list, child);
                }
            }
        },

        toggle_choice_answers : function(id) {
            my_div = document.getElementById(id);
            my_div.style.display = "block";
        },

        /**
         * Update the status of the reveal button for single/multiple-choice questions.
         * @param {object} node the YUI node of the oucontent-matching-container div.
         */
        update_reveal_button : function(node) {
            var checkboxes = node.all('input[type=checkbox]');
            var revealbutton = node.one('input[name=revealbutton]');
            checkboxes.each(function(checkbox) {
                checkbox.on('click', function() {
                    var ischecked = false;
                    for (var i = 0; i < checkboxes.size(); i++) {
                        if (checkboxes.item(i).get('checked')) {
                            ischecked = true;
                        }
                    }
                    if (ischecked) {
                        // Disable the reveal button if there is any answer has been selected.
                        revealbutton.set('disabled', true);
                    } else {
                        revealbutton.set('disabled', false);
                    }
                }, checkbox);
            }, this);
        },

        reveal_choice_answer : function(formid, correctanswers) {
            //  Get the form.
            thisform = document.getElementById("form" + formid);
            var groupname = 'choice' + formid;

            //  Uncheck all.
            var grouplength = thisform[groupname].length - 1;
            if (grouplength) {
                for (i = grouplength; i > -1; i--) {
                    thisform[groupname][i].checked = 0;
                    thisform[groupname][i].disabled = 1;
                }
            } else {
                thisform[groupname].checked = 0;
                thisform[groupname].disabled = 1;
            }

            //  Check if we only have one element.
            if (thisform[groupname].id) {
                //  Check if the input we have is the right answer.
                if (correctanswers) {
                    if (correctanswers !== '') {
                        thisform[groupname].checked = 1;
                    }
                    thisform.answerbutton.onclick();
                    thisform.answerbutton.disabled = true;
                    if (thisform.revealbutton) {
                        thisform.revealbutton.disabled = true;
                    }
                }
            } else {
                //  Check if the input we have is the right answer.
                if (correctanswers) {
                    var cor_len = correctanswers.length - 1;
                    for (i = cor_len; i > -1; i--) {
                        thisform[groupname][correctanswers[i] - 1].checked = 1;
                    }
                    thisform.answerbutton.disabled = true;
                    if (thisform.revealbutton) {
                        thisform.revealbutton.disabled = true;
                    }
                    thisform.answerbutton.onclick();
                }
            }
            // Hide the oucontent-choice-feedback div after clicking the reveal button.
            Y.one(thisform).one('.oucontent-choice-feedback').setStyle('display', 'none');
            M.mod_oucontent.force_ie_repaint();

            return false;
        },

        /**
         * This function open a new window. It is called from stage1.xsl.
         * @param a The link node of the new window
         */
        open_new_window : function(a) {
            window.open(a.href,'_blank');
            return false;
        },

        process_single_choice : function(formid, answerid, correctanswer, feedback) {
            var choice = -1;
            var i = 0;
            thisform = document.getElementById("form" + formid);
            var groupname = 'choice' + formid;

            var grouplength = thisform[groupname].length - 1;
            for (i = grouplength; i > -1; i--) {
                if (thisform[groupname][i].checked) {
                    choice = i + 1;
                    i = -1;
                }
            }

            for (i = grouplength; i > -1; i--) {
                feedbackdiv = document.getElementById(feedback[i]);
                if (feedbackdiv) {
                    feedbackdiv.style.display = "none";
                }
            }

            my_div = document.getElementById(answerid);

            // If this was not a mouse action (the last mouse action was > 250ms ago)
            // then change focus to help screenreader.
            if (new Date().getTime() - thisform.lastmouseaction > 250) {
                window.location.hash = answerid;
            }

            var array = [];
            array = M.mod_oucontent.find_print_answer_discussion(thisform.parentNode);

            var answer_tag = array[1];
            var discussion_tag = array[2];

            if (choice !== -1) {
                if (choice === Number(correctanswer)) {
                    my_div.innerHTML = "<p>" + '<img src="'
                        + M.mod_oucontent.pix.rightanswer + '" class="right-answer" alt="" />'
                        + M.mod_oucontent.jsstrings.interaction_correct + "</p>";
                    if (answer_tag) {
                        answer_tag.style.display = 'block';
                    }
                    if (discussion_tag) {
                        discussion_tag.style.display = 'block';
                    }
                    // Disable the reveal button on correct answer.
                    thisform.revealbutton.disabled = true;
                } else {
                    my_div.innerHTML = "<p>" + '<img src="' +
                        M.mod_oucontent.pix.wronganswer + '" class="wrong-answer" alt="" />' +
                        M.mod_oucontent.jsstrings.interaction_not_correct  + " " +
                        M.mod_oucontent.jsstrings.interaction_try_again + "</p>";
                    if (answer_tag) {
                        answer_tag.style.display = 'none';
                    }
                    if (discussion_tag) {
                        discussion_tag.style.display = 'none';
                    }
                    // Enable the reveal button on wrong answer.
                    thisform.revealbutton.disabled = false;
                }
                feedbackdiv = document.getElementById(feedback[choice - 1]);
                if (feedbackdiv) {
                    feedbackdiv.style.display = "block";
                }
            } else {
                my_div.innerHTML = "<p><strong>" +
                    '<img src="' + M.mod_oucontent.pix.invalidinput + '" class="invalid-input" alt="" />' +
                    M.mod_oucontent.jsstrings.interaction_please_choose_one + "</strong></p>";
            }
            my_div.style.display = 'block';
            M.mod_oucontent.force_ie_repaint();
        },

        process_multiple_choice : function(formid, answerid, correctanswers, feedback) {
            thisform = document.getElementById("form" + formid);
            var groupname = 'choice' + formid;
            var choices = [];

            //  Check if we only have one element (shouldn't happen, but it's only a minor
            //  change to be able to handle only one input!).
            if (thisform[groupname].id) {
                if (thisform[groupname].checked) {
                    choices[0] = 1;
                }
                feedbackdiv = document.getElementById(feedback[0]);
                if (feedbackdiv) {
                    feedbackdiv.style.display = "none";
                }
            } else {
                var grouplength = thisform[groupname].length - 1;
                for (i = grouplength; i > -1; i--) {
                    if (thisform[groupname][i].checked) {
                        choices[choices.length] = i + 1;
                    }
                    feedbackdiv = document.getElementById(feedback[i]);
                    if (feedbackdiv) {
                        feedbackdiv.style.display = "none";
                    }
                }
            }

            var choiceslength = choices.length;
            var correctlength = correctanswers.length;

            my_div = document.getElementById(answerid);

            var array = [];
            array = M.mod_oucontent.find_print_answer_discussion(thisform.parentNode);

            var answer_tag = array[1];
            var discussion_tag = array[2];

            //  Hide the answer and discussion.
            if (answer_tag) {
                answer_tag.style.display = 'none';
            }

            if (discussion_tag) {
                discussion_tag.style.display = 'none';
            }

            //  First thing we want to do is if no choices selected, but no right choices
            //  say the user is correct!
            var msg = '';
            if (choiceslength === 0 && correctlength === 0) {
                msg = "<p>" + '<img src="' + M.mod_oucontent.pix.rightanswer +
                    '" alt="" class="right-answer" />' + M.mod_oucontent.jsstrings.interaction_correct +
                    "</p>";
                my_div.innerHTML = msg;
                my_div.style.display = "block";
                M.mod_oucontent.force_ie_repaint();
                if (answer_tag) {
                    answer_tag.style.display = 'block';
                }
                if (discussion_tag) {
                    discussion_tag.style.display = 'block';
                }
                my_div.style.display = 'block';
                return false;
            }

            if (choiceslength > 0) {
                //  Now we need to loop through all the answers and make sure we have all of
                //  them correct.
                var correct = 0;
                for (i = correctlength - 1; i > -1; i--) {
                    for (y = choiceslength - 1; y > -1; y--) {
                        if (choices[y] === Number(correctanswers[i])) {
                            correct += 1;
                        }
                    }
                }

                msg = "<p>";
                var incorrect = choiceslength - correct;

                if (correct === correctlength && incorrect === 0) {
                    msg += '<img src="' + M.mod_oucontent.pix.rightanswer +
                        '" alt="" class="right-answer" />' +
                        M.mod_oucontent.jsstrings.interaction_correct;
                    //  Show the answer and discussion
                    if (answer_tag) {
                        answer_tag.style.display = 'block';
                    }
                    if (discussion_tag) {
                        discussion_tag.style.display = 'block';
                    }
                } else {
                    msg += '<img src="' + M.mod_oucontent.pix.retry + '" alt="" class="retry" />';
                    if (correct === 0 && incorrect === 1) {
                        msg += M.mod_oucontent.jsstrings.interaction_wrong_singular;
                    } else if (correct === 0 && incorrect !== 1) {
                        msg += M.mod_oucontent.jsstrings.interaction_wrong_plural;
                    } else if (correct === 1 && incorrect === 0) {
                        msg += M.mod_oucontent.jsstrings.interaction_correct_incomplete_singular;
                    } else if (correct !== 1 && incorrect === 0) {
                        msg += M.mod_oucontent.jsstrings.interaction_correct_incomplete_plural;
                    }
                    else if (correct === 1 && incorrect === 1) {
                        msg += M.mod_oucontent.jsstrings.interaction_correct_wrong_singular_singular;
                    } else if (correct !== 1 && incorrect === 1) {
                        msg += M.mod_oucontent.jsstrings.interaction_correct_wrong_plural_singular;
                    } else if (correct === 1 && incorrect !== 1) {
                        msg += M.mod_oucontent.jsstrings.interaction_correct_wrong_singular_plural;
                    } else if (correct !== 1 && incorrect !== 1) {
                        msg += M.mod_oucontent.jsstrings.interaction_correct_wrong_plural_plural;
                    }
                    msg += " " + M.mod_oucontent.jsstrings.interaction_try_again;
                    msg = msg.replace("#1", "<b>" + correct + "</b>");
                    msg = msg.replace("#2", "<b>" + incorrect + "</b>");
                }

                msg += "</p>";
                my_div.innerHTML = msg;

                //  Now loop through all the choices and show feedback.
                for (y = choiceslength - 1; y > -1; y--) {
                    choiceval = choices[y] - 1;
                    feedbackdiv = document.getElementById(feedback[choiceval]);
                    if (feedbackdiv) {
                        feedbackdiv.style.display = "block";
                    }
                }
            } else {
                my_div.innerHTML = "<p><b>" +
                    '<img src="' + M.mod_oucontent.pix.invalidinput +
                    '" alt="" class="invalid-input" />' +
                    M.mod_oucontent.jsstrings.interaction_please_choose_n + "</b></p>";
            }
            my_div.style.display = 'block';
            M.mod_oucontent.force_ie_repaint();
        },

        find_print_answer_discussion : function(container) {
            var answer = null;
            var discussion = null;
            var print = null;
            var n = null;

            //  Get the next sibling that isn't an empty text element!
            n = container;
            do {
                n = n.nextSibling;
            } while (n && n.nodeType !== 1);

            //  Check to see if the next sibling is print.
            if (n && M.mod_oucontent.is_print_node(n)) {
                print = n;

                //  If we have a print node check if the next sibling is a answer node.
                n = print;
                do {
                    n = n.nextSibling;
                } while (n && n.nodeType !== 1);

                if (n && M.mod_oucontent.is_answer_node(n)) {
                    answer = n;

                    //  Get the next node and see if it's a discussion.
                    n = answer;
                    do {
                        n = n.nextSibling;
                    } while (n && n.nodeType !== 1);

                    if (n && M.mod_oucontent.is_discussion_node(n)) {
                        discussion = n;
                    }
                } else if (n && M.mod_oucontent.is_discussion_node(n)) {
                    //  If we have a print node but no answer node, check if the next sibling is a discussion node.
                    discussion = n;
                }
            } else if (n && M.mod_oucontent.is_answer_node(n)) {
                //  If it's not print check to see if it's an answer.
                answer = n;

                //  Get the next node and see if it's a discussion.
                n = answer;
                do {
                    n = n.nextSibling;
                } while (n && n.nodeType !== 1);

                if (n && M.mod_oucontent.is_discussion_node(n)) {
                    discussion = n;
                }
            } else if (n && M.mod_oucontent.is_discussion_node(n)) {
                //  If it's not print and not answer check to see if it's a discussion.
                discussion = n;
            }

            return [print,answer,discussion];
        },

        is_print_node : function(node) {
            return node.className === 'oucontent-interaction-print';
        },

        is_discussion_node : function(node) {
            return node.className === 'oucontent-saq-interactivediscussion';
        },

        is_answer_node : function(node) {
            return node.className === 'oucontent-saq-interactiveanswer';
        },

        show_flash : function(id, file, width, height, vars, sesskey, userid,
                              activityid, itemid, courseid, preview) {
            if (this.flashinstalled === -99 ) {
                this.flashinstalled = PluginDetect.isMinVersion('Flash', 9) == 1;
            }
            if (!this.flashinstalled) {
                Y.one('#' + id).get('firstChild').setStyle('display', 'block');
                return;
            }
            var params = {};
            if (vars) {
                var array = vars.split('%%SPLIT%%');
                for (var i = 0; i < array.length; i++) {
                    var nameval = this.split_once(array[i], '=');
                    params[nameval[0]] = nameval[1];
                }
            }
            params._s = sesskey;
            params._u = userid;
            if (activityid) {
                params._a = activityid;
            }
            if (itemid) {
                params._i = itemid;
            }
            if (courseid) {
                params._c = courseid;
            }
            if (preview) {
                params._p = preview;
            }
            var embedsettings = {version: "9",
                fixedAttributes:
                    { allowScriptAccess : "always", allowNetworking : "all", wmode : "transparent" },
                flashVars:
                params
            };
            Y.one('#' + id).setStyle('width', width + 'px');
            Y.one('#' + id).setStyle('height', height + 'px');
            // If it is a zip file, get the swf version of the file
            if ((file).match(/.zip\/index.(html|xhtml)$/)) {
                // only replace the last .zip found in the file name
                file = file.replace(new RegExp('.zip\/index.(html|xhtml)$'), '.swf');
            }

            var classes = Y.one('body').get('className');
            if (/ ie(1[123456789]|[23456789][0123456789])/.test(classes)) {
                // For IE11 to IE99, don't use Y.SWF as it is currently broken.
                var flashvars = '';
                for (var name in params) {
                    if (flashvars != '') {
                        flashvars += '&';
                    }
                    flashvars += Y.Escape.html(name) + '=' + Y.Escape.html(encodeURIComponent(params[name]));
                }
                var htmlstring = '<object type="application/x-shockwave-flash" data="' +
                    Y.Escape.html(file) +
                    '" width="100%" height="100%"><param name="quality" value="high" />' +
                    '<param name="flashvars" value="' + flashvars + '" />' +
                    '<param name="allowscriptaccess" value="always" />' +
                    '<param name="allownetworking" value="all" />' +
                    '<param name="allowfullscreen" value="true" />' +
                    '<param name="wmode" value="transparent" />' +
                    '</object>';
                Y.one('#' + id).set('innerHTML', htmlstring);
            } else {
                new Y.SWF("#" + id, file, embedsettings);
            }
        },

        show_html : function(id, file, width, height, vars, sesskey, userid,
                             activityid, itemid, courseid, preview, allowguests) {

            var querystring = '?_s=' + sesskey + '&_u=' + userid;
            if (this.isguest) {
                if (allowguests) {
                    querystring += '&_nosave=y';
                } else {
                    require(['core/templates'], function(templates) {
                        var context = {};
                        if (M.mod_oucontent.jsstrings.hasOwnProperty('guestmessagehtmlactivity')) {
                            context = {
                                'message' : M.mod_oucontent.jsstrings.guestmessagehtmlactivity,
                                'url' : M.cfg.wwwroot + '/auth/sams_soap/login.php?URL=' + window.location.href
                            };
                        }
                        templates.render('mod_oucontent/guestmessage', context).then(function (html, js) {
                            templates.appendNodeContents('#' + id, html, js);
                        });
                    });
                    return;
                }
            }
            var htmliframe = Y.Node.create(
                '<iframe class="oucontent-html-activity" frameBorder="0" scrolling="no" allowfullscreen=""/>');
            if (activityid) {
                querystring += '&_a=' + activityid;
                // Set iframe name to activity id if specified (makes testing easier).
                htmliframe.setAttribute('name', activityid + '_iframe');
            }
            if (itemid) {
                querystring += '&_i=' + itemid;
            }
            if (courseid) {
                querystring += '&_c=' + courseid;
            }
            if (preview) {
                querystring += '&_p=' + preview;
            }
            if (vars) {
                var array = vars.split('%%SPLIT%%');
                for (var i = 0; i < array.length; i++) {
                    var nameval = this.split_once(array[i], '=');
                    querystring += '&' + nameval[0] + '=' + encodeURIComponent(nameval[1]);
                }
            }

            htmliframe.setAttribute("src", file + querystring);
            if (width !== '*') {
                htmliframe.setAttribute("width", width);
            } else {
                htmliframe.setAttribute("width", "100%");
            }
            htmliframe.setAttribute("height", height);
            // This is only needed for IE so that it inherits the background colour.
            htmliframe.setAttribute('allowtransparency', 'true');
            var iframediv = Y.one('#' + id);
            iframediv.insert(htmliframe, 'after');
        },

        show_java : function(id, java, width, height, appletclass, javavars) {
            if (this.javainstalled === -99 ) {
                this.javainstalled = PluginDetect.isMinVersion(
                    'Java', 1.5, 'plugindetect.getjavainfo.jar', [0, 2, 0]) == 1;
            }
            if (!this.javainstalled) {
                Y.one('#' + id).get('firstChild').setStyle('display', 'block');
                return;
            }

            var newApplet = document.createElement("applet");
            newApplet.code = appletclass;
            newApplet.archive = java;
            newApplet.width = width;
            newApplet.height = height;
            // Not directly tabbable.
            newApplet.tabIndex = -1;
            newApplet.mayScript = true;
            newApplet.id = "oucontentJava" + (this.nextappletid++);
            // In case applet supports the focushack system, we
            // pass in its id as a parameter.
            javavars[javavars.length] = 'focushackid';
            javavars[javavars.length] = newApplet.id;
            for (var i = 0; i < javavars.length; i += 2) {
                var param = document.createElement('param');
                param.name = javavars[i];
                param.value = javavars[i + 1];
                newApplet.appendChild(param);
            }
            var warningDiv = document.getElementById(id);
            warningDiv.style.display = "none";
            newApplet.warningDiv = warningDiv;
            newApplet.warningDiv.parentNode.insertBefore(newApplet, warningDiv);
        },

        show_openmark : function (id, omquestion, width, height) {
            if (!document.getElementById("mobileviewpage")) {
                var minwidth = "1050px";
                if (document.getElementById("page")) {
                    document.getElementById("page").style.minWidth = minwidth;
                } else if (document.getElementById("wrapper")) {
                    document.getElementById("wrapper").style.minWidth = minwidth;
                }
            }
            var newIframe = document.createElement("iframe");
            newIframe.setAttribute("src", omquestion + '/?autofocus=off');
            newIframe.setAttribute("width", width + 20);
            newIframe.setAttribute("height", height + 41);
            newIframe.frameBorder = 0;
            newIframe.className = "oucontent-omquestion";
            var my_div = document.getElementById(id);
            my_div.style.display = "none";
            my_div.parentNode.insertBefore(newIframe, my_div);
        },

        /**
         * This function only splits the passing in string argument once using the delimiter.
         * @param {string} str the string to be splitted
         * @param {string} delim Specifies the character to use for separating the string
         * @return {Array} A array containing the two resultant substrings. If not found, the array
         * contains one element consisting of the entire passing in string.
         */
        split_once : function (str, delimiter) {
            var components = str.split(delimiter);
            var result = [components.shift()];
            if (components.length) {
                result.push(components.join(delimiter));
            }
            return result;
        },

        // functions to handle single or multiple export of references
        refs_export_selected : function() {
            var url = 'referenceexport.php?';
            // gets the 'id=...' or 'preview=...' parameter from the current URL
            var argstr = location.search.substring(1, location.search.length);
            var args = argstr.split('&');
            // add 'id=...' or 'preview=...' parameter to redirect URL for exporting references
            url = url + args[0];
            var checksfound = false;
            var boxes = document.getElementsByName("refboxes");
            var referencesstr = '';
            for (i = 0; i < boxes.length; i++) {
                if (boxes[i].checked) {
                    checksfound = true;
                    referencesstr = referencesstr + boxes[i].value;
                }
            }
            if (checksfound) {
                url = url + '&references=' + referencesstr;
                to = url.length;
                url = url.substr(0, (to - 1));
                window.location.href = url;
            }
        },

        refs_select_all : function () {
            var boxes = document.getElementsByName("refboxes");
            for (i = 0; i < boxes.length; i++) {
                boxes[i].checked = true;
            }
            // make call to refs_update_buttons to enable 'export references' and disable 'select all'
            M.mod_oucontent.refs_update_buttons();
        },

        refs_update_buttons : function() {
            var foundcount = 0;
            var boxes = document.getElementsByName("refboxes");
            // if export check boxes found display export buttons
            if (boxes.length !== 0) {
                // check to see how many boxes checked
                var numboxes = boxes.length;
                for (i = 0; i < boxes.length; i++) {
                    if (boxes[i].checked) {
                        foundcount++;
                    }
                }
                // check to see whether 'export selected references' button should be enabled/disabled
                if (foundcount > 0) {
                    // enable export selected references button
                    document.getElementById("exportselectedrefs").disabled = false;
                } else {
                    if (foundcount === 0) {
                        // disable export selected references button
                        document.getElementById("exportselectedrefs").disabled = true;
                    }
                }
                // check to see whether 'select all' button should be enabled/disabled
                if (numboxes === foundcount) {
                    // all boxes checked so disable select all button
                    document.getElementById("selectall").disabled = true;
                } else {
                    // some/all boxes unchecked so enable select all button
                    document.getElementById("selectall").disabled = false;
                }
            }
        },

        // This object only contains the function called by Java applets directly.
        javaapplet : {
            applet_load : function(id) {
                var t = this;
                var applet = document.getElementById(id);
                var appletnode = Y.one(applet);

                // These autofocus divs before and after the applet allow focus
                // to be correctly moved to the front/back end of the applet's
                // controls when the user tabs.
                var beforeFocus = document.createElement('div');
                beforeFocus.tabIndex = 0;
                beforeFocus.className = 'oucontentJavaAutofocusBefore';
                beforeFocus.onfocus = function() {
                    t.scroll_into_view(appletnode);
                    applet.initFocus(false);
                };
                applet.parentNode.insertBefore(beforeFocus, applet);

                var afterFocus = document.createElement('div');
                afterFocus.tabIndex = 0;
                afterFocus.className = 'oucontentJavaAutofocusAfter';
                afterFocus.onfocus = function() {
                    t.scroll_into_view(appletnode);
                    applet.initFocus(true);
                };
                applet.parentNode.insertBefore(afterFocus, applet.warningDiv);

                // After all applets are loaded, focus the window to deal with bug
                this.loadedapplets++;
                if (this.loadedapplets === this.nextappletid - 1) {
                    this.loadedapplets = -1;
                    setTimeout(function() { window.focus(); }, 100);
                }
            },
            // If the element is not fully in view, scroll so that it is.
            scroll_into_view : function(target) {
                var region;
                var y;
                var height;
                region = target.get('region');
                y = Y.DOM.docScrollY();
                height = Y.DOM.winHeight();
                if (y + height < region.bottom) {
                    window.scroll(0, region.bottom - height);
                } else if (y > region.top) {
                    window.scroll(0, region.top);
                }
            },
            applet_ditch_focus : function (id, forward) {
                // Get the applet.
                var applet = document.getElementById(id);

                // Get list of everything that can be focused.
                var allFocusable = [];
                M.mod_oucontent.build_focusable_list(allFocusable, document.documentElement);

                // Find applet on list.
                var found = -1;
                for (var i = 0; i < allFocusable.length; i++) {
                    if (allFocusable[i] === applet) {
                        found = i;
                        break;
                    }
                }
                if (found === -1) {
                    return;
                }

                // Move to next/previous thing.
                if (forward) {
                    // Including skipping the special autofocus div.
                    found += 2;
                    if (found === allFocusable.length) {
                        found = 0;
                    }
                } else {
                    // Again skip the 'before' focus div.
                    found -= 2;
                    if (found < 0) {
                        found = allFocusable.length - 1;
                    }
                }
                var x = allFocusable[found];
                setTimeout(function(){ x.focus(); }, 0);
            }
        },

        // This object contains all the functions used by the alternative formats.
        altformats : {
            init : function() {
                var divs;
                var div;
                divs = Y.all('div.oucontent-alternatives');
                if (divs.size() !== 1) {
                    return;
                } else {
                    div = divs.item(0);
                }
                var heading = Y.one('div.oucontent-alternatives h3');
                var a = Y.Node.create('<a class="oucontent-alternatives-switch" alt="" href="#"> </a>');
                var img = Y.Node.create('<img src="' + M.mod_oucontent.pix.switch_plus + '" alt="" />');
                a.appendChild(img);
                a.appendChild(document.createTextNode(' '));
                a.altcontent = div.one('.oucontent-altcontent');
                a.img = img;
                a.showing = false;
                var span = Y.Node.create('<span/>');
                a.appendChild(span);

                var child = heading.get('firstChild');
                heading.removeChild(child);
                span.appendChild(child);
                heading.appendChild(a);
                a.on('click', function(e) {
                    e.preventDefault();
                    var altcontent = this.altcontent;
                    if (!this.showing) {
                        this.img.set('src', this.img.get('src').replace(/_plus/, '_minus'));
                        altcontent.setStyle('display', 'block');
                        var desiredHeight = Math.ceil(Number(altcontent.getComputedStyle('height').replace('px', '')));
                        altcontent.setStyle('maxHeight', '0');
                        altcontent.setStyle('opacity', 0);

                        altcontent.transition({
                            easing: 'ease',
                            duration: 0.5,
                            opacity: 1.0,
                            maxHeight: desiredHeight + 'px'
                        }, function() {
                            altcontent.setStyle('maxHeight', 'none');
                        });
                        this.showing = true;
                    } else {
                        this.img.set('src', this.img.get('src').replace(/_minus/, '_plus'));
                        var currentHeight = Math.ceil(Number(altcontent.getComputedStyle('height').replace('px', '')));
                        altcontent.setStyle('maxHeight', currentHeight + 'px');
                        altcontent.transition({
                            easing: 'ease',
                            duration: 0.5,
                            opacity: 0.0,
                            maxHeight: 0
                        }, function() {
                            altcontent.setStyle('display', 'none');
                            altcontent.setStyle('maxHeight', 'none');
                        });
                        this.showing = false;
                    }
                }, a);
            }
        },

        // This object contains all the functions used by the free text response activities.
        freeresponse : {
            init : function () {
                if (M.mod_oucontent.altformatsextra && !M.mod_oucontent.altformatsextra.isLocalStorageAvailable()) {
                    return;
                }

                var forms = document.getElementsByTagName("form");
                for (var i = 0; i < forms.length; i++) {
                    var form = forms[i];
                    // See if this form matches the right class.
                    if (form.className.indexOf('oucontent-freeresponse') !== -1) {
                        M.mod_oucontent.freeresponse.init_one(form);
                        M.mod_oucontent.responseforms.push(form);
                    } else if (form.className.indexOf("oucontent-buttons-freeresponse-cell") !== -1) {
                        M.mod_oucontent.freeresponse.init_buttons(form);
                        M.mod_oucontent.responseforms.push(form);
                    } else if (form.className.indexOf('oucontent-cellfreeresponse') !== -1) {
                        M.mod_oucontent.freeresponse.init_cell(form);
                    }
                }
            },

            init_buttons : function (form) {
                form.tableId = form.elements['tableid'].value;
                if (!M.mod_oucontent.altformatsextra) {
                    var waitdiv = Y.one('#cellwait' + form.tableId);
                    var img = Y.Node.create('<img src="' + M.util.image_url("ajaxloader.bluebg", "mod_oucontent") +
                        '" alt="" style="display:none" width="16" height="16" id="cellwaitimage' + form.tableId + '" />');
                    waitdiv.appendChild(img);
                }
                form.waitIcon = document.getElementById('cellwaitimage' + form.tableId);
                form.fieldSubmitS = form.elements['submit_group'];
                form.onsubmit = function() {
                    return M.mod_oucontent.freeresponse.submit_cell(form);
                };
                Y.one(form.elements['submit_group_reset']).on('click', function(e) {
                    e.preventDefault();
                    M.mod_oucontent.freeresponse.reset_cell(form);
                });

                // Grey out the save button until they type something.
                M.mod_oucontent.freeresponse.changed_cell(form);
            },

            init_one : function (form) {
                // Set up basic data regarding form elements.
                form.freeResponse = form.getAttribute('id');
                form.waitIcon = document.getElementById('freeresponsewait_' +
                    form.freeResponse);
                form.fieldContent = form.elements['content'];
                form.fieldSubmitS = form.elements['submit_s'];
                form.fieldSubmitR = form.elements['submit_r'];
                form.fieldSubmitReset = form.elements['submit_reset'];
                form.fieldDefaultValue = form.elements['defaultvalue'];
                form.gotValue = form.elements['gotvalue'].value == 1 ? true : false;
                form.divContent = document.getElementById('responsebox_' + form.freeResponse + 'editable');
                form.fieldSize = form.elements['size'].value;
                form.fieldItemId = form.elements['itemid'].value;

                if (M.mod_oucontent.altformatsextra) {
                    M.mod_oucontent.altformatsextra.initFreeResponse(form);
                }

                // Get textarea value (if Atto)
                var textareaname = '#responsebox_' + form.freeResponse;

                // Firefox: turn off spellchecking by default if the field is not English
                // (this is a hack and we need to stop doing it if they ever fix Firefox
                // bug 338427).
                if (form.fieldContent.lang && form.fieldContent.lang.indexOf('en') !== 0) {
                    form.fieldContent.setAttribute('spellcheck','false');
                }

                if (typeof(form.elements['id']) == 'object') {
                    form.documentIdentifier = "id=" + form.elements['id'].value;
                } else {
                    form.documentIdentifier = "preview=" + form.elements['preview'].value;
                }

                // Set change and submit handlers.
                form.fieldContent.onkeyup = function() {
                    M.mod_oucontent.freeresponse.changed(form);
                };
                Y.one(textareaname).on('change', function () {
                    M.mod_oucontent.freeresponse.changed(form);
                });
                Y.one(form.fieldSubmitReset).on('click', function(e) {
                    e.preventDefault();

                    // Get data for AJAX request.
                    var postData = form.documentIdentifier +
                        "&ajax=1&freeresponse=" + form.freeResponse + "&content=" +
                        encodeURIComponent(form.fieldContent.value) + "&sizetype=" + form.fieldSize +
                        "&itemid=" + form.fieldItemId + "&submit_reset=" + form.fieldSubmitReset.value;
                    // Grey out the set button again.
                    form.previousOriginal = form.originalValue;
                    form.fieldContent.value = form.defaultValue;
                    form.originalValue = form.fieldContent.value;
                    M.mod_oucontent.freeresponse.changed(form);

                    if (M.mod_oucontent.altformatsextra) {
                        M.mod_oucontent.altformatsextra.resetFreeResponse(form);
                    } else {
                        // Enable the progress image.
                        form.waitIcon.style.display = 'inline';
                        var cfg = {
                            method: 'POST',
                            data: postData,
                            on: {
                                success: function (id, t) {
                                    // Is it really success?
                                    if (t.responseText !== 'ok') {
                                        cfg.on.failure();
                                        return;
                                    }
                                    // Hide wait icon and update display if any.
                                    M.mod_oucontent.freeresponse.update_display(form);
                                    // For update word count.
                                    M.mod_oucontent.freeresponse.updateWordCount('responsebox_' + form.getAttribute('id'), false);
                                    form.waitIcon.style.display = 'none';
                                },
                                failure: function () {
                                    // Hide wait icon.
                                    form.waitIcon.style.display = 'none';
                                    form.originalValue = form.previousOriginal;
                                    M.mod_oucontent.freeresponse.changed(form);
                                    // Display error.
                                    window.alert('There was an error reseting your entry.');
                                }
                            }
                        };
                        Y.io(form.action, cfg);
                    }
                    if (form.divContent) {
                        Y.one(textareaname + 'editable').setHTML(form.defaultValue);
                    }
                });

                form.fieldContent.onkeypress = form.fieldContent.onkeyup;
                form.onsubmit = function() {
                    return M.mod_oucontent.freeresponse.submit(form);
                };

                // Go find Answer and Discussion if any.
                form.answer = null;
                form.discussion = null;
                var first = M.mod_oucontent.next_sibling(form.parentNode),
                    second = first ? M.mod_oucontent.next_sibling(first) : null,
                    third = second ? M.mod_oucontent.next_sibling(second) : null;
                if (second && M.mod_oucontent.is_answer_node(second)) {
                    form.answer = second;
                    if (third && M.mod_oucontent.is_discussion_node(third)) {
                        form.discussion = third;
                    }
                } else if (second && M.mod_oucontent.is_discussion_node(second)) {
                    form.discussion = second;
                }
                if (form.gotValue) {
                    // We already have a value, show the answer box etc.
                    M.mod_oucontent.freeresponse.show(form, true);
                } else {
                    M.mod_oucontent.freeresponse.show(form, false);
                }

                // Remember the original value.
                if (form.divContent)  {
                    form.originalValue = form.fieldContent.value.toString();
                    form.defaultValue = form.fieldDefaultValue.value.toString();

                    var div = document.createElement('div');
                    document.body.appendChild(div);
                    div.innerHTML = form.originalValue;
                    form.originalValue = div.innerHTML;
                    div.innerHTML = form.defaultValue;
                    form.defaultValue = div.innerHTML;
                    document.body.removeChild(div);
                } else {
                    form.originalValue = form.fieldContent.value.toString();
                    form.defaultValue = form.fieldDefaultValue.value.toString();
                }
                // Grey out the save button until they type something.
                M.mod_oucontent.freeresponse.changed(form);
            },

            init_cell : function (form) {
                // Set up basic data regarding form elements.
                form.freeResponse = form.getAttribute('id');
                form.fieldContent = form.elements['content'];
                form.fieldDefaultValue = form.elements['defaultvalue'];
                form.gotValue = form.elements['gotvalue'].value == 1 ? true : false;
                form.divContent = document.getElementById('responsebox_' + form.freeResponse + 'editable');
                form.fieldSize = form.elements['size'].value;
                form.tableId = form.elements['tableid'].value;

                if (M.mod_oucontent.altformatsextra) {
                    M.mod_oucontent.altformatsextra.initFreeResponse(form);
                }

                // Get textarea value (if Atto)
                var textareaname = '#responsebox_' + form.freeResponse;

                // Firefox: turn off spellchecking by default if the field is not English
                // (this is a hack and we need to stop doing it if they ever fix Firefox
                // bug 338427).
                if (form.fieldContent.lang && form.fieldContent.lang.indexOf('en') !== 0) {
                    form.fieldContent.setAttribute('spellcheck','false');
                }

                if (typeof(form.elements['id']) === 'object') {
                    form.documentIdentifier = "id=" + form.elements['id'].value;
                } else {
                    form.documentIdentifier = "preview=" + form.elements['preview'].value;
                }

                // Set change and submit handlers.
                Y.one(form.fieldContent).on('valuechange', function () {
                    M.mod_oucontent.freeresponse.changed_cell(form);
                });
                // This duplicate handler is necessary because otherwise, when
                // changing Atto editor, it doesn't get called until you tab out.
                Y.one(textareaname).on('change', function () {
                    M.mod_oucontent.freeresponse.changed_cell(form);
                });

                form.onsubmit = function() {
                    return M.mod_oucontent.freeresponse.submit_cell(form);
                };

                // Remember the original value.
                form.originalValue = form.fieldContent.value.toString();
                form.defaultValue = form.fieldDefaultValue.value.toString();
            },

            changed : function(form) {
                var unchanged = form.fieldContent.value === form.originalValue;
                var isdefault = form.fieldContent.value === form.defaultValue;
                form.fieldSubmitS.disabled = unchanged;
                if (form.fieldSubmitR) {
                    form.fieldSubmitR.disabled = unchanged;
                }
                form.fieldSubmitReset.disabled = isdefault;
            },

            changed_cell : function(form) {
                var groupunchanged = true;
                var groupisdefault = true;

                Y.all('form.oucontent-cellfreeresponse').each(function(singleformy) {
                    var singleform = singleformy.getDOMNode();
                    if (singleform.tableId === form.tableId) {
                        var contentvalue = singleform.fieldContent.value;
                        // Fix for atto editor default text.
                        if (contentvalue === '<p><br></p>') {
                            contentvalue = '';
                        }

                        var unchanged = contentvalue === singleform.originalValue;
                        var isdefault = contentvalue === singleform.defaultValue;
                        if (!unchanged) {
                            groupunchanged = false;
                        }
                        if (!isdefault) {
                            groupisdefault = false;
                        }
                    }
                });
                Y.all('form.oucontent-buttons-freeresponse-cell').each(function(buttonsformy) {
                    var buttonsform = buttonsformy.getDOMNode();
                    if (buttonsform.tableId === form.tableId) {
                        buttonsform.GroupSubmitButton = buttonsform.elements['submit_group'];
                        buttonsform.GroupResetButton = buttonsform.elements['submit_group_reset'];
                        buttonsform.GroupSubmitButton.disabled = groupunchanged;
                        buttonsform.GroupResetButton.disabled = groupisdefault;
                    }
                });
            },

            submit : function(form) {
                M.util.js_pending('save_free_response_data');
                // Get data for AJAX request.
                var postData = form.documentIdentifier +
                    "&ajax=1&freeresponse=" + form.freeResponse + "&content=" +
                    encodeURIComponent(form.fieldContent.value) + "&sizetype=" + form.fieldSize +
                    "&itemid=" + form.fieldItemId;

                // Grey out the button again.
                form.previousOriginal = form.originalValue;
                form.originalValue = form.fieldContent.value;
                M.mod_oucontent.freeresponse.changed(form);

                // Show the answer.
                M.mod_oucontent.freeresponse.show(form, form.fieldContent.value !== '');

                if (M.mod_oucontent.altformatsextra) {
                    M.mod_oucontent.altformatsextra.submitFreeResponse(form);
                } else {
                    // Enable the progress image.
                    form.waitIcon.style.display = 'inline';

                    var cfg = {
                        method: 'POST',
                        data: postData,
                        on: {
                            success: function (id, t) {
                                // Is it really success?
                                if (t.responseText !== 'ok') {
                                    cfg.on.failure();
                                    return;
                                }

                                // Hide wait icon and update display if any.
                                M.mod_oucontent.freeresponse.update_display(form);
                                // For update word count.
                                M.mod_oucontent.freeresponse.updateWordCount('responsebox_' + form.getAttribute('id'), true);
                                form.waitIcon.style.display = 'none';
                                M.util.js_complete('save_free_response_data');
                            },
                            failure: function () {
                                // Hide wait icon.
                                form.waitIcon.style.display = 'none';
                                // Enable save button again.
                                form.originalValue = form.previousOriginal;
                                M.mod_oucontent.freeresponse.changed(form);

                                M.util.js_complete('save_free_response_data');
                                // Display error.
                                window.alert('There was an error saving your entry. Try again, or make a copy elsewhere.');
                            }
                        }
                    };
                    Y.io(form.action, cfg);
                }

                return false;
            },

            get_cell_forms : function(tableId) {
                var result = { formnamearray : [], formcontentarray : [], formsizearray : [], formitemidarray : [], formarray : [] };
                Y.all('form.oucontent-cellfreeresponse').each(function(singleformy) {
                    var singleform = singleformy.getDOMNode();
                    if (singleform.tableId === tableId) {
                        result.formnamearray.push(singleform.elements['freeresponse'].value);
                        result.formcontentarray.push(encodeURIComponent(singleform.elements['content'].value));
                        result.formsizearray.push(singleform.elements['size'].value);
                        result.formitemidarray.push(singleform.elements['itemid'].value);
                        result.formarray.push(singleform);
                    }
                });

                return result;
            },

            submit_cell : function(form) {
                // Get data for AJAX request.
                var forms = M.mod_oucontent.freeresponse.get_cell_forms(form.tableId);
                var documentIdentifier = forms.formarray[0].documentIdentifier;

                var postData = documentIdentifier + "&ajax=1";
                for (var i = 0; i < forms.formnamearray.length; i++) {
                    postData += "&freeresponses[" + i + "]=" + forms.formnamearray[i] + "&content[" + i + "]=" +
                        forms.formcontentarray[i] + "&sizetype[" + i + "]=" + forms.formsizearray[i] +
                        "&itemid[" + i + "]=" + forms.formitemidarray[i];
                }

                for(var i = 0; i < forms.formarray.length; i++) {
                    var singleform = forms.formarray[i];
                    singleform.previousOriginal = singleform.originalValue;
                    singleform.originalValue = singleform.fieldContent.value;
                }
                M.mod_oucontent.freeresponse.changed_cell(forms.formarray[0]);

                if (M.mod_oucontent.altformatsextra) {
                    for (var i = 0; i < forms.formarray.length; i++) {
                        M.mod_oucontent.altformatsextra.submitFreeResponse(forms.formarray[i]);
                    }
                } else {
                    // Enable the progress image.
                    form.waitIcon.style.display = 'inline';

                    var cfg = {
                        method: 'POST',
                        data: postData,
                        on: {
                            success: function (id, t) {
                                // Is it really success?
                                if (t.responseText !== 'ok') {
                                    cfg.on.failure();
                                    return;
                                }

                                for (var i = 0; i < forms.formarray.length; i++) {
                                    var singleform = forms.formarray[i];
                                    M.mod_oucontent.freeresponse.update_display(singleform);
                                }
                                // For update word count.
                                M.mod_oucontent.freeresponse.updateWordCount('responsebox_' + forms.formarray[0].getAttribute('id'), true);
                                // Hide wait icon and update display if any.
                                form.waitIcon.style.display = 'none';
                            },
                            failure: function () {
                                // Hide wait icon.
                                form.waitIcon.style.display = 'none';

                                for (var i = 0; i < forms.formarray.length; i++) {
                                    var singleform = forms.formarray[i];
                                    singleform.originalValue = singleform.previousOriginal;
                                }
                                M.mod_oucontent.freeresponse.changed_cell(forms.formarray[0]);

                                // Display error.
                                window.alert('There was an error saving your entry. Try again, or make a copy elsewhere.');
                            }
                        }
                    };
                    Y.io('freeresponse.php', cfg);
                }

                return false;
            },

            reset_cell : function(form) {
                var forms = M.mod_oucontent.freeresponse.get_cell_forms(form.tableId);
                var documentIdentifier = forms.formarray[0].documentIdentifier;

                var postData = documentIdentifier + "&ajax=1";
                for (var i = 0; i < forms.formnamearray.length; i++) {
                    postData += "&freeresponses[" + i + "]=" + forms.formnamearray[i] + "&content[" + i + "]=" +
                        forms.formcontentarray[i] + "&sizetype[" + i + "]=" + forms.formsizearray[i] +
                        "&itemid[" + i + "]=" + forms.formitemidarray[i];
                }
                postData += '&submit_reset=1';

                for(var i = 0; i < forms.formarray.length; i++) {
                    var singleform = forms.formarray[i];
                    singleform.previousOriginal = singleform.originalValue;
                    singleform.fieldContent.value = singleform.defaultValue;
                    singleform.originalValue = singleform.defaultValue;
                    if (singleform.divContent) {
                        Y.one(singleform.divContent).setHTML(singleform.defaultValue);
                    }
                }
                M.mod_oucontent.freeresponse.changed_cell(forms.formarray[0]);

                if (M.mod_oucontent.altformatsextra) {
                    for (var i = 0; i < forms.formarray.length; i++) {
                        M.mod_oucontent.altformatsextra.resetFreeResponse(forms.formarray[i]);
                    }
                } else {
                    // Enable the progress image.
                    form.waitIcon.style.display = 'inline';
                    var cfg = {
                        method: 'POST',
                        data: postData,
                        on: {
                            success: function (id, t) {
                                // Is it really success?
                                if (t.responseText !== 'ok') {
                                    cfg.on.failure();
                                    return;
                                }

                                for (var i = 0; i < forms.formarray.length; i++) {
                                    var singleform = forms.formarray[i];
                                    singleform.fieldContent.value = singleform.defaultValue;
                                    M.mod_oucontent.freeresponse.update_display(singleform);
                                }
                                // For update word count.
                                M.mod_oucontent.freeresponse.updateWordCount('responsebox_' + forms.formarray[0].getAttribute('id'), false);
                                // Hide wait icon.
                                form.waitIcon.style.display = 'none';
                            },
                            failure: function () {
                                // Hide wait icon.
                                form.waitIcon.style.display = 'none';
                                for (var i = 0; i < forms.formarray.length; i++) {
                                    var singleform = forms.formarray[i];
                                    singleform.originalValue = singleform.previousOriginal;
                                }
                                M.mod_oucontent.freeresponse.changed_cell(forms.formarray[0]);

                                // Display error.
                                window.alert('There was an error resetting your entry.');
                            }
                        }
                    };
                    Y.io('freeresponse.php', cfg);
                }
            },

            /**
             * If there is a FreeResponseDisplay box on the same page, update it
             * immediately (otherwise do nothing).
             * @param form Form containing FreeResponse data
             */
            update_display : function(form) {
                // On successful update, check if there's
                // a FreeResponseDisplay for this data, and
                // if so, update it live as well.
                var baseurl = (window.location.href + '') . replace(/(mod\/oucontent\/).*$/, '$1');
                var expectedlink = baseurl + 'linkback.php?type=freeresponse&refid=' +
                    form.freeResponse + '&' + form.documentIdentifier;

                if (M.mod_oucontent.altformatsextra) {
                    expectedlink = M.mod_oucontent.altformatsextra.getExpectedLinkForDisplay(form);
                }

                var link = Y.one('a[href="' + expectedlink + '"]');
                if (link) {
                    var inner = link.ancestor('.oucontent-free-response-display').one('.oucontent-inner');
                    var isdefault = form.fieldContent.value === form.defaultValue;
                    if (isdefault) {
                        inner.addClass('oucontent-notfound');
                        inner.set('innerHTML', M.mod_oucontent.jsstrings.freeresponse_display_nothing);
                    } else {
                        inner.removeClass('oucontent-notfound');
                        if (form.divContent) {
                            var html = form.fieldContent.value;
                        } else {
                            var html = Y.Escape.html(form.fieldContent.value);
                            html = html.replace(/\n/g, '<br/>');
                        }
                        inner.set('innerHTML', html);
                    }
                }
            },

            show : function(form, show) {
                var style = show ? 'block' : 'none';
                if (form.answer) {
                    form.answer.style.display = style;
                }
                if (form.discussion) {
                    form.discussion.style.display = style;
                }

                // Choose the appropriate submit button - 'save and reveal' or just 'save'.
                if (form.fieldSubmitR) {
                    form.fieldSubmitS.style.display = show ? 'inline' : 'none';
                    form.fieldSubmitR.style.display = show ? 'none' : 'inline';
                }
                M.mod_oucontent.force_ie_repaint();
            },

            checkforms : function(event) {
                var showwarningmessage = false;
                for (var i = 0; i < M.mod_oucontent.responseforms.length; i++) {
                    var form = M.mod_oucontent.responseforms[i];
                    if (!form.fieldSubmitS.disabled) {
                        showwarningmessage = true;
                        break;
                    }
                }

                // This is the error message that we'll show to browsers which support it.
                var warningmessage = M.util.get_string('changesmadereallygoaway', 'moodle');

                if (showwarningmessage) {
                    // Most browsers are happy with the returnValue being set on the event
                    // But some browsers do not consistently pass the event.
                    if (event) {
                        event.returnValue = warningmessage;
                    }
                    return warningmessage;
                }
            }
        },
    };

}, '@VERSION@', { requires:['base', 'node', 'event', 'transition', 'swf', 'dom', 'anim', 'escape'] });

// Global function called by Java applets when loaded - only if the Java version/applet supports
// the focushack system.
function appletLoaded(id) {
    M.mod_oucontent.javaapplet.applet_load(id);
}

// Global function called by Java applets when they want to lose focus.
function appletDitchFocus(id, forward) {
    M.mod_oucontent.javaapplet.applet_ditch_focus(id, forward);
}

// Global function called by Java applets when VR is paused/un-paused.
function isPause(pauseflag) {
    window.onbeforeunload = function () {
        if (pauseflag) {
            return "Are you sure you want to leave?";
        }
    }
}
