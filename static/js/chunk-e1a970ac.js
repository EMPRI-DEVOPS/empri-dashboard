(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-e1a970ac"],{"25f0":function(t,e,a){"use strict";var n=a("6eeb"),r=a("825a"),i=a("d039"),c=a("ad6d"),o="toString",s=RegExp.prototype,u=s[o],l=i((function(){return"/a/b"!=u.call({source:"a",flags:"b"})})),f=u.name!=o;(l||f)&&n(RegExp.prototype,o,(function(){var t=r(this),e=String(t.source),a=t.flags,n=String(void 0===a&&t instanceof RegExp&&!("flags"in s)?c.call(t):a);return"/"+e+"/"+n}),{unsafe:!0})},"936f":function(t,e,a){"use strict";a.r(e);var n=a("f2bf"),r=Object(n["f"])("b",null,"ClientId:",-1),i=Object(n["f"])("b",null,"State parameter:",-1),c=Object(n["f"])("h3",null,"Login",-1);function o(t,e,a,o,s,u){return Object(n["o"])(),Object(n["d"])(n["a"],null,[Object(n["f"])("p",null,[r,Object(n["e"])(" "+Object(n["x"])(s.clientId),1)]),Object(n["f"])("p",null,[i,Object(n["e"])(" "+Object(n["x"])(s.stateParameter)+" ",1),Object(n["f"])("button",{onClick:e[1]||(e[1]=function(t){return u.generateStateParameter()})},"Generate")]),Object(n["f"])("a",{href:this.linkUrl},[c],8,["href"])],64)}a("d3b7"),a("25f0"),a("3ca3"),a("ddb0"),a("2b3d");var s={name:"GitHubLogin",data:function(){return{clientId:"5a76ef3307c83a98e0b4",clientSecret:"59aac7f9a7157f1d626db653f20547b3c99a6cfe",stateParameter:null}},mounted:function(){sessionStorage.getItem("stateParameter")?this.stateParameter=sessionStorage.getItem("stateParameter"):this.generateStateParameter()},computed:{linkUrl:function(){var t=new URLSearchParams({client_id:this.clientId,state:this.stateParameter,allow_signup:!1});return"https://github.com/login/oauth/authorize?"+t.toString()}},methods:{generateStateParameter:function(){for(var t="",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",a=0;a<40;a++)t+=e.charAt(Math.floor(Math.random()*e.length));sessionStorage.setItem("stateParameter",t),this.stateParameter=t}}};s.render=o;e["default"]=s},ad6d:function(t,e,a){"use strict";var n=a("825a");t.exports=function(){var t=n(this),e="";return t.global&&(e+="g"),t.ignoreCase&&(e+="i"),t.multiline&&(e+="m"),t.dotAll&&(e+="s"),t.unicode&&(e+="u"),t.sticky&&(e+="y"),e}}}]);
//# sourceMappingURL=chunk-e1a970ac.js.map