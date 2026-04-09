var Xu={exports:{}},Yu={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */(function(n){function t(O,B){var $=O.length;O.push(B);t:for(;0<$;){var rt=$-1>>>1,J=O[rt];if(0<s(J,B))O[rt]=B,O[$]=J,$=rt;else break t}}function e(O){return O.length===0?null:O[0]}function r(O){if(O.length===0)return null;var B=O[0],$=O.pop();if($!==B){O[0]=$;t:for(var rt=0,J=O.length,at=J>>>1;rt<at;){var Ht=2*(rt+1)-1,Wt=O[Ht],Kt=Ht+1,Qt=O[Kt];if(0>s(Wt,$))Kt<J&&0>s(Qt,Wt)?(O[rt]=Qt,O[Kt]=$,rt=Kt):(O[rt]=Wt,O[Ht]=$,rt=Ht);else if(Kt<J&&0>s(Qt,$))O[rt]=Qt,O[Kt]=$,rt=Kt;else break t}}return B}function s(O,B){var $=O.sortIndex-B.sortIndex;return $!==0?$:O.id-B.id}if(typeof performance=="object"&&typeof performance.now=="function"){var o=performance;n.unstable_now=function(){return o.now()}}else{var a=Date,c=a.now();n.unstable_now=function(){return a.now()-c}}var h=[],d=[],p=1,y=null,v=3,R=!1,V=!1,k=!1,C=typeof setTimeout=="function"?setTimeout:null,U=typeof clearTimeout=="function"?clearTimeout:null,L=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function z(O){for(var B=e(d);B!==null;){if(B.callback===null)r(d);else if(B.startTime<=O)r(d),B.sortIndex=B.expirationTime,t(h,B);else break;B=e(d)}}function Y(O){if(k=!1,z(O),!V)if(e(h)!==null)V=!0,fn(mt);else{var B=e(d);B!==null&&Gt(Y,B.startTime-O)}}function mt(O,B){V=!1,k&&(k=!1,U(m),m=-1),R=!0;var $=v;try{for(z(B),y=e(h);y!==null&&(!(y.expirationTime>B)||O&&!T());){var rt=y.callback;if(typeof rt=="function"){y.callback=null,v=y.priorityLevel;var J=rt(y.expirationTime<=B);B=n.unstable_now(),typeof J=="function"?y.callback=J:y===e(h)&&r(h),z(B)}else r(h);y=e(h)}if(y!==null)var at=!0;else{var Ht=e(d);Ht!==null&&Gt(Y,Ht.startTime-B),at=!1}return at}finally{y=null,v=$,R=!1}}var it=!1,I=null,m=-1,_=5,E=-1;function T(){return!(n.unstable_now()-E<_)}function A(){if(I!==null){var O=n.unstable_now();E=O;var B=!0;try{B=I(!0,O)}finally{B?g():(it=!1,I=null)}}else it=!1}var g;if(typeof L=="function")g=function(){L(A)};else if(typeof MessageChannel<"u"){var kt=new MessageChannel,Ae=kt.port2;kt.port1.onmessage=A,g=function(){Ae.postMessage(null)}}else g=function(){C(A,0)};function fn(O){I=O,it||(it=!0,g())}function Gt(O,B){m=C(function(){O(n.unstable_now())},B)}n.unstable_IdlePriority=5,n.unstable_ImmediatePriority=1,n.unstable_LowPriority=4,n.unstable_NormalPriority=3,n.unstable_Profiling=null,n.unstable_UserBlockingPriority=2,n.unstable_cancelCallback=function(O){O.callback=null},n.unstable_continueExecution=function(){V||R||(V=!0,fn(mt))},n.unstable_forceFrameRate=function(O){0>O||125<O?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):_=0<O?Math.floor(1e3/O):5},n.unstable_getCurrentPriorityLevel=function(){return v},n.unstable_getFirstCallbackNode=function(){return e(h)},n.unstable_next=function(O){switch(v){case 1:case 2:case 3:var B=3;break;default:B=v}var $=v;v=B;try{return O()}finally{v=$}},n.unstable_pauseExecution=function(){},n.unstable_requestPaint=function(){},n.unstable_runWithPriority=function(O,B){switch(O){case 1:case 2:case 3:case 4:case 5:break;default:O=3}var $=v;v=O;try{return B()}finally{v=$}},n.unstable_scheduleCallback=function(O,B,$){var rt=n.unstable_now();switch(typeof $=="object"&&$!==null?($=$.delay,$=typeof $=="number"&&0<$?rt+$:rt):$=rt,O){case 1:var J=-1;break;case 2:J=250;break;case 5:J=1073741823;break;case 4:J=1e4;break;default:J=5e3}return J=$+J,O={id:p++,callback:B,priorityLevel:O,startTime:$,expirationTime:J,sortIndex:-1},$>rt?(O.sortIndex=$,t(d,O),e(h)===null&&O===e(d)&&(k?(U(m),m=-1):k=!0,Gt(Y,$-rt))):(O.sortIndex=J,t(h,O),V||R||(V=!0,fn(mt))),O},n.unstable_shouldYield=T,n.unstable_wrapCallback=function(O){var B=v;return function(){var $=v;v=B;try{return O.apply(this,arguments)}finally{v=$}}}})(Yu);Xu.exports=Yu;var lv=Xu.exports;/**
 * @remix-run/router v1.23.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function Un(){return Un=Object.assign?Object.assign.bind():function(n){for(var t=1;t<arguments.length;t++){var e=arguments[t];for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&(n[r]=e[r])}return n},Un.apply(this,arguments)}var Ye;(function(n){n.Pop="POP",n.Push="PUSH",n.Replace="REPLACE"})(Ye||(Ye={}));const va="popstate";function hv(n){n===void 0&&(n={});function t(r,s){let{pathname:o,search:a,hash:c}=r.location;return Xs("",{pathname:o,search:a,hash:c},s.state&&s.state.usr||null,s.state&&s.state.key||"default")}function e(r,s){return typeof s=="string"?s:Ju(s)}return nd(t,e,null,n)}function Je(n,t){if(n===!1||n===null||typeof n>"u")throw new Error(t)}function Ei(n,t){if(!n){typeof console<"u"&&console.warn(t);try{throw new Error(t)}catch{}}}function ed(){return Math.random().toString(36).substr(2,8)}function Ea(n,t){return{usr:n.state,key:n.key,idx:t}}function Xs(n,t,e,r){return e===void 0&&(e=null),Un({pathname:typeof n=="string"?n:n.pathname,search:"",hash:""},typeof t=="string"?Xr(t):t,{state:e,key:t&&t.key||r||ed()})}function Ju(n){let{pathname:t="/",search:e="",hash:r=""}=n;return e&&e!=="?"&&(t+=e.charAt(0)==="?"?e:"?"+e),r&&r!=="#"&&(t+=r.charAt(0)==="#"?r:"#"+r),t}function Xr(n){let t={};if(n){let e=n.indexOf("#");e>=0&&(t.hash=n.substr(e),n=n.substr(0,e));let r=n.indexOf("?");r>=0&&(t.search=n.substr(r),n=n.substr(0,r)),n&&(t.pathname=n)}return t}function nd(n,t,e,r){r===void 0&&(r={});let{window:s=document.defaultView,v5Compat:o=!1}=r,a=s.history,c=Ye.Pop,h=null,d=p();d==null&&(d=0,a.replaceState(Un({},a.state,{idx:d}),""));function p(){return(a.state||{idx:null}).idx}function y(){c=Ye.Pop;let C=p(),U=C==null?null:C-d;d=C,h&&h({action:c,location:k.location,delta:U})}function v(C,U){c=Ye.Push;let L=Xs(k.location,C,U);d=p()+1;let z=Ea(L,d),Y=k.createHref(L);try{a.pushState(z,"",Y)}catch(mt){if(mt instanceof DOMException&&mt.name==="DataCloneError")throw mt;s.location.assign(Y)}o&&h&&h({action:c,location:k.location,delta:1})}function R(C,U){c=Ye.Replace;let L=Xs(k.location,C,U);d=p();let z=Ea(L,d),Y=k.createHref(L);a.replaceState(z,"",Y),o&&h&&h({action:c,location:k.location,delta:0})}function V(C){let U=s.location.origin!=="null"?s.location.origin:s.location.href,L=typeof C=="string"?C:Ju(C);return L=L.replace(/ $/,"%20"),Je(U,"No window.location.(origin|href) available to create URL for href: "+L),new URL(L,U)}let k={get action(){return c},get location(){return n(s,a)},listen(C){if(h)throw new Error("A history only accepts one active listener");return s.addEventListener(va,y),h=C,()=>{s.removeEventListener(va,y),h=null}},createHref(C){return t(s,C)},createURL:V,encodeLocation(C){let U=V(C);return{pathname:U.pathname,search:U.search,hash:U.hash}},push:v,replace:R,go(C){return a.go(C)}};return k}var Ta;(function(n){n.data="data",n.deferred="deferred",n.redirect="redirect",n.error="error"})(Ta||(Ta={}));function dv(n,t,e){return e===void 0&&(e="/"),rd(n,t,e)}function rd(n,t,e,r){let s=typeof t=="string"?Xr(t):t,o=_d(s.pathname||"/",e);if(o==null)return null;let a=Zu(n);sd(a);let c=null;for(let h=0;c==null&&h<a.length;++h){let d=gd(o);c=fd(a[h],d)}return c}function Zu(n,t,e,r){t===void 0&&(t=[]),e===void 0&&(e=[]),r===void 0&&(r="");let s=(o,a,c)=>{let h={relativePath:c===void 0?o.path||"":c,caseSensitive:o.caseSensitive===!0,childrenIndex:a,route:o};h.relativePath.startsWith("/")&&(Je(h.relativePath.startsWith(r),'Absolute route path "'+h.relativePath+'" nested under path '+('"'+r+'" is not valid. An absolute child route path ')+"must start with the combined path of all its parent routes."),h.relativePath=h.relativePath.slice(r.length));let d=Rr([r,h.relativePath]),p=e.concat(h);o.children&&o.children.length>0&&(Je(o.index!==!0,"Index routes must not have child routes. Please remove "+('all child routes from route path "'+d+'".')),Zu(o.children,t,p,d)),!(o.path==null&&!o.index)&&t.push({path:d,score:hd(d,o.index),routesMeta:p})};return n.forEach((o,a)=>{var c;if(o.path===""||!((c=o.path)!=null&&c.includes("?")))s(o,a);else for(let h of tc(o.path))s(o,a,h)}),t}function tc(n){let t=n.split("/");if(t.length===0)return[];let[e,...r]=t,s=e.endsWith("?"),o=e.replace(/\?$/,"");if(r.length===0)return s?[o,""]:[o];let a=tc(r.join("/")),c=[];return c.push(...a.map(h=>h===""?o:[o,h].join("/"))),s&&c.push(...a),c.map(h=>n.startsWith("/")&&h===""?"/":h)}function sd(n){n.sort((t,e)=>t.score!==e.score?e.score-t.score:dd(t.routesMeta.map(r=>r.childrenIndex),e.routesMeta.map(r=>r.childrenIndex)))}const id=/^:[\w-]+$/,od=3,ad=2,ud=1,cd=10,ld=-2,Ia=n=>n==="*";function hd(n,t){let e=n.split("/"),r=e.length;return e.some(Ia)&&(r+=ld),t&&(r+=ad),e.filter(s=>!Ia(s)).reduce((s,o)=>s+(id.test(o)?od:o===""?ud:cd),r)}function dd(n,t){return n.length===t.length&&n.slice(0,-1).every((r,s)=>r===t[s])?n[n.length-1]-t[t.length-1]:0}function fd(n,t,e){let{routesMeta:r}=n,s={},o="/",a=[];for(let c=0;c<r.length;++c){let h=r[c],d=c===r.length-1,p=o==="/"?t:t.slice(o.length)||"/",y=pd({path:h.relativePath,caseSensitive:h.caseSensitive,end:d},p),v=h.route;if(!y)return null;Object.assign(s,y.params),a.push({params:s,pathname:Rr([o,y.pathname]),pathnameBase:Id(Rr([o,y.pathnameBase])),route:v}),y.pathnameBase!=="/"&&(o=Rr([o,y.pathnameBase]))}return a}function pd(n,t){typeof n=="string"&&(n={path:n,caseSensitive:!1,end:!0});let[e,r]=md(n.path,n.caseSensitive,n.end),s=t.match(e);if(!s)return null;let o=s[0],a=o.replace(/(.)\/+$/,"$1"),c=s.slice(1);return{params:r.reduce((d,p,y)=>{let{paramName:v,isOptional:R}=p;if(v==="*"){let k=c[y]||"";a=o.slice(0,o.length-k.length).replace(/(.)\/+$/,"$1")}const V=c[y];return R&&!V?d[v]=void 0:d[v]=(V||"").replace(/%2F/g,"/"),d},{}),pathname:o,pathnameBase:a,pattern:n}}function md(n,t,e){t===void 0&&(t=!1),e===void 0&&(e=!0),Ei(n==="*"||!n.endsWith("*")||n.endsWith("/*"),'Route path "'+n+'" will be treated as if it were '+('"'+n.replace(/\*$/,"/*")+'" because the `*` character must ')+"always follow a `/` in the pattern. To get rid of this warning, "+('please change the route path to "'+n.replace(/\*$/,"/*")+'".'));let r=[],s="^"+n.replace(/\/*\*?$/,"").replace(/^\/*/,"/").replace(/[\\.*+^${}|()[\]]/g,"\\$&").replace(/\/:([\w-]+)(\?)?/g,(a,c,h)=>(r.push({paramName:c,isOptional:h!=null}),h?"/?([^\\/]+)?":"/([^\\/]+)"));return n.endsWith("*")?(r.push({paramName:"*"}),s+=n==="*"||n==="/*"?"(.*)$":"(?:\\/(.+)|\\/*)$"):e?s+="\\/*$":n!==""&&n!=="/"&&(s+="(?:(?=\\/|$))"),[new RegExp(s,t?void 0:"i"),r]}function gd(n){try{return n.split("/").map(t=>decodeURIComponent(t).replace(/\//g,"%2F")).join("/")}catch(t){return Ei(!1,'The URL path "'+n+'" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent '+("encoding ("+t+").")),n}}function _d(n,t){if(t==="/")return n;if(!n.toLowerCase().startsWith(t.toLowerCase()))return null;let e=t.endsWith("/")?t.length-1:t.length,r=n.charAt(e);return r&&r!=="/"?null:n.slice(e)||"/"}const yd=/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,vd=n=>yd.test(n);function Ed(n,t){t===void 0&&(t="/");let{pathname:e,search:r="",hash:s=""}=typeof n=="string"?Xr(n):n,o;if(e)if(vd(e))o=e;else{if(e.includes("//")){let a=e;e=e.replace(/\/\/+/g,"/"),Ei(!1,"Pathnames cannot have embedded double slashes - normalizing "+(a+" -> "+e))}e.startsWith("/")?o=wa(e.substring(1),"/"):o=wa(e,t)}else o=t;return{pathname:o,search:wd(r),hash:Ad(s)}}function wa(n,t){let e=t.replace(/\/+$/,"").split("/");return n.split("/").forEach(s=>{s===".."?e.length>1&&e.pop():s!=="."&&e.push(s)}),e.length>1?e.join("/"):"/"}function Ls(n,t,e,r){return"Cannot include a '"+n+"' character in a manually specified "+("`to."+t+"` field ["+JSON.stringify(r)+"].  Please separate it out to the ")+("`to."+e+"` field. Alternatively you may provide the full path as ")+'a string in <Link to="..."> and the router will parse it for you.'}function Td(n){return n.filter((t,e)=>e===0||t.route.path&&t.route.path.length>0)}function fv(n,t){let e=Td(n);return t?e.map((r,s)=>s===e.length-1?r.pathname:r.pathnameBase):e.map(r=>r.pathnameBase)}function pv(n,t,e,r){r===void 0&&(r=!1);let s;typeof n=="string"?s=Xr(n):(s=Un({},n),Je(!s.pathname||!s.pathname.includes("?"),Ls("?","pathname","search",s)),Je(!s.pathname||!s.pathname.includes("#"),Ls("#","pathname","hash",s)),Je(!s.search||!s.search.includes("#"),Ls("#","search","hash",s)));let o=n===""||s.pathname==="",a=o?"/":s.pathname,c;if(a==null)c=e;else{let y=t.length-1;if(!r&&a.startsWith("..")){let v=a.split("/");for(;v[0]==="..";)v.shift(),y-=1;s.pathname=v.join("/")}c=y>=0?t[y]:"/"}let h=Ed(s,c),d=a&&a!=="/"&&a.endsWith("/"),p=(o||a===".")&&e.endsWith("/");return!h.pathname.endsWith("/")&&(d||p)&&(h.pathname+="/"),h}const Rr=n=>n.join("/").replace(/\/\/+/g,"/"),Id=n=>n.replace(/\/+$/,"").replace(/^\/*/,"/"),wd=n=>!n||n==="?"?"":n.startsWith("?")?n:"?"+n,Ad=n=>!n||n==="#"?"":n.startsWith("#")?n:"#"+n;function mv(n){return n!=null&&typeof n.status=="number"&&typeof n.statusText=="string"&&typeof n.internal=="boolean"&&"data"in n}const ec=["post","put","patch","delete"];new Set(ec);const Sd=["get",...ec];new Set(Sd);const Rd=()=>{};var Aa={};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const nc=function(n){const t=[];let e=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?t[e++]=s:s<2048?(t[e++]=s>>6|192,t[e++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),t[e++]=s>>18|240,t[e++]=s>>12&63|128,t[e++]=s>>6&63|128,t[e++]=s&63|128):(t[e++]=s>>12|224,t[e++]=s>>6&63|128,t[e++]=s&63|128)}return t},bd=function(n){const t=[];let e=0,r=0;for(;e<n.length;){const s=n[e++];if(s<128)t[r++]=String.fromCharCode(s);else if(s>191&&s<224){const o=n[e++];t[r++]=String.fromCharCode((s&31)<<6|o&63)}else if(s>239&&s<365){const o=n[e++],a=n[e++],c=n[e++],h=((s&7)<<18|(o&63)<<12|(a&63)<<6|c&63)-65536;t[r++]=String.fromCharCode(55296+(h>>10)),t[r++]=String.fromCharCode(56320+(h&1023))}else{const o=n[e++],a=n[e++];t[r++]=String.fromCharCode((s&15)<<12|(o&63)<<6|a&63)}}return t.join("")},rc={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,t){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const e=t?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const o=n[s],a=s+1<n.length,c=a?n[s+1]:0,h=s+2<n.length,d=h?n[s+2]:0,p=o>>2,y=(o&3)<<4|c>>4;let v=(c&15)<<2|d>>6,R=d&63;h||(R=64,a||(v=64)),r.push(e[p],e[y],e[v],e[R])}return r.join("")},encodeString(n,t){return this.HAS_NATIVE_SUPPORT&&!t?btoa(n):this.encodeByteArray(nc(n),t)},decodeString(n,t){return this.HAS_NATIVE_SUPPORT&&!t?atob(n):bd(this.decodeStringToByteArray(n,t))},decodeStringToByteArray(n,t){this.init_();const e=t?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const o=e[n.charAt(s++)],c=s<n.length?e[n.charAt(s)]:0;++s;const d=s<n.length?e[n.charAt(s)]:64;++s;const y=s<n.length?e[n.charAt(s)]:64;if(++s,o==null||c==null||d==null||y==null)throw new Pd;const v=o<<2|c>>4;if(r.push(v),d!==64){const R=c<<4&240|d>>2;if(r.push(R),y!==64){const V=d<<6&192|y;r.push(V)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class Pd extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Cd=function(n){const t=nc(n);return rc.encodeByteArray(t,!0)},Or=function(n){return Cd(n).replace(/\./g,"")},Vd=function(n){try{return rc.decodeString(n,!0)}catch(t){console.error("base64Decode failed: ",t)}return null};/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Dd(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const kd=()=>Dd().__FIREBASE_DEFAULTS__,Nd=()=>{if(typeof process>"u"||typeof Aa>"u")return;const n=Aa.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Od=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const t=n&&Vd(n[1]);return t&&JSON.parse(t)},Yr=()=>{try{return Rd()||kd()||Nd()||Od()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},xd=n=>{var t,e;return(e=(t=Yr())===null||t===void 0?void 0:t.emulatorHosts)===null||e===void 0?void 0:e[n]},Md=n=>{const t=xd(n);if(!t)return;const e=t.lastIndexOf(":");if(e<=0||e+1===t.length)throw new Error(`Invalid host ${t} with no separate hostname and port!`);const r=parseInt(t.substring(e+1),10);return t[0]==="["?[t.substring(1,e-1),r]:[t.substring(0,e),r]},sc=()=>{var n;return(n=Yr())===null||n===void 0?void 0:n.config},gv=n=>{var t;return(t=Yr())===null||t===void 0?void 0:t[`_${n}`]};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ld{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}wrapCallback(t){return(e,r)=>{e?this.reject(e):this.resolve(r),typeof t=="function"&&(this.promise.catch(()=>{}),t.length===1?t(e):t(e,r))}}}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ti(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Fd(n){return(await fetch(n,{credentials:"include"})).ok}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ud(n,t){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const e={alg:"none",type:"JWT"},r=t||"demo-project",s=n.iat||0,o=n.sub||n.user_id;if(!o)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const a=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:o,user_id:o,firebase:{sign_in_provider:"custom",identities:{}}},n);return[Or(JSON.stringify(e)),Or(JSON.stringify(a)),""].join(".")}const Dn={};function Bd(){const n={prod:[],emulator:[]};for(const t of Object.keys(Dn))Dn[t]?n.emulator.push(t):n.prod.push(t);return n}function jd(n){let t=document.getElementById(n),e=!1;return t||(t=document.createElement("div"),t.setAttribute("id",n),e=!0),{created:e,element:t}}let Sa=!1;function qd(n,t){if(typeof window>"u"||typeof document>"u"||!Ti(window.location.host)||Dn[n]===t||Dn[n]||Sa)return;Dn[n]=t;function e(v){return`__firebase__banner__${v}`}const r="__firebase__banner",o=Bd().prod.length>0;function a(){const v=document.getElementById(r);v&&v.remove()}function c(v){v.style.display="flex",v.style.background="#7faaf0",v.style.position="fixed",v.style.bottom="5px",v.style.left="5px",v.style.padding=".5em",v.style.borderRadius="5px",v.style.alignItems="center"}function h(v,R){v.setAttribute("width","24"),v.setAttribute("id",R),v.setAttribute("height","24"),v.setAttribute("viewBox","0 0 24 24"),v.setAttribute("fill","none"),v.style.marginLeft="-6px"}function d(){const v=document.createElement("span");return v.style.cursor="pointer",v.style.marginLeft="16px",v.style.fontSize="24px",v.innerHTML=" &times;",v.onclick=()=>{Sa=!0,a()},v}function p(v,R){v.setAttribute("id",R),v.innerText="Learn more",v.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",v.setAttribute("target","__blank"),v.style.paddingLeft="5px",v.style.textDecoration="underline"}function y(){const v=jd(r),R=e("text"),V=document.getElementById(R)||document.createElement("span"),k=e("learnmore"),C=document.getElementById(k)||document.createElement("a"),U=e("preprendIcon"),L=document.getElementById(U)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(v.created){const z=v.element;c(z),p(C,k);const Y=d();h(L,U),z.append(L,V,C,Y),document.body.appendChild(z)}o?(V.innerText="Preview backend disconnected.",L.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):(L.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,V.innerText="Preview backend running in this workspace."),V.setAttribute("id",R)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",y):y()}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ii(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function _v(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(Ii())}function $d(){var n;const t=(n=Yr())===null||n===void 0?void 0:n.forceEnvironment;if(t==="node")return!0;if(t==="browser")return!1;try{return Object.prototype.toString.call(global.process)==="[object process]"}catch{return!1}}function yv(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function ic(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function vv(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Ev(){const n=Ii();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function zd(){return!$d()&&!!navigator.userAgent&&navigator.userAgent.includes("Safari")&&!navigator.userAgent.includes("Chrome")}function wi(){try{return typeof indexedDB=="object"}catch{return!1}}function Ai(){return new Promise((n,t)=>{try{let e=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),e||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{e=!1},s.onerror=()=>{var o;t(((o=s.error)===null||o===void 0?void 0:o.message)||"")}}catch(e){t(e)}})}function oc(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Gd="FirebaseError";class we extends Error{constructor(t,e,r){super(e),this.code=t,this.customData=r,this.name=Gd,Object.setPrototypeOf(this,we.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,Jr.prototype.create)}}class Jr{constructor(t,e,r){this.service=t,this.serviceName=e,this.errors=r}create(t,...e){const r=e[0]||{},s=`${this.service}/${t}`,o=this.errors[t],a=o?Hd(o,r):"Error",c=`${this.serviceName}: ${a} (${s}).`;return new we(s,c,r)}}function Hd(n,t){return n.replace(Wd,(e,r)=>{const s=t[r];return s!=null?String(s):`<${r}?>`})}const Wd=/\{\$([^}]+)}/g;function Tv(n){for(const t in n)if(Object.prototype.hasOwnProperty.call(n,t))return!1;return!0}function Bn(n,t){if(n===t)return!0;const e=Object.keys(n),r=Object.keys(t);for(const s of e){if(!r.includes(s))return!1;const o=n[s],a=t[s];if(Ra(o)&&Ra(a)){if(!Bn(o,a))return!1}else if(o!==a)return!1}for(const s of r)if(!e.includes(s))return!1;return!0}function Ra(n){return n!==null&&typeof n=="object"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Iv(n){const t=[];for(const[e,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{t.push(encodeURIComponent(e)+"="+encodeURIComponent(s))}):t.push(encodeURIComponent(e)+"="+encodeURIComponent(r));return t.length?"&"+t.join("&"):""}function wv(n){const t={};return n.replace(/^\?/,"").split("&").forEach(r=>{if(r){const[s,o]=r.split("=");t[decodeURIComponent(s)]=decodeURIComponent(o)}}),t}function Av(n){const t=n.indexOf("?");if(!t)return"";const e=n.indexOf("#",t);return n.substring(t,e>0?e:void 0)}function Sv(n,t){const e=new Kd(n,t);return e.subscribe.bind(e)}class Kd{constructor(t,e){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=e,this.task.then(()=>{t(this)}).catch(r=>{this.error(r)})}next(t){this.forEachObserver(e=>{e.next(t)})}error(t){this.forEachObserver(e=>{e.error(t)}),this.close(t)}complete(){this.forEachObserver(t=>{t.complete()}),this.close()}subscribe(t,e,r){let s;if(t===void 0&&e===void 0&&r===void 0)throw new Error("Missing Observer.");Qd(t,["next","error","complete"])?s=t:s={next:t,error:e,complete:r},s.next===void 0&&(s.next=Fs),s.error===void 0&&(s.error=Fs),s.complete===void 0&&(s.complete=Fs);const o=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),o}unsubscribeOne(t){this.observers===void 0||this.observers[t]===void 0||(delete this.observers[t],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(t){if(!this.finalized)for(let e=0;e<this.observers.length;e++)this.sendOne(e,t)}sendOne(t,e){this.task.then(()=>{if(this.observers!==void 0&&this.observers[t]!==void 0)try{e(this.observers[t])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(t){this.finalized||(this.finalized=!0,t!==void 0&&(this.finalError=t),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function Qd(n,t){if(typeof n!="object"||n===null)return!1;for(const e of t)if(e in n&&typeof n[e]=="function")return!0;return!1}function Fs(){}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xd=1e3,Yd=2,Jd=4*60*60*1e3,Zd=.5;function ba(n,t=Xd,e=Yd){const r=t*Math.pow(e,n),s=Math.round(Zd*r*(Math.random()-.5)*2);return Math.min(Jd,r+s)}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function de(n){return n&&n._delegate?n._delegate:n}class te{constructor(t,e,r){this.name=t,this.instanceFactory=e,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(t){return this.instantiationMode=t,this}setMultipleInstances(t){return this.multipleInstances=t,this}setServiceProps(t){return this.serviceProps=t,this}setInstanceCreatedCallback(t){return this.onInstanceCreated=t,this}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ce="[DEFAULT]";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tf{constructor(t,e){this.name=t,this.container=e,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(t){const e=this.normalizeInstanceIdentifier(t);if(!this.instancesDeferred.has(e)){const r=new Ld;if(this.instancesDeferred.set(e,r),this.isInitialized(e)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:e});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(e).promise}getImmediate(t){var e;const r=this.normalizeInstanceIdentifier(t==null?void 0:t.identifier),s=(e=t==null?void 0:t.optional)!==null&&e!==void 0?e:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(o){if(s)return null;throw o}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(t){if(t.name!==this.name)throw Error(`Mismatching Component ${t.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=t,!!this.shouldAutoInitialize()){if(nf(t))try{this.getOrInitializeService({instanceIdentifier:Ce})}catch{}for(const[e,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(e);try{const o=this.getOrInitializeService({instanceIdentifier:s});r.resolve(o)}catch{}}}}clearInstance(t=Ce){this.instancesDeferred.delete(t),this.instancesOptions.delete(t),this.instances.delete(t)}async delete(){const t=Array.from(this.instances.values());await Promise.all([...t.filter(e=>"INTERNAL"in e).map(e=>e.INTERNAL.delete()),...t.filter(e=>"_delete"in e).map(e=>e._delete())])}isComponentSet(){return this.component!=null}isInitialized(t=Ce){return this.instances.has(t)}getOptions(t=Ce){return this.instancesOptions.get(t)||{}}initialize(t={}){const{options:e={}}=t,r=this.normalizeInstanceIdentifier(t.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:e});for(const[o,a]of this.instancesDeferred.entries()){const c=this.normalizeInstanceIdentifier(o);r===c&&a.resolve(s)}return s}onInit(t,e){var r;const s=this.normalizeInstanceIdentifier(e),o=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;o.add(t),this.onInitCallbacks.set(s,o);const a=this.instances.get(s);return a&&t(a,s),()=>{o.delete(t)}}invokeOnInitCallbacks(t,e){const r=this.onInitCallbacks.get(e);if(r)for(const s of r)try{s(t,e)}catch{}}getOrInitializeService({instanceIdentifier:t,options:e={}}){let r=this.instances.get(t);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:ef(t),options:e}),this.instances.set(t,r),this.instancesOptions.set(t,e),this.invokeOnInitCallbacks(r,t),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,t,r)}catch{}return r||null}normalizeInstanceIdentifier(t=Ce){return this.component?this.component.multipleInstances?t:Ce:t}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function ef(n){return n===Ce?void 0:n}function nf(n){return n.instantiationMode==="EAGER"}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class rf{constructor(t){this.name=t,this.providers=new Map}addComponent(t){const e=this.getProvider(t.name);if(e.isComponentSet())throw new Error(`Component ${t.name} has already been registered with ${this.name}`);e.setComponent(t)}addOrOverwriteComponent(t){this.getProvider(t.name).isComponentSet()&&this.providers.delete(t.name),this.addComponent(t)}getProvider(t){if(this.providers.has(t))return this.providers.get(t);const e=new tf(t,this);return this.providers.set(t,e),e}getProviders(){return Array.from(this.providers.values())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var K;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(K||(K={}));const sf={debug:K.DEBUG,verbose:K.VERBOSE,info:K.INFO,warn:K.WARN,error:K.ERROR,silent:K.SILENT},of=K.INFO,af={[K.DEBUG]:"log",[K.VERBOSE]:"log",[K.INFO]:"info",[K.WARN]:"warn",[K.ERROR]:"error"},uf=(n,t,...e)=>{if(t<n.logLevel)return;const r=new Date().toISOString(),s=af[t];if(s)console[s](`[${r}]  ${n.name}:`,...e);else throw new Error(`Attempted to log a message with an invalid logType (value: ${t})`)};class Si{constructor(t){this.name=t,this._logLevel=of,this._logHandler=uf,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(t){if(!(t in K))throw new TypeError(`Invalid value "${t}" assigned to \`logLevel\``);this._logLevel=t}setLogLevel(t){this._logLevel=typeof t=="string"?sf[t]:t}get logHandler(){return this._logHandler}set logHandler(t){if(typeof t!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=t}get userLogHandler(){return this._userLogHandler}set userLogHandler(t){this._userLogHandler=t}debug(...t){this._userLogHandler&&this._userLogHandler(this,K.DEBUG,...t),this._logHandler(this,K.DEBUG,...t)}log(...t){this._userLogHandler&&this._userLogHandler(this,K.VERBOSE,...t),this._logHandler(this,K.VERBOSE,...t)}info(...t){this._userLogHandler&&this._userLogHandler(this,K.INFO,...t),this._logHandler(this,K.INFO,...t)}warn(...t){this._userLogHandler&&this._userLogHandler(this,K.WARN,...t),this._logHandler(this,K.WARN,...t)}error(...t){this._userLogHandler&&this._userLogHandler(this,K.ERROR,...t),this._logHandler(this,K.ERROR,...t)}}const cf=(n,t)=>t.some(e=>n instanceof e);let Pa,Ca;function lf(){return Pa||(Pa=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function hf(){return Ca||(Ca=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const ac=new WeakMap,Ys=new WeakMap,uc=new WeakMap,Us=new WeakMap,Ri=new WeakMap;function df(n){const t=new Promise((e,r)=>{const s=()=>{n.removeEventListener("success",o),n.removeEventListener("error",a)},o=()=>{e(ue(n.result)),s()},a=()=>{r(n.error),s()};n.addEventListener("success",o),n.addEventListener("error",a)});return t.then(e=>{e instanceof IDBCursor&&ac.set(e,n)}).catch(()=>{}),Ri.set(t,n),t}function ff(n){if(Ys.has(n))return;const t=new Promise((e,r)=>{const s=()=>{n.removeEventListener("complete",o),n.removeEventListener("error",a),n.removeEventListener("abort",a)},o=()=>{e(),s()},a=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",o),n.addEventListener("error",a),n.addEventListener("abort",a)});Ys.set(n,t)}let Js={get(n,t,e){if(n instanceof IDBTransaction){if(t==="done")return Ys.get(n);if(t==="objectStoreNames")return n.objectStoreNames||uc.get(n);if(t==="store")return e.objectStoreNames[1]?void 0:e.objectStore(e.objectStoreNames[0])}return ue(n[t])},set(n,t,e){return n[t]=e,!0},has(n,t){return n instanceof IDBTransaction&&(t==="done"||t==="store")?!0:t in n}};function pf(n){Js=n(Js)}function mf(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(t,...e){const r=n.call(Bs(this),t,...e);return uc.set(r,t.sort?t.sort():[t]),ue(r)}:hf().includes(n)?function(...t){return n.apply(Bs(this),t),ue(ac.get(this))}:function(...t){return ue(n.apply(Bs(this),t))}}function gf(n){return typeof n=="function"?mf(n):(n instanceof IDBTransaction&&ff(n),cf(n,lf())?new Proxy(n,Js):n)}function ue(n){if(n instanceof IDBRequest)return df(n);if(Us.has(n))return Us.get(n);const t=gf(n);return t!==n&&(Us.set(n,t),Ri.set(t,n)),t}const Bs=n=>Ri.get(n);function cc(n,t,{blocked:e,upgrade:r,blocking:s,terminated:o}={}){const a=indexedDB.open(n,t),c=ue(a);return r&&a.addEventListener("upgradeneeded",h=>{r(ue(a.result),h.oldVersion,h.newVersion,ue(a.transaction),h)}),e&&a.addEventListener("blocked",h=>e(h.oldVersion,h.newVersion,h)),c.then(h=>{o&&h.addEventListener("close",()=>o()),s&&h.addEventListener("versionchange",d=>s(d.oldVersion,d.newVersion,d))}).catch(()=>{}),c}const _f=["get","getKey","getAll","getAllKeys","count"],yf=["put","add","delete","clear"],js=new Map;function Va(n,t){if(!(n instanceof IDBDatabase&&!(t in n)&&typeof t=="string"))return;if(js.get(t))return js.get(t);const e=t.replace(/FromIndex$/,""),r=t!==e,s=yf.includes(e);if(!(e in(r?IDBIndex:IDBObjectStore).prototype)||!(s||_f.includes(e)))return;const o=async function(a,...c){const h=this.transaction(a,s?"readwrite":"readonly");let d=h.store;return r&&(d=d.index(c.shift())),(await Promise.all([d[e](...c),s&&h.done]))[0]};return js.set(t,o),o}pf(n=>({...n,get:(t,e,r)=>Va(t,e)||n.get(t,e,r),has:(t,e)=>!!Va(t,e)||n.has(t,e)}));/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vf{constructor(t){this.container=t}getPlatformInfoString(){return this.container.getProviders().map(e=>{if(Ef(e)){const r=e.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(e=>e).join(" ")}}function Ef(n){const t=n.getComponent();return(t==null?void 0:t.type)==="VERSION"}const Zs="@firebase/app",Da="0.13.2";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ee=new Si("@firebase/app"),Tf="@firebase/app-compat",If="@firebase/analytics-compat",wf="@firebase/analytics",Af="@firebase/app-check-compat",Sf="@firebase/app-check",Rf="@firebase/auth",bf="@firebase/auth-compat",Pf="@firebase/database",Cf="@firebase/data-connect",Vf="@firebase/database-compat",Df="@firebase/functions",kf="@firebase/functions-compat",Nf="@firebase/installations",Of="@firebase/installations-compat",xf="@firebase/messaging",Mf="@firebase/messaging-compat",Lf="@firebase/performance",Ff="@firebase/performance-compat",Uf="@firebase/remote-config",Bf="@firebase/remote-config-compat",jf="@firebase/storage",qf="@firebase/storage-compat",$f="@firebase/firestore",zf="@firebase/ai",Gf="@firebase/firestore-compat",Hf="firebase",Wf="11.10.0";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ti="[DEFAULT]",Kf={[Zs]:"fire-core",[Tf]:"fire-core-compat",[wf]:"fire-analytics",[If]:"fire-analytics-compat",[Sf]:"fire-app-check",[Af]:"fire-app-check-compat",[Rf]:"fire-auth",[bf]:"fire-auth-compat",[Pf]:"fire-rtdb",[Cf]:"fire-data-connect",[Vf]:"fire-rtdb-compat",[Df]:"fire-fn",[kf]:"fire-fn-compat",[Nf]:"fire-iid",[Of]:"fire-iid-compat",[xf]:"fire-fcm",[Mf]:"fire-fcm-compat",[Lf]:"fire-perf",[Ff]:"fire-perf-compat",[Uf]:"fire-rc",[Bf]:"fire-rc-compat",[jf]:"fire-gcs",[qf]:"fire-gcs-compat",[$f]:"fire-fst",[Gf]:"fire-fst-compat",[zf]:"fire-vertex","fire-js":"fire-js",[Hf]:"fire-js-all"};/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const xr=new Map,Qf=new Map,ei=new Map;function ka(n,t){try{n.container.addComponent(t)}catch(e){ee.debug(`Component ${t.name} failed to register with FirebaseApp ${n.name}`,e)}}function fe(n){const t=n.name;if(ei.has(t))return ee.debug(`There were multiple attempts to register component ${t}.`),!1;ei.set(t,n);for(const e of xr.values())ka(e,n);for(const e of Qf.values())ka(e,n);return!0}function Qn(n,t){const e=n.container.getProvider("heartbeat").getImmediate({optional:!0});return e&&e.triggerHeartbeat(),n.container.getProvider(t)}function Xf(n){return n==null?!1:n.settings!==void 0}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Yf={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},ce=new Jr("app","Firebase",Yf);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Jf{constructor(t,e,r){this._isDeleted=!1,this._options=Object.assign({},t),this._config=Object.assign({},e),this._name=e.name,this._automaticDataCollectionEnabled=e.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new te("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(t){this.checkDestroyed(),this._automaticDataCollectionEnabled=t}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(t){this._isDeleted=t}checkDestroyed(){if(this.isDeleted)throw ce.create("app-deleted",{appName:this._name})}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Zf=Wf;function tp(n,t={}){let e=n;typeof t!="object"&&(t={name:t});const r=Object.assign({name:ti,automaticDataCollectionEnabled:!0},t),s=r.name;if(typeof s!="string"||!s)throw ce.create("bad-app-name",{appName:String(s)});if(e||(e=sc()),!e)throw ce.create("no-options");const o=xr.get(s);if(o){if(Bn(e,o.options)&&Bn(r,o.config))return o;throw ce.create("duplicate-app",{appName:s})}const a=new rf(s);for(const h of ei.values())a.addComponent(h);const c=new Jf(e,r,a);return xr.set(s,c),c}function lc(n=ti){const t=xr.get(n);if(!t&&n===ti&&sc())return tp();if(!t)throw ce.create("no-app",{appName:n});return t}function Jt(n,t,e){var r;let s=(r=Kf[n])!==null&&r!==void 0?r:n;e&&(s+=`-${e}`);const o=s.match(/\s|\//),a=t.match(/\s|\//);if(o||a){const c=[`Unable to register library "${s}" with version "${t}":`];o&&c.push(`library name "${s}" contains illegal characters (whitespace or "/")`),o&&a&&c.push("and"),a&&c.push(`version name "${t}" contains illegal characters (whitespace or "/")`),ee.warn(c.join(" "));return}fe(new te(`${s}-version`,()=>({library:s,version:t}),"VERSION"))}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ep="firebase-heartbeat-database",np=1,jn="firebase-heartbeat-store";let qs=null;function hc(){return qs||(qs=cc(ep,np,{upgrade:(n,t)=>{switch(t){case 0:try{n.createObjectStore(jn)}catch(e){console.warn(e)}}}}).catch(n=>{throw ce.create("idb-open",{originalErrorMessage:n.message})})),qs}async function rp(n){try{const e=(await hc()).transaction(jn),r=await e.objectStore(jn).get(dc(n));return await e.done,r}catch(t){if(t instanceof we)ee.warn(t.message);else{const e=ce.create("idb-get",{originalErrorMessage:t==null?void 0:t.message});ee.warn(e.message)}}}async function Na(n,t){try{const r=(await hc()).transaction(jn,"readwrite");await r.objectStore(jn).put(t,dc(n)),await r.done}catch(e){if(e instanceof we)ee.warn(e.message);else{const r=ce.create("idb-set",{originalErrorMessage:e==null?void 0:e.message});ee.warn(r.message)}}}function dc(n){return`${n.name}!${n.options.appId}`}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const sp=1024,ip=30;class op{constructor(t){this.container=t,this._heartbeatsCache=null;const e=this.container.getProvider("app").getImmediate();this._storage=new up(e),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var t,e;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),o=Oa();if(((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===o||this._heartbeatsCache.heartbeats.some(a=>a.date===o))return;if(this._heartbeatsCache.heartbeats.push({date:o,agent:s}),this._heartbeatsCache.heartbeats.length>ip){const a=cp(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(a,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){ee.warn(r)}}async getHeartbeatsHeader(){var t;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const e=Oa(),{heartbeatsToSend:r,unsentEntries:s}=ap(this._heartbeatsCache.heartbeats),o=Or(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=e,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),o}catch(e){return ee.warn(e),""}}}function Oa(){return new Date().toISOString().substring(0,10)}function ap(n,t=sp){const e=[];let r=n.slice();for(const s of n){const o=e.find(a=>a.agent===s.agent);if(o){if(o.dates.push(s.date),xa(e)>t){o.dates.pop();break}}else if(e.push({agent:s.agent,dates:[s.date]}),xa(e)>t){e.pop();break}r=r.slice(1)}return{heartbeatsToSend:e,unsentEntries:r}}class up{constructor(t){this.app=t,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return wi()?Ai().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const e=await rp(this.app);return e!=null&&e.heartbeats?e:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(t){var e;if(await this._canUseIndexedDBPromise){const s=await this.read();return Na(this.app,{lastSentHeartbeatDate:(e=t.lastSentHeartbeatDate)!==null&&e!==void 0?e:s.lastSentHeartbeatDate,heartbeats:t.heartbeats})}else return}async add(t){var e;if(await this._canUseIndexedDBPromise){const s=await this.read();return Na(this.app,{lastSentHeartbeatDate:(e=t.lastSentHeartbeatDate)!==null&&e!==void 0?e:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...t.heartbeats]})}else return}}function xa(n){return Or(JSON.stringify({version:2,heartbeats:n})).length}function cp(n){if(n.length===0)return-1;let t=0,e=n[0].date;for(let r=1;r<n.length;r++)n[r].date<e&&(e=n[r].date,t=r);return t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function lp(n){fe(new te("platform-logger",t=>new vf(t),"PRIVATE")),fe(new te("heartbeat",t=>new op(t),"PRIVATE")),Jt(Zs,Da,n),Jt(Zs,Da,"esm2017"),Jt("fire-js","")}lp("");function Rv(n,t){var e={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&t.indexOf(r)<0&&(e[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(n);s<r.length;s++)t.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(n,r[s])&&(e[r[s]]=n[r[s]]);return e}var Ma=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var le,fc;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function t(I,m){function _(){}_.prototype=m.prototype,I.D=m.prototype,I.prototype=new _,I.prototype.constructor=I,I.C=function(E,T,A){for(var g=Array(arguments.length-2),kt=2;kt<arguments.length;kt++)g[kt-2]=arguments[kt];return m.prototype[T].apply(E,g)}}function e(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}t(r,e),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(I,m,_){_||(_=0);var E=Array(16);if(typeof m=="string")for(var T=0;16>T;++T)E[T]=m.charCodeAt(_++)|m.charCodeAt(_++)<<8|m.charCodeAt(_++)<<16|m.charCodeAt(_++)<<24;else for(T=0;16>T;++T)E[T]=m[_++]|m[_++]<<8|m[_++]<<16|m[_++]<<24;m=I.g[0],_=I.g[1],T=I.g[2];var A=I.g[3],g=m+(A^_&(T^A))+E[0]+3614090360&4294967295;m=_+(g<<7&4294967295|g>>>25),g=A+(T^m&(_^T))+E[1]+3905402710&4294967295,A=m+(g<<12&4294967295|g>>>20),g=T+(_^A&(m^_))+E[2]+606105819&4294967295,T=A+(g<<17&4294967295|g>>>15),g=_+(m^T&(A^m))+E[3]+3250441966&4294967295,_=T+(g<<22&4294967295|g>>>10),g=m+(A^_&(T^A))+E[4]+4118548399&4294967295,m=_+(g<<7&4294967295|g>>>25),g=A+(T^m&(_^T))+E[5]+1200080426&4294967295,A=m+(g<<12&4294967295|g>>>20),g=T+(_^A&(m^_))+E[6]+2821735955&4294967295,T=A+(g<<17&4294967295|g>>>15),g=_+(m^T&(A^m))+E[7]+4249261313&4294967295,_=T+(g<<22&4294967295|g>>>10),g=m+(A^_&(T^A))+E[8]+1770035416&4294967295,m=_+(g<<7&4294967295|g>>>25),g=A+(T^m&(_^T))+E[9]+2336552879&4294967295,A=m+(g<<12&4294967295|g>>>20),g=T+(_^A&(m^_))+E[10]+4294925233&4294967295,T=A+(g<<17&4294967295|g>>>15),g=_+(m^T&(A^m))+E[11]+2304563134&4294967295,_=T+(g<<22&4294967295|g>>>10),g=m+(A^_&(T^A))+E[12]+1804603682&4294967295,m=_+(g<<7&4294967295|g>>>25),g=A+(T^m&(_^T))+E[13]+4254626195&4294967295,A=m+(g<<12&4294967295|g>>>20),g=T+(_^A&(m^_))+E[14]+2792965006&4294967295,T=A+(g<<17&4294967295|g>>>15),g=_+(m^T&(A^m))+E[15]+1236535329&4294967295,_=T+(g<<22&4294967295|g>>>10),g=m+(T^A&(_^T))+E[1]+4129170786&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^T&(m^_))+E[6]+3225465664&4294967295,A=m+(g<<9&4294967295|g>>>23),g=T+(m^_&(A^m))+E[11]+643717713&4294967295,T=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(T^A))+E[0]+3921069994&4294967295,_=T+(g<<20&4294967295|g>>>12),g=m+(T^A&(_^T))+E[5]+3593408605&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^T&(m^_))+E[10]+38016083&4294967295,A=m+(g<<9&4294967295|g>>>23),g=T+(m^_&(A^m))+E[15]+3634488961&4294967295,T=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(T^A))+E[4]+3889429448&4294967295,_=T+(g<<20&4294967295|g>>>12),g=m+(T^A&(_^T))+E[9]+568446438&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^T&(m^_))+E[14]+3275163606&4294967295,A=m+(g<<9&4294967295|g>>>23),g=T+(m^_&(A^m))+E[3]+4107603335&4294967295,T=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(T^A))+E[8]+1163531501&4294967295,_=T+(g<<20&4294967295|g>>>12),g=m+(T^A&(_^T))+E[13]+2850285829&4294967295,m=_+(g<<5&4294967295|g>>>27),g=A+(_^T&(m^_))+E[2]+4243563512&4294967295,A=m+(g<<9&4294967295|g>>>23),g=T+(m^_&(A^m))+E[7]+1735328473&4294967295,T=A+(g<<14&4294967295|g>>>18),g=_+(A^m&(T^A))+E[12]+2368359562&4294967295,_=T+(g<<20&4294967295|g>>>12),g=m+(_^T^A)+E[5]+4294588738&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^T)+E[8]+2272392833&4294967295,A=m+(g<<11&4294967295|g>>>21),g=T+(A^m^_)+E[11]+1839030562&4294967295,T=A+(g<<16&4294967295|g>>>16),g=_+(T^A^m)+E[14]+4259657740&4294967295,_=T+(g<<23&4294967295|g>>>9),g=m+(_^T^A)+E[1]+2763975236&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^T)+E[4]+1272893353&4294967295,A=m+(g<<11&4294967295|g>>>21),g=T+(A^m^_)+E[7]+4139469664&4294967295,T=A+(g<<16&4294967295|g>>>16),g=_+(T^A^m)+E[10]+3200236656&4294967295,_=T+(g<<23&4294967295|g>>>9),g=m+(_^T^A)+E[13]+681279174&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^T)+E[0]+3936430074&4294967295,A=m+(g<<11&4294967295|g>>>21),g=T+(A^m^_)+E[3]+3572445317&4294967295,T=A+(g<<16&4294967295|g>>>16),g=_+(T^A^m)+E[6]+76029189&4294967295,_=T+(g<<23&4294967295|g>>>9),g=m+(_^T^A)+E[9]+3654602809&4294967295,m=_+(g<<4&4294967295|g>>>28),g=A+(m^_^T)+E[12]+3873151461&4294967295,A=m+(g<<11&4294967295|g>>>21),g=T+(A^m^_)+E[15]+530742520&4294967295,T=A+(g<<16&4294967295|g>>>16),g=_+(T^A^m)+E[2]+3299628645&4294967295,_=T+(g<<23&4294967295|g>>>9),g=m+(T^(_|~A))+E[0]+4096336452&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~T))+E[7]+1126891415&4294967295,A=m+(g<<10&4294967295|g>>>22),g=T+(m^(A|~_))+E[14]+2878612391&4294967295,T=A+(g<<15&4294967295|g>>>17),g=_+(A^(T|~m))+E[5]+4237533241&4294967295,_=T+(g<<21&4294967295|g>>>11),g=m+(T^(_|~A))+E[12]+1700485571&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~T))+E[3]+2399980690&4294967295,A=m+(g<<10&4294967295|g>>>22),g=T+(m^(A|~_))+E[10]+4293915773&4294967295,T=A+(g<<15&4294967295|g>>>17),g=_+(A^(T|~m))+E[1]+2240044497&4294967295,_=T+(g<<21&4294967295|g>>>11),g=m+(T^(_|~A))+E[8]+1873313359&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~T))+E[15]+4264355552&4294967295,A=m+(g<<10&4294967295|g>>>22),g=T+(m^(A|~_))+E[6]+2734768916&4294967295,T=A+(g<<15&4294967295|g>>>17),g=_+(A^(T|~m))+E[13]+1309151649&4294967295,_=T+(g<<21&4294967295|g>>>11),g=m+(T^(_|~A))+E[4]+4149444226&4294967295,m=_+(g<<6&4294967295|g>>>26),g=A+(_^(m|~T))+E[11]+3174756917&4294967295,A=m+(g<<10&4294967295|g>>>22),g=T+(m^(A|~_))+E[2]+718787259&4294967295,T=A+(g<<15&4294967295|g>>>17),g=_+(A^(T|~m))+E[9]+3951481745&4294967295,I.g[0]=I.g[0]+m&4294967295,I.g[1]=I.g[1]+(T+(g<<21&4294967295|g>>>11))&4294967295,I.g[2]=I.g[2]+T&4294967295,I.g[3]=I.g[3]+A&4294967295}r.prototype.u=function(I,m){m===void 0&&(m=I.length);for(var _=m-this.blockSize,E=this.B,T=this.h,A=0;A<m;){if(T==0)for(;A<=_;)s(this,I,A),A+=this.blockSize;if(typeof I=="string"){for(;A<m;)if(E[T++]=I.charCodeAt(A++),T==this.blockSize){s(this,E),T=0;break}}else for(;A<m;)if(E[T++]=I[A++],T==this.blockSize){s(this,E),T=0;break}}this.h=T,this.o+=m},r.prototype.v=function(){var I=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);I[0]=128;for(var m=1;m<I.length-8;++m)I[m]=0;var _=8*this.o;for(m=I.length-8;m<I.length;++m)I[m]=_&255,_/=256;for(this.u(I),I=Array(16),m=_=0;4>m;++m)for(var E=0;32>E;E+=8)I[_++]=this.g[m]>>>E&255;return I};function o(I,m){var _=c;return Object.prototype.hasOwnProperty.call(_,I)?_[I]:_[I]=m(I)}function a(I,m){this.h=m;for(var _=[],E=!0,T=I.length-1;0<=T;T--){var A=I[T]|0;E&&A==m||(_[T]=A,E=!1)}this.g=_}var c={};function h(I){return-128<=I&&128>I?o(I,function(m){return new a([m|0],0>m?-1:0)}):new a([I|0],0>I?-1:0)}function d(I){if(isNaN(I)||!isFinite(I))return y;if(0>I)return C(d(-I));for(var m=[],_=1,E=0;I>=_;E++)m[E]=I/_|0,_*=4294967296;return new a(m,0)}function p(I,m){if(I.length==0)throw Error("number format error: empty string");if(m=m||10,2>m||36<m)throw Error("radix out of range: "+m);if(I.charAt(0)=="-")return C(p(I.substring(1),m));if(0<=I.indexOf("-"))throw Error('number format error: interior "-" character');for(var _=d(Math.pow(m,8)),E=y,T=0;T<I.length;T+=8){var A=Math.min(8,I.length-T),g=parseInt(I.substring(T,T+A),m);8>A?(A=d(Math.pow(m,A)),E=E.j(A).add(d(g))):(E=E.j(_),E=E.add(d(g)))}return E}var y=h(0),v=h(1),R=h(16777216);n=a.prototype,n.m=function(){if(k(this))return-C(this).m();for(var I=0,m=1,_=0;_<this.g.length;_++){var E=this.i(_);I+=(0<=E?E:4294967296+E)*m,m*=4294967296}return I},n.toString=function(I){if(I=I||10,2>I||36<I)throw Error("radix out of range: "+I);if(V(this))return"0";if(k(this))return"-"+C(this).toString(I);for(var m=d(Math.pow(I,6)),_=this,E="";;){var T=Y(_,m).g;_=U(_,T.j(m));var A=((0<_.g.length?_.g[0]:_.h)>>>0).toString(I);if(_=T,V(_))return A+E;for(;6>A.length;)A="0"+A;E=A+E}},n.i=function(I){return 0>I?0:I<this.g.length?this.g[I]:this.h};function V(I){if(I.h!=0)return!1;for(var m=0;m<I.g.length;m++)if(I.g[m]!=0)return!1;return!0}function k(I){return I.h==-1}n.l=function(I){return I=U(this,I),k(I)?-1:V(I)?0:1};function C(I){for(var m=I.g.length,_=[],E=0;E<m;E++)_[E]=~I.g[E];return new a(_,~I.h).add(v)}n.abs=function(){return k(this)?C(this):this},n.add=function(I){for(var m=Math.max(this.g.length,I.g.length),_=[],E=0,T=0;T<=m;T++){var A=E+(this.i(T)&65535)+(I.i(T)&65535),g=(A>>>16)+(this.i(T)>>>16)+(I.i(T)>>>16);E=g>>>16,A&=65535,g&=65535,_[T]=g<<16|A}return new a(_,_[_.length-1]&-2147483648?-1:0)};function U(I,m){return I.add(C(m))}n.j=function(I){if(V(this)||V(I))return y;if(k(this))return k(I)?C(this).j(C(I)):C(C(this).j(I));if(k(I))return C(this.j(C(I)));if(0>this.l(R)&&0>I.l(R))return d(this.m()*I.m());for(var m=this.g.length+I.g.length,_=[],E=0;E<2*m;E++)_[E]=0;for(E=0;E<this.g.length;E++)for(var T=0;T<I.g.length;T++){var A=this.i(E)>>>16,g=this.i(E)&65535,kt=I.i(T)>>>16,Ae=I.i(T)&65535;_[2*E+2*T]+=g*Ae,L(_,2*E+2*T),_[2*E+2*T+1]+=A*Ae,L(_,2*E+2*T+1),_[2*E+2*T+1]+=g*kt,L(_,2*E+2*T+1),_[2*E+2*T+2]+=A*kt,L(_,2*E+2*T+2)}for(E=0;E<m;E++)_[E]=_[2*E+1]<<16|_[2*E];for(E=m;E<2*m;E++)_[E]=0;return new a(_,0)};function L(I,m){for(;(I[m]&65535)!=I[m];)I[m+1]+=I[m]>>>16,I[m]&=65535,m++}function z(I,m){this.g=I,this.h=m}function Y(I,m){if(V(m))throw Error("division by zero");if(V(I))return new z(y,y);if(k(I))return m=Y(C(I),m),new z(C(m.g),C(m.h));if(k(m))return m=Y(I,C(m)),new z(C(m.g),m.h);if(30<I.g.length){if(k(I)||k(m))throw Error("slowDivide_ only works with positive integers.");for(var _=v,E=m;0>=E.l(I);)_=mt(_),E=mt(E);var T=it(_,1),A=it(E,1);for(E=it(E,2),_=it(_,2);!V(E);){var g=A.add(E);0>=g.l(I)&&(T=T.add(_),A=g),E=it(E,1),_=it(_,1)}return m=U(I,T.j(m)),new z(T,m)}for(T=y;0<=I.l(m);){for(_=Math.max(1,Math.floor(I.m()/m.m())),E=Math.ceil(Math.log(_)/Math.LN2),E=48>=E?1:Math.pow(2,E-48),A=d(_),g=A.j(m);k(g)||0<g.l(I);)_-=E,A=d(_),g=A.j(m);V(A)&&(A=v),T=T.add(A),I=U(I,g)}return new z(T,I)}n.A=function(I){return Y(this,I).h},n.and=function(I){for(var m=Math.max(this.g.length,I.g.length),_=[],E=0;E<m;E++)_[E]=this.i(E)&I.i(E);return new a(_,this.h&I.h)},n.or=function(I){for(var m=Math.max(this.g.length,I.g.length),_=[],E=0;E<m;E++)_[E]=this.i(E)|I.i(E);return new a(_,this.h|I.h)},n.xor=function(I){for(var m=Math.max(this.g.length,I.g.length),_=[],E=0;E<m;E++)_[E]=this.i(E)^I.i(E);return new a(_,this.h^I.h)};function mt(I){for(var m=I.g.length+1,_=[],E=0;E<m;E++)_[E]=I.i(E)<<1|I.i(E-1)>>>31;return new a(_,I.h)}function it(I,m){var _=m>>5;m%=32;for(var E=I.g.length-_,T=[],A=0;A<E;A++)T[A]=0<m?I.i(A+_)>>>m|I.i(A+_+1)<<32-m:I.i(A+_);return new a(T,I.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,fc=r,a.prototype.add=a.prototype.add,a.prototype.multiply=a.prototype.j,a.prototype.modulo=a.prototype.A,a.prototype.compare=a.prototype.l,a.prototype.toNumber=a.prototype.m,a.prototype.toString=a.prototype.toString,a.prototype.getBits=a.prototype.i,a.fromNumber=d,a.fromString=p,le=a}).apply(typeof Ma<"u"?Ma:typeof self<"u"?self:typeof window<"u"?window:{});var Tr=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var pc,bn,mc,br,ni,gc,_c,yc;(function(){var n,t=typeof Object.defineProperties=="function"?Object.defineProperty:function(i,u,l){return i==Array.prototype||i==Object.prototype||(i[u]=l.value),i};function e(i){i=[typeof globalThis=="object"&&globalThis,i,typeof window=="object"&&window,typeof self=="object"&&self,typeof Tr=="object"&&Tr];for(var u=0;u<i.length;++u){var l=i[u];if(l&&l.Math==Math)return l}throw Error("Cannot find global object")}var r=e(this);function s(i,u){if(u)t:{var l=r;i=i.split(".");for(var f=0;f<i.length-1;f++){var w=i[f];if(!(w in l))break t;l=l[w]}i=i[i.length-1],f=l[i],u=u(f),u!=f&&u!=null&&t(l,i,{configurable:!0,writable:!0,value:u})}}function o(i,u){i instanceof String&&(i+="");var l=0,f=!1,w={next:function(){if(!f&&l<i.length){var S=l++;return{value:u(S,i[S]),done:!1}}return f=!0,{done:!0,value:void 0}}};return w[Symbol.iterator]=function(){return w},w}s("Array.prototype.values",function(i){return i||function(){return o(this,function(u,l){return l})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var a=a||{},c=this||self;function h(i){var u=typeof i;return u=u!="object"?u:i?Array.isArray(i)?"array":u:"null",u=="array"||u=="object"&&typeof i.length=="number"}function d(i){var u=typeof i;return u=="object"&&i!=null||u=="function"}function p(i,u,l){return i.call.apply(i.bind,arguments)}function y(i,u,l){if(!i)throw Error();if(2<arguments.length){var f=Array.prototype.slice.call(arguments,2);return function(){var w=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(w,f),i.apply(u,w)}}return function(){return i.apply(u,arguments)}}function v(i,u,l){return v=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?p:y,v.apply(null,arguments)}function R(i,u){var l=Array.prototype.slice.call(arguments,1);return function(){var f=l.slice();return f.push.apply(f,arguments),i.apply(this,f)}}function V(i,u){function l(){}l.prototype=u.prototype,i.aa=u.prototype,i.prototype=new l,i.prototype.constructor=i,i.Qb=function(f,w,S){for(var D=Array(arguments.length-2),Z=2;Z<arguments.length;Z++)D[Z-2]=arguments[Z];return u.prototype[w].apply(f,D)}}function k(i){const u=i.length;if(0<u){const l=Array(u);for(let f=0;f<u;f++)l[f]=i[f];return l}return[]}function C(i,u){for(let l=1;l<arguments.length;l++){const f=arguments[l];if(h(f)){const w=i.length||0,S=f.length||0;i.length=w+S;for(let D=0;D<S;D++)i[w+D]=f[D]}else i.push(f)}}class U{constructor(u,l){this.i=u,this.j=l,this.h=0,this.g=null}get(){let u;return 0<this.h?(this.h--,u=this.g,this.g=u.next,u.next=null):u=this.i(),u}}function L(i){return/^[\s\xa0]*$/.test(i)}function z(){var i=c.navigator;return i&&(i=i.userAgent)?i:""}function Y(i){return Y[" "](i),i}Y[" "]=function(){};var mt=z().indexOf("Gecko")!=-1&&!(z().toLowerCase().indexOf("webkit")!=-1&&z().indexOf("Edge")==-1)&&!(z().indexOf("Trident")!=-1||z().indexOf("MSIE")!=-1)&&z().indexOf("Edge")==-1;function it(i,u,l){for(const f in i)u.call(l,i[f],f,i)}function I(i,u){for(const l in i)u.call(void 0,i[l],l,i)}function m(i){const u={};for(const l in i)u[l]=i[l];return u}const _="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function E(i,u){let l,f;for(let w=1;w<arguments.length;w++){f=arguments[w];for(l in f)i[l]=f[l];for(let S=0;S<_.length;S++)l=_[S],Object.prototype.hasOwnProperty.call(f,l)&&(i[l]=f[l])}}function T(i){var u=1;i=i.split(":");const l=[];for(;0<u&&i.length;)l.push(i.shift()),u--;return i.length&&l.push(i.join(":")),l}function A(i){c.setTimeout(()=>{throw i},0)}function g(){var i=B;let u=null;return i.g&&(u=i.g,i.g=i.g.next,i.g||(i.h=null),u.next=null),u}class kt{constructor(){this.h=this.g=null}add(u,l){const f=Ae.get();f.set(u,l),this.h?this.h.next=f:this.g=f,this.h=f}}var Ae=new U(()=>new fn,i=>i.reset());class fn{constructor(){this.next=this.g=this.h=null}set(u,l){this.h=u,this.g=l,this.next=null}reset(){this.next=this.g=this.h=null}}let Gt,O=!1,B=new kt,$=()=>{const i=c.Promise.resolve(void 0);Gt=()=>{i.then(rt)}};var rt=()=>{for(var i;i=g();){try{i.h.call(i.g)}catch(l){A(l)}var u=Ae;u.j(i),100>u.h&&(u.h++,i.next=u.g,u.g=i)}O=!1};function J(){this.s=this.s,this.C=this.C}J.prototype.s=!1,J.prototype.ma=function(){this.s||(this.s=!0,this.N())},J.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function at(i,u){this.type=i,this.g=this.target=u,this.defaultPrevented=!1}at.prototype.h=function(){this.defaultPrevented=!0};var Ht=function(){if(!c.addEventListener||!Object.defineProperty)return!1;var i=!1,u=Object.defineProperty({},"passive",{get:function(){i=!0}});try{const l=()=>{};c.addEventListener("test",l,u),c.removeEventListener("test",l,u)}catch{}return i}();function Wt(i,u){if(at.call(this,i?i.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,i){var l=this.type=i.type,f=i.changedTouches&&i.changedTouches.length?i.changedTouches[0]:null;if(this.target=i.target||i.srcElement,this.g=u,u=i.relatedTarget){if(mt){t:{try{Y(u.nodeName);var w=!0;break t}catch{}w=!1}w||(u=null)}}else l=="mouseover"?u=i.fromElement:l=="mouseout"&&(u=i.toElement);this.relatedTarget=u,f?(this.clientX=f.clientX!==void 0?f.clientX:f.pageX,this.clientY=f.clientY!==void 0?f.clientY:f.pageY,this.screenX=f.screenX||0,this.screenY=f.screenY||0):(this.clientX=i.clientX!==void 0?i.clientX:i.pageX,this.clientY=i.clientY!==void 0?i.clientY:i.pageY,this.screenX=i.screenX||0,this.screenY=i.screenY||0),this.button=i.button,this.key=i.key||"",this.ctrlKey=i.ctrlKey,this.altKey=i.altKey,this.shiftKey=i.shiftKey,this.metaKey=i.metaKey,this.pointerId=i.pointerId||0,this.pointerType=typeof i.pointerType=="string"?i.pointerType:Kt[i.pointerType]||"",this.state=i.state,this.i=i,i.defaultPrevented&&Wt.aa.h.call(this)}}V(Wt,at);var Kt={2:"touch",3:"pen",4:"mouse"};Wt.prototype.h=function(){Wt.aa.h.call(this);var i=this.i;i.preventDefault?i.preventDefault():i.returnValue=!1};var Qt="closure_listenable_"+(1e6*Math.random()|0),Ah=0;function Sh(i,u,l,f,w){this.listener=i,this.proxy=null,this.src=u,this.type=l,this.capture=!!f,this.ha=w,this.key=++Ah,this.da=this.fa=!1}function rr(i){i.da=!0,i.listener=null,i.proxy=null,i.src=null,i.ha=null}function sr(i){this.src=i,this.g={},this.h=0}sr.prototype.add=function(i,u,l,f,w){var S=i.toString();i=this.g[S],i||(i=this.g[S]=[],this.h++);var D=ms(i,u,f,w);return-1<D?(u=i[D],l||(u.fa=!1)):(u=new Sh(u,this.src,S,!!f,w),u.fa=l,i.push(u)),u};function ps(i,u){var l=u.type;if(l in i.g){var f=i.g[l],w=Array.prototype.indexOf.call(f,u,void 0),S;(S=0<=w)&&Array.prototype.splice.call(f,w,1),S&&(rr(u),i.g[l].length==0&&(delete i.g[l],i.h--))}}function ms(i,u,l,f){for(var w=0;w<i.length;++w){var S=i[w];if(!S.da&&S.listener==u&&S.capture==!!l&&S.ha==f)return w}return-1}var gs="closure_lm_"+(1e6*Math.random()|0),_s={};function Eo(i,u,l,f,w){if(Array.isArray(u)){for(var S=0;S<u.length;S++)Eo(i,u[S],l,f,w);return null}return l=wo(l),i&&i[Qt]?i.K(u,l,d(f)?!!f.capture:!1,w):Rh(i,u,l,!1,f,w)}function Rh(i,u,l,f,w,S){if(!u)throw Error("Invalid event type");var D=d(w)?!!w.capture:!!w,Z=vs(i);if(Z||(i[gs]=Z=new sr(i)),l=Z.add(u,l,f,D,S),l.proxy)return l;if(f=bh(),l.proxy=f,f.src=i,f.listener=l,i.addEventListener)Ht||(w=D),w===void 0&&(w=!1),i.addEventListener(u.toString(),f,w);else if(i.attachEvent)i.attachEvent(Io(u.toString()),f);else if(i.addListener&&i.removeListener)i.addListener(f);else throw Error("addEventListener and attachEvent are unavailable.");return l}function bh(){function i(l){return u.call(i.src,i.listener,l)}const u=Ph;return i}function To(i,u,l,f,w){if(Array.isArray(u))for(var S=0;S<u.length;S++)To(i,u[S],l,f,w);else f=d(f)?!!f.capture:!!f,l=wo(l),i&&i[Qt]?(i=i.i,u=String(u).toString(),u in i.g&&(S=i.g[u],l=ms(S,l,f,w),-1<l&&(rr(S[l]),Array.prototype.splice.call(S,l,1),S.length==0&&(delete i.g[u],i.h--)))):i&&(i=vs(i))&&(u=i.g[u.toString()],i=-1,u&&(i=ms(u,l,f,w)),(l=-1<i?u[i]:null)&&ys(l))}function ys(i){if(typeof i!="number"&&i&&!i.da){var u=i.src;if(u&&u[Qt])ps(u.i,i);else{var l=i.type,f=i.proxy;u.removeEventListener?u.removeEventListener(l,f,i.capture):u.detachEvent?u.detachEvent(Io(l),f):u.addListener&&u.removeListener&&u.removeListener(f),(l=vs(u))?(ps(l,i),l.h==0&&(l.src=null,u[gs]=null)):rr(i)}}}function Io(i){return i in _s?_s[i]:_s[i]="on"+i}function Ph(i,u){if(i.da)i=!0;else{u=new Wt(u,this);var l=i.listener,f=i.ha||i.src;i.fa&&ys(i),i=l.call(f,u)}return i}function vs(i){return i=i[gs],i instanceof sr?i:null}var Es="__closure_events_fn_"+(1e9*Math.random()>>>0);function wo(i){return typeof i=="function"?i:(i[Es]||(i[Es]=function(u){return i.handleEvent(u)}),i[Es])}function Et(){J.call(this),this.i=new sr(this),this.M=this,this.F=null}V(Et,J),Et.prototype[Qt]=!0,Et.prototype.removeEventListener=function(i,u,l,f){To(this,i,u,l,f)};function Rt(i,u){var l,f=i.F;if(f)for(l=[];f;f=f.F)l.push(f);if(i=i.M,f=u.type||u,typeof u=="string")u=new at(u,i);else if(u instanceof at)u.target=u.target||i;else{var w=u;u=new at(f,i),E(u,w)}if(w=!0,l)for(var S=l.length-1;0<=S;S--){var D=u.g=l[S];w=ir(D,f,!0,u)&&w}if(D=u.g=i,w=ir(D,f,!0,u)&&w,w=ir(D,f,!1,u)&&w,l)for(S=0;S<l.length;S++)D=u.g=l[S],w=ir(D,f,!1,u)&&w}Et.prototype.N=function(){if(Et.aa.N.call(this),this.i){var i=this.i,u;for(u in i.g){for(var l=i.g[u],f=0;f<l.length;f++)rr(l[f]);delete i.g[u],i.h--}}this.F=null},Et.prototype.K=function(i,u,l,f){return this.i.add(String(i),u,!1,l,f)},Et.prototype.L=function(i,u,l,f){return this.i.add(String(i),u,!0,l,f)};function ir(i,u,l,f){if(u=i.i.g[String(u)],!u)return!0;u=u.concat();for(var w=!0,S=0;S<u.length;++S){var D=u[S];if(D&&!D.da&&D.capture==l){var Z=D.listener,gt=D.ha||D.src;D.fa&&ps(i.i,D),w=Z.call(gt,f)!==!1&&w}}return w&&!f.defaultPrevented}function Ao(i,u,l){if(typeof i=="function")l&&(i=v(i,l));else if(i&&typeof i.handleEvent=="function")i=v(i.handleEvent,i);else throw Error("Invalid listener argument");return 2147483647<Number(u)?-1:c.setTimeout(i,u||0)}function So(i){i.g=Ao(()=>{i.g=null,i.i&&(i.i=!1,So(i))},i.l);const u=i.h;i.h=null,i.m.apply(null,u)}class Ch extends J{constructor(u,l){super(),this.m=u,this.l=l,this.h=null,this.i=!1,this.g=null}j(u){this.h=arguments,this.g?this.i=!0:So(this)}N(){super.N(),this.g&&(c.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function pn(i){J.call(this),this.h=i,this.g={}}V(pn,J);var Ro=[];function bo(i){it(i.g,function(u,l){this.g.hasOwnProperty(l)&&ys(u)},i),i.g={}}pn.prototype.N=function(){pn.aa.N.call(this),bo(this)},pn.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var Ts=c.JSON.stringify,Vh=c.JSON.parse,Dh=class{stringify(i){return c.JSON.stringify(i,void 0)}parse(i){return c.JSON.parse(i,void 0)}};function Is(){}Is.prototype.h=null;function Po(i){return i.h||(i.h=i.i())}function Co(){}var mn={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function ws(){at.call(this,"d")}V(ws,at);function As(){at.call(this,"c")}V(As,at);var Se={},Vo=null;function or(){return Vo=Vo||new Et}Se.La="serverreachability";function Do(i){at.call(this,Se.La,i)}V(Do,at);function gn(i){const u=or();Rt(u,new Do(u))}Se.STAT_EVENT="statevent";function ko(i,u){at.call(this,Se.STAT_EVENT,i),this.stat=u}V(ko,at);function bt(i){const u=or();Rt(u,new ko(u,i))}Se.Ma="timingevent";function No(i,u){at.call(this,Se.Ma,i),this.size=u}V(No,at);function _n(i,u){if(typeof i!="function")throw Error("Fn must not be null and must be a function");return c.setTimeout(function(){i()},u)}function yn(){this.g=!0}yn.prototype.xa=function(){this.g=!1};function kh(i,u,l,f,w,S){i.info(function(){if(i.g)if(S)for(var D="",Z=S.split("&"),gt=0;gt<Z.length;gt++){var Q=Z[gt].split("=");if(1<Q.length){var Tt=Q[0];Q=Q[1];var It=Tt.split("_");D=2<=It.length&&It[1]=="type"?D+(Tt+"="+Q+"&"):D+(Tt+"=redacted&")}}else D=null;else D=S;return"XMLHTTP REQ ("+f+") [attempt "+w+"]: "+u+`
`+l+`
`+D})}function Nh(i,u,l,f,w,S,D){i.info(function(){return"XMLHTTP RESP ("+f+") [ attempt "+w+"]: "+u+`
`+l+`
`+S+" "+D})}function $e(i,u,l,f){i.info(function(){return"XMLHTTP TEXT ("+u+"): "+xh(i,l)+(f?" "+f:"")})}function Oh(i,u){i.info(function(){return"TIMEOUT: "+u})}yn.prototype.info=function(){};function xh(i,u){if(!i.g)return u;if(!u)return null;try{var l=JSON.parse(u);if(l){for(i=0;i<l.length;i++)if(Array.isArray(l[i])){var f=l[i];if(!(2>f.length)){var w=f[1];if(Array.isArray(w)&&!(1>w.length)){var S=w[0];if(S!="noop"&&S!="stop"&&S!="close")for(var D=1;D<w.length;D++)w[D]=""}}}}return Ts(l)}catch{return u}}var ar={NO_ERROR:0,gb:1,tb:2,sb:3,nb:4,rb:5,ub:6,Ia:7,TIMEOUT:8,xb:9},Oo={lb:"complete",Hb:"success",Ja:"error",Ia:"abort",zb:"ready",Ab:"readystatechange",TIMEOUT:"timeout",vb:"incrementaldata",yb:"progress",ob:"downloadprogress",Pb:"uploadprogress"},Ss;function ur(){}V(ur,Is),ur.prototype.g=function(){return new XMLHttpRequest},ur.prototype.i=function(){return{}},Ss=new ur;function se(i,u,l,f){this.j=i,this.i=u,this.l=l,this.R=f||1,this.U=new pn(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new xo}function xo(){this.i=null,this.g="",this.h=!1}var Mo={},Rs={};function bs(i,u,l){i.L=1,i.v=dr(Xt(u)),i.m=l,i.P=!0,Lo(i,null)}function Lo(i,u){i.F=Date.now(),cr(i),i.A=Xt(i.v);var l=i.A,f=i.R;Array.isArray(f)||(f=[String(f)]),Yo(l.i,"t",f),i.C=0,l=i.j.J,i.h=new xo,i.g=ma(i.j,l?u:null,!i.m),0<i.O&&(i.M=new Ch(v(i.Y,i,i.g),i.O)),u=i.U,l=i.g,f=i.ca;var w="readystatechange";Array.isArray(w)||(w&&(Ro[0]=w.toString()),w=Ro);for(var S=0;S<w.length;S++){var D=Eo(l,w[S],f||u.handleEvent,!1,u.h||u);if(!D)break;u.g[D.key]=D}u=i.H?m(i.H):{},i.m?(i.u||(i.u="POST"),u["Content-Type"]="application/x-www-form-urlencoded",i.g.ea(i.A,i.u,i.m,u)):(i.u="GET",i.g.ea(i.A,i.u,null,u)),gn(),kh(i.i,i.u,i.A,i.l,i.R,i.m)}se.prototype.ca=function(i){i=i.target;const u=this.M;u&&Yt(i)==3?u.j():this.Y(i)},se.prototype.Y=function(i){try{if(i==this.g)t:{const It=Yt(this.g);var u=this.g.Ba();const He=this.g.Z();if(!(3>It)&&(It!=3||this.g&&(this.h.h||this.g.oa()||sa(this.g)))){this.J||It!=4||u==7||(u==8||0>=He?gn(3):gn(2)),Ps(this);var l=this.g.Z();this.X=l;e:if(Fo(this)){var f=sa(this.g);i="";var w=f.length,S=Yt(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Re(this),vn(this);var D="";break e}this.h.i=new c.TextDecoder}for(u=0;u<w;u++)this.h.h=!0,i+=this.h.i.decode(f[u],{stream:!(S&&u==w-1)});f.length=0,this.h.g+=i,this.C=0,D=this.h.g}else D=this.g.oa();if(this.o=l==200,Nh(this.i,this.u,this.A,this.l,this.R,It,l),this.o){if(this.T&&!this.K){e:{if(this.g){var Z,gt=this.g;if((Z=gt.g?gt.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!L(Z)){var Q=Z;break e}}Q=null}if(l=Q)$e(this.i,this.l,l,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,Cs(this,l);else{this.o=!1,this.s=3,bt(12),Re(this),vn(this);break t}}if(this.P){l=!0;let xt;for(;!this.J&&this.C<D.length;)if(xt=Mh(this,D),xt==Rs){It==4&&(this.s=4,bt(14),l=!1),$e(this.i,this.l,null,"[Incomplete Response]");break}else if(xt==Mo){this.s=4,bt(15),$e(this.i,this.l,D,"[Invalid Chunk]"),l=!1;break}else $e(this.i,this.l,xt,null),Cs(this,xt);if(Fo(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),It!=4||D.length!=0||this.h.h||(this.s=1,bt(16),l=!1),this.o=this.o&&l,!l)$e(this.i,this.l,D,"[Invalid Chunked Response]"),Re(this),vn(this);else if(0<D.length&&!this.W){this.W=!0;var Tt=this.j;Tt.g==this&&Tt.ba&&!Tt.M&&(Tt.j.info("Great, no buffering proxy detected. Bytes received: "+D.length),xs(Tt),Tt.M=!0,bt(11))}}else $e(this.i,this.l,D,null),Cs(this,D);It==4&&Re(this),this.o&&!this.J&&(It==4?ha(this.j,this):(this.o=!1,cr(this)))}else Zh(this.g),l==400&&0<D.indexOf("Unknown SID")?(this.s=3,bt(12)):(this.s=0,bt(13)),Re(this),vn(this)}}}catch{}finally{}};function Fo(i){return i.g?i.u=="GET"&&i.L!=2&&i.j.Ca:!1}function Mh(i,u){var l=i.C,f=u.indexOf(`
`,l);return f==-1?Rs:(l=Number(u.substring(l,f)),isNaN(l)?Mo:(f+=1,f+l>u.length?Rs:(u=u.slice(f,f+l),i.C=f+l,u)))}se.prototype.cancel=function(){this.J=!0,Re(this)};function cr(i){i.S=Date.now()+i.I,Uo(i,i.I)}function Uo(i,u){if(i.B!=null)throw Error("WatchDog timer not null");i.B=_n(v(i.ba,i),u)}function Ps(i){i.B&&(c.clearTimeout(i.B),i.B=null)}se.prototype.ba=function(){this.B=null;const i=Date.now();0<=i-this.S?(Oh(this.i,this.A),this.L!=2&&(gn(),bt(17)),Re(this),this.s=2,vn(this)):Uo(this,this.S-i)};function vn(i){i.j.G==0||i.J||ha(i.j,i)}function Re(i){Ps(i);var u=i.M;u&&typeof u.ma=="function"&&u.ma(),i.M=null,bo(i.U),i.g&&(u=i.g,i.g=null,u.abort(),u.ma())}function Cs(i,u){try{var l=i.j;if(l.G!=0&&(l.g==i||Vs(l.h,i))){if(!i.K&&Vs(l.h,i)&&l.G==3){try{var f=l.Da.g.parse(u)}catch{f=null}if(Array.isArray(f)&&f.length==3){var w=f;if(w[0]==0){t:if(!l.u){if(l.g)if(l.g.F+3e3<i.F)yr(l),gr(l);else break t;Os(l),bt(18)}}else l.za=w[1],0<l.za-l.T&&37500>w[2]&&l.F&&l.v==0&&!l.C&&(l.C=_n(v(l.Za,l),6e3));if(1>=qo(l.h)&&l.ca){try{l.ca()}catch{}l.ca=void 0}}else Pe(l,11)}else if((i.K||l.g==i)&&yr(l),!L(u))for(w=l.Da.g.parse(u),u=0;u<w.length;u++){let Q=w[u];if(l.T=Q[0],Q=Q[1],l.G==2)if(Q[0]=="c"){l.K=Q[1],l.ia=Q[2];const Tt=Q[3];Tt!=null&&(l.la=Tt,l.j.info("VER="+l.la));const It=Q[4];It!=null&&(l.Aa=It,l.j.info("SVER="+l.Aa));const He=Q[5];He!=null&&typeof He=="number"&&0<He&&(f=1.5*He,l.L=f,l.j.info("backChannelRequestTimeoutMs_="+f)),f=l;const xt=i.g;if(xt){const Er=xt.g?xt.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(Er){var S=f.h;S.g||Er.indexOf("spdy")==-1&&Er.indexOf("quic")==-1&&Er.indexOf("h2")==-1||(S.j=S.l,S.g=new Set,S.h&&(Ds(S,S.h),S.h=null))}if(f.D){const Ms=xt.g?xt.g.getResponseHeader("X-HTTP-Session-Id"):null;Ms&&(f.ya=Ms,et(f.I,f.D,Ms))}}l.G=3,l.l&&l.l.ua(),l.ba&&(l.R=Date.now()-i.F,l.j.info("Handshake RTT: "+l.R+"ms")),f=l;var D=i;if(f.qa=pa(f,f.J?f.ia:null,f.W),D.K){$o(f.h,D);var Z=D,gt=f.L;gt&&(Z.I=gt),Z.B&&(Ps(Z),cr(Z)),f.g=D}else ca(f);0<l.i.length&&_r(l)}else Q[0]!="stop"&&Q[0]!="close"||Pe(l,7);else l.G==3&&(Q[0]=="stop"||Q[0]=="close"?Q[0]=="stop"?Pe(l,7):Ns(l):Q[0]!="noop"&&l.l&&l.l.ta(Q),l.v=0)}}gn(4)}catch{}}var Lh=class{constructor(i,u){this.g=i,this.map=u}};function Bo(i){this.l=i||10,c.PerformanceNavigationTiming?(i=c.performance.getEntriesByType("navigation"),i=0<i.length&&(i[0].nextHopProtocol=="hq"||i[0].nextHopProtocol=="h2")):i=!!(c.chrome&&c.chrome.loadTimes&&c.chrome.loadTimes()&&c.chrome.loadTimes().wasFetchedViaSpdy),this.j=i?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function jo(i){return i.h?!0:i.g?i.g.size>=i.j:!1}function qo(i){return i.h?1:i.g?i.g.size:0}function Vs(i,u){return i.h?i.h==u:i.g?i.g.has(u):!1}function Ds(i,u){i.g?i.g.add(u):i.h=u}function $o(i,u){i.h&&i.h==u?i.h=null:i.g&&i.g.has(u)&&i.g.delete(u)}Bo.prototype.cancel=function(){if(this.i=zo(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const i of this.g.values())i.cancel();this.g.clear()}};function zo(i){if(i.h!=null)return i.i.concat(i.h.D);if(i.g!=null&&i.g.size!==0){let u=i.i;for(const l of i.g.values())u=u.concat(l.D);return u}return k(i.i)}function Fh(i){if(i.V&&typeof i.V=="function")return i.V();if(typeof Map<"u"&&i instanceof Map||typeof Set<"u"&&i instanceof Set)return Array.from(i.values());if(typeof i=="string")return i.split("");if(h(i)){for(var u=[],l=i.length,f=0;f<l;f++)u.push(i[f]);return u}u=[],l=0;for(f in i)u[l++]=i[f];return u}function Uh(i){if(i.na&&typeof i.na=="function")return i.na();if(!i.V||typeof i.V!="function"){if(typeof Map<"u"&&i instanceof Map)return Array.from(i.keys());if(!(typeof Set<"u"&&i instanceof Set)){if(h(i)||typeof i=="string"){var u=[];i=i.length;for(var l=0;l<i;l++)u.push(l);return u}u=[],l=0;for(const f in i)u[l++]=f;return u}}}function Go(i,u){if(i.forEach&&typeof i.forEach=="function")i.forEach(u,void 0);else if(h(i)||typeof i=="string")Array.prototype.forEach.call(i,u,void 0);else for(var l=Uh(i),f=Fh(i),w=f.length,S=0;S<w;S++)u.call(void 0,f[S],l&&l[S],i)}var Ho=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function Bh(i,u){if(i){i=i.split("&");for(var l=0;l<i.length;l++){var f=i[l].indexOf("="),w=null;if(0<=f){var S=i[l].substring(0,f);w=i[l].substring(f+1)}else S=i[l];u(S,w?decodeURIComponent(w.replace(/\+/g," ")):"")}}}function be(i){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,i instanceof be){this.h=i.h,lr(this,i.j),this.o=i.o,this.g=i.g,hr(this,i.s),this.l=i.l;var u=i.i,l=new In;l.i=u.i,u.g&&(l.g=new Map(u.g),l.h=u.h),Wo(this,l),this.m=i.m}else i&&(u=String(i).match(Ho))?(this.h=!1,lr(this,u[1]||"",!0),this.o=En(u[2]||""),this.g=En(u[3]||"",!0),hr(this,u[4]),this.l=En(u[5]||"",!0),Wo(this,u[6]||"",!0),this.m=En(u[7]||"")):(this.h=!1,this.i=new In(null,this.h))}be.prototype.toString=function(){var i=[],u=this.j;u&&i.push(Tn(u,Ko,!0),":");var l=this.g;return(l||u=="file")&&(i.push("//"),(u=this.o)&&i.push(Tn(u,Ko,!0),"@"),i.push(encodeURIComponent(String(l)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),l=this.s,l!=null&&i.push(":",String(l))),(l=this.l)&&(this.g&&l.charAt(0)!="/"&&i.push("/"),i.push(Tn(l,l.charAt(0)=="/"?$h:qh,!0))),(l=this.i.toString())&&i.push("?",l),(l=this.m)&&i.push("#",Tn(l,Gh)),i.join("")};function Xt(i){return new be(i)}function lr(i,u,l){i.j=l?En(u,!0):u,i.j&&(i.j=i.j.replace(/:$/,""))}function hr(i,u){if(u){if(u=Number(u),isNaN(u)||0>u)throw Error("Bad port number "+u);i.s=u}else i.s=null}function Wo(i,u,l){u instanceof In?(i.i=u,Hh(i.i,i.h)):(l||(u=Tn(u,zh)),i.i=new In(u,i.h))}function et(i,u,l){i.i.set(u,l)}function dr(i){return et(i,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),i}function En(i,u){return i?u?decodeURI(i.replace(/%25/g,"%2525")):decodeURIComponent(i):""}function Tn(i,u,l){return typeof i=="string"?(i=encodeURI(i).replace(u,jh),l&&(i=i.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),i):null}function jh(i){return i=i.charCodeAt(0),"%"+(i>>4&15).toString(16)+(i&15).toString(16)}var Ko=/[#\/\?@]/g,qh=/[#\?:]/g,$h=/[#\?]/g,zh=/[#\?@]/g,Gh=/#/g;function In(i,u){this.h=this.g=null,this.i=i||null,this.j=!!u}function ie(i){i.g||(i.g=new Map,i.h=0,i.i&&Bh(i.i,function(u,l){i.add(decodeURIComponent(u.replace(/\+/g," ")),l)}))}n=In.prototype,n.add=function(i,u){ie(this),this.i=null,i=ze(this,i);var l=this.g.get(i);return l||this.g.set(i,l=[]),l.push(u),this.h+=1,this};function Qo(i,u){ie(i),u=ze(i,u),i.g.has(u)&&(i.i=null,i.h-=i.g.get(u).length,i.g.delete(u))}function Xo(i,u){return ie(i),u=ze(i,u),i.g.has(u)}n.forEach=function(i,u){ie(this),this.g.forEach(function(l,f){l.forEach(function(w){i.call(u,w,f,this)},this)},this)},n.na=function(){ie(this);const i=Array.from(this.g.values()),u=Array.from(this.g.keys()),l=[];for(let f=0;f<u.length;f++){const w=i[f];for(let S=0;S<w.length;S++)l.push(u[f])}return l},n.V=function(i){ie(this);let u=[];if(typeof i=="string")Xo(this,i)&&(u=u.concat(this.g.get(ze(this,i))));else{i=Array.from(this.g.values());for(let l=0;l<i.length;l++)u=u.concat(i[l])}return u},n.set=function(i,u){return ie(this),this.i=null,i=ze(this,i),Xo(this,i)&&(this.h-=this.g.get(i).length),this.g.set(i,[u]),this.h+=1,this},n.get=function(i,u){return i?(i=this.V(i),0<i.length?String(i[0]):u):u};function Yo(i,u,l){Qo(i,u),0<l.length&&(i.i=null,i.g.set(ze(i,u),k(l)),i.h+=l.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const i=[],u=Array.from(this.g.keys());for(var l=0;l<u.length;l++){var f=u[l];const S=encodeURIComponent(String(f)),D=this.V(f);for(f=0;f<D.length;f++){var w=S;D[f]!==""&&(w+="="+encodeURIComponent(String(D[f]))),i.push(w)}}return this.i=i.join("&")};function ze(i,u){return u=String(u),i.j&&(u=u.toLowerCase()),u}function Hh(i,u){u&&!i.j&&(ie(i),i.i=null,i.g.forEach(function(l,f){var w=f.toLowerCase();f!=w&&(Qo(this,f),Yo(this,w,l))},i)),i.j=u}function Wh(i,u){const l=new yn;if(c.Image){const f=new Image;f.onload=R(oe,l,"TestLoadImage: loaded",!0,u,f),f.onerror=R(oe,l,"TestLoadImage: error",!1,u,f),f.onabort=R(oe,l,"TestLoadImage: abort",!1,u,f),f.ontimeout=R(oe,l,"TestLoadImage: timeout",!1,u,f),c.setTimeout(function(){f.ontimeout&&f.ontimeout()},1e4),f.src=i}else u(!1)}function Kh(i,u){const l=new yn,f=new AbortController,w=setTimeout(()=>{f.abort(),oe(l,"TestPingServer: timeout",!1,u)},1e4);fetch(i,{signal:f.signal}).then(S=>{clearTimeout(w),S.ok?oe(l,"TestPingServer: ok",!0,u):oe(l,"TestPingServer: server error",!1,u)}).catch(()=>{clearTimeout(w),oe(l,"TestPingServer: error",!1,u)})}function oe(i,u,l,f,w){try{w&&(w.onload=null,w.onerror=null,w.onabort=null,w.ontimeout=null),f(l)}catch{}}function Qh(){this.g=new Dh}function Xh(i,u,l){const f=l||"";try{Go(i,function(w,S){let D=w;d(w)&&(D=Ts(w)),u.push(f+S+"="+encodeURIComponent(D))})}catch(w){throw u.push(f+"type="+encodeURIComponent("_badmap")),w}}function fr(i){this.l=i.Ub||null,this.j=i.eb||!1}V(fr,Is),fr.prototype.g=function(){return new pr(this.l,this.j)},fr.prototype.i=function(i){return function(){return i}}({});function pr(i,u){Et.call(this),this.D=i,this.o=u,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}V(pr,Et),n=pr.prototype,n.open=function(i,u){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=i,this.A=u,this.readyState=1,An(this)},n.send=function(i){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const u={headers:this.u,method:this.B,credentials:this.m,cache:void 0};i&&(u.body=i),(this.D||c).fetch(new Request(this.A,u)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,wn(this)),this.readyState=0},n.Sa=function(i){if(this.g&&(this.l=i,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=i.headers,this.readyState=2,An(this)),this.g&&(this.readyState=3,An(this),this.g)))if(this.responseType==="arraybuffer")i.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof c.ReadableStream<"u"&&"body"in i){if(this.j=i.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Jo(this)}else i.text().then(this.Ra.bind(this),this.ga.bind(this))};function Jo(i){i.j.read().then(i.Pa.bind(i)).catch(i.ga.bind(i))}n.Pa=function(i){if(this.g){if(this.o&&i.value)this.response.push(i.value);else if(!this.o){var u=i.value?i.value:new Uint8Array(0);(u=this.v.decode(u,{stream:!i.done}))&&(this.response=this.responseText+=u)}i.done?wn(this):An(this),this.readyState==3&&Jo(this)}},n.Ra=function(i){this.g&&(this.response=this.responseText=i,wn(this))},n.Qa=function(i){this.g&&(this.response=i,wn(this))},n.ga=function(){this.g&&wn(this)};function wn(i){i.readyState=4,i.l=null,i.j=null,i.v=null,An(i)}n.setRequestHeader=function(i,u){this.u.append(i,u)},n.getResponseHeader=function(i){return this.h&&this.h.get(i.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const i=[],u=this.h.entries();for(var l=u.next();!l.done;)l=l.value,i.push(l[0]+": "+l[1]),l=u.next();return i.join(`\r
`)};function An(i){i.onreadystatechange&&i.onreadystatechange.call(i)}Object.defineProperty(pr.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(i){this.m=i?"include":"same-origin"}});function Zo(i){let u="";return it(i,function(l,f){u+=f,u+=":",u+=l,u+=`\r
`}),u}function ks(i,u,l){t:{for(f in l){var f=!1;break t}f=!0}f||(l=Zo(l),typeof i=="string"?l!=null&&encodeURIComponent(String(l)):et(i,u,l))}function ot(i){Et.call(this),this.headers=new Map,this.o=i||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}V(ot,Et);var Yh=/^https?$/i,Jh=["POST","PUT"];n=ot.prototype,n.Ha=function(i){this.J=i},n.ea=function(i,u,l,f){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+i);u=u?u.toUpperCase():"GET",this.D=i,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():Ss.g(),this.v=this.o?Po(this.o):Po(Ss),this.g.onreadystatechange=v(this.Ea,this);try{this.B=!0,this.g.open(u,String(i),!0),this.B=!1}catch(S){ta(this,S);return}if(i=l||"",l=new Map(this.headers),f)if(Object.getPrototypeOf(f)===Object.prototype)for(var w in f)l.set(w,f[w]);else if(typeof f.keys=="function"&&typeof f.get=="function")for(const S of f.keys())l.set(S,f.get(S));else throw Error("Unknown input type for opt_headers: "+String(f));f=Array.from(l.keys()).find(S=>S.toLowerCase()=="content-type"),w=c.FormData&&i instanceof c.FormData,!(0<=Array.prototype.indexOf.call(Jh,u,void 0))||f||w||l.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[S,D]of l)this.g.setRequestHeader(S,D);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{ra(this),this.u=!0,this.g.send(i),this.u=!1}catch(S){ta(this,S)}};function ta(i,u){i.h=!1,i.g&&(i.j=!0,i.g.abort(),i.j=!1),i.l=u,i.m=5,ea(i),mr(i)}function ea(i){i.A||(i.A=!0,Rt(i,"complete"),Rt(i,"error"))}n.abort=function(i){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=i||7,Rt(this,"complete"),Rt(this,"abort"),mr(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),mr(this,!0)),ot.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?na(this):this.bb())},n.bb=function(){na(this)};function na(i){if(i.h&&typeof a<"u"&&(!i.v[1]||Yt(i)!=4||i.Z()!=2)){if(i.u&&Yt(i)==4)Ao(i.Ea,0,i);else if(Rt(i,"readystatechange"),Yt(i)==4){i.h=!1;try{const D=i.Z();t:switch(D){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var u=!0;break t;default:u=!1}var l;if(!(l=u)){var f;if(f=D===0){var w=String(i.D).match(Ho)[1]||null;!w&&c.self&&c.self.location&&(w=c.self.location.protocol.slice(0,-1)),f=!Yh.test(w?w.toLowerCase():"")}l=f}if(l)Rt(i,"complete"),Rt(i,"success");else{i.m=6;try{var S=2<Yt(i)?i.g.statusText:""}catch{S=""}i.l=S+" ["+i.Z()+"]",ea(i)}}finally{mr(i)}}}}function mr(i,u){if(i.g){ra(i);const l=i.g,f=i.v[0]?()=>{}:null;i.g=null,i.v=null,u||Rt(i,"ready");try{l.onreadystatechange=f}catch{}}}function ra(i){i.I&&(c.clearTimeout(i.I),i.I=null)}n.isActive=function(){return!!this.g};function Yt(i){return i.g?i.g.readyState:0}n.Z=function(){try{return 2<Yt(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(i){if(this.g){var u=this.g.responseText;return i&&u.indexOf(i)==0&&(u=u.substring(i.length)),Vh(u)}};function sa(i){try{if(!i.g)return null;if("response"in i.g)return i.g.response;switch(i.H){case"":case"text":return i.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in i.g)return i.g.mozResponseArrayBuffer}return null}catch{return null}}function Zh(i){const u={};i=(i.g&&2<=Yt(i)&&i.g.getAllResponseHeaders()||"").split(`\r
`);for(let f=0;f<i.length;f++){if(L(i[f]))continue;var l=T(i[f]);const w=l[0];if(l=l[1],typeof l!="string")continue;l=l.trim();const S=u[w]||[];u[w]=S,S.push(l)}I(u,function(f){return f.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function Sn(i,u,l){return l&&l.internalChannelParams&&l.internalChannelParams[i]||u}function ia(i){this.Aa=0,this.i=[],this.j=new yn,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=Sn("failFast",!1,i),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=Sn("baseRetryDelayMs",5e3,i),this.cb=Sn("retryDelaySeedMs",1e4,i),this.Wa=Sn("forwardChannelMaxRetries",2,i),this.wa=Sn("forwardChannelRequestTimeoutMs",2e4,i),this.pa=i&&i.xmlHttpFactory||void 0,this.Xa=i&&i.Tb||void 0,this.Ca=i&&i.useFetchStreams||!1,this.L=void 0,this.J=i&&i.supportsCrossDomainXhr||!1,this.K="",this.h=new Bo(i&&i.concurrentRequestLimit),this.Da=new Qh,this.P=i&&i.fastHandshake||!1,this.O=i&&i.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=i&&i.Rb||!1,i&&i.xa&&this.j.xa(),i&&i.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&i&&i.detectBufferingProxy||!1,this.ja=void 0,i&&i.longPollingTimeout&&0<i.longPollingTimeout&&(this.ja=i.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=ia.prototype,n.la=8,n.G=1,n.connect=function(i,u,l,f){bt(0),this.W=i,this.H=u||{},l&&f!==void 0&&(this.H.OSID=l,this.H.OAID=f),this.F=this.X,this.I=pa(this,null,this.W),_r(this)};function Ns(i){if(oa(i),i.G==3){var u=i.U++,l=Xt(i.I);if(et(l,"SID",i.K),et(l,"RID",u),et(l,"TYPE","terminate"),Rn(i,l),u=new se(i,i.j,u),u.L=2,u.v=dr(Xt(l)),l=!1,c.navigator&&c.navigator.sendBeacon)try{l=c.navigator.sendBeacon(u.v.toString(),"")}catch{}!l&&c.Image&&(new Image().src=u.v,l=!0),l||(u.g=ma(u.j,null),u.g.ea(u.v)),u.F=Date.now(),cr(u)}fa(i)}function gr(i){i.g&&(xs(i),i.g.cancel(),i.g=null)}function oa(i){gr(i),i.u&&(c.clearTimeout(i.u),i.u=null),yr(i),i.h.cancel(),i.s&&(typeof i.s=="number"&&c.clearTimeout(i.s),i.s=null)}function _r(i){if(!jo(i.h)&&!i.s){i.s=!0;var u=i.Ga;Gt||$(),O||(Gt(),O=!0),B.add(u,i),i.B=0}}function td(i,u){return qo(i.h)>=i.h.j-(i.s?1:0)?!1:i.s?(i.i=u.D.concat(i.i),!0):i.G==1||i.G==2||i.B>=(i.Va?0:i.Wa)?!1:(i.s=_n(v(i.Ga,i,u),da(i,i.B)),i.B++,!0)}n.Ga=function(i){if(this.s)if(this.s=null,this.G==1){if(!i){this.U=Math.floor(1e5*Math.random()),i=this.U++;const w=new se(this,this.j,i);let S=this.o;if(this.S&&(S?(S=m(S),E(S,this.S)):S=this.S),this.m!==null||this.O||(w.H=S,S=null),this.P)t:{for(var u=0,l=0;l<this.i.length;l++){e:{var f=this.i[l];if("__data__"in f.map&&(f=f.map.__data__,typeof f=="string")){f=f.length;break e}f=void 0}if(f===void 0)break;if(u+=f,4096<u){u=l;break t}if(u===4096||l===this.i.length-1){u=l+1;break t}}u=1e3}else u=1e3;u=ua(this,w,u),l=Xt(this.I),et(l,"RID",i),et(l,"CVER",22),this.D&&et(l,"X-HTTP-Session-Id",this.D),Rn(this,l),S&&(this.O?u="headers="+encodeURIComponent(String(Zo(S)))+"&"+u:this.m&&ks(l,this.m,S)),Ds(this.h,w),this.Ua&&et(l,"TYPE","init"),this.P?(et(l,"$req",u),et(l,"SID","null"),w.T=!0,bs(w,l,null)):bs(w,l,u),this.G=2}}else this.G==3&&(i?aa(this,i):this.i.length==0||jo(this.h)||aa(this))};function aa(i,u){var l;u?l=u.l:l=i.U++;const f=Xt(i.I);et(f,"SID",i.K),et(f,"RID",l),et(f,"AID",i.T),Rn(i,f),i.m&&i.o&&ks(f,i.m,i.o),l=new se(i,i.j,l,i.B+1),i.m===null&&(l.H=i.o),u&&(i.i=u.D.concat(i.i)),u=ua(i,l,1e3),l.I=Math.round(.5*i.wa)+Math.round(.5*i.wa*Math.random()),Ds(i.h,l),bs(l,f,u)}function Rn(i,u){i.H&&it(i.H,function(l,f){et(u,f,l)}),i.l&&Go({},function(l,f){et(u,f,l)})}function ua(i,u,l){l=Math.min(i.i.length,l);var f=i.l?v(i.l.Na,i.l,i):null;t:{var w=i.i;let S=-1;for(;;){const D=["count="+l];S==-1?0<l?(S=w[0].g,D.push("ofs="+S)):S=0:D.push("ofs="+S);let Z=!0;for(let gt=0;gt<l;gt++){let Q=w[gt].g;const Tt=w[gt].map;if(Q-=S,0>Q)S=Math.max(0,w[gt].g-100),Z=!1;else try{Xh(Tt,D,"req"+Q+"_")}catch{f&&f(Tt)}}if(Z){f=D.join("&");break t}}}return i=i.i.splice(0,l),u.D=i,f}function ca(i){if(!i.g&&!i.u){i.Y=1;var u=i.Fa;Gt||$(),O||(Gt(),O=!0),B.add(u,i),i.v=0}}function Os(i){return i.g||i.u||3<=i.v?!1:(i.Y++,i.u=_n(v(i.Fa,i),da(i,i.v)),i.v++,!0)}n.Fa=function(){if(this.u=null,la(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var i=2*this.R;this.j.info("BP detection timer enabled: "+i),this.A=_n(v(this.ab,this),i)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,bt(10),gr(this),la(this))};function xs(i){i.A!=null&&(c.clearTimeout(i.A),i.A=null)}function la(i){i.g=new se(i,i.j,"rpc",i.Y),i.m===null&&(i.g.H=i.o),i.g.O=0;var u=Xt(i.qa);et(u,"RID","rpc"),et(u,"SID",i.K),et(u,"AID",i.T),et(u,"CI",i.F?"0":"1"),!i.F&&i.ja&&et(u,"TO",i.ja),et(u,"TYPE","xmlhttp"),Rn(i,u),i.m&&i.o&&ks(u,i.m,i.o),i.L&&(i.g.I=i.L);var l=i.g;i=i.ia,l.L=1,l.v=dr(Xt(u)),l.m=null,l.P=!0,Lo(l,i)}n.Za=function(){this.C!=null&&(this.C=null,gr(this),Os(this),bt(19))};function yr(i){i.C!=null&&(c.clearTimeout(i.C),i.C=null)}function ha(i,u){var l=null;if(i.g==u){yr(i),xs(i),i.g=null;var f=2}else if(Vs(i.h,u))l=u.D,$o(i.h,u),f=1;else return;if(i.G!=0){if(u.o)if(f==1){l=u.m?u.m.length:0,u=Date.now()-u.F;var w=i.B;f=or(),Rt(f,new No(f,l)),_r(i)}else ca(i);else if(w=u.s,w==3||w==0&&0<u.X||!(f==1&&td(i,u)||f==2&&Os(i)))switch(l&&0<l.length&&(u=i.h,u.i=u.i.concat(l)),w){case 1:Pe(i,5);break;case 4:Pe(i,10);break;case 3:Pe(i,6);break;default:Pe(i,2)}}}function da(i,u){let l=i.Ta+Math.floor(Math.random()*i.cb);return i.isActive()||(l*=2),l*u}function Pe(i,u){if(i.j.info("Error code "+u),u==2){var l=v(i.fb,i),f=i.Xa;const w=!f;f=new be(f||"//www.google.com/images/cleardot.gif"),c.location&&c.location.protocol=="http"||lr(f,"https"),dr(f),w?Wh(f.toString(),l):Kh(f.toString(),l)}else bt(2);i.G=0,i.l&&i.l.sa(u),fa(i),oa(i)}n.fb=function(i){i?(this.j.info("Successfully pinged google.com"),bt(2)):(this.j.info("Failed to ping google.com"),bt(1))};function fa(i){if(i.G=0,i.ka=[],i.l){const u=zo(i.h);(u.length!=0||i.i.length!=0)&&(C(i.ka,u),C(i.ka,i.i),i.h.i.length=0,k(i.i),i.i.length=0),i.l.ra()}}function pa(i,u,l){var f=l instanceof be?Xt(l):new be(l);if(f.g!="")u&&(f.g=u+"."+f.g),hr(f,f.s);else{var w=c.location;f=w.protocol,u=u?u+"."+w.hostname:w.hostname,w=+w.port;var S=new be(null);f&&lr(S,f),u&&(S.g=u),w&&hr(S,w),l&&(S.l=l),f=S}return l=i.D,u=i.ya,l&&u&&et(f,l,u),et(f,"VER",i.la),Rn(i,f),f}function ma(i,u,l){if(u&&!i.J)throw Error("Can't create secondary domain capable XhrIo object.");return u=i.Ca&&!i.pa?new ot(new fr({eb:l})):new ot(i.pa),u.Ha(i.J),u}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function ga(){}n=ga.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function vr(){}vr.prototype.g=function(i,u){return new Vt(i,u)};function Vt(i,u){Et.call(this),this.g=new ia(u),this.l=i,this.h=u&&u.messageUrlParams||null,i=u&&u.messageHeaders||null,u&&u.clientProtocolHeaderRequired&&(i?i["X-Client-Protocol"]="webchannel":i={"X-Client-Protocol":"webchannel"}),this.g.o=i,i=u&&u.initMessageHeaders||null,u&&u.messageContentType&&(i?i["X-WebChannel-Content-Type"]=u.messageContentType:i={"X-WebChannel-Content-Type":u.messageContentType}),u&&u.va&&(i?i["X-WebChannel-Client-Profile"]=u.va:i={"X-WebChannel-Client-Profile":u.va}),this.g.S=i,(i=u&&u.Sb)&&!L(i)&&(this.g.m=i),this.v=u&&u.supportsCrossDomainXhr||!1,this.u=u&&u.sendRawJson||!1,(u=u&&u.httpSessionIdParam)&&!L(u)&&(this.g.D=u,i=this.h,i!==null&&u in i&&(i=this.h,u in i&&delete i[u])),this.j=new Ge(this)}V(Vt,Et),Vt.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},Vt.prototype.close=function(){Ns(this.g)},Vt.prototype.o=function(i){var u=this.g;if(typeof i=="string"){var l={};l.__data__=i,i=l}else this.u&&(l={},l.__data__=Ts(i),i=l);u.i.push(new Lh(u.Ya++,i)),u.G==3&&_r(u)},Vt.prototype.N=function(){this.g.l=null,delete this.j,Ns(this.g),delete this.g,Vt.aa.N.call(this)};function _a(i){ws.call(this),i.__headers__&&(this.headers=i.__headers__,this.statusCode=i.__status__,delete i.__headers__,delete i.__status__);var u=i.__sm__;if(u){t:{for(const l in u){i=l;break t}i=void 0}(this.i=i)&&(i=this.i,u=u!==null&&i in u?u[i]:void 0),this.data=u}else this.data=i}V(_a,ws);function ya(){As.call(this),this.status=1}V(ya,As);function Ge(i){this.g=i}V(Ge,ga),Ge.prototype.ua=function(){Rt(this.g,"a")},Ge.prototype.ta=function(i){Rt(this.g,new _a(i))},Ge.prototype.sa=function(i){Rt(this.g,new ya)},Ge.prototype.ra=function(){Rt(this.g,"b")},vr.prototype.createWebChannel=vr.prototype.g,Vt.prototype.send=Vt.prototype.o,Vt.prototype.open=Vt.prototype.m,Vt.prototype.close=Vt.prototype.close,yc=function(){return new vr},_c=function(){return or()},gc=Se,ni={mb:0,pb:1,qb:2,Jb:3,Ob:4,Lb:5,Mb:6,Kb:7,Ib:8,Nb:9,PROXY:10,NOPROXY:11,Gb:12,Cb:13,Db:14,Bb:15,Eb:16,Fb:17,ib:18,hb:19,jb:20},ar.NO_ERROR=0,ar.TIMEOUT=8,ar.HTTP_ERROR=6,br=ar,Oo.COMPLETE="complete",mc=Oo,Co.EventType=mn,mn.OPEN="a",mn.CLOSE="b",mn.ERROR="c",mn.MESSAGE="d",Et.prototype.listen=Et.prototype.K,bn=Co,ot.prototype.listenOnce=ot.prototype.L,ot.prototype.getLastError=ot.prototype.Ka,ot.prototype.getLastErrorCode=ot.prototype.Ba,ot.prototype.getStatus=ot.prototype.Z,ot.prototype.getResponseJson=ot.prototype.Oa,ot.prototype.getResponseText=ot.prototype.oa,ot.prototype.send=ot.prototype.ea,ot.prototype.setWithCredentials=ot.prototype.Ha,pc=ot}).apply(typeof Tr<"u"?Tr:typeof self<"u"?self:typeof window<"u"?window:{});const La="@firebase/firestore",Fa="4.8.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class At{constructor(t){this.uid=t}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(t){return t.uid===this.uid}}At.UNAUTHENTICATED=new At(null),At.GOOGLE_CREDENTIALS=new At("google-credentials-uid"),At.FIRST_PARTY=new At("first-party-uid"),At.MOCK_USER=new At("mock-user");/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let cn="11.10.0";/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ne=new Si("@firebase/firestore");function We(){return Ne.logLevel}function x(n,...t){if(Ne.logLevel<=K.DEBUG){const e=t.map(bi);Ne.debug(`Firestore (${cn}): ${n}`,...e)}}function ne(n,...t){if(Ne.logLevel<=K.ERROR){const e=t.map(bi);Ne.error(`Firestore (${cn}): ${n}`,...e)}}function pe(n,...t){if(Ne.logLevel<=K.WARN){const e=t.map(bi);Ne.warn(`Firestore (${cn}): ${n}`,...e)}}function bi(n){if(typeof n=="string")return n;try{/**
* @license
* Copyright 2020 Google LLC
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/return function(e){return JSON.stringify(e)}(n)}catch{return n}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function F(n,t,e){let r="Unexpected state";typeof t=="string"?r=t:e=t,vc(n,r,e)}function vc(n,t,e){let r=`FIRESTORE (${cn}) INTERNAL ASSERTION FAILED: ${t} (ID: ${n.toString(16)})`;if(e!==void 0)try{r+=" CONTEXT: "+JSON.stringify(e)}catch{r+=" CONTEXT: "+e}throw ne(r),new Error(r)}function X(n,t,e,r){let s="Unexpected state";typeof e=="string"?s=e:r=e,n||vc(t,s,r)}function q(n,t){return n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const b={OK:"ok",CANCELLED:"cancelled",UNKNOWN:"unknown",INVALID_ARGUMENT:"invalid-argument",DEADLINE_EXCEEDED:"deadline-exceeded",NOT_FOUND:"not-found",ALREADY_EXISTS:"already-exists",PERMISSION_DENIED:"permission-denied",UNAUTHENTICATED:"unauthenticated",RESOURCE_EXHAUSTED:"resource-exhausted",FAILED_PRECONDITION:"failed-precondition",ABORTED:"aborted",OUT_OF_RANGE:"out-of-range",UNIMPLEMENTED:"unimplemented",INTERNAL:"internal",UNAVAILABLE:"unavailable",DATA_LOSS:"data-loss"};class N extends we{constructor(t,e){super(t,e),this.code=t,this.message=e,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zt{constructor(){this.promise=new Promise((t,e)=>{this.resolve=t,this.reject=e})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ec{constructor(t,e){this.user=e,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${t}`)}}class hp{getToken(){return Promise.resolve(null)}invalidateToken(){}start(t,e){t.enqueueRetryable(()=>e(At.UNAUTHENTICATED))}shutdown(){}}class dp{constructor(t){this.token=t,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(t,e){this.changeListener=e,t.enqueueRetryable(()=>e(this.token.user))}shutdown(){this.changeListener=null}}class fp{constructor(t){this.t=t,this.currentUser=At.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(t,e){X(this.o===void 0,42304);let r=this.i;const s=h=>this.i!==r?(r=this.i,e(h)):Promise.resolve();let o=new Zt;this.o=()=>{this.i++,this.currentUser=this.u(),o.resolve(),o=new Zt,t.enqueueRetryable(()=>s(this.currentUser))};const a=()=>{const h=o;t.enqueueRetryable(async()=>{await h.promise,await s(this.currentUser)})},c=h=>{x("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=h,this.o&&(this.auth.addAuthTokenListener(this.o),a())};this.t.onInit(h=>c(h)),setTimeout(()=>{if(!this.auth){const h=this.t.getImmediate({optional:!0});h?c(h):(x("FirebaseAuthCredentialsProvider","Auth not yet detected"),o.resolve(),o=new Zt)}},0),a()}getToken(){const t=this.i,e=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(e).then(r=>this.i!==t?(x("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?(X(typeof r.accessToken=="string",31837,{l:r}),new Ec(r.accessToken,this.currentUser)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const t=this.auth&&this.auth.getUid();return X(t===null||typeof t=="string",2055,{h:t}),new At(t)}}class pp{constructor(t,e,r){this.P=t,this.T=e,this.I=r,this.type="FirstParty",this.user=At.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const t=this.R();return t&&this.A.set("Authorization",t),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class mp{constructor(t,e,r){this.P=t,this.T=e,this.I=r}getToken(){return Promise.resolve(new pp(this.P,this.T,this.I))}start(t,e){t.enqueueRetryable(()=>e(At.FIRST_PARTY))}shutdown(){}invalidateToken(){}}class Ua{constructor(t){this.value=t,this.type="AppCheck",this.headers=new Map,t&&t.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class gp{constructor(t,e){this.V=e,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,Xf(t)&&t.settings.appCheckToken&&(this.p=t.settings.appCheckToken)}start(t,e){X(this.o===void 0,3512);const r=o=>{o.error!=null&&x("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${o.error.message}`);const a=o.token!==this.m;return this.m=o.token,x("FirebaseAppCheckTokenProvider",`Received ${a?"new":"existing"} token.`),a?e(o.token):Promise.resolve()};this.o=o=>{t.enqueueRetryable(()=>r(o))};const s=o=>{x("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=o,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit(o=>s(o)),setTimeout(()=>{if(!this.appCheck){const o=this.V.getImmediate({optional:!0});o?s(o):x("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}},0)}getToken(){if(this.p)return Promise.resolve(new Ua(this.p));const t=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(t).then(e=>e?(X(typeof e.token=="string",44558,{tokenResult:e}),this.m=e.token,new Ua(e.token)):null):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function _p(n){const t=typeof self<"u"&&(self.crypto||self.msCrypto),e=new Uint8Array(n);if(t&&typeof t.getRandomValues=="function")t.getRandomValues(e);else for(let r=0;r<n;r++)e[r]=Math.floor(256*Math.random());return e}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Tc(){return new TextEncoder}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Pi{static newId(){const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",e=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=_p(40);for(let o=0;o<s.length;++o)r.length<20&&s[o]<e&&(r+=t.charAt(s[o]%62))}return r}}function G(n,t){return n<t?-1:n>t?1:0}function ri(n,t){let e=0;for(;e<n.length&&e<t.length;){const r=n.codePointAt(e),s=t.codePointAt(e);if(r!==s){if(r<128&&s<128)return G(r,s);{const o=Tc(),a=yp(o.encode(Ba(n,e)),o.encode(Ba(t,e)));return a!==0?a:G(r,s)}}e+=r>65535?2:1}return G(n.length,t.length)}function Ba(n,t){return n.codePointAt(t)>65535?n.substring(t,t+2):n.substring(t,t+1)}function yp(n,t){for(let e=0;e<n.length&&e<t.length;++e)if(n[e]!==t[e])return G(n[e],t[e]);return G(n.length,t.length)}function nn(n,t,e){return n.length===t.length&&n.every((r,s)=>e(r,t[s]))}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ja="__name__";class Ft{constructor(t,e,r){e===void 0?e=0:e>t.length&&F(637,{offset:e,range:t.length}),r===void 0?r=t.length-e:r>t.length-e&&F(1746,{length:r,range:t.length-e}),this.segments=t,this.offset=e,this.len=r}get length(){return this.len}isEqual(t){return Ft.comparator(this,t)===0}child(t){const e=this.segments.slice(this.offset,this.limit());return t instanceof Ft?t.forEach(r=>{e.push(r)}):e.push(t),this.construct(e)}limit(){return this.offset+this.length}popFirst(t){return t=t===void 0?1:t,this.construct(this.segments,this.offset+t,this.length-t)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(t){return this.segments[this.offset+t]}isEmpty(){return this.length===0}isPrefixOf(t){if(t.length<this.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}isImmediateParentOf(t){if(this.length+1!==t.length)return!1;for(let e=0;e<this.length;e++)if(this.get(e)!==t.get(e))return!1;return!0}forEach(t){for(let e=this.offset,r=this.limit();e<r;e++)t(this.segments[e])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(t,e){const r=Math.min(t.length,e.length);for(let s=0;s<r;s++){const o=Ft.compareSegments(t.get(s),e.get(s));if(o!==0)return o}return G(t.length,e.length)}static compareSegments(t,e){const r=Ft.isNumericId(t),s=Ft.isNumericId(e);return r&&!s?-1:!r&&s?1:r&&s?Ft.extractNumericId(t).compare(Ft.extractNumericId(e)):ri(t,e)}static isNumericId(t){return t.startsWith("__id")&&t.endsWith("__")}static extractNumericId(t){return le.fromString(t.substring(4,t.length-2))}}class tt extends Ft{construct(t,e,r){return new tt(t,e,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...t){const e=[];for(const r of t){if(r.indexOf("//")>=0)throw new N(b.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);e.push(...r.split("/").filter(s=>s.length>0))}return new tt(e)}static emptyPath(){return new tt([])}}const vp=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class yt extends Ft{construct(t,e,r){return new yt(t,e,r)}static isValidIdentifier(t){return vp.test(t)}canonicalString(){return this.toArray().map(t=>(t=t.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),yt.isValidIdentifier(t)||(t="`"+t+"`"),t)).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===ja}static keyField(){return new yt([ja])}static fromServerFormat(t){const e=[];let r="",s=0;const o=()=>{if(r.length===0)throw new N(b.INVALID_ARGUMENT,`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);e.push(r),r=""};let a=!1;for(;s<t.length;){const c=t[s];if(c==="\\"){if(s+1===t.length)throw new N(b.INVALID_ARGUMENT,"Path has trailing escape character: "+t);const h=t[s+1];if(h!=="\\"&&h!=="."&&h!=="`")throw new N(b.INVALID_ARGUMENT,"Path has invalid escape sequence: "+t);r+=h,s+=2}else c==="`"?(a=!a,s++):c!=="."||a?(r+=c,s++):(o(),s++)}if(o(),a)throw new N(b.INVALID_ARGUMENT,"Unterminated ` in path: "+t);return new yt(e)}static emptyPath(){return new yt([])}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class M{constructor(t){this.path=t}static fromPath(t){return new M(tt.fromString(t))}static fromName(t){return new M(tt.fromString(t).popFirst(5))}static empty(){return new M(tt.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(t){return this.path.length>=2&&this.path.get(this.path.length-2)===t}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(t){return t!==null&&tt.comparator(this.path,t.path)===0}toString(){return this.path.toString()}static comparator(t,e){return tt.comparator(t.path,e.path)}static isDocumentKey(t){return t.length%2==0}static fromSegments(t){return new M(new tt(t.slice()))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ic(n,t,e){if(!e)throw new N(b.INVALID_ARGUMENT,`Function ${n}() cannot be called with an empty ${t}.`)}function Ep(n,t,e,r){if(t===!0&&r===!0)throw new N(b.INVALID_ARGUMENT,`${n} and ${e} cannot be used together.`)}function qa(n){if(!M.isDocumentKey(n))throw new N(b.INVALID_ARGUMENT,`Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`)}function $a(n){if(M.isDocumentKey(n))throw new N(b.INVALID_ARGUMENT,`Invalid collection reference. Collection references must have an odd number of segments, but ${n} has ${n.length}.`)}function wc(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function Zr(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const t=function(r){return r.constructor?r.constructor.name:null}(n);return t?`a custom ${t} object`:"an object"}}return typeof n=="function"?"a function":F(12329,{type:typeof n})}function me(n,t){if("_delegate"in n&&(n=n._delegate),!(n instanceof t)){if(t.name===n.constructor.name)throw new N(b.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const e=Zr(n);throw new N(b.INVALID_ARGUMENT,`Expected type '${t.name}', but it was: ${e}`)}}return n}function Tp(n,t){if(t<=0)throw new N(b.INVALID_ARGUMENT,`Function ${n}() requires a positive number, but it was: ${t}.`)}/**
 * @license
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ht(n,t){const e={typeString:n};return t&&(e.value=t),e}function Xn(n,t){if(!wc(n))throw new N(b.INVALID_ARGUMENT,"JSON must be an object");let e;for(const r in t)if(t[r]){const s=t[r].typeString,o="value"in t[r]?{value:t[r].value}:void 0;if(!(r in n)){e=`JSON missing required field: '${r}'`;break}const a=n[r];if(s&&typeof a!==s){e=`JSON field '${r}' must be a ${s}.`;break}if(o!==void 0&&a!==o.value){e=`Expected '${r}' field to equal '${o.value}'`;break}}if(e)throw new N(b.INVALID_ARGUMENT,e);return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const za=-62135596800,Ga=1e6;class nt{static now(){return nt.fromMillis(Date.now())}static fromDate(t){return nt.fromMillis(t.getTime())}static fromMillis(t){const e=Math.floor(t/1e3),r=Math.floor((t-1e3*e)*Ga);return new nt(e,r)}constructor(t,e){if(this.seconds=t,this.nanoseconds=e,e<0)throw new N(b.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(e>=1e9)throw new N(b.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+e);if(t<za)throw new N(b.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t);if(t>=253402300800)throw new N(b.INVALID_ARGUMENT,"Timestamp seconds out of range: "+t)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/Ga}_compareTo(t){return this.seconds===t.seconds?G(this.nanoseconds,t.nanoseconds):G(this.seconds,t.seconds)}isEqual(t){return t.seconds===this.seconds&&t.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:nt._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(t){if(Xn(t,nt._jsonSchema))return new nt(t.seconds,t.nanoseconds)}valueOf(){const t=this.seconds-za;return String(t).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}nt._jsonSchemaVersion="firestore/timestamp/1.0",nt._jsonSchema={type:ht("string",nt._jsonSchemaVersion),seconds:ht("number"),nanoseconds:ht("number")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class j{static fromTimestamp(t){return new j(t)}static min(){return new j(new nt(0,0))}static max(){return new j(new nt(253402300799,999999999))}constructor(t){this.timestamp=t}compareTo(t){return this.timestamp._compareTo(t.timestamp)}isEqual(t){return this.timestamp.isEqual(t.timestamp)}toMicroseconds(){return 1e6*this.timestamp.seconds+this.timestamp.nanoseconds/1e3}toString(){return"SnapshotVersion("+this.timestamp.toString()+")"}toTimestamp(){return this.timestamp}}/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qn=-1;function Ip(n,t){const e=n.toTimestamp().seconds,r=n.toTimestamp().nanoseconds+1,s=j.fromTimestamp(r===1e9?new nt(e+1,0):new nt(e,r));return new ge(s,M.empty(),t)}function wp(n){return new ge(n.readTime,n.key,qn)}class ge{constructor(t,e,r){this.readTime=t,this.documentKey=e,this.largestBatchId=r}static min(){return new ge(j.min(),M.empty(),qn)}static max(){return new ge(j.max(),M.empty(),qn)}}function Ap(n,t){let e=n.readTime.compareTo(t.readTime);return e!==0?e:(e=M.comparator(n.documentKey,t.documentKey),e!==0?e:G(n.largestBatchId,t.largestBatchId))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Sp="The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";class Rp{constructor(){this.onCommittedListeners=[]}addOnCommittedListener(t){this.onCommittedListeners.push(t)}raiseOnCommittedEvent(){this.onCommittedListeners.forEach(t=>t())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ln(n){if(n.code!==b.FAILED_PRECONDITION||n.message!==Sp)throw n;x("LocalStore","Unexpectedly lost primary lease")}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class P{constructor(t){this.nextCallback=null,this.catchCallback=null,this.result=void 0,this.error=void 0,this.isDone=!1,this.callbackAttached=!1,t(e=>{this.isDone=!0,this.result=e,this.nextCallback&&this.nextCallback(e)},e=>{this.isDone=!0,this.error=e,this.catchCallback&&this.catchCallback(e)})}catch(t){return this.next(void 0,t)}next(t,e){return this.callbackAttached&&F(59440),this.callbackAttached=!0,this.isDone?this.error?this.wrapFailure(e,this.error):this.wrapSuccess(t,this.result):new P((r,s)=>{this.nextCallback=o=>{this.wrapSuccess(t,o).next(r,s)},this.catchCallback=o=>{this.wrapFailure(e,o).next(r,s)}})}toPromise(){return new Promise((t,e)=>{this.next(t,e)})}wrapUserFunction(t){try{const e=t();return e instanceof P?e:P.resolve(e)}catch(e){return P.reject(e)}}wrapSuccess(t,e){return t?this.wrapUserFunction(()=>t(e)):P.resolve(e)}wrapFailure(t,e){return t?this.wrapUserFunction(()=>t(e)):P.reject(e)}static resolve(t){return new P((e,r)=>{e(t)})}static reject(t){return new P((e,r)=>{r(t)})}static waitFor(t){return new P((e,r)=>{let s=0,o=0,a=!1;t.forEach(c=>{++s,c.next(()=>{++o,a&&o===s&&e()},h=>r(h))}),a=!0,o===s&&e()})}static or(t){let e=P.resolve(!1);for(const r of t)e=e.next(s=>s?P.resolve(s):r());return e}static forEach(t,e){const r=[];return t.forEach((s,o)=>{r.push(e.call(this,s,o))}),this.waitFor(r)}static mapArray(t,e){return new P((r,s)=>{const o=t.length,a=new Array(o);let c=0;for(let h=0;h<o;h++){const d=h;e(t[d]).next(p=>{a[d]=p,++c,c===o&&r(a)},p=>s(p))}})}static doWhile(t,e){return new P((r,s)=>{const o=()=>{t()===!0?e().next(()=>{o()},s):r()};o()})}}function bp(n){const t=n.match(/Android ([\d.]+)/i),e=t?t[1].split(".").slice(0,2).join("."):"-1";return Number(e)}function hn(n){return n.name==="IndexedDbTransactionError"}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ts{constructor(t,e){this.previousValue=t,e&&(e.sequenceNumberHandler=r=>this._e(r),this.ae=r=>e.writeSequenceNumber(r))}_e(t){return this.previousValue=Math.max(t,this.previousValue),this.previousValue}next(){const t=++this.previousValue;return this.ae&&this.ae(t),t}}ts.ue=-1;/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ci=-1;function es(n){return n==null}function Mr(n){return n===0&&1/n==-1/0}function Pp(n){return typeof n=="number"&&Number.isInteger(n)&&!Mr(n)&&n<=Number.MAX_SAFE_INTEGER&&n>=Number.MIN_SAFE_INTEGER}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ac="";function Cp(n){let t="";for(let e=0;e<n.length;e++)t.length>0&&(t=Ha(t)),t=Vp(n.get(e),t);return Ha(t)}function Vp(n,t){let e=t;const r=n.length;for(let s=0;s<r;s++){const o=n.charAt(s);switch(o){case"\0":e+="";break;case Ac:e+="";break;default:e+=o}}return e}function Ha(n){return n+Ac+""}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Wa(n){let t=0;for(const e in n)Object.prototype.hasOwnProperty.call(n,e)&&t++;return t}function Fe(n,t){for(const e in n)Object.prototype.hasOwnProperty.call(n,e)&&t(e,n[e])}function Sc(n){for(const t in n)if(Object.prototype.hasOwnProperty.call(n,t))return!1;return!0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class st{constructor(t,e){this.comparator=t,this.root=e||_t.EMPTY}insert(t,e){return new st(this.comparator,this.root.insert(t,e,this.comparator).copy(null,null,_t.BLACK,null,null))}remove(t){return new st(this.comparator,this.root.remove(t,this.comparator).copy(null,null,_t.BLACK,null,null))}get(t){let e=this.root;for(;!e.isEmpty();){const r=this.comparator(t,e.key);if(r===0)return e.value;r<0?e=e.left:r>0&&(e=e.right)}return null}indexOf(t){let e=0,r=this.root;for(;!r.isEmpty();){const s=this.comparator(t,r.key);if(s===0)return e+r.left.size;s<0?r=r.left:(e+=r.left.size+1,r=r.right)}return-1}isEmpty(){return this.root.isEmpty()}get size(){return this.root.size}minKey(){return this.root.minKey()}maxKey(){return this.root.maxKey()}inorderTraversal(t){return this.root.inorderTraversal(t)}forEach(t){this.inorderTraversal((e,r)=>(t(e,r),!1))}toString(){const t=[];return this.inorderTraversal((e,r)=>(t.push(`${e}:${r}`),!1)),`{${t.join(", ")}}`}reverseTraversal(t){return this.root.reverseTraversal(t)}getIterator(){return new Ir(this.root,null,this.comparator,!1)}getIteratorFrom(t){return new Ir(this.root,t,this.comparator,!1)}getReverseIterator(){return new Ir(this.root,null,this.comparator,!0)}getReverseIteratorFrom(t){return new Ir(this.root,t,this.comparator,!0)}}class Ir{constructor(t,e,r,s){this.isReverse=s,this.nodeStack=[];let o=1;for(;!t.isEmpty();)if(o=e?r(t.key,e):1,e&&s&&(o*=-1),o<0)t=this.isReverse?t.left:t.right;else{if(o===0){this.nodeStack.push(t);break}this.nodeStack.push(t),t=this.isReverse?t.right:t.left}}getNext(){let t=this.nodeStack.pop();const e={key:t.key,value:t.value};if(this.isReverse)for(t=t.left;!t.isEmpty();)this.nodeStack.push(t),t=t.right;else for(t=t.right;!t.isEmpty();)this.nodeStack.push(t),t=t.left;return e}hasNext(){return this.nodeStack.length>0}peek(){if(this.nodeStack.length===0)return null;const t=this.nodeStack[this.nodeStack.length-1];return{key:t.key,value:t.value}}}class _t{constructor(t,e,r,s,o){this.key=t,this.value=e,this.color=r??_t.RED,this.left=s??_t.EMPTY,this.right=o??_t.EMPTY,this.size=this.left.size+1+this.right.size}copy(t,e,r,s,o){return new _t(t??this.key,e??this.value,r??this.color,s??this.left,o??this.right)}isEmpty(){return!1}inorderTraversal(t){return this.left.inorderTraversal(t)||t(this.key,this.value)||this.right.inorderTraversal(t)}reverseTraversal(t){return this.right.reverseTraversal(t)||t(this.key,this.value)||this.left.reverseTraversal(t)}min(){return this.left.isEmpty()?this:this.left.min()}minKey(){return this.min().key}maxKey(){return this.right.isEmpty()?this.key:this.right.maxKey()}insert(t,e,r){let s=this;const o=r(t,s.key);return s=o<0?s.copy(null,null,null,s.left.insert(t,e,r),null):o===0?s.copy(null,e,null,null,null):s.copy(null,null,null,null,s.right.insert(t,e,r)),s.fixUp()}removeMin(){if(this.left.isEmpty())return _t.EMPTY;let t=this;return t.left.isRed()||t.left.left.isRed()||(t=t.moveRedLeft()),t=t.copy(null,null,null,t.left.removeMin(),null),t.fixUp()}remove(t,e){let r,s=this;if(e(t,s.key)<0)s.left.isEmpty()||s.left.isRed()||s.left.left.isRed()||(s=s.moveRedLeft()),s=s.copy(null,null,null,s.left.remove(t,e),null);else{if(s.left.isRed()&&(s=s.rotateRight()),s.right.isEmpty()||s.right.isRed()||s.right.left.isRed()||(s=s.moveRedRight()),e(t,s.key)===0){if(s.right.isEmpty())return _t.EMPTY;r=s.right.min(),s=s.copy(r.key,r.value,null,null,s.right.removeMin())}s=s.copy(null,null,null,null,s.right.remove(t,e))}return s.fixUp()}isRed(){return this.color}fixUp(){let t=this;return t.right.isRed()&&!t.left.isRed()&&(t=t.rotateLeft()),t.left.isRed()&&t.left.left.isRed()&&(t=t.rotateRight()),t.left.isRed()&&t.right.isRed()&&(t=t.colorFlip()),t}moveRedLeft(){let t=this.colorFlip();return t.right.left.isRed()&&(t=t.copy(null,null,null,null,t.right.rotateRight()),t=t.rotateLeft(),t=t.colorFlip()),t}moveRedRight(){let t=this.colorFlip();return t.left.left.isRed()&&(t=t.rotateRight(),t=t.colorFlip()),t}rotateLeft(){const t=this.copy(null,null,_t.RED,null,this.right.left);return this.right.copy(null,null,this.color,t,null)}rotateRight(){const t=this.copy(null,null,_t.RED,this.left.right,null);return this.left.copy(null,null,this.color,null,t)}colorFlip(){const t=this.left.copy(null,null,!this.left.color,null,null),e=this.right.copy(null,null,!this.right.color,null,null);return this.copy(null,null,!this.color,t,e)}checkMaxDepth(){const t=this.check();return Math.pow(2,t)<=this.size+1}check(){if(this.isRed()&&this.left.isRed())throw F(43730,{key:this.key,value:this.value});if(this.right.isRed())throw F(14113,{key:this.key,value:this.value});const t=this.left.check();if(t!==this.right.check())throw F(27949);return t+(this.isRed()?0:1)}}_t.EMPTY=null,_t.RED=!0,_t.BLACK=!1;_t.EMPTY=new class{constructor(){this.size=0}get key(){throw F(57766)}get value(){throw F(16141)}get color(){throw F(16727)}get left(){throw F(29726)}get right(){throw F(36894)}copy(t,e,r,s,o){return this}insert(t,e,r){return new _t(t,e)}remove(t,e){return this}isEmpty(){return!0}inorderTraversal(t){return!1}reverseTraversal(t){return!1}minKey(){return null}maxKey(){return null}isRed(){return!1}checkMaxDepth(){return!0}check(){return 0}};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ft{constructor(t){this.comparator=t,this.data=new st(this.comparator)}has(t){return this.data.get(t)!==null}first(){return this.data.minKey()}last(){return this.data.maxKey()}get size(){return this.data.size}indexOf(t){return this.data.indexOf(t)}forEach(t){this.data.inorderTraversal((e,r)=>(t(e),!1))}forEachInRange(t,e){const r=this.data.getIteratorFrom(t[0]);for(;r.hasNext();){const s=r.getNext();if(this.comparator(s.key,t[1])>=0)return;e(s.key)}}forEachWhile(t,e){let r;for(r=e!==void 0?this.data.getIteratorFrom(e):this.data.getIterator();r.hasNext();)if(!t(r.getNext().key))return}firstAfterOrEqual(t){const e=this.data.getIteratorFrom(t);return e.hasNext()?e.getNext().key:null}getIterator(){return new Ka(this.data.getIterator())}getIteratorFrom(t){return new Ka(this.data.getIteratorFrom(t))}add(t){return this.copy(this.data.remove(t).insert(t,!0))}delete(t){return this.has(t)?this.copy(this.data.remove(t)):this}isEmpty(){return this.data.isEmpty()}unionWith(t){let e=this;return e.size<t.size&&(e=t,t=this),t.forEach(r=>{e=e.add(r)}),e}isEqual(t){if(!(t instanceof ft)||this.size!==t.size)return!1;const e=this.data.getIterator(),r=t.data.getIterator();for(;e.hasNext();){const s=e.getNext().key,o=r.getNext().key;if(this.comparator(s,o)!==0)return!1}return!0}toArray(){const t=[];return this.forEach(e=>{t.push(e)}),t}toString(){const t=[];return this.forEach(e=>t.push(e)),"SortedSet("+t.toString()+")"}copy(t){const e=new ft(this.comparator);return e.data=t,e}}class Ka{constructor(t){this.iter=t}getNext(){return this.iter.getNext().key}hasNext(){return this.iter.hasNext()}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Mt{constructor(t){this.fields=t,t.sort(yt.comparator)}static empty(){return new Mt([])}unionWith(t){let e=new ft(yt.comparator);for(const r of this.fields)e=e.add(r);for(const r of t)e=e.add(r);return new Mt(e.toArray())}covers(t){for(const e of this.fields)if(e.isPrefixOf(t))return!0;return!1}isEqual(t){return nn(this.fields,t.fields,(e,r)=>e.isEqual(r))}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Rc extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class vt{constructor(t){this.binaryString=t}static fromBase64String(t){const e=function(s){try{return atob(s)}catch(o){throw typeof DOMException<"u"&&o instanceof DOMException?new Rc("Invalid base64 string: "+o):o}}(t);return new vt(e)}static fromUint8Array(t){const e=function(s){let o="";for(let a=0;a<s.length;++a)o+=String.fromCharCode(s[a]);return o}(t);return new vt(e)}[Symbol.iterator](){let t=0;return{next:()=>t<this.binaryString.length?{value:this.binaryString.charCodeAt(t++),done:!1}:{value:void 0,done:!0}}}toBase64(){return function(e){return btoa(e)}(this.binaryString)}toUint8Array(){return function(e){const r=new Uint8Array(e.length);for(let s=0;s<e.length;s++)r[s]=e.charCodeAt(s);return r}(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(t){return G(this.binaryString,t.binaryString)}isEqual(t){return this.binaryString===t.binaryString}}vt.EMPTY_BYTE_STRING=new vt("");const Dp=new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);function _e(n){if(X(!!n,39018),typeof n=="string"){let t=0;const e=Dp.exec(n);if(X(!!e,46558,{timestamp:n}),e[1]){let s=e[1];s=(s+"000000000").substr(0,9),t=Number(s)}const r=new Date(n);return{seconds:Math.floor(r.getTime()/1e3),nanos:t}}return{seconds:ut(n.seconds),nanos:ut(n.nanos)}}function ut(n){return typeof n=="number"?n:typeof n=="string"?Number(n):0}function ye(n){return typeof n=="string"?vt.fromBase64String(n):vt.fromUint8Array(n)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const bc="server_timestamp",Pc="__type__",Cc="__previous_value__",Vc="__local_write_time__";function Vi(n){var t,e;return((e=(((t=n==null?void 0:n.mapValue)===null||t===void 0?void 0:t.fields)||{})[Pc])===null||e===void 0?void 0:e.stringValue)===bc}function ns(n){const t=n.mapValue.fields[Cc];return Vi(t)?ns(t):t}function $n(n){const t=_e(n.mapValue.fields[Vc].timestampValue);return new nt(t.seconds,t.nanos)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class kp{constructor(t,e,r,s,o,a,c,h,d,p){this.databaseId=t,this.appId=e,this.persistenceKey=r,this.host=s,this.ssl=o,this.forceLongPolling=a,this.autoDetectLongPolling=c,this.longPollingOptions=h,this.useFetchStreams=d,this.isUsingEmulator=p}}const Lr="(default)";class zn{constructor(t,e){this.projectId=t,this.database=e||Lr}static empty(){return new zn("","")}get isDefaultDatabase(){return this.database===Lr}isEqual(t){return t instanceof zn&&t.projectId===this.projectId&&t.database===this.database}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Dc="__type__",Np="__max__",wr={mapValue:{}},kc="__vector__",Fr="value";function ve(n){return"nullValue"in n?0:"booleanValue"in n?1:"integerValue"in n||"doubleValue"in n?2:"timestampValue"in n?3:"stringValue"in n?5:"bytesValue"in n?6:"referenceValue"in n?7:"geoPointValue"in n?8:"arrayValue"in n?9:"mapValue"in n?Vi(n)?4:xp(n)?9007199254740991:Op(n)?10:11:F(28295,{value:n})}function zt(n,t){if(n===t)return!0;const e=ve(n);if(e!==ve(t))return!1;switch(e){case 0:case 9007199254740991:return!0;case 1:return n.booleanValue===t.booleanValue;case 4:return $n(n).isEqual($n(t));case 3:return function(s,o){if(typeof s.timestampValue=="string"&&typeof o.timestampValue=="string"&&s.timestampValue.length===o.timestampValue.length)return s.timestampValue===o.timestampValue;const a=_e(s.timestampValue),c=_e(o.timestampValue);return a.seconds===c.seconds&&a.nanos===c.nanos}(n,t);case 5:return n.stringValue===t.stringValue;case 6:return function(s,o){return ye(s.bytesValue).isEqual(ye(o.bytesValue))}(n,t);case 7:return n.referenceValue===t.referenceValue;case 8:return function(s,o){return ut(s.geoPointValue.latitude)===ut(o.geoPointValue.latitude)&&ut(s.geoPointValue.longitude)===ut(o.geoPointValue.longitude)}(n,t);case 2:return function(s,o){if("integerValue"in s&&"integerValue"in o)return ut(s.integerValue)===ut(o.integerValue);if("doubleValue"in s&&"doubleValue"in o){const a=ut(s.doubleValue),c=ut(o.doubleValue);return a===c?Mr(a)===Mr(c):isNaN(a)&&isNaN(c)}return!1}(n,t);case 9:return nn(n.arrayValue.values||[],t.arrayValue.values||[],zt);case 10:case 11:return function(s,o){const a=s.mapValue.fields||{},c=o.mapValue.fields||{};if(Wa(a)!==Wa(c))return!1;for(const h in a)if(a.hasOwnProperty(h)&&(c[h]===void 0||!zt(a[h],c[h])))return!1;return!0}(n,t);default:return F(52216,{left:n})}}function Gn(n,t){return(n.values||[]).find(e=>zt(e,t))!==void 0}function rn(n,t){if(n===t)return 0;const e=ve(n),r=ve(t);if(e!==r)return G(e,r);switch(e){case 0:case 9007199254740991:return 0;case 1:return G(n.booleanValue,t.booleanValue);case 2:return function(o,a){const c=ut(o.integerValue||o.doubleValue),h=ut(a.integerValue||a.doubleValue);return c<h?-1:c>h?1:c===h?0:isNaN(c)?isNaN(h)?0:-1:1}(n,t);case 3:return Qa(n.timestampValue,t.timestampValue);case 4:return Qa($n(n),$n(t));case 5:return ri(n.stringValue,t.stringValue);case 6:return function(o,a){const c=ye(o),h=ye(a);return c.compareTo(h)}(n.bytesValue,t.bytesValue);case 7:return function(o,a){const c=o.split("/"),h=a.split("/");for(let d=0;d<c.length&&d<h.length;d++){const p=G(c[d],h[d]);if(p!==0)return p}return G(c.length,h.length)}(n.referenceValue,t.referenceValue);case 8:return function(o,a){const c=G(ut(o.latitude),ut(a.latitude));return c!==0?c:G(ut(o.longitude),ut(a.longitude))}(n.geoPointValue,t.geoPointValue);case 9:return Xa(n.arrayValue,t.arrayValue);case 10:return function(o,a){var c,h,d,p;const y=o.fields||{},v=a.fields||{},R=(c=y[Fr])===null||c===void 0?void 0:c.arrayValue,V=(h=v[Fr])===null||h===void 0?void 0:h.arrayValue,k=G(((d=R==null?void 0:R.values)===null||d===void 0?void 0:d.length)||0,((p=V==null?void 0:V.values)===null||p===void 0?void 0:p.length)||0);return k!==0?k:Xa(R,V)}(n.mapValue,t.mapValue);case 11:return function(o,a){if(o===wr.mapValue&&a===wr.mapValue)return 0;if(o===wr.mapValue)return 1;if(a===wr.mapValue)return-1;const c=o.fields||{},h=Object.keys(c),d=a.fields||{},p=Object.keys(d);h.sort(),p.sort();for(let y=0;y<h.length&&y<p.length;++y){const v=ri(h[y],p[y]);if(v!==0)return v;const R=rn(c[h[y]],d[p[y]]);if(R!==0)return R}return G(h.length,p.length)}(n.mapValue,t.mapValue);default:throw F(23264,{le:e})}}function Qa(n,t){if(typeof n=="string"&&typeof t=="string"&&n.length===t.length)return G(n,t);const e=_e(n),r=_e(t),s=G(e.seconds,r.seconds);return s!==0?s:G(e.nanos,r.nanos)}function Xa(n,t){const e=n.values||[],r=t.values||[];for(let s=0;s<e.length&&s<r.length;++s){const o=rn(e[s],r[s]);if(o)return o}return G(e.length,r.length)}function sn(n){return si(n)}function si(n){return"nullValue"in n?"null":"booleanValue"in n?""+n.booleanValue:"integerValue"in n?""+n.integerValue:"doubleValue"in n?""+n.doubleValue:"timestampValue"in n?function(e){const r=_e(e);return`time(${r.seconds},${r.nanos})`}(n.timestampValue):"stringValue"in n?n.stringValue:"bytesValue"in n?function(e){return ye(e).toBase64()}(n.bytesValue):"referenceValue"in n?function(e){return M.fromName(e).toString()}(n.referenceValue):"geoPointValue"in n?function(e){return`geo(${e.latitude},${e.longitude})`}(n.geoPointValue):"arrayValue"in n?function(e){let r="[",s=!0;for(const o of e.values||[])s?s=!1:r+=",",r+=si(o);return r+"]"}(n.arrayValue):"mapValue"in n?function(e){const r=Object.keys(e.fields||{}).sort();let s="{",o=!0;for(const a of r)o?o=!1:s+=",",s+=`${a}:${si(e.fields[a])}`;return s+"}"}(n.mapValue):F(61005,{value:n})}function Pr(n){switch(ve(n)){case 0:case 1:return 4;case 2:return 8;case 3:case 8:return 16;case 4:const t=ns(n);return t?16+Pr(t):16;case 5:return 2*n.stringValue.length;case 6:return ye(n.bytesValue).approximateByteSize();case 7:return n.referenceValue.length;case 9:return function(r){return(r.values||[]).reduce((s,o)=>s+Pr(o),0)}(n.arrayValue);case 10:case 11:return function(r){let s=0;return Fe(r.fields,(o,a)=>{s+=o.length+Pr(a)}),s}(n.mapValue);default:throw F(13486,{value:n})}}function Ya(n,t){return{referenceValue:`projects/${n.projectId}/databases/${n.database}/documents/${t.path.canonicalString()}`}}function ii(n){return!!n&&"integerValue"in n}function Di(n){return!!n&&"arrayValue"in n}function Ja(n){return!!n&&"nullValue"in n}function Za(n){return!!n&&"doubleValue"in n&&isNaN(Number(n.doubleValue))}function Cr(n){return!!n&&"mapValue"in n}function Op(n){var t,e;return((e=(((t=n==null?void 0:n.mapValue)===null||t===void 0?void 0:t.fields)||{})[Dc])===null||e===void 0?void 0:e.stringValue)===kc}function kn(n){if(n.geoPointValue)return{geoPointValue:Object.assign({},n.geoPointValue)};if(n.timestampValue&&typeof n.timestampValue=="object")return{timestampValue:Object.assign({},n.timestampValue)};if(n.mapValue){const t={mapValue:{fields:{}}};return Fe(n.mapValue.fields,(e,r)=>t.mapValue.fields[e]=kn(r)),t}if(n.arrayValue){const t={arrayValue:{values:[]}};for(let e=0;e<(n.arrayValue.values||[]).length;++e)t.arrayValue.values[e]=kn(n.arrayValue.values[e]);return t}return Object.assign({},n)}function xp(n){return(((n.mapValue||{}).fields||{}).__type__||{}).stringValue===Np}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nt{constructor(t){this.value=t}static empty(){return new Nt({mapValue:{}})}field(t){if(t.isEmpty())return this.value;{let e=this.value;for(let r=0;r<t.length-1;++r)if(e=(e.mapValue.fields||{})[t.get(r)],!Cr(e))return null;return e=(e.mapValue.fields||{})[t.lastSegment()],e||null}}set(t,e){this.getFieldsMap(t.popLast())[t.lastSegment()]=kn(e)}setAll(t){let e=yt.emptyPath(),r={},s=[];t.forEach((a,c)=>{if(!e.isImmediateParentOf(c)){const h=this.getFieldsMap(e);this.applyChanges(h,r,s),r={},s=[],e=c.popLast()}a?r[c.lastSegment()]=kn(a):s.push(c.lastSegment())});const o=this.getFieldsMap(e);this.applyChanges(o,r,s)}delete(t){const e=this.field(t.popLast());Cr(e)&&e.mapValue.fields&&delete e.mapValue.fields[t.lastSegment()]}isEqual(t){return zt(this.value,t.value)}getFieldsMap(t){let e=this.value;e.mapValue.fields||(e.mapValue={fields:{}});for(let r=0;r<t.length;++r){let s=e.mapValue.fields[t.get(r)];Cr(s)&&s.mapValue.fields||(s={mapValue:{fields:{}}},e.mapValue.fields[t.get(r)]=s),e=s}return e.mapValue.fields}applyChanges(t,e,r){Fe(e,(s,o)=>t[s]=o);for(const s of r)delete t[s]}clone(){return new Nt(kn(this.value))}}function Nc(n){const t=[];return Fe(n.fields,(e,r)=>{const s=new yt([e]);if(Cr(r)){const o=Nc(r.mapValue).fields;if(o.length===0)t.push(s);else for(const a of o)t.push(s.child(a))}else t.push(s)}),new Mt(t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class St{constructor(t,e,r,s,o,a,c){this.key=t,this.documentType=e,this.version=r,this.readTime=s,this.createTime=o,this.data=a,this.documentState=c}static newInvalidDocument(t){return new St(t,0,j.min(),j.min(),j.min(),Nt.empty(),0)}static newFoundDocument(t,e,r,s){return new St(t,1,e,j.min(),r,s,0)}static newNoDocument(t,e){return new St(t,2,e,j.min(),j.min(),Nt.empty(),0)}static newUnknownDocument(t,e){return new St(t,3,e,j.min(),j.min(),Nt.empty(),2)}convertToFoundDocument(t,e){return!this.createTime.isEqual(j.min())||this.documentType!==2&&this.documentType!==0||(this.createTime=t),this.version=t,this.documentType=1,this.data=e,this.documentState=0,this}convertToNoDocument(t){return this.version=t,this.documentType=2,this.data=Nt.empty(),this.documentState=0,this}convertToUnknownDocument(t){return this.version=t,this.documentType=3,this.data=Nt.empty(),this.documentState=2,this}setHasCommittedMutations(){return this.documentState=2,this}setHasLocalMutations(){return this.documentState=1,this.version=j.min(),this}setReadTime(t){return this.readTime=t,this}get hasLocalMutations(){return this.documentState===1}get hasCommittedMutations(){return this.documentState===2}get hasPendingWrites(){return this.hasLocalMutations||this.hasCommittedMutations}isValidDocument(){return this.documentType!==0}isFoundDocument(){return this.documentType===1}isNoDocument(){return this.documentType===2}isUnknownDocument(){return this.documentType===3}isEqual(t){return t instanceof St&&this.key.isEqual(t.key)&&this.version.isEqual(t.version)&&this.documentType===t.documentType&&this.documentState===t.documentState&&this.data.isEqual(t.data)}mutableCopy(){return new St(this.key,this.documentType,this.version,this.readTime,this.createTime,this.data.clone(),this.documentState)}toString(){return`Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ur{constructor(t,e){this.position=t,this.inclusive=e}}function tu(n,t,e){let r=0;for(let s=0;s<n.position.length;s++){const o=t[s],a=n.position[s];if(o.field.isKeyField()?r=M.comparator(M.fromName(a.referenceValue),e.key):r=rn(a,e.data.field(o.field)),o.dir==="desc"&&(r*=-1),r!==0)break}return r}function eu(n,t){if(n===null)return t===null;if(t===null||n.inclusive!==t.inclusive||n.position.length!==t.position.length)return!1;for(let e=0;e<n.position.length;e++)if(!zt(n.position[e],t.position[e]))return!1;return!0}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Br{constructor(t,e="asc"){this.field=t,this.dir=e}}function Mp(n,t){return n.dir===t.dir&&n.field.isEqual(t.field)}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Oc{}class lt extends Oc{constructor(t,e,r){super(),this.field=t,this.op=e,this.value=r}static create(t,e,r){return t.isKeyField()?e==="in"||e==="not-in"?this.createKeyFieldInFilter(t,e,r):new Fp(t,e,r):e==="array-contains"?new jp(t,r):e==="in"?new qp(t,r):e==="not-in"?new $p(t,r):e==="array-contains-any"?new zp(t,r):new lt(t,e,r)}static createKeyFieldInFilter(t,e,r){return e==="in"?new Up(t,r):new Bp(t,r)}matches(t){const e=t.data.field(this.field);return this.op==="!="?e!==null&&e.nullValue===void 0&&this.matchesComparison(rn(e,this.value)):e!==null&&ve(this.value)===ve(e)&&this.matchesComparison(rn(e,this.value))}matchesComparison(t){switch(this.op){case"<":return t<0;case"<=":return t<=0;case"==":return t===0;case"!=":return t!==0;case">":return t>0;case">=":return t>=0;default:return F(47266,{operator:this.op})}}isInequality(){return["<","<=",">",">=","!=","not-in"].indexOf(this.op)>=0}getFlattenedFilters(){return[this]}getFilters(){return[this]}}class Lt extends Oc{constructor(t,e){super(),this.filters=t,this.op=e,this.he=null}static create(t,e){return new Lt(t,e)}matches(t){return xc(this)?this.filters.find(e=>!e.matches(t))===void 0:this.filters.find(e=>e.matches(t))!==void 0}getFlattenedFilters(){return this.he!==null||(this.he=this.filters.reduce((t,e)=>t.concat(e.getFlattenedFilters()),[])),this.he}getFilters(){return Object.assign([],this.filters)}}function xc(n){return n.op==="and"}function Mc(n){return Lp(n)&&xc(n)}function Lp(n){for(const t of n.filters)if(t instanceof Lt)return!1;return!0}function oi(n){if(n instanceof lt)return n.field.canonicalString()+n.op.toString()+sn(n.value);if(Mc(n))return n.filters.map(t=>oi(t)).join(",");{const t=n.filters.map(e=>oi(e)).join(",");return`${n.op}(${t})`}}function Lc(n,t){return n instanceof lt?function(r,s){return s instanceof lt&&r.op===s.op&&r.field.isEqual(s.field)&&zt(r.value,s.value)}(n,t):n instanceof Lt?function(r,s){return s instanceof Lt&&r.op===s.op&&r.filters.length===s.filters.length?r.filters.reduce((o,a,c)=>o&&Lc(a,s.filters[c]),!0):!1}(n,t):void F(19439)}function Fc(n){return n instanceof lt?function(e){return`${e.field.canonicalString()} ${e.op} ${sn(e.value)}`}(n):n instanceof Lt?function(e){return e.op.toString()+" {"+e.getFilters().map(Fc).join(" ,")+"}"}(n):"Filter"}class Fp extends lt{constructor(t,e,r){super(t,e,r),this.key=M.fromName(r.referenceValue)}matches(t){const e=M.comparator(t.key,this.key);return this.matchesComparison(e)}}class Up extends lt{constructor(t,e){super(t,"in",e),this.keys=Uc("in",e)}matches(t){return this.keys.some(e=>e.isEqual(t.key))}}class Bp extends lt{constructor(t,e){super(t,"not-in",e),this.keys=Uc("not-in",e)}matches(t){return!this.keys.some(e=>e.isEqual(t.key))}}function Uc(n,t){var e;return(((e=t.arrayValue)===null||e===void 0?void 0:e.values)||[]).map(r=>M.fromName(r.referenceValue))}class jp extends lt{constructor(t,e){super(t,"array-contains",e)}matches(t){const e=t.data.field(this.field);return Di(e)&&Gn(e.arrayValue,this.value)}}class qp extends lt{constructor(t,e){super(t,"in",e)}matches(t){const e=t.data.field(this.field);return e!==null&&Gn(this.value.arrayValue,e)}}class $p extends lt{constructor(t,e){super(t,"not-in",e)}matches(t){if(Gn(this.value.arrayValue,{nullValue:"NULL_VALUE"}))return!1;const e=t.data.field(this.field);return e!==null&&e.nullValue===void 0&&!Gn(this.value.arrayValue,e)}}class zp extends lt{constructor(t,e){super(t,"array-contains-any",e)}matches(t){const e=t.data.field(this.field);return!(!Di(e)||!e.arrayValue.values)&&e.arrayValue.values.some(r=>Gn(this.value.arrayValue,r))}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gp{constructor(t,e=null,r=[],s=[],o=null,a=null,c=null){this.path=t,this.collectionGroup=e,this.orderBy=r,this.filters=s,this.limit=o,this.startAt=a,this.endAt=c,this.Pe=null}}function nu(n,t=null,e=[],r=[],s=null,o=null,a=null){return new Gp(n,t,e,r,s,o,a)}function ki(n){const t=q(n);if(t.Pe===null){let e=t.path.canonicalString();t.collectionGroup!==null&&(e+="|cg:"+t.collectionGroup),e+="|f:",e+=t.filters.map(r=>oi(r)).join(","),e+="|ob:",e+=t.orderBy.map(r=>function(o){return o.field.canonicalString()+o.dir}(r)).join(","),es(t.limit)||(e+="|l:",e+=t.limit),t.startAt&&(e+="|lb:",e+=t.startAt.inclusive?"b:":"a:",e+=t.startAt.position.map(r=>sn(r)).join(",")),t.endAt&&(e+="|ub:",e+=t.endAt.inclusive?"a:":"b:",e+=t.endAt.position.map(r=>sn(r)).join(",")),t.Pe=e}return t.Pe}function Ni(n,t){if(n.limit!==t.limit||n.orderBy.length!==t.orderBy.length)return!1;for(let e=0;e<n.orderBy.length;e++)if(!Mp(n.orderBy[e],t.orderBy[e]))return!1;if(n.filters.length!==t.filters.length)return!1;for(let e=0;e<n.filters.length;e++)if(!Lc(n.filters[e],t.filters[e]))return!1;return n.collectionGroup===t.collectionGroup&&!!n.path.isEqual(t.path)&&!!eu(n.startAt,t.startAt)&&eu(n.endAt,t.endAt)}function ai(n){return M.isDocumentKey(n.path)&&n.collectionGroup===null&&n.filters.length===0}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Yn{constructor(t,e=null,r=[],s=[],o=null,a="F",c=null,h=null){this.path=t,this.collectionGroup=e,this.explicitOrderBy=r,this.filters=s,this.limit=o,this.limitType=a,this.startAt=c,this.endAt=h,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}}function Hp(n,t,e,r,s,o,a,c){return new Yn(n,t,e,r,s,o,a,c)}function Oi(n){return new Yn(n)}function ru(n){return n.filters.length===0&&n.limit===null&&n.startAt==null&&n.endAt==null&&(n.explicitOrderBy.length===0||n.explicitOrderBy.length===1&&n.explicitOrderBy[0].field.isKeyField())}function Bc(n){return n.collectionGroup!==null}function Nn(n){const t=q(n);if(t.Te===null){t.Te=[];const e=new Set;for(const o of t.explicitOrderBy)t.Te.push(o),e.add(o.field.canonicalString());const r=t.explicitOrderBy.length>0?t.explicitOrderBy[t.explicitOrderBy.length-1].dir:"asc";(function(a){let c=new ft(yt.comparator);return a.filters.forEach(h=>{h.getFlattenedFilters().forEach(d=>{d.isInequality()&&(c=c.add(d.field))})}),c})(t).forEach(o=>{e.has(o.canonicalString())||o.isKeyField()||t.Te.push(new Br(o,r))}),e.has(yt.keyField().canonicalString())||t.Te.push(new Br(yt.keyField(),r))}return t.Te}function Ut(n){const t=q(n);return t.Ie||(t.Ie=Wp(t,Nn(n))),t.Ie}function Wp(n,t){if(n.limitType==="F")return nu(n.path,n.collectionGroup,t,n.filters,n.limit,n.startAt,n.endAt);{t=t.map(s=>{const o=s.dir==="desc"?"asc":"desc";return new Br(s.field,o)});const e=n.endAt?new Ur(n.endAt.position,n.endAt.inclusive):null,r=n.startAt?new Ur(n.startAt.position,n.startAt.inclusive):null;return nu(n.path,n.collectionGroup,t,n.filters,n.limit,e,r)}}function ui(n,t){const e=n.filters.concat([t]);return new Yn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),e,n.limit,n.limitType,n.startAt,n.endAt)}function jr(n,t,e){return new Yn(n.path,n.collectionGroup,n.explicitOrderBy.slice(),n.filters.slice(),t,e,n.startAt,n.endAt)}function rs(n,t){return Ni(Ut(n),Ut(t))&&n.limitType===t.limitType}function jc(n){return`${ki(Ut(n))}|lt:${n.limitType}`}function Ke(n){return`Query(target=${function(e){let r=e.path.canonicalString();return e.collectionGroup!==null&&(r+=" collectionGroup="+e.collectionGroup),e.filters.length>0&&(r+=`, filters: [${e.filters.map(s=>Fc(s)).join(", ")}]`),es(e.limit)||(r+=", limit: "+e.limit),e.orderBy.length>0&&(r+=`, orderBy: [${e.orderBy.map(s=>function(a){return`${a.field.canonicalString()} (${a.dir})`}(s)).join(", ")}]`),e.startAt&&(r+=", startAt: ",r+=e.startAt.inclusive?"b:":"a:",r+=e.startAt.position.map(s=>sn(s)).join(",")),e.endAt&&(r+=", endAt: ",r+=e.endAt.inclusive?"a:":"b:",r+=e.endAt.position.map(s=>sn(s)).join(",")),`Target(${r})`}(Ut(n))}; limitType=${n.limitType})`}function ss(n,t){return t.isFoundDocument()&&function(r,s){const o=s.key.path;return r.collectionGroup!==null?s.key.hasCollectionId(r.collectionGroup)&&r.path.isPrefixOf(o):M.isDocumentKey(r.path)?r.path.isEqual(o):r.path.isImmediateParentOf(o)}(n,t)&&function(r,s){for(const o of Nn(r))if(!o.field.isKeyField()&&s.data.field(o.field)===null)return!1;return!0}(n,t)&&function(r,s){for(const o of r.filters)if(!o.matches(s))return!1;return!0}(n,t)&&function(r,s){return!(r.startAt&&!function(a,c,h){const d=tu(a,c,h);return a.inclusive?d<=0:d<0}(r.startAt,Nn(r),s)||r.endAt&&!function(a,c,h){const d=tu(a,c,h);return a.inclusive?d>=0:d>0}(r.endAt,Nn(r),s))}(n,t)}function Kp(n){return n.collectionGroup||(n.path.length%2==1?n.path.lastSegment():n.path.get(n.path.length-2))}function qc(n){return(t,e)=>{let r=!1;for(const s of Nn(n)){const o=Qp(s,t,e);if(o!==0)return o;r=r||s.field.isKeyField()}return 0}}function Qp(n,t,e){const r=n.field.isKeyField()?M.comparator(t.key,e.key):function(o,a,c){const h=a.data.field(o),d=c.data.field(o);return h!==null&&d!==null?rn(h,d):F(42886)}(n.field,t,e);switch(n.dir){case"asc":return r;case"desc":return-1*r;default:return F(19790,{direction:n.dir})}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ue{constructor(t,e){this.mapKeyFn=t,this.equalsFn=e,this.inner={},this.innerSize=0}get(t){const e=this.mapKeyFn(t),r=this.inner[e];if(r!==void 0){for(const[s,o]of r)if(this.equalsFn(s,t))return o}}has(t){return this.get(t)!==void 0}set(t,e){const r=this.mapKeyFn(t),s=this.inner[r];if(s===void 0)return this.inner[r]=[[t,e]],void this.innerSize++;for(let o=0;o<s.length;o++)if(this.equalsFn(s[o][0],t))return void(s[o]=[t,e]);s.push([t,e]),this.innerSize++}delete(t){const e=this.mapKeyFn(t),r=this.inner[e];if(r===void 0)return!1;for(let s=0;s<r.length;s++)if(this.equalsFn(r[s][0],t))return r.length===1?delete this.inner[e]:r.splice(s,1),this.innerSize--,!0;return!1}forEach(t){Fe(this.inner,(e,r)=>{for(const[s,o]of r)t(s,o)})}isEmpty(){return Sc(this.inner)}size(){return this.innerSize}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Xp=new st(M.comparator);function re(){return Xp}const $c=new st(M.comparator);function Pn(...n){let t=$c;for(const e of n)t=t.insert(e.key,e);return t}function zc(n){let t=$c;return n.forEach((e,r)=>t=t.insert(e,r.overlayedDocument)),t}function Ve(){return On()}function Gc(){return On()}function On(){return new Ue(n=>n.toString(),(n,t)=>n.isEqual(t))}const Yp=new st(M.comparator),Jp=new ft(M.comparator);function H(...n){let t=Jp;for(const e of n)t=t.add(e);return t}const Zp=new ft(G);function tm(){return Zp}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function xi(n,t){if(n.useProto3Json){if(isNaN(t))return{doubleValue:"NaN"};if(t===1/0)return{doubleValue:"Infinity"};if(t===-1/0)return{doubleValue:"-Infinity"}}return{doubleValue:Mr(t)?"-0":t}}function Hc(n){return{integerValue:""+n}}function em(n,t){return Pp(t)?Hc(t):xi(n,t)}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class is{constructor(){this._=void 0}}function nm(n,t,e){return n instanceof Hn?function(s,o){const a={fields:{[Pc]:{stringValue:bc},[Vc]:{timestampValue:{seconds:s.seconds,nanos:s.nanoseconds}}}};return o&&Vi(o)&&(o=ns(o)),o&&(a.fields[Cc]=o),{mapValue:a}}(e,t):n instanceof Wn?Kc(n,t):n instanceof Kn?Qc(n,t):function(s,o){const a=Wc(s,o),c=su(a)+su(s.Ee);return ii(a)&&ii(s.Ee)?Hc(c):xi(s.serializer,c)}(n,t)}function rm(n,t,e){return n instanceof Wn?Kc(n,t):n instanceof Kn?Qc(n,t):e}function Wc(n,t){return n instanceof qr?function(r){return ii(r)||function(o){return!!o&&"doubleValue"in o}(r)}(t)?t:{integerValue:0}:null}class Hn extends is{}class Wn extends is{constructor(t){super(),this.elements=t}}function Kc(n,t){const e=Xc(t);for(const r of n.elements)e.some(s=>zt(s,r))||e.push(r);return{arrayValue:{values:e}}}class Kn extends is{constructor(t){super(),this.elements=t}}function Qc(n,t){let e=Xc(t);for(const r of n.elements)e=e.filter(s=>!zt(s,r));return{arrayValue:{values:e}}}class qr extends is{constructor(t,e){super(),this.serializer=t,this.Ee=e}}function su(n){return ut(n.integerValue||n.doubleValue)}function Xc(n){return Di(n)&&n.arrayValue.values?n.arrayValue.values.slice():[]}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class sm{constructor(t,e){this.field=t,this.transform=e}}function im(n,t){return n.field.isEqual(t.field)&&function(r,s){return r instanceof Wn&&s instanceof Wn||r instanceof Kn&&s instanceof Kn?nn(r.elements,s.elements,zt):r instanceof qr&&s instanceof qr?zt(r.Ee,s.Ee):r instanceof Hn&&s instanceof Hn}(n.transform,t.transform)}class om{constructor(t,e){this.version=t,this.transformResults=e}}class Bt{constructor(t,e){this.updateTime=t,this.exists=e}static none(){return new Bt}static exists(t){return new Bt(void 0,t)}static updateTime(t){return new Bt(t)}get isNone(){return this.updateTime===void 0&&this.exists===void 0}isEqual(t){return this.exists===t.exists&&(this.updateTime?!!t.updateTime&&this.updateTime.isEqual(t.updateTime):!t.updateTime)}}function Vr(n,t){return n.updateTime!==void 0?t.isFoundDocument()&&t.version.isEqual(n.updateTime):n.exists===void 0||n.exists===t.isFoundDocument()}class os{}function Yc(n,t){if(!n.hasLocalMutations||t&&t.fields.length===0)return null;if(t===null)return n.isNoDocument()?new Zc(n.key,Bt.none()):new Jn(n.key,n.data,Bt.none());{const e=n.data,r=Nt.empty();let s=new ft(yt.comparator);for(let o of t.fields)if(!s.has(o)){let a=e.field(o);a===null&&o.length>1&&(o=o.popLast(),a=e.field(o)),a===null?r.delete(o):r.set(o,a),s=s.add(o)}return new Be(n.key,r,new Mt(s.toArray()),Bt.none())}}function am(n,t,e){n instanceof Jn?function(s,o,a){const c=s.value.clone(),h=ou(s.fieldTransforms,o,a.transformResults);c.setAll(h),o.convertToFoundDocument(a.version,c).setHasCommittedMutations()}(n,t,e):n instanceof Be?function(s,o,a){if(!Vr(s.precondition,o))return void o.convertToUnknownDocument(a.version);const c=ou(s.fieldTransforms,o,a.transformResults),h=o.data;h.setAll(Jc(s)),h.setAll(c),o.convertToFoundDocument(a.version,h).setHasCommittedMutations()}(n,t,e):function(s,o,a){o.convertToNoDocument(a.version).setHasCommittedMutations()}(0,t,e)}function xn(n,t,e,r){return n instanceof Jn?function(o,a,c,h){if(!Vr(o.precondition,a))return c;const d=o.value.clone(),p=au(o.fieldTransforms,h,a);return d.setAll(p),a.convertToFoundDocument(a.version,d).setHasLocalMutations(),null}(n,t,e,r):n instanceof Be?function(o,a,c,h){if(!Vr(o.precondition,a))return c;const d=au(o.fieldTransforms,h,a),p=a.data;return p.setAll(Jc(o)),p.setAll(d),a.convertToFoundDocument(a.version,p).setHasLocalMutations(),c===null?null:c.unionWith(o.fieldMask.fields).unionWith(o.fieldTransforms.map(y=>y.field))}(n,t,e,r):function(o,a,c){return Vr(o.precondition,a)?(a.convertToNoDocument(a.version).setHasLocalMutations(),null):c}(n,t,e)}function um(n,t){let e=null;for(const r of n.fieldTransforms){const s=t.data.field(r.field),o=Wc(r.transform,s||null);o!=null&&(e===null&&(e=Nt.empty()),e.set(r.field,o))}return e||null}function iu(n,t){return n.type===t.type&&!!n.key.isEqual(t.key)&&!!n.precondition.isEqual(t.precondition)&&!!function(r,s){return r===void 0&&s===void 0||!(!r||!s)&&nn(r,s,(o,a)=>im(o,a))}(n.fieldTransforms,t.fieldTransforms)&&(n.type===0?n.value.isEqual(t.value):n.type!==1||n.data.isEqual(t.data)&&n.fieldMask.isEqual(t.fieldMask))}class Jn extends os{constructor(t,e,r,s=[]){super(),this.key=t,this.value=e,this.precondition=r,this.fieldTransforms=s,this.type=0}getFieldMask(){return null}}class Be extends os{constructor(t,e,r,s,o=[]){super(),this.key=t,this.data=e,this.fieldMask=r,this.precondition=s,this.fieldTransforms=o,this.type=1}getFieldMask(){return this.fieldMask}}function Jc(n){const t=new Map;return n.fieldMask.fields.forEach(e=>{if(!e.isEmpty()){const r=n.data.field(e);t.set(e,r)}}),t}function ou(n,t,e){const r=new Map;X(n.length===e.length,32656,{Ae:e.length,Re:n.length});for(let s=0;s<e.length;s++){const o=n[s],a=o.transform,c=t.data.field(o.field);r.set(o.field,rm(a,c,e[s]))}return r}function au(n,t,e){const r=new Map;for(const s of n){const o=s.transform,a=e.data.field(s.field);r.set(s.field,nm(o,a,t))}return r}class Zc extends os{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=2,this.fieldTransforms=[]}getFieldMask(){return null}}class cm extends os{constructor(t,e){super(),this.key=t,this.precondition=e,this.type=3,this.fieldTransforms=[]}getFieldMask(){return null}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class lm{constructor(t,e,r,s){this.batchId=t,this.localWriteTime=e,this.baseMutations=r,this.mutations=s}applyToRemoteDocument(t,e){const r=e.mutationResults;for(let s=0;s<this.mutations.length;s++){const o=this.mutations[s];o.key.isEqual(t.key)&&am(o,t,r[s])}}applyToLocalView(t,e){for(const r of this.baseMutations)r.key.isEqual(t.key)&&(e=xn(r,t,e,this.localWriteTime));for(const r of this.mutations)r.key.isEqual(t.key)&&(e=xn(r,t,e,this.localWriteTime));return e}applyToLocalDocumentSet(t,e){const r=Gc();return this.mutations.forEach(s=>{const o=t.get(s.key),a=o.overlayedDocument;let c=this.applyToLocalView(a,o.mutatedFields);c=e.has(s.key)?null:c;const h=Yc(a,c);h!==null&&r.set(s.key,h),a.isValidDocument()||a.convertToNoDocument(j.min())}),r}keys(){return this.mutations.reduce((t,e)=>t.add(e.key),H())}isEqual(t){return this.batchId===t.batchId&&nn(this.mutations,t.mutations,(e,r)=>iu(e,r))&&nn(this.baseMutations,t.baseMutations,(e,r)=>iu(e,r))}}class Mi{constructor(t,e,r,s){this.batch=t,this.commitVersion=e,this.mutationResults=r,this.docVersions=s}static from(t,e,r){X(t.mutations.length===r.length,58842,{Ve:t.mutations.length,me:r.length});let s=function(){return Yp}();const o=t.mutations;for(let a=0;a<o.length;a++)s=s.insert(o[a].key,r[a].version);return new Mi(t,e,r,s)}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hm{constructor(t,e){this.largestBatchId=t,this.mutation=e}getKey(){return this.mutation.key}isEqual(t){return t!==null&&this.mutation===t.mutation}toString(){return`Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class dm{constructor(t,e){this.count=t,this.unchangedNames=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */var ct,W;function fm(n){switch(n){case b.OK:return F(64938);case b.CANCELLED:case b.UNKNOWN:case b.DEADLINE_EXCEEDED:case b.RESOURCE_EXHAUSTED:case b.INTERNAL:case b.UNAVAILABLE:case b.UNAUTHENTICATED:return!1;case b.INVALID_ARGUMENT:case b.NOT_FOUND:case b.ALREADY_EXISTS:case b.PERMISSION_DENIED:case b.FAILED_PRECONDITION:case b.ABORTED:case b.OUT_OF_RANGE:case b.UNIMPLEMENTED:case b.DATA_LOSS:return!0;default:return F(15467,{code:n})}}function tl(n){if(n===void 0)return ne("GRPC error has no .code"),b.UNKNOWN;switch(n){case ct.OK:return b.OK;case ct.CANCELLED:return b.CANCELLED;case ct.UNKNOWN:return b.UNKNOWN;case ct.DEADLINE_EXCEEDED:return b.DEADLINE_EXCEEDED;case ct.RESOURCE_EXHAUSTED:return b.RESOURCE_EXHAUSTED;case ct.INTERNAL:return b.INTERNAL;case ct.UNAVAILABLE:return b.UNAVAILABLE;case ct.UNAUTHENTICATED:return b.UNAUTHENTICATED;case ct.INVALID_ARGUMENT:return b.INVALID_ARGUMENT;case ct.NOT_FOUND:return b.NOT_FOUND;case ct.ALREADY_EXISTS:return b.ALREADY_EXISTS;case ct.PERMISSION_DENIED:return b.PERMISSION_DENIED;case ct.FAILED_PRECONDITION:return b.FAILED_PRECONDITION;case ct.ABORTED:return b.ABORTED;case ct.OUT_OF_RANGE:return b.OUT_OF_RANGE;case ct.UNIMPLEMENTED:return b.UNIMPLEMENTED;case ct.DATA_LOSS:return b.DATA_LOSS;default:return F(39323,{code:n})}}(W=ct||(ct={}))[W.OK=0]="OK",W[W.CANCELLED=1]="CANCELLED",W[W.UNKNOWN=2]="UNKNOWN",W[W.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",W[W.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",W[W.NOT_FOUND=5]="NOT_FOUND",W[W.ALREADY_EXISTS=6]="ALREADY_EXISTS",W[W.PERMISSION_DENIED=7]="PERMISSION_DENIED",W[W.UNAUTHENTICATED=16]="UNAUTHENTICATED",W[W.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",W[W.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",W[W.ABORTED=10]="ABORTED",W[W.OUT_OF_RANGE=11]="OUT_OF_RANGE",W[W.UNIMPLEMENTED=12]="UNIMPLEMENTED",W[W.INTERNAL=13]="INTERNAL",W[W.UNAVAILABLE=14]="UNAVAILABLE",W[W.DATA_LOSS=15]="DATA_LOSS";/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pm=new le([4294967295,4294967295],0);function uu(n){const t=Tc().encode(n),e=new fc;return e.update(t),new Uint8Array(e.digest())}function cu(n){const t=new DataView(n.buffer),e=t.getUint32(0,!0),r=t.getUint32(4,!0),s=t.getUint32(8,!0),o=t.getUint32(12,!0);return[new le([e,r],0),new le([s,o],0)]}class Li{constructor(t,e,r){if(this.bitmap=t,this.padding=e,this.hashCount=r,e<0||e>=8)throw new Cn(`Invalid padding: ${e}`);if(r<0)throw new Cn(`Invalid hash count: ${r}`);if(t.length>0&&this.hashCount===0)throw new Cn(`Invalid hash count: ${r}`);if(t.length===0&&e!==0)throw new Cn(`Invalid padding when bitmap length is 0: ${e}`);this.fe=8*t.length-e,this.ge=le.fromNumber(this.fe)}pe(t,e,r){let s=t.add(e.multiply(le.fromNumber(r)));return s.compare(pm)===1&&(s=new le([s.getBits(0),s.getBits(1)],0)),s.modulo(this.ge).toNumber()}ye(t){return!!(this.bitmap[Math.floor(t/8)]&1<<t%8)}mightContain(t){if(this.fe===0)return!1;const e=uu(t),[r,s]=cu(e);for(let o=0;o<this.hashCount;o++){const a=this.pe(r,s,o);if(!this.ye(a))return!1}return!0}static create(t,e,r){const s=t%8==0?0:8-t%8,o=new Uint8Array(Math.ceil(t/8)),a=new Li(o,s,e);return r.forEach(c=>a.insert(c)),a}insert(t){if(this.fe===0)return;const e=uu(t),[r,s]=cu(e);for(let o=0;o<this.hashCount;o++){const a=this.pe(r,s,o);this.we(a)}}we(t){const e=Math.floor(t/8),r=t%8;this.bitmap[e]|=1<<r}}class Cn extends Error{constructor(){super(...arguments),this.name="BloomFilterError"}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class as{constructor(t,e,r,s,o){this.snapshotVersion=t,this.targetChanges=e,this.targetMismatches=r,this.documentUpdates=s,this.resolvedLimboDocuments=o}static createSynthesizedRemoteEventForCurrentChange(t,e,r){const s=new Map;return s.set(t,Zn.createSynthesizedTargetChangeForCurrentChange(t,e,r)),new as(j.min(),s,new st(G),re(),H())}}class Zn{constructor(t,e,r,s,o){this.resumeToken=t,this.current=e,this.addedDocuments=r,this.modifiedDocuments=s,this.removedDocuments=o}static createSynthesizedTargetChangeForCurrentChange(t,e,r){return new Zn(r,e,H(),H(),H())}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Dr{constructor(t,e,r,s){this.Se=t,this.removedTargetIds=e,this.key=r,this.be=s}}class el{constructor(t,e){this.targetId=t,this.De=e}}class nl{constructor(t,e,r=vt.EMPTY_BYTE_STRING,s=null){this.state=t,this.targetIds=e,this.resumeToken=r,this.cause=s}}class lu{constructor(){this.ve=0,this.Ce=hu(),this.Fe=vt.EMPTY_BYTE_STRING,this.Me=!1,this.xe=!0}get current(){return this.Me}get resumeToken(){return this.Fe}get Oe(){return this.ve!==0}get Ne(){return this.xe}Be(t){t.approximateByteSize()>0&&(this.xe=!0,this.Fe=t)}Le(){let t=H(),e=H(),r=H();return this.Ce.forEach((s,o)=>{switch(o){case 0:t=t.add(s);break;case 2:e=e.add(s);break;case 1:r=r.add(s);break;default:F(38017,{changeType:o})}}),new Zn(this.Fe,this.Me,t,e,r)}ke(){this.xe=!1,this.Ce=hu()}qe(t,e){this.xe=!0,this.Ce=this.Ce.insert(t,e)}Qe(t){this.xe=!0,this.Ce=this.Ce.remove(t)}$e(){this.ve+=1}Ue(){this.ve-=1,X(this.ve>=0,3241,{ve:this.ve})}Ke(){this.xe=!0,this.Me=!0}}class mm{constructor(t){this.We=t,this.Ge=new Map,this.ze=re(),this.je=Ar(),this.Je=Ar(),this.He=new st(G)}Ye(t){for(const e of t.Se)t.be&&t.be.isFoundDocument()?this.Ze(e,t.be):this.Xe(e,t.key,t.be);for(const e of t.removedTargetIds)this.Xe(e,t.key,t.be)}et(t){this.forEachTarget(t,e=>{const r=this.tt(e);switch(t.state){case 0:this.nt(e)&&r.Be(t.resumeToken);break;case 1:r.Ue(),r.Oe||r.ke(),r.Be(t.resumeToken);break;case 2:r.Ue(),r.Oe||this.removeTarget(e);break;case 3:this.nt(e)&&(r.Ke(),r.Be(t.resumeToken));break;case 4:this.nt(e)&&(this.rt(e),r.Be(t.resumeToken));break;default:F(56790,{state:t.state})}})}forEachTarget(t,e){t.targetIds.length>0?t.targetIds.forEach(e):this.Ge.forEach((r,s)=>{this.nt(s)&&e(s)})}it(t){const e=t.targetId,r=t.De.count,s=this.st(e);if(s){const o=s.target;if(ai(o))if(r===0){const a=new M(o.path);this.Xe(e,a,St.newNoDocument(a,j.min()))}else X(r===1,20013,{expectedCount:r});else{const a=this.ot(e);if(a!==r){const c=this._t(t),h=c?this.ut(c,t,a):1;if(h!==0){this.rt(e);const d=h===2?"TargetPurposeExistenceFilterMismatchBloom":"TargetPurposeExistenceFilterMismatch";this.He=this.He.insert(e,d)}}}}}_t(t){const e=t.De.unchangedNames;if(!e||!e.bits)return null;const{bits:{bitmap:r="",padding:s=0},hashCount:o=0}=e;let a,c;try{a=ye(r).toUint8Array()}catch(h){if(h instanceof Rc)return pe("Decoding the base64 bloom filter in existence filter failed ("+h.message+"); ignoring the bloom filter and falling back to full re-query."),null;throw h}try{c=new Li(a,s,o)}catch(h){return pe(h instanceof Cn?"BloomFilter error: ":"Applying bloom filter failed: ",h),null}return c.fe===0?null:c}ut(t,e,r){return e.De.count===r-this.ht(t,e.targetId)?0:2}ht(t,e){const r=this.We.getRemoteKeysForTarget(e);let s=0;return r.forEach(o=>{const a=this.We.lt(),c=`projects/${a.projectId}/databases/${a.database}/documents/${o.path.canonicalString()}`;t.mightContain(c)||(this.Xe(e,o,null),s++)}),s}Pt(t){const e=new Map;this.Ge.forEach((o,a)=>{const c=this.st(a);if(c){if(o.current&&ai(c.target)){const h=new M(c.target.path);this.Tt(h).has(a)||this.It(a,h)||this.Xe(a,h,St.newNoDocument(h,t))}o.Ne&&(e.set(a,o.Le()),o.ke())}});let r=H();this.Je.forEach((o,a)=>{let c=!0;a.forEachWhile(h=>{const d=this.st(h);return!d||d.purpose==="TargetPurposeLimboResolution"||(c=!1,!1)}),c&&(r=r.add(o))}),this.ze.forEach((o,a)=>a.setReadTime(t));const s=new as(t,e,this.He,this.ze,r);return this.ze=re(),this.je=Ar(),this.Je=Ar(),this.He=new st(G),s}Ze(t,e){if(!this.nt(t))return;const r=this.It(t,e.key)?2:0;this.tt(t).qe(e.key,r),this.ze=this.ze.insert(e.key,e),this.je=this.je.insert(e.key,this.Tt(e.key).add(t)),this.Je=this.Je.insert(e.key,this.dt(e.key).add(t))}Xe(t,e,r){if(!this.nt(t))return;const s=this.tt(t);this.It(t,e)?s.qe(e,1):s.Qe(e),this.Je=this.Je.insert(e,this.dt(e).delete(t)),this.Je=this.Je.insert(e,this.dt(e).add(t)),r&&(this.ze=this.ze.insert(e,r))}removeTarget(t){this.Ge.delete(t)}ot(t){const e=this.tt(t).Le();return this.We.getRemoteKeysForTarget(t).size+e.addedDocuments.size-e.removedDocuments.size}$e(t){this.tt(t).$e()}tt(t){let e=this.Ge.get(t);return e||(e=new lu,this.Ge.set(t,e)),e}dt(t){let e=this.Je.get(t);return e||(e=new ft(G),this.Je=this.Je.insert(t,e)),e}Tt(t){let e=this.je.get(t);return e||(e=new ft(G),this.je=this.je.insert(t,e)),e}nt(t){const e=this.st(t)!==null;return e||x("WatchChangeAggregator","Detected inactive target",t),e}st(t){const e=this.Ge.get(t);return e&&e.Oe?null:this.We.Et(t)}rt(t){this.Ge.set(t,new lu),this.We.getRemoteKeysForTarget(t).forEach(e=>{this.Xe(t,e,null)})}It(t,e){return this.We.getRemoteKeysForTarget(t).has(e)}}function Ar(){return new st(M.comparator)}function hu(){return new st(M.comparator)}const gm={asc:"ASCENDING",desc:"DESCENDING"},_m={"<":"LESS_THAN","<=":"LESS_THAN_OR_EQUAL",">":"GREATER_THAN",">=":"GREATER_THAN_OR_EQUAL","==":"EQUAL","!=":"NOT_EQUAL","array-contains":"ARRAY_CONTAINS",in:"IN","not-in":"NOT_IN","array-contains-any":"ARRAY_CONTAINS_ANY"},ym={and:"AND",or:"OR"};class vm{constructor(t,e){this.databaseId=t,this.useProto3Json=e}}function ci(n,t){return n.useProto3Json||es(t)?t:{value:t}}function $r(n,t){return n.useProto3Json?`${new Date(1e3*t.seconds).toISOString().replace(/\.\d*/,"").replace("Z","")}.${("000000000"+t.nanoseconds).slice(-9)}Z`:{seconds:""+t.seconds,nanos:t.nanoseconds}}function rl(n,t){return n.useProto3Json?t.toBase64():t.toUint8Array()}function Em(n,t){return $r(n,t.toTimestamp())}function jt(n){return X(!!n,49232),j.fromTimestamp(function(e){const r=_e(e);return new nt(r.seconds,r.nanos)}(n))}function Fi(n,t){return li(n,t).canonicalString()}function li(n,t){const e=function(s){return new tt(["projects",s.projectId,"databases",s.database])}(n).child("documents");return t===void 0?e:e.child(t)}function sl(n){const t=tt.fromString(n);return X(cl(t),10190,{key:t.toString()}),t}function hi(n,t){return Fi(n.databaseId,t.path)}function $s(n,t){const e=sl(t);if(e.get(1)!==n.databaseId.projectId)throw new N(b.INVALID_ARGUMENT,"Tried to deserialize key from different project: "+e.get(1)+" vs "+n.databaseId.projectId);if(e.get(3)!==n.databaseId.database)throw new N(b.INVALID_ARGUMENT,"Tried to deserialize key from different database: "+e.get(3)+" vs "+n.databaseId.database);return new M(ol(e))}function il(n,t){return Fi(n.databaseId,t)}function Tm(n){const t=sl(n);return t.length===4?tt.emptyPath():ol(t)}function di(n){return new tt(["projects",n.databaseId.projectId,"databases",n.databaseId.database]).canonicalString()}function ol(n){return X(n.length>4&&n.get(4)==="documents",29091,{key:n.toString()}),n.popFirst(5)}function du(n,t,e){return{name:hi(n,t),fields:e.value.mapValue.fields}}function Im(n,t){let e;if("targetChange"in t){t.targetChange;const r=function(d){return d==="NO_CHANGE"?0:d==="ADD"?1:d==="REMOVE"?2:d==="CURRENT"?3:d==="RESET"?4:F(39313,{state:d})}(t.targetChange.targetChangeType||"NO_CHANGE"),s=t.targetChange.targetIds||[],o=function(d,p){return d.useProto3Json?(X(p===void 0||typeof p=="string",58123),vt.fromBase64String(p||"")):(X(p===void 0||p instanceof Buffer||p instanceof Uint8Array,16193),vt.fromUint8Array(p||new Uint8Array))}(n,t.targetChange.resumeToken),a=t.targetChange.cause,c=a&&function(d){const p=d.code===void 0?b.UNKNOWN:tl(d.code);return new N(p,d.message||"")}(a);e=new nl(r,s,o,c||null)}else if("documentChange"in t){t.documentChange;const r=t.documentChange;r.document,r.document.name,r.document.updateTime;const s=$s(n,r.document.name),o=jt(r.document.updateTime),a=r.document.createTime?jt(r.document.createTime):j.min(),c=new Nt({mapValue:{fields:r.document.fields}}),h=St.newFoundDocument(s,o,a,c),d=r.targetIds||[],p=r.removedTargetIds||[];e=new Dr(d,p,h.key,h)}else if("documentDelete"in t){t.documentDelete;const r=t.documentDelete;r.document;const s=$s(n,r.document),o=r.readTime?jt(r.readTime):j.min(),a=St.newNoDocument(s,o),c=r.removedTargetIds||[];e=new Dr([],c,a.key,a)}else if("documentRemove"in t){t.documentRemove;const r=t.documentRemove;r.document;const s=$s(n,r.document),o=r.removedTargetIds||[];e=new Dr([],o,s,null)}else{if(!("filter"in t))return F(11601,{At:t});{t.filter;const r=t.filter;r.targetId;const{count:s=0,unchangedNames:o}=r,a=new dm(s,o),c=r.targetId;e=new el(c,a)}}return e}function wm(n,t){let e;if(t instanceof Jn)e={update:du(n,t.key,t.value)};else if(t instanceof Zc)e={delete:hi(n,t.key)};else if(t instanceof Be)e={update:du(n,t.key,t.data),updateMask:km(t.fieldMask)};else{if(!(t instanceof cm))return F(16599,{Rt:t.type});e={verify:hi(n,t.key)}}return t.fieldTransforms.length>0&&(e.updateTransforms=t.fieldTransforms.map(r=>function(o,a){const c=a.transform;if(c instanceof Hn)return{fieldPath:a.field.canonicalString(),setToServerValue:"REQUEST_TIME"};if(c instanceof Wn)return{fieldPath:a.field.canonicalString(),appendMissingElements:{values:c.elements}};if(c instanceof Kn)return{fieldPath:a.field.canonicalString(),removeAllFromArray:{values:c.elements}};if(c instanceof qr)return{fieldPath:a.field.canonicalString(),increment:c.Ee};throw F(20930,{transform:a.transform})}(0,r))),t.precondition.isNone||(e.currentDocument=function(s,o){return o.updateTime!==void 0?{updateTime:Em(s,o.updateTime)}:o.exists!==void 0?{exists:o.exists}:F(27497)}(n,t.precondition)),e}function Am(n,t){return n&&n.length>0?(X(t!==void 0,14353),n.map(e=>function(s,o){let a=s.updateTime?jt(s.updateTime):jt(o);return a.isEqual(j.min())&&(a=jt(o)),new om(a,s.transformResults||[])}(e,t))):[]}function Sm(n,t){return{documents:[il(n,t.path)]}}function Rm(n,t){const e={structuredQuery:{}},r=t.path;let s;t.collectionGroup!==null?(s=r,e.structuredQuery.from=[{collectionId:t.collectionGroup,allDescendants:!0}]):(s=r.popLast(),e.structuredQuery.from=[{collectionId:r.lastSegment()}]),e.parent=il(n,s);const o=function(d){if(d.length!==0)return ul(Lt.create(d,"and"))}(t.filters);o&&(e.structuredQuery.where=o);const a=function(d){if(d.length!==0)return d.map(p=>function(v){return{field:Qe(v.field),direction:Cm(v.dir)}}(p))}(t.orderBy);a&&(e.structuredQuery.orderBy=a);const c=ci(n,t.limit);return c!==null&&(e.structuredQuery.limit=c),t.startAt&&(e.structuredQuery.startAt=function(d){return{before:d.inclusive,values:d.position}}(t.startAt)),t.endAt&&(e.structuredQuery.endAt=function(d){return{before:!d.inclusive,values:d.position}}(t.endAt)),{Vt:e,parent:s}}function bm(n){let t=Tm(n.parent);const e=n.structuredQuery,r=e.from?e.from.length:0;let s=null;if(r>0){X(r===1,65062);const p=e.from[0];p.allDescendants?s=p.collectionId:t=t.child(p.collectionId)}let o=[];e.where&&(o=function(y){const v=al(y);return v instanceof Lt&&Mc(v)?v.getFilters():[v]}(e.where));let a=[];e.orderBy&&(a=function(y){return y.map(v=>function(V){return new Br(Xe(V.field),function(C){switch(C){case"ASCENDING":return"asc";case"DESCENDING":return"desc";default:return}}(V.direction))}(v))}(e.orderBy));let c=null;e.limit&&(c=function(y){let v;return v=typeof y=="object"?y.value:y,es(v)?null:v}(e.limit));let h=null;e.startAt&&(h=function(y){const v=!!y.before,R=y.values||[];return new Ur(R,v)}(e.startAt));let d=null;return e.endAt&&(d=function(y){const v=!y.before,R=y.values||[];return new Ur(R,v)}(e.endAt)),Hp(t,s,a,o,c,"F",h,d)}function Pm(n,t){const e=function(s){switch(s){case"TargetPurposeListen":return null;case"TargetPurposeExistenceFilterMismatch":return"existence-filter-mismatch";case"TargetPurposeExistenceFilterMismatchBloom":return"existence-filter-mismatch-bloom";case"TargetPurposeLimboResolution":return"limbo-document";default:return F(28987,{purpose:s})}}(t.purpose);return e==null?null:{"goog-listen-tags":e}}function al(n){return n.unaryFilter!==void 0?function(e){switch(e.unaryFilter.op){case"IS_NAN":const r=Xe(e.unaryFilter.field);return lt.create(r,"==",{doubleValue:NaN});case"IS_NULL":const s=Xe(e.unaryFilter.field);return lt.create(s,"==",{nullValue:"NULL_VALUE"});case"IS_NOT_NAN":const o=Xe(e.unaryFilter.field);return lt.create(o,"!=",{doubleValue:NaN});case"IS_NOT_NULL":const a=Xe(e.unaryFilter.field);return lt.create(a,"!=",{nullValue:"NULL_VALUE"});case"OPERATOR_UNSPECIFIED":return F(61313);default:return F(60726)}}(n):n.fieldFilter!==void 0?function(e){return lt.create(Xe(e.fieldFilter.field),function(s){switch(s){case"EQUAL":return"==";case"NOT_EQUAL":return"!=";case"GREATER_THAN":return">";case"GREATER_THAN_OR_EQUAL":return">=";case"LESS_THAN":return"<";case"LESS_THAN_OR_EQUAL":return"<=";case"ARRAY_CONTAINS":return"array-contains";case"IN":return"in";case"NOT_IN":return"not-in";case"ARRAY_CONTAINS_ANY":return"array-contains-any";case"OPERATOR_UNSPECIFIED":return F(58110);default:return F(50506)}}(e.fieldFilter.op),e.fieldFilter.value)}(n):n.compositeFilter!==void 0?function(e){return Lt.create(e.compositeFilter.filters.map(r=>al(r)),function(s){switch(s){case"AND":return"and";case"OR":return"or";default:return F(1026)}}(e.compositeFilter.op))}(n):F(30097,{filter:n})}function Cm(n){return gm[n]}function Vm(n){return _m[n]}function Dm(n){return ym[n]}function Qe(n){return{fieldPath:n.canonicalString()}}function Xe(n){return yt.fromServerFormat(n.fieldPath)}function ul(n){return n instanceof lt?function(e){if(e.op==="=="){if(Za(e.value))return{unaryFilter:{field:Qe(e.field),op:"IS_NAN"}};if(Ja(e.value))return{unaryFilter:{field:Qe(e.field),op:"IS_NULL"}}}else if(e.op==="!="){if(Za(e.value))return{unaryFilter:{field:Qe(e.field),op:"IS_NOT_NAN"}};if(Ja(e.value))return{unaryFilter:{field:Qe(e.field),op:"IS_NOT_NULL"}}}return{fieldFilter:{field:Qe(e.field),op:Vm(e.op),value:e.value}}}(n):n instanceof Lt?function(e){const r=e.getFilters().map(s=>ul(s));return r.length===1?r[0]:{compositeFilter:{op:Dm(e.op),filters:r}}}(n):F(54877,{filter:n})}function km(n){const t=[];return n.fields.forEach(e=>t.push(e.canonicalString())),{fieldPaths:t}}function cl(n){return n.length>=4&&n.get(0)==="projects"&&n.get(2)==="databases"}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ae{constructor(t,e,r,s,o=j.min(),a=j.min(),c=vt.EMPTY_BYTE_STRING,h=null){this.target=t,this.targetId=e,this.purpose=r,this.sequenceNumber=s,this.snapshotVersion=o,this.lastLimboFreeSnapshotVersion=a,this.resumeToken=c,this.expectedCount=h}withSequenceNumber(t){return new ae(this.target,this.targetId,this.purpose,t,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,this.expectedCount)}withResumeToken(t,e){return new ae(this.target,this.targetId,this.purpose,this.sequenceNumber,e,this.lastLimboFreeSnapshotVersion,t,null)}withExpectedCount(t){return new ae(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,this.lastLimboFreeSnapshotVersion,this.resumeToken,t)}withLastLimboFreeSnapshotVersion(t){return new ae(this.target,this.targetId,this.purpose,this.sequenceNumber,this.snapshotVersion,t,this.resumeToken,this.expectedCount)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nm{constructor(t){this.gt=t}}function Om(n){const t=bm({parent:n.parent,structuredQuery:n.structuredQuery});return n.limitType==="LAST"?jr(t,t.limit,"L"):t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class xm{constructor(){this.Dn=new Mm}addToCollectionParentIndex(t,e){return this.Dn.add(e),P.resolve()}getCollectionParents(t,e){return P.resolve(this.Dn.getEntries(e))}addFieldIndex(t,e){return P.resolve()}deleteFieldIndex(t,e){return P.resolve()}deleteAllFieldIndexes(t){return P.resolve()}createTargetIndexes(t,e){return P.resolve()}getDocumentsMatchingTarget(t,e){return P.resolve(null)}getIndexType(t,e){return P.resolve(0)}getFieldIndexes(t,e){return P.resolve([])}getNextCollectionGroupToUpdate(t){return P.resolve(null)}getMinOffset(t,e){return P.resolve(ge.min())}getMinOffsetFromCollectionGroup(t,e){return P.resolve(ge.min())}updateCollectionGroup(t,e,r){return P.resolve()}updateIndexEntries(t,e){return P.resolve()}}class Mm{constructor(){this.index={}}add(t){const e=t.lastSegment(),r=t.popLast(),s=this.index[e]||new ft(tt.comparator),o=!s.has(r);return this.index[e]=s.add(r),o}has(t){const e=t.lastSegment(),r=t.popLast(),s=this.index[e];return s&&s.has(r)}getEntries(t){return(this.index[t]||new ft(tt.comparator)).toArray()}}/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const fu={didRun:!1,sequenceNumbersCollected:0,targetsRemoved:0,documentsRemoved:0},ll=41943040;class Pt{static withCacheSize(t){return new Pt(t,Pt.DEFAULT_COLLECTION_PERCENTILE,Pt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT)}constructor(t,e,r){this.cacheSizeCollectionThreshold=t,this.percentileToCollect=e,this.maximumSequenceNumbersToCollect=r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */Pt.DEFAULT_COLLECTION_PERCENTILE=10,Pt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT=1e3,Pt.DEFAULT=new Pt(ll,Pt.DEFAULT_COLLECTION_PERCENTILE,Pt.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT),Pt.DISABLED=new Pt(-1,0,0);/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class on{constructor(t){this._r=t}next(){return this._r+=2,this._r}static ar(){return new on(0)}static ur(){return new on(-1)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const pu="LruGarbageCollector",Lm=1048576;function mu([n,t],[e,r]){const s=G(n,e);return s===0?G(t,r):s}class Fm{constructor(t){this.Tr=t,this.buffer=new ft(mu),this.Ir=0}dr(){return++this.Ir}Er(t){const e=[t,this.dr()];if(this.buffer.size<this.Tr)this.buffer=this.buffer.add(e);else{const r=this.buffer.last();mu(e,r)<0&&(this.buffer=this.buffer.delete(r).add(e))}}get maxValue(){return this.buffer.last()[0]}}class Um{constructor(t,e,r){this.garbageCollector=t,this.asyncQueue=e,this.localStore=r,this.Ar=null}start(){this.garbageCollector.params.cacheSizeCollectionThreshold!==-1&&this.Rr(6e4)}stop(){this.Ar&&(this.Ar.cancel(),this.Ar=null)}get started(){return this.Ar!==null}Rr(t){x(pu,`Garbage collection scheduled in ${t}ms`),this.Ar=this.asyncQueue.enqueueAfterDelay("lru_garbage_collection",t,async()=>{this.Ar=null;try{await this.localStore.collectGarbage(this.garbageCollector)}catch(e){hn(e)?x(pu,"Ignoring IndexedDB error during garbage collection: ",e):await ln(e)}await this.Rr(3e5)})}}class Bm{constructor(t,e){this.Vr=t,this.params=e}calculateTargetCount(t,e){return this.Vr.mr(t).next(r=>Math.floor(e/100*r))}nthSequenceNumber(t,e){if(e===0)return P.resolve(ts.ue);const r=new Fm(e);return this.Vr.forEachTarget(t,s=>r.Er(s.sequenceNumber)).next(()=>this.Vr.gr(t,s=>r.Er(s))).next(()=>r.maxValue)}removeTargets(t,e,r){return this.Vr.removeTargets(t,e,r)}removeOrphanedDocuments(t,e){return this.Vr.removeOrphanedDocuments(t,e)}collect(t,e){return this.params.cacheSizeCollectionThreshold===-1?(x("LruGarbageCollector","Garbage collection skipped; disabled"),P.resolve(fu)):this.getCacheSize(t).next(r=>r<this.params.cacheSizeCollectionThreshold?(x("LruGarbageCollector",`Garbage collection skipped; Cache size ${r} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`),fu):this.pr(t,e))}getCacheSize(t){return this.Vr.getCacheSize(t)}pr(t,e){let r,s,o,a,c,h,d;const p=Date.now();return this.calculateTargetCount(t,this.params.percentileToCollect).next(y=>(y>this.params.maximumSequenceNumbersToCollect?(x("LruGarbageCollector",`Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${y}`),s=this.params.maximumSequenceNumbersToCollect):s=y,a=Date.now(),this.nthSequenceNumber(t,s))).next(y=>(r=y,c=Date.now(),this.removeTargets(t,r,e))).next(y=>(o=y,h=Date.now(),this.removeOrphanedDocuments(t,r))).next(y=>(d=Date.now(),We()<=K.DEBUG&&x("LruGarbageCollector",`LRU Garbage Collection
	Counted targets in ${a-p}ms
	Determined least recently used ${s} in `+(c-a)+`ms
	Removed ${o} targets in `+(h-c)+`ms
	Removed ${y} documents in `+(d-h)+`ms
Total Duration: ${d-p}ms`),P.resolve({didRun:!0,sequenceNumbersCollected:s,targetsRemoved:o,documentsRemoved:y})))}}function jm(n,t){return new Bm(n,t)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qm{constructor(){this.changes=new Ue(t=>t.toString(),(t,e)=>t.isEqual(e)),this.changesApplied=!1}addEntry(t){this.assertNotApplied(),this.changes.set(t.key,t)}removeEntry(t,e){this.assertNotApplied(),this.changes.set(t,St.newInvalidDocument(t).setReadTime(e))}getEntry(t,e){this.assertNotApplied();const r=this.changes.get(e);return r!==void 0?P.resolve(r):this.getFromCache(t,e)}getEntries(t,e){return this.getAllFromCache(t,e)}apply(t){return this.assertNotApplied(),this.changesApplied=!0,this.applyChanges(t)}assertNotApplied(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $m{constructor(t,e){this.overlayedDocument=t,this.mutatedFields=e}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zm{constructor(t,e,r,s){this.remoteDocumentCache=t,this.mutationQueue=e,this.documentOverlayCache=r,this.indexManager=s}getDocument(t,e){let r=null;return this.documentOverlayCache.getOverlay(t,e).next(s=>(r=s,this.remoteDocumentCache.getEntry(t,e))).next(s=>(r!==null&&xn(r.mutation,s,Mt.empty(),nt.now()),s))}getDocuments(t,e){return this.remoteDocumentCache.getEntries(t,e).next(r=>this.getLocalViewOfDocuments(t,r,H()).next(()=>r))}getLocalViewOfDocuments(t,e,r=H()){const s=Ve();return this.populateOverlays(t,s,e).next(()=>this.computeViews(t,e,s,r).next(o=>{let a=Pn();return o.forEach((c,h)=>{a=a.insert(c,h.overlayedDocument)}),a}))}getOverlayedDocuments(t,e){const r=Ve();return this.populateOverlays(t,r,e).next(()=>this.computeViews(t,e,r,H()))}populateOverlays(t,e,r){const s=[];return r.forEach(o=>{e.has(o)||s.push(o)}),this.documentOverlayCache.getOverlays(t,s).next(o=>{o.forEach((a,c)=>{e.set(a,c)})})}computeViews(t,e,r,s){let o=re();const a=On(),c=function(){return On()}();return e.forEach((h,d)=>{const p=r.get(d.key);s.has(d.key)&&(p===void 0||p.mutation instanceof Be)?o=o.insert(d.key,d):p!==void 0?(a.set(d.key,p.mutation.getFieldMask()),xn(p.mutation,d,p.mutation.getFieldMask(),nt.now())):a.set(d.key,Mt.empty())}),this.recalculateAndSaveOverlays(t,o).next(h=>(h.forEach((d,p)=>a.set(d,p)),e.forEach((d,p)=>{var y;return c.set(d,new $m(p,(y=a.get(d))!==null&&y!==void 0?y:null))}),c))}recalculateAndSaveOverlays(t,e){const r=On();let s=new st((a,c)=>a-c),o=H();return this.mutationQueue.getAllMutationBatchesAffectingDocumentKeys(t,e).next(a=>{for(const c of a)c.keys().forEach(h=>{const d=e.get(h);if(d===null)return;let p=r.get(h)||Mt.empty();p=c.applyToLocalView(d,p),r.set(h,p);const y=(s.get(c.batchId)||H()).add(h);s=s.insert(c.batchId,y)})}).next(()=>{const a=[],c=s.getReverseIterator();for(;c.hasNext();){const h=c.getNext(),d=h.key,p=h.value,y=Gc();p.forEach(v=>{if(!o.has(v)){const R=Yc(e.get(v),r.get(v));R!==null&&y.set(v,R),o=o.add(v)}}),a.push(this.documentOverlayCache.saveOverlays(t,d,y))}return P.waitFor(a)}).next(()=>r)}recalculateAndSaveOverlaysForDocumentKeys(t,e){return this.remoteDocumentCache.getEntries(t,e).next(r=>this.recalculateAndSaveOverlays(t,r))}getDocumentsMatchingQuery(t,e,r,s){return function(a){return M.isDocumentKey(a.path)&&a.collectionGroup===null&&a.filters.length===0}(e)?this.getDocumentsMatchingDocumentQuery(t,e.path):Bc(e)?this.getDocumentsMatchingCollectionGroupQuery(t,e,r,s):this.getDocumentsMatchingCollectionQuery(t,e,r,s)}getNextDocuments(t,e,r,s){return this.remoteDocumentCache.getAllFromCollectionGroup(t,e,r,s).next(o=>{const a=s-o.size>0?this.documentOverlayCache.getOverlaysForCollectionGroup(t,e,r.largestBatchId,s-o.size):P.resolve(Ve());let c=qn,h=o;return a.next(d=>P.forEach(d,(p,y)=>(c<y.largestBatchId&&(c=y.largestBatchId),o.get(p)?P.resolve():this.remoteDocumentCache.getEntry(t,p).next(v=>{h=h.insert(p,v)}))).next(()=>this.populateOverlays(t,d,o)).next(()=>this.computeViews(t,h,d,H())).next(p=>({batchId:c,changes:zc(p)})))})}getDocumentsMatchingDocumentQuery(t,e){return this.getDocument(t,new M(e)).next(r=>{let s=Pn();return r.isFoundDocument()&&(s=s.insert(r.key,r)),s})}getDocumentsMatchingCollectionGroupQuery(t,e,r,s){const o=e.collectionGroup;let a=Pn();return this.indexManager.getCollectionParents(t,o).next(c=>P.forEach(c,h=>{const d=function(y,v){return new Yn(v,null,y.explicitOrderBy.slice(),y.filters.slice(),y.limit,y.limitType,y.startAt,y.endAt)}(e,h.child(o));return this.getDocumentsMatchingCollectionQuery(t,d,r,s).next(p=>{p.forEach((y,v)=>{a=a.insert(y,v)})})}).next(()=>a))}getDocumentsMatchingCollectionQuery(t,e,r,s){let o;return this.documentOverlayCache.getOverlaysForCollection(t,e.path,r.largestBatchId).next(a=>(o=a,this.remoteDocumentCache.getDocumentsMatchingQuery(t,e,r,o,s))).next(a=>{o.forEach((h,d)=>{const p=d.getKey();a.get(p)===null&&(a=a.insert(p,St.newInvalidDocument(p)))});let c=Pn();return a.forEach((h,d)=>{const p=o.get(h);p!==void 0&&xn(p.mutation,d,Mt.empty(),nt.now()),ss(e,d)&&(c=c.insert(h,d))}),c})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Gm{constructor(t){this.serializer=t,this.Br=new Map,this.Lr=new Map}getBundleMetadata(t,e){return P.resolve(this.Br.get(e))}saveBundleMetadata(t,e){return this.Br.set(e.id,function(s){return{id:s.id,version:s.version,createTime:jt(s.createTime)}}(e)),P.resolve()}getNamedQuery(t,e){return P.resolve(this.Lr.get(e))}saveNamedQuery(t,e){return this.Lr.set(e.name,function(s){return{name:s.name,query:Om(s.bundledQuery),readTime:jt(s.readTime)}}(e)),P.resolve()}}/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Hm{constructor(){this.overlays=new st(M.comparator),this.kr=new Map}getOverlay(t,e){return P.resolve(this.overlays.get(e))}getOverlays(t,e){const r=Ve();return P.forEach(e,s=>this.getOverlay(t,s).next(o=>{o!==null&&r.set(s,o)})).next(()=>r)}saveOverlays(t,e,r){return r.forEach((s,o)=>{this.wt(t,e,o)}),P.resolve()}removeOverlaysForBatchId(t,e,r){const s=this.kr.get(r);return s!==void 0&&(s.forEach(o=>this.overlays=this.overlays.remove(o)),this.kr.delete(r)),P.resolve()}getOverlaysForCollection(t,e,r){const s=Ve(),o=e.length+1,a=new M(e.child("")),c=this.overlays.getIteratorFrom(a);for(;c.hasNext();){const h=c.getNext().value,d=h.getKey();if(!e.isPrefixOf(d.path))break;d.path.length===o&&h.largestBatchId>r&&s.set(h.getKey(),h)}return P.resolve(s)}getOverlaysForCollectionGroup(t,e,r,s){let o=new st((d,p)=>d-p);const a=this.overlays.getIterator();for(;a.hasNext();){const d=a.getNext().value;if(d.getKey().getCollectionGroup()===e&&d.largestBatchId>r){let p=o.get(d.largestBatchId);p===null&&(p=Ve(),o=o.insert(d.largestBatchId,p)),p.set(d.getKey(),d)}}const c=Ve(),h=o.getIterator();for(;h.hasNext()&&(h.getNext().value.forEach((d,p)=>c.set(d,p)),!(c.size()>=s)););return P.resolve(c)}wt(t,e,r){const s=this.overlays.get(r.key);if(s!==null){const a=this.kr.get(s.largestBatchId).delete(r.key);this.kr.set(s.largestBatchId,a)}this.overlays=this.overlays.insert(r.key,new hm(e,r));let o=this.kr.get(e);o===void 0&&(o=H(),this.kr.set(e,o)),this.kr.set(e,o.add(r.key))}}/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wm{constructor(){this.sessionToken=vt.EMPTY_BYTE_STRING}getSessionToken(t){return P.resolve(this.sessionToken)}setSessionToken(t,e){return this.sessionToken=e,P.resolve()}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ui{constructor(){this.qr=new ft(pt.Qr),this.$r=new ft(pt.Ur)}isEmpty(){return this.qr.isEmpty()}addReference(t,e){const r=new pt(t,e);this.qr=this.qr.add(r),this.$r=this.$r.add(r)}Kr(t,e){t.forEach(r=>this.addReference(r,e))}removeReference(t,e){this.Wr(new pt(t,e))}Gr(t,e){t.forEach(r=>this.removeReference(r,e))}zr(t){const e=new M(new tt([])),r=new pt(e,t),s=new pt(e,t+1),o=[];return this.$r.forEachInRange([r,s],a=>{this.Wr(a),o.push(a.key)}),o}jr(){this.qr.forEach(t=>this.Wr(t))}Wr(t){this.qr=this.qr.delete(t),this.$r=this.$r.delete(t)}Jr(t){const e=new M(new tt([])),r=new pt(e,t),s=new pt(e,t+1);let o=H();return this.$r.forEachInRange([r,s],a=>{o=o.add(a.key)}),o}containsKey(t){const e=new pt(t,0),r=this.qr.firstAfterOrEqual(e);return r!==null&&t.isEqual(r.key)}}class pt{constructor(t,e){this.key=t,this.Hr=e}static Qr(t,e){return M.comparator(t.key,e.key)||G(t.Hr,e.Hr)}static Ur(t,e){return G(t.Hr,e.Hr)||M.comparator(t.key,e.key)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Km{constructor(t,e){this.indexManager=t,this.referenceDelegate=e,this.mutationQueue=[],this.er=1,this.Yr=new ft(pt.Qr)}checkEmpty(t){return P.resolve(this.mutationQueue.length===0)}addMutationBatch(t,e,r,s){const o=this.er;this.er++,this.mutationQueue.length>0&&this.mutationQueue[this.mutationQueue.length-1];const a=new lm(o,e,r,s);this.mutationQueue.push(a);for(const c of s)this.Yr=this.Yr.add(new pt(c.key,o)),this.indexManager.addToCollectionParentIndex(t,c.key.path.popLast());return P.resolve(a)}lookupMutationBatch(t,e){return P.resolve(this.Zr(e))}getNextMutationBatchAfterBatchId(t,e){const r=e+1,s=this.Xr(r),o=s<0?0:s;return P.resolve(this.mutationQueue.length>o?this.mutationQueue[o]:null)}getHighestUnacknowledgedBatchId(){return P.resolve(this.mutationQueue.length===0?Ci:this.er-1)}getAllMutationBatches(t){return P.resolve(this.mutationQueue.slice())}getAllMutationBatchesAffectingDocumentKey(t,e){const r=new pt(e,0),s=new pt(e,Number.POSITIVE_INFINITY),o=[];return this.Yr.forEachInRange([r,s],a=>{const c=this.Zr(a.Hr);o.push(c)}),P.resolve(o)}getAllMutationBatchesAffectingDocumentKeys(t,e){let r=new ft(G);return e.forEach(s=>{const o=new pt(s,0),a=new pt(s,Number.POSITIVE_INFINITY);this.Yr.forEachInRange([o,a],c=>{r=r.add(c.Hr)})}),P.resolve(this.ei(r))}getAllMutationBatchesAffectingQuery(t,e){const r=e.path,s=r.length+1;let o=r;M.isDocumentKey(o)||(o=o.child(""));const a=new pt(new M(o),0);let c=new ft(G);return this.Yr.forEachWhile(h=>{const d=h.key.path;return!!r.isPrefixOf(d)&&(d.length===s&&(c=c.add(h.Hr)),!0)},a),P.resolve(this.ei(c))}ei(t){const e=[];return t.forEach(r=>{const s=this.Zr(r);s!==null&&e.push(s)}),e}removeMutationBatch(t,e){X(this.ti(e.batchId,"removed")===0,55003),this.mutationQueue.shift();let r=this.Yr;return P.forEach(e.mutations,s=>{const o=new pt(s.key,e.batchId);return r=r.delete(o),this.referenceDelegate.markPotentiallyOrphaned(t,s.key)}).next(()=>{this.Yr=r})}rr(t){}containsKey(t,e){const r=new pt(e,0),s=this.Yr.firstAfterOrEqual(r);return P.resolve(e.isEqual(s&&s.key))}performConsistencyCheck(t){return this.mutationQueue.length,P.resolve()}ti(t,e){return this.Xr(t)}Xr(t){return this.mutationQueue.length===0?0:t-this.mutationQueue[0].batchId}Zr(t){const e=this.Xr(t);return e<0||e>=this.mutationQueue.length?null:this.mutationQueue[e]}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Qm{constructor(t){this.ni=t,this.docs=function(){return new st(M.comparator)}(),this.size=0}setIndexManager(t){this.indexManager=t}addEntry(t,e){const r=e.key,s=this.docs.get(r),o=s?s.size:0,a=this.ni(e);return this.docs=this.docs.insert(r,{document:e.mutableCopy(),size:a}),this.size+=a-o,this.indexManager.addToCollectionParentIndex(t,r.path.popLast())}removeEntry(t){const e=this.docs.get(t);e&&(this.docs=this.docs.remove(t),this.size-=e.size)}getEntry(t,e){const r=this.docs.get(e);return P.resolve(r?r.document.mutableCopy():St.newInvalidDocument(e))}getEntries(t,e){let r=re();return e.forEach(s=>{const o=this.docs.get(s);r=r.insert(s,o?o.document.mutableCopy():St.newInvalidDocument(s))}),P.resolve(r)}getDocumentsMatchingQuery(t,e,r,s){let o=re();const a=e.path,c=new M(a.child("__id-9223372036854775808__")),h=this.docs.getIteratorFrom(c);for(;h.hasNext();){const{key:d,value:{document:p}}=h.getNext();if(!a.isPrefixOf(d.path))break;d.path.length>a.length+1||Ap(wp(p),r)<=0||(s.has(p.key)||ss(e,p))&&(o=o.insert(p.key,p.mutableCopy()))}return P.resolve(o)}getAllFromCollectionGroup(t,e,r,s){F(9500)}ri(t,e){return P.forEach(this.docs,r=>e(r))}newChangeBuffer(t){return new Xm(this)}getSize(t){return P.resolve(this.size)}}class Xm extends qm{constructor(t){super(),this.Or=t}applyChanges(t){const e=[];return this.changes.forEach((r,s)=>{s.isValidDocument()?e.push(this.Or.addEntry(t,s)):this.Or.removeEntry(r)}),P.waitFor(e)}getFromCache(t,e){return this.Or.getEntry(t,e)}getAllFromCache(t,e){return this.Or.getEntries(t,e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ym{constructor(t){this.persistence=t,this.ii=new Ue(e=>ki(e),Ni),this.lastRemoteSnapshotVersion=j.min(),this.highestTargetId=0,this.si=0,this.oi=new Ui,this.targetCount=0,this._i=on.ar()}forEachTarget(t,e){return this.ii.forEach((r,s)=>e(s)),P.resolve()}getLastRemoteSnapshotVersion(t){return P.resolve(this.lastRemoteSnapshotVersion)}getHighestSequenceNumber(t){return P.resolve(this.si)}allocateTargetId(t){return this.highestTargetId=this._i.next(),P.resolve(this.highestTargetId)}setTargetsMetadata(t,e,r){return r&&(this.lastRemoteSnapshotVersion=r),e>this.si&&(this.si=e),P.resolve()}hr(t){this.ii.set(t.target,t);const e=t.targetId;e>this.highestTargetId&&(this._i=new on(e),this.highestTargetId=e),t.sequenceNumber>this.si&&(this.si=t.sequenceNumber)}addTargetData(t,e){return this.hr(e),this.targetCount+=1,P.resolve()}updateTargetData(t,e){return this.hr(e),P.resolve()}removeTargetData(t,e){return this.ii.delete(e.target),this.oi.zr(e.targetId),this.targetCount-=1,P.resolve()}removeTargets(t,e,r){let s=0;const o=[];return this.ii.forEach((a,c)=>{c.sequenceNumber<=e&&r.get(c.targetId)===null&&(this.ii.delete(a),o.push(this.removeMatchingKeysForTargetId(t,c.targetId)),s++)}),P.waitFor(o).next(()=>s)}getTargetCount(t){return P.resolve(this.targetCount)}getTargetData(t,e){const r=this.ii.get(e)||null;return P.resolve(r)}addMatchingKeys(t,e,r){return this.oi.Kr(e,r),P.resolve()}removeMatchingKeys(t,e,r){this.oi.Gr(e,r);const s=this.persistence.referenceDelegate,o=[];return s&&e.forEach(a=>{o.push(s.markPotentiallyOrphaned(t,a))}),P.waitFor(o)}removeMatchingKeysForTargetId(t,e){return this.oi.zr(e),P.resolve()}getMatchingKeysForTargetId(t,e){const r=this.oi.Jr(e);return P.resolve(r)}containsKey(t,e){return P.resolve(this.oi.containsKey(e))}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hl{constructor(t,e){this.ai={},this.overlays={},this.ui=new ts(0),this.ci=!1,this.ci=!0,this.li=new Wm,this.referenceDelegate=t(this),this.hi=new Ym(this),this.indexManager=new xm,this.remoteDocumentCache=function(s){return new Qm(s)}(r=>this.referenceDelegate.Pi(r)),this.serializer=new Nm(e),this.Ti=new Gm(this.serializer)}start(){return Promise.resolve()}shutdown(){return this.ci=!1,Promise.resolve()}get started(){return this.ci}setDatabaseDeletedListener(){}setNetworkEnabled(){}getIndexManager(t){return this.indexManager}getDocumentOverlayCache(t){let e=this.overlays[t.toKey()];return e||(e=new Hm,this.overlays[t.toKey()]=e),e}getMutationQueue(t,e){let r=this.ai[t.toKey()];return r||(r=new Km(e,this.referenceDelegate),this.ai[t.toKey()]=r),r}getGlobalsCache(){return this.li}getTargetCache(){return this.hi}getRemoteDocumentCache(){return this.remoteDocumentCache}getBundleCache(){return this.Ti}runTransaction(t,e,r){x("MemoryPersistence","Starting transaction:",t);const s=new Jm(this.ui.next());return this.referenceDelegate.Ii(),r(s).next(o=>this.referenceDelegate.di(s).next(()=>o)).toPromise().then(o=>(s.raiseOnCommittedEvent(),o))}Ei(t,e){return P.or(Object.values(this.ai).map(r=>()=>r.containsKey(t,e)))}}class Jm extends Rp{constructor(t){super(),this.currentSequenceNumber=t}}class Bi{constructor(t){this.persistence=t,this.Ai=new Ui,this.Ri=null}static Vi(t){return new Bi(t)}get mi(){if(this.Ri)return this.Ri;throw F(60996)}addReference(t,e,r){return this.Ai.addReference(r,e),this.mi.delete(r.toString()),P.resolve()}removeReference(t,e,r){return this.Ai.removeReference(r,e),this.mi.add(r.toString()),P.resolve()}markPotentiallyOrphaned(t,e){return this.mi.add(e.toString()),P.resolve()}removeTarget(t,e){this.Ai.zr(e.targetId).forEach(s=>this.mi.add(s.toString()));const r=this.persistence.getTargetCache();return r.getMatchingKeysForTargetId(t,e.targetId).next(s=>{s.forEach(o=>this.mi.add(o.toString()))}).next(()=>r.removeTargetData(t,e))}Ii(){this.Ri=new Set}di(t){const e=this.persistence.getRemoteDocumentCache().newChangeBuffer();return P.forEach(this.mi,r=>{const s=M.fromPath(r);return this.fi(t,s).next(o=>{o||e.removeEntry(s,j.min())})}).next(()=>(this.Ri=null,e.apply(t)))}updateLimboDocument(t,e){return this.fi(t,e).next(r=>{r?this.mi.delete(e.toString()):this.mi.add(e.toString())})}Pi(t){return 0}fi(t,e){return P.or([()=>P.resolve(this.Ai.containsKey(e)),()=>this.persistence.getTargetCache().containsKey(t,e),()=>this.persistence.Ei(t,e)])}}class zr{constructor(t,e){this.persistence=t,this.gi=new Ue(r=>Cp(r.path),(r,s)=>r.isEqual(s)),this.garbageCollector=jm(this,e)}static Vi(t,e){return new zr(t,e)}Ii(){}di(t){return P.resolve()}forEachTarget(t,e){return this.persistence.getTargetCache().forEachTarget(t,e)}mr(t){const e=this.yr(t);return this.persistence.getTargetCache().getTargetCount(t).next(r=>e.next(s=>r+s))}yr(t){let e=0;return this.gr(t,r=>{e++}).next(()=>e)}gr(t,e){return P.forEach(this.gi,(r,s)=>this.Sr(t,r,s).next(o=>o?P.resolve():e(s)))}removeTargets(t,e,r){return this.persistence.getTargetCache().removeTargets(t,e,r)}removeOrphanedDocuments(t,e){let r=0;const s=this.persistence.getRemoteDocumentCache(),o=s.newChangeBuffer();return s.ri(t,a=>this.Sr(t,a,e).next(c=>{c||(r++,o.removeEntry(a,j.min()))})).next(()=>o.apply(t)).next(()=>r)}markPotentiallyOrphaned(t,e){return this.gi.set(e,t.currentSequenceNumber),P.resolve()}removeTarget(t,e){const r=e.withSequenceNumber(t.currentSequenceNumber);return this.persistence.getTargetCache().updateTargetData(t,r)}addReference(t,e,r){return this.gi.set(r,t.currentSequenceNumber),P.resolve()}removeReference(t,e,r){return this.gi.set(r,t.currentSequenceNumber),P.resolve()}updateLimboDocument(t,e){return this.gi.set(e,t.currentSequenceNumber),P.resolve()}Pi(t){let e=t.key.toString().length;return t.isFoundDocument()&&(e+=Pr(t.data.value)),e}Sr(t,e,r){return P.or([()=>this.persistence.Ei(t,e),()=>this.persistence.getTargetCache().containsKey(t,e),()=>{const s=this.gi.get(e);return P.resolve(s!==void 0&&s>r)}])}getCacheSize(t){return this.persistence.getRemoteDocumentCache().getSize(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ji{constructor(t,e,r,s){this.targetId=t,this.fromCache=e,this.Is=r,this.ds=s}static Es(t,e){let r=H(),s=H();for(const o of e.docChanges)switch(o.type){case 0:r=r.add(o.doc.key);break;case 1:s=s.add(o.doc.key)}return new ji(t,e.fromCache,r,s)}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zm{constructor(){this._documentReadCount=0}get documentReadCount(){return this._documentReadCount}incrementDocumentReadCount(t){this._documentReadCount+=t}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class tg{constructor(){this.As=!1,this.Rs=!1,this.Vs=100,this.fs=function(){return zd()?8:bp(Ii())>0?6:4}()}initialize(t,e){this.gs=t,this.indexManager=e,this.As=!0}getDocumentsMatchingQuery(t,e,r,s){const o={result:null};return this.ps(t,e).next(a=>{o.result=a}).next(()=>{if(!o.result)return this.ys(t,e,s,r).next(a=>{o.result=a})}).next(()=>{if(o.result)return;const a=new Zm;return this.ws(t,e,a).next(c=>{if(o.result=c,this.Rs)return this.Ss(t,e,a,c.size)})}).next(()=>o.result)}Ss(t,e,r,s){return r.documentReadCount<this.Vs?(We()<=K.DEBUG&&x("QueryEngine","SDK will not create cache indexes for query:",Ke(e),"since it only creates cache indexes for collection contains","more than or equal to",this.Vs,"documents"),P.resolve()):(We()<=K.DEBUG&&x("QueryEngine","Query:",Ke(e),"scans",r.documentReadCount,"local documents and returns",s,"documents as results."),r.documentReadCount>this.fs*s?(We()<=K.DEBUG&&x("QueryEngine","The SDK decides to create cache indexes for query:",Ke(e),"as using cache indexes may help improve performance."),this.indexManager.createTargetIndexes(t,Ut(e))):P.resolve())}ps(t,e){if(ru(e))return P.resolve(null);let r=Ut(e);return this.indexManager.getIndexType(t,r).next(s=>s===0?null:(e.limit!==null&&s===1&&(e=jr(e,null,"F"),r=Ut(e)),this.indexManager.getDocumentsMatchingTarget(t,r).next(o=>{const a=H(...o);return this.gs.getDocuments(t,a).next(c=>this.indexManager.getMinOffset(t,r).next(h=>{const d=this.bs(e,c);return this.Ds(e,d,a,h.readTime)?this.ps(t,jr(e,null,"F")):this.vs(t,d,e,h)}))})))}ys(t,e,r,s){return ru(e)||s.isEqual(j.min())?P.resolve(null):this.gs.getDocuments(t,r).next(o=>{const a=this.bs(e,o);return this.Ds(e,a,r,s)?P.resolve(null):(We()<=K.DEBUG&&x("QueryEngine","Re-using previous result from %s to execute query: %s",s.toString(),Ke(e)),this.vs(t,a,e,Ip(s,qn)).next(c=>c))})}bs(t,e){let r=new ft(qc(t));return e.forEach((s,o)=>{ss(t,o)&&(r=r.add(o))}),r}Ds(t,e,r,s){if(t.limit===null)return!1;if(r.size!==e.size)return!0;const o=t.limitType==="F"?e.last():e.first();return!!o&&(o.hasPendingWrites||o.version.compareTo(s)>0)}ws(t,e,r){return We()<=K.DEBUG&&x("QueryEngine","Using full collection scan to execute query:",Ke(e)),this.gs.getDocumentsMatchingQuery(t,e,ge.min(),r)}vs(t,e,r,s){return this.gs.getDocumentsMatchingQuery(t,r,s).next(o=>(e.forEach(a=>{o=o.insert(a.key,a)}),o))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const qi="LocalStore",eg=3e8;class ng{constructor(t,e,r,s){this.persistence=t,this.Cs=e,this.serializer=s,this.Fs=new st(G),this.Ms=new Ue(o=>ki(o),Ni),this.xs=new Map,this.Os=t.getRemoteDocumentCache(),this.hi=t.getTargetCache(),this.Ti=t.getBundleCache(),this.Ns(r)}Ns(t){this.documentOverlayCache=this.persistence.getDocumentOverlayCache(t),this.indexManager=this.persistence.getIndexManager(t),this.mutationQueue=this.persistence.getMutationQueue(t,this.indexManager),this.localDocuments=new zm(this.Os,this.mutationQueue,this.documentOverlayCache,this.indexManager),this.Os.setIndexManager(this.indexManager),this.Cs.initialize(this.localDocuments,this.indexManager)}collectGarbage(t){return this.persistence.runTransaction("Collect garbage","readwrite-primary",e=>t.collect(e,this.Fs))}}function rg(n,t,e,r){return new ng(n,t,e,r)}async function dl(n,t){const e=q(n);return await e.persistence.runTransaction("Handle user change","readonly",r=>{let s;return e.mutationQueue.getAllMutationBatches(r).next(o=>(s=o,e.Ns(t),e.mutationQueue.getAllMutationBatches(r))).next(o=>{const a=[],c=[];let h=H();for(const d of s){a.push(d.batchId);for(const p of d.mutations)h=h.add(p.key)}for(const d of o){c.push(d.batchId);for(const p of d.mutations)h=h.add(p.key)}return e.localDocuments.getDocuments(r,h).next(d=>({Bs:d,removedBatchIds:a,addedBatchIds:c}))})})}function sg(n,t){const e=q(n);return e.persistence.runTransaction("Acknowledge batch","readwrite-primary",r=>{const s=t.batch.keys(),o=e.Os.newChangeBuffer({trackRemovals:!0});return function(c,h,d,p){const y=d.batch,v=y.keys();let R=P.resolve();return v.forEach(V=>{R=R.next(()=>p.getEntry(h,V)).next(k=>{const C=d.docVersions.get(V);X(C!==null,48541),k.version.compareTo(C)<0&&(y.applyToRemoteDocument(k,d),k.isValidDocument()&&(k.setReadTime(d.commitVersion),p.addEntry(k)))})}),R.next(()=>c.mutationQueue.removeMutationBatch(h,y))}(e,r,t,o).next(()=>o.apply(r)).next(()=>e.mutationQueue.performConsistencyCheck(r)).next(()=>e.documentOverlayCache.removeOverlaysForBatchId(r,s,t.batch.batchId)).next(()=>e.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(r,function(c){let h=H();for(let d=0;d<c.mutationResults.length;++d)c.mutationResults[d].transformResults.length>0&&(h=h.add(c.batch.mutations[d].key));return h}(t))).next(()=>e.localDocuments.getDocuments(r,s))})}function fl(n){const t=q(n);return t.persistence.runTransaction("Get last remote snapshot version","readonly",e=>t.hi.getLastRemoteSnapshotVersion(e))}function ig(n,t){const e=q(n),r=t.snapshotVersion;let s=e.Fs;return e.persistence.runTransaction("Apply remote event","readwrite-primary",o=>{const a=e.Os.newChangeBuffer({trackRemovals:!0});s=e.Fs;const c=[];t.targetChanges.forEach((p,y)=>{const v=s.get(y);if(!v)return;c.push(e.hi.removeMatchingKeys(o,p.removedDocuments,y).next(()=>e.hi.addMatchingKeys(o,p.addedDocuments,y)));let R=v.withSequenceNumber(o.currentSequenceNumber);t.targetMismatches.get(y)!==null?R=R.withResumeToken(vt.EMPTY_BYTE_STRING,j.min()).withLastLimboFreeSnapshotVersion(j.min()):p.resumeToken.approximateByteSize()>0&&(R=R.withResumeToken(p.resumeToken,r)),s=s.insert(y,R),function(k,C,U){return k.resumeToken.approximateByteSize()===0||C.snapshotVersion.toMicroseconds()-k.snapshotVersion.toMicroseconds()>=eg?!0:U.addedDocuments.size+U.modifiedDocuments.size+U.removedDocuments.size>0}(v,R,p)&&c.push(e.hi.updateTargetData(o,R))});let h=re(),d=H();if(t.documentUpdates.forEach(p=>{t.resolvedLimboDocuments.has(p)&&c.push(e.persistence.referenceDelegate.updateLimboDocument(o,p))}),c.push(og(o,a,t.documentUpdates).next(p=>{h=p.Ls,d=p.ks})),!r.isEqual(j.min())){const p=e.hi.getLastRemoteSnapshotVersion(o).next(y=>e.hi.setTargetsMetadata(o,o.currentSequenceNumber,r));c.push(p)}return P.waitFor(c).next(()=>a.apply(o)).next(()=>e.localDocuments.getLocalViewOfDocuments(o,h,d)).next(()=>h)}).then(o=>(e.Fs=s,o))}function og(n,t,e){let r=H(),s=H();return e.forEach(o=>r=r.add(o)),t.getEntries(n,r).next(o=>{let a=re();return e.forEach((c,h)=>{const d=o.get(c);h.isFoundDocument()!==d.isFoundDocument()&&(s=s.add(c)),h.isNoDocument()&&h.version.isEqual(j.min())?(t.removeEntry(c,h.readTime),a=a.insert(c,h)):!d.isValidDocument()||h.version.compareTo(d.version)>0||h.version.compareTo(d.version)===0&&d.hasPendingWrites?(t.addEntry(h),a=a.insert(c,h)):x(qi,"Ignoring outdated watch update for ",c,". Current version:",d.version," Watch version:",h.version)}),{Ls:a,ks:s}})}function ag(n,t){const e=q(n);return e.persistence.runTransaction("Get next mutation batch","readonly",r=>(t===void 0&&(t=Ci),e.mutationQueue.getNextMutationBatchAfterBatchId(r,t)))}function ug(n,t){const e=q(n);return e.persistence.runTransaction("Allocate target","readwrite",r=>{let s;return e.hi.getTargetData(r,t).next(o=>o?(s=o,P.resolve(s)):e.hi.allocateTargetId(r).next(a=>(s=new ae(t,a,"TargetPurposeListen",r.currentSequenceNumber),e.hi.addTargetData(r,s).next(()=>s))))}).then(r=>{const s=e.Fs.get(r.targetId);return(s===null||r.snapshotVersion.compareTo(s.snapshotVersion)>0)&&(e.Fs=e.Fs.insert(r.targetId,r),e.Ms.set(t,r.targetId)),r})}async function fi(n,t,e){const r=q(n),s=r.Fs.get(t),o=e?"readwrite":"readwrite-primary";try{e||await r.persistence.runTransaction("Release target",o,a=>r.persistence.referenceDelegate.removeTarget(a,s))}catch(a){if(!hn(a))throw a;x(qi,`Failed to update sequence numbers for target ${t}: ${a}`)}r.Fs=r.Fs.remove(t),r.Ms.delete(s.target)}function gu(n,t,e){const r=q(n);let s=j.min(),o=H();return r.persistence.runTransaction("Execute query","readwrite",a=>function(h,d,p){const y=q(h),v=y.Ms.get(p);return v!==void 0?P.resolve(y.Fs.get(v)):y.hi.getTargetData(d,p)}(r,a,Ut(t)).next(c=>{if(c)return s=c.lastLimboFreeSnapshotVersion,r.hi.getMatchingKeysForTargetId(a,c.targetId).next(h=>{o=h})}).next(()=>r.Cs.getDocumentsMatchingQuery(a,t,e?s:j.min(),e?o:H())).next(c=>(cg(r,Kp(t),c),{documents:c,qs:o})))}function cg(n,t,e){let r=n.xs.get(t)||j.min();e.forEach((s,o)=>{o.readTime.compareTo(r)>0&&(r=o.readTime)}),n.xs.set(t,r)}class _u{constructor(){this.activeTargetIds=tm()}Gs(t){this.activeTargetIds=this.activeTargetIds.add(t)}zs(t){this.activeTargetIds=this.activeTargetIds.delete(t)}Ws(){const t={activeTargetIds:this.activeTargetIds.toArray(),updateTimeMs:Date.now()};return JSON.stringify(t)}}class lg{constructor(){this.Fo=new _u,this.Mo={},this.onlineStateHandler=null,this.sequenceNumberHandler=null}addPendingMutation(t){}updateMutationState(t,e,r){}addLocalQueryTarget(t,e=!0){return e&&this.Fo.Gs(t),this.Mo[t]||"not-current"}updateQueryState(t,e,r){this.Mo[t]=e}removeLocalQueryTarget(t){this.Fo.zs(t)}isLocalQueryTarget(t){return this.Fo.activeTargetIds.has(t)}clearQueryState(t){delete this.Mo[t]}getAllActiveQueryTargets(){return this.Fo.activeTargetIds}isActiveQueryTarget(t){return this.Fo.activeTargetIds.has(t)}start(){return this.Fo=new _u,Promise.resolve()}handleUserChange(t,e,r){}setOnlineState(t){}shutdown(){}writeSequenceNumber(t){}notifyBundleLoaded(t){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class hg{xo(t){}shutdown(){}}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const yu="ConnectivityMonitor";class vu{constructor(){this.Oo=()=>this.No(),this.Bo=()=>this.Lo(),this.ko=[],this.qo()}xo(t){this.ko.push(t)}shutdown(){window.removeEventListener("online",this.Oo),window.removeEventListener("offline",this.Bo)}qo(){window.addEventListener("online",this.Oo),window.addEventListener("offline",this.Bo)}No(){x(yu,"Network connectivity changed: AVAILABLE");for(const t of this.ko)t(0)}Lo(){x(yu,"Network connectivity changed: UNAVAILABLE");for(const t of this.ko)t(1)}static C(){return typeof window<"u"&&window.addEventListener!==void 0&&window.removeEventListener!==void 0}}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */let Sr=null;function pi(){return Sr===null?Sr=function(){return 268435456+Math.round(2147483648*Math.random())}():Sr++,"0x"+Sr.toString(16)}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const zs="RestConnection",dg={BatchGetDocuments:"batchGet",Commit:"commit",RunQuery:"runQuery",RunAggregationQuery:"runAggregationQuery"};class fg{get Qo(){return!1}constructor(t){this.databaseInfo=t,this.databaseId=t.databaseId;const e=t.ssl?"https":"http",r=encodeURIComponent(this.databaseId.projectId),s=encodeURIComponent(this.databaseId.database);this.$o=e+"://"+t.host,this.Uo=`projects/${r}/databases/${s}`,this.Ko=this.databaseId.database===Lr?`project_id=${r}`:`project_id=${r}&database_id=${s}`}Wo(t,e,r,s,o){const a=pi(),c=this.Go(t,e.toUriEncodedString());x(zs,`Sending RPC '${t}' ${a}:`,c,r);const h={"google-cloud-resource-prefix":this.Uo,"x-goog-request-params":this.Ko};this.zo(h,s,o);const{host:d}=new URL(c),p=Ti(d);return this.jo(t,c,h,r,p).then(y=>(x(zs,`Received RPC '${t}' ${a}: `,y),y),y=>{throw pe(zs,`RPC '${t}' ${a} failed with error: `,y,"url: ",c,"request:",r),y})}Jo(t,e,r,s,o,a){return this.Wo(t,e,r,s,o)}zo(t,e,r){t["X-Goog-Api-Client"]=function(){return"gl-js/ fire/"+cn}(),t["Content-Type"]="text/plain",this.databaseInfo.appId&&(t["X-Firebase-GMPID"]=this.databaseInfo.appId),e&&e.headers.forEach((s,o)=>t[o]=s),r&&r.headers.forEach((s,o)=>t[o]=s)}Go(t,e){const r=dg[t];return`${this.$o}/v1/${e}:${r}`}terminate(){}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pg{constructor(t){this.Ho=t.Ho,this.Yo=t.Yo}Zo(t){this.Xo=t}e_(t){this.t_=t}n_(t){this.r_=t}onMessage(t){this.i_=t}close(){this.Yo()}send(t){this.Ho(t)}s_(){this.Xo()}o_(){this.t_()}__(t){this.r_(t)}a_(t){this.i_(t)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const wt="WebChannelConnection";class mg extends fg{constructor(t){super(t),this.u_=[],this.forceLongPolling=t.forceLongPolling,this.autoDetectLongPolling=t.autoDetectLongPolling,this.useFetchStreams=t.useFetchStreams,this.longPollingOptions=t.longPollingOptions}jo(t,e,r,s,o){const a=pi();return new Promise((c,h)=>{const d=new pc;d.setWithCredentials(!0),d.listenOnce(mc.COMPLETE,()=>{try{switch(d.getLastErrorCode()){case br.NO_ERROR:const y=d.getResponseJson();x(wt,`XHR for RPC '${t}' ${a} received:`,JSON.stringify(y)),c(y);break;case br.TIMEOUT:x(wt,`RPC '${t}' ${a} timed out`),h(new N(b.DEADLINE_EXCEEDED,"Request time out"));break;case br.HTTP_ERROR:const v=d.getStatus();if(x(wt,`RPC '${t}' ${a} failed with status:`,v,"response text:",d.getResponseText()),v>0){let R=d.getResponseJson();Array.isArray(R)&&(R=R[0]);const V=R==null?void 0:R.error;if(V&&V.status&&V.message){const k=function(U){const L=U.toLowerCase().replace(/_/g,"-");return Object.values(b).indexOf(L)>=0?L:b.UNKNOWN}(V.status);h(new N(k,V.message))}else h(new N(b.UNKNOWN,"Server responded with status "+d.getStatus()))}else h(new N(b.UNAVAILABLE,"Connection failed."));break;default:F(9055,{c_:t,streamId:a,l_:d.getLastErrorCode(),h_:d.getLastError()})}}finally{x(wt,`RPC '${t}' ${a} completed.`)}});const p=JSON.stringify(s);x(wt,`RPC '${t}' ${a} sending request:`,s),d.send(e,"POST",p,r,15)})}P_(t,e,r){const s=pi(),o=[this.$o,"/","google.firestore.v1.Firestore","/",t,"/channel"],a=yc(),c=_c(),h={httpSessionIdParam:"gsessionid",initMessageHeaders:{},messageUrlParams:{database:`projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`},sendRawJson:!0,supportsCrossDomainXhr:!0,internalChannelParams:{forwardChannelRequestTimeoutMs:6e5},forceLongPolling:this.forceLongPolling,detectBufferingProxy:this.autoDetectLongPolling},d=this.longPollingOptions.timeoutSeconds;d!==void 0&&(h.longPollingTimeout=Math.round(1e3*d)),this.useFetchStreams&&(h.useFetchStreams=!0),this.zo(h.initMessageHeaders,e,r),h.encodeInitMessageHeaders=!0;const p=o.join("");x(wt,`Creating RPC '${t}' stream ${s}: ${p}`,h);const y=a.createWebChannel(p,h);this.T_(y);let v=!1,R=!1;const V=new pg({Ho:C=>{R?x(wt,`Not sending because RPC '${t}' stream ${s} is closed:`,C):(v||(x(wt,`Opening RPC '${t}' stream ${s} transport.`),y.open(),v=!0),x(wt,`RPC '${t}' stream ${s} sending:`,C),y.send(C))},Yo:()=>y.close()}),k=(C,U,L)=>{C.listen(U,z=>{try{L(z)}catch(Y){setTimeout(()=>{throw Y},0)}})};return k(y,bn.EventType.OPEN,()=>{R||(x(wt,`RPC '${t}' stream ${s} transport opened.`),V.s_())}),k(y,bn.EventType.CLOSE,()=>{R||(R=!0,x(wt,`RPC '${t}' stream ${s} transport closed`),V.__(),this.I_(y))}),k(y,bn.EventType.ERROR,C=>{R||(R=!0,pe(wt,`RPC '${t}' stream ${s} transport errored. Name:`,C.name,"Message:",C.message),V.__(new N(b.UNAVAILABLE,"The operation could not be completed")))}),k(y,bn.EventType.MESSAGE,C=>{var U;if(!R){const L=C.data[0];X(!!L,16349);const z=L,Y=(z==null?void 0:z.error)||((U=z[0])===null||U===void 0?void 0:U.error);if(Y){x(wt,`RPC '${t}' stream ${s} received error:`,Y);const mt=Y.status;let it=function(_){const E=ct[_];if(E!==void 0)return tl(E)}(mt),I=Y.message;it===void 0&&(it=b.INTERNAL,I="Unknown error status: "+mt+" with message "+Y.message),R=!0,V.__(new N(it,I)),y.close()}else x(wt,`RPC '${t}' stream ${s} received:`,L),V.a_(L)}}),k(c,gc.STAT_EVENT,C=>{C.stat===ni.PROXY?x(wt,`RPC '${t}' stream ${s} detected buffering proxy`):C.stat===ni.NOPROXY&&x(wt,`RPC '${t}' stream ${s} detected no buffering proxy`)}),setTimeout(()=>{V.o_()},0),V}terminate(){this.u_.forEach(t=>t.close()),this.u_=[]}T_(t){this.u_.push(t)}I_(t){this.u_=this.u_.filter(e=>e===t)}}function Gs(){return typeof document<"u"?document:null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function us(n){return new vm(n,!0)}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class pl{constructor(t,e,r=1e3,s=1.5,o=6e4){this.Fi=t,this.timerId=e,this.d_=r,this.E_=s,this.A_=o,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(t){this.cancel();const e=Math.floor(this.R_+this.p_()),r=Math.max(0,Date.now()-this.m_),s=Math.max(0,e-r);s>0&&x("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.R_} ms, delay with jitter: ${e} ms, last attempt: ${r} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,s,()=>(this.m_=Date.now(),t())),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){this.V_!==null&&(this.V_.skipDelay(),this.V_=null)}cancel(){this.V_!==null&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Eu="PersistentStream";class ml{constructor(t,e,r,s,o,a,c,h){this.Fi=t,this.w_=r,this.S_=s,this.connection=o,this.authCredentialsProvider=a,this.appCheckCredentialsProvider=c,this.listener=h,this.state=0,this.b_=0,this.D_=null,this.v_=null,this.stream=null,this.C_=0,this.F_=new pl(t,e)}M_(){return this.state===1||this.state===5||this.x_()}x_(){return this.state===2||this.state===3}start(){this.C_=0,this.state!==4?this.auth():this.O_()}async stop(){this.M_()&&await this.close(0)}N_(){this.state=0,this.F_.reset()}B_(){this.x_()&&this.D_===null&&(this.D_=this.Fi.enqueueAfterDelay(this.w_,6e4,()=>this.L_()))}k_(t){this.q_(),this.stream.send(t)}async L_(){if(this.x_())return this.close(0)}q_(){this.D_&&(this.D_.cancel(),this.D_=null)}Q_(){this.v_&&(this.v_.cancel(),this.v_=null)}async close(t,e){this.q_(),this.Q_(),this.F_.cancel(),this.b_++,t!==4?this.F_.reset():e&&e.code===b.RESOURCE_EXHAUSTED?(ne(e.toString()),ne("Using maximum backoff delay to prevent overloading the backend."),this.F_.f_()):e&&e.code===b.UNAUTHENTICATED&&this.state!==3&&(this.authCredentialsProvider.invalidateToken(),this.appCheckCredentialsProvider.invalidateToken()),this.stream!==null&&(this.U_(),this.stream.close(),this.stream=null),this.state=t,await this.listener.n_(e)}U_(){}auth(){this.state=1;const t=this.K_(this.b_),e=this.b_;Promise.all([this.authCredentialsProvider.getToken(),this.appCheckCredentialsProvider.getToken()]).then(([r,s])=>{this.b_===e&&this.W_(r,s)},r=>{t(()=>{const s=new N(b.UNKNOWN,"Fetching auth token failed: "+r.message);return this.G_(s)})})}W_(t,e){const r=this.K_(this.b_);this.stream=this.z_(t,e),this.stream.Zo(()=>{r(()=>this.listener.Zo())}),this.stream.e_(()=>{r(()=>(this.state=2,this.v_=this.Fi.enqueueAfterDelay(this.S_,1e4,()=>(this.x_()&&(this.state=3),Promise.resolve())),this.listener.e_()))}),this.stream.n_(s=>{r(()=>this.G_(s))}),this.stream.onMessage(s=>{r(()=>++this.C_==1?this.j_(s):this.onNext(s))})}O_(){this.state=5,this.F_.g_(async()=>{this.state=0,this.start()})}G_(t){return x(Eu,`close with error: ${t}`),this.stream=null,this.close(4,t)}K_(t){return e=>{this.Fi.enqueueAndForget(()=>this.b_===t?e():(x(Eu,"stream callback skipped by getCloseGuardedDispatcher."),Promise.resolve()))}}}class gg extends ml{constructor(t,e,r,s,o,a){super(t,"listen_stream_connection_backoff","listen_stream_idle","health_check_timeout",e,r,s,a),this.serializer=o}z_(t,e){return this.connection.P_("Listen",t,e)}j_(t){return this.onNext(t)}onNext(t){this.F_.reset();const e=Im(this.serializer,t),r=function(o){if(!("targetChange"in o))return j.min();const a=o.targetChange;return a.targetIds&&a.targetIds.length?j.min():a.readTime?jt(a.readTime):j.min()}(t);return this.listener.J_(e,r)}H_(t){const e={};e.database=di(this.serializer),e.addTarget=function(o,a){let c;const h=a.target;if(c=ai(h)?{documents:Sm(o,h)}:{query:Rm(o,h).Vt},c.targetId=a.targetId,a.resumeToken.approximateByteSize()>0){c.resumeToken=rl(o,a.resumeToken);const d=ci(o,a.expectedCount);d!==null&&(c.expectedCount=d)}else if(a.snapshotVersion.compareTo(j.min())>0){c.readTime=$r(o,a.snapshotVersion.toTimestamp());const d=ci(o,a.expectedCount);d!==null&&(c.expectedCount=d)}return c}(this.serializer,t);const r=Pm(this.serializer,t);r&&(e.labels=r),this.k_(e)}Y_(t){const e={};e.database=di(this.serializer),e.removeTarget=t,this.k_(e)}}class _g extends ml{constructor(t,e,r,s,o,a){super(t,"write_stream_connection_backoff","write_stream_idle","health_check_timeout",e,r,s,a),this.serializer=o}get Z_(){return this.C_>0}start(){this.lastStreamToken=void 0,super.start()}U_(){this.Z_&&this.X_([])}z_(t,e){return this.connection.P_("Write",t,e)}j_(t){return X(!!t.streamToken,31322),this.lastStreamToken=t.streamToken,X(!t.writeResults||t.writeResults.length===0,55816),this.listener.ea()}onNext(t){X(!!t.streamToken,12678),this.lastStreamToken=t.streamToken,this.F_.reset();const e=Am(t.writeResults,t.commitTime),r=jt(t.commitTime);return this.listener.ta(r,e)}na(){const t={};t.database=di(this.serializer),this.k_(t)}X_(t){const e={streamToken:this.lastStreamToken,writes:t.map(r=>wm(this.serializer,r))};this.k_(e)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class yg{}class vg extends yg{constructor(t,e,r,s){super(),this.authCredentials=t,this.appCheckCredentials=e,this.connection=r,this.serializer=s,this.ra=!1}ia(){if(this.ra)throw new N(b.FAILED_PRECONDITION,"The client has already been terminated.")}Wo(t,e,r,s){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([o,a])=>this.connection.Wo(t,li(e,r),s,o,a)).catch(o=>{throw o.name==="FirebaseError"?(o.code===b.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),o):new N(b.UNKNOWN,o.toString())})}Jo(t,e,r,s,o){return this.ia(),Promise.all([this.authCredentials.getToken(),this.appCheckCredentials.getToken()]).then(([a,c])=>this.connection.Jo(t,li(e,r),s,a,c,o)).catch(a=>{throw a.name==="FirebaseError"?(a.code===b.UNAUTHENTICATED&&(this.authCredentials.invalidateToken(),this.appCheckCredentials.invalidateToken()),a):new N(b.UNKNOWN,a.toString())})}terminate(){this.ra=!0,this.connection.terminate()}}class Eg{constructor(t,e){this.asyncQueue=t,this.onlineStateHandler=e,this.state="Unknown",this.sa=0,this.oa=null,this._a=!0}aa(){this.sa===0&&(this.ua("Unknown"),this.oa=this.asyncQueue.enqueueAfterDelay("online_state_timeout",1e4,()=>(this.oa=null,this.ca("Backend didn't respond within 10 seconds."),this.ua("Offline"),Promise.resolve())))}la(t){this.state==="Online"?this.ua("Unknown"):(this.sa++,this.sa>=1&&(this.ha(),this.ca(`Connection failed 1 times. Most recent error: ${t.toString()}`),this.ua("Offline")))}set(t){this.ha(),this.sa=0,t==="Online"&&(this._a=!1),this.ua(t)}ua(t){t!==this.state&&(this.state=t,this.onlineStateHandler(t))}ca(t){const e=`Could not reach Cloud Firestore backend. ${t}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;this._a?(ne(e),this._a=!1):x("OnlineStateTracker",e)}ha(){this.oa!==null&&(this.oa.cancel(),this.oa=null)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Oe="RemoteStore";class Tg{constructor(t,e,r,s,o){this.localStore=t,this.datastore=e,this.asyncQueue=r,this.remoteSyncer={},this.Pa=[],this.Ta=new Map,this.Ia=new Set,this.da=[],this.Ea=o,this.Ea.xo(a=>{r.enqueueAndForget(async()=>{je(this)&&(x(Oe,"Restarting streams for network reachability change."),await async function(h){const d=q(h);d.Ia.add(4),await tr(d),d.Aa.set("Unknown"),d.Ia.delete(4),await cs(d)}(this))})}),this.Aa=new Eg(r,s)}}async function cs(n){if(je(n))for(const t of n.da)await t(!0)}async function tr(n){for(const t of n.da)await t(!1)}function gl(n,t){const e=q(n);e.Ta.has(t.targetId)||(e.Ta.set(t.targetId,t),Hi(e)?Gi(e):dn(e).x_()&&zi(e,t))}function $i(n,t){const e=q(n),r=dn(e);e.Ta.delete(t),r.x_()&&_l(e,t),e.Ta.size===0&&(r.x_()?r.B_():je(e)&&e.Aa.set("Unknown"))}function zi(n,t){if(n.Ra.$e(t.targetId),t.resumeToken.approximateByteSize()>0||t.snapshotVersion.compareTo(j.min())>0){const e=n.remoteSyncer.getRemoteKeysForTarget(t.targetId).size;t=t.withExpectedCount(e)}dn(n).H_(t)}function _l(n,t){n.Ra.$e(t),dn(n).Y_(t)}function Gi(n){n.Ra=new mm({getRemoteKeysForTarget:t=>n.remoteSyncer.getRemoteKeysForTarget(t),Et:t=>n.Ta.get(t)||null,lt:()=>n.datastore.serializer.databaseId}),dn(n).start(),n.Aa.aa()}function Hi(n){return je(n)&&!dn(n).M_()&&n.Ta.size>0}function je(n){return q(n).Ia.size===0}function yl(n){n.Ra=void 0}async function Ig(n){n.Aa.set("Online")}async function wg(n){n.Ta.forEach((t,e)=>{zi(n,t)})}async function Ag(n,t){yl(n),Hi(n)?(n.Aa.la(t),Gi(n)):n.Aa.set("Unknown")}async function Sg(n,t,e){if(n.Aa.set("Online"),t instanceof nl&&t.state===2&&t.cause)try{await async function(s,o){const a=o.cause;for(const c of o.targetIds)s.Ta.has(c)&&(await s.remoteSyncer.rejectListen(c,a),s.Ta.delete(c),s.Ra.removeTarget(c))}(n,t)}catch(r){x(Oe,"Failed to remove targets %s: %s ",t.targetIds.join(","),r),await Gr(n,r)}else if(t instanceof Dr?n.Ra.Ye(t):t instanceof el?n.Ra.it(t):n.Ra.et(t),!e.isEqual(j.min()))try{const r=await fl(n.localStore);e.compareTo(r)>=0&&await function(o,a){const c=o.Ra.Pt(a);return c.targetChanges.forEach((h,d)=>{if(h.resumeToken.approximateByteSize()>0){const p=o.Ta.get(d);p&&o.Ta.set(d,p.withResumeToken(h.resumeToken,a))}}),c.targetMismatches.forEach((h,d)=>{const p=o.Ta.get(h);if(!p)return;o.Ta.set(h,p.withResumeToken(vt.EMPTY_BYTE_STRING,p.snapshotVersion)),_l(o,h);const y=new ae(p.target,h,d,p.sequenceNumber);zi(o,y)}),o.remoteSyncer.applyRemoteEvent(c)}(n,e)}catch(r){x(Oe,"Failed to raise snapshot:",r),await Gr(n,r)}}async function Gr(n,t,e){if(!hn(t))throw t;n.Ia.add(1),await tr(n),n.Aa.set("Offline"),e||(e=()=>fl(n.localStore)),n.asyncQueue.enqueueRetryable(async()=>{x(Oe,"Retrying IndexedDB access"),await e(),n.Ia.delete(1),await cs(n)})}function vl(n,t){return t().catch(e=>Gr(n,e,t))}async function ls(n){const t=q(n),e=Ee(t);let r=t.Pa.length>0?t.Pa[t.Pa.length-1].batchId:Ci;for(;Rg(t);)try{const s=await ag(t.localStore,r);if(s===null){t.Pa.length===0&&e.B_();break}r=s.batchId,bg(t,s)}catch(s){await Gr(t,s)}El(t)&&Tl(t)}function Rg(n){return je(n)&&n.Pa.length<10}function bg(n,t){n.Pa.push(t);const e=Ee(n);e.x_()&&e.Z_&&e.X_(t.mutations)}function El(n){return je(n)&&!Ee(n).M_()&&n.Pa.length>0}function Tl(n){Ee(n).start()}async function Pg(n){Ee(n).na()}async function Cg(n){const t=Ee(n);for(const e of n.Pa)t.X_(e.mutations)}async function Vg(n,t,e){const r=n.Pa.shift(),s=Mi.from(r,t,e);await vl(n,()=>n.remoteSyncer.applySuccessfulWrite(s)),await ls(n)}async function Dg(n,t){t&&Ee(n).Z_&&await async function(r,s){if(function(a){return fm(a)&&a!==b.ABORTED}(s.code)){const o=r.Pa.shift();Ee(r).N_(),await vl(r,()=>r.remoteSyncer.rejectFailedWrite(o.batchId,s)),await ls(r)}}(n,t),El(n)&&Tl(n)}async function Tu(n,t){const e=q(n);e.asyncQueue.verifyOperationInProgress(),x(Oe,"RemoteStore received new credentials");const r=je(e);e.Ia.add(3),await tr(e),r&&e.Aa.set("Unknown"),await e.remoteSyncer.handleCredentialChange(t),e.Ia.delete(3),await cs(e)}async function kg(n,t){const e=q(n);t?(e.Ia.delete(2),await cs(e)):t||(e.Ia.add(2),await tr(e),e.Aa.set("Unknown"))}function dn(n){return n.Va||(n.Va=function(e,r,s){const o=q(e);return o.ia(),new gg(r,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,s)}(n.datastore,n.asyncQueue,{Zo:Ig.bind(null,n),e_:wg.bind(null,n),n_:Ag.bind(null,n),J_:Sg.bind(null,n)}),n.da.push(async t=>{t?(n.Va.N_(),Hi(n)?Gi(n):n.Aa.set("Unknown")):(await n.Va.stop(),yl(n))})),n.Va}function Ee(n){return n.ma||(n.ma=function(e,r,s){const o=q(e);return o.ia(),new _g(r,o.connection,o.authCredentials,o.appCheckCredentials,o.serializer,s)}(n.datastore,n.asyncQueue,{Zo:()=>Promise.resolve(),e_:Pg.bind(null,n),n_:Dg.bind(null,n),ea:Cg.bind(null,n),ta:Vg.bind(null,n)}),n.da.push(async t=>{t?(n.ma.N_(),await ls(n)):(await n.ma.stop(),n.Pa.length>0&&(x(Oe,`Stopping write stream with ${n.Pa.length} pending writes`),n.Pa=[]))})),n.ma}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Wi{constructor(t,e,r,s,o){this.asyncQueue=t,this.timerId=e,this.targetTimeMs=r,this.op=s,this.removalCallback=o,this.deferred=new Zt,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch(a=>{})}get promise(){return this.deferred.promise}static createAndSchedule(t,e,r,s,o){const a=Date.now()+r,c=new Wi(t,e,a,s,o);return c.start(r),c}start(t){this.timerHandle=setTimeout(()=>this.handleDelayElapsed(),t)}skipDelay(){return this.handleDelayElapsed()}cancel(t){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new N(b.CANCELLED,"Operation cancelled"+(t?": "+t:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget(()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then(t=>this.deferred.resolve(t))):Promise.resolve())}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}function Ki(n,t){if(ne("AsyncQueue",`${t}: ${n}`),hn(n))return new N(b.UNAVAILABLE,`${t}: ${n}`);throw n}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ze{static emptySet(t){return new Ze(t.comparator)}constructor(t){this.comparator=t?(e,r)=>t(e,r)||M.comparator(e.key,r.key):(e,r)=>M.comparator(e.key,r.key),this.keyedMap=Pn(),this.sortedSet=new st(this.comparator)}has(t){return this.keyedMap.get(t)!=null}get(t){return this.keyedMap.get(t)}first(){return this.sortedSet.minKey()}last(){return this.sortedSet.maxKey()}isEmpty(){return this.sortedSet.isEmpty()}indexOf(t){const e=this.keyedMap.get(t);return e?this.sortedSet.indexOf(e):-1}get size(){return this.sortedSet.size}forEach(t){this.sortedSet.inorderTraversal((e,r)=>(t(e),!1))}add(t){const e=this.delete(t.key);return e.copy(e.keyedMap.insert(t.key,t),e.sortedSet.insert(t,null))}delete(t){const e=this.get(t);return e?this.copy(this.keyedMap.remove(t),this.sortedSet.remove(e)):this}isEqual(t){if(!(t instanceof Ze)||this.size!==t.size)return!1;const e=this.sortedSet.getIterator(),r=t.sortedSet.getIterator();for(;e.hasNext();){const s=e.getNext().key,o=r.getNext().key;if(!s.isEqual(o))return!1}return!0}toString(){const t=[];return this.forEach(e=>{t.push(e.toString())}),t.length===0?"DocumentSet ()":`DocumentSet (
  `+t.join(`  
`)+`
)`}copy(t,e){const r=new Ze;return r.comparator=this.comparator,r.keyedMap=t,r.sortedSet=e,r}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Iu{constructor(){this.fa=new st(M.comparator)}track(t){const e=t.doc.key,r=this.fa.get(e);r?t.type!==0&&r.type===3?this.fa=this.fa.insert(e,t):t.type===3&&r.type!==1?this.fa=this.fa.insert(e,{type:r.type,doc:t.doc}):t.type===2&&r.type===2?this.fa=this.fa.insert(e,{type:2,doc:t.doc}):t.type===2&&r.type===0?this.fa=this.fa.insert(e,{type:0,doc:t.doc}):t.type===1&&r.type===0?this.fa=this.fa.remove(e):t.type===1&&r.type===2?this.fa=this.fa.insert(e,{type:1,doc:r.doc}):t.type===0&&r.type===1?this.fa=this.fa.insert(e,{type:2,doc:t.doc}):F(63341,{At:t,ga:r}):this.fa=this.fa.insert(e,t)}pa(){const t=[];return this.fa.inorderTraversal((e,r)=>{t.push(r)}),t}}class an{constructor(t,e,r,s,o,a,c,h,d){this.query=t,this.docs=e,this.oldDocs=r,this.docChanges=s,this.mutatedKeys=o,this.fromCache=a,this.syncStateChanged=c,this.excludesMetadataChanges=h,this.hasCachedResults=d}static fromInitialDocuments(t,e,r,s,o){const a=[];return e.forEach(c=>{a.push({type:0,doc:c})}),new an(t,e,Ze.emptySet(e),a,r,s,!0,!1,o)}get hasPendingWrites(){return!this.mutatedKeys.isEmpty()}isEqual(t){if(!(this.fromCache===t.fromCache&&this.hasCachedResults===t.hasCachedResults&&this.syncStateChanged===t.syncStateChanged&&this.mutatedKeys.isEqual(t.mutatedKeys)&&rs(this.query,t.query)&&this.docs.isEqual(t.docs)&&this.oldDocs.isEqual(t.oldDocs)))return!1;const e=this.docChanges,r=t.docChanges;if(e.length!==r.length)return!1;for(let s=0;s<e.length;s++)if(e[s].type!==r[s].type||!e[s].doc.isEqual(r[s].doc))return!1;return!0}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ng{constructor(){this.ya=void 0,this.wa=[]}Sa(){return this.wa.some(t=>t.ba())}}class Og{constructor(){this.queries=wu(),this.onlineState="Unknown",this.Da=new Set}terminate(){(function(e,r){const s=q(e),o=s.queries;s.queries=wu(),o.forEach((a,c)=>{for(const h of c.wa)h.onError(r)})})(this,new N(b.ABORTED,"Firestore shutting down"))}}function wu(){return new Ue(n=>jc(n),rs)}async function Il(n,t){const e=q(n);let r=3;const s=t.query;let o=e.queries.get(s);o?!o.Sa()&&t.ba()&&(r=2):(o=new Ng,r=t.ba()?0:1);try{switch(r){case 0:o.ya=await e.onListen(s,!0);break;case 1:o.ya=await e.onListen(s,!1);break;case 2:await e.onFirstRemoteStoreListen(s)}}catch(a){const c=Ki(a,`Initialization of query '${Ke(t.query)}' failed`);return void t.onError(c)}e.queries.set(s,o),o.wa.push(t),t.va(e.onlineState),o.ya&&t.Ca(o.ya)&&Qi(e)}async function wl(n,t){const e=q(n),r=t.query;let s=3;const o=e.queries.get(r);if(o){const a=o.wa.indexOf(t);a>=0&&(o.wa.splice(a,1),o.wa.length===0?s=t.ba()?0:1:!o.Sa()&&t.ba()&&(s=2))}switch(s){case 0:return e.queries.delete(r),e.onUnlisten(r,!0);case 1:return e.queries.delete(r),e.onUnlisten(r,!1);case 2:return e.onLastRemoteStoreUnlisten(r);default:return}}function xg(n,t){const e=q(n);let r=!1;for(const s of t){const o=s.query,a=e.queries.get(o);if(a){for(const c of a.wa)c.Ca(s)&&(r=!0);a.ya=s}}r&&Qi(e)}function Mg(n,t,e){const r=q(n),s=r.queries.get(t);if(s)for(const o of s.wa)o.onError(e);r.queries.delete(t)}function Qi(n){n.Da.forEach(t=>{t.next()})}var mi,Au;(Au=mi||(mi={})).Fa="default",Au.Cache="cache";class Al{constructor(t,e,r){this.query=t,this.Ma=e,this.xa=!1,this.Oa=null,this.onlineState="Unknown",this.options=r||{}}Ca(t){if(!this.options.includeMetadataChanges){const r=[];for(const s of t.docChanges)s.type!==3&&r.push(s);t=new an(t.query,t.docs,t.oldDocs,r,t.mutatedKeys,t.fromCache,t.syncStateChanged,!0,t.hasCachedResults)}let e=!1;return this.xa?this.Na(t)&&(this.Ma.next(t),e=!0):this.Ba(t,this.onlineState)&&(this.La(t),e=!0),this.Oa=t,e}onError(t){this.Ma.error(t)}va(t){this.onlineState=t;let e=!1;return this.Oa&&!this.xa&&this.Ba(this.Oa,t)&&(this.La(this.Oa),e=!0),e}Ba(t,e){if(!t.fromCache||!this.ba())return!0;const r=e!=="Offline";return(!this.options.ka||!r)&&(!t.docs.isEmpty()||t.hasCachedResults||e==="Offline")}Na(t){if(t.docChanges.length>0)return!0;const e=this.Oa&&this.Oa.hasPendingWrites!==t.hasPendingWrites;return!(!t.syncStateChanged&&!e)&&this.options.includeMetadataChanges===!0}La(t){t=an.fromInitialDocuments(t.query,t.docs,t.mutatedKeys,t.fromCache,t.hasCachedResults),this.xa=!0,this.Ma.next(t)}ba(){return this.options.source!==mi.Cache}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Sl{constructor(t){this.key=t}}class Rl{constructor(t){this.key=t}}class Lg{constructor(t,e){this.query=t,this.Ha=e,this.Ya=null,this.hasCachedResults=!1,this.current=!1,this.Za=H(),this.mutatedKeys=H(),this.Xa=qc(t),this.eu=new Ze(this.Xa)}get tu(){return this.Ha}nu(t,e){const r=e?e.ru:new Iu,s=e?e.eu:this.eu;let o=e?e.mutatedKeys:this.mutatedKeys,a=s,c=!1;const h=this.query.limitType==="F"&&s.size===this.query.limit?s.last():null,d=this.query.limitType==="L"&&s.size===this.query.limit?s.first():null;if(t.inorderTraversal((p,y)=>{const v=s.get(p),R=ss(this.query,y)?y:null,V=!!v&&this.mutatedKeys.has(v.key),k=!!R&&(R.hasLocalMutations||this.mutatedKeys.has(R.key)&&R.hasCommittedMutations);let C=!1;v&&R?v.data.isEqual(R.data)?V!==k&&(r.track({type:3,doc:R}),C=!0):this.iu(v,R)||(r.track({type:2,doc:R}),C=!0,(h&&this.Xa(R,h)>0||d&&this.Xa(R,d)<0)&&(c=!0)):!v&&R?(r.track({type:0,doc:R}),C=!0):v&&!R&&(r.track({type:1,doc:v}),C=!0,(h||d)&&(c=!0)),C&&(R?(a=a.add(R),o=k?o.add(p):o.delete(p)):(a=a.delete(p),o=o.delete(p)))}),this.query.limit!==null)for(;a.size>this.query.limit;){const p=this.query.limitType==="F"?a.last():a.first();a=a.delete(p.key),o=o.delete(p.key),r.track({type:1,doc:p})}return{eu:a,ru:r,Ds:c,mutatedKeys:o}}iu(t,e){return t.hasLocalMutations&&e.hasCommittedMutations&&!e.hasLocalMutations}applyChanges(t,e,r,s){const o=this.eu;this.eu=t.eu,this.mutatedKeys=t.mutatedKeys;const a=t.ru.pa();a.sort((p,y)=>function(R,V){const k=C=>{switch(C){case 0:return 1;case 2:case 3:return 2;case 1:return 0;default:return F(20277,{At:C})}};return k(R)-k(V)}(p.type,y.type)||this.Xa(p.doc,y.doc)),this.su(r),s=s!=null&&s;const c=e&&!s?this.ou():[],h=this.Za.size===0&&this.current&&!s?1:0,d=h!==this.Ya;return this.Ya=h,a.length!==0||d?{snapshot:new an(this.query,t.eu,o,a,t.mutatedKeys,h===0,d,!1,!!r&&r.resumeToken.approximateByteSize()>0),_u:c}:{_u:c}}va(t){return this.current&&t==="Offline"?(this.current=!1,this.applyChanges({eu:this.eu,ru:new Iu,mutatedKeys:this.mutatedKeys,Ds:!1},!1)):{_u:[]}}au(t){return!this.Ha.has(t)&&!!this.eu.has(t)&&!this.eu.get(t).hasLocalMutations}su(t){t&&(t.addedDocuments.forEach(e=>this.Ha=this.Ha.add(e)),t.modifiedDocuments.forEach(e=>{}),t.removedDocuments.forEach(e=>this.Ha=this.Ha.delete(e)),this.current=t.current)}ou(){if(!this.current)return[];const t=this.Za;this.Za=H(),this.eu.forEach(r=>{this.au(r.key)&&(this.Za=this.Za.add(r.key))});const e=[];return t.forEach(r=>{this.Za.has(r)||e.push(new Rl(r))}),this.Za.forEach(r=>{t.has(r)||e.push(new Sl(r))}),e}uu(t){this.Ha=t.qs,this.Za=H();const e=this.nu(t.documents);return this.applyChanges(e,!0)}cu(){return an.fromInitialDocuments(this.query,this.eu,this.mutatedKeys,this.Ya===0,this.hasCachedResults)}}const Xi="SyncEngine";class Fg{constructor(t,e,r){this.query=t,this.targetId=e,this.view=r}}class Ug{constructor(t){this.key=t,this.lu=!1}}class Bg{constructor(t,e,r,s,o,a){this.localStore=t,this.remoteStore=e,this.eventManager=r,this.sharedClientState=s,this.currentUser=o,this.maxConcurrentLimboResolutions=a,this.hu={},this.Pu=new Ue(c=>jc(c),rs),this.Tu=new Map,this.Iu=new Set,this.du=new st(M.comparator),this.Eu=new Map,this.Au=new Ui,this.Ru={},this.Vu=new Map,this.mu=on.ur(),this.onlineState="Unknown",this.fu=void 0}get isPrimaryClient(){return this.fu===!0}}async function jg(n,t,e=!0){const r=kl(n);let s;const o=r.Pu.get(t);return o?(r.sharedClientState.addLocalQueryTarget(o.targetId),s=o.view.cu()):s=await bl(r,t,e,!0),s}async function qg(n,t){const e=kl(n);await bl(e,t,!0,!1)}async function bl(n,t,e,r){const s=await ug(n.localStore,Ut(t)),o=s.targetId,a=n.sharedClientState.addLocalQueryTarget(o,e);let c;return r&&(c=await $g(n,t,o,a==="current",s.resumeToken)),n.isPrimaryClient&&e&&gl(n.remoteStore,s),c}async function $g(n,t,e,r,s){n.gu=(y,v,R)=>async function(k,C,U,L){let z=C.view.nu(U);z.Ds&&(z=await gu(k.localStore,C.query,!1).then(({documents:I})=>C.view.nu(I,z)));const Y=L&&L.targetChanges.get(C.targetId),mt=L&&L.targetMismatches.get(C.targetId)!=null,it=C.view.applyChanges(z,k.isPrimaryClient,Y,mt);return Ru(k,C.targetId,it._u),it.snapshot}(n,y,v,R);const o=await gu(n.localStore,t,!0),a=new Lg(t,o.qs),c=a.nu(o.documents),h=Zn.createSynthesizedTargetChangeForCurrentChange(e,r&&n.onlineState!=="Offline",s),d=a.applyChanges(c,n.isPrimaryClient,h);Ru(n,e,d._u);const p=new Fg(t,e,a);return n.Pu.set(t,p),n.Tu.has(e)?n.Tu.get(e).push(t):n.Tu.set(e,[t]),d.snapshot}async function zg(n,t,e){const r=q(n),s=r.Pu.get(t),o=r.Tu.get(s.targetId);if(o.length>1)return r.Tu.set(s.targetId,o.filter(a=>!rs(a,t))),void r.Pu.delete(t);r.isPrimaryClient?(r.sharedClientState.removeLocalQueryTarget(s.targetId),r.sharedClientState.isActiveQueryTarget(s.targetId)||await fi(r.localStore,s.targetId,!1).then(()=>{r.sharedClientState.clearQueryState(s.targetId),e&&$i(r.remoteStore,s.targetId),gi(r,s.targetId)}).catch(ln)):(gi(r,s.targetId),await fi(r.localStore,s.targetId,!0))}async function Gg(n,t){const e=q(n),r=e.Pu.get(t),s=e.Tu.get(r.targetId);e.isPrimaryClient&&s.length===1&&(e.sharedClientState.removeLocalQueryTarget(r.targetId),$i(e.remoteStore,r.targetId))}async function Hg(n,t,e){const r=Zg(n);try{const s=await function(a,c){const h=q(a),d=nt.now(),p=c.reduce((R,V)=>R.add(V.key),H());let y,v;return h.persistence.runTransaction("Locally write mutations","readwrite",R=>{let V=re(),k=H();return h.Os.getEntries(R,p).next(C=>{V=C,V.forEach((U,L)=>{L.isValidDocument()||(k=k.add(U))})}).next(()=>h.localDocuments.getOverlayedDocuments(R,V)).next(C=>{y=C;const U=[];for(const L of c){const z=um(L,y.get(L.key).overlayedDocument);z!=null&&U.push(new Be(L.key,z,Nc(z.value.mapValue),Bt.exists(!0)))}return h.mutationQueue.addMutationBatch(R,d,U,c)}).next(C=>{v=C;const U=C.applyToLocalDocumentSet(y,k);return h.documentOverlayCache.saveOverlays(R,C.batchId,U)})}).then(()=>({batchId:v.batchId,changes:zc(y)}))}(r.localStore,t);r.sharedClientState.addPendingMutation(s.batchId),function(a,c,h){let d=a.Ru[a.currentUser.toKey()];d||(d=new st(G)),d=d.insert(c,h),a.Ru[a.currentUser.toKey()]=d}(r,s.batchId,e),await er(r,s.changes),await ls(r.remoteStore)}catch(s){const o=Ki(s,"Failed to persist write");e.reject(o)}}async function Pl(n,t){const e=q(n);try{const r=await ig(e.localStore,t);t.targetChanges.forEach((s,o)=>{const a=e.Eu.get(o);a&&(X(s.addedDocuments.size+s.modifiedDocuments.size+s.removedDocuments.size<=1,22616),s.addedDocuments.size>0?a.lu=!0:s.modifiedDocuments.size>0?X(a.lu,14607):s.removedDocuments.size>0&&(X(a.lu,42227),a.lu=!1))}),await er(e,r,t)}catch(r){await ln(r)}}function Su(n,t,e){const r=q(n);if(r.isPrimaryClient&&e===0||!r.isPrimaryClient&&e===1){const s=[];r.Pu.forEach((o,a)=>{const c=a.view.va(t);c.snapshot&&s.push(c.snapshot)}),function(a,c){const h=q(a);h.onlineState=c;let d=!1;h.queries.forEach((p,y)=>{for(const v of y.wa)v.va(c)&&(d=!0)}),d&&Qi(h)}(r.eventManager,t),s.length&&r.hu.J_(s),r.onlineState=t,r.isPrimaryClient&&r.sharedClientState.setOnlineState(t)}}async function Wg(n,t,e){const r=q(n);r.sharedClientState.updateQueryState(t,"rejected",e);const s=r.Eu.get(t),o=s&&s.key;if(o){let a=new st(M.comparator);a=a.insert(o,St.newNoDocument(o,j.min()));const c=H().add(o),h=new as(j.min(),new Map,new st(G),a,c);await Pl(r,h),r.du=r.du.remove(o),r.Eu.delete(t),Yi(r)}else await fi(r.localStore,t,!1).then(()=>gi(r,t,e)).catch(ln)}async function Kg(n,t){const e=q(n),r=t.batch.batchId;try{const s=await sg(e.localStore,t);Vl(e,r,null),Cl(e,r),e.sharedClientState.updateMutationState(r,"acknowledged"),await er(e,s)}catch(s){await ln(s)}}async function Qg(n,t,e){const r=q(n);try{const s=await function(a,c){const h=q(a);return h.persistence.runTransaction("Reject batch","readwrite-primary",d=>{let p;return h.mutationQueue.lookupMutationBatch(d,c).next(y=>(X(y!==null,37113),p=y.keys(),h.mutationQueue.removeMutationBatch(d,y))).next(()=>h.mutationQueue.performConsistencyCheck(d)).next(()=>h.documentOverlayCache.removeOverlaysForBatchId(d,p,c)).next(()=>h.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(d,p)).next(()=>h.localDocuments.getDocuments(d,p))})}(r.localStore,t);Vl(r,t,e),Cl(r,t),r.sharedClientState.updateMutationState(t,"rejected",e),await er(r,s)}catch(s){await ln(s)}}function Cl(n,t){(n.Vu.get(t)||[]).forEach(e=>{e.resolve()}),n.Vu.delete(t)}function Vl(n,t,e){const r=q(n);let s=r.Ru[r.currentUser.toKey()];if(s){const o=s.get(t);o&&(e?o.reject(e):o.resolve(),s=s.remove(t)),r.Ru[r.currentUser.toKey()]=s}}function gi(n,t,e=null){n.sharedClientState.removeLocalQueryTarget(t);for(const r of n.Tu.get(t))n.Pu.delete(r),e&&n.hu.pu(r,e);n.Tu.delete(t),n.isPrimaryClient&&n.Au.zr(t).forEach(r=>{n.Au.containsKey(r)||Dl(n,r)})}function Dl(n,t){n.Iu.delete(t.path.canonicalString());const e=n.du.get(t);e!==null&&($i(n.remoteStore,e),n.du=n.du.remove(t),n.Eu.delete(e),Yi(n))}function Ru(n,t,e){for(const r of e)r instanceof Sl?(n.Au.addReference(r.key,t),Xg(n,r)):r instanceof Rl?(x(Xi,"Document no longer in limbo: "+r.key),n.Au.removeReference(r.key,t),n.Au.containsKey(r.key)||Dl(n,r.key)):F(19791,{yu:r})}function Xg(n,t){const e=t.key,r=e.path.canonicalString();n.du.get(e)||n.Iu.has(r)||(x(Xi,"New document in limbo: "+e),n.Iu.add(r),Yi(n))}function Yi(n){for(;n.Iu.size>0&&n.du.size<n.maxConcurrentLimboResolutions;){const t=n.Iu.values().next().value;n.Iu.delete(t);const e=new M(tt.fromString(t)),r=n.mu.next();n.Eu.set(r,new Ug(e)),n.du=n.du.insert(e,r),gl(n.remoteStore,new ae(Ut(Oi(e.path)),r,"TargetPurposeLimboResolution",ts.ue))}}async function er(n,t,e){const r=q(n),s=[],o=[],a=[];r.Pu.isEmpty()||(r.Pu.forEach((c,h)=>{a.push(r.gu(h,t,e).then(d=>{var p;if((d||e)&&r.isPrimaryClient){const y=d?!d.fromCache:(p=e==null?void 0:e.targetChanges.get(h.targetId))===null||p===void 0?void 0:p.current;r.sharedClientState.updateQueryState(h.targetId,y?"current":"not-current")}if(d){s.push(d);const y=ji.Es(h.targetId,d);o.push(y)}}))}),await Promise.all(a),r.hu.J_(s),await async function(h,d){const p=q(h);try{await p.persistence.runTransaction("notifyLocalViewChanges","readwrite",y=>P.forEach(d,v=>P.forEach(v.Is,R=>p.persistence.referenceDelegate.addReference(y,v.targetId,R)).next(()=>P.forEach(v.ds,R=>p.persistence.referenceDelegate.removeReference(y,v.targetId,R)))))}catch(y){if(!hn(y))throw y;x(qi,"Failed to update sequence numbers: "+y)}for(const y of d){const v=y.targetId;if(!y.fromCache){const R=p.Fs.get(v),V=R.snapshotVersion,k=R.withLastLimboFreeSnapshotVersion(V);p.Fs=p.Fs.insert(v,k)}}}(r.localStore,o))}async function Yg(n,t){const e=q(n);if(!e.currentUser.isEqual(t)){x(Xi,"User change. New user:",t.toKey());const r=await dl(e.localStore,t);e.currentUser=t,function(o,a){o.Vu.forEach(c=>{c.forEach(h=>{h.reject(new N(b.CANCELLED,a))})}),o.Vu.clear()}(e,"'waitForPendingWrites' promise is rejected due to a user change."),e.sharedClientState.handleUserChange(t,r.removedBatchIds,r.addedBatchIds),await er(e,r.Bs)}}function Jg(n,t){const e=q(n),r=e.Eu.get(t);if(r&&r.lu)return H().add(r.key);{let s=H();const o=e.Tu.get(t);if(!o)return s;for(const a of o){const c=e.Pu.get(a);s=s.unionWith(c.view.tu)}return s}}function kl(n){const t=q(n);return t.remoteStore.remoteSyncer.applyRemoteEvent=Pl.bind(null,t),t.remoteStore.remoteSyncer.getRemoteKeysForTarget=Jg.bind(null,t),t.remoteStore.remoteSyncer.rejectListen=Wg.bind(null,t),t.hu.J_=xg.bind(null,t.eventManager),t.hu.pu=Mg.bind(null,t.eventManager),t}function Zg(n){const t=q(n);return t.remoteStore.remoteSyncer.applySuccessfulWrite=Kg.bind(null,t),t.remoteStore.remoteSyncer.rejectFailedWrite=Qg.bind(null,t),t}class Hr{constructor(){this.kind="memory",this.synchronizeTabs=!1}async initialize(t){this.serializer=us(t.databaseInfo.databaseId),this.sharedClientState=this.bu(t),this.persistence=this.Du(t),await this.persistence.start(),this.localStore=this.vu(t),this.gcScheduler=this.Cu(t,this.localStore),this.indexBackfillerScheduler=this.Fu(t,this.localStore)}Cu(t,e){return null}Fu(t,e){return null}vu(t){return rg(this.persistence,new tg,t.initialUser,this.serializer)}Du(t){return new hl(Bi.Vi,this.serializer)}bu(t){return new lg}async terminate(){var t,e;(t=this.gcScheduler)===null||t===void 0||t.stop(),(e=this.indexBackfillerScheduler)===null||e===void 0||e.stop(),this.sharedClientState.shutdown(),await this.persistence.shutdown()}}Hr.provider={build:()=>new Hr};class t_ extends Hr{constructor(t){super(),this.cacheSizeBytes=t}Cu(t,e){X(this.persistence.referenceDelegate instanceof zr,46915);const r=this.persistence.referenceDelegate.garbageCollector;return new Um(r,t.asyncQueue,e)}Du(t){const e=this.cacheSizeBytes!==void 0?Pt.withCacheSize(this.cacheSizeBytes):Pt.DEFAULT;return new hl(r=>zr.Vi(r,e),this.serializer)}}class _i{async initialize(t,e){this.localStore||(this.localStore=t.localStore,this.sharedClientState=t.sharedClientState,this.datastore=this.createDatastore(e),this.remoteStore=this.createRemoteStore(e),this.eventManager=this.createEventManager(e),this.syncEngine=this.createSyncEngine(e,!t.synchronizeTabs),this.sharedClientState.onlineStateHandler=r=>Su(this.syncEngine,r,1),this.remoteStore.remoteSyncer.handleCredentialChange=Yg.bind(null,this.syncEngine),await kg(this.remoteStore,this.syncEngine.isPrimaryClient))}createEventManager(t){return function(){return new Og}()}createDatastore(t){const e=us(t.databaseInfo.databaseId),r=function(o){return new mg(o)}(t.databaseInfo);return function(o,a,c,h){return new vg(o,a,c,h)}(t.authCredentials,t.appCheckCredentials,r,e)}createRemoteStore(t){return function(r,s,o,a,c){return new Tg(r,s,o,a,c)}(this.localStore,this.datastore,t.asyncQueue,e=>Su(this.syncEngine,e,0),function(){return vu.C()?new vu:new hg}())}createSyncEngine(t,e){return function(s,o,a,c,h,d,p){const y=new Bg(s,o,a,c,h,d);return p&&(y.fu=!0),y}(this.localStore,this.remoteStore,this.eventManager,this.sharedClientState,t.initialUser,t.maxConcurrentLimboResolutions,e)}async terminate(){var t,e;await async function(s){const o=q(s);x(Oe,"RemoteStore shutting down."),o.Ia.add(5),await tr(o),o.Ea.shutdown(),o.Aa.set("Unknown")}(this.remoteStore),(t=this.datastore)===null||t===void 0||t.terminate(),(e=this.eventManager)===null||e===void 0||e.terminate()}}_i.provider={build:()=>new _i};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *//**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Nl{constructor(t){this.observer=t,this.muted=!1}next(t){this.muted||this.observer.next&&this.xu(this.observer.next,t)}error(t){this.muted||(this.observer.error?this.xu(this.observer.error,t):ne("Uncaught Error in snapshot listener:",t.toString()))}Ou(){this.muted=!0}xu(t,e){setTimeout(()=>{this.muted||t(e)},0)}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Te="FirestoreClient";class e_{constructor(t,e,r,s,o){this.authCredentials=t,this.appCheckCredentials=e,this.asyncQueue=r,this.databaseInfo=s,this.user=At.UNAUTHENTICATED,this.clientId=Pi.newId(),this.authCredentialListener=()=>Promise.resolve(),this.appCheckCredentialListener=()=>Promise.resolve(),this._uninitializedComponentsProvider=o,this.authCredentials.start(r,async a=>{x(Te,"Received user=",a.uid),await this.authCredentialListener(a),this.user=a}),this.appCheckCredentials.start(r,a=>(x(Te,"Received new app check token=",a),this.appCheckCredentialListener(a,this.user)))}get configuration(){return{asyncQueue:this.asyncQueue,databaseInfo:this.databaseInfo,clientId:this.clientId,authCredentials:this.authCredentials,appCheckCredentials:this.appCheckCredentials,initialUser:this.user,maxConcurrentLimboResolutions:100}}setCredentialChangeListener(t){this.authCredentialListener=t}setAppCheckTokenChangeListener(t){this.appCheckCredentialListener=t}terminate(){this.asyncQueue.enterRestrictedMode();const t=new Zt;return this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async()=>{try{this._onlineComponents&&await this._onlineComponents.terminate(),this._offlineComponents&&await this._offlineComponents.terminate(),this.authCredentials.shutdown(),this.appCheckCredentials.shutdown(),t.resolve()}catch(e){const r=Ki(e,"Failed to shutdown persistence");t.reject(r)}}),t.promise}}async function Hs(n,t){n.asyncQueue.verifyOperationInProgress(),x(Te,"Initializing OfflineComponentProvider");const e=n.configuration;await t.initialize(e);let r=e.initialUser;n.setCredentialChangeListener(async s=>{r.isEqual(s)||(await dl(t.localStore,s),r=s)}),t.persistence.setDatabaseDeletedListener(()=>{pe("Terminating Firestore due to IndexedDb database deletion"),n.terminate().then(()=>{x("Terminating Firestore due to IndexedDb database deletion completed successfully")}).catch(s=>{pe("Terminating Firestore due to IndexedDb database deletion failed",s)})}),n._offlineComponents=t}async function bu(n,t){n.asyncQueue.verifyOperationInProgress();const e=await n_(n);x(Te,"Initializing OnlineComponentProvider"),await t.initialize(e,n.configuration),n.setCredentialChangeListener(r=>Tu(t.remoteStore,r)),n.setAppCheckTokenChangeListener((r,s)=>Tu(t.remoteStore,s)),n._onlineComponents=t}async function n_(n){if(!n._offlineComponents)if(n._uninitializedComponentsProvider){x(Te,"Using user provided OfflineComponentProvider");try{await Hs(n,n._uninitializedComponentsProvider._offline)}catch(t){const e=t;if(!function(s){return s.name==="FirebaseError"?s.code===b.FAILED_PRECONDITION||s.code===b.UNIMPLEMENTED:!(typeof DOMException<"u"&&s instanceof DOMException)||s.code===22||s.code===20||s.code===11}(e))throw e;pe("Error using user provided cache. Falling back to memory cache: "+e),await Hs(n,new Hr)}}else x(Te,"Using default OfflineComponentProvider"),await Hs(n,new t_(void 0));return n._offlineComponents}async function Ol(n){return n._onlineComponents||(n._uninitializedComponentsProvider?(x(Te,"Using user provided OnlineComponentProvider"),await bu(n,n._uninitializedComponentsProvider._online)):(x(Te,"Using default OnlineComponentProvider"),await bu(n,new _i))),n._onlineComponents}function r_(n){return Ol(n).then(t=>t.syncEngine)}async function xl(n){const t=await Ol(n),e=t.eventManager;return e.onListen=jg.bind(null,t.syncEngine),e.onUnlisten=zg.bind(null,t.syncEngine),e.onFirstRemoteStoreListen=qg.bind(null,t.syncEngine),e.onLastRemoteStoreUnlisten=Gg.bind(null,t.syncEngine),e}function s_(n,t,e={}){const r=new Zt;return n.asyncQueue.enqueueAndForget(async()=>function(o,a,c,h,d){const p=new Nl({next:v=>{p.Ou(),a.enqueueAndForget(()=>wl(o,y));const R=v.docs.has(c);!R&&v.fromCache?d.reject(new N(b.UNAVAILABLE,"Failed to get document because the client is offline.")):R&&v.fromCache&&h&&h.source==="server"?d.reject(new N(b.UNAVAILABLE,'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)')):d.resolve(v)},error:v=>d.reject(v)}),y=new Al(Oi(c.path),p,{includeMetadataChanges:!0,ka:!0});return Il(o,y)}(await xl(n),n.asyncQueue,t,e,r)),r.promise}function i_(n,t,e={}){const r=new Zt;return n.asyncQueue.enqueueAndForget(async()=>function(o,a,c,h,d){const p=new Nl({next:v=>{p.Ou(),a.enqueueAndForget(()=>wl(o,y)),v.fromCache&&h.source==="server"?d.reject(new N(b.UNAVAILABLE,'Failed to get documents from server. (However, these documents may exist in the local cache. Run again without setting source to "server" to retrieve the cached documents.)')):d.resolve(v)},error:v=>d.reject(v)}),y=new Al(c,p,{includeMetadataChanges:!0,ka:!0});return Il(o,y)}(await xl(n),n.asyncQueue,t,e,r)),r.promise}/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Ml(n){const t={};return n.timeoutSeconds!==void 0&&(t.timeoutSeconds=n.timeoutSeconds),t}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Pu=new Map;/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ll="firestore.googleapis.com",Cu=!0;class Vu{constructor(t){var e,r;if(t.host===void 0){if(t.ssl!==void 0)throw new N(b.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Ll,this.ssl=Cu}else this.host=t.host,this.ssl=(e=t.ssl)!==null&&e!==void 0?e:Cu;if(this.isUsingEmulator=t.emulatorOptions!==void 0,this.credentials=t.credentials,this.ignoreUndefinedProperties=!!t.ignoreUndefinedProperties,this.localCache=t.localCache,t.cacheSizeBytes===void 0)this.cacheSizeBytes=ll;else{if(t.cacheSizeBytes!==-1&&t.cacheSizeBytes<Lm)throw new N(b.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=t.cacheSizeBytes}Ep("experimentalForceLongPolling",t.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",t.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!t.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:t.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!t.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Ml((r=t.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),function(o){if(o.timeoutSeconds!==void 0){if(isNaN(o.timeoutSeconds))throw new N(b.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (must not be NaN)`);if(o.timeoutSeconds<5)throw new N(b.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (minimum allowed value is 5)`);if(o.timeoutSeconds>30)throw new N(b.INVALID_ARGUMENT,`invalid long polling timeout: ${o.timeoutSeconds} (maximum allowed value is 30)`)}}(this.experimentalLongPollingOptions),this.useFetchStreams=!!t.useFetchStreams}isEqual(t){return this.host===t.host&&this.ssl===t.ssl&&this.credentials===t.credentials&&this.cacheSizeBytes===t.cacheSizeBytes&&this.experimentalForceLongPolling===t.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===t.experimentalAutoDetectLongPolling&&function(r,s){return r.timeoutSeconds===s.timeoutSeconds}(this.experimentalLongPollingOptions,t.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===t.ignoreUndefinedProperties&&this.useFetchStreams===t.useFetchStreams}}class hs{constructor(t,e,r,s){this._authCredentials=t,this._appCheckCredentials=e,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new Vu({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new N(b.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(t){if(this._settingsFrozen)throw new N(b.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new Vu(t),this._emulatorOptions=t.emulatorOptions||{},t.credentials!==void 0&&(this._authCredentials=function(r){if(!r)return new hp;switch(r.type){case"firstParty":return new mp(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new N(b.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}}(t.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return function(e){const r=Pu.get(e);r&&(x("ComponentProvider","Removing Datastore"),Pu.delete(e),r.terminate())}(this),Promise.resolve()}}function o_(n,t,e,r={}){var s;n=me(n,hs);const o=Ti(t),a=n._getSettings(),c=Object.assign(Object.assign({},a),{emulatorOptions:n._getEmulatorOptions()}),h=`${t}:${e}`;o&&(Fd(`https://${h}`),qd("Firestore",!0)),a.host!==Ll&&a.host!==h&&pe("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const d=Object.assign(Object.assign({},a),{host:h,ssl:o,emulatorOptions:r});if(!Bn(d,c)&&(n._setSettings(d),r.mockUserToken)){let p,y;if(typeof r.mockUserToken=="string")p=r.mockUserToken,y=At.MOCK_USER;else{p=Ud(r.mockUserToken,(s=n._app)===null||s===void 0?void 0:s.options.projectId);const v=r.mockUserToken.sub||r.mockUserToken.user_id;if(!v)throw new N(b.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");y=new At(v)}n._authCredentials=new dp(new Ec(p,y))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qe{constructor(t,e,r){this.converter=e,this._query=r,this.type="query",this.firestore=t}withConverter(t){return new qe(this.firestore,t,this._query)}}class dt{constructor(t,e,r){this.converter=e,this._key=r,this.type="document",this.firestore=t}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new he(this.firestore,this.converter,this._key.path.popLast())}withConverter(t){return new dt(this.firestore,t,this._key)}toJSON(){return{type:dt._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(t,e,r){if(Xn(e,dt._jsonSchema))return new dt(t,r||null,new M(tt.fromString(e.referencePath)))}}dt._jsonSchemaVersion="firestore/documentReference/1.0",dt._jsonSchema={type:ht("string",dt._jsonSchemaVersion),referencePath:ht("string")};class he extends qe{constructor(t,e,r){super(t,e,Oi(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const t=this._path.popLast();return t.isEmpty()?null:new dt(this.firestore,null,new M(t))}withConverter(t){return new he(this.firestore,t,this._path)}}function Pv(n,t,...e){if(n=de(n),Ic("collection","path",t),n instanceof hs){const r=tt.fromString(t,...e);return $a(r),new he(n,null,r)}{if(!(n instanceof dt||n instanceof he))throw new N(b.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(tt.fromString(t,...e));return $a(r),new he(n.firestore,null,r)}}function a_(n,t,...e){if(n=de(n),arguments.length===1&&(t=Pi.newId()),Ic("doc","path",t),n instanceof hs){const r=tt.fromString(t,...e);return qa(r),new dt(n,null,new M(r))}{if(!(n instanceof dt||n instanceof he))throw new N(b.INVALID_ARGUMENT,"Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");const r=n._path.child(tt.fromString(t,...e));return qa(r),new dt(n.firestore,n instanceof he?n.converter:null,new M(r))}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Du="AsyncQueue";class ku{constructor(t=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new pl(this,"async_queue_retry"),this.oc=()=>{const r=Gs();r&&x(Du,"Visibility state changed to "+r.visibilityState),this.F_.y_()},this._c=t;const e=Gs();e&&typeof e.addEventListener=="function"&&e.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(t){this.enqueue(t)}enqueueAndForgetEvenWhileRestricted(t){this.ac(),this.uc(t)}enterRestrictedMode(t){if(!this.Xu){this.Xu=!0,this.rc=t||!1;const e=Gs();e&&typeof e.removeEventListener=="function"&&e.removeEventListener("visibilitychange",this.oc)}}enqueue(t){if(this.ac(),this.Xu)return new Promise(()=>{});const e=new Zt;return this.uc(()=>this.Xu&&this.rc?Promise.resolve():(t().then(e.resolve,e.reject),e.promise)).then(()=>e.promise)}enqueueRetryable(t){this.enqueueAndForget(()=>(this.Zu.push(t),this.cc()))}async cc(){if(this.Zu.length!==0){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(t){if(!hn(t))throw t;x(Du,"Operation failed with retryable error: "+t)}this.Zu.length>0&&this.F_.g_(()=>this.cc())}}uc(t){const e=this._c.then(()=>(this.nc=!0,t().catch(r=>{throw this.tc=r,this.nc=!1,ne("INTERNAL UNHANDLED ERROR: ",Nu(r)),r}).then(r=>(this.nc=!1,r))));return this._c=e,e}enqueueAfterDelay(t,e,r){this.ac(),this.sc.indexOf(t)>-1&&(e=0);const s=Wi.createAndSchedule(this,t,e,r,o=>this.lc(o));return this.ec.push(s),s}ac(){this.tc&&F(47125,{hc:Nu(this.tc)})}verifyOperationInProgress(){}async Pc(){let t;do t=this._c,await t;while(t!==this._c)}Tc(t){for(const e of this.ec)if(e.timerId===t)return!0;return!1}Ic(t){return this.Pc().then(()=>{this.ec.sort((e,r)=>e.targetTimeMs-r.targetTimeMs);for(const e of this.ec)if(e.skipDelay(),t!=="all"&&e.timerId===t)break;return this.Pc()})}dc(t){this.sc.push(t)}lc(t){const e=this.ec.indexOf(t);this.ec.splice(e,1)}}function Nu(n){let t=n.message||"";return n.stack&&(t=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),t}class nr extends hs{constructor(t,e,r,s){super(t,e,r,s),this.type="firestore",this._queue=new ku,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const t=this._firestoreClient.terminate();this._queue=new ku(t),this._firestoreClient=void 0,await t}}}function Cv(n,t){const e=typeof n=="object"?n:lc(),r=typeof n=="string"?n:Lr,s=Qn(e,"firestore").getImmediate({identifier:r});if(!s._initialized){const o=Md("firestore");o&&o_(s,...o)}return s}function Ji(n){if(n._terminated)throw new N(b.FAILED_PRECONDITION,"The client has already been terminated.");return n._firestoreClient||u_(n),n._firestoreClient}function u_(n){var t,e,r;const s=n._freezeSettings(),o=function(c,h,d,p){return new kp(c,h,d,p.host,p.ssl,p.experimentalForceLongPolling,p.experimentalAutoDetectLongPolling,Ml(p.experimentalLongPollingOptions),p.useFetchStreams,p.isUsingEmulator)}(n._databaseId,((t=n._app)===null||t===void 0?void 0:t.options.appId)||"",n._persistenceKey,s);n._componentsProvider||!((e=s.localCache)===null||e===void 0)&&e._offlineComponentProvider&&(!((r=s.localCache)===null||r===void 0)&&r._onlineComponentProvider)&&(n._componentsProvider={_offline:s.localCache._offlineComponentProvider,_online:s.localCache._onlineComponentProvider}),n._firestoreClient=new e_(n._authCredentials,n._appCheckCredentials,n._queue,o,n._componentsProvider&&function(c){const h=c==null?void 0:c._online.build();return{_offline:c==null?void 0:c._offline.build(h),_online:h}}(n._componentsProvider))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Ot{constructor(t){this._byteString=t}static fromBase64String(t){try{return new Ot(vt.fromBase64String(t))}catch(e){throw new N(b.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+e)}}static fromUint8Array(t){return new Ot(vt.fromUint8Array(t))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(t){return this._byteString.isEqual(t._byteString)}toJSON(){return{type:Ot._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(t){if(Xn(t,Ot._jsonSchema))return Ot.fromBase64String(t.bytes)}}Ot._jsonSchemaVersion="firestore/bytes/1.0",Ot._jsonSchema={type:ht("string",Ot._jsonSchemaVersion),bytes:ht("string")};/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class Zi{constructor(...t){for(let e=0;e<t.length;++e)if(t[e].length===0)throw new N(b.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new yt(t)}isEqual(t){return this._internalPath.isEqual(t._internalPath)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class to{constructor(t){this._methodName=t}}/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class qt{constructor(t,e){if(!isFinite(t)||t<-90||t>90)throw new N(b.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+t);if(!isFinite(e)||e<-180||e>180)throw new N(b.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+e);this._lat=t,this._long=e}get latitude(){return this._lat}get longitude(){return this._long}isEqual(t){return this._lat===t._lat&&this._long===t._long}_compareTo(t){return G(this._lat,t._lat)||G(this._long,t._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:qt._jsonSchemaVersion}}static fromJSON(t){if(Xn(t,qt._jsonSchema))return new qt(t.latitude,t.longitude)}}qt._jsonSchemaVersion="firestore/geoPoint/1.0",qt._jsonSchema={type:ht("string",qt._jsonSchemaVersion),latitude:ht("number"),longitude:ht("number")};/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class $t{constructor(t){this._values=(t||[]).map(e=>e)}toArray(){return this._values.map(t=>t)}isEqual(t){return function(r,s){if(r.length!==s.length)return!1;for(let o=0;o<r.length;++o)if(r[o]!==s[o])return!1;return!0}(this._values,t._values)}toJSON(){return{type:$t._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(t){if(Xn(t,$t._jsonSchema)){if(Array.isArray(t.vectorValues)&&t.vectorValues.every(e=>typeof e=="number"))return new $t(t.vectorValues);throw new N(b.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}$t._jsonSchemaVersion="firestore/vectorValue/1.0",$t._jsonSchema={type:ht("string",$t._jsonSchemaVersion),vectorValues:ht("object")};/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const c_=/^__.*__$/;class l_{constructor(t,e,r){this.data=t,this.fieldMask=e,this.fieldTransforms=r}toMutation(t,e){return this.fieldMask!==null?new Be(t,this.data,this.fieldMask,e,this.fieldTransforms):new Jn(t,this.data,e,this.fieldTransforms)}}function Fl(n){switch(n){case 0:case 2:case 1:return!0;case 3:case 4:return!1;default:throw F(40011,{Ec:n})}}class eo{constructor(t,e,r,s,o,a){this.settings=t,this.databaseId=e,this.serializer=r,this.ignoreUndefinedProperties=s,o===void 0&&this.Ac(),this.fieldTransforms=o||[],this.fieldMask=a||[]}get path(){return this.settings.path}get Ec(){return this.settings.Ec}Rc(t){return new eo(Object.assign(Object.assign({},this.settings),t),this.databaseId,this.serializer,this.ignoreUndefinedProperties,this.fieldTransforms,this.fieldMask)}Vc(t){var e;const r=(e=this.path)===null||e===void 0?void 0:e.child(t),s=this.Rc({path:r,mc:!1});return s.fc(t),s}gc(t){var e;const r=(e=this.path)===null||e===void 0?void 0:e.child(t),s=this.Rc({path:r,mc:!1});return s.Ac(),s}yc(t){return this.Rc({path:void 0,mc:!0})}wc(t){return Wr(t,this.settings.methodName,this.settings.Sc||!1,this.path,this.settings.bc)}contains(t){return this.fieldMask.find(e=>t.isPrefixOf(e))!==void 0||this.fieldTransforms.find(e=>t.isPrefixOf(e.field))!==void 0}Ac(){if(this.path)for(let t=0;t<this.path.length;t++)this.fc(this.path.get(t))}fc(t){if(t.length===0)throw this.wc("Document fields must not be empty");if(Fl(this.Ec)&&c_.test(t))throw this.wc('Document fields cannot begin and end with "__"')}}class h_{constructor(t,e,r){this.databaseId=t,this.ignoreUndefinedProperties=e,this.serializer=r||us(t)}Dc(t,e,r,s=!1){return new eo({Ec:t,methodName:e,bc:r,path:yt.emptyPath(),mc:!1,Sc:s},this.databaseId,this.serializer,this.ignoreUndefinedProperties)}}function no(n){const t=n._freezeSettings(),e=us(n._databaseId);return new h_(n._databaseId,!!t.ignoreUndefinedProperties,e)}function Ul(n,t,e,r,s,o={}){const a=n.Dc(o.merge||o.mergeFields?2:0,t,e,s);ql("Data must be an object, but it was:",a,r);const c=Bl(r,a);let h,d;if(o.merge)h=new Mt(a.fieldMask),d=a.fieldTransforms;else if(o.mergeFields){const p=[];for(const y of o.mergeFields){const v=f_(t,y,e);if(!a.contains(v))throw new N(b.INVALID_ARGUMENT,`Field '${v}' is specified in your field mask but missing from your input data.`);m_(p,v)||p.push(v)}h=new Mt(p),d=a.fieldTransforms.filter(y=>h.covers(y.field))}else h=null,d=a.fieldTransforms;return new l_(new Nt(c),h,d)}class ro extends to{_toFieldTransform(t){return new sm(t.path,new Hn)}isEqual(t){return t instanceof ro}}function d_(n,t,e,r=!1){return so(e,n.Dc(r?4:3,t))}function so(n,t){if(jl(n=de(n)))return ql("Unsupported field value:",t,n),Bl(n,t);if(n instanceof to)return function(r,s){if(!Fl(s.Ec))throw s.wc(`${r._methodName}() can only be used with update() and set()`);if(!s.path)throw s.wc(`${r._methodName}() is not currently supported inside arrays`);const o=r._toFieldTransform(s);o&&s.fieldTransforms.push(o)}(n,t),null;if(n===void 0&&t.ignoreUndefinedProperties)return null;if(t.path&&t.fieldMask.push(t.path),n instanceof Array){if(t.settings.mc&&t.Ec!==4)throw t.wc("Nested arrays are not supported");return function(r,s){const o=[];let a=0;for(const c of r){let h=so(c,s.yc(a));h==null&&(h={nullValue:"NULL_VALUE"}),o.push(h),a++}return{arrayValue:{values:o}}}(n,t)}return function(r,s){if((r=de(r))===null)return{nullValue:"NULL_VALUE"};if(typeof r=="number")return em(s.serializer,r);if(typeof r=="boolean")return{booleanValue:r};if(typeof r=="string")return{stringValue:r};if(r instanceof Date){const o=nt.fromDate(r);return{timestampValue:$r(s.serializer,o)}}if(r instanceof nt){const o=new nt(r.seconds,1e3*Math.floor(r.nanoseconds/1e3));return{timestampValue:$r(s.serializer,o)}}if(r instanceof qt)return{geoPointValue:{latitude:r.latitude,longitude:r.longitude}};if(r instanceof Ot)return{bytesValue:rl(s.serializer,r._byteString)};if(r instanceof dt){const o=s.databaseId,a=r.firestore._databaseId;if(!a.isEqual(o))throw s.wc(`Document reference is for database ${a.projectId}/${a.database} but should be for database ${o.projectId}/${o.database}`);return{referenceValue:Fi(r.firestore._databaseId||s.databaseId,r._key.path)}}if(r instanceof $t)return function(a,c){return{mapValue:{fields:{[Dc]:{stringValue:kc},[Fr]:{arrayValue:{values:a.toArray().map(d=>{if(typeof d!="number")throw c.wc("VectorValues must only contain numeric values.");return xi(c.serializer,d)})}}}}}}(r,s);throw s.wc(`Unsupported field value: ${Zr(r)}`)}(n,t)}function Bl(n,t){const e={};return Sc(n)?t.path&&t.path.length>0&&t.fieldMask.push(t.path):Fe(n,(r,s)=>{const o=so(s,t.Vc(r));o!=null&&(e[r]=o)}),{mapValue:{fields:e}}}function jl(n){return!(typeof n!="object"||n===null||n instanceof Array||n instanceof Date||n instanceof nt||n instanceof qt||n instanceof Ot||n instanceof dt||n instanceof to||n instanceof $t)}function ql(n,t,e){if(!jl(e)||!wc(e)){const r=Zr(e);throw r==="an object"?t.wc(n+" a custom object"):t.wc(n+" "+r)}}function f_(n,t,e){if((t=de(t))instanceof Zi)return t._internalPath;if(typeof t=="string")return $l(n,t);throw Wr("Field path arguments must be of type string or ",n,!1,void 0,e)}const p_=new RegExp("[~\\*/\\[\\]]");function $l(n,t,e){if(t.search(p_)>=0)throw Wr(`Invalid field path (${t}). Paths must not contain '~', '*', '/', '[', or ']'`,n,!1,void 0,e);try{return new Zi(...t.split("."))._internalPath}catch{throw Wr(`Invalid field path (${t}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n,!1,void 0,e)}}function Wr(n,t,e,r,s){const o=r&&!r.isEmpty(),a=s!==void 0;let c=`Function ${t}() called with invalid data`;e&&(c+=" (via `toFirestore()`)"),c+=". ";let h="";return(o||a)&&(h+=" (found",o&&(h+=` in field ${r}`),a&&(h+=` in document ${s}`),h+=")"),new N(b.INVALID_ARGUMENT,c+n+h)}function m_(n,t){return n.some(e=>e.isEqual(t))}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class zl{constructor(t,e,r,s,o){this._firestore=t,this._userDataWriter=e,this._key=r,this._document=s,this._converter=o}get id(){return this._key.path.lastSegment()}get ref(){return new dt(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const t=new g_(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(t)}return this._userDataWriter.convertValue(this._document.data.value)}}get(t){if(this._document){const e=this._document.data.field(Gl("DocumentSnapshot.get",t));if(e!==null)return this._userDataWriter.convertValue(e)}}}class g_ extends zl{data(){return super.data()}}function Gl(n,t){return typeof t=="string"?$l(n,t):t instanceof Zi?t._internalPath:t._delegate._internalPath}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function __(n){if(n.limitType==="L"&&n.explicitOrderBy.length===0)throw new N(b.UNIMPLEMENTED,"limitToLast() queries require specifying at least one orderBy() clause")}class io{}class Hl extends io{}function Vv(n,t,...e){let r=[];t instanceof io&&r.push(t),r=r.concat(e),function(o){const a=o.filter(h=>h instanceof ao).length,c=o.filter(h=>h instanceof oo).length;if(a>1||a>0&&c>0)throw new N(b.INVALID_ARGUMENT,"InvalidQuery. When using composite filters, you cannot use more than one filter at the top level. Consider nesting the multiple filters within an `and(...)` statement. For example: change `query(query, where(...), or(...))` to `query(query, and(where(...), or(...)))`.")}(r);for(const s of r)n=s._apply(n);return n}class oo extends Hl{constructor(t,e,r){super(),this._field=t,this._op=e,this._value=r,this.type="where"}static _create(t,e,r){return new oo(t,e,r)}_apply(t){const e=this._parse(t);return Wl(t._query,e),new qe(t.firestore,t.converter,ui(t._query,e))}_parse(t){const e=no(t.firestore);return function(o,a,c,h,d,p,y){let v;if(d.isKeyField()){if(p==="array-contains"||p==="array-contains-any")throw new N(b.INVALID_ARGUMENT,`Invalid Query. You can't perform '${p}' queries on documentId().`);if(p==="in"||p==="not-in"){xu(y,p);const V=[];for(const k of y)V.push(Ou(h,o,k));v={arrayValue:{values:V}}}else v=Ou(h,o,y)}else p!=="in"&&p!=="not-in"&&p!=="array-contains-any"||xu(y,p),v=d_(c,a,y,p==="in"||p==="not-in");return lt.create(d,p,v)}(t._query,"where",e,t.firestore._databaseId,this._field,this._op,this._value)}}class ao extends io{constructor(t,e){super(),this.type=t,this._queryConstraints=e}static _create(t,e){return new ao(t,e)}_parse(t){const e=this._queryConstraints.map(r=>r._parse(t)).filter(r=>r.getFilters().length>0);return e.length===1?e[0]:Lt.create(e,this._getOperator())}_apply(t){const e=this._parse(t);return e.getFilters().length===0?t:(function(s,o){let a=s;const c=o.getFlattenedFilters();for(const h of c)Wl(a,h),a=ui(a,h)}(t._query,e),new qe(t.firestore,t.converter,ui(t._query,e)))}_getQueryConstraints(){return this._queryConstraints}_getOperator(){return this.type==="and"?"and":"or"}}class uo extends Hl{constructor(t,e,r){super(),this.type=t,this._limit=e,this._limitType=r}static _create(t,e,r){return new uo(t,e,r)}_apply(t){return new qe(t.firestore,t.converter,jr(t._query,this._limit,this._limitType))}}function Dv(n){return Tp("limit",n),uo._create("limit",n,"F")}function Ou(n,t,e){if(typeof(e=de(e))=="string"){if(e==="")throw new N(b.INVALID_ARGUMENT,"Invalid query. When querying with documentId(), you must provide a valid document ID, but it was an empty string.");if(!Bc(t)&&e.indexOf("/")!==-1)throw new N(b.INVALID_ARGUMENT,`Invalid query. When querying a collection by documentId(), you must provide a plain document ID, but '${e}' contains a '/' character.`);const r=t.path.child(tt.fromString(e));if(!M.isDocumentKey(r))throw new N(b.INVALID_ARGUMENT,`Invalid query. When querying a collection group by documentId(), the value provided must result in a valid document path, but '${r}' is not because it has an odd number of segments (${r.length}).`);return Ya(n,new M(r))}if(e instanceof dt)return Ya(n,e._key);throw new N(b.INVALID_ARGUMENT,`Invalid query. When querying with documentId(), you must provide a valid string or a DocumentReference, but it was: ${Zr(e)}.`)}function xu(n,t){if(!Array.isArray(n)||n.length===0)throw new N(b.INVALID_ARGUMENT,`Invalid Query. A non-empty array is required for '${t.toString()}' filters.`)}function Wl(n,t){const e=function(s,o){for(const a of s)for(const c of a.getFlattenedFilters())if(o.indexOf(c.op)>=0)return c.op;return null}(n.filters,function(s){switch(s){case"!=":return["!=","not-in"];case"array-contains-any":case"in":return["not-in"];case"not-in":return["array-contains-any","in","not-in","!="];default:return[]}}(t.op));if(e!==null)throw e===t.op?new N(b.INVALID_ARGUMENT,`Invalid query. You cannot use more than one '${t.op.toString()}' filter.`):new N(b.INVALID_ARGUMENT,`Invalid query. You cannot use '${t.op.toString()}' filters with '${e.toString()}' filters.`)}class y_{convertValue(t,e="none"){switch(ve(t)){case 0:return null;case 1:return t.booleanValue;case 2:return ut(t.integerValue||t.doubleValue);case 3:return this.convertTimestamp(t.timestampValue);case 4:return this.convertServerTimestamp(t,e);case 5:return t.stringValue;case 6:return this.convertBytes(ye(t.bytesValue));case 7:return this.convertReference(t.referenceValue);case 8:return this.convertGeoPoint(t.geoPointValue);case 9:return this.convertArray(t.arrayValue,e);case 11:return this.convertObject(t.mapValue,e);case 10:return this.convertVectorValue(t.mapValue);default:throw F(62114,{value:t})}}convertObject(t,e){return this.convertObjectMap(t.fields,e)}convertObjectMap(t,e="none"){const r={};return Fe(t,(s,o)=>{r[s]=this.convertValue(o,e)}),r}convertVectorValue(t){var e,r,s;const o=(s=(r=(e=t.fields)===null||e===void 0?void 0:e[Fr].arrayValue)===null||r===void 0?void 0:r.values)===null||s===void 0?void 0:s.map(a=>ut(a.doubleValue));return new $t(o)}convertGeoPoint(t){return new qt(ut(t.latitude),ut(t.longitude))}convertArray(t,e){return(t.values||[]).map(r=>this.convertValue(r,e))}convertServerTimestamp(t,e){switch(e){case"previous":const r=ns(t);return r==null?null:this.convertValue(r,e);case"estimate":return this.convertTimestamp($n(t));default:return null}}convertTimestamp(t){const e=_e(t);return new nt(e.seconds,e.nanos)}convertDocumentKey(t,e){const r=tt.fromString(t);X(cl(r),9688,{name:t});const s=new zn(r.get(1),r.get(3)),o=new M(r.popFirst(5));return s.isEqual(e)||ne(`Document ${o} contains a document reference within a different database (${s.projectId}/${s.database}) which is not supported. It will be treated as a reference in the current database (${e.projectId}/${e.database}) instead.`),o}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function Kl(n,t,e){let r;return r=n?e&&(e.merge||e.mergeFields)?n.toFirestore(t,e):n.toFirestore(t):t,r}class Vn{constructor(t,e){this.hasPendingWrites=t,this.fromCache=e}isEqual(t){return this.hasPendingWrites===t.hasPendingWrites&&this.fromCache===t.fromCache}}class ke extends zl{constructor(t,e,r,s,o,a){super(t,e,r,s,a),this._firestore=t,this._firestoreImpl=t,this.metadata=o}exists(){return super.exists()}data(t={}){if(this._document){if(this._converter){const e=new kr(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(e,t)}return this._userDataWriter.convertValue(this._document.data.value,t.serverTimestamps)}}get(t,e={}){if(this._document){const r=this._document.data.field(Gl("DocumentSnapshot.get",t));if(r!==null)return this._userDataWriter.convertValue(r,e.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new N(b.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t=this._document,e={};return e.type=ke._jsonSchemaVersion,e.bundle="",e.bundleSource="DocumentSnapshot",e.bundleName=this._key.toString(),!t||!t.isValidDocument()||!t.isFoundDocument()?e:(this._userDataWriter.convertObjectMap(t.data.value.mapValue.fields,"previous"),e.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),e)}}ke._jsonSchemaVersion="firestore/documentSnapshot/1.0",ke._jsonSchema={type:ht("string",ke._jsonSchemaVersion),bundleSource:ht("string","DocumentSnapshot"),bundleName:ht("string"),bundle:ht("string")};class kr extends ke{data(t={}){return super.data(t)}}class tn{constructor(t,e,r,s){this._firestore=t,this._userDataWriter=e,this._snapshot=s,this.metadata=new Vn(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const t=[];return this.forEach(e=>t.push(e)),t}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(t,e){this._snapshot.docs.forEach(r=>{t.call(e,new kr(this._firestore,this._userDataWriter,r.key,r,new Vn(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))})}docChanges(t={}){const e=!!t.includeMetadataChanges;if(e&&this._snapshot.excludesMetadataChanges)throw new N(b.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===e||(this._cachedChanges=function(s,o){if(s._snapshot.oldDocs.isEmpty()){let a=0;return s._snapshot.docChanges.map(c=>{const h=new kr(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Vn(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);return c.doc,{type:"added",doc:h,oldIndex:-1,newIndex:a++}})}{let a=s._snapshot.oldDocs;return s._snapshot.docChanges.filter(c=>o||c.type!==3).map(c=>{const h=new kr(s._firestore,s._userDataWriter,c.doc.key,c.doc,new Vn(s._snapshot.mutatedKeys.has(c.doc.key),s._snapshot.fromCache),s.query.converter);let d=-1,p=-1;return c.type!==0&&(d=a.indexOf(c.doc.key),a=a.delete(c.doc.key)),c.type!==1&&(a=a.add(c.doc),p=a.indexOf(c.doc.key)),{type:v_(c.type),doc:h,oldIndex:d,newIndex:p}})}}(this,e),this._cachedChangesIncludeMetadataChanges=e),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new N(b.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const t={};t.type=tn._jsonSchemaVersion,t.bundleSource="QuerySnapshot",t.bundleName=Pi.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const e=[],r=[],s=[];return this.docs.forEach(o=>{o._document!==null&&(e.push(o._document),r.push(this._userDataWriter.convertObjectMap(o._document.data.value.mapValue.fields,"previous")),s.push(o.ref.path))}),t.bundle=(this._firestore,this.query._query,t.bundleName,"NOT SUPPORTED"),t}}function v_(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return F(61501,{type:n})}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function kv(n){n=me(n,dt);const t=me(n.firestore,nr);return s_(Ji(t),n._key).then(e=>E_(t,n,e))}tn._jsonSchemaVersion="firestore/querySnapshot/1.0",tn._jsonSchema={type:ht("string",tn._jsonSchemaVersion),bundleSource:ht("string","QuerySnapshot"),bundleName:ht("string"),bundle:ht("string")};class Ql extends y_{constructor(t){super(),this.firestore=t}convertBytes(t){return new Ot(t)}convertReference(t){const e=this.convertDocumentKey(t,this.firestore._databaseId);return new dt(this.firestore,null,e)}}function Nv(n){n=me(n,qe);const t=me(n.firestore,nr),e=Ji(t),r=new Ql(t);return __(n._query),i_(e,n._query).then(s=>new tn(t,r,n,s))}function Ov(n,t,e){n=me(n,dt);const r=me(n.firestore,nr),s=Kl(n.converter,t,e);return Xl(r,[Ul(no(r),"setDoc",n._key,s,n.converter!==null,e).toMutation(n._key,Bt.none())])}function xv(n,t){const e=me(n.firestore,nr),r=a_(n),s=Kl(n.converter,t);return Xl(e,[Ul(no(n.firestore),"addDoc",r._key,s,n.converter!==null,{}).toMutation(r._key,Bt.exists(!1))]).then(()=>r)}function Xl(n,t){return function(r,s){const o=new Zt;return r.asyncQueue.enqueueAndForget(async()=>Hg(await r_(r),s,o)),o.promise}(Ji(n),t)}function E_(n,t,e){const r=e.docs.get(t._key),s=new Ql(n);return new ke(n,s,t._key,r,new Vn(e.hasPendingWrites,e.fromCache),t.converter)}function Mv(){return new ro("serverTimestamp")}(function(t,e=!0){(function(s){cn=s})(Zf),fe(new te("firestore",(r,{instanceIdentifier:s,options:o})=>{const a=r.getProvider("app").getImmediate(),c=new nr(new fp(r.getProvider("auth-internal")),new gp(a,r.getProvider("app-check-internal")),function(d,p){if(!Object.prototype.hasOwnProperty.apply(d.options,["projectId"]))throw new N(b.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new zn(d.options.projectId,p)}(a,s),a);return o=Object.assign({useFetchStreams:e},o),c._setSettings(o),c},"PUBLIC").setMultipleInstances(!0)),Jt(La,Fa,t),Jt(La,Fa,"esm2017")})();const Yl="@firebase/installations",co="0.6.18";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Jl=1e4,Zl=`w:${co}`,th="FIS_v2",T_="https://firebaseinstallations.googleapis.com/v1",I_=60*60*1e3,w_="installations",A_="Installations";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const S_={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},xe=new Jr(w_,A_,S_);function eh(n){return n instanceof we&&n.code.includes("request-failed")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function nh({projectId:n}){return`${T_}/projects/${n}/installations`}function rh(n){return{token:n.token,requestStatus:2,expiresIn:b_(n.expiresIn),creationTime:Date.now()}}async function sh(n,t){const r=(await t.json()).error;return xe.create("request-failed",{requestName:n,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function ih({apiKey:n}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n})}function R_(n,{refreshToken:t}){const e=ih(n);return e.append("Authorization",P_(t)),e}async function oh(n){const t=await n();return t.status>=500&&t.status<600?n():t}function b_(n){return Number(n.replace("s","000"))}function P_(n){return`${th} ${n}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function C_({appConfig:n,heartbeatServiceProvider:t},{fid:e}){const r=nh(n),s=ih(n),o=t.getImmediate({optional:!0});if(o){const d=await o.getHeartbeatsHeader();d&&s.append("x-firebase-client",d)}const a={fid:e,authVersion:th,appId:n.appId,sdkVersion:Zl},c={method:"POST",headers:s,body:JSON.stringify(a)},h=await oh(()=>fetch(r,c));if(h.ok){const d=await h.json();return{fid:d.fid||e,registrationStatus:2,refreshToken:d.refreshToken,authToken:rh(d.authToken)}}else throw await sh("Create Installation",h)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ah(n){return new Promise(t=>{setTimeout(t,n)})}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function V_(n){return btoa(String.fromCharCode(...n)).replace(/\+/g,"-").replace(/\//g,"_")}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const D_=/^[cdef][\w-]{21}$/,yi="";function k_(){try{const n=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(n),n[0]=112+n[0]%16;const e=N_(n);return D_.test(e)?e:yi}catch{return yi}}function N_(n){return V_(n).substr(0,22)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ds(n){return`${n.appName}!${n.appId}`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const uh=new Map;function ch(n,t){const e=ds(n);lh(e,t),O_(e,t)}function lh(n,t){const e=uh.get(n);if(e)for(const r of e)r(t)}function O_(n,t){const e=x_();e&&e.postMessage({key:n,fid:t}),M_()}let De=null;function x_(){return!De&&"BroadcastChannel"in self&&(De=new BroadcastChannel("[Firebase] FID Change"),De.onmessage=n=>{lh(n.data.key,n.data.fid)}),De}function M_(){uh.size===0&&De&&(De.close(),De=null)}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const L_="firebase-installations-database",F_=1,Me="firebase-installations-store";let Ws=null;function lo(){return Ws||(Ws=cc(L_,F_,{upgrade:(n,t)=>{switch(t){case 0:n.createObjectStore(Me)}}})),Ws}async function Kr(n,t){const e=ds(n),s=(await lo()).transaction(Me,"readwrite"),o=s.objectStore(Me),a=await o.get(e);return await o.put(t,e),await s.done,(!a||a.fid!==t.fid)&&ch(n,t.fid),t}async function hh(n){const t=ds(n),r=(await lo()).transaction(Me,"readwrite");await r.objectStore(Me).delete(t),await r.done}async function fs(n,t){const e=ds(n),s=(await lo()).transaction(Me,"readwrite"),o=s.objectStore(Me),a=await o.get(e),c=t(a);return c===void 0?await o.delete(e):await o.put(c,e),await s.done,c&&(!a||a.fid!==c.fid)&&ch(n,c.fid),c}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function ho(n){let t;const e=await fs(n.appConfig,r=>{const s=U_(r),o=B_(n,s);return t=o.registrationPromise,o.installationEntry});return e.fid===yi?{installationEntry:await t}:{installationEntry:e,registrationPromise:t}}function U_(n){const t=n||{fid:k_(),registrationStatus:0};return dh(t)}function B_(n,t){if(t.registrationStatus===0){if(!navigator.onLine){const s=Promise.reject(xe.create("app-offline"));return{installationEntry:t,registrationPromise:s}}const e={fid:t.fid,registrationStatus:1,registrationTime:Date.now()},r=j_(n,e);return{installationEntry:e,registrationPromise:r}}else return t.registrationStatus===1?{installationEntry:t,registrationPromise:q_(n)}:{installationEntry:t}}async function j_(n,t){try{const e=await C_(n,t);return Kr(n.appConfig,e)}catch(e){throw eh(e)&&e.customData.serverCode===409?await hh(n.appConfig):await Kr(n.appConfig,{fid:t.fid,registrationStatus:0}),e}}async function q_(n){let t=await Mu(n.appConfig);for(;t.registrationStatus===1;)await ah(100),t=await Mu(n.appConfig);if(t.registrationStatus===0){const{installationEntry:e,registrationPromise:r}=await ho(n);return r||e}return t}function Mu(n){return fs(n,t=>{if(!t)throw xe.create("installation-not-found");return dh(t)})}function dh(n){return $_(n)?{fid:n.fid,registrationStatus:0}:n}function $_(n){return n.registrationStatus===1&&n.registrationTime+Jl<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function z_({appConfig:n,heartbeatServiceProvider:t},e){const r=G_(n,e),s=R_(n,e),o=t.getImmediate({optional:!0});if(o){const d=await o.getHeartbeatsHeader();d&&s.append("x-firebase-client",d)}const a={installation:{sdkVersion:Zl,appId:n.appId}},c={method:"POST",headers:s,body:JSON.stringify(a)},h=await oh(()=>fetch(r,c));if(h.ok){const d=await h.json();return rh(d)}else throw await sh("Generate Auth Token",h)}function G_(n,{fid:t}){return`${nh(n)}/${t}/authTokens:generate`}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function fo(n,t=!1){let e;const r=await fs(n.appConfig,o=>{if(!fh(o))throw xe.create("not-registered");const a=o.authToken;if(!t&&K_(a))return o;if(a.requestStatus===1)return e=H_(n,t),o;{if(!navigator.onLine)throw xe.create("app-offline");const c=X_(o);return e=W_(n,c),c}});return e?await e:r.authToken}async function H_(n,t){let e=await Lu(n.appConfig);for(;e.authToken.requestStatus===1;)await ah(100),e=await Lu(n.appConfig);const r=e.authToken;return r.requestStatus===0?fo(n,t):r}function Lu(n){return fs(n,t=>{if(!fh(t))throw xe.create("not-registered");const e=t.authToken;return Y_(e)?Object.assign(Object.assign({},t),{authToken:{requestStatus:0}}):t})}async function W_(n,t){try{const e=await z_(n,t),r=Object.assign(Object.assign({},t),{authToken:e});return await Kr(n.appConfig,r),e}catch(e){if(eh(e)&&(e.customData.serverCode===401||e.customData.serverCode===404))await hh(n.appConfig);else{const r=Object.assign(Object.assign({},t),{authToken:{requestStatus:0}});await Kr(n.appConfig,r)}throw e}}function fh(n){return n!==void 0&&n.registrationStatus===2}function K_(n){return n.requestStatus===2&&!Q_(n)}function Q_(n){const t=Date.now();return t<n.creationTime||n.creationTime+n.expiresIn<t+I_}function X_(n){const t={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},n),{authToken:t})}function Y_(n){return n.requestStatus===1&&n.requestTime+Jl<Date.now()}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function J_(n){const t=n,{installationEntry:e,registrationPromise:r}=await ho(t);return r?r.catch(console.error):fo(t).catch(console.error),e.fid}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Z_(n,t=!1){const e=n;return await ty(e),(await fo(e,t)).token}async function ty(n){const{registrationPromise:t}=await ho(n);t&&await t}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function ey(n){if(!n||!n.options)throw Ks("App Configuration");if(!n.name)throw Ks("App Name");const t=["projectId","apiKey","appId"];for(const e of t)if(!n.options[e])throw Ks(e);return{appName:n.name,projectId:n.options.projectId,apiKey:n.options.apiKey,appId:n.options.appId}}function Ks(n){return xe.create("missing-app-config-values",{valueName:n})}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ph="installations",ny="installations-internal",ry=n=>{const t=n.getProvider("app").getImmediate(),e=ey(t),r=Qn(t,"heartbeat");return{app:t,appConfig:e,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},sy=n=>{const t=n.getProvider("app").getImmediate(),e=Qn(t,ph).getImmediate();return{getId:()=>J_(e),getToken:s=>Z_(e,s)}};function iy(){fe(new te(ph,ry,"PUBLIC")),fe(new te(ny,sy,"PRIVATE"))}iy();Jt(Yl,co);Jt(Yl,co,"esm2017");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Qr="analytics",oy="firebase_id",ay="origin",uy=60*1e3,cy="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",po="https://www.googletagmanager.com/gtag/js";/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ct=new Si("@firebase/analytics");/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const ly={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},Dt=new Jr("analytics","Analytics",ly);/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function hy(n){if(!n.startsWith(po)){const t=Dt.create("invalid-gtag-resource",{gtagURL:n});return Ct.warn(t.message),""}return n}function mh(n){return Promise.all(n.map(t=>t.catch(e=>e)))}function dy(n,t){let e;return window.trustedTypes&&(e=window.trustedTypes.createPolicy(n,t)),e}function fy(n,t){const e=dy("firebase-js-sdk-policy",{createScriptURL:hy}),r=document.createElement("script"),s=`${po}?l=${n}&id=${t}`;r.src=e?e==null?void 0:e.createScriptURL(s):s,r.async=!0,document.head.appendChild(r)}function py(n){let t=[];return Array.isArray(window[n])?t=window[n]:window[n]=t,t}async function my(n,t,e,r,s,o){const a=r[s];try{if(a)await t[a];else{const h=(await mh(e)).find(d=>d.measurementId===s);h&&await t[h.appId]}}catch(c){Ct.error(c)}n("config",s,o)}async function gy(n,t,e,r,s){try{let o=[];if(s&&s.send_to){let a=s.send_to;Array.isArray(a)||(a=[a]);const c=await mh(e);for(const h of a){const d=c.find(y=>y.measurementId===h),p=d&&t[d.appId];if(p)o.push(p);else{o=[];break}}}o.length===0&&(o=Object.values(t)),await Promise.all(o),n("event",r,s||{})}catch(o){Ct.error(o)}}function _y(n,t,e,r){async function s(o,...a){try{if(o==="event"){const[c,h]=a;await gy(n,t,e,c,h)}else if(o==="config"){const[c,h]=a;await my(n,t,e,r,c,h)}else if(o==="consent"){const[c,h]=a;n("consent",c,h)}else if(o==="get"){const[c,h,d]=a;n("get",c,h,d)}else if(o==="set"){const[c]=a;n("set",c)}else n(o,...a)}catch(c){Ct.error(c)}}return s}function yy(n,t,e,r,s){let o=function(...a){window[r].push(arguments)};return window[s]&&typeof window[s]=="function"&&(o=window[s]),window[s]=_y(o,n,t,e),{gtagCore:o,wrappedGtag:window[s]}}function vy(n){const t=window.document.getElementsByTagName("script");for(const e of Object.values(t))if(e.src&&e.src.includes(po)&&e.src.includes(n))return e;return null}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const Ey=30,Ty=1e3;class Iy{constructor(t={},e=Ty){this.throttleMetadata=t,this.intervalMillis=e}getThrottleMetadata(t){return this.throttleMetadata[t]}setThrottleMetadata(t,e){this.throttleMetadata[t]=e}deleteThrottleMetadata(t){delete this.throttleMetadata[t]}}const gh=new Iy;function wy(n){return new Headers({Accept:"application/json","x-goog-api-key":n})}async function Ay(n){var t;const{appId:e,apiKey:r}=n,s={method:"GET",headers:wy(r)},o=cy.replace("{app-id}",e),a=await fetch(o,s);if(a.status!==200&&a.status!==304){let c="";try{const h=await a.json();!((t=h.error)===null||t===void 0)&&t.message&&(c=h.error.message)}catch{}throw Dt.create("config-fetch-failed",{httpStatus:a.status,responseMessage:c})}return a.json()}async function Sy(n,t=gh,e){const{appId:r,apiKey:s,measurementId:o}=n.options;if(!r)throw Dt.create("no-app-id");if(!s){if(o)return{measurementId:o,appId:r};throw Dt.create("no-api-key")}const a=t.getThrottleMetadata(r)||{backoffCount:0,throttleEndTimeMillis:Date.now()},c=new Py;return setTimeout(async()=>{c.abort()},uy),_h({appId:r,apiKey:s,measurementId:o},a,c,t)}async function _h(n,{throttleEndTimeMillis:t,backoffCount:e},r,s=gh){var o;const{appId:a,measurementId:c}=n;try{await Ry(r,t)}catch(h){if(c)return Ct.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${c} provided in the "measurementId" field in the local Firebase config. [${h==null?void 0:h.message}]`),{appId:a,measurementId:c};throw h}try{const h=await Ay(n);return s.deleteThrottleMetadata(a),h}catch(h){const d=h;if(!by(d)){if(s.deleteThrottleMetadata(a),c)return Ct.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${c} provided in the "measurementId" field in the local Firebase config. [${d==null?void 0:d.message}]`),{appId:a,measurementId:c};throw h}const p=Number((o=d==null?void 0:d.customData)===null||o===void 0?void 0:o.httpStatus)===503?ba(e,s.intervalMillis,Ey):ba(e,s.intervalMillis),y={throttleEndTimeMillis:Date.now()+p,backoffCount:e+1};return s.setThrottleMetadata(a,y),Ct.debug(`Calling attemptFetch again in ${p} millis`),_h(n,y,r,s)}}function Ry(n,t){return new Promise((e,r)=>{const s=Math.max(t-Date.now(),0),o=setTimeout(e,s);n.addEventListener(()=>{clearTimeout(o),r(Dt.create("fetch-throttle",{throttleEndTimeMillis:t}))})})}function by(n){if(!(n instanceof we)||!n.customData)return!1;const t=Number(n.customData.httpStatus);return t===429||t===500||t===503||t===504}class Py{constructor(){this.listeners=[]}addEventListener(t){this.listeners.push(t)}abort(){this.listeners.forEach(t=>t())}}async function Cy(n,t,e,r,s){if(s&&s.global){n("event",e,r);return}else{const o=await t,a=Object.assign(Object.assign({},r),{send_to:o});n("event",e,a)}}/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function Vy(){if(wi())try{await Ai()}catch(n){return Ct.warn(Dt.create("indexeddb-unavailable",{errorInfo:n==null?void 0:n.toString()}).message),!1}else return Ct.warn(Dt.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function Dy(n,t,e,r,s,o,a){var c;const h=Sy(n);h.then(R=>{e[R.measurementId]=R.appId,n.options.measurementId&&R.measurementId!==n.options.measurementId&&Ct.warn(`The measurement ID in the local Firebase config (${n.options.measurementId}) does not match the measurement ID fetched from the server (${R.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(R=>Ct.error(R)),t.push(h);const d=Vy().then(R=>{if(R)return r.getId()}),[p,y]=await Promise.all([h,d]);vy(o)||fy(o,p.measurementId),s("js",new Date);const v=(c=a==null?void 0:a.config)!==null&&c!==void 0?c:{};return v[ay]="firebase",v.update=!0,y!=null&&(v[oy]=y),s("config",p.measurementId,v),p.measurementId}/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class ky{constructor(t){this.app=t}_delete(){return delete Mn[this.app.options.appId],Promise.resolve()}}let Mn={},Fu=[];const Uu={};let Qs="dataLayer",Ny="gtag",Bu,yh,ju=!1;function Oy(){const n=[];if(ic()&&n.push("This is a browser extension environment."),oc()||n.push("Cookies are not available."),n.length>0){const t=n.map((r,s)=>`(${s+1}) ${r}`).join(" "),e=Dt.create("invalid-analytics-context",{errorInfo:t});Ct.warn(e.message)}}function xy(n,t,e){Oy();const r=n.options.appId;if(!r)throw Dt.create("no-app-id");if(!n.options.apiKey)if(n.options.measurementId)Ct.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${n.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw Dt.create("no-api-key");if(Mn[r]!=null)throw Dt.create("already-exists",{id:r});if(!ju){py(Qs);const{wrappedGtag:o,gtagCore:a}=yy(Mn,Fu,Uu,Qs,Ny);yh=o,Bu=a,ju=!0}return Mn[r]=Dy(n,Fu,Uu,t,Bu,Qs,e),new ky(n)}function Lv(n=lc()){n=de(n);const t=Qn(n,Qr);return t.isInitialized()?t.getImmediate():My(n)}function My(n,t={}){const e=Qn(n,Qr);if(e.isInitialized()){const s=e.getImmediate();if(Bn(t,e.getOptions()))return s;throw Dt.create("already-initialized")}return e.initialize({options:t})}async function Fv(){if(ic()||!oc()||!wi())return!1;try{return await Ai()}catch{return!1}}function Ly(n,t,e,r){n=de(n),Cy(yh,Mn[n.app.options.appId],t,e,r).catch(s=>Ct.error(s))}const qu="@firebase/analytics",$u="0.10.17";function Fy(){fe(new te(Qr,(t,{options:e})=>{const r=t.getProvider("app").getImmediate(),s=t.getProvider("installations-internal").getImmediate();return xy(r,s,e)},"PUBLIC")),fe(new te("analytics-internal",n,"PRIVATE")),Jt(qu,$u),Jt(qu,$u,"esm2017");function n(t){try{const e=t.getProvider(Qr).getImmediate();return{logEvent:(r,s,o)=>Ly(e,r,s,o)}}catch(e){throw Dt.create("interop-component-reg-failed",{reason:e})}}}Fy();const en=typeof __SENTRY_DEBUG__>"u"||__SENTRY_DEBUG__,Ie=globalThis,Ln="9.47.1";function mo(){return go(Ie),Ie}function go(n){const t=n.__SENTRY__=n.__SENTRY__||{};return t.version=t.version||Ln,t[Ln]=t[Ln]||{}}function _o(n,t,e=Ie){const r=e.__SENTRY__=e.__SENTRY__||{},s=r[Ln]=r[Ln]||{};return s[n]||(s[n]=t())}const Uy="Sentry Logger ",zu={};function By(n){if(!("console"in Ie))return n();const t=Ie.console,e={},r=Object.keys(zu);r.forEach(s=>{const o=zu[s];e[s]=t[s],t[s]=o});try{return n()}finally{r.forEach(s=>{t[s]=e[s]})}}function jy(){vo().enabled=!0}function qy(){vo().enabled=!1}function vh(){return vo().enabled}function $y(...n){yo("log",...n)}function zy(...n){yo("warn",...n)}function Gy(...n){yo("error",...n)}function yo(n,...t){en&&vh()&&By(()=>{Ie.console[n](`${Uy}[${n}]:`,...t)})}function vo(){return en?_o("loggerSettings",()=>({enabled:!1})):{enabled:!1}}const Nr={enable:jy,disable:qy,isEnabled:vh,log:$y,warn:zy,error:Gy},Hy=Object.prototype.toString;function Wy(n,t){return Hy.call(n)===`[object ${t}]`}function Ky(n){return Wy(n,"Object")}function Qy(n){return!!(n!=null&&n.then&&typeof n.then=="function")}function Xy(n,t=0){return typeof n!="string"||t===0||n.length<=t?n:`${n.slice(0,t)}...`}function Yy(n,t,e){try{Object.defineProperty(n,t,{value:e,writable:!0,configurable:!0})}catch{en&&Nr.log(`Failed to add non-enumerable property "${t}" to object`,n)}}function Jy(){const n=Ie;return n.crypto||n.msCrypto}function Fn(n=Jy()){let t=()=>Math.random()*16;try{if(n!=null&&n.randomUUID)return n.randomUUID().replace(/-/g,"");n!=null&&n.getRandomValues&&(t=()=>{const e=new Uint8Array(1);return n.getRandomValues(e),e[0]})}catch{}return("10000000100040008000"+1e11).replace(/[018]/g,e=>(e^(t()&15)>>e/4).toString(16))}const Eh=1e3;function Th(){return Date.now()/Eh}function Zy(){const{performance:n}=Ie;if(!(n!=null&&n.now)||!n.timeOrigin)return Th;const t=n.timeOrigin;return()=>(t+n.now())/Eh}let Gu;function tv(){return(Gu??(Gu=Zy()))()}function ev(n,t={}){if(t.user&&(!n.ipAddress&&t.user.ip_address&&(n.ipAddress=t.user.ip_address),!n.did&&!t.did&&(n.did=t.user.id||t.user.email||t.user.username)),n.timestamp=t.timestamp||tv(),t.abnormal_mechanism&&(n.abnormal_mechanism=t.abnormal_mechanism),t.ignoreDuration&&(n.ignoreDuration=t.ignoreDuration),t.sid&&(n.sid=t.sid.length===32?t.sid:Fn()),t.init!==void 0&&(n.init=t.init),!n.did&&t.did&&(n.did=`${t.did}`),typeof t.started=="number"&&(n.started=t.started),n.ignoreDuration)n.duration=void 0;else if(typeof t.duration=="number")n.duration=t.duration;else{const e=n.timestamp-n.started;n.duration=e>=0?e:0}t.release&&(n.release=t.release),t.environment&&(n.environment=t.environment),!n.ipAddress&&t.ipAddress&&(n.ipAddress=t.ipAddress),!n.userAgent&&t.userAgent&&(n.userAgent=t.userAgent),typeof t.errors=="number"&&(n.errors=t.errors),t.status&&(n.status=t.status)}function Ih(n,t,e=2){if(!t||typeof t!="object"||e<=0)return t;if(n&&Object.keys(t).length===0)return n;const r={...n};for(const s in t)Object.prototype.hasOwnProperty.call(t,s)&&(r[s]=Ih(r[s],t[s],e-1));return r}function Hu(){return Fn()}const vi="_sentrySpan";function Wu(n,t){t?Yy(n,vi,t):delete n[vi]}function Ku(n){return n[vi]}const nv=100;class Le{constructor(){this._notifyingListeners=!1,this._scopeListeners=[],this._eventProcessors=[],this._breadcrumbs=[],this._attachments=[],this._user={},this._tags={},this._extra={},this._contexts={},this._sdkProcessingMetadata={},this._propagationContext={traceId:Hu(),sampleRand:Math.random()}}clone(){const t=new Le;return t._breadcrumbs=[...this._breadcrumbs],t._tags={...this._tags},t._extra={...this._extra},t._contexts={...this._contexts},this._contexts.flags&&(t._contexts.flags={values:[...this._contexts.flags.values]}),t._user=this._user,t._level=this._level,t._session=this._session,t._transactionName=this._transactionName,t._fingerprint=this._fingerprint,t._eventProcessors=[...this._eventProcessors],t._attachments=[...this._attachments],t._sdkProcessingMetadata={...this._sdkProcessingMetadata},t._propagationContext={...this._propagationContext},t._client=this._client,t._lastEventId=this._lastEventId,Wu(t,Ku(this)),t}setClient(t){this._client=t}setLastEventId(t){this._lastEventId=t}getClient(){return this._client}lastEventId(){return this._lastEventId}addScopeListener(t){this._scopeListeners.push(t)}addEventProcessor(t){return this._eventProcessors.push(t),this}setUser(t){return this._user=t||{email:void 0,id:void 0,ip_address:void 0,username:void 0},this._session&&ev(this._session,{user:t}),this._notifyScopeListeners(),this}getUser(){return this._user}setTags(t){return this._tags={...this._tags,...t},this._notifyScopeListeners(),this}setTag(t,e){return this._tags={...this._tags,[t]:e},this._notifyScopeListeners(),this}setExtras(t){return this._extra={...this._extra,...t},this._notifyScopeListeners(),this}setExtra(t,e){return this._extra={...this._extra,[t]:e},this._notifyScopeListeners(),this}setFingerprint(t){return this._fingerprint=t,this._notifyScopeListeners(),this}setLevel(t){return this._level=t,this._notifyScopeListeners(),this}setTransactionName(t){return this._transactionName=t,this._notifyScopeListeners(),this}setContext(t,e){return e===null?delete this._contexts[t]:this._contexts[t]=e,this._notifyScopeListeners(),this}setSession(t){return t?this._session=t:delete this._session,this._notifyScopeListeners(),this}getSession(){return this._session}update(t){if(!t)return this;const e=typeof t=="function"?t(this):t,r=e instanceof Le?e.getScopeData():Ky(e)?t:void 0,{tags:s,extra:o,user:a,contexts:c,level:h,fingerprint:d=[],propagationContext:p}=r||{};return this._tags={...this._tags,...s},this._extra={...this._extra,...o},this._contexts={...this._contexts,...c},a&&Object.keys(a).length&&(this._user=a),h&&(this._level=h),d.length&&(this._fingerprint=d),p&&(this._propagationContext=p),this}clear(){return this._breadcrumbs=[],this._tags={},this._extra={},this._user={},this._contexts={},this._level=void 0,this._transactionName=void 0,this._fingerprint=void 0,this._session=void 0,Wu(this,void 0),this._attachments=[],this.setPropagationContext({traceId:Hu(),sampleRand:Math.random()}),this._notifyScopeListeners(),this}addBreadcrumb(t,e){var o;const r=typeof e=="number"?e:nv;if(r<=0)return this;const s={timestamp:Th(),...t,message:t.message?Xy(t.message,2048):t.message};return this._breadcrumbs.push(s),this._breadcrumbs.length>r&&(this._breadcrumbs=this._breadcrumbs.slice(-r),(o=this._client)==null||o.recordDroppedEvent("buffer_overflow","log_item")),this._notifyScopeListeners(),this}getLastBreadcrumb(){return this._breadcrumbs[this._breadcrumbs.length-1]}clearBreadcrumbs(){return this._breadcrumbs=[],this._notifyScopeListeners(),this}addAttachment(t){return this._attachments.push(t),this}clearAttachments(){return this._attachments=[],this}getScopeData(){return{breadcrumbs:this._breadcrumbs,attachments:this._attachments,contexts:this._contexts,tags:this._tags,extra:this._extra,user:this._user,level:this._level,fingerprint:this._fingerprint||[],eventProcessors:this._eventProcessors,propagationContext:this._propagationContext,sdkProcessingMetadata:this._sdkProcessingMetadata,transactionName:this._transactionName,span:Ku(this)}}setSDKProcessingMetadata(t){return this._sdkProcessingMetadata=Ih(this._sdkProcessingMetadata,t,2),this}setPropagationContext(t){return this._propagationContext=t,this}getPropagationContext(){return this._propagationContext}captureException(t,e){const r=(e==null?void 0:e.event_id)||Fn();if(!this._client)return en&&Nr.warn("No client configured on scope - will not capture exception!"),r;const s=new Error("Sentry syntheticException");return this._client.captureException(t,{originalException:t,syntheticException:s,...e,event_id:r},this),r}captureMessage(t,e,r){const s=(r==null?void 0:r.event_id)||Fn();if(!this._client)return en&&Nr.warn("No client configured on scope - will not capture message!"),s;const o=new Error(t);return this._client.captureMessage(t,e,{originalException:t,syntheticException:o,...r,event_id:s},this),s}captureEvent(t,e){const r=(e==null?void 0:e.event_id)||Fn();return this._client?(this._client.captureEvent(t,{...e,event_id:r},this),r):(en&&Nr.warn("No client configured on scope - will not capture event!"),r)}_notifyScopeListeners(){this._notifyingListeners||(this._notifyingListeners=!0,this._scopeListeners.forEach(t=>{t(this)}),this._notifyingListeners=!1)}}function rv(){return _o("defaultCurrentScope",()=>new Le)}function sv(){return _o("defaultIsolationScope",()=>new Le)}class iv{constructor(t,e){let r;t?r=t:r=new Le;let s;e?s=e:s=new Le,this._stack=[{scope:r}],this._isolationScope=s}withScope(t){const e=this._pushScope();let r;try{r=t(e)}catch(s){throw this._popScope(),s}return Qy(r)?r.then(s=>(this._popScope(),s),s=>{throw this._popScope(),s}):(this._popScope(),r)}getClient(){return this.getStackTop().client}getScope(){return this.getStackTop().scope}getIsolationScope(){return this._isolationScope}getStackTop(){return this._stack[this._stack.length-1]}_pushScope(){const t=this.getScope().clone();return this._stack.push({client:this.getClient(),scope:t}),t}_popScope(){return this._stack.length<=1?!1:!!this._stack.pop()}}function un(){const n=mo(),t=go(n);return t.stack=t.stack||new iv(rv(),sv())}function ov(n){return un().withScope(n)}function av(n,t){const e=un();return e.withScope(()=>(e.getStackTop().scope=n,t(n)))}function Qu(n){return un().withScope(()=>n(un().getIsolationScope()))}function uv(){return{withIsolationScope:Qu,withScope:ov,withSetScope:av,withSetIsolationScope:(n,t)=>Qu(t),getCurrentScope:()=>un().getScope(),getIsolationScope:()=>un().getIsolationScope()}}function wh(n){const t=go(n);return t.acs?t.acs:uv()}function cv(){const n=mo();return wh(n).getCurrentScope()}function Uv(...n){const t=mo(),e=wh(t);if(n.length===2){const[r,s]=n;return r?e.withSetScope(r,s):e.withScope(s)}return e.withScope(n[0])}function Bv(n,t){return cv().captureException(n,void 0)}export{a_ as $,Ye as A,Qn as B,te as C,xd as D,Jr as E,we as F,lc as G,Bn as H,Fd as I,qd as J,Ev as K,Si as L,Tv as M,wv as N,Av as O,yv as P,tp as Q,Cv as R,Zf as S,Fv as T,Lv as U,Vv as V,Dv as W,Nv as X,Ov as Y,Pv as Z,fe as _,_d as a,xv as a0,kv as a1,Mv as a2,Uv as a3,Bv as a4,mv as b,Ju as c,hv as d,pd as e,gv as f,fv as g,_v as h,Je as i,Rr as j,vv as k,Jt as l,dv as m,ic as n,Xf as o,Xr as p,de as q,pv as r,lv as s,Sv as t,Rv as u,K as v,Ii as w,Vd as x,Iv as y,Ti as z};
