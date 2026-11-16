const Sc=()=>{};var us={};/**
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
 */const yo=function(n){const e=[];let t=0;for(let r=0;r<n.length;r++){let s=n.charCodeAt(r);s<128?e[t++]=s:s<2048?(e[t++]=s>>6|192,e[t++]=s&63|128):(s&64512)===55296&&r+1<n.length&&(n.charCodeAt(r+1)&64512)===56320?(s=65536+((s&1023)<<10)+(n.charCodeAt(++r)&1023),e[t++]=s>>18|240,e[t++]=s>>12&63|128,e[t++]=s>>6&63|128,e[t++]=s&63|128):(e[t++]=s>>12|224,e[t++]=s>>6&63|128,e[t++]=s&63|128)}return e},Rc=function(n){const e=[];let t=0,r=0;for(;t<n.length;){const s=n[t++];if(s<128)e[r++]=String.fromCharCode(s);else if(s>191&&s<224){const a=n[t++];e[r++]=String.fromCharCode((s&31)<<6|a&63)}else if(s>239&&s<365){const a=n[t++],l=n[t++],u=n[t++],f=((s&7)<<18|(a&63)<<12|(l&63)<<6|u&63)-65536;e[r++]=String.fromCharCode(55296+(f>>10)),e[r++]=String.fromCharCode(56320+(f&1023))}else{const a=n[t++],l=n[t++];e[r++]=String.fromCharCode((s&15)<<12|(a&63)<<6|l&63)}}return e.join("")},vo={byteToCharMap_:null,charToByteMap_:null,byteToCharMapWebSafe_:null,charToByteMapWebSafe_:null,ENCODED_VALS_BASE:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",get ENCODED_VALS(){return this.ENCODED_VALS_BASE+"+/="},get ENCODED_VALS_WEBSAFE(){return this.ENCODED_VALS_BASE+"-_."},HAS_NATIVE_SUPPORT:typeof atob=="function",encodeByteArray(n,e){if(!Array.isArray(n))throw Error("encodeByteArray takes an array as a parameter");this.init_();const t=e?this.byteToCharMapWebSafe_:this.byteToCharMap_,r=[];for(let s=0;s<n.length;s+=3){const a=n[s],l=s+1<n.length,u=l?n[s+1]:0,f=s+2<n.length,w=f?n[s+2]:0,b=a>>2,S=(a&3)<<4|u>>4;let E=(u&15)<<2|w>>6,P=w&63;f||(P=64,l||(E=64)),r.push(t[b],t[S],t[E],t[P])}return r.join("")},encodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?btoa(n):this.encodeByteArray(yo(n),e)},decodeString(n,e){return this.HAS_NATIVE_SUPPORT&&!e?atob(n):Rc(this.decodeStringToByteArray(n,e))},decodeStringToByteArray(n,e){this.init_();const t=e?this.charToByteMapWebSafe_:this.charToByteMap_,r=[];for(let s=0;s<n.length;){const a=t[n.charAt(s++)],u=s<n.length?t[n.charAt(s)]:0;++s;const w=s<n.length?t[n.charAt(s)]:64;++s;const S=s<n.length?t[n.charAt(s)]:64;if(++s,a==null||u==null||w==null||S==null)throw new kc;const E=a<<2|u>>4;if(r.push(E),w!==64){const P=u<<4&240|w>>2;if(r.push(P),S!==64){const k=w<<6&192|S;r.push(k)}}}return r},init_(){if(!this.byteToCharMap_){this.byteToCharMap_={},this.charToByteMap_={},this.byteToCharMapWebSafe_={},this.charToByteMapWebSafe_={};for(let n=0;n<this.ENCODED_VALS.length;n++)this.byteToCharMap_[n]=this.ENCODED_VALS.charAt(n),this.charToByteMap_[this.byteToCharMap_[n]]=n,this.byteToCharMapWebSafe_[n]=this.ENCODED_VALS_WEBSAFE.charAt(n),this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]]=n,n>=this.ENCODED_VALS_BASE.length&&(this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)]=n,this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)]=n)}}};class kc extends Error{constructor(){super(...arguments),this.name="DecodeBase64StringError"}}const Cc=function(n){const e=yo(n);return vo.encodeByteArray(e,!0)},kn=function(n){return Cc(n).replace(/\./g,"")},Io=function(n){try{return vo.decodeString(n,!0)}catch(e){console.error("base64Decode failed: ",e)}return null};/**
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
 */function Pc(){if(typeof self<"u")return self;if(typeof window<"u")return window;if(typeof global<"u")return global;throw new Error("Unable to locate global object.")}/**
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
 */const Oc=()=>Pc().__FIREBASE_DEFAULTS__,Nc=()=>{if(typeof process>"u"||typeof us>"u")return;const n=us.__FIREBASE_DEFAULTS__;if(n)return JSON.parse(n)},Dc=()=>{if(typeof document>"u")return;let n;try{n=document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/)}catch{return}const e=n&&Io(n[1]);return e&&JSON.parse(e)},Vi=()=>{try{return Sc()||Oc()||Nc()||Dc()}catch(n){console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);return}},wo=n=>{var e,t;return(t=(e=Vi())===null||e===void 0?void 0:e.emulatorHosts)===null||t===void 0?void 0:t[n]},To=n=>{const e=wo(n);if(!e)return;const t=e.lastIndexOf(":");if(t<=0||t+1===e.length)throw new Error(`Invalid host ${e} with no separate hostname and port!`);const r=parseInt(e.substring(t+1),10);return e[0]==="["?[e.substring(1,t-1),r]:[e.substring(0,t),r]},Eo=()=>{var n;return(n=Vi())===null||n===void 0?void 0:n.config},Ao=n=>{var e;return(e=Vi())===null||e===void 0?void 0:e[`_${n}`]};/**
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
 */class Lc{constructor(){this.reject=()=>{},this.resolve=()=>{},this.promise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}wrapCallback(e){return(t,r)=>{t?this.reject(t):this.resolve(r),typeof e=="function"&&(this.promise.catch(()=>{}),e.length===1?e(t):e(t,r))}}}/**
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
 */function It(n){try{return(n.startsWith("http://")||n.startsWith("https://")?new URL(n).hostname:n).endsWith(".cloudworkstations.dev")}catch{return!1}}async function Bi(n){return(await fetch(n,{credentials:"include"})).ok}/**
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
 */function bo(n,e){if(n.uid)throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');const t={alg:"none",type:"JWT"},r=e||"demo-project",s=n.iat||0,a=n.sub||n.user_id;if(!a)throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");const l=Object.assign({iss:`https://securetoken.google.com/${r}`,aud:r,iat:s,exp:s+3600,auth_time:s,sub:a,user_id:a,firebase:{sign_in_provider:"custom",identities:{}}},n);return[kn(JSON.stringify(t)),kn(JSON.stringify(l)),""].join(".")}const jt={};function Mc(){const n={prod:[],emulator:[]};for(const e of Object.keys(jt))jt[e]?n.emulator.push(e):n.prod.push(e);return n}function Uc(n){let e=document.getElementById(n),t=!1;return e||(e=document.createElement("div"),e.setAttribute("id",n),t=!0),{created:t,element:e}}let ds=!1;function $i(n,e){if(typeof window>"u"||typeof document>"u"||!It(window.location.host)||jt[n]===e||jt[n]||ds)return;jt[n]=e;function t(E){return`__firebase__banner__${E}`}const r="__firebase__banner",a=Mc().prod.length>0;function l(){const E=document.getElementById(r);E&&E.remove()}function u(E){E.style.display="flex",E.style.background="#7faaf0",E.style.position="fixed",E.style.bottom="5px",E.style.left="5px",E.style.padding=".5em",E.style.borderRadius="5px",E.style.alignItems="center"}function f(E,P){E.setAttribute("width","24"),E.setAttribute("id",P),E.setAttribute("height","24"),E.setAttribute("viewBox","0 0 24 24"),E.setAttribute("fill","none"),E.style.marginLeft="-6px"}function w(){const E=document.createElement("span");return E.style.cursor="pointer",E.style.marginLeft="16px",E.style.fontSize="24px",E.innerHTML=" &times;",E.onclick=()=>{ds=!0,l()},E}function b(E,P){E.setAttribute("id",P),E.innerText="Learn more",E.href="https://firebase.google.com/docs/studio/preview-apps#preview-backend",E.setAttribute("target","__blank"),E.style.paddingLeft="5px",E.style.textDecoration="underline"}function S(){const E=Uc(r),P=t("text"),k=document.getElementById(P)||document.createElement("span"),U=t("learnmore"),C=document.getElementById(U)||document.createElement("a"),z=t("preprendIcon"),$=document.getElementById(z)||document.createElementNS("http://www.w3.org/2000/svg","svg");if(E.created){const x=E.element;u(x),b(C,U);const j=w();f($,z),x.append($,k,C,j),document.body.appendChild(x)}a?(k.innerText="Preview backend disconnected.",$.innerHTML=`<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`):($.innerHTML=`<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`,k.innerText="Preview backend running in this workspace."),k.setAttribute("id",P)}document.readyState==="loading"?window.addEventListener("DOMContentLoaded",S):S()}/**
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
 */function ee(){return typeof navigator<"u"&&typeof navigator.userAgent=="string"?navigator.userAgent:""}function xc(){return typeof window<"u"&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(ee())}function Fc(){return typeof navigator<"u"&&navigator.userAgent==="Cloudflare-Workers"}function Hi(){const n=typeof chrome=="object"?chrome.runtime:typeof browser=="object"?browser.runtime:void 0;return typeof n=="object"&&n.id!==void 0}function jc(){return typeof navigator=="object"&&navigator.product==="ReactNative"}function Vc(){const n=ee();return n.indexOf("MSIE ")>=0||n.indexOf("Trident/")>=0}function Wi(){try{return typeof indexedDB=="object"}catch{return!1}}function zi(){return new Promise((n,e)=>{try{let t=!0;const r="validate-browser-context-for-indexeddb-analytics-module",s=self.indexedDB.open(r);s.onsuccess=()=>{s.result.close(),t||self.indexedDB.deleteDatabase(r),n(!0)},s.onupgradeneeded=()=>{t=!1},s.onerror=()=>{var a;e(((a=s.error)===null||a===void 0?void 0:a.message)||"")}}catch(t){e(t)}})}function So(){return!(typeof navigator>"u"||!navigator.cookieEnabled)}/**
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
 */const Bc="FirebaseError";class ae extends Error{constructor(e,t,r){super(t),this.code=e,this.customData=r,this.name=Bc,Object.setPrototypeOf(this,ae.prototype),Error.captureStackTrace&&Error.captureStackTrace(this,ot.prototype.create)}}class ot{constructor(e,t,r){this.service=e,this.serviceName=t,this.errors=r}create(e,...t){const r=t[0]||{},s=`${this.service}/${e}`,a=this.errors[e],l=a?$c(a,r):"Error",u=`${this.serviceName}: ${l} (${s}).`;return new ae(s,u,r)}}function $c(n,e){return n.replace(Hc,(t,r)=>{const s=e[r];return s!=null?String(s):`<${r}?>`})}const Hc=/\{\$([^}]+)}/g;function Wc(n){for(const e in n)if(Object.prototype.hasOwnProperty.call(n,e))return!1;return!0}function We(n,e){if(n===e)return!0;const t=Object.keys(n),r=Object.keys(e);for(const s of t){if(!r.includes(s))return!1;const a=n[s],l=e[s];if(fs(a)&&fs(l)){if(!We(a,l))return!1}else if(a!==l)return!1}for(const s of r)if(!t.includes(s))return!1;return!0}function fs(n){return n!==null&&typeof n=="object"}/**
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
 */function Jt(n){const e=[];for(const[t,r]of Object.entries(n))Array.isArray(r)?r.forEach(s=>{e.push(encodeURIComponent(t)+"="+encodeURIComponent(s))}):e.push(encodeURIComponent(t)+"="+encodeURIComponent(r));return e.length?"&"+e.join("&"):""}function zc(n,e){const t=new Gc(n,e);return t.subscribe.bind(t)}class Gc{constructor(e,t){this.observers=[],this.unsubscribes=[],this.observerCount=0,this.task=Promise.resolve(),this.finalized=!1,this.onNoObservers=t,this.task.then(()=>{e(this)}).catch(r=>{this.error(r)})}next(e){this.forEachObserver(t=>{t.next(e)})}error(e){this.forEachObserver(t=>{t.error(e)}),this.close(e)}complete(){this.forEachObserver(e=>{e.complete()}),this.close()}subscribe(e,t,r){let s;if(e===void 0&&t===void 0&&r===void 0)throw new Error("Missing Observer.");qc(e,["next","error","complete"])?s=e:s={next:e,error:t,complete:r},s.next===void 0&&(s.next=yi),s.error===void 0&&(s.error=yi),s.complete===void 0&&(s.complete=yi);const a=this.unsubscribeOne.bind(this,this.observers.length);return this.finalized&&this.task.then(()=>{try{this.finalError?s.error(this.finalError):s.complete()}catch{}}),this.observers.push(s),a}unsubscribeOne(e){this.observers===void 0||this.observers[e]===void 0||(delete this.observers[e],this.observerCount-=1,this.observerCount===0&&this.onNoObservers!==void 0&&this.onNoObservers(this))}forEachObserver(e){if(!this.finalized)for(let t=0;t<this.observers.length;t++)this.sendOne(t,e)}sendOne(e,t){this.task.then(()=>{if(this.observers!==void 0&&this.observers[e]!==void 0)try{t(this.observers[e])}catch(r){typeof console<"u"&&console.error&&console.error(r)}})}close(e){this.finalized||(this.finalized=!0,e!==void 0&&(this.finalError=e),this.task.then(()=>{this.observers=void 0,this.onNoObservers=void 0}))}}function qc(n,e){if(typeof n!="object"||n===null)return!1;for(const t of e)if(t in n&&typeof n[t]=="function")return!0;return!1}function yi(){}/**
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
 */const Kc=1e3,Jc=2,Xc=14400*1e3,Yc=.5;function ps(n,e=Kc,t=Jc){const r=e*Math.pow(t,n),s=Math.round(Yc*r*(Math.random()-.5)*2);return Math.min(Xc,r+s)}/**
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
 */function Ne(n){return n&&n._delegate?n._delegate:n}class oe{constructor(e,t,r){this.name=e,this.instanceFactory=t,this.type=r,this.multipleInstances=!1,this.serviceProps={},this.instantiationMode="LAZY",this.onInstanceCreated=null}setInstantiationMode(e){return this.instantiationMode=e,this}setMultipleInstances(e){return this.multipleInstances=e,this}setServiceProps(e){return this.serviceProps=e,this}setInstanceCreatedCallback(e){return this.onInstanceCreated=e,this}}/**
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
 */const Je="[DEFAULT]";/**
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
 */class Zc{constructor(e,t){this.name=e,this.container=t,this.component=null,this.instances=new Map,this.instancesDeferred=new Map,this.instancesOptions=new Map,this.onInitCallbacks=new Map}get(e){const t=this.normalizeInstanceIdentifier(e);if(!this.instancesDeferred.has(t)){const r=new Lc;if(this.instancesDeferred.set(t,r),this.isInitialized(t)||this.shouldAutoInitialize())try{const s=this.getOrInitializeService({instanceIdentifier:t});s&&r.resolve(s)}catch{}}return this.instancesDeferred.get(t).promise}getImmediate(e){var t;const r=this.normalizeInstanceIdentifier(e==null?void 0:e.identifier),s=(t=e==null?void 0:e.optional)!==null&&t!==void 0?t:!1;if(this.isInitialized(r)||this.shouldAutoInitialize())try{return this.getOrInitializeService({instanceIdentifier:r})}catch(a){if(s)return null;throw a}else{if(s)return null;throw Error(`Service ${this.name} is not available`)}}getComponent(){return this.component}setComponent(e){if(e.name!==this.name)throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);if(this.component)throw Error(`Component for ${this.name} has already been provided`);if(this.component=e,!!this.shouldAutoInitialize()){if(el(e))try{this.getOrInitializeService({instanceIdentifier:Je})}catch{}for(const[t,r]of this.instancesDeferred.entries()){const s=this.normalizeInstanceIdentifier(t);try{const a=this.getOrInitializeService({instanceIdentifier:s});r.resolve(a)}catch{}}}}clearInstance(e=Je){this.instancesDeferred.delete(e),this.instancesOptions.delete(e),this.instances.delete(e)}async delete(){const e=Array.from(this.instances.values());await Promise.all([...e.filter(t=>"INTERNAL"in t).map(t=>t.INTERNAL.delete()),...e.filter(t=>"_delete"in t).map(t=>t._delete())])}isComponentSet(){return this.component!=null}isInitialized(e=Je){return this.instances.has(e)}getOptions(e=Je){return this.instancesOptions.get(e)||{}}initialize(e={}){const{options:t={}}=e,r=this.normalizeInstanceIdentifier(e.instanceIdentifier);if(this.isInitialized(r))throw Error(`${this.name}(${r}) has already been initialized`);if(!this.isComponentSet())throw Error(`Component ${this.name} has not been registered yet`);const s=this.getOrInitializeService({instanceIdentifier:r,options:t});for(const[a,l]of this.instancesDeferred.entries()){const u=this.normalizeInstanceIdentifier(a);r===u&&l.resolve(s)}return s}onInit(e,t){var r;const s=this.normalizeInstanceIdentifier(t),a=(r=this.onInitCallbacks.get(s))!==null&&r!==void 0?r:new Set;a.add(e),this.onInitCallbacks.set(s,a);const l=this.instances.get(s);return l&&e(l,s),()=>{a.delete(e)}}invokeOnInitCallbacks(e,t){const r=this.onInitCallbacks.get(t);if(r)for(const s of r)try{s(e,t)}catch{}}getOrInitializeService({instanceIdentifier:e,options:t={}}){let r=this.instances.get(e);if(!r&&this.component&&(r=this.component.instanceFactory(this.container,{instanceIdentifier:Qc(e),options:t}),this.instances.set(e,r),this.instancesOptions.set(e,t),this.invokeOnInitCallbacks(r,e),this.component.onInstanceCreated))try{this.component.onInstanceCreated(this.container,e,r)}catch{}return r||null}normalizeInstanceIdentifier(e=Je){return this.component?this.component.multipleInstances?e:Je:e}shouldAutoInitialize(){return!!this.component&&this.component.instantiationMode!=="EXPLICIT"}}function Qc(n){return n===Je?void 0:n}function el(n){return n.instantiationMode==="EAGER"}/**
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
 */class tl{constructor(e){this.name=e,this.providers=new Map}addComponent(e){const t=this.getProvider(e.name);if(t.isComponentSet())throw new Error(`Component ${e.name} has already been registered with ${this.name}`);t.setComponent(e)}addOrOverwriteComponent(e){this.getProvider(e.name).isComponentSet()&&this.providers.delete(e.name),this.addComponent(e)}getProvider(e){if(this.providers.has(e))return this.providers.get(e);const t=new Zc(e,this);return this.providers.set(e,t),t}getProviders(){return Array.from(this.providers.values())}}/**
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
 */var M;(function(n){n[n.DEBUG=0]="DEBUG",n[n.VERBOSE=1]="VERBOSE",n[n.INFO=2]="INFO",n[n.WARN=3]="WARN",n[n.ERROR=4]="ERROR",n[n.SILENT=5]="SILENT"})(M||(M={}));const nl={debug:M.DEBUG,verbose:M.VERBOSE,info:M.INFO,warn:M.WARN,error:M.ERROR,silent:M.SILENT},il=M.INFO,rl={[M.DEBUG]:"log",[M.VERBOSE]:"log",[M.INFO]:"info",[M.WARN]:"warn",[M.ERROR]:"error"},sl=(n,e,...t)=>{if(e<n.logLevel)return;const r=new Date().toISOString(),s=rl[e];if(s)console[s](`[${r}]  ${n.name}:`,...t);else throw new Error(`Attempted to log a message with an invalid logType (value: ${e})`)};class Vn{constructor(e){this.name=e,this._logLevel=il,this._logHandler=sl,this._userLogHandler=null}get logLevel(){return this._logLevel}set logLevel(e){if(!(e in M))throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);this._logLevel=e}setLogLevel(e){this._logLevel=typeof e=="string"?nl[e]:e}get logHandler(){return this._logHandler}set logHandler(e){if(typeof e!="function")throw new TypeError("Value assigned to `logHandler` must be a function");this._logHandler=e}get userLogHandler(){return this._userLogHandler}set userLogHandler(e){this._userLogHandler=e}debug(...e){this._userLogHandler&&this._userLogHandler(this,M.DEBUG,...e),this._logHandler(this,M.DEBUG,...e)}log(...e){this._userLogHandler&&this._userLogHandler(this,M.VERBOSE,...e),this._logHandler(this,M.VERBOSE,...e)}info(...e){this._userLogHandler&&this._userLogHandler(this,M.INFO,...e),this._logHandler(this,M.INFO,...e)}warn(...e){this._userLogHandler&&this._userLogHandler(this,M.WARN,...e),this._logHandler(this,M.WARN,...e)}error(...e){this._userLogHandler&&this._userLogHandler(this,M.ERROR,...e),this._logHandler(this,M.ERROR,...e)}}const ol=(n,e)=>e.some(t=>n instanceof t);let gs,ms;function al(){return gs||(gs=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function cl(){return ms||(ms=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}const Ro=new WeakMap,Pi=new WeakMap,ko=new WeakMap,vi=new WeakMap,Gi=new WeakMap;function ll(n){const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("success",a),n.removeEventListener("error",l)},a=()=>{t($e(n.result)),s()},l=()=>{r(n.error),s()};n.addEventListener("success",a),n.addEventListener("error",l)});return e.then(t=>{t instanceof IDBCursor&&Ro.set(t,n)}).catch(()=>{}),Gi.set(e,n),e}function hl(n){if(Pi.has(n))return;const e=new Promise((t,r)=>{const s=()=>{n.removeEventListener("complete",a),n.removeEventListener("error",l),n.removeEventListener("abort",l)},a=()=>{t(),s()},l=()=>{r(n.error||new DOMException("AbortError","AbortError")),s()};n.addEventListener("complete",a),n.addEventListener("error",l),n.addEventListener("abort",l)});Pi.set(n,e)}let Oi={get(n,e,t){if(n instanceof IDBTransaction){if(e==="done")return Pi.get(n);if(e==="objectStoreNames")return n.objectStoreNames||ko.get(n);if(e==="store")return t.objectStoreNames[1]?void 0:t.objectStore(t.objectStoreNames[0])}return $e(n[e])},set(n,e,t){return n[e]=t,!0},has(n,e){return n instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in n}};function ul(n){Oi=n(Oi)}function dl(n){return n===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...t){const r=n.call(Ii(this),e,...t);return ko.set(r,e.sort?e.sort():[e]),$e(r)}:cl().includes(n)?function(...e){return n.apply(Ii(this),e),$e(Ro.get(this))}:function(...e){return $e(n.apply(Ii(this),e))}}function fl(n){return typeof n=="function"?dl(n):(n instanceof IDBTransaction&&hl(n),ol(n,al())?new Proxy(n,Oi):n)}function $e(n){if(n instanceof IDBRequest)return ll(n);if(vi.has(n))return vi.get(n);const e=fl(n);return e!==n&&(vi.set(n,e),Gi.set(e,n)),e}const Ii=n=>Gi.get(n);function Co(n,e,{blocked:t,upgrade:r,blocking:s,terminated:a}={}){const l=indexedDB.open(n,e),u=$e(l);return r&&l.addEventListener("upgradeneeded",f=>{r($e(l.result),f.oldVersion,f.newVersion,$e(l.transaction),f)}),t&&l.addEventListener("blocked",f=>t(f.oldVersion,f.newVersion,f)),u.then(f=>{a&&f.addEventListener("close",()=>a()),s&&f.addEventListener("versionchange",w=>s(w.oldVersion,w.newVersion,w))}).catch(()=>{}),u}const pl=["get","getKey","getAll","getAllKeys","count"],gl=["put","add","delete","clear"],wi=new Map;function _s(n,e){if(!(n instanceof IDBDatabase&&!(e in n)&&typeof e=="string"))return;if(wi.get(e))return wi.get(e);const t=e.replace(/FromIndex$/,""),r=e!==t,s=gl.includes(t);if(!(t in(r?IDBIndex:IDBObjectStore).prototype)||!(s||pl.includes(t)))return;const a=async function(l,...u){const f=this.transaction(l,s?"readwrite":"readonly");let w=f.store;return r&&(w=w.index(u.shift())),(await Promise.all([w[t](...u),s&&f.done]))[0]};return wi.set(e,a),a}ul(n=>({...n,get:(e,t,r)=>_s(e,t)||n.get(e,t,r),has:(e,t)=>!!_s(e,t)||n.has(e,t)}));/**
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
 */class ml{constructor(e){this.container=e}getPlatformInfoString(){return this.container.getProviders().map(t=>{if(_l(t)){const r=t.getImmediate();return`${r.library}/${r.version}`}else return null}).filter(t=>t).join(" ")}}function _l(n){const e=n.getComponent();return(e==null?void 0:e.type)==="VERSION"}const Ni="@firebase/app",ys="0.13.2";/**
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
 */const Ce=new Vn("@firebase/app"),yl="@firebase/app-compat",vl="@firebase/analytics-compat",Il="@firebase/analytics",wl="@firebase/app-check-compat",Tl="@firebase/app-check",El="@firebase/auth",Al="@firebase/auth-compat",bl="@firebase/database",Sl="@firebase/data-connect",Rl="@firebase/database-compat",kl="@firebase/functions",Cl="@firebase/functions-compat",Pl="@firebase/installations",Ol="@firebase/installations-compat",Nl="@firebase/messaging",Dl="@firebase/messaging-compat",Ll="@firebase/performance",Ml="@firebase/performance-compat",Ul="@firebase/remote-config",xl="@firebase/remote-config-compat",Fl="@firebase/storage",jl="@firebase/storage-compat",Vl="@firebase/firestore",Bl="@firebase/ai",$l="@firebase/firestore-compat",Hl="firebase",Wl="11.10.0";/**
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
 */const Di="[DEFAULT]",zl={[Ni]:"fire-core",[yl]:"fire-core-compat",[Il]:"fire-analytics",[vl]:"fire-analytics-compat",[Tl]:"fire-app-check",[wl]:"fire-app-check-compat",[El]:"fire-auth",[Al]:"fire-auth-compat",[bl]:"fire-rtdb",[Sl]:"fire-data-connect",[Rl]:"fire-rtdb-compat",[kl]:"fire-fn",[Cl]:"fire-fn-compat",[Pl]:"fire-iid",[Ol]:"fire-iid-compat",[Nl]:"fire-fcm",[Dl]:"fire-fcm-compat",[Ll]:"fire-perf",[Ml]:"fire-perf-compat",[Ul]:"fire-rc",[xl]:"fire-rc-compat",[Fl]:"fire-gcs",[jl]:"fire-gcs-compat",[Vl]:"fire-fst",[$l]:"fire-fst-compat",[Bl]:"fire-vertex","fire-js":"fire-js",[Hl]:"fire-js-all"};/**
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
 */const zt=new Map,Gl=new Map,Li=new Map;function vs(n,e){try{n.container.addComponent(e)}catch(t){Ce.debug(`Component ${e.name} failed to register with FirebaseApp ${n.name}`,t)}}function ge(n){const e=n.name;if(Li.has(e))return Ce.debug(`There were multiple attempts to register component ${e}.`),!1;Li.set(e,n);for(const t of zt.values())vs(t,n);for(const t of Gl.values())vs(t,n);return!0}function ze(n,e){const t=n.container.getProvider("heartbeat").getImmediate({optional:!0});return t&&t.triggerHeartbeat(),n.container.getProvider(e)}function he(n){return n==null?!1:n.settings!==void 0}/**
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
 */const ql={"no-app":"No Firebase App '{$appName}' has been created - call initializeApp() first","bad-app-name":"Illegal App name: '{$appName}'","duplicate-app":"Firebase App named '{$appName}' already exists with different options or config","app-deleted":"Firebase App named '{$appName}' already deleted","server-app-deleted":"Firebase Server App has been deleted","no-options":"Need to provide options, when not being deployed to hosting via source.","invalid-app-argument":"firebase.{$appName}() takes either no argument or a Firebase App instance.","invalid-log-argument":"First argument to `onLog` must be null or a function.","idb-open":"Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.","idb-get":"Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.","idb-set":"Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.","idb-delete":"Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.","finalization-registry-not-supported":"FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.","invalid-server-app-environment":"FirebaseServerApp is not for use in browser environments."},He=new ot("app","Firebase",ql);/**
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
 */class Kl{constructor(e,t,r){this._isDeleted=!1,this._options=Object.assign({},e),this._config=Object.assign({},t),this._name=t.name,this._automaticDataCollectionEnabled=t.automaticDataCollectionEnabled,this._container=r,this.container.addComponent(new oe("app",()=>this,"PUBLIC"))}get automaticDataCollectionEnabled(){return this.checkDestroyed(),this._automaticDataCollectionEnabled}set automaticDataCollectionEnabled(e){this.checkDestroyed(),this._automaticDataCollectionEnabled=e}get name(){return this.checkDestroyed(),this._name}get options(){return this.checkDestroyed(),this._options}get config(){return this.checkDestroyed(),this._config}get container(){return this._container}get isDeleted(){return this._isDeleted}set isDeleted(e){this._isDeleted=e}checkDestroyed(){if(this.isDeleted)throw He.create("app-deleted",{appName:this._name})}}/**
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
 */const at=Wl;function Po(n,e={}){let t=n;typeof e!="object"&&(e={name:e});const r=Object.assign({name:Di,automaticDataCollectionEnabled:!0},e),s=r.name;if(typeof s!="string"||!s)throw He.create("bad-app-name",{appName:String(s)});if(t||(t=Eo()),!t)throw He.create("no-options");const a=zt.get(s);if(a){if(We(t,a.options)&&We(r,a.config))return a;throw He.create("duplicate-app",{appName:s})}const l=new tl(s);for(const f of Li.values())l.addComponent(f);const u=new Kl(t,r,l);return zt.set(s,u),u}function Xt(n=Di){const e=zt.get(n);if(!e&&n===Di&&Eo())return Po();if(!e)throw He.create("no-app",{appName:n});return e}function Jl(){return Array.from(zt.values())}function te(n,e,t){var r;let s=(r=zl[n])!==null&&r!==void 0?r:n;t&&(s+=`-${t}`);const a=s.match(/\s|\//),l=e.match(/\s|\//);if(a||l){const u=[`Unable to register library "${s}" with version "${e}":`];a&&u.push(`library name "${s}" contains illegal characters (whitespace or "/")`),a&&l&&u.push("and"),l&&u.push(`version name "${e}" contains illegal characters (whitespace or "/")`),Ce.warn(u.join(" "));return}ge(new oe(`${s}-version`,()=>({library:s,version:e}),"VERSION"))}/**
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
 */const Xl="firebase-heartbeat-database",Yl=1,Gt="firebase-heartbeat-store";let Ti=null;function Oo(){return Ti||(Ti=Co(Xl,Yl,{upgrade:(n,e)=>{switch(e){case 0:try{n.createObjectStore(Gt)}catch(t){console.warn(t)}}}}).catch(n=>{throw He.create("idb-open",{originalErrorMessage:n.message})})),Ti}async function Zl(n){try{const t=(await Oo()).transaction(Gt),r=await t.objectStore(Gt).get(No(n));return await t.done,r}catch(e){if(e instanceof ae)Ce.warn(e.message);else{const t=He.create("idb-get",{originalErrorMessage:e==null?void 0:e.message});Ce.warn(t.message)}}}async function Is(n,e){try{const r=(await Oo()).transaction(Gt,"readwrite");await r.objectStore(Gt).put(e,No(n)),await r.done}catch(t){if(t instanceof ae)Ce.warn(t.message);else{const r=He.create("idb-set",{originalErrorMessage:t==null?void 0:t.message});Ce.warn(r.message)}}}function No(n){return`${n.name}!${n.options.appId}`}/**
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
 */const Ql=1024,eh=30;class th{constructor(e){this.container=e,this._heartbeatsCache=null;const t=this.container.getProvider("app").getImmediate();this._storage=new ih(t),this._heartbeatsCachePromise=this._storage.read().then(r=>(this._heartbeatsCache=r,r))}async triggerHeartbeat(){var e,t;try{const s=this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(),a=ws();if(((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null&&(this._heartbeatsCache=await this._heartbeatsCachePromise,((t=this._heartbeatsCache)===null||t===void 0?void 0:t.heartbeats)==null)||this._heartbeatsCache.lastSentHeartbeatDate===a||this._heartbeatsCache.heartbeats.some(l=>l.date===a))return;if(this._heartbeatsCache.heartbeats.push({date:a,agent:s}),this._heartbeatsCache.heartbeats.length>eh){const l=rh(this._heartbeatsCache.heartbeats);this._heartbeatsCache.heartbeats.splice(l,1)}return this._storage.overwrite(this._heartbeatsCache)}catch(r){Ce.warn(r)}}async getHeartbeatsHeader(){var e;try{if(this._heartbeatsCache===null&&await this._heartbeatsCachePromise,((e=this._heartbeatsCache)===null||e===void 0?void 0:e.heartbeats)==null||this._heartbeatsCache.heartbeats.length===0)return"";const t=ws(),{heartbeatsToSend:r,unsentEntries:s}=nh(this._heartbeatsCache.heartbeats),a=kn(JSON.stringify({version:2,heartbeats:r}));return this._heartbeatsCache.lastSentHeartbeatDate=t,s.length>0?(this._heartbeatsCache.heartbeats=s,await this._storage.overwrite(this._heartbeatsCache)):(this._heartbeatsCache.heartbeats=[],this._storage.overwrite(this._heartbeatsCache)),a}catch(t){return Ce.warn(t),""}}}function ws(){return new Date().toISOString().substring(0,10)}function nh(n,e=Ql){const t=[];let r=n.slice();for(const s of n){const a=t.find(l=>l.agent===s.agent);if(a){if(a.dates.push(s.date),Ts(t)>e){a.dates.pop();break}}else if(t.push({agent:s.agent,dates:[s.date]}),Ts(t)>e){t.pop();break}r=r.slice(1)}return{heartbeatsToSend:t,unsentEntries:r}}class ih{constructor(e){this.app=e,this._canUseIndexedDBPromise=this.runIndexedDBEnvironmentCheck()}async runIndexedDBEnvironmentCheck(){return Wi()?zi().then(()=>!0).catch(()=>!1):!1}async read(){if(await this._canUseIndexedDBPromise){const t=await Zl(this.app);return t!=null&&t.heartbeats?t:{heartbeats:[]}}else return{heartbeats:[]}}async overwrite(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return Is(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:e.heartbeats})}else return}async add(e){var t;if(await this._canUseIndexedDBPromise){const s=await this.read();return Is(this.app,{lastSentHeartbeatDate:(t=e.lastSentHeartbeatDate)!==null&&t!==void 0?t:s.lastSentHeartbeatDate,heartbeats:[...s.heartbeats,...e.heartbeats]})}else return}}function Ts(n){return kn(JSON.stringify({version:2,heartbeats:n})).length}function rh(n){if(n.length===0)return-1;let e=0,t=n[0].date;for(let r=1;r<n.length;r++)n[r].date<t&&(t=n[r].date,e=r);return e}/**
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
 */function sh(n){ge(new oe("platform-logger",e=>new ml(e),"PRIVATE")),ge(new oe("heartbeat",e=>new th(e),"PRIVATE")),te(Ni,ys,n),te(Ni,ys,"esm2017"),te("fire-js","")}sh("");function qi(n,e){var t={};for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&e.indexOf(r)<0&&(t[r]=n[r]);if(n!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,r=Object.getOwnPropertySymbols(n);s<r.length;s++)e.indexOf(r[s])<0&&Object.prototype.propertyIsEnumerable.call(n,r[s])&&(t[r[s]]=n[r[s]]);return t}function Do(){return{"dependent-sdk-initialized-before-auth":"Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK."}}const oh=Do,Lo=new ot("auth","Firebase",Do());/**
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
 */const Cn=new Vn("@firebase/auth");function ah(n,...e){Cn.logLevel<=M.WARN&&Cn.warn(`Auth (${at}): ${n}`,...e)}function En(n,...e){Cn.logLevel<=M.ERROR&&Cn.error(`Auth (${at}): ${n}`,...e)}/**
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
 */function Pe(n,...e){throw Ki(n,...e)}function ve(n,...e){return Ki(n,...e)}function Mo(n,e,t){const r=Object.assign(Object.assign({},oh()),{[e]:t});return new ot("auth","Firebase",r).create(e,{appName:n.name})}function Qe(n){return Mo(n,"operation-not-supported-in-this-environment","Operations that alter the current user are not supported in conjunction with FirebaseServerApp")}function Ki(n,...e){if(typeof n!="string"){const t=e[0],r=[...e.slice(1)];return r[0]&&(r[0].appName=n.name),n._errorFactory.create(t,...r)}return Lo.create(n,...e)}function R(n,e,...t){if(!n)throw Ki(e,...t)}function Re(n){const e="INTERNAL ASSERTION FAILED: "+n;throw En(e),new Error(e)}function Oe(n,e){n||Re(e)}/**
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
 */function Mi(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.href)||""}function ch(){return Es()==="http:"||Es()==="https:"}function Es(){var n;return typeof self<"u"&&((n=self.location)===null||n===void 0?void 0:n.protocol)||null}/**
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
 */function lh(){return typeof navigator<"u"&&navigator&&"onLine"in navigator&&typeof navigator.onLine=="boolean"&&(ch()||Hi()||"connection"in navigator)?navigator.onLine:!0}function hh(){if(typeof navigator>"u")return null;const n=navigator;return n.languages&&n.languages[0]||n.language||null}/**
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
 */class Yt{constructor(e,t){this.shortDelay=e,this.longDelay=t,Oe(t>e,"Short delay should be less than long delay!"),this.isMobile=xc()||jc()}get(){return lh()?this.isMobile?this.longDelay:this.shortDelay:Math.min(5e3,this.shortDelay)}}/**
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
 */function Ji(n,e){Oe(n.emulator,"Emulator should always be set here");const{url:t}=n.emulator;return e?`${t}${e.startsWith("/")?e.slice(1):e}`:t}/**
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
 */class Uo{static initialize(e,t,r){this.fetchImpl=e,t&&(this.headersImpl=t),r&&(this.responseImpl=r)}static fetch(){if(this.fetchImpl)return this.fetchImpl;if(typeof self<"u"&&"fetch"in self)return self.fetch;if(typeof globalThis<"u"&&globalThis.fetch)return globalThis.fetch;if(typeof fetch<"u")return fetch;Re("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static headers(){if(this.headersImpl)return this.headersImpl;if(typeof self<"u"&&"Headers"in self)return self.Headers;if(typeof globalThis<"u"&&globalThis.Headers)return globalThis.Headers;if(typeof Headers<"u")return Headers;Re("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}static response(){if(this.responseImpl)return this.responseImpl;if(typeof self<"u"&&"Response"in self)return self.Response;if(typeof globalThis<"u"&&globalThis.Response)return globalThis.Response;if(typeof Response<"u")return Response;Re("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill")}}/**
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
 */const uh={CREDENTIAL_MISMATCH:"custom-token-mismatch",MISSING_CUSTOM_TOKEN:"internal-error",INVALID_IDENTIFIER:"invalid-email",MISSING_CONTINUE_URI:"internal-error",INVALID_PASSWORD:"wrong-password",MISSING_PASSWORD:"missing-password",INVALID_LOGIN_CREDENTIALS:"invalid-credential",EMAIL_EXISTS:"email-already-in-use",PASSWORD_LOGIN_DISABLED:"operation-not-allowed",INVALID_IDP_RESPONSE:"invalid-credential",INVALID_PENDING_TOKEN:"invalid-credential",FEDERATED_USER_ID_ALREADY_LINKED:"credential-already-in-use",MISSING_REQ_TYPE:"internal-error",EMAIL_NOT_FOUND:"user-not-found",RESET_PASSWORD_EXCEED_LIMIT:"too-many-requests",EXPIRED_OOB_CODE:"expired-action-code",INVALID_OOB_CODE:"invalid-action-code",MISSING_OOB_CODE:"internal-error",CREDENTIAL_TOO_OLD_LOGIN_AGAIN:"requires-recent-login",INVALID_ID_TOKEN:"invalid-user-token",TOKEN_EXPIRED:"user-token-expired",USER_NOT_FOUND:"user-token-expired",TOO_MANY_ATTEMPTS_TRY_LATER:"too-many-requests",PASSWORD_DOES_NOT_MEET_REQUIREMENTS:"password-does-not-meet-requirements",INVALID_CODE:"invalid-verification-code",INVALID_SESSION_INFO:"invalid-verification-id",INVALID_TEMPORARY_PROOF:"invalid-credential",MISSING_SESSION_INFO:"missing-verification-id",SESSION_EXPIRED:"code-expired",MISSING_ANDROID_PACKAGE_NAME:"missing-android-pkg-name",UNAUTHORIZED_DOMAIN:"unauthorized-continue-uri",INVALID_OAUTH_CLIENT_ID:"invalid-oauth-client-id",ADMIN_ONLY_OPERATION:"admin-restricted-operation",INVALID_MFA_PENDING_CREDENTIAL:"invalid-multi-factor-session",MFA_ENROLLMENT_NOT_FOUND:"multi-factor-info-not-found",MISSING_MFA_ENROLLMENT_ID:"missing-multi-factor-info",MISSING_MFA_PENDING_CREDENTIAL:"missing-multi-factor-session",SECOND_FACTOR_EXISTS:"second-factor-already-in-use",SECOND_FACTOR_LIMIT_EXCEEDED:"maximum-second-factor-count-exceeded",BLOCKING_FUNCTION_ERROR_RESPONSE:"internal-error",RECAPTCHA_NOT_ENABLED:"recaptcha-not-enabled",MISSING_RECAPTCHA_TOKEN:"missing-recaptcha-token",INVALID_RECAPTCHA_TOKEN:"invalid-recaptcha-token",INVALID_RECAPTCHA_ACTION:"invalid-recaptcha-action",MISSING_CLIENT_TYPE:"missing-client-type",MISSING_RECAPTCHA_VERSION:"missing-recaptcha-version",INVALID_RECAPTCHA_VERSION:"invalid-recaptcha-version",INVALID_REQ_TYPE:"invalid-req-type"};/**
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
 */const dh=["/v1/accounts:signInWithCustomToken","/v1/accounts:signInWithEmailLink","/v1/accounts:signInWithIdp","/v1/accounts:signInWithPassword","/v1/accounts:signInWithPhoneNumber","/v1/token"],fh=new Yt(3e4,6e4);function Xi(n,e){return n.tenantId&&!e.tenantId?Object.assign(Object.assign({},e),{tenantId:n.tenantId}):e}async function wt(n,e,t,r,s={}){return xo(n,s,async()=>{let a={},l={};r&&(e==="GET"?l=r:a={body:JSON.stringify(r)});const u=Jt(Object.assign({key:n.config.apiKey},l)).slice(1),f=await n._getAdditionalHeaders();f["Content-Type"]="application/json",n.languageCode&&(f["X-Firebase-Locale"]=n.languageCode);const w=Object.assign({method:e,headers:f},a);return Fc()||(w.referrerPolicy="no-referrer"),n.emulatorConfig&&It(n.emulatorConfig.host)&&(w.credentials="include"),Uo.fetch()(await Fo(n,n.config.apiHost,t,u),w)})}async function xo(n,e,t){n._canInitEmulator=!1;const r=Object.assign(Object.assign({},uh),e);try{const s=new gh(n),a=await Promise.race([t(),s.promise]);s.clearNetworkTimeout();const l=await a.json();if("needConfirmation"in l)throw vn(n,"account-exists-with-different-credential",l);if(a.ok&&!("errorMessage"in l))return l;{const u=a.ok?l.errorMessage:l.error.message,[f,w]=u.split(" : ");if(f==="FEDERATED_USER_ID_ALREADY_LINKED")throw vn(n,"credential-already-in-use",l);if(f==="EMAIL_EXISTS")throw vn(n,"email-already-in-use",l);if(f==="USER_DISABLED")throw vn(n,"user-disabled",l);const b=r[f]||f.toLowerCase().replace(/[_\s]+/g,"-");if(w)throw Mo(n,b,w);Pe(n,b)}}catch(s){if(s instanceof ae)throw s;Pe(n,"network-request-failed",{message:String(s)})}}async function ph(n,e,t,r,s={}){const a=await wt(n,e,t,r,s);return"mfaPendingCredential"in a&&Pe(n,"multi-factor-auth-required",{_serverResponse:a}),a}async function Fo(n,e,t,r){const s=`${e}${t}?${r}`,a=n,l=a.config.emulator?Ji(n.config,s):`${n.config.apiScheme}://${s}`;return dh.includes(t)&&(await a._persistenceManagerAvailable,a._getPersistenceType()==="COOKIE")?a._getPersistence()._getFinalTarget(l).toString():l}class gh{clearNetworkTimeout(){clearTimeout(this.timer)}constructor(e){this.auth=e,this.timer=null,this.promise=new Promise((t,r)=>{this.timer=setTimeout(()=>r(ve(this.auth,"network-request-failed")),fh.get())})}}function vn(n,e,t){const r={appName:n.name};t.email&&(r.email=t.email),t.phoneNumber&&(r.phoneNumber=t.phoneNumber);const s=ve(n,e,r);return s.customData._tokenResponse=t,s}/**
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
 */async function mh(n,e){return wt(n,"POST","/v1/accounts:delete",e)}async function Pn(n,e){return wt(n,"POST","/v1/accounts:lookup",e)}/**
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
 */function Vt(n){if(n)try{const e=new Date(Number(n));if(!isNaN(e.getTime()))return e.toUTCString()}catch{}}async function _h(n,e=!1){const t=Ne(n),r=await t.getIdToken(e),s=Yi(r);R(s&&s.exp&&s.auth_time&&s.iat,t.auth,"internal-error");const a=typeof s.firebase=="object"?s.firebase:void 0,l=a==null?void 0:a.sign_in_provider;return{claims:s,token:r,authTime:Vt(Ei(s.auth_time)),issuedAtTime:Vt(Ei(s.iat)),expirationTime:Vt(Ei(s.exp)),signInProvider:l||null,signInSecondFactor:(a==null?void 0:a.sign_in_second_factor)||null}}function Ei(n){return Number(n)*1e3}function Yi(n){const[e,t,r]=n.split(".");if(e===void 0||t===void 0||r===void 0)return En("JWT malformed, contained fewer than 3 sections"),null;try{const s=Io(t);return s?JSON.parse(s):(En("Failed to decode base64 JWT payload"),null)}catch(s){return En("Caught error parsing JWT payload as JSON",s==null?void 0:s.toString()),null}}function As(n){const e=Yi(n);return R(e,"internal-error"),R(typeof e.exp<"u","internal-error"),R(typeof e.iat<"u","internal-error"),Number(e.exp)-Number(e.iat)}/**
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
 */async function qt(n,e,t=!1){if(t)return e;try{return await e}catch(r){throw r instanceof ae&&yh(r)&&n.auth.currentUser===n&&await n.auth.signOut(),r}}function yh({code:n}){return n==="auth/user-disabled"||n==="auth/user-token-expired"}/**
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
 */class vh{constructor(e){this.user=e,this.isRunning=!1,this.timerId=null,this.errorBackoff=3e4}_start(){this.isRunning||(this.isRunning=!0,this.schedule())}_stop(){this.isRunning&&(this.isRunning=!1,this.timerId!==null&&clearTimeout(this.timerId))}getInterval(e){var t;if(e){const r=this.errorBackoff;return this.errorBackoff=Math.min(this.errorBackoff*2,96e4),r}else{this.errorBackoff=3e4;const s=((t=this.user.stsTokenManager.expirationTime)!==null&&t!==void 0?t:0)-Date.now()-3e5;return Math.max(0,s)}}schedule(e=!1){if(!this.isRunning)return;const t=this.getInterval(e);this.timerId=setTimeout(async()=>{await this.iteration()},t)}async iteration(){try{await this.user.getIdToken(!0)}catch(e){(e==null?void 0:e.code)==="auth/network-request-failed"&&this.schedule(!0);return}this.schedule()}}/**
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
 */class Ui{constructor(e,t){this.createdAt=e,this.lastLoginAt=t,this._initializeTime()}_initializeTime(){this.lastSignInTime=Vt(this.lastLoginAt),this.creationTime=Vt(this.createdAt)}_copy(e){this.createdAt=e.createdAt,this.lastLoginAt=e.lastLoginAt,this._initializeTime()}toJSON(){return{createdAt:this.createdAt,lastLoginAt:this.lastLoginAt}}}/**
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
 */async function On(n){var e;const t=n.auth,r=await n.getIdToken(),s=await qt(n,Pn(t,{idToken:r}));R(s==null?void 0:s.users.length,t,"internal-error");const a=s.users[0];n._notifyReloadListener(a);const l=!((e=a.providerUserInfo)===null||e===void 0)&&e.length?jo(a.providerUserInfo):[],u=wh(n.providerData,l),f=n.isAnonymous,w=!(n.email&&a.passwordHash)&&!(u!=null&&u.length),b=f?w:!1,S={uid:a.localId,displayName:a.displayName||null,photoURL:a.photoUrl||null,email:a.email||null,emailVerified:a.emailVerified||!1,phoneNumber:a.phoneNumber||null,tenantId:a.tenantId||null,providerData:u,metadata:new Ui(a.createdAt,a.lastLoginAt),isAnonymous:b};Object.assign(n,S)}async function Ih(n){const e=Ne(n);await On(e),await e.auth._persistUserIfCurrent(e),e.auth._notifyListenersIfCurrent(e)}function wh(n,e){return[...n.filter(r=>!e.some(s=>s.providerId===r.providerId)),...e]}function jo(n){return n.map(e=>{var{providerId:t}=e,r=qi(e,["providerId"]);return{providerId:t,uid:r.rawId||"",displayName:r.displayName||null,email:r.email||null,phoneNumber:r.phoneNumber||null,photoURL:r.photoUrl||null}})}/**
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
 */async function Th(n,e){const t=await xo(n,{},async()=>{const r=Jt({grant_type:"refresh_token",refresh_token:e}).slice(1),{tokenApiHost:s,apiKey:a}=n.config,l=await Fo(n,s,"/v1/token",`key=${a}`),u=await n._getAdditionalHeaders();u["Content-Type"]="application/x-www-form-urlencoded";const f={method:"POST",headers:u,body:r};return n.emulatorConfig&&It(n.emulatorConfig.host)&&(f.credentials="include"),Uo.fetch()(l,f)});return{accessToken:t.access_token,expiresIn:t.expires_in,refreshToken:t.refresh_token}}async function Eh(n,e){return wt(n,"POST","/v2/accounts:revokeToken",Xi(n,e))}/**
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
 */class pt{constructor(){this.refreshToken=null,this.accessToken=null,this.expirationTime=null}get isExpired(){return!this.expirationTime||Date.now()>this.expirationTime-3e4}updateFromServerResponse(e){R(e.idToken,"internal-error"),R(typeof e.idToken<"u","internal-error"),R(typeof e.refreshToken<"u","internal-error");const t="expiresIn"in e&&typeof e.expiresIn<"u"?Number(e.expiresIn):As(e.idToken);this.updateTokensAndExpiration(e.idToken,e.refreshToken,t)}updateFromIdToken(e){R(e.length!==0,"internal-error");const t=As(e);this.updateTokensAndExpiration(e,null,t)}async getToken(e,t=!1){return!t&&this.accessToken&&!this.isExpired?this.accessToken:(R(this.refreshToken,e,"user-token-expired"),this.refreshToken?(await this.refresh(e,this.refreshToken),this.accessToken):null)}clearRefreshToken(){this.refreshToken=null}async refresh(e,t){const{accessToken:r,refreshToken:s,expiresIn:a}=await Th(e,t);this.updateTokensAndExpiration(r,s,Number(a))}updateTokensAndExpiration(e,t,r){this.refreshToken=t||null,this.accessToken=e||null,this.expirationTime=Date.now()+r*1e3}static fromJSON(e,t){const{refreshToken:r,accessToken:s,expirationTime:a}=t,l=new pt;return r&&(R(typeof r=="string","internal-error",{appName:e}),l.refreshToken=r),s&&(R(typeof s=="string","internal-error",{appName:e}),l.accessToken=s),a&&(R(typeof a=="number","internal-error",{appName:e}),l.expirationTime=a),l}toJSON(){return{refreshToken:this.refreshToken,accessToken:this.accessToken,expirationTime:this.expirationTime}}_assign(e){this.accessToken=e.accessToken,this.refreshToken=e.refreshToken,this.expirationTime=e.expirationTime}_clone(){return Object.assign(new pt,this.toJSON())}_performRefresh(){return Re("not implemented")}}/**
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
 */function xe(n,e){R(typeof n=="string"||typeof n>"u","internal-error",{appName:e})}class ue{constructor(e){var{uid:t,auth:r,stsTokenManager:s}=e,a=qi(e,["uid","auth","stsTokenManager"]);this.providerId="firebase",this.proactiveRefresh=new vh(this),this.reloadUserInfo=null,this.reloadListener=null,this.uid=t,this.auth=r,this.stsTokenManager=s,this.accessToken=s.accessToken,this.displayName=a.displayName||null,this.email=a.email||null,this.emailVerified=a.emailVerified||!1,this.phoneNumber=a.phoneNumber||null,this.photoURL=a.photoURL||null,this.isAnonymous=a.isAnonymous||!1,this.tenantId=a.tenantId||null,this.providerData=a.providerData?[...a.providerData]:[],this.metadata=new Ui(a.createdAt||void 0,a.lastLoginAt||void 0)}async getIdToken(e){const t=await qt(this,this.stsTokenManager.getToken(this.auth,e));return R(t,this.auth,"internal-error"),this.accessToken!==t&&(this.accessToken=t,await this.auth._persistUserIfCurrent(this),this.auth._notifyListenersIfCurrent(this)),t}getIdTokenResult(e){return _h(this,e)}reload(){return Ih(this)}_assign(e){this!==e&&(R(this.uid===e.uid,this.auth,"internal-error"),this.displayName=e.displayName,this.photoURL=e.photoURL,this.email=e.email,this.emailVerified=e.emailVerified,this.phoneNumber=e.phoneNumber,this.isAnonymous=e.isAnonymous,this.tenantId=e.tenantId,this.providerData=e.providerData.map(t=>Object.assign({},t)),this.metadata._copy(e.metadata),this.stsTokenManager._assign(e.stsTokenManager))}_clone(e){const t=new ue(Object.assign(Object.assign({},this),{auth:e,stsTokenManager:this.stsTokenManager._clone()}));return t.metadata._copy(this.metadata),t}_onReload(e){R(!this.reloadListener,this.auth,"internal-error"),this.reloadListener=e,this.reloadUserInfo&&(this._notifyReloadListener(this.reloadUserInfo),this.reloadUserInfo=null)}_notifyReloadListener(e){this.reloadListener?this.reloadListener(e):this.reloadUserInfo=e}_startProactiveRefresh(){this.proactiveRefresh._start()}_stopProactiveRefresh(){this.proactiveRefresh._stop()}async _updateTokensIfNecessary(e,t=!1){let r=!1;e.idToken&&e.idToken!==this.stsTokenManager.accessToken&&(this.stsTokenManager.updateFromServerResponse(e),r=!0),t&&await On(this),await this.auth._persistUserIfCurrent(this),r&&this.auth._notifyListenersIfCurrent(this)}async delete(){if(he(this.auth.app))return Promise.reject(Qe(this.auth));const e=await this.getIdToken();return await qt(this,mh(this.auth,{idToken:e})),this.stsTokenManager.clearRefreshToken(),this.auth.signOut()}toJSON(){return Object.assign(Object.assign({uid:this.uid,email:this.email||void 0,emailVerified:this.emailVerified,displayName:this.displayName||void 0,isAnonymous:this.isAnonymous,photoURL:this.photoURL||void 0,phoneNumber:this.phoneNumber||void 0,tenantId:this.tenantId||void 0,providerData:this.providerData.map(e=>Object.assign({},e)),stsTokenManager:this.stsTokenManager.toJSON(),_redirectEventId:this._redirectEventId},this.metadata.toJSON()),{apiKey:this.auth.config.apiKey,appName:this.auth.name})}get refreshToken(){return this.stsTokenManager.refreshToken||""}static _fromJSON(e,t){var r,s,a,l,u,f,w,b;const S=(r=t.displayName)!==null&&r!==void 0?r:void 0,E=(s=t.email)!==null&&s!==void 0?s:void 0,P=(a=t.phoneNumber)!==null&&a!==void 0?a:void 0,k=(l=t.photoURL)!==null&&l!==void 0?l:void 0,U=(u=t.tenantId)!==null&&u!==void 0?u:void 0,C=(f=t._redirectEventId)!==null&&f!==void 0?f:void 0,z=(w=t.createdAt)!==null&&w!==void 0?w:void 0,$=(b=t.lastLoginAt)!==null&&b!==void 0?b:void 0,{uid:x,emailVerified:j,isAnonymous:re,providerData:W,stsTokenManager:y}=t;R(x&&y,e,"internal-error");const d=pt.fromJSON(this.name,y);R(typeof x=="string",e,"internal-error"),xe(S,e.name),xe(E,e.name),R(typeof j=="boolean",e,"internal-error"),R(typeof re=="boolean",e,"internal-error"),xe(P,e.name),xe(k,e.name),xe(U,e.name),xe(C,e.name),xe(z,e.name),xe($,e.name);const g=new ue({uid:x,auth:e,email:E,emailVerified:j,displayName:S,isAnonymous:re,photoURL:k,phoneNumber:P,tenantId:U,stsTokenManager:d,createdAt:z,lastLoginAt:$});return W&&Array.isArray(W)&&(g.providerData=W.map(m=>Object.assign({},m))),C&&(g._redirectEventId=C),g}static async _fromIdTokenResponse(e,t,r=!1){const s=new pt;s.updateFromServerResponse(t);const a=new ue({uid:t.localId,auth:e,stsTokenManager:s,isAnonymous:r});return await On(a),a}static async _fromGetAccountInfoResponse(e,t,r){const s=t.users[0];R(s.localId!==void 0,"internal-error");const a=s.providerUserInfo!==void 0?jo(s.providerUserInfo):[],l=!(s.email&&s.passwordHash)&&!(a!=null&&a.length),u=new pt;u.updateFromIdToken(r);const f=new ue({uid:s.localId,auth:e,stsTokenManager:u,isAnonymous:l}),w={uid:s.localId,displayName:s.displayName||null,photoURL:s.photoUrl||null,email:s.email||null,emailVerified:s.emailVerified||!1,phoneNumber:s.phoneNumber||null,tenantId:s.tenantId||null,providerData:a,metadata:new Ui(s.createdAt,s.lastLoginAt),isAnonymous:!(s.email&&s.passwordHash)&&!(a!=null&&a.length)};return Object.assign(f,w),f}}/**
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
 */const bs=new Map;function ke(n){Oe(n instanceof Function,"Expected a class definition");let e=bs.get(n);return e?(Oe(e instanceof n,"Instance stored in cache mismatched with class"),e):(e=new n,bs.set(n,e),e)}/**
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
 */class Vo{constructor(){this.type="NONE",this.storage={}}async _isAvailable(){return!0}async _set(e,t){this.storage[e]=t}async _get(e){const t=this.storage[e];return t===void 0?null:t}async _remove(e){delete this.storage[e]}_addListener(e,t){}_removeListener(e,t){}}Vo.type="NONE";const Ss=Vo;/**
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
 */function An(n,e,t){return`firebase:${n}:${e}:${t}`}class gt{constructor(e,t,r){this.persistence=e,this.auth=t,this.userKey=r;const{config:s,name:a}=this.auth;this.fullUserKey=An(this.userKey,s.apiKey,a),this.fullPersistenceKey=An("persistence",s.apiKey,a),this.boundEventHandler=t._onStorageEvent.bind(t),this.persistence._addListener(this.fullUserKey,this.boundEventHandler)}setCurrentUser(e){return this.persistence._set(this.fullUserKey,e.toJSON())}async getCurrentUser(){const e=await this.persistence._get(this.fullUserKey);if(!e)return null;if(typeof e=="string"){const t=await Pn(this.auth,{idToken:e}).catch(()=>{});return t?ue._fromGetAccountInfoResponse(this.auth,t,e):null}return ue._fromJSON(this.auth,e)}removeCurrentUser(){return this.persistence._remove(this.fullUserKey)}savePersistenceForRedirect(){return this.persistence._set(this.fullPersistenceKey,this.persistence.type)}async setPersistence(e){if(this.persistence===e)return;const t=await this.getCurrentUser();if(await this.removeCurrentUser(),this.persistence=e,t)return this.setCurrentUser(t)}delete(){this.persistence._removeListener(this.fullUserKey,this.boundEventHandler)}static async create(e,t,r="authUser"){if(!t.length)return new gt(ke(Ss),e,r);const s=(await Promise.all(t.map(async w=>{if(await w._isAvailable())return w}))).filter(w=>w);let a=s[0]||ke(Ss);const l=An(r,e.config.apiKey,e.name);let u=null;for(const w of t)try{const b=await w._get(l);if(b){let S;if(typeof b=="string"){const E=await Pn(e,{idToken:b}).catch(()=>{});if(!E)break;S=await ue._fromGetAccountInfoResponse(e,E,b)}else S=ue._fromJSON(e,b);w!==a&&(u=S),a=w;break}}catch{}const f=s.filter(w=>w._shouldAllowMigration);return!a._shouldAllowMigration||!f.length?new gt(a,e,r):(a=f[0],u&&await a._set(l,u.toJSON()),await Promise.all(t.map(async w=>{if(w!==a)try{await w._remove(l)}catch{}})),new gt(a,e,r))}}/**
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
 */function Rs(n){const e=n.toLowerCase();if(e.includes("opera/")||e.includes("opr/")||e.includes("opios/"))return"Opera";if(Wo(e))return"IEMobile";if(e.includes("msie")||e.includes("trident/"))return"IE";if(e.includes("edge/"))return"Edge";if(Bo(e))return"Firefox";if(e.includes("silk/"))return"Silk";if(Go(e))return"Blackberry";if(qo(e))return"Webos";if($o(e))return"Safari";if((e.includes("chrome/")||Ho(e))&&!e.includes("edge/"))return"Chrome";if(zo(e))return"Android";{const t=/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,r=n.match(t);if((r==null?void 0:r.length)===2)return r[1]}return"Other"}function Bo(n=ee()){return/firefox\//i.test(n)}function $o(n=ee()){const e=n.toLowerCase();return e.includes("safari/")&&!e.includes("chrome/")&&!e.includes("crios/")&&!e.includes("android")}function Ho(n=ee()){return/crios\//i.test(n)}function Wo(n=ee()){return/iemobile/i.test(n)}function zo(n=ee()){return/android/i.test(n)}function Go(n=ee()){return/blackberry/i.test(n)}function qo(n=ee()){return/webos/i.test(n)}function Zi(n=ee()){return/iphone|ipad|ipod/i.test(n)||/macintosh/i.test(n)&&/mobile/i.test(n)}function Ah(n=ee()){var e;return Zi(n)&&!!(!((e=window.navigator)===null||e===void 0)&&e.standalone)}function bh(){return Vc()&&document.documentMode===10}function Ko(n=ee()){return Zi(n)||zo(n)||qo(n)||Go(n)||/windows phone/i.test(n)||Wo(n)}/**
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
 */function Jo(n,e=[]){let t;switch(n){case"Browser":t=Rs(ee());break;case"Worker":t=`${Rs(ee())}-${n}`;break;default:t=n}const r=e.length?e.join(","):"FirebaseCore-web";return`${t}/JsCore/${at}/${r}`}/**
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
 */class Sh{constructor(e){this.auth=e,this.queue=[]}pushCallback(e,t){const r=a=>new Promise((l,u)=>{try{const f=e(a);l(f)}catch(f){u(f)}});r.onAbort=t,this.queue.push(r);const s=this.queue.length-1;return()=>{this.queue[s]=()=>Promise.resolve()}}async runMiddleware(e){if(this.auth.currentUser===e)return;const t=[];try{for(const r of this.queue)await r(e),r.onAbort&&t.push(r.onAbort)}catch(r){t.reverse();for(const s of t)try{s()}catch{}throw this.auth._errorFactory.create("login-blocked",{originalMessage:r==null?void 0:r.message})}}}/**
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
 */async function Rh(n,e={}){return wt(n,"GET","/v2/passwordPolicy",Xi(n,e))}/**
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
 */const kh=6;class Ch{constructor(e){var t,r,s,a;const l=e.customStrengthOptions;this.customStrengthOptions={},this.customStrengthOptions.minPasswordLength=(t=l.minPasswordLength)!==null&&t!==void 0?t:kh,l.maxPasswordLength&&(this.customStrengthOptions.maxPasswordLength=l.maxPasswordLength),l.containsLowercaseCharacter!==void 0&&(this.customStrengthOptions.containsLowercaseLetter=l.containsLowercaseCharacter),l.containsUppercaseCharacter!==void 0&&(this.customStrengthOptions.containsUppercaseLetter=l.containsUppercaseCharacter),l.containsNumericCharacter!==void 0&&(this.customStrengthOptions.containsNumericCharacter=l.containsNumericCharacter),l.containsNonAlphanumericCharacter!==void 0&&(this.customStrengthOptions.containsNonAlphanumericCharacter=l.containsNonAlphanumericCharacter),this.enforcementState=e.enforcementState,this.enforcementState==="ENFORCEMENT_STATE_UNSPECIFIED"&&(this.enforcementState="OFF"),this.allowedNonAlphanumericCharacters=(s=(r=e.allowedNonAlphanumericCharacters)===null||r===void 0?void 0:r.join(""))!==null&&s!==void 0?s:"",this.forceUpgradeOnSignin=(a=e.forceUpgradeOnSignin)!==null&&a!==void 0?a:!1,this.schemaVersion=e.schemaVersion}validatePassword(e){var t,r,s,a,l,u;const f={isValid:!0,passwordPolicy:this};return this.validatePasswordLengthOptions(e,f),this.validatePasswordCharacterOptions(e,f),f.isValid&&(f.isValid=(t=f.meetsMinPasswordLength)!==null&&t!==void 0?t:!0),f.isValid&&(f.isValid=(r=f.meetsMaxPasswordLength)!==null&&r!==void 0?r:!0),f.isValid&&(f.isValid=(s=f.containsLowercaseLetter)!==null&&s!==void 0?s:!0),f.isValid&&(f.isValid=(a=f.containsUppercaseLetter)!==null&&a!==void 0?a:!0),f.isValid&&(f.isValid=(l=f.containsNumericCharacter)!==null&&l!==void 0?l:!0),f.isValid&&(f.isValid=(u=f.containsNonAlphanumericCharacter)!==null&&u!==void 0?u:!0),f}validatePasswordLengthOptions(e,t){const r=this.customStrengthOptions.minPasswordLength,s=this.customStrengthOptions.maxPasswordLength;r&&(t.meetsMinPasswordLength=e.length>=r),s&&(t.meetsMaxPasswordLength=e.length<=s)}validatePasswordCharacterOptions(e,t){this.updatePasswordCharacterOptionsStatuses(t,!1,!1,!1,!1);let r;for(let s=0;s<e.length;s++)r=e.charAt(s),this.updatePasswordCharacterOptionsStatuses(t,r>="a"&&r<="z",r>="A"&&r<="Z",r>="0"&&r<="9",this.allowedNonAlphanumericCharacters.includes(r))}updatePasswordCharacterOptionsStatuses(e,t,r,s,a){this.customStrengthOptions.containsLowercaseLetter&&(e.containsLowercaseLetter||(e.containsLowercaseLetter=t)),this.customStrengthOptions.containsUppercaseLetter&&(e.containsUppercaseLetter||(e.containsUppercaseLetter=r)),this.customStrengthOptions.containsNumericCharacter&&(e.containsNumericCharacter||(e.containsNumericCharacter=s)),this.customStrengthOptions.containsNonAlphanumericCharacter&&(e.containsNonAlphanumericCharacter||(e.containsNonAlphanumericCharacter=a))}}/**
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
 */class Ph{constructor(e,t,r,s){this.app=e,this.heartbeatServiceProvider=t,this.appCheckServiceProvider=r,this.config=s,this.currentUser=null,this.emulatorConfig=null,this.operations=Promise.resolve(),this.authStateSubscription=new ks(this),this.idTokenSubscription=new ks(this),this.beforeStateQueue=new Sh(this),this.redirectUser=null,this.isProactiveRefreshEnabled=!1,this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION=1,this._canInitEmulator=!0,this._isInitialized=!1,this._deleted=!1,this._initializationPromise=null,this._popupRedirectResolver=null,this._errorFactory=Lo,this._agentRecaptchaConfig=null,this._tenantRecaptchaConfigs={},this._projectPasswordPolicy=null,this._tenantPasswordPolicies={},this._resolvePersistenceManagerAvailable=void 0,this.lastNotifiedUid=void 0,this.languageCode=null,this.tenantId=null,this.settings={appVerificationDisabledForTesting:!1},this.frameworks=[],this.name=e.name,this.clientVersion=s.sdkClientVersion,this._persistenceManagerAvailable=new Promise(a=>this._resolvePersistenceManagerAvailable=a)}_initializeWithPersistence(e,t){return t&&(this._popupRedirectResolver=ke(t)),this._initializationPromise=this.queue(async()=>{var r,s,a;if(!this._deleted&&(this.persistenceManager=await gt.create(this,e),(r=this._resolvePersistenceManagerAvailable)===null||r===void 0||r.call(this),!this._deleted)){if(!((s=this._popupRedirectResolver)===null||s===void 0)&&s._shouldInitProactively)try{await this._popupRedirectResolver._initialize(this)}catch{}await this.initializeCurrentUser(t),this.lastNotifiedUid=((a=this.currentUser)===null||a===void 0?void 0:a.uid)||null,!this._deleted&&(this._isInitialized=!0)}}),this._initializationPromise}async _onStorageEvent(){if(this._deleted)return;const e=await this.assertedPersistence.getCurrentUser();if(!(!this.currentUser&&!e)){if(this.currentUser&&e&&this.currentUser.uid===e.uid){this._currentUser._assign(e),await this.currentUser.getIdToken();return}await this._updateCurrentUser(e,!0)}}async initializeCurrentUserFromIdToken(e){try{const t=await Pn(this,{idToken:e}),r=await ue._fromGetAccountInfoResponse(this,t,e);await this.directlySetCurrentUser(r)}catch(t){console.warn("FirebaseServerApp could not login user with provided authIdToken: ",t),await this.directlySetCurrentUser(null)}}async initializeCurrentUser(e){var t;if(he(this.app)){const l=this.app.settings.authIdToken;return l?new Promise(u=>{setTimeout(()=>this.initializeCurrentUserFromIdToken(l).then(u,u))}):this.directlySetCurrentUser(null)}const r=await this.assertedPersistence.getCurrentUser();let s=r,a=!1;if(e&&this.config.authDomain){await this.getOrInitRedirectPersistenceManager();const l=(t=this.redirectUser)===null||t===void 0?void 0:t._redirectEventId,u=s==null?void 0:s._redirectEventId,f=await this.tryRedirectSignIn(e);(!l||l===u)&&(f!=null&&f.user)&&(s=f.user,a=!0)}if(!s)return this.directlySetCurrentUser(null);if(!s._redirectEventId){if(a)try{await this.beforeStateQueue.runMiddleware(s)}catch(l){s=r,this._popupRedirectResolver._overrideRedirectResult(this,()=>Promise.reject(l))}return s?this.reloadAndSetCurrentUserOrClear(s):this.directlySetCurrentUser(null)}return R(this._popupRedirectResolver,this,"argument-error"),await this.getOrInitRedirectPersistenceManager(),this.redirectUser&&this.redirectUser._redirectEventId===s._redirectEventId?this.directlySetCurrentUser(s):this.reloadAndSetCurrentUserOrClear(s)}async tryRedirectSignIn(e){let t=null;try{t=await this._popupRedirectResolver._completeRedirectFn(this,e,!0)}catch{await this._setRedirectUser(null)}return t}async reloadAndSetCurrentUserOrClear(e){try{await On(e)}catch(t){if((t==null?void 0:t.code)!=="auth/network-request-failed")return this.directlySetCurrentUser(null)}return this.directlySetCurrentUser(e)}useDeviceLanguage(){this.languageCode=hh()}async _delete(){this._deleted=!0}async updateCurrentUser(e){if(he(this.app))return Promise.reject(Qe(this));const t=e?Ne(e):null;return t&&R(t.auth.config.apiKey===this.config.apiKey,this,"invalid-user-token"),this._updateCurrentUser(t&&t._clone(this))}async _updateCurrentUser(e,t=!1){if(!this._deleted)return e&&R(this.tenantId===e.tenantId,this,"tenant-id-mismatch"),t||await this.beforeStateQueue.runMiddleware(e),this.queue(async()=>{await this.directlySetCurrentUser(e),this.notifyAuthListeners()})}async signOut(){return he(this.app)?Promise.reject(Qe(this)):(await this.beforeStateQueue.runMiddleware(null),(this.redirectPersistenceManager||this._popupRedirectResolver)&&await this._setRedirectUser(null),this._updateCurrentUser(null,!0))}setPersistence(e){return he(this.app)?Promise.reject(Qe(this)):this.queue(async()=>{await this.assertedPersistence.setPersistence(ke(e))})}_getRecaptchaConfig(){return this.tenantId==null?this._agentRecaptchaConfig:this._tenantRecaptchaConfigs[this.tenantId]}async validatePassword(e){this._getPasswordPolicyInternal()||await this._updatePasswordPolicy();const t=this._getPasswordPolicyInternal();return t.schemaVersion!==this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION?Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version",{})):t.validatePassword(e)}_getPasswordPolicyInternal(){return this.tenantId===null?this._projectPasswordPolicy:this._tenantPasswordPolicies[this.tenantId]}async _updatePasswordPolicy(){const e=await Rh(this),t=new Ch(e);this.tenantId===null?this._projectPasswordPolicy=t:this._tenantPasswordPolicies[this.tenantId]=t}_getPersistenceType(){return this.assertedPersistence.persistence.type}_getPersistence(){return this.assertedPersistence.persistence}_updateErrorMap(e){this._errorFactory=new ot("auth","Firebase",e())}onAuthStateChanged(e,t,r){return this.registerStateListener(this.authStateSubscription,e,t,r)}beforeAuthStateChanged(e,t){return this.beforeStateQueue.pushCallback(e,t)}onIdTokenChanged(e,t,r){return this.registerStateListener(this.idTokenSubscription,e,t,r)}authStateReady(){return new Promise((e,t)=>{if(this.currentUser)e();else{const r=this.onAuthStateChanged(()=>{r(),e()},t)}})}async revokeAccessToken(e){if(this.currentUser){const t=await this.currentUser.getIdToken(),r={providerId:"apple.com",tokenType:"ACCESS_TOKEN",token:e,idToken:t};this.tenantId!=null&&(r.tenantId=this.tenantId),await Eh(this,r)}}toJSON(){var e;return{apiKey:this.config.apiKey,authDomain:this.config.authDomain,appName:this.name,currentUser:(e=this._currentUser)===null||e===void 0?void 0:e.toJSON()}}async _setRedirectUser(e,t){const r=await this.getOrInitRedirectPersistenceManager(t);return e===null?r.removeCurrentUser():r.setCurrentUser(e)}async getOrInitRedirectPersistenceManager(e){if(!this.redirectPersistenceManager){const t=e&&ke(e)||this._popupRedirectResolver;R(t,this,"argument-error"),this.redirectPersistenceManager=await gt.create(this,[ke(t._redirectPersistence)],"redirectUser"),this.redirectUser=await this.redirectPersistenceManager.getCurrentUser()}return this.redirectPersistenceManager}async _redirectUserForId(e){var t,r;return this._isInitialized&&await this.queue(async()=>{}),((t=this._currentUser)===null||t===void 0?void 0:t._redirectEventId)===e?this._currentUser:((r=this.redirectUser)===null||r===void 0?void 0:r._redirectEventId)===e?this.redirectUser:null}async _persistUserIfCurrent(e){if(e===this.currentUser)return this.queue(async()=>this.directlySetCurrentUser(e))}_notifyListenersIfCurrent(e){e===this.currentUser&&this.notifyAuthListeners()}_key(){return`${this.config.authDomain}:${this.config.apiKey}:${this.name}`}_startProactiveRefresh(){this.isProactiveRefreshEnabled=!0,this.currentUser&&this._currentUser._startProactiveRefresh()}_stopProactiveRefresh(){this.isProactiveRefreshEnabled=!1,this.currentUser&&this._currentUser._stopProactiveRefresh()}get _currentUser(){return this.currentUser}notifyAuthListeners(){var e,t;if(!this._isInitialized)return;this.idTokenSubscription.next(this.currentUser);const r=(t=(e=this.currentUser)===null||e===void 0?void 0:e.uid)!==null&&t!==void 0?t:null;this.lastNotifiedUid!==r&&(this.lastNotifiedUid=r,this.authStateSubscription.next(this.currentUser))}registerStateListener(e,t,r,s){if(this._deleted)return()=>{};const a=typeof t=="function"?t:t.next.bind(t);let l=!1;const u=this._isInitialized?Promise.resolve():this._initializationPromise;if(R(u,this,"internal-error"),u.then(()=>{l||a(this.currentUser)}),typeof t=="function"){const f=e.addObserver(t,r,s);return()=>{l=!0,f()}}else{const f=e.addObserver(t);return()=>{l=!0,f()}}}async directlySetCurrentUser(e){this.currentUser&&this.currentUser!==e&&this._currentUser._stopProactiveRefresh(),e&&this.isProactiveRefreshEnabled&&e._startProactiveRefresh(),this.currentUser=e,e?await this.assertedPersistence.setCurrentUser(e):await this.assertedPersistence.removeCurrentUser()}queue(e){return this.operations=this.operations.then(e,e),this.operations}get assertedPersistence(){return R(this.persistenceManager,this,"internal-error"),this.persistenceManager}_logFramework(e){!e||this.frameworks.includes(e)||(this.frameworks.push(e),this.frameworks.sort(),this.clientVersion=Jo(this.config.clientPlatform,this._getFrameworks()))}_getFrameworks(){return this.frameworks}async _getAdditionalHeaders(){var e;const t={"X-Client-Version":this.clientVersion};this.app.options.appId&&(t["X-Firebase-gmpid"]=this.app.options.appId);const r=await((e=this.heartbeatServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getHeartbeatsHeader());r&&(t["X-Firebase-Client"]=r);const s=await this._getAppCheckToken();return s&&(t["X-Firebase-AppCheck"]=s),t}async _getAppCheckToken(){var e;if(he(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const t=await((e=this.appCheckServiceProvider.getImmediate({optional:!0}))===null||e===void 0?void 0:e.getToken());return t!=null&&t.error&&ah(`Error while retrieving App Check token: ${t.error}`),t==null?void 0:t.token}}function Qi(n){return Ne(n)}class ks{constructor(e){this.auth=e,this.observer=null,this.addObserver=zc(t=>this.observer=t)}get next(){return R(this.observer,this.auth,"internal-error"),this.observer.next.bind(this.observer)}}/**
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
 */let er={async loadJS(){throw new Error("Unable to load external scripts")},recaptchaV2Script:"",recaptchaEnterpriseScript:"",gapiScript:""};function Oh(n){er=n}function Nh(n){return er.loadJS(n)}function Dh(){return er.gapiScript}function Lh(n){return`__${n}${Math.floor(Math.random()*1e6)}`}/**
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
 */function Mh(n,e){const t=ze(n,"auth");if(t.isInitialized()){const s=t.getImmediate(),a=t.getOptions();if(We(a,e??{}))return s;Pe(s,"already-initialized")}return t.initialize({options:e})}function Uh(n,e){const t=(e==null?void 0:e.persistence)||[],r=(Array.isArray(t)?t:[t]).map(ke);e!=null&&e.errorMap&&n._updateErrorMap(e.errorMap),n._initializeWithPersistence(r,e==null?void 0:e.popupRedirectResolver)}function xh(n,e,t){const r=Qi(n);R(/^https?:\/\//.test(e),r,"invalid-emulator-scheme");const s=!1,a=Xo(e),{host:l,port:u}=Fh(e),f=u===null?"":`:${u}`,w={url:`${a}//${l}${f}/`},b=Object.freeze({host:l,port:u,protocol:a.replace(":",""),options:Object.freeze({disableWarnings:s})});if(!r._canInitEmulator){R(r.config.emulator&&r.emulatorConfig,r,"emulator-config-failed"),R(We(w,r.config.emulator)&&We(b,r.emulatorConfig),r,"emulator-config-failed");return}r.config.emulator=w,r.emulatorConfig=b,r.settings.appVerificationDisabledForTesting=!0,It(l)?(Bi(`${a}//${l}${f}`),$i("Auth",!0)):jh()}function Xo(n){const e=n.indexOf(":");return e<0?"":n.substr(0,e+1)}function Fh(n){const e=Xo(n),t=/(\/\/)?([^?#/]+)/.exec(n.substr(e.length));if(!t)return{host:"",port:null};const r=t[2].split("@").pop()||"",s=/^(\[[^\]]+\])(:|$)/.exec(r);if(s){const a=s[1];return{host:a,port:Cs(r.substr(a.length+1))}}else{const[a,l]=r.split(":");return{host:a,port:Cs(l)}}}function Cs(n){if(!n)return null;const e=Number(n);return isNaN(e)?null:e}function jh(){function n(){const e=document.createElement("p"),t=e.style;e.innerText="Running in emulator mode. Do not use with production credentials.",t.position="fixed",t.width="100%",t.backgroundColor="#ffffff",t.border=".1em solid #000000",t.color="#b50000",t.bottom="0px",t.left="0px",t.margin="0px",t.zIndex="10000",t.textAlign="center",e.classList.add("firebase-emulator-warning"),document.body.appendChild(e)}typeof console<"u"&&typeof console.info=="function"&&console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."),typeof window<"u"&&typeof document<"u"&&(document.readyState==="loading"?window.addEventListener("DOMContentLoaded",n):n())}/**
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
 */class Yo{constructor(e,t){this.providerId=e,this.signInMethod=t}toJSON(){return Re("not implemented")}_getIdTokenResponse(e){return Re("not implemented")}_linkToIdToken(e,t){return Re("not implemented")}_getReauthenticationResolver(e){return Re("not implemented")}}/**
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
 */async function mt(n,e){return ph(n,"POST","/v1/accounts:signInWithIdp",Xi(n,e))}/**
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
 */const Vh="http://localhost";class nt extends Yo{constructor(){super(...arguments),this.pendingToken=null}static _fromParams(e){const t=new nt(e.providerId,e.signInMethod);return e.idToken||e.accessToken?(e.idToken&&(t.idToken=e.idToken),e.accessToken&&(t.accessToken=e.accessToken),e.nonce&&!e.pendingToken&&(t.nonce=e.nonce),e.pendingToken&&(t.pendingToken=e.pendingToken)):e.oauthToken&&e.oauthTokenSecret?(t.accessToken=e.oauthToken,t.secret=e.oauthTokenSecret):Pe("argument-error"),t}toJSON(){return{idToken:this.idToken,accessToken:this.accessToken,secret:this.secret,nonce:this.nonce,pendingToken:this.pendingToken,providerId:this.providerId,signInMethod:this.signInMethod}}static fromJSON(e){const t=typeof e=="string"?JSON.parse(e):e,{providerId:r,signInMethod:s}=t,a=qi(t,["providerId","signInMethod"]);if(!r||!s)return null;const l=new nt(r,s);return l.idToken=a.idToken||void 0,l.accessToken=a.accessToken||void 0,l.secret=a.secret,l.nonce=a.nonce,l.pendingToken=a.pendingToken||null,l}_getIdTokenResponse(e){const t=this.buildRequest();return mt(e,t)}_linkToIdToken(e,t){const r=this.buildRequest();return r.idToken=t,mt(e,r)}_getReauthenticationResolver(e){const t=this.buildRequest();return t.autoCreate=!1,mt(e,t)}buildRequest(){const e={requestUri:Vh,returnSecureToken:!0};if(this.pendingToken)e.pendingToken=this.pendingToken;else{const t={};this.idToken&&(t.id_token=this.idToken),this.accessToken&&(t.access_token=this.accessToken),this.secret&&(t.oauth_token_secret=this.secret),t.providerId=this.providerId,this.nonce&&!this.pendingToken&&(t.nonce=this.nonce),e.postBody=Jt(t)}return e}}/**
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
 */class Zo{constructor(e){this.providerId=e,this.defaultLanguageCode=null,this.customParameters={}}setDefaultLanguage(e){this.defaultLanguageCode=e}setCustomParameters(e){return this.customParameters=e,this}getCustomParameters(){return this.customParameters}}/**
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
 */class Zt extends Zo{constructor(){super(...arguments),this.scopes=[]}addScope(e){return this.scopes.includes(e)||this.scopes.push(e),this}getScopes(){return[...this.scopes]}}/**
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
 */class Fe extends Zt{constructor(){super("facebook.com")}static credential(e){return nt._fromParams({providerId:Fe.PROVIDER_ID,signInMethod:Fe.FACEBOOK_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Fe.credentialFromTaggedObject(e)}static credentialFromError(e){return Fe.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Fe.credential(e.oauthAccessToken)}catch{return null}}}Fe.FACEBOOK_SIGN_IN_METHOD="facebook.com";Fe.PROVIDER_ID="facebook.com";/**
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
 */class je extends Zt{constructor(){super("google.com"),this.addScope("profile")}static credential(e,t){return nt._fromParams({providerId:je.PROVIDER_ID,signInMethod:je.GOOGLE_SIGN_IN_METHOD,idToken:e,accessToken:t})}static credentialFromResult(e){return je.credentialFromTaggedObject(e)}static credentialFromError(e){return je.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthIdToken:t,oauthAccessToken:r}=e;if(!t&&!r)return null;try{return je.credential(t,r)}catch{return null}}}je.GOOGLE_SIGN_IN_METHOD="google.com";je.PROVIDER_ID="google.com";/**
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
 */class Ve extends Zt{constructor(){super("github.com")}static credential(e){return nt._fromParams({providerId:Ve.PROVIDER_ID,signInMethod:Ve.GITHUB_SIGN_IN_METHOD,accessToken:e})}static credentialFromResult(e){return Ve.credentialFromTaggedObject(e)}static credentialFromError(e){return Ve.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e||!("oauthAccessToken"in e)||!e.oauthAccessToken)return null;try{return Ve.credential(e.oauthAccessToken)}catch{return null}}}Ve.GITHUB_SIGN_IN_METHOD="github.com";Ve.PROVIDER_ID="github.com";/**
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
 */class Be extends Zt{constructor(){super("twitter.com")}static credential(e,t){return nt._fromParams({providerId:Be.PROVIDER_ID,signInMethod:Be.TWITTER_SIGN_IN_METHOD,oauthToken:e,oauthTokenSecret:t})}static credentialFromResult(e){return Be.credentialFromTaggedObject(e)}static credentialFromError(e){return Be.credentialFromTaggedObject(e.customData||{})}static credentialFromTaggedObject({_tokenResponse:e}){if(!e)return null;const{oauthAccessToken:t,oauthTokenSecret:r}=e;if(!t||!r)return null;try{return Be.credential(t,r)}catch{return null}}}Be.TWITTER_SIGN_IN_METHOD="twitter.com";Be.PROVIDER_ID="twitter.com";/**
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
 */class yt{constructor(e){this.user=e.user,this.providerId=e.providerId,this._tokenResponse=e._tokenResponse,this.operationType=e.operationType}static async _fromIdTokenResponse(e,t,r,s=!1){const a=await ue._fromIdTokenResponse(e,r,s),l=Ps(r);return new yt({user:a,providerId:l,_tokenResponse:r,operationType:t})}static async _forOperation(e,t,r){await e._updateTokensIfNecessary(r,!0);const s=Ps(r);return new yt({user:e,providerId:s,_tokenResponse:r,operationType:t})}}function Ps(n){return n.providerId?n.providerId:"phoneNumber"in n?"phone":null}/**
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
 */class Nn extends ae{constructor(e,t,r,s){var a;super(t.code,t.message),this.operationType=r,this.user=s,Object.setPrototypeOf(this,Nn.prototype),this.customData={appName:e.name,tenantId:(a=e.tenantId)!==null&&a!==void 0?a:void 0,_serverResponse:t.customData._serverResponse,operationType:r}}static _fromErrorAndOperation(e,t,r,s){return new Nn(e,t,r,s)}}function Qo(n,e,t,r){return(e==="reauthenticate"?t._getReauthenticationResolver(n):t._getIdTokenResponse(n)).catch(a=>{throw a.code==="auth/multi-factor-auth-required"?Nn._fromErrorAndOperation(n,a,e,r):a})}async function Bh(n,e,t=!1){const r=await qt(n,e._linkToIdToken(n.auth,await n.getIdToken()),t);return yt._forOperation(n,"link",r)}/**
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
 */async function $h(n,e,t=!1){const{auth:r}=n;if(he(r.app))return Promise.reject(Qe(r));const s="reauthenticate";try{const a=await qt(n,Qo(r,s,e,n),t);R(a.idToken,r,"internal-error");const l=Yi(a.idToken);R(l,r,"internal-error");const{sub:u}=l;return R(n.uid===u,r,"user-mismatch"),yt._forOperation(n,s,a)}catch(a){throw(a==null?void 0:a.code)==="auth/user-not-found"&&Pe(r,"user-mismatch"),a}}/**
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
 */async function Hh(n,e,t=!1){if(he(n.app))return Promise.reject(Qe(n));const r="signIn",s=await Qo(n,r,e),a=await yt._fromIdTokenResponse(n,r,s);return t||await n._updateCurrentUser(a.user),a}function Wh(n,e,t,r){return Ne(n).onIdTokenChanged(e,t,r)}function zh(n,e,t){return Ne(n).beforeAuthStateChanged(e,t)}const Dn="__sak";/**
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
 */class ea{constructor(e,t){this.storageRetriever=e,this.type=t}_isAvailable(){try{return this.storage?(this.storage.setItem(Dn,"1"),this.storage.removeItem(Dn),Promise.resolve(!0)):Promise.resolve(!1)}catch{return Promise.resolve(!1)}}_set(e,t){return this.storage.setItem(e,JSON.stringify(t)),Promise.resolve()}_get(e){const t=this.storage.getItem(e);return Promise.resolve(t?JSON.parse(t):null)}_remove(e){return this.storage.removeItem(e),Promise.resolve()}get storage(){return this.storageRetriever()}}/**
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
 */const Gh=1e3,qh=10;class ta extends ea{constructor(){super(()=>window.localStorage,"LOCAL"),this.boundEventHandler=(e,t)=>this.onStorageEvent(e,t),this.listeners={},this.localCache={},this.pollTimer=null,this.fallbackToPolling=Ko(),this._shouldAllowMigration=!0}forAllChangedKeys(e){for(const t of Object.keys(this.listeners)){const r=this.storage.getItem(t),s=this.localCache[t];r!==s&&e(t,s,r)}}onStorageEvent(e,t=!1){if(!e.key){this.forAllChangedKeys((l,u,f)=>{this.notifyListeners(l,f)});return}const r=e.key;t?this.detachListener():this.stopPolling();const s=()=>{const l=this.storage.getItem(r);!t&&this.localCache[r]===l||this.notifyListeners(r,l)},a=this.storage.getItem(r);bh()&&a!==e.newValue&&e.newValue!==e.oldValue?setTimeout(s,qh):s()}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t&&JSON.parse(t))}startPolling(){this.stopPolling(),this.pollTimer=setInterval(()=>{this.forAllChangedKeys((e,t,r)=>{this.onStorageEvent(new StorageEvent("storage",{key:e,oldValue:t,newValue:r}),!0)})},Gh)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}attachListener(){window.addEventListener("storage",this.boundEventHandler)}detachListener(){window.removeEventListener("storage",this.boundEventHandler)}_addListener(e,t){Object.keys(this.listeners).length===0&&(this.fallbackToPolling?this.startPolling():this.attachListener()),this.listeners[e]||(this.listeners[e]=new Set,this.localCache[e]=this.storage.getItem(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&(this.detachListener(),this.stopPolling())}async _set(e,t){await super._set(e,t),this.localCache[e]=JSON.stringify(t)}async _get(e){const t=await super._get(e);return this.localCache[e]=JSON.stringify(t),t}async _remove(e){await super._remove(e),delete this.localCache[e]}}ta.type="LOCAL";const Kh=ta;/**
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
 */class na extends ea{constructor(){super(()=>window.sessionStorage,"SESSION")}_addListener(e,t){}_removeListener(e,t){}}na.type="SESSION";const ia=na;/**
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
 */function Jh(n){return Promise.all(n.map(async e=>{try{return{fulfilled:!0,value:await e}}catch(t){return{fulfilled:!1,reason:t}}}))}/**
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
 */class Bn{constructor(e){this.eventTarget=e,this.handlersMap={},this.boundEventHandler=this.handleEvent.bind(this)}static _getInstance(e){const t=this.receivers.find(s=>s.isListeningto(e));if(t)return t;const r=new Bn(e);return this.receivers.push(r),r}isListeningto(e){return this.eventTarget===e}async handleEvent(e){const t=e,{eventId:r,eventType:s,data:a}=t.data,l=this.handlersMap[s];if(!(l!=null&&l.size))return;t.ports[0].postMessage({status:"ack",eventId:r,eventType:s});const u=Array.from(l).map(async w=>w(t.origin,a)),f=await Jh(u);t.ports[0].postMessage({status:"done",eventId:r,eventType:s,response:f})}_subscribe(e,t){Object.keys(this.handlersMap).length===0&&this.eventTarget.addEventListener("message",this.boundEventHandler),this.handlersMap[e]||(this.handlersMap[e]=new Set),this.handlersMap[e].add(t)}_unsubscribe(e,t){this.handlersMap[e]&&t&&this.handlersMap[e].delete(t),(!t||this.handlersMap[e].size===0)&&delete this.handlersMap[e],Object.keys(this.handlersMap).length===0&&this.eventTarget.removeEventListener("message",this.boundEventHandler)}}Bn.receivers=[];/**
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
 */function tr(n="",e=10){let t="";for(let r=0;r<e;r++)t+=Math.floor(Math.random()*10);return n+t}/**
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
 */class Xh{constructor(e){this.target=e,this.handlers=new Set}removeMessageHandler(e){e.messageChannel&&(e.messageChannel.port1.removeEventListener("message",e.onMessage),e.messageChannel.port1.close()),this.handlers.delete(e)}async _send(e,t,r=50){const s=typeof MessageChannel<"u"?new MessageChannel:null;if(!s)throw new Error("connection_unavailable");let a,l;return new Promise((u,f)=>{const w=tr("",20);s.port1.start();const b=setTimeout(()=>{f(new Error("unsupported_event"))},r);l={messageChannel:s,onMessage(S){const E=S;if(E.data.eventId===w)switch(E.data.status){case"ack":clearTimeout(b),a=setTimeout(()=>{f(new Error("timeout"))},3e3);break;case"done":clearTimeout(a),u(E.data.response);break;default:clearTimeout(b),clearTimeout(a),f(new Error("invalid_response"));break}}},this.handlers.add(l),s.port1.addEventListener("message",l.onMessage),this.target.postMessage({eventType:e,eventId:w,data:t},[s.port2])}).finally(()=>{l&&this.removeMessageHandler(l)})}}/**
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
 */function Ie(){return window}function Yh(n){Ie().location.href=n}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */function ra(){return typeof Ie().WorkerGlobalScope<"u"&&typeof Ie().importScripts=="function"}async function Zh(){if(!(navigator!=null&&navigator.serviceWorker))return null;try{return(await navigator.serviceWorker.ready).active}catch{return null}}function Qh(){var n;return((n=navigator==null?void 0:navigator.serviceWorker)===null||n===void 0?void 0:n.controller)||null}function eu(){return ra()?self:null}/**
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
 */const sa="firebaseLocalStorageDb",tu=1,Ln="firebaseLocalStorage",oa="fbase_key";class Qt{constructor(e){this.request=e}toPromise(){return new Promise((e,t)=>{this.request.addEventListener("success",()=>{e(this.request.result)}),this.request.addEventListener("error",()=>{t(this.request.error)})})}}function $n(n,e){return n.transaction([Ln],e?"readwrite":"readonly").objectStore(Ln)}function nu(){const n=indexedDB.deleteDatabase(sa);return new Qt(n).toPromise()}function xi(){const n=indexedDB.open(sa,tu);return new Promise((e,t)=>{n.addEventListener("error",()=>{t(n.error)}),n.addEventListener("upgradeneeded",()=>{const r=n.result;try{r.createObjectStore(Ln,{keyPath:oa})}catch(s){t(s)}}),n.addEventListener("success",async()=>{const r=n.result;r.objectStoreNames.contains(Ln)?e(r):(r.close(),await nu(),e(await xi()))})})}async function Os(n,e,t){const r=$n(n,!0).put({[oa]:e,value:t});return new Qt(r).toPromise()}async function iu(n,e){const t=$n(n,!1).get(e),r=await new Qt(t).toPromise();return r===void 0?null:r.value}function Ns(n,e){const t=$n(n,!0).delete(e);return new Qt(t).toPromise()}const ru=800,su=3;class aa{constructor(){this.type="LOCAL",this._shouldAllowMigration=!0,this.listeners={},this.localCache={},this.pollTimer=null,this.pendingWrites=0,this.receiver=null,this.sender=null,this.serviceWorkerReceiverAvailable=!1,this.activeServiceWorker=null,this._workerInitializationPromise=this.initializeServiceWorkerMessaging().then(()=>{},()=>{})}async _openDb(){return this.db?this.db:(this.db=await xi(),this.db)}async _withRetries(e){let t=0;for(;;)try{const r=await this._openDb();return await e(r)}catch(r){if(t++>su)throw r;this.db&&(this.db.close(),this.db=void 0)}}async initializeServiceWorkerMessaging(){return ra()?this.initializeReceiver():this.initializeSender()}async initializeReceiver(){this.receiver=Bn._getInstance(eu()),this.receiver._subscribe("keyChanged",async(e,t)=>({keyProcessed:(await this._poll()).includes(t.key)})),this.receiver._subscribe("ping",async(e,t)=>["keyChanged"])}async initializeSender(){var e,t;if(this.activeServiceWorker=await Zh(),!this.activeServiceWorker)return;this.sender=new Xh(this.activeServiceWorker);const r=await this.sender._send("ping",{},800);r&&!((e=r[0])===null||e===void 0)&&e.fulfilled&&!((t=r[0])===null||t===void 0)&&t.value.includes("keyChanged")&&(this.serviceWorkerReceiverAvailable=!0)}async notifyServiceWorker(e){if(!(!this.sender||!this.activeServiceWorker||Qh()!==this.activeServiceWorker))try{await this.sender._send("keyChanged",{key:e},this.serviceWorkerReceiverAvailable?800:50)}catch{}}async _isAvailable(){try{if(!indexedDB)return!1;const e=await xi();return await Os(e,Dn,"1"),await Ns(e,Dn),!0}catch{}return!1}async _withPendingWrite(e){this.pendingWrites++;try{await e()}finally{this.pendingWrites--}}async _set(e,t){return this._withPendingWrite(async()=>(await this._withRetries(r=>Os(r,e,t)),this.localCache[e]=t,this.notifyServiceWorker(e)))}async _get(e){const t=await this._withRetries(r=>iu(r,e));return this.localCache[e]=t,t}async _remove(e){return this._withPendingWrite(async()=>(await this._withRetries(t=>Ns(t,e)),delete this.localCache[e],this.notifyServiceWorker(e)))}async _poll(){const e=await this._withRetries(s=>{const a=$n(s,!1).getAll();return new Qt(a).toPromise()});if(!e)return[];if(this.pendingWrites!==0)return[];const t=[],r=new Set;if(e.length!==0)for(const{fbase_key:s,value:a}of e)r.add(s),JSON.stringify(this.localCache[s])!==JSON.stringify(a)&&(this.notifyListeners(s,a),t.push(s));for(const s of Object.keys(this.localCache))this.localCache[s]&&!r.has(s)&&(this.notifyListeners(s,null),t.push(s));return t}notifyListeners(e,t){this.localCache[e]=t;const r=this.listeners[e];if(r)for(const s of Array.from(r))s(t)}startPolling(){this.stopPolling(),this.pollTimer=setInterval(async()=>this._poll(),ru)}stopPolling(){this.pollTimer&&(clearInterval(this.pollTimer),this.pollTimer=null)}_addListener(e,t){Object.keys(this.listeners).length===0&&this.startPolling(),this.listeners[e]||(this.listeners[e]=new Set,this._get(e)),this.listeners[e].add(t)}_removeListener(e,t){this.listeners[e]&&(this.listeners[e].delete(t),this.listeners[e].size===0&&delete this.listeners[e]),Object.keys(this.listeners).length===0&&this.stopPolling()}}aa.type="LOCAL";const ou=aa;new Yt(3e4,6e4);/**
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
 */function au(n,e){return e?ke(e):(R(n._popupRedirectResolver,n,"argument-error"),n._popupRedirectResolver)}/**
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
 */class nr extends Yo{constructor(e){super("custom","custom"),this.params=e}_getIdTokenResponse(e){return mt(e,this._buildIdpRequest())}_linkToIdToken(e,t){return mt(e,this._buildIdpRequest(t))}_getReauthenticationResolver(e){return mt(e,this._buildIdpRequest())}_buildIdpRequest(e){const t={requestUri:this.params.requestUri,sessionId:this.params.sessionId,postBody:this.params.postBody,tenantId:this.params.tenantId,pendingToken:this.params.pendingToken,returnSecureToken:!0,returnIdpCredential:!0};return e&&(t.idToken=e),t}}function cu(n){return Hh(n.auth,new nr(n),n.bypassAuthState)}function lu(n){const{auth:e,user:t}=n;return R(t,e,"internal-error"),$h(t,new nr(n),n.bypassAuthState)}async function hu(n){const{auth:e,user:t}=n;return R(t,e,"internal-error"),Bh(t,new nr(n),n.bypassAuthState)}/**
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
 */class ca{constructor(e,t,r,s,a=!1){this.auth=e,this.resolver=r,this.user=s,this.bypassAuthState=a,this.pendingPromise=null,this.eventManager=null,this.filter=Array.isArray(t)?t:[t]}execute(){return new Promise(async(e,t)=>{this.pendingPromise={resolve:e,reject:t};try{this.eventManager=await this.resolver._initialize(this.auth),await this.onExecution(),this.eventManager.registerConsumer(this)}catch(r){this.reject(r)}})}async onAuthEvent(e){const{urlResponse:t,sessionId:r,postBody:s,tenantId:a,error:l,type:u}=e;if(l){this.reject(l);return}const f={auth:this.auth,requestUri:t,sessionId:r,tenantId:a||void 0,postBody:s||void 0,user:this.user,bypassAuthState:this.bypassAuthState};try{this.resolve(await this.getIdpTask(u)(f))}catch(w){this.reject(w)}}onError(e){this.reject(e)}getIdpTask(e){switch(e){case"signInViaPopup":case"signInViaRedirect":return cu;case"linkViaPopup":case"linkViaRedirect":return hu;case"reauthViaPopup":case"reauthViaRedirect":return lu;default:Pe(this.auth,"internal-error")}}resolve(e){Oe(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.resolve(e),this.unregisterAndCleanUp()}reject(e){Oe(this.pendingPromise,"Pending promise was never set"),this.pendingPromise.reject(e),this.unregisterAndCleanUp()}unregisterAndCleanUp(){this.eventManager&&this.eventManager.unregisterConsumer(this),this.pendingPromise=null,this.cleanUp()}}/**
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
 */const uu=new Yt(2e3,1e4);class ft extends ca{constructor(e,t,r,s,a){super(e,t,s,a),this.provider=r,this.authWindow=null,this.pollId=null,ft.currentPopupAction&&ft.currentPopupAction.cancel(),ft.currentPopupAction=this}async executeNotNull(){const e=await this.execute();return R(e,this.auth,"internal-error"),e}async onExecution(){Oe(this.filter.length===1,"Popup operations only handle one event");const e=tr();this.authWindow=await this.resolver._openPopup(this.auth,this.provider,this.filter[0],e),this.authWindow.associatedEvent=e,this.resolver._originValidation(this.auth).catch(t=>{this.reject(t)}),this.resolver._isIframeWebStorageSupported(this.auth,t=>{t||this.reject(ve(this.auth,"web-storage-unsupported"))}),this.pollUserCancellation()}get eventId(){var e;return((e=this.authWindow)===null||e===void 0?void 0:e.associatedEvent)||null}cancel(){this.reject(ve(this.auth,"cancelled-popup-request"))}cleanUp(){this.authWindow&&this.authWindow.close(),this.pollId&&window.clearTimeout(this.pollId),this.authWindow=null,this.pollId=null,ft.currentPopupAction=null}pollUserCancellation(){const e=()=>{var t,r;if(!((r=(t=this.authWindow)===null||t===void 0?void 0:t.window)===null||r===void 0)&&r.closed){this.pollId=window.setTimeout(()=>{this.pollId=null,this.reject(ve(this.auth,"popup-closed-by-user"))},8e3);return}this.pollId=window.setTimeout(e,uu.get())};e()}}ft.currentPopupAction=null;/**
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
 */const du="pendingRedirect",bn=new Map;class fu extends ca{constructor(e,t,r=!1){super(e,["signInViaRedirect","linkViaRedirect","reauthViaRedirect","unknown"],t,void 0,r),this.eventId=null}async execute(){let e=bn.get(this.auth._key());if(!e){try{const r=await pu(this.resolver,this.auth)?await super.execute():null;e=()=>Promise.resolve(r)}catch(t){e=()=>Promise.reject(t)}bn.set(this.auth._key(),e)}return this.bypassAuthState||bn.set(this.auth._key(),()=>Promise.resolve(null)),e()}async onAuthEvent(e){if(e.type==="signInViaRedirect")return super.onAuthEvent(e);if(e.type==="unknown"){this.resolve(null);return}if(e.eventId){const t=await this.auth._redirectUserForId(e.eventId);if(t)return this.user=t,super.onAuthEvent(e);this.resolve(null)}}async onExecution(){}cleanUp(){}}async function pu(n,e){const t=_u(e),r=mu(n);if(!await r._isAvailable())return!1;const s=await r._get(t)==="true";return await r._remove(t),s}function gu(n,e){bn.set(n._key(),e)}function mu(n){return ke(n._redirectPersistence)}function _u(n){return An(du,n.config.apiKey,n.name)}async function yu(n,e,t=!1){if(he(n.app))return Promise.reject(Qe(n));const r=Qi(n),s=au(r,e),l=await new fu(r,s,t).execute();return l&&!t&&(delete l.user._redirectEventId,await r._persistUserIfCurrent(l.user),await r._setRedirectUser(null,e)),l}/**
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
 */const vu=600*1e3;class Iu{constructor(e){this.auth=e,this.cachedEventUids=new Set,this.consumers=new Set,this.queuedRedirectEvent=null,this.hasHandledPotentialRedirect=!1,this.lastProcessedEventTime=Date.now()}registerConsumer(e){this.consumers.add(e),this.queuedRedirectEvent&&this.isEventForConsumer(this.queuedRedirectEvent,e)&&(this.sendToConsumer(this.queuedRedirectEvent,e),this.saveEventToCache(this.queuedRedirectEvent),this.queuedRedirectEvent=null)}unregisterConsumer(e){this.consumers.delete(e)}onEvent(e){if(this.hasEventBeenHandled(e))return!1;let t=!1;return this.consumers.forEach(r=>{this.isEventForConsumer(e,r)&&(t=!0,this.sendToConsumer(e,r),this.saveEventToCache(e))}),this.hasHandledPotentialRedirect||!wu(e)||(this.hasHandledPotentialRedirect=!0,t||(this.queuedRedirectEvent=e,t=!0)),t}sendToConsumer(e,t){var r;if(e.error&&!la(e)){const s=((r=e.error.code)===null||r===void 0?void 0:r.split("auth/")[1])||"internal-error";t.onError(ve(this.auth,s))}else t.onAuthEvent(e)}isEventForConsumer(e,t){const r=t.eventId===null||!!e.eventId&&e.eventId===t.eventId;return t.filter.includes(e.type)&&r}hasEventBeenHandled(e){return Date.now()-this.lastProcessedEventTime>=vu&&this.cachedEventUids.clear(),this.cachedEventUids.has(Ds(e))}saveEventToCache(e){this.cachedEventUids.add(Ds(e)),this.lastProcessedEventTime=Date.now()}}function Ds(n){return[n.type,n.eventId,n.sessionId,n.tenantId].filter(e=>e).join("-")}function la({type:n,error:e}){return n==="unknown"&&(e==null?void 0:e.code)==="auth/no-auth-event"}function wu(n){switch(n.type){case"signInViaRedirect":case"linkViaRedirect":case"reauthViaRedirect":return!0;case"unknown":return la(n);default:return!1}}/**
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
 */async function Tu(n,e={}){return wt(n,"GET","/v1/projects",e)}/**
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
 */const Eu=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,Au=/^https?/;async function bu(n){if(n.config.emulator)return;const{authorizedDomains:e}=await Tu(n);for(const t of e)try{if(Su(t))return}catch{}Pe(n,"unauthorized-domain")}function Su(n){const e=Mi(),{protocol:t,hostname:r}=new URL(e);if(n.startsWith("chrome-extension://")){const l=new URL(n);return l.hostname===""&&r===""?t==="chrome-extension:"&&n.replace("chrome-extension://","")===e.replace("chrome-extension://",""):t==="chrome-extension:"&&l.hostname===r}if(!Au.test(t))return!1;if(Eu.test(n))return r===n;const s=n.replace(/\./g,"\\.");return new RegExp("^(.+\\."+s+"|"+s+")$","i").test(r)}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */const Ru=new Yt(3e4,6e4);function Ls(){const n=Ie().___jsl;if(n!=null&&n.H){for(const e of Object.keys(n.H))if(n.H[e].r=n.H[e].r||[],n.H[e].L=n.H[e].L||[],n.H[e].r=[...n.H[e].L],n.CP)for(let t=0;t<n.CP.length;t++)n.CP[t]=null}}function ku(n){return new Promise((e,t)=>{var r,s,a;function l(){Ls(),gapi.load("gapi.iframes",{callback:()=>{e(gapi.iframes.getContext())},ontimeout:()=>{Ls(),t(ve(n,"network-request-failed"))},timeout:Ru.get()})}if(!((s=(r=Ie().gapi)===null||r===void 0?void 0:r.iframes)===null||s===void 0)&&s.Iframe)e(gapi.iframes.getContext());else if(!((a=Ie().gapi)===null||a===void 0)&&a.load)l();else{const u=Lh("iframefcb");return Ie()[u]=()=>{gapi.load?l():t(ve(n,"network-request-failed"))},Nh(`${Dh()}?onload=${u}`).catch(f=>t(f))}}).catch(e=>{throw Sn=null,e})}let Sn=null;function Cu(n){return Sn=Sn||ku(n),Sn}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */const Pu=new Yt(5e3,15e3),Ou="__/auth/iframe",Nu="emulator/auth/iframe",Du={style:{position:"absolute",top:"-100px",width:"1px",height:"1px"},"aria-hidden":"true",tabindex:"-1"},Lu=new Map([["identitytoolkit.googleapis.com","p"],["staging-identitytoolkit.sandbox.googleapis.com","s"],["test-identitytoolkit.sandbox.googleapis.com","t"]]);function Mu(n){const e=n.config;R(e.authDomain,n,"auth-domain-config-required");const t=e.emulator?Ji(e,Nu):`https://${n.config.authDomain}/${Ou}`,r={apiKey:e.apiKey,appName:n.name,v:at},s=Lu.get(n.config.apiHost);s&&(r.eid=s);const a=n._getFrameworks();return a.length&&(r.fw=a.join(",")),`${t}?${Jt(r).slice(1)}`}async function Uu(n){const e=await Cu(n),t=Ie().gapi;return R(t,n,"internal-error"),e.open({where:document.body,url:Mu(n),messageHandlersFilter:t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,attributes:Du,dontclear:!0},r=>new Promise(async(s,a)=>{await r.restyle({setHideOnLeave:!1});const l=ve(n,"network-request-failed"),u=Ie().setTimeout(()=>{a(l)},Pu.get());function f(){Ie().clearTimeout(u),s(r)}r.ping(f).then(f,()=>{a(l)})}))}/**
 * @license
 * Copyright 2020 Google LLC.
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
 */const xu={location:"yes",resizable:"yes",statusbar:"yes",toolbar:"no"},Fu=500,ju=600,Vu="_blank",Bu="http://localhost";class Ms{constructor(e){this.window=e,this.associatedEvent=null}close(){if(this.window)try{this.window.close()}catch{}}}function $u(n,e,t,r=Fu,s=ju){const a=Math.max((window.screen.availHeight-s)/2,0).toString(),l=Math.max((window.screen.availWidth-r)/2,0).toString();let u="";const f=Object.assign(Object.assign({},xu),{width:r.toString(),height:s.toString(),top:a,left:l}),w=ee().toLowerCase();t&&(u=Ho(w)?Vu:t),Bo(w)&&(e=e||Bu,f.scrollbars="yes");const b=Object.entries(f).reduce((E,[P,k])=>`${E}${P}=${k},`,"");if(Ah(w)&&u!=="_self")return Hu(e||"",u),new Ms(null);const S=window.open(e||"",u,b);R(S,n,"popup-blocked");try{S.focus()}catch{}return new Ms(S)}function Hu(n,e){const t=document.createElement("a");t.href=n,t.target=e;const r=document.createEvent("MouseEvent");r.initMouseEvent("click",!0,!0,window,1,0,0,0,0,!1,!1,!1,!1,1,null),t.dispatchEvent(r)}/**
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
 */const Wu="__/auth/handler",zu="emulator/auth/handler",Gu=encodeURIComponent("fac");async function Us(n,e,t,r,s,a){R(n.config.authDomain,n,"auth-domain-config-required"),R(n.config.apiKey,n,"invalid-api-key");const l={apiKey:n.config.apiKey,appName:n.name,authType:t,redirectUrl:r,v:at,eventId:s};if(e instanceof Zo){e.setDefaultLanguage(n.languageCode),l.providerId=e.providerId||"",Wc(e.getCustomParameters())||(l.customParameters=JSON.stringify(e.getCustomParameters()));for(const[b,S]of Object.entries({}))l[b]=S}if(e instanceof Zt){const b=e.getScopes().filter(S=>S!=="");b.length>0&&(l.scopes=b.join(","))}n.tenantId&&(l.tid=n.tenantId);const u=l;for(const b of Object.keys(u))u[b]===void 0&&delete u[b];const f=await n._getAppCheckToken(),w=f?`#${Gu}=${encodeURIComponent(f)}`:"";return`${qu(n)}?${Jt(u).slice(1)}${w}`}function qu({config:n}){return n.emulator?Ji(n,zu):`https://${n.authDomain}/${Wu}`}/**
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
 */const Ai="webStorageSupport";class Ku{constructor(){this.eventManagers={},this.iframes={},this.originValidationPromises={},this._redirectPersistence=ia,this._completeRedirectFn=yu,this._overrideRedirectResult=gu}async _openPopup(e,t,r,s){var a;Oe((a=this.eventManagers[e._key()])===null||a===void 0?void 0:a.manager,"_initialize() not called before _openPopup()");const l=await Us(e,t,r,Mi(),s);return $u(e,l,tr())}async _openRedirect(e,t,r,s){await this._originValidation(e);const a=await Us(e,t,r,Mi(),s);return Yh(a),new Promise(()=>{})}_initialize(e){const t=e._key();if(this.eventManagers[t]){const{manager:s,promise:a}=this.eventManagers[t];return s?Promise.resolve(s):(Oe(a,"If manager is not set, promise should be"),a)}const r=this.initAndGetManager(e);return this.eventManagers[t]={promise:r},r.catch(()=>{delete this.eventManagers[t]}),r}async initAndGetManager(e){const t=await Uu(e),r=new Iu(e);return t.register("authEvent",s=>(R(s==null?void 0:s.authEvent,e,"invalid-auth-event"),{status:r.onEvent(s.authEvent)?"ACK":"ERROR"}),gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER),this.eventManagers[e._key()]={manager:r},this.iframes[e._key()]=t,r}_isIframeWebStorageSupported(e,t){this.iframes[e._key()].send(Ai,{type:Ai},s=>{var a;const l=(a=s==null?void 0:s[0])===null||a===void 0?void 0:a[Ai];l!==void 0&&t(!!l),Pe(e,"internal-error")},gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER)}_originValidation(e){const t=e._key();return this.originValidationPromises[t]||(this.originValidationPromises[t]=bu(e)),this.originValidationPromises[t]}get _shouldInitProactively(){return Ko()||$o()||Zi()}}const Ju=Ku;var xs="@firebase/auth",Fs="1.10.8";/**
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
 */class Xu{constructor(e){this.auth=e,this.internalListeners=new Map}getUid(){var e;return this.assertAuthConfigured(),((e=this.auth.currentUser)===null||e===void 0?void 0:e.uid)||null}async getToken(e){return this.assertAuthConfigured(),await this.auth._initializationPromise,this.auth.currentUser?{accessToken:await this.auth.currentUser.getIdToken(e)}:null}addAuthTokenListener(e){if(this.assertAuthConfigured(),this.internalListeners.has(e))return;const t=this.auth.onIdTokenChanged(r=>{e((r==null?void 0:r.stsTokenManager.accessToken)||null)});this.internalListeners.set(e,t),this.updateProactiveRefresh()}removeAuthTokenListener(e){this.assertAuthConfigured();const t=this.internalListeners.get(e);t&&(this.internalListeners.delete(e),t(),this.updateProactiveRefresh())}assertAuthConfigured(){R(this.auth._initializationPromise,"dependent-sdk-initialized-before-auth")}updateProactiveRefresh(){this.internalListeners.size>0?this.auth._startProactiveRefresh():this.auth._stopProactiveRefresh()}}/**
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
 */function Yu(n){switch(n){case"Node":return"node";case"ReactNative":return"rn";case"Worker":return"webworker";case"Cordova":return"cordova";case"WebExtension":return"web-extension";default:return}}function Zu(n){ge(new oe("auth",(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("heartbeat"),a=e.getProvider("app-check-internal"),{apiKey:l,authDomain:u}=r.options;R(l&&!l.includes(":"),"invalid-api-key",{appName:r.name});const f={apiKey:l,authDomain:u,clientPlatform:n,apiHost:"identitytoolkit.googleapis.com",tokenApiHost:"securetoken.googleapis.com",apiScheme:"https",sdkClientVersion:Jo(n)},w=new Ph(r,s,a,f);return Uh(w,t),w},"PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e,t,r)=>{e.getProvider("auth-internal").initialize()})),ge(new oe("auth-internal",e=>{const t=Qi(e.getProvider("auth").getImmediate());return(r=>new Xu(r))(t)},"PRIVATE").setInstantiationMode("EXPLICIT")),te(xs,Fs,Yu(n)),te(xs,Fs,"esm2017")}/**
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
 */const Qu=300,ed=Ao("authIdTokenMaxAge")||Qu;let js=null;const td=n=>async e=>{const t=e&&await e.getIdTokenResult(),r=t&&(new Date().getTime()-Date.parse(t.issuedAtTime))/1e3;if(r&&r>ed)return;const s=t==null?void 0:t.token;js!==s&&(js=s,await fetch(n,{method:s?"POST":"DELETE",headers:s?{Authorization:`Bearer ${s}`}:{}}))};function nd(n=Xt()){const e=ze(n,"auth");if(e.isInitialized())return e.getImmediate();const t=Mh(n,{popupRedirectResolver:Ju,persistence:[ou,Kh,ia]}),r=Ao("authTokenSyncURL");if(r&&typeof isSecureContext=="boolean"&&isSecureContext){const a=new URL(r,location.origin);if(location.origin===a.origin){const l=td(a.toString());zh(t,l,()=>l(t.currentUser)),Wh(t,u=>l(u))}}const s=wo("auth");return s&&xh(t,`http://${s}`),t}function id(){var n,e;return(e=(n=document.getElementsByTagName("head"))===null||n===void 0?void 0:n[0])!==null&&e!==void 0?e:document}Oh({loadJS(n){return new Promise((e,t)=>{const r=document.createElement("script");r.setAttribute("src",n),r.onload=e,r.onerror=s=>{const a=ve("internal-error");a.customData=s,t(a)},r.type="text/javascript",r.charset="UTF-8",id().appendChild(r)})},gapiScript:"https://apis.google.com/js/api.js",recaptchaV2Script:"https://www.google.com/recaptcha/api.js",recaptchaEnterpriseScript:"https://www.google.com/recaptcha/enterprise.js?render="});Zu("Browser");var rd="firebase",sd="11.10.0";/**
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
 */te(rd,sd,"app");const ha="@firebase/installations",ir="0.6.18";/**
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
 */const ua=1e4,da=`w:${ir}`,fa="FIS_v2",od="https://firebaseinstallations.googleapis.com/v1",ad=3600*1e3,cd="installations",ld="Installations";/**
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
 */const hd={"missing-app-config-values":'Missing App configuration value: "{$valueName}"',"not-registered":"Firebase Installation is not registered.","installation-not-found":"Firebase Installation not found.","request-failed":'{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',"app-offline":"Could not process request. Application offline.","delete-pending-registration":"Can't delete installation while there is a pending registration request."},it=new ot(cd,ld,hd);function pa(n){return n instanceof ae&&n.code.includes("request-failed")}/**
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
 */function ga({projectId:n}){return`${od}/projects/${n}/installations`}function ma(n){return{token:n.token,requestStatus:2,expiresIn:dd(n.expiresIn),creationTime:Date.now()}}async function _a(n,e){const r=(await e.json()).error;return it.create("request-failed",{requestName:n,serverCode:r.code,serverMessage:r.message,serverStatus:r.status})}function ya({apiKey:n}){return new Headers({"Content-Type":"application/json",Accept:"application/json","x-goog-api-key":n})}function ud(n,{refreshToken:e}){const t=ya(n);return t.append("Authorization",fd(e)),t}async function va(n){const e=await n();return e.status>=500&&e.status<600?n():e}function dd(n){return Number(n.replace("s","000"))}function fd(n){return`${fa} ${n}`}/**
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
 */async function pd({appConfig:n,heartbeatServiceProvider:e},{fid:t}){const r=ga(n),s=ya(n),a=e.getImmediate({optional:!0});if(a){const w=await a.getHeartbeatsHeader();w&&s.append("x-firebase-client",w)}const l={fid:t,authVersion:fa,appId:n.appId,sdkVersion:da},u={method:"POST",headers:s,body:JSON.stringify(l)},f=await va(()=>fetch(r,u));if(f.ok){const w=await f.json();return{fid:w.fid||t,registrationStatus:2,refreshToken:w.refreshToken,authToken:ma(w.authToken)}}else throw await _a("Create Installation",f)}/**
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
 */function Ia(n){return new Promise(e=>{setTimeout(e,n)})}/**
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
 */function gd(n){return btoa(String.fromCharCode(...n)).replace(/\+/g,"-").replace(/\//g,"_")}/**
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
 */const md=/^[cdef][\w-]{21}$/,Fi="";function _d(){try{const n=new Uint8Array(17);(self.crypto||self.msCrypto).getRandomValues(n),n[0]=112+n[0]%16;const t=yd(n);return md.test(t)?t:Fi}catch{return Fi}}function yd(n){return gd(n).substr(0,22)}/**
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
 */function Hn(n){return`${n.appName}!${n.appId}`}/**
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
 */const wa=new Map;function Ta(n,e){const t=Hn(n);Ea(t,e),vd(t,e)}function Ea(n,e){const t=wa.get(n);if(t)for(const r of t)r(e)}function vd(n,e){const t=Id();t&&t.postMessage({key:n,fid:e}),wd()}let Ye=null;function Id(){return!Ye&&"BroadcastChannel"in self&&(Ye=new BroadcastChannel("[Firebase] FID Change"),Ye.onmessage=n=>{Ea(n.data.key,n.data.fid)}),Ye}function wd(){wa.size===0&&Ye&&(Ye.close(),Ye=null)}/**
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
 */const Td="firebase-installations-database",Ed=1,rt="firebase-installations-store";let bi=null;function rr(){return bi||(bi=Co(Td,Ed,{upgrade:(n,e)=>{switch(e){case 0:n.createObjectStore(rt)}}})),bi}async function Mn(n,e){const t=Hn(n),s=(await rr()).transaction(rt,"readwrite"),a=s.objectStore(rt),l=await a.get(t);return await a.put(e,t),await s.done,(!l||l.fid!==e.fid)&&Ta(n,e.fid),e}async function Aa(n){const e=Hn(n),r=(await rr()).transaction(rt,"readwrite");await r.objectStore(rt).delete(e),await r.done}async function Wn(n,e){const t=Hn(n),s=(await rr()).transaction(rt,"readwrite"),a=s.objectStore(rt),l=await a.get(t),u=e(l);return u===void 0?await a.delete(t):await a.put(u,t),await s.done,u&&(!l||l.fid!==u.fid)&&Ta(n,u.fid),u}/**
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
 */async function sr(n){let e;const t=await Wn(n.appConfig,r=>{const s=Ad(r),a=bd(n,s);return e=a.registrationPromise,a.installationEntry});return t.fid===Fi?{installationEntry:await e}:{installationEntry:t,registrationPromise:e}}function Ad(n){const e=n||{fid:_d(),registrationStatus:0};return ba(e)}function bd(n,e){if(e.registrationStatus===0){if(!navigator.onLine){const s=Promise.reject(it.create("app-offline"));return{installationEntry:e,registrationPromise:s}}const t={fid:e.fid,registrationStatus:1,registrationTime:Date.now()},r=Sd(n,t);return{installationEntry:t,registrationPromise:r}}else return e.registrationStatus===1?{installationEntry:e,registrationPromise:Rd(n)}:{installationEntry:e}}async function Sd(n,e){try{const t=await pd(n,e);return Mn(n.appConfig,t)}catch(t){throw pa(t)&&t.customData.serverCode===409?await Aa(n.appConfig):await Mn(n.appConfig,{fid:e.fid,registrationStatus:0}),t}}async function Rd(n){let e=await Vs(n.appConfig);for(;e.registrationStatus===1;)await Ia(100),e=await Vs(n.appConfig);if(e.registrationStatus===0){const{installationEntry:t,registrationPromise:r}=await sr(n);return r||t}return e}function Vs(n){return Wn(n,e=>{if(!e)throw it.create("installation-not-found");return ba(e)})}function ba(n){return kd(n)?{fid:n.fid,registrationStatus:0}:n}function kd(n){return n.registrationStatus===1&&n.registrationTime+ua<Date.now()}/**
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
 */async function Cd({appConfig:n,heartbeatServiceProvider:e},t){const r=Pd(n,t),s=ud(n,t),a=e.getImmediate({optional:!0});if(a){const w=await a.getHeartbeatsHeader();w&&s.append("x-firebase-client",w)}const l={installation:{sdkVersion:da,appId:n.appId}},u={method:"POST",headers:s,body:JSON.stringify(l)},f=await va(()=>fetch(r,u));if(f.ok){const w=await f.json();return ma(w)}else throw await _a("Generate Auth Token",f)}function Pd(n,{fid:e}){return`${ga(n)}/${e}/authTokens:generate`}/**
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
 */async function or(n,e=!1){let t;const r=await Wn(n.appConfig,a=>{if(!Sa(a))throw it.create("not-registered");const l=a.authToken;if(!e&&Dd(l))return a;if(l.requestStatus===1)return t=Od(n,e),a;{if(!navigator.onLine)throw it.create("app-offline");const u=Md(a);return t=Nd(n,u),u}});return t?await t:r.authToken}async function Od(n,e){let t=await Bs(n.appConfig);for(;t.authToken.requestStatus===1;)await Ia(100),t=await Bs(n.appConfig);const r=t.authToken;return r.requestStatus===0?or(n,e):r}function Bs(n){return Wn(n,e=>{if(!Sa(e))throw it.create("not-registered");const t=e.authToken;return Ud(t)?Object.assign(Object.assign({},e),{authToken:{requestStatus:0}}):e})}async function Nd(n,e){try{const t=await Cd(n,e),r=Object.assign(Object.assign({},e),{authToken:t});return await Mn(n.appConfig,r),t}catch(t){if(pa(t)&&(t.customData.serverCode===401||t.customData.serverCode===404))await Aa(n.appConfig);else{const r=Object.assign(Object.assign({},e),{authToken:{requestStatus:0}});await Mn(n.appConfig,r)}throw t}}function Sa(n){return n!==void 0&&n.registrationStatus===2}function Dd(n){return n.requestStatus===2&&!Ld(n)}function Ld(n){const e=Date.now();return e<n.creationTime||n.creationTime+n.expiresIn<e+ad}function Md(n){const e={requestStatus:1,requestTime:Date.now()};return Object.assign(Object.assign({},n),{authToken:e})}function Ud(n){return n.requestStatus===1&&n.requestTime+ua<Date.now()}/**
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
 */async function xd(n){const e=n,{installationEntry:t,registrationPromise:r}=await sr(e);return r?r.catch(console.error):or(e).catch(console.error),t.fid}/**
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
 */async function Fd(n,e=!1){const t=n;return await jd(t),(await or(t,e)).token}async function jd(n){const{registrationPromise:e}=await sr(n);e&&await e}/**
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
 */function Vd(n){if(!n||!n.options)throw Si("App Configuration");if(!n.name)throw Si("App Name");const e=["projectId","apiKey","appId"];for(const t of e)if(!n.options[t])throw Si(t);return{appName:n.name,projectId:n.options.projectId,apiKey:n.options.apiKey,appId:n.options.appId}}function Si(n){return it.create("missing-app-config-values",{valueName:n})}/**
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
 */const Ra="installations",Bd="installations-internal",$d=n=>{const e=n.getProvider("app").getImmediate(),t=Vd(e),r=ze(e,"heartbeat");return{app:e,appConfig:t,heartbeatServiceProvider:r,_delete:()=>Promise.resolve()}},Hd=n=>{const e=n.getProvider("app").getImmediate(),t=ze(e,Ra).getImmediate();return{getId:()=>xd(t),getToken:s=>Fd(t,s)}};function Wd(){ge(new oe(Ra,$d,"PUBLIC")),ge(new oe(Bd,Hd,"PRIVATE"))}Wd();te(ha,ir);te(ha,ir,"esm2017");/**
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
 */const Un="analytics",zd="firebase_id",Gd="origin",qd=60*1e3,Kd="https://firebase.googleapis.com/v1alpha/projects/-/apps/{app-id}/webConfig",ar="https://www.googletagmanager.com/gtag/js";/**
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
 */const ne=new Vn("@firebase/analytics");/**
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
 */const Jd={"already-exists":"A Firebase Analytics instance with the appId {$id}  already exists. Only one Firebase Analytics instance can be created for each appId.","already-initialized":"initializeAnalytics() cannot be called again with different options than those it was initially called with. It can be called again with the same options to return the existing instance, or getAnalytics() can be used to get a reference to the already-initialized instance.","already-initialized-settings":"Firebase Analytics has already been initialized.settings() must be called before initializing any Analytics instanceor it will have no effect.","interop-component-reg-failed":"Firebase Analytics Interop Component failed to instantiate: {$reason}","invalid-analytics-context":"Firebase Analytics is not supported in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","indexeddb-unavailable":"IndexedDB unavailable or restricted in this environment. Wrap initialization of analytics in analytics.isSupported() to prevent initialization in unsupported environments. Details: {$errorInfo}","fetch-throttle":"The config fetch request timed out while in an exponential backoff state. Unix timestamp in milliseconds when fetch request throttling ends: {$throttleEndTimeMillis}.","config-fetch-failed":"Dynamic config fetch failed: [{$httpStatus}] {$responseMessage}","no-api-key":'The "apiKey" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid API key.',"no-app-id":'The "appId" field is empty in the local Firebase config. Firebase Analytics requires this field tocontain a valid app ID.',"no-client-id":'The "client_id" field is empty.',"invalid-gtag-resource":"Trusted Types detected an invalid gtag resource: {$gtagURL}."},ie=new ot("analytics","Analytics",Jd);/**
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
 */function Xd(n){if(!n.startsWith(ar)){const e=ie.create("invalid-gtag-resource",{gtagURL:n});return ne.warn(e.message),""}return n}function ka(n){return Promise.all(n.map(e=>e.catch(t=>t)))}function Yd(n,e){let t;return window.trustedTypes&&(t=window.trustedTypes.createPolicy(n,e)),t}function Zd(n,e){const t=Yd("firebase-js-sdk-policy",{createScriptURL:Xd}),r=document.createElement("script"),s=`${ar}?l=${n}&id=${e}`;r.src=t?t==null?void 0:t.createScriptURL(s):s,r.async=!0,document.head.appendChild(r)}function Qd(n){let e=[];return Array.isArray(window[n])?e=window[n]:window[n]=e,e}async function ef(n,e,t,r,s,a){const l=r[s];try{if(l)await e[l];else{const f=(await ka(t)).find(w=>w.measurementId===s);f&&await e[f.appId]}}catch(u){ne.error(u)}n("config",s,a)}async function tf(n,e,t,r,s){try{let a=[];if(s&&s.send_to){let l=s.send_to;Array.isArray(l)||(l=[l]);const u=await ka(t);for(const f of l){const w=u.find(S=>S.measurementId===f),b=w&&e[w.appId];if(b)a.push(b);else{a=[];break}}}a.length===0&&(a=Object.values(e)),await Promise.all(a),n("event",r,s||{})}catch(a){ne.error(a)}}function nf(n,e,t,r){async function s(a,...l){try{if(a==="event"){const[u,f]=l;await tf(n,e,t,u,f)}else if(a==="config"){const[u,f]=l;await ef(n,e,t,r,u,f)}else if(a==="consent"){const[u,f]=l;n("consent",u,f)}else if(a==="get"){const[u,f,w]=l;n("get",u,f,w)}else if(a==="set"){const[u]=l;n("set",u)}else n(a,...l)}catch(u){ne.error(u)}}return s}function rf(n,e,t,r,s){let a=function(...l){window[r].push(arguments)};return window[s]&&typeof window[s]=="function"&&(a=window[s]),window[s]=nf(a,n,e,t),{gtagCore:a,wrappedGtag:window[s]}}function sf(n){const e=window.document.getElementsByTagName("script");for(const t of Object.values(e))if(t.src&&t.src.includes(ar)&&t.src.includes(n))return t;return null}/**
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
 */const of=30,af=1e3;class cf{constructor(e={},t=af){this.throttleMetadata=e,this.intervalMillis=t}getThrottleMetadata(e){return this.throttleMetadata[e]}setThrottleMetadata(e,t){this.throttleMetadata[e]=t}deleteThrottleMetadata(e){delete this.throttleMetadata[e]}}const Ca=new cf;function lf(n){return new Headers({Accept:"application/json","x-goog-api-key":n})}async function hf(n){var e;const{appId:t,apiKey:r}=n,s={method:"GET",headers:lf(r)},a=Kd.replace("{app-id}",t),l=await fetch(a,s);if(l.status!==200&&l.status!==304){let u="";try{const f=await l.json();!((e=f.error)===null||e===void 0)&&e.message&&(u=f.error.message)}catch{}throw ie.create("config-fetch-failed",{httpStatus:l.status,responseMessage:u})}return l.json()}async function uf(n,e=Ca,t){const{appId:r,apiKey:s,measurementId:a}=n.options;if(!r)throw ie.create("no-app-id");if(!s){if(a)return{measurementId:a,appId:r};throw ie.create("no-api-key")}const l=e.getThrottleMetadata(r)||{backoffCount:0,throttleEndTimeMillis:Date.now()},u=new pf;return setTimeout(async()=>{u.abort()},qd),Pa({appId:r,apiKey:s,measurementId:a},l,u,e)}async function Pa(n,{throttleEndTimeMillis:e,backoffCount:t},r,s=Ca){var a;const{appId:l,measurementId:u}=n;try{await df(r,e)}catch(f){if(u)return ne.warn(`Timed out fetching this Firebase app's measurement ID from the server. Falling back to the measurement ID ${u} provided in the "measurementId" field in the local Firebase config. [${f==null?void 0:f.message}]`),{appId:l,measurementId:u};throw f}try{const f=await hf(n);return s.deleteThrottleMetadata(l),f}catch(f){const w=f;if(!ff(w)){if(s.deleteThrottleMetadata(l),u)return ne.warn(`Failed to fetch this Firebase app's measurement ID from the server. Falling back to the measurement ID ${u} provided in the "measurementId" field in the local Firebase config. [${w==null?void 0:w.message}]`),{appId:l,measurementId:u};throw f}const b=Number((a=w==null?void 0:w.customData)===null||a===void 0?void 0:a.httpStatus)===503?ps(t,s.intervalMillis,of):ps(t,s.intervalMillis),S={throttleEndTimeMillis:Date.now()+b,backoffCount:t+1};return s.setThrottleMetadata(l,S),ne.debug(`Calling attemptFetch again in ${b} millis`),Pa(n,S,r,s)}}function df(n,e){return new Promise((t,r)=>{const s=Math.max(e-Date.now(),0),a=setTimeout(t,s);n.addEventListener(()=>{clearTimeout(a),r(ie.create("fetch-throttle",{throttleEndTimeMillis:e}))})})}function ff(n){if(!(n instanceof ae)||!n.customData)return!1;const e=Number(n.customData.httpStatus);return e===429||e===500||e===503||e===504}class pf{constructor(){this.listeners=[]}addEventListener(e){this.listeners.push(e)}abort(){this.listeners.forEach(e=>e())}}async function gf(n,e,t,r,s){if(s&&s.global){n("event",t,r);return}else{const a=await e,l=Object.assign(Object.assign({},r),{send_to:a});n("event",t,l)}}/**
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
 */async function mf(){if(Wi())try{await zi()}catch(n){return ne.warn(ie.create("indexeddb-unavailable",{errorInfo:n==null?void 0:n.toString()}).message),!1}else return ne.warn(ie.create("indexeddb-unavailable",{errorInfo:"IndexedDB is not available in this environment."}).message),!1;return!0}async function _f(n,e,t,r,s,a,l){var u;const f=uf(n);f.then(P=>{t[P.measurementId]=P.appId,n.options.measurementId&&P.measurementId!==n.options.measurementId&&ne.warn(`The measurement ID in the local Firebase config (${n.options.measurementId}) does not match the measurement ID fetched from the server (${P.measurementId}). To ensure analytics events are always sent to the correct Analytics property, update the measurement ID field in the local config or remove it from the local config.`)}).catch(P=>ne.error(P)),e.push(f);const w=mf().then(P=>{if(P)return r.getId()}),[b,S]=await Promise.all([f,w]);sf(a)||Zd(a,b.measurementId),s("js",new Date);const E=(u=l==null?void 0:l.config)!==null&&u!==void 0?u:{};return E[Gd]="firebase",E.update=!0,S!=null&&(E[zd]=S),s("config",b.measurementId,E),b.measurementId}/**
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
 */class yf{constructor(e){this.app=e}_delete(){return delete Bt[this.app.options.appId],Promise.resolve()}}let Bt={},$s=[];const Hs={};let Ri="dataLayer",vf="gtag",Ws,Oa,zs=!1;function If(){const n=[];if(Hi()&&n.push("This is a browser extension environment."),So()||n.push("Cookies are not available."),n.length>0){const e=n.map((r,s)=>`(${s+1}) ${r}`).join(" "),t=ie.create("invalid-analytics-context",{errorInfo:e});ne.warn(t.message)}}function wf(n,e,t){If();const r=n.options.appId;if(!r)throw ie.create("no-app-id");if(!n.options.apiKey)if(n.options.measurementId)ne.warn(`The "apiKey" field is empty in the local Firebase config. This is needed to fetch the latest measurement ID for this Firebase app. Falling back to the measurement ID ${n.options.measurementId} provided in the "measurementId" field in the local Firebase config.`);else throw ie.create("no-api-key");if(Bt[r]!=null)throw ie.create("already-exists",{id:r});if(!zs){Qd(Ri);const{wrappedGtag:a,gtagCore:l}=rf(Bt,$s,Hs,Ri,vf);Oa=a,Ws=l,zs=!0}return Bt[r]=_f(n,$s,Hs,e,Ws,Ri,t),new yf(n)}function Tf(n=Xt()){n=Ne(n);const e=ze(n,Un);return e.isInitialized()?e.getImmediate():Ef(n)}function Ef(n,e={}){const t=ze(n,Un);if(t.isInitialized()){const s=t.getImmediate();if(We(e,t.getOptions()))return s;throw ie.create("already-initialized")}return t.initialize({options:e})}async function Af(){if(Hi()||!So()||!Wi())return!1;try{return await zi()}catch{return!1}}function bf(n,e,t,r){n=Ne(n),gf(Oa,Bt[n.app.options.appId],e,t,r).catch(s=>ne.error(s))}const Gs="@firebase/analytics",qs="0.10.17";function Sf(){ge(new oe(Un,(e,{options:t})=>{const r=e.getProvider("app").getImmediate(),s=e.getProvider("installations-internal").getImmediate();return wf(r,s,t)},"PUBLIC")),ge(new oe("analytics-internal",n,"PRIVATE")),te(Gs,qs),te(Gs,qs,"esm2017");function n(e){try{const t=e.getProvider(Un).getImmediate();return{logEvent:(r,s,a)=>bf(t,r,s,a)}}catch(t){throw ie.create("interop-component-reg-failed",{reason:t})}}}Sf();var Ks=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/var cr;(function(){var n;/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/function e(y,d){function g(){}g.prototype=d.prototype,y.D=d.prototype,y.prototype=new g,y.prototype.constructor=y,y.C=function(m,_,I){for(var p=Array(arguments.length-2),Ee=2;Ee<arguments.length;Ee++)p[Ee-2]=arguments[Ee];return d.prototype[_].apply(m,p)}}function t(){this.blockSize=-1}function r(){this.blockSize=-1,this.blockSize=64,this.g=Array(4),this.B=Array(this.blockSize),this.o=this.h=0,this.s()}e(r,t),r.prototype.s=function(){this.g[0]=1732584193,this.g[1]=4023233417,this.g[2]=2562383102,this.g[3]=271733878,this.o=this.h=0};function s(y,d,g){g||(g=0);var m=Array(16);if(typeof d=="string")for(var _=0;16>_;++_)m[_]=d.charCodeAt(g++)|d.charCodeAt(g++)<<8|d.charCodeAt(g++)<<16|d.charCodeAt(g++)<<24;else for(_=0;16>_;++_)m[_]=d[g++]|d[g++]<<8|d[g++]<<16|d[g++]<<24;d=y.g[0],g=y.g[1],_=y.g[2];var I=y.g[3],p=d+(I^g&(_^I))+m[0]+3614090360&4294967295;d=g+(p<<7&4294967295|p>>>25),p=I+(_^d&(g^_))+m[1]+3905402710&4294967295,I=d+(p<<12&4294967295|p>>>20),p=_+(g^I&(d^g))+m[2]+606105819&4294967295,_=I+(p<<17&4294967295|p>>>15),p=g+(d^_&(I^d))+m[3]+3250441966&4294967295,g=_+(p<<22&4294967295|p>>>10),p=d+(I^g&(_^I))+m[4]+4118548399&4294967295,d=g+(p<<7&4294967295|p>>>25),p=I+(_^d&(g^_))+m[5]+1200080426&4294967295,I=d+(p<<12&4294967295|p>>>20),p=_+(g^I&(d^g))+m[6]+2821735955&4294967295,_=I+(p<<17&4294967295|p>>>15),p=g+(d^_&(I^d))+m[7]+4249261313&4294967295,g=_+(p<<22&4294967295|p>>>10),p=d+(I^g&(_^I))+m[8]+1770035416&4294967295,d=g+(p<<7&4294967295|p>>>25),p=I+(_^d&(g^_))+m[9]+2336552879&4294967295,I=d+(p<<12&4294967295|p>>>20),p=_+(g^I&(d^g))+m[10]+4294925233&4294967295,_=I+(p<<17&4294967295|p>>>15),p=g+(d^_&(I^d))+m[11]+2304563134&4294967295,g=_+(p<<22&4294967295|p>>>10),p=d+(I^g&(_^I))+m[12]+1804603682&4294967295,d=g+(p<<7&4294967295|p>>>25),p=I+(_^d&(g^_))+m[13]+4254626195&4294967295,I=d+(p<<12&4294967295|p>>>20),p=_+(g^I&(d^g))+m[14]+2792965006&4294967295,_=I+(p<<17&4294967295|p>>>15),p=g+(d^_&(I^d))+m[15]+1236535329&4294967295,g=_+(p<<22&4294967295|p>>>10),p=d+(_^I&(g^_))+m[1]+4129170786&4294967295,d=g+(p<<5&4294967295|p>>>27),p=I+(g^_&(d^g))+m[6]+3225465664&4294967295,I=d+(p<<9&4294967295|p>>>23),p=_+(d^g&(I^d))+m[11]+643717713&4294967295,_=I+(p<<14&4294967295|p>>>18),p=g+(I^d&(_^I))+m[0]+3921069994&4294967295,g=_+(p<<20&4294967295|p>>>12),p=d+(_^I&(g^_))+m[5]+3593408605&4294967295,d=g+(p<<5&4294967295|p>>>27),p=I+(g^_&(d^g))+m[10]+38016083&4294967295,I=d+(p<<9&4294967295|p>>>23),p=_+(d^g&(I^d))+m[15]+3634488961&4294967295,_=I+(p<<14&4294967295|p>>>18),p=g+(I^d&(_^I))+m[4]+3889429448&4294967295,g=_+(p<<20&4294967295|p>>>12),p=d+(_^I&(g^_))+m[9]+568446438&4294967295,d=g+(p<<5&4294967295|p>>>27),p=I+(g^_&(d^g))+m[14]+3275163606&4294967295,I=d+(p<<9&4294967295|p>>>23),p=_+(d^g&(I^d))+m[3]+4107603335&4294967295,_=I+(p<<14&4294967295|p>>>18),p=g+(I^d&(_^I))+m[8]+1163531501&4294967295,g=_+(p<<20&4294967295|p>>>12),p=d+(_^I&(g^_))+m[13]+2850285829&4294967295,d=g+(p<<5&4294967295|p>>>27),p=I+(g^_&(d^g))+m[2]+4243563512&4294967295,I=d+(p<<9&4294967295|p>>>23),p=_+(d^g&(I^d))+m[7]+1735328473&4294967295,_=I+(p<<14&4294967295|p>>>18),p=g+(I^d&(_^I))+m[12]+2368359562&4294967295,g=_+(p<<20&4294967295|p>>>12),p=d+(g^_^I)+m[5]+4294588738&4294967295,d=g+(p<<4&4294967295|p>>>28),p=I+(d^g^_)+m[8]+2272392833&4294967295,I=d+(p<<11&4294967295|p>>>21),p=_+(I^d^g)+m[11]+1839030562&4294967295,_=I+(p<<16&4294967295|p>>>16),p=g+(_^I^d)+m[14]+4259657740&4294967295,g=_+(p<<23&4294967295|p>>>9),p=d+(g^_^I)+m[1]+2763975236&4294967295,d=g+(p<<4&4294967295|p>>>28),p=I+(d^g^_)+m[4]+1272893353&4294967295,I=d+(p<<11&4294967295|p>>>21),p=_+(I^d^g)+m[7]+4139469664&4294967295,_=I+(p<<16&4294967295|p>>>16),p=g+(_^I^d)+m[10]+3200236656&4294967295,g=_+(p<<23&4294967295|p>>>9),p=d+(g^_^I)+m[13]+681279174&4294967295,d=g+(p<<4&4294967295|p>>>28),p=I+(d^g^_)+m[0]+3936430074&4294967295,I=d+(p<<11&4294967295|p>>>21),p=_+(I^d^g)+m[3]+3572445317&4294967295,_=I+(p<<16&4294967295|p>>>16),p=g+(_^I^d)+m[6]+76029189&4294967295,g=_+(p<<23&4294967295|p>>>9),p=d+(g^_^I)+m[9]+3654602809&4294967295,d=g+(p<<4&4294967295|p>>>28),p=I+(d^g^_)+m[12]+3873151461&4294967295,I=d+(p<<11&4294967295|p>>>21),p=_+(I^d^g)+m[15]+530742520&4294967295,_=I+(p<<16&4294967295|p>>>16),p=g+(_^I^d)+m[2]+3299628645&4294967295,g=_+(p<<23&4294967295|p>>>9),p=d+(_^(g|~I))+m[0]+4096336452&4294967295,d=g+(p<<6&4294967295|p>>>26),p=I+(g^(d|~_))+m[7]+1126891415&4294967295,I=d+(p<<10&4294967295|p>>>22),p=_+(d^(I|~g))+m[14]+2878612391&4294967295,_=I+(p<<15&4294967295|p>>>17),p=g+(I^(_|~d))+m[5]+4237533241&4294967295,g=_+(p<<21&4294967295|p>>>11),p=d+(_^(g|~I))+m[12]+1700485571&4294967295,d=g+(p<<6&4294967295|p>>>26),p=I+(g^(d|~_))+m[3]+2399980690&4294967295,I=d+(p<<10&4294967295|p>>>22),p=_+(d^(I|~g))+m[10]+4293915773&4294967295,_=I+(p<<15&4294967295|p>>>17),p=g+(I^(_|~d))+m[1]+2240044497&4294967295,g=_+(p<<21&4294967295|p>>>11),p=d+(_^(g|~I))+m[8]+1873313359&4294967295,d=g+(p<<6&4294967295|p>>>26),p=I+(g^(d|~_))+m[15]+4264355552&4294967295,I=d+(p<<10&4294967295|p>>>22),p=_+(d^(I|~g))+m[6]+2734768916&4294967295,_=I+(p<<15&4294967295|p>>>17),p=g+(I^(_|~d))+m[13]+1309151649&4294967295,g=_+(p<<21&4294967295|p>>>11),p=d+(_^(g|~I))+m[4]+4149444226&4294967295,d=g+(p<<6&4294967295|p>>>26),p=I+(g^(d|~_))+m[11]+3174756917&4294967295,I=d+(p<<10&4294967295|p>>>22),p=_+(d^(I|~g))+m[2]+718787259&4294967295,_=I+(p<<15&4294967295|p>>>17),p=g+(I^(_|~d))+m[9]+3951481745&4294967295,y.g[0]=y.g[0]+d&4294967295,y.g[1]=y.g[1]+(_+(p<<21&4294967295|p>>>11))&4294967295,y.g[2]=y.g[2]+_&4294967295,y.g[3]=y.g[3]+I&4294967295}r.prototype.u=function(y,d){d===void 0&&(d=y.length);for(var g=d-this.blockSize,m=this.B,_=this.h,I=0;I<d;){if(_==0)for(;I<=g;)s(this,y,I),I+=this.blockSize;if(typeof y=="string"){for(;I<d;)if(m[_++]=y.charCodeAt(I++),_==this.blockSize){s(this,m),_=0;break}}else for(;I<d;)if(m[_++]=y[I++],_==this.blockSize){s(this,m),_=0;break}}this.h=_,this.o+=d},r.prototype.v=function(){var y=Array((56>this.h?this.blockSize:2*this.blockSize)-this.h);y[0]=128;for(var d=1;d<y.length-8;++d)y[d]=0;var g=8*this.o;for(d=y.length-8;d<y.length;++d)y[d]=g&255,g/=256;for(this.u(y),y=Array(16),d=g=0;4>d;++d)for(var m=0;32>m;m+=8)y[g++]=this.g[d]>>>m&255;return y};function a(y,d){var g=u;return Object.prototype.hasOwnProperty.call(g,y)?g[y]:g[y]=d(y)}function l(y,d){this.h=d;for(var g=[],m=!0,_=y.length-1;0<=_;_--){var I=y[_]|0;m&&I==d||(g[_]=I,m=!1)}this.g=g}var u={};function f(y){return-128<=y&&128>y?a(y,function(d){return new l([d|0],0>d?-1:0)}):new l([y|0],0>y?-1:0)}function w(y){if(isNaN(y)||!isFinite(y))return S;if(0>y)return C(w(-y));for(var d=[],g=1,m=0;y>=g;m++)d[m]=y/g|0,g*=4294967296;return new l(d,0)}function b(y,d){if(y.length==0)throw Error("number format error: empty string");if(d=d||10,2>d||36<d)throw Error("radix out of range: "+d);if(y.charAt(0)=="-")return C(b(y.substring(1),d));if(0<=y.indexOf("-"))throw Error('number format error: interior "-" character');for(var g=w(Math.pow(d,8)),m=S,_=0;_<y.length;_+=8){var I=Math.min(8,y.length-_),p=parseInt(y.substring(_,_+I),d);8>I?(I=w(Math.pow(d,I)),m=m.j(I).add(w(p))):(m=m.j(g),m=m.add(w(p)))}return m}var S=f(0),E=f(1),P=f(16777216);n=l.prototype,n.m=function(){if(U(this))return-C(this).m();for(var y=0,d=1,g=0;g<this.g.length;g++){var m=this.i(g);y+=(0<=m?m:4294967296+m)*d,d*=4294967296}return y},n.toString=function(y){if(y=y||10,2>y||36<y)throw Error("radix out of range: "+y);if(k(this))return"0";if(U(this))return"-"+C(this).toString(y);for(var d=w(Math.pow(y,6)),g=this,m="";;){var _=j(g,d).g;g=z(g,_.j(d));var I=((0<g.g.length?g.g[0]:g.h)>>>0).toString(y);if(g=_,k(g))return I+m;for(;6>I.length;)I="0"+I;m=I+m}},n.i=function(y){return 0>y?0:y<this.g.length?this.g[y]:this.h};function k(y){if(y.h!=0)return!1;for(var d=0;d<y.g.length;d++)if(y.g[d]!=0)return!1;return!0}function U(y){return y.h==-1}n.l=function(y){return y=z(this,y),U(y)?-1:k(y)?0:1};function C(y){for(var d=y.g.length,g=[],m=0;m<d;m++)g[m]=~y.g[m];return new l(g,~y.h).add(E)}n.abs=function(){return U(this)?C(this):this},n.add=function(y){for(var d=Math.max(this.g.length,y.g.length),g=[],m=0,_=0;_<=d;_++){var I=m+(this.i(_)&65535)+(y.i(_)&65535),p=(I>>>16)+(this.i(_)>>>16)+(y.i(_)>>>16);m=p>>>16,I&=65535,p&=65535,g[_]=p<<16|I}return new l(g,g[g.length-1]&-2147483648?-1:0)};function z(y,d){return y.add(C(d))}n.j=function(y){if(k(this)||k(y))return S;if(U(this))return U(y)?C(this).j(C(y)):C(C(this).j(y));if(U(y))return C(this.j(C(y)));if(0>this.l(P)&&0>y.l(P))return w(this.m()*y.m());for(var d=this.g.length+y.g.length,g=[],m=0;m<2*d;m++)g[m]=0;for(m=0;m<this.g.length;m++)for(var _=0;_<y.g.length;_++){var I=this.i(m)>>>16,p=this.i(m)&65535,Ee=y.i(_)>>>16,Tt=y.i(_)&65535;g[2*m+2*_]+=p*Tt,$(g,2*m+2*_),g[2*m+2*_+1]+=I*Tt,$(g,2*m+2*_+1),g[2*m+2*_+1]+=p*Ee,$(g,2*m+2*_+1),g[2*m+2*_+2]+=I*Ee,$(g,2*m+2*_+2)}for(m=0;m<d;m++)g[m]=g[2*m+1]<<16|g[2*m];for(m=d;m<2*d;m++)g[m]=0;return new l(g,0)};function $(y,d){for(;(y[d]&65535)!=y[d];)y[d+1]+=y[d]>>>16,y[d]&=65535,d++}function x(y,d){this.g=y,this.h=d}function j(y,d){if(k(d))throw Error("division by zero");if(k(y))return new x(S,S);if(U(y))return d=j(C(y),d),new x(C(d.g),C(d.h));if(U(d))return d=j(y,C(d)),new x(C(d.g),d.h);if(30<y.g.length){if(U(y)||U(d))throw Error("slowDivide_ only works with positive integers.");for(var g=E,m=d;0>=m.l(y);)g=re(g),m=re(m);var _=W(g,1),I=W(m,1);for(m=W(m,2),g=W(g,2);!k(m);){var p=I.add(m);0>=p.l(y)&&(_=_.add(g),I=p),m=W(m,1),g=W(g,1)}return d=z(y,_.j(d)),new x(_,d)}for(_=S;0<=y.l(d);){for(g=Math.max(1,Math.floor(y.m()/d.m())),m=Math.ceil(Math.log(g)/Math.LN2),m=48>=m?1:Math.pow(2,m-48),I=w(g),p=I.j(d);U(p)||0<p.l(y);)g-=m,I=w(g),p=I.j(d);k(I)&&(I=E),_=_.add(I),y=z(y,p)}return new x(_,y)}n.A=function(y){return j(this,y).h},n.and=function(y){for(var d=Math.max(this.g.length,y.g.length),g=[],m=0;m<d;m++)g[m]=this.i(m)&y.i(m);return new l(g,this.h&y.h)},n.or=function(y){for(var d=Math.max(this.g.length,y.g.length),g=[],m=0;m<d;m++)g[m]=this.i(m)|y.i(m);return new l(g,this.h|y.h)},n.xor=function(y){for(var d=Math.max(this.g.length,y.g.length),g=[],m=0;m<d;m++)g[m]=this.i(m)^y.i(m);return new l(g,this.h^y.h)};function re(y){for(var d=y.g.length+1,g=[],m=0;m<d;m++)g[m]=y.i(m)<<1|y.i(m-1)>>>31;return new l(g,y.h)}function W(y,d){var g=d>>5;d%=32;for(var m=y.g.length-g,_=[],I=0;I<m;I++)_[I]=0<d?y.i(I+g)>>>d|y.i(I+g+1)<<32-d:y.i(I+g);return new l(_,y.h)}r.prototype.digest=r.prototype.v,r.prototype.reset=r.prototype.s,r.prototype.update=r.prototype.u,l.prototype.add=l.prototype.add,l.prototype.multiply=l.prototype.j,l.prototype.modulo=l.prototype.A,l.prototype.compare=l.prototype.l,l.prototype.toNumber=l.prototype.m,l.prototype.toString=l.prototype.toString,l.prototype.getBits=l.prototype.i,l.fromNumber=w,l.fromString=b,cr=l}).apply(typeof Ks<"u"?Ks:typeof self<"u"?self:typeof window<"u"?window:{});var In=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};(function(){var n,e=typeof Object.defineProperties=="function"?Object.defineProperty:function(i,o,c){return i==Array.prototype||i==Object.prototype||(i[o]=c.value),i};function t(i){i=[typeof globalThis=="object"&&globalThis,i,typeof window=="object"&&window,typeof self=="object"&&self,typeof In=="object"&&In];for(var o=0;o<i.length;++o){var c=i[o];if(c&&c.Math==Math)return c}throw Error("Cannot find global object")}var r=t(this);function s(i,o){if(o)e:{var c=r;i=i.split(".");for(var h=0;h<i.length-1;h++){var v=i[h];if(!(v in c))break e;c=c[v]}i=i[i.length-1],h=c[i],o=o(h),o!=h&&o!=null&&e(c,i,{configurable:!0,writable:!0,value:o})}}function a(i,o){i instanceof String&&(i+="");var c=0,h=!1,v={next:function(){if(!h&&c<i.length){var T=c++;return{value:o(T,i[T]),done:!1}}return h=!0,{done:!0,value:void 0}}};return v[Symbol.iterator]=function(){return v},v}s("Array.prototype.values",function(i){return i||function(){return a(this,function(o,c){return c})}});/** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/var l=l||{},u=this||self;function f(i){var o=typeof i;return o=o!="object"?o:i?Array.isArray(i)?"array":o:"null",o=="array"||o=="object"&&typeof i.length=="number"}function w(i){var o=typeof i;return o=="object"&&i!=null||o=="function"}function b(i,o,c){return i.call.apply(i.bind,arguments)}function S(i,o,c){if(!i)throw Error();if(2<arguments.length){var h=Array.prototype.slice.call(arguments,2);return function(){var v=Array.prototype.slice.call(arguments);return Array.prototype.unshift.apply(v,h),i.apply(o,v)}}return function(){return i.apply(o,arguments)}}function E(i,o,c){return E=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?b:S,E.apply(null,arguments)}function P(i,o){var c=Array.prototype.slice.call(arguments,1);return function(){var h=c.slice();return h.push.apply(h,arguments),i.apply(this,h)}}function k(i,o){function c(){}c.prototype=o.prototype,i.aa=o.prototype,i.prototype=new c,i.prototype.constructor=i,i.Qb=function(h,v,T){for(var A=Array(arguments.length-2),F=2;F<arguments.length;F++)A[F-2]=arguments[F];return o.prototype[v].apply(h,A)}}function U(i){const o=i.length;if(0<o){const c=Array(o);for(let h=0;h<o;h++)c[h]=i[h];return c}return[]}function C(i,o){for(let c=1;c<arguments.length;c++){const h=arguments[c];if(f(h)){const v=i.length||0,T=h.length||0;i.length=v+T;for(let A=0;A<T;A++)i[v+A]=h[A]}else i.push(h)}}class z{constructor(o,c){this.i=o,this.j=c,this.h=0,this.g=null}get(){let o;return 0<this.h?(this.h--,o=this.g,this.g=o.next,o.next=null):o=this.i(),o}}function $(i){return/^[\s\xa0]*$/.test(i)}function x(){var i=u.navigator;return i&&(i=i.userAgent)?i:""}function j(i){return j[" "](i),i}j[" "]=function(){};var re=x().indexOf("Gecko")!=-1&&!(x().toLowerCase().indexOf("webkit")!=-1&&x().indexOf("Edge")==-1)&&!(x().indexOf("Trident")!=-1||x().indexOf("MSIE")!=-1)&&x().indexOf("Edge")==-1;function W(i,o,c){for(const h in i)o.call(c,i[h],h,i)}function y(i,o){for(const c in i)o.call(void 0,i[c],c,i)}function d(i){const o={};for(const c in i)o[c]=i[c];return o}const g="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function m(i,o){let c,h;for(let v=1;v<arguments.length;v++){h=arguments[v];for(c in h)i[c]=h[c];for(let T=0;T<g.length;T++)c=g[T],Object.prototype.hasOwnProperty.call(h,c)&&(i[c]=h[c])}}function _(i){var o=1;i=i.split(":");const c=[];for(;0<o&&i.length;)c.push(i.shift()),o--;return i.length&&c.push(i.join(":")),c}function I(i){u.setTimeout(()=>{throw i},0)}function p(){var i=Gn;let o=null;return i.g&&(o=i.g,i.g=i.g.next,i.g||(i.h=null),o.next=null),o}class Ee{constructor(){this.h=this.g=null}add(o,c){const h=Tt.get();h.set(o,c),this.h?this.h.next=h:this.g=h,this.h=h}}var Tt=new z(()=>new Ha,i=>i.reset());class Ha{constructor(){this.next=this.g=this.h=null}set(o,c){this.h=o,this.g=c,this.next=null}reset(){this.next=this.g=this.h=null}}let Et,At=!1,Gn=new Ee,fr=()=>{const i=u.Promise.resolve(void 0);Et=()=>{i.then(Wa)}};var Wa=()=>{for(var i;i=p();){try{i.h.call(i.g)}catch(c){I(c)}var o=Tt;o.j(i),100>o.h&&(o.h++,i.next=o.g,o.g=i)}At=!1};function De(){this.s=this.s,this.C=this.C}De.prototype.s=!1,De.prototype.ma=function(){this.s||(this.s=!0,this.N())},De.prototype.N=function(){if(this.C)for(;this.C.length;)this.C.shift()()};function q(i,o){this.type=i,this.g=this.target=o,this.defaultPrevented=!1}q.prototype.h=function(){this.defaultPrevented=!0};var za=(function(){if(!u.addEventListener||!Object.defineProperty)return!1;var i=!1,o=Object.defineProperty({},"passive",{get:function(){i=!0}});try{const c=()=>{};u.addEventListener("test",c,o),u.removeEventListener("test",c,o)}catch{}return i})();function bt(i,o){if(q.call(this,i?i.type:""),this.relatedTarget=this.g=this.target=null,this.button=this.screenY=this.screenX=this.clientY=this.clientX=0,this.key="",this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1,this.state=null,this.pointerId=0,this.pointerType="",this.i=null,i){var c=this.type=i.type,h=i.changedTouches&&i.changedTouches.length?i.changedTouches[0]:null;if(this.target=i.target||i.srcElement,this.g=o,o=i.relatedTarget){if(re){e:{try{j(o.nodeName);var v=!0;break e}catch{}v=!1}v||(o=null)}}else c=="mouseover"?o=i.fromElement:c=="mouseout"&&(o=i.toElement);this.relatedTarget=o,h?(this.clientX=h.clientX!==void 0?h.clientX:h.pageX,this.clientY=h.clientY!==void 0?h.clientY:h.pageY,this.screenX=h.screenX||0,this.screenY=h.screenY||0):(this.clientX=i.clientX!==void 0?i.clientX:i.pageX,this.clientY=i.clientY!==void 0?i.clientY:i.pageY,this.screenX=i.screenX||0,this.screenY=i.screenY||0),this.button=i.button,this.key=i.key||"",this.ctrlKey=i.ctrlKey,this.altKey=i.altKey,this.shiftKey=i.shiftKey,this.metaKey=i.metaKey,this.pointerId=i.pointerId||0,this.pointerType=typeof i.pointerType=="string"?i.pointerType:Ga[i.pointerType]||"",this.state=i.state,this.i=i,i.defaultPrevented&&bt.aa.h.call(this)}}k(bt,q);var Ga={2:"touch",3:"pen",4:"mouse"};bt.prototype.h=function(){bt.aa.h.call(this);var i=this.i;i.preventDefault?i.preventDefault():i.returnValue=!1};var nn="closure_listenable_"+(1e6*Math.random()|0),qa=0;function Ka(i,o,c,h,v){this.listener=i,this.proxy=null,this.src=o,this.type=c,this.capture=!!h,this.ha=v,this.key=++qa,this.da=this.fa=!1}function rn(i){i.da=!0,i.listener=null,i.proxy=null,i.src=null,i.ha=null}function sn(i){this.src=i,this.g={},this.h=0}sn.prototype.add=function(i,o,c,h,v){var T=i.toString();i=this.g[T],i||(i=this.g[T]=[],this.h++);var A=Kn(i,o,h,v);return-1<A?(o=i[A],c||(o.fa=!1)):(o=new Ka(o,this.src,T,!!h,v),o.fa=c,i.push(o)),o};function qn(i,o){var c=o.type;if(c in i.g){var h=i.g[c],v=Array.prototype.indexOf.call(h,o,void 0),T;(T=0<=v)&&Array.prototype.splice.call(h,v,1),T&&(rn(o),i.g[c].length==0&&(delete i.g[c],i.h--))}}function Kn(i,o,c,h){for(var v=0;v<i.length;++v){var T=i[v];if(!T.da&&T.listener==o&&T.capture==!!c&&T.ha==h)return v}return-1}var Jn="closure_lm_"+(1e6*Math.random()|0),Xn={};function pr(i,o,c,h,v){if(Array.isArray(o)){for(var T=0;T<o.length;T++)pr(i,o[T],c,h,v);return null}return c=_r(c),i&&i[nn]?i.K(o,c,w(h)?!!h.capture:!1,v):Ja(i,o,c,!1,h,v)}function Ja(i,o,c,h,v,T){if(!o)throw Error("Invalid event type");var A=w(v)?!!v.capture:!!v,F=Zn(i);if(F||(i[Jn]=F=new sn(i)),c=F.add(o,c,h,A,T),c.proxy)return c;if(h=Xa(),c.proxy=h,h.src=i,h.listener=c,i.addEventListener)za||(v=A),v===void 0&&(v=!1),i.addEventListener(o.toString(),h,v);else if(i.attachEvent)i.attachEvent(mr(o.toString()),h);else if(i.addListener&&i.removeListener)i.addListener(h);else throw Error("addEventListener and attachEvent are unavailable.");return c}function Xa(){function i(c){return o.call(i.src,i.listener,c)}const o=Ya;return i}function gr(i,o,c,h,v){if(Array.isArray(o))for(var T=0;T<o.length;T++)gr(i,o[T],c,h,v);else h=w(h)?!!h.capture:!!h,c=_r(c),i&&i[nn]?(i=i.i,o=String(o).toString(),o in i.g&&(T=i.g[o],c=Kn(T,c,h,v),-1<c&&(rn(T[c]),Array.prototype.splice.call(T,c,1),T.length==0&&(delete i.g[o],i.h--)))):i&&(i=Zn(i))&&(o=i.g[o.toString()],i=-1,o&&(i=Kn(o,c,h,v)),(c=-1<i?o[i]:null)&&Yn(c))}function Yn(i){if(typeof i!="number"&&i&&!i.da){var o=i.src;if(o&&o[nn])qn(o.i,i);else{var c=i.type,h=i.proxy;o.removeEventListener?o.removeEventListener(c,h,i.capture):o.detachEvent?o.detachEvent(mr(c),h):o.addListener&&o.removeListener&&o.removeListener(h),(c=Zn(o))?(qn(c,i),c.h==0&&(c.src=null,o[Jn]=null)):rn(i)}}}function mr(i){return i in Xn?Xn[i]:Xn[i]="on"+i}function Ya(i,o){if(i.da)i=!0;else{o=new bt(o,this);var c=i.listener,h=i.ha||i.src;i.fa&&Yn(i),i=c.call(h,o)}return i}function Zn(i){return i=i[Jn],i instanceof sn?i:null}var Qn="__closure_events_fn_"+(1e9*Math.random()>>>0);function _r(i){return typeof i=="function"?i:(i[Qn]||(i[Qn]=function(o){return i.handleEvent(o)}),i[Qn])}function K(){De.call(this),this.i=new sn(this),this.M=this,this.F=null}k(K,De),K.prototype[nn]=!0,K.prototype.removeEventListener=function(i,o,c,h){gr(this,i,o,c,h)};function Y(i,o){var c,h=i.F;if(h)for(c=[];h;h=h.F)c.push(h);if(i=i.M,h=o.type||o,typeof o=="string")o=new q(o,i);else if(o instanceof q)o.target=o.target||i;else{var v=o;o=new q(h,i),m(o,v)}if(v=!0,c)for(var T=c.length-1;0<=T;T--){var A=o.g=c[T];v=on(A,h,!0,o)&&v}if(A=o.g=i,v=on(A,h,!0,o)&&v,v=on(A,h,!1,o)&&v,c)for(T=0;T<c.length;T++)A=o.g=c[T],v=on(A,h,!1,o)&&v}K.prototype.N=function(){if(K.aa.N.call(this),this.i){var i=this.i,o;for(o in i.g){for(var c=i.g[o],h=0;h<c.length;h++)rn(c[h]);delete i.g[o],i.h--}}this.F=null},K.prototype.K=function(i,o,c,h){return this.i.add(String(i),o,!1,c,h)},K.prototype.L=function(i,o,c,h){return this.i.add(String(i),o,!0,c,h)};function on(i,o,c,h){if(o=i.i.g[String(o)],!o)return!0;o=o.concat();for(var v=!0,T=0;T<o.length;++T){var A=o[T];if(A&&!A.da&&A.capture==c){var F=A.listener,G=A.ha||A.src;A.fa&&qn(i.i,A),v=F.call(G,h)!==!1&&v}}return v&&!h.defaultPrevented}function yr(i,o,c){if(typeof i=="function")c&&(i=E(i,c));else if(i&&typeof i.handleEvent=="function")i=E(i.handleEvent,i);else throw Error("Invalid listener argument");return 2147483647<Number(o)?-1:u.setTimeout(i,o||0)}function vr(i){i.g=yr(()=>{i.g=null,i.i&&(i.i=!1,vr(i))},i.l);const o=i.h;i.h=null,i.m.apply(null,o)}class Za extends De{constructor(o,c){super(),this.m=o,this.l=c,this.h=null,this.i=!1,this.g=null}j(o){this.h=arguments,this.g?this.i=!0:vr(this)}N(){super.N(),this.g&&(u.clearTimeout(this.g),this.g=null,this.i=!1,this.h=null)}}function St(i){De.call(this),this.h=i,this.g={}}k(St,De);var Ir=[];function wr(i){W(i.g,function(o,c){this.g.hasOwnProperty(c)&&Yn(o)},i),i.g={}}St.prototype.N=function(){St.aa.N.call(this),wr(this)},St.prototype.handleEvent=function(){throw Error("EventHandler.handleEvent not implemented")};var ei=u.JSON.stringify,Qa=u.JSON.parse,ec=class{stringify(i){return u.JSON.stringify(i,void 0)}parse(i){return u.JSON.parse(i,void 0)}};function ti(){}ti.prototype.h=null;function Tr(i){return i.h||(i.h=i.i())}function tc(){}var Rt={OPEN:"a",kb:"b",Ja:"c",wb:"d"};function ni(){q.call(this,"d")}k(ni,q);function ii(){q.call(this,"c")}k(ii,q);var ct={},Er=null;function ri(){return Er=Er||new K}ct.La="serverreachability";function Ar(i){q.call(this,ct.La,i)}k(Ar,q);function kt(i){const o=ri();Y(o,new Ar(o))}ct.STAT_EVENT="statevent";function br(i,o){q.call(this,ct.STAT_EVENT,i),this.stat=o}k(br,q);function Z(i){const o=ri();Y(o,new br(o,i))}ct.Ma="timingevent";function Sr(i,o){q.call(this,ct.Ma,i),this.size=o}k(Sr,q);function Ct(i,o){if(typeof i!="function")throw Error("Fn must not be null and must be a function");return u.setTimeout(function(){i()},o)}function Pt(){this.g=!0}Pt.prototype.xa=function(){this.g=!1};function nc(i,o,c,h,v,T){i.info(function(){if(i.g)if(T)for(var A="",F=T.split("&"),G=0;G<F.length;G++){var L=F[G].split("=");if(1<L.length){var J=L[0];L=L[1];var X=J.split("_");A=2<=X.length&&X[1]=="type"?A+(J+"="+L+"&"):A+(J+"=redacted&")}}else A=null;else A=T;return"XMLHTTP REQ ("+h+") [attempt "+v+"]: "+o+`
`+c+`
`+A})}function ic(i,o,c,h,v,T,A){i.info(function(){return"XMLHTTP RESP ("+h+") [ attempt "+v+"]: "+o+`
`+c+`
`+T+" "+A})}function lt(i,o,c,h){i.info(function(){return"XMLHTTP TEXT ("+o+"): "+sc(i,c)+(h?" "+h:"")})}function rc(i,o){i.info(function(){return"TIMEOUT: "+o})}Pt.prototype.info=function(){};function sc(i,o){if(!i.g)return o;if(!o)return null;try{var c=JSON.parse(o);if(c){for(i=0;i<c.length;i++)if(Array.isArray(c[i])){var h=c[i];if(!(2>h.length)){var v=h[1];if(Array.isArray(v)&&!(1>v.length)){var T=v[0];if(T!="noop"&&T!="stop"&&T!="close")for(var A=1;A<v.length;A++)v[A]=""}}}}return ei(c)}catch{return o}}var si={NO_ERROR:0,TIMEOUT:8},oc={},oi;function an(){}k(an,ti),an.prototype.g=function(){return new XMLHttpRequest},an.prototype.i=function(){return{}},oi=new an;function Le(i,o,c,h){this.j=i,this.i=o,this.l=c,this.R=h||1,this.U=new St(this),this.I=45e3,this.H=null,this.o=!1,this.m=this.A=this.v=this.L=this.F=this.S=this.B=null,this.D=[],this.g=null,this.C=0,this.s=this.u=null,this.X=-1,this.J=!1,this.O=0,this.M=null,this.W=this.K=this.T=this.P=!1,this.h=new Rr}function Rr(){this.i=null,this.g="",this.h=!1}var kr={},ai={};function ci(i,o,c){i.L=1,i.v=un(Ae(o)),i.m=c,i.P=!0,Cr(i,null)}function Cr(i,o){i.F=Date.now(),cn(i),i.A=Ae(i.v);var c=i.A,h=i.R;Array.isArray(h)||(h=[String(h)]),Hr(c.i,"t",h),i.C=0,c=i.j.J,i.h=new Rr,i.g=as(i.j,c?o:null,!i.m),0<i.O&&(i.M=new Za(E(i.Y,i,i.g),i.O)),o=i.U,c=i.g,h=i.ca;var v="readystatechange";Array.isArray(v)||(v&&(Ir[0]=v.toString()),v=Ir);for(var T=0;T<v.length;T++){var A=pr(c,v[T],h||o.handleEvent,!1,o.h||o);if(!A)break;o.g[A.key]=A}o=i.H?d(i.H):{},i.m?(i.u||(i.u="POST"),o["Content-Type"]="application/x-www-form-urlencoded",i.g.ea(i.A,i.u,i.m,o)):(i.u="GET",i.g.ea(i.A,i.u,null,o)),kt(),nc(i.i,i.u,i.A,i.l,i.R,i.m)}Le.prototype.ca=function(i){i=i.target;const o=this.M;o&&be(i)==3?o.j():this.Y(i)},Le.prototype.Y=function(i){try{if(i==this.g)e:{const X=be(this.g);var o=this.g.Ba();const dt=this.g.Z();if(!(3>X)&&(X!=3||this.g&&(this.h.h||this.g.oa()||Xr(this.g)))){this.J||X!=4||o==7||(o==8||0>=dt?kt(3):kt(2)),li(this);var c=this.g.Z();this.X=c;t:if(Pr(this)){var h=Xr(this.g);i="";var v=h.length,T=be(this.g)==4;if(!this.h.i){if(typeof TextDecoder>"u"){Ge(this),Ot(this);var A="";break t}this.h.i=new u.TextDecoder}for(o=0;o<v;o++)this.h.h=!0,i+=this.h.i.decode(h[o],{stream:!(T&&o==v-1)});h.length=0,this.h.g+=i,this.C=0,A=this.h.g}else A=this.g.oa();if(this.o=c==200,ic(this.i,this.u,this.A,this.l,this.R,X,c),this.o){if(this.T&&!this.K){t:{if(this.g){var F,G=this.g;if((F=G.g?G.g.getResponseHeader("X-HTTP-Initial-Response"):null)&&!$(F)){var L=F;break t}}L=null}if(c=L)lt(this.i,this.l,c,"Initial handshake response via X-HTTP-Initial-Response"),this.K=!0,hi(this,c);else{this.o=!1,this.s=3,Z(12),Ge(this),Ot(this);break e}}if(this.P){c=!0;let ce;for(;!this.J&&this.C<A.length;)if(ce=ac(this,A),ce==ai){X==4&&(this.s=4,Z(14),c=!1),lt(this.i,this.l,null,"[Incomplete Response]");break}else if(ce==kr){this.s=4,Z(15),lt(this.i,this.l,A,"[Invalid Chunk]"),c=!1;break}else lt(this.i,this.l,ce,null),hi(this,ce);if(Pr(this)&&this.C!=0&&(this.h.g=this.h.g.slice(this.C),this.C=0),X!=4||A.length!=0||this.h.h||(this.s=1,Z(16),c=!1),this.o=this.o&&c,!c)lt(this.i,this.l,A,"[Invalid Chunked Response]"),Ge(this),Ot(this);else if(0<A.length&&!this.W){this.W=!0;var J=this.j;J.g==this&&J.ba&&!J.M&&(J.j.info("Great, no buffering proxy detected. Bytes received: "+A.length),mi(J),J.M=!0,Z(11))}}else lt(this.i,this.l,A,null),hi(this,A);X==4&&Ge(this),this.o&&!this.J&&(X==4?is(this.j,this):(this.o=!1,cn(this)))}else Ac(this.g),c==400&&0<A.indexOf("Unknown SID")?(this.s=3,Z(12)):(this.s=0,Z(13)),Ge(this),Ot(this)}}}catch{}finally{}};function Pr(i){return i.g?i.u=="GET"&&i.L!=2&&i.j.Ca:!1}function ac(i,o){var c=i.C,h=o.indexOf(`
`,c);return h==-1?ai:(c=Number(o.substring(c,h)),isNaN(c)?kr:(h+=1,h+c>o.length?ai:(o=o.slice(h,h+c),i.C=h+c,o)))}Le.prototype.cancel=function(){this.J=!0,Ge(this)};function cn(i){i.S=Date.now()+i.I,Or(i,i.I)}function Or(i,o){if(i.B!=null)throw Error("WatchDog timer not null");i.B=Ct(E(i.ba,i),o)}function li(i){i.B&&(u.clearTimeout(i.B),i.B=null)}Le.prototype.ba=function(){this.B=null;const i=Date.now();0<=i-this.S?(rc(this.i,this.A),this.L!=2&&(kt(),Z(17)),Ge(this),this.s=2,Ot(this)):Or(this,this.S-i)};function Ot(i){i.j.G==0||i.J||is(i.j,i)}function Ge(i){li(i);var o=i.M;o&&typeof o.ma=="function"&&o.ma(),i.M=null,wr(i.U),i.g&&(o=i.g,i.g=null,o.abort(),o.ma())}function hi(i,o){try{var c=i.j;if(c.G!=0&&(c.g==i||ui(c.h,i))){if(!i.K&&ui(c.h,i)&&c.G==3){try{var h=c.Da.g.parse(o)}catch{h=null}if(Array.isArray(h)&&h.length==3){var v=h;if(v[0]==0){e:if(!c.u){if(c.g)if(c.g.F+3e3<i.F)_n(c),gn(c);else break e;gi(c),Z(18)}}else c.za=v[1],0<c.za-c.T&&37500>v[2]&&c.F&&c.v==0&&!c.C&&(c.C=Ct(E(c.Za,c),6e3));if(1>=Lr(c.h)&&c.ca){try{c.ca()}catch{}c.ca=void 0}}else Ke(c,11)}else if((i.K||c.g==i)&&_n(c),!$(o))for(v=c.Da.g.parse(o),o=0;o<v.length;o++){let L=v[o];if(c.T=L[0],L=L[1],c.G==2)if(L[0]=="c"){c.K=L[1],c.ia=L[2];const J=L[3];J!=null&&(c.la=J,c.j.info("VER="+c.la));const X=L[4];X!=null&&(c.Aa=X,c.j.info("SVER="+c.Aa));const dt=L[5];dt!=null&&typeof dt=="number"&&0<dt&&(h=1.5*dt,c.L=h,c.j.info("backChannelRequestTimeoutMs_="+h)),h=c;const ce=i.g;if(ce){const yn=ce.g?ce.g.getResponseHeader("X-Client-Wire-Protocol"):null;if(yn){var T=h.h;T.g||yn.indexOf("spdy")==-1&&yn.indexOf("quic")==-1&&yn.indexOf("h2")==-1||(T.j=T.l,T.g=new Set,T.h&&(di(T,T.h),T.h=null))}if(h.D){const _i=ce.g?ce.g.getResponseHeader("X-HTTP-Session-Id"):null;_i&&(h.ya=_i,V(h.I,h.D,_i))}}c.G=3,c.l&&c.l.ua(),c.ba&&(c.R=Date.now()-i.F,c.j.info("Handshake RTT: "+c.R+"ms")),h=c;var A=i;if(h.qa=os(h,h.J?h.ia:null,h.W),A.K){Mr(h.h,A);var F=A,G=h.L;G&&(F.I=G),F.B&&(li(F),cn(F)),h.g=A}else ts(h);0<c.i.length&&mn(c)}else L[0]!="stop"&&L[0]!="close"||Ke(c,7);else c.G==3&&(L[0]=="stop"||L[0]=="close"?L[0]=="stop"?Ke(c,7):pi(c):L[0]!="noop"&&c.l&&c.l.ta(L),c.v=0)}}kt(4)}catch{}}var cc=class{constructor(i,o){this.g=i,this.map=o}};function Nr(i){this.l=i||10,u.PerformanceNavigationTiming?(i=u.performance.getEntriesByType("navigation"),i=0<i.length&&(i[0].nextHopProtocol=="hq"||i[0].nextHopProtocol=="h2")):i=!!(u.chrome&&u.chrome.loadTimes&&u.chrome.loadTimes()&&u.chrome.loadTimes().wasFetchedViaSpdy),this.j=i?this.l:1,this.g=null,1<this.j&&(this.g=new Set),this.h=null,this.i=[]}function Dr(i){return i.h?!0:i.g?i.g.size>=i.j:!1}function Lr(i){return i.h?1:i.g?i.g.size:0}function ui(i,o){return i.h?i.h==o:i.g?i.g.has(o):!1}function di(i,o){i.g?i.g.add(o):i.h=o}function Mr(i,o){i.h&&i.h==o?i.h=null:i.g&&i.g.has(o)&&i.g.delete(o)}Nr.prototype.cancel=function(){if(this.i=Ur(this),this.h)this.h.cancel(),this.h=null;else if(this.g&&this.g.size!==0){for(const i of this.g.values())i.cancel();this.g.clear()}};function Ur(i){if(i.h!=null)return i.i.concat(i.h.D);if(i.g!=null&&i.g.size!==0){let o=i.i;for(const c of i.g.values())o=o.concat(c.D);return o}return U(i.i)}function lc(i){if(i.V&&typeof i.V=="function")return i.V();if(typeof Map<"u"&&i instanceof Map||typeof Set<"u"&&i instanceof Set)return Array.from(i.values());if(typeof i=="string")return i.split("");if(f(i)){for(var o=[],c=i.length,h=0;h<c;h++)o.push(i[h]);return o}o=[],c=0;for(h in i)o[c++]=i[h];return o}function hc(i){if(i.na&&typeof i.na=="function")return i.na();if(!i.V||typeof i.V!="function"){if(typeof Map<"u"&&i instanceof Map)return Array.from(i.keys());if(!(typeof Set<"u"&&i instanceof Set)){if(f(i)||typeof i=="string"){var o=[];i=i.length;for(var c=0;c<i;c++)o.push(c);return o}o=[],c=0;for(const h in i)o[c++]=h;return o}}}function xr(i,o){if(i.forEach&&typeof i.forEach=="function")i.forEach(o,void 0);else if(f(i)||typeof i=="string")Array.prototype.forEach.call(i,o,void 0);else for(var c=hc(i),h=lc(i),v=h.length,T=0;T<v;T++)o.call(void 0,h[T],c&&c[T],i)}var Fr=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function uc(i,o){if(i){i=i.split("&");for(var c=0;c<i.length;c++){var h=i[c].indexOf("="),v=null;if(0<=h){var T=i[c].substring(0,h);v=i[c].substring(h+1)}else T=i[c];o(T,v?decodeURIComponent(v.replace(/\+/g," ")):"")}}}function qe(i){if(this.g=this.o=this.j="",this.s=null,this.m=this.l="",this.h=!1,i instanceof qe){this.h=i.h,ln(this,i.j),this.o=i.o,this.g=i.g,hn(this,i.s),this.l=i.l;var o=i.i,c=new Lt;c.i=o.i,o.g&&(c.g=new Map(o.g),c.h=o.h),jr(this,c),this.m=i.m}else i&&(o=String(i).match(Fr))?(this.h=!1,ln(this,o[1]||"",!0),this.o=Nt(o[2]||""),this.g=Nt(o[3]||"",!0),hn(this,o[4]),this.l=Nt(o[5]||"",!0),jr(this,o[6]||"",!0),this.m=Nt(o[7]||"")):(this.h=!1,this.i=new Lt(null,this.h))}qe.prototype.toString=function(){var i=[],o=this.j;o&&i.push(Dt(o,Vr,!0),":");var c=this.g;return(c||o=="file")&&(i.push("//"),(o=this.o)&&i.push(Dt(o,Vr,!0),"@"),i.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.s,c!=null&&i.push(":",String(c))),(c=this.l)&&(this.g&&c.charAt(0)!="/"&&i.push("/"),i.push(Dt(c,c.charAt(0)=="/"?pc:fc,!0))),(c=this.i.toString())&&i.push("?",c),(c=this.m)&&i.push("#",Dt(c,mc)),i.join("")};function Ae(i){return new qe(i)}function ln(i,o,c){i.j=c?Nt(o,!0):o,i.j&&(i.j=i.j.replace(/:$/,""))}function hn(i,o){if(o){if(o=Number(o),isNaN(o)||0>o)throw Error("Bad port number "+o);i.s=o}else i.s=null}function jr(i,o,c){o instanceof Lt?(i.i=o,_c(i.i,i.h)):(c||(o=Dt(o,gc)),i.i=new Lt(o,i.h))}function V(i,o,c){i.i.set(o,c)}function un(i){return V(i,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^Date.now()).toString(36)),i}function Nt(i,o){return i?o?decodeURI(i.replace(/%25/g,"%2525")):decodeURIComponent(i):""}function Dt(i,o,c){return typeof i=="string"?(i=encodeURI(i).replace(o,dc),c&&(i=i.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),i):null}function dc(i){return i=i.charCodeAt(0),"%"+(i>>4&15).toString(16)+(i&15).toString(16)}var Vr=/[#\/\?@]/g,fc=/[#\?:]/g,pc=/[#\?]/g,gc=/[#\?@]/g,mc=/#/g;function Lt(i,o){this.h=this.g=null,this.i=i||null,this.j=!!o}function Me(i){i.g||(i.g=new Map,i.h=0,i.i&&uc(i.i,function(o,c){i.add(decodeURIComponent(o.replace(/\+/g," ")),c)}))}n=Lt.prototype,n.add=function(i,o){Me(this),this.i=null,i=ht(this,i);var c=this.g.get(i);return c||this.g.set(i,c=[]),c.push(o),this.h+=1,this};function Br(i,o){Me(i),o=ht(i,o),i.g.has(o)&&(i.i=null,i.h-=i.g.get(o).length,i.g.delete(o))}function $r(i,o){return Me(i),o=ht(i,o),i.g.has(o)}n.forEach=function(i,o){Me(this),this.g.forEach(function(c,h){c.forEach(function(v){i.call(o,v,h,this)},this)},this)},n.na=function(){Me(this);const i=Array.from(this.g.values()),o=Array.from(this.g.keys()),c=[];for(let h=0;h<o.length;h++){const v=i[h];for(let T=0;T<v.length;T++)c.push(o[h])}return c},n.V=function(i){Me(this);let o=[];if(typeof i=="string")$r(this,i)&&(o=o.concat(this.g.get(ht(this,i))));else{i=Array.from(this.g.values());for(let c=0;c<i.length;c++)o=o.concat(i[c])}return o},n.set=function(i,o){return Me(this),this.i=null,i=ht(this,i),$r(this,i)&&(this.h-=this.g.get(i).length),this.g.set(i,[o]),this.h+=1,this},n.get=function(i,o){return i?(i=this.V(i),0<i.length?String(i[0]):o):o};function Hr(i,o,c){Br(i,o),0<c.length&&(i.i=null,i.g.set(ht(i,o),U(c)),i.h+=c.length)}n.toString=function(){if(this.i)return this.i;if(!this.g)return"";const i=[],o=Array.from(this.g.keys());for(var c=0;c<o.length;c++){var h=o[c];const T=encodeURIComponent(String(h)),A=this.V(h);for(h=0;h<A.length;h++){var v=T;A[h]!==""&&(v+="="+encodeURIComponent(String(A[h]))),i.push(v)}}return this.i=i.join("&")};function ht(i,o){return o=String(o),i.j&&(o=o.toLowerCase()),o}function _c(i,o){o&&!i.j&&(Me(i),i.i=null,i.g.forEach(function(c,h){var v=h.toLowerCase();h!=v&&(Br(this,h),Hr(this,v,c))},i)),i.j=o}function yc(i,o){const c=new Pt;if(u.Image){const h=new Image;h.onload=P(Ue,c,"TestLoadImage: loaded",!0,o,h),h.onerror=P(Ue,c,"TestLoadImage: error",!1,o,h),h.onabort=P(Ue,c,"TestLoadImage: abort",!1,o,h),h.ontimeout=P(Ue,c,"TestLoadImage: timeout",!1,o,h),u.setTimeout(function(){h.ontimeout&&h.ontimeout()},1e4),h.src=i}else o(!1)}function vc(i,o){const c=new Pt,h=new AbortController,v=setTimeout(()=>{h.abort(),Ue(c,"TestPingServer: timeout",!1,o)},1e4);fetch(i,{signal:h.signal}).then(T=>{clearTimeout(v),T.ok?Ue(c,"TestPingServer: ok",!0,o):Ue(c,"TestPingServer: server error",!1,o)}).catch(()=>{clearTimeout(v),Ue(c,"TestPingServer: error",!1,o)})}function Ue(i,o,c,h,v){try{v&&(v.onload=null,v.onerror=null,v.onabort=null,v.ontimeout=null),h(c)}catch{}}function Ic(){this.g=new ec}function wc(i,o,c){const h=c||"";try{xr(i,function(v,T){let A=v;w(v)&&(A=ei(v)),o.push(h+T+"="+encodeURIComponent(A))})}catch(v){throw o.push(h+"type="+encodeURIComponent("_badmap")),v}}function dn(i){this.l=i.Ub||null,this.j=i.eb||!1}k(dn,ti),dn.prototype.g=function(){return new fn(this.l,this.j)},dn.prototype.i=(function(i){return function(){return i}})({});function fn(i,o){K.call(this),this.D=i,this.o=o,this.m=void 0,this.status=this.readyState=0,this.responseType=this.responseText=this.response=this.statusText="",this.onreadystatechange=null,this.u=new Headers,this.h=null,this.B="GET",this.A="",this.g=!1,this.v=this.j=this.l=null}k(fn,K),n=fn.prototype,n.open=function(i,o){if(this.readyState!=0)throw this.abort(),Error("Error reopening a connection");this.B=i,this.A=o,this.readyState=1,Ut(this)},n.send=function(i){if(this.readyState!=1)throw this.abort(),Error("need to call open() first. ");this.g=!0;const o={headers:this.u,method:this.B,credentials:this.m,cache:void 0};i&&(o.body=i),(this.D||u).fetch(new Request(this.A,o)).then(this.Sa.bind(this),this.ga.bind(this))},n.abort=function(){this.response=this.responseText="",this.u=new Headers,this.status=0,this.j&&this.j.cancel("Request was aborted.").catch(()=>{}),1<=this.readyState&&this.g&&this.readyState!=4&&(this.g=!1,Mt(this)),this.readyState=0},n.Sa=function(i){if(this.g&&(this.l=i,this.h||(this.status=this.l.status,this.statusText=this.l.statusText,this.h=i.headers,this.readyState=2,Ut(this)),this.g&&(this.readyState=3,Ut(this),this.g)))if(this.responseType==="arraybuffer")i.arrayBuffer().then(this.Qa.bind(this),this.ga.bind(this));else if(typeof u.ReadableStream<"u"&&"body"in i){if(this.j=i.body.getReader(),this.o){if(this.responseType)throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');this.response=[]}else this.response=this.responseText="",this.v=new TextDecoder;Wr(this)}else i.text().then(this.Ra.bind(this),this.ga.bind(this))};function Wr(i){i.j.read().then(i.Pa.bind(i)).catch(i.ga.bind(i))}n.Pa=function(i){if(this.g){if(this.o&&i.value)this.response.push(i.value);else if(!this.o){var o=i.value?i.value:new Uint8Array(0);(o=this.v.decode(o,{stream:!i.done}))&&(this.response=this.responseText+=o)}i.done?Mt(this):Ut(this),this.readyState==3&&Wr(this)}},n.Ra=function(i){this.g&&(this.response=this.responseText=i,Mt(this))},n.Qa=function(i){this.g&&(this.response=i,Mt(this))},n.ga=function(){this.g&&Mt(this)};function Mt(i){i.readyState=4,i.l=null,i.j=null,i.v=null,Ut(i)}n.setRequestHeader=function(i,o){this.u.append(i,o)},n.getResponseHeader=function(i){return this.h&&this.h.get(i.toLowerCase())||""},n.getAllResponseHeaders=function(){if(!this.h)return"";const i=[],o=this.h.entries();for(var c=o.next();!c.done;)c=c.value,i.push(c[0]+": "+c[1]),c=o.next();return i.join(`\r
`)};function Ut(i){i.onreadystatechange&&i.onreadystatechange.call(i)}Object.defineProperty(fn.prototype,"withCredentials",{get:function(){return this.m==="include"},set:function(i){this.m=i?"include":"same-origin"}});function zr(i){let o="";return W(i,function(c,h){o+=h,o+=":",o+=c,o+=`\r
`}),o}function fi(i,o,c){e:{for(h in c){var h=!1;break e}h=!0}h||(c=zr(c),typeof i=="string"?c!=null&&encodeURIComponent(String(c)):V(i,o,c))}function B(i){K.call(this),this.headers=new Map,this.o=i||null,this.h=!1,this.v=this.g=null,this.D="",this.m=0,this.l="",this.j=this.B=this.u=this.A=!1,this.I=null,this.H="",this.J=!1}k(B,K);var Tc=/^https?$/i,Ec=["POST","PUT"];n=B.prototype,n.Ha=function(i){this.J=i},n.ea=function(i,o,c,h){if(this.g)throw Error("[goog.net.XhrIo] Object is active with another request="+this.D+"; newUri="+i);o=o?o.toUpperCase():"GET",this.D=i,this.l="",this.m=0,this.A=!1,this.h=!0,this.g=this.o?this.o.g():oi.g(),this.v=this.o?Tr(this.o):Tr(oi),this.g.onreadystatechange=E(this.Ea,this);try{this.B=!0,this.g.open(o,String(i),!0),this.B=!1}catch(T){Gr(this,T);return}if(i=c||"",c=new Map(this.headers),h)if(Object.getPrototypeOf(h)===Object.prototype)for(var v in h)c.set(v,h[v]);else if(typeof h.keys=="function"&&typeof h.get=="function")for(const T of h.keys())c.set(T,h.get(T));else throw Error("Unknown input type for opt_headers: "+String(h));h=Array.from(c.keys()).find(T=>T.toLowerCase()=="content-type"),v=u.FormData&&i instanceof u.FormData,!(0<=Array.prototype.indexOf.call(Ec,o,void 0))||h||v||c.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");for(const[T,A]of c)this.g.setRequestHeader(T,A);this.H&&(this.g.responseType=this.H),"withCredentials"in this.g&&this.g.withCredentials!==this.J&&(this.g.withCredentials=this.J);try{Jr(this),this.u=!0,this.g.send(i),this.u=!1}catch(T){Gr(this,T)}};function Gr(i,o){i.h=!1,i.g&&(i.j=!0,i.g.abort(),i.j=!1),i.l=o,i.m=5,qr(i),pn(i)}function qr(i){i.A||(i.A=!0,Y(i,"complete"),Y(i,"error"))}n.abort=function(i){this.g&&this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1,this.m=i||7,Y(this,"complete"),Y(this,"abort"),pn(this))},n.N=function(){this.g&&(this.h&&(this.h=!1,this.j=!0,this.g.abort(),this.j=!1),pn(this,!0)),B.aa.N.call(this)},n.Ea=function(){this.s||(this.B||this.u||this.j?Kr(this):this.bb())},n.bb=function(){Kr(this)};function Kr(i){if(i.h&&typeof l<"u"&&(!i.v[1]||be(i)!=4||i.Z()!=2)){if(i.u&&be(i)==4)yr(i.Ea,0,i);else if(Y(i,"readystatechange"),be(i)==4){i.h=!1;try{const A=i.Z();e:switch(A){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var o=!0;break e;default:o=!1}var c;if(!(c=o)){var h;if(h=A===0){var v=String(i.D).match(Fr)[1]||null;!v&&u.self&&u.self.location&&(v=u.self.location.protocol.slice(0,-1)),h=!Tc.test(v?v.toLowerCase():"")}c=h}if(c)Y(i,"complete"),Y(i,"success");else{i.m=6;try{var T=2<be(i)?i.g.statusText:""}catch{T=""}i.l=T+" ["+i.Z()+"]",qr(i)}}finally{pn(i)}}}}function pn(i,o){if(i.g){Jr(i);const c=i.g,h=i.v[0]?()=>{}:null;i.g=null,i.v=null,o||Y(i,"ready");try{c.onreadystatechange=h}catch{}}}function Jr(i){i.I&&(u.clearTimeout(i.I),i.I=null)}n.isActive=function(){return!!this.g};function be(i){return i.g?i.g.readyState:0}n.Z=function(){try{return 2<be(this)?this.g.status:-1}catch{return-1}},n.oa=function(){try{return this.g?this.g.responseText:""}catch{return""}},n.Oa=function(i){if(this.g){var o=this.g.responseText;return i&&o.indexOf(i)==0&&(o=o.substring(i.length)),Qa(o)}};function Xr(i){try{if(!i.g)return null;if("response"in i.g)return i.g.response;switch(i.H){case"":case"text":return i.g.responseText;case"arraybuffer":if("mozResponseArrayBuffer"in i.g)return i.g.mozResponseArrayBuffer}return null}catch{return null}}function Ac(i){const o={};i=(i.g&&2<=be(i)&&i.g.getAllResponseHeaders()||"").split(`\r
`);for(let h=0;h<i.length;h++){if($(i[h]))continue;var c=_(i[h]);const v=c[0];if(c=c[1],typeof c!="string")continue;c=c.trim();const T=o[v]||[];o[v]=T,T.push(c)}y(o,function(h){return h.join(", ")})}n.Ba=function(){return this.m},n.Ka=function(){return typeof this.l=="string"?this.l:String(this.l)};function xt(i,o,c){return c&&c.internalChannelParams&&c.internalChannelParams[i]||o}function Yr(i){this.Aa=0,this.i=[],this.j=new Pt,this.ia=this.qa=this.I=this.W=this.g=this.ya=this.D=this.H=this.m=this.S=this.o=null,this.Ya=this.U=0,this.Va=xt("failFast",!1,i),this.F=this.C=this.u=this.s=this.l=null,this.X=!0,this.za=this.T=-1,this.Y=this.v=this.B=0,this.Ta=xt("baseRetryDelayMs",5e3,i),this.cb=xt("retryDelaySeedMs",1e4,i),this.Wa=xt("forwardChannelMaxRetries",2,i),this.wa=xt("forwardChannelRequestTimeoutMs",2e4,i),this.pa=i&&i.xmlHttpFactory||void 0,this.Xa=i&&i.Tb||void 0,this.Ca=i&&i.useFetchStreams||!1,this.L=void 0,this.J=i&&i.supportsCrossDomainXhr||!1,this.K="",this.h=new Nr(i&&i.concurrentRequestLimit),this.Da=new Ic,this.P=i&&i.fastHandshake||!1,this.O=i&&i.encodeInitMessageHeaders||!1,this.P&&this.O&&(this.O=!1),this.Ua=i&&i.Rb||!1,i&&i.xa&&this.j.xa(),i&&i.forceLongPolling&&(this.X=!1),this.ba=!this.P&&this.X&&i&&i.detectBufferingProxy||!1,this.ja=void 0,i&&i.longPollingTimeout&&0<i.longPollingTimeout&&(this.ja=i.longPollingTimeout),this.ca=void 0,this.R=0,this.M=!1,this.ka=this.A=null}n=Yr.prototype,n.la=8,n.G=1,n.connect=function(i,o,c,h){Z(0),this.W=i,this.H=o||{},c&&h!==void 0&&(this.H.OSID=c,this.H.OAID=h),this.F=this.X,this.I=os(this,null,this.W),mn(this)};function pi(i){if(Zr(i),i.G==3){var o=i.U++,c=Ae(i.I);if(V(c,"SID",i.K),V(c,"RID",o),V(c,"TYPE","terminate"),Ft(i,c),o=new Le(i,i.j,o),o.L=2,o.v=un(Ae(c)),c=!1,u.navigator&&u.navigator.sendBeacon)try{c=u.navigator.sendBeacon(o.v.toString(),"")}catch{}!c&&u.Image&&(new Image().src=o.v,c=!0),c||(o.g=as(o.j,null),o.g.ea(o.v)),o.F=Date.now(),cn(o)}ss(i)}function gn(i){i.g&&(mi(i),i.g.cancel(),i.g=null)}function Zr(i){gn(i),i.u&&(u.clearTimeout(i.u),i.u=null),_n(i),i.h.cancel(),i.s&&(typeof i.s=="number"&&u.clearTimeout(i.s),i.s=null)}function mn(i){if(!Dr(i.h)&&!i.s){i.s=!0;var o=i.Ga;Et||fr(),At||(Et(),At=!0),Gn.add(o,i),i.B=0}}function bc(i,o){return Lr(i.h)>=i.h.j-(i.s?1:0)?!1:i.s?(i.i=o.D.concat(i.i),!0):i.G==1||i.G==2||i.B>=(i.Va?0:i.Wa)?!1:(i.s=Ct(E(i.Ga,i,o),rs(i,i.B)),i.B++,!0)}n.Ga=function(i){if(this.s)if(this.s=null,this.G==1){if(!i){this.U=Math.floor(1e5*Math.random()),i=this.U++;const v=new Le(this,this.j,i);let T=this.o;if(this.S&&(T?(T=d(T),m(T,this.S)):T=this.S),this.m!==null||this.O||(v.H=T,T=null),this.P)e:{for(var o=0,c=0;c<this.i.length;c++){t:{var h=this.i[c];if("__data__"in h.map&&(h=h.map.__data__,typeof h=="string")){h=h.length;break t}h=void 0}if(h===void 0)break;if(o+=h,4096<o){o=c;break e}if(o===4096||c===this.i.length-1){o=c+1;break e}}o=1e3}else o=1e3;o=es(this,v,o),c=Ae(this.I),V(c,"RID",i),V(c,"CVER",22),this.D&&V(c,"X-HTTP-Session-Id",this.D),Ft(this,c),T&&(this.O?o="headers="+encodeURIComponent(String(zr(T)))+"&"+o:this.m&&fi(c,this.m,T)),di(this.h,v),this.Ua&&V(c,"TYPE","init"),this.P?(V(c,"$req",o),V(c,"SID","null"),v.T=!0,ci(v,c,null)):ci(v,c,o),this.G=2}}else this.G==3&&(i?Qr(this,i):this.i.length==0||Dr(this.h)||Qr(this))};function Qr(i,o){var c;o?c=o.l:c=i.U++;const h=Ae(i.I);V(h,"SID",i.K),V(h,"RID",c),V(h,"AID",i.T),Ft(i,h),i.m&&i.o&&fi(h,i.m,i.o),c=new Le(i,i.j,c,i.B+1),i.m===null&&(c.H=i.o),o&&(i.i=o.D.concat(i.i)),o=es(i,c,1e3),c.I=Math.round(.5*i.wa)+Math.round(.5*i.wa*Math.random()),di(i.h,c),ci(c,h,o)}function Ft(i,o){i.H&&W(i.H,function(c,h){V(o,h,c)}),i.l&&xr({},function(c,h){V(o,h,c)})}function es(i,o,c){c=Math.min(i.i.length,c);var h=i.l?E(i.l.Na,i.l,i):null;e:{var v=i.i;let T=-1;for(;;){const A=["count="+c];T==-1?0<c?(T=v[0].g,A.push("ofs="+T)):T=0:A.push("ofs="+T);let F=!0;for(let G=0;G<c;G++){let L=v[G].g;const J=v[G].map;if(L-=T,0>L)T=Math.max(0,v[G].g-100),F=!1;else try{wc(J,A,"req"+L+"_")}catch{h&&h(J)}}if(F){h=A.join("&");break e}}}return i=i.i.splice(0,c),o.D=i,h}function ts(i){if(!i.g&&!i.u){i.Y=1;var o=i.Fa;Et||fr(),At||(Et(),At=!0),Gn.add(o,i),i.v=0}}function gi(i){return i.g||i.u||3<=i.v?!1:(i.Y++,i.u=Ct(E(i.Fa,i),rs(i,i.v)),i.v++,!0)}n.Fa=function(){if(this.u=null,ns(this),this.ba&&!(this.M||this.g==null||0>=this.R)){var i=2*this.R;this.j.info("BP detection timer enabled: "+i),this.A=Ct(E(this.ab,this),i)}},n.ab=function(){this.A&&(this.A=null,this.j.info("BP detection timeout reached."),this.j.info("Buffering proxy detected and switch to long-polling!"),this.F=!1,this.M=!0,Z(10),gn(this),ns(this))};function mi(i){i.A!=null&&(u.clearTimeout(i.A),i.A=null)}function ns(i){i.g=new Le(i,i.j,"rpc",i.Y),i.m===null&&(i.g.H=i.o),i.g.O=0;var o=Ae(i.qa);V(o,"RID","rpc"),V(o,"SID",i.K),V(o,"AID",i.T),V(o,"CI",i.F?"0":"1"),!i.F&&i.ja&&V(o,"TO",i.ja),V(o,"TYPE","xmlhttp"),Ft(i,o),i.m&&i.o&&fi(o,i.m,i.o),i.L&&(i.g.I=i.L);var c=i.g;i=i.ia,c.L=1,c.v=un(Ae(o)),c.m=null,c.P=!0,Cr(c,i)}n.Za=function(){this.C!=null&&(this.C=null,gn(this),gi(this),Z(19))};function _n(i){i.C!=null&&(u.clearTimeout(i.C),i.C=null)}function is(i,o){var c=null;if(i.g==o){_n(i),mi(i),i.g=null;var h=2}else if(ui(i.h,o))c=o.D,Mr(i.h,o),h=1;else return;if(i.G!=0){if(o.o)if(h==1){c=o.m?o.m.length:0,o=Date.now()-o.F;var v=i.B;h=ri(),Y(h,new Sr(h,c)),mn(i)}else ts(i);else if(v=o.s,v==3||v==0&&0<o.X||!(h==1&&bc(i,o)||h==2&&gi(i)))switch(c&&0<c.length&&(o=i.h,o.i=o.i.concat(c)),v){case 1:Ke(i,5);break;case 4:Ke(i,10);break;case 3:Ke(i,6);break;default:Ke(i,2)}}}function rs(i,o){let c=i.Ta+Math.floor(Math.random()*i.cb);return i.isActive()||(c*=2),c*o}function Ke(i,o){if(i.j.info("Error code "+o),o==2){var c=E(i.fb,i),h=i.Xa;const v=!h;h=new qe(h||"//www.google.com/images/cleardot.gif"),u.location&&u.location.protocol=="http"||ln(h,"https"),un(h),v?yc(h.toString(),c):vc(h.toString(),c)}else Z(2);i.G=0,i.l&&i.l.sa(o),ss(i),Zr(i)}n.fb=function(i){i?(this.j.info("Successfully pinged google.com"),Z(2)):(this.j.info("Failed to ping google.com"),Z(1))};function ss(i){if(i.G=0,i.ka=[],i.l){const o=Ur(i.h);(o.length!=0||i.i.length!=0)&&(C(i.ka,o),C(i.ka,i.i),i.h.i.length=0,U(i.i),i.i.length=0),i.l.ra()}}function os(i,o,c){var h=c instanceof qe?Ae(c):new qe(c);if(h.g!="")o&&(h.g=o+"."+h.g),hn(h,h.s);else{var v=u.location;h=v.protocol,o=o?o+"."+v.hostname:v.hostname,v=+v.port;var T=new qe(null);h&&ln(T,h),o&&(T.g=o),v&&hn(T,v),c&&(T.l=c),h=T}return c=i.D,o=i.ya,c&&o&&V(h,c,o),V(h,"VER",i.la),Ft(i,h),h}function as(i,o,c){if(o&&!i.J)throw Error("Can't create secondary domain capable XhrIo object.");return o=i.Ca&&!i.pa?new B(new dn({eb:c})):new B(i.pa),o.Ha(i.J),o}n.isActive=function(){return!!this.l&&this.l.isActive(this)};function cs(){}n=cs.prototype,n.ua=function(){},n.ta=function(){},n.sa=function(){},n.ra=function(){},n.isActive=function(){return!0},n.Na=function(){};function se(i,o){K.call(this),this.g=new Yr(o),this.l=i,this.h=o&&o.messageUrlParams||null,i=o&&o.messageHeaders||null,o&&o.clientProtocolHeaderRequired&&(i?i["X-Client-Protocol"]="webchannel":i={"X-Client-Protocol":"webchannel"}),this.g.o=i,i=o&&o.initMessageHeaders||null,o&&o.messageContentType&&(i?i["X-WebChannel-Content-Type"]=o.messageContentType:i={"X-WebChannel-Content-Type":o.messageContentType}),o&&o.va&&(i?i["X-WebChannel-Client-Profile"]=o.va:i={"X-WebChannel-Client-Profile":o.va}),this.g.S=i,(i=o&&o.Sb)&&!$(i)&&(this.g.m=i),this.v=o&&o.supportsCrossDomainXhr||!1,this.u=o&&o.sendRawJson||!1,(o=o&&o.httpSessionIdParam)&&!$(o)&&(this.g.D=o,i=this.h,i!==null&&o in i&&(i=this.h,o in i&&delete i[o])),this.j=new ut(this)}k(se,K),se.prototype.m=function(){this.g.l=this.j,this.v&&(this.g.J=!0),this.g.connect(this.l,this.h||void 0)},se.prototype.close=function(){pi(this.g)},se.prototype.o=function(i){var o=this.g;if(typeof i=="string"){var c={};c.__data__=i,i=c}else this.u&&(c={},c.__data__=ei(i),i=c);o.i.push(new cc(o.Ya++,i)),o.G==3&&mn(o)},se.prototype.N=function(){this.g.l=null,delete this.j,pi(this.g),delete this.g,se.aa.N.call(this)};function ls(i){ni.call(this),i.__headers__&&(this.headers=i.__headers__,this.statusCode=i.__status__,delete i.__headers__,delete i.__status__);var o=i.__sm__;if(o){e:{for(const c in o){i=c;break e}i=void 0}(this.i=i)&&(i=this.i,o=o!==null&&i in o?o[i]:void 0),this.data=o}else this.data=i}k(ls,ni);function hs(){ii.call(this),this.status=1}k(hs,ii);function ut(i){this.g=i}k(ut,cs),ut.prototype.ua=function(){Y(this.g,"a")},ut.prototype.ta=function(i){Y(this.g,new ls(i))},ut.prototype.sa=function(i){Y(this.g,new hs)},ut.prototype.ra=function(){Y(this.g,"b")},se.prototype.send=se.prototype.o,se.prototype.open=se.prototype.m,se.prototype.close=se.prototype.close,si.NO_ERROR=0,si.TIMEOUT=8,si.HTTP_ERROR=6,oc.COMPLETE="complete",tc.EventType=Rt,Rt.OPEN="a",Rt.CLOSE="b",Rt.ERROR="c",Rt.MESSAGE="d",K.prototype.listen=K.prototype.K,B.prototype.listenOnce=B.prototype.L,B.prototype.getLastError=B.prototype.Ka,B.prototype.getLastErrorCode=B.prototype.Ba,B.prototype.getStatus=B.prototype.Z,B.prototype.getResponseJson=B.prototype.Oa,B.prototype.getResponseText=B.prototype.oa,B.prototype.send=B.prototype.ea,B.prototype.setWithCredentials=B.prototype.Ha}).apply(typeof In<"u"?In:typeof self<"u"?self:typeof window<"u"?window:{});const Js="@firebase/firestore",Xs="4.8.0";/**
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
 */class Q{constructor(e){this.uid=e}isAuthenticated(){return this.uid!=null}toKey(){return this.isAuthenticated()?"uid:"+this.uid:"anonymous-user"}isEqual(e){return e.uid===this.uid}}Q.UNAUTHENTICATED=new Q(null),Q.GOOGLE_CREDENTIALS=new Q("google-credentials-uid"),Q.FIRST_PARTY=new Q("first-party-uid"),Q.MOCK_USER=new Q("mock-user");/**
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
 */let en="11.10.0";/**
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
 */const vt=new Vn("@firebase/firestore");function de(n,...e){if(vt.logLevel<=M.DEBUG){const t=e.map(lr);vt.debug(`Firestore (${en}): ${n}`,...t)}}function Na(n,...e){if(vt.logLevel<=M.ERROR){const t=e.map(lr);vt.error(`Firestore (${en}): ${n}`,...t)}}function Rf(n,...e){if(vt.logLevel<=M.WARN){const t=e.map(lr);vt.warn(`Firestore (${en}): ${n}`,...t)}}function lr(n){if(typeof n=="string")return n;try{/**
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
*/return(function(t){return JSON.stringify(t)})(n)}catch{return n}}/**
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
 */function Kt(n,e,t){let r="Unexpected state";typeof e=="string"?r=e:t=e,Da(n,r,t)}function Da(n,e,t){let r=`FIRESTORE (${en}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;if(t!==void 0)try{r+=" CONTEXT: "+JSON.stringify(t)}catch{r+=" CONTEXT: "+t}throw Na(r),new Error(r)}function $t(n,e,t,r){let s="Unexpected state";typeof t=="string"?s=t:r=t,n||Da(e,s,r)}/**
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
 */const N={CANCELLED:"cancelled",INVALID_ARGUMENT:"invalid-argument",FAILED_PRECONDITION:"failed-precondition"};class D extends ae{constructor(e,t){super(e,t),this.code=e,this.message=t,this.toString=()=>`${this.name}: [code=${this.code}]: ${this.message}`}}/**
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
 */class Ht{constructor(){this.promise=new Promise(((e,t)=>{this.resolve=e,this.reject=t}))}}/**
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
 */class La{constructor(e,t){this.user=t,this.type="OAuth",this.headers=new Map,this.headers.set("Authorization",`Bearer ${e}`)}}class kf{getToken(){return Promise.resolve(null)}invalidateToken(){}start(e,t){e.enqueueRetryable((()=>t(Q.UNAUTHENTICATED)))}shutdown(){}}class Cf{constructor(e){this.token=e,this.changeListener=null}getToken(){return Promise.resolve(this.token)}invalidateToken(){}start(e,t){this.changeListener=t,e.enqueueRetryable((()=>t(this.token.user)))}shutdown(){this.changeListener=null}}class Pf{constructor(e){this.t=e,this.currentUser=Q.UNAUTHENTICATED,this.i=0,this.forceRefresh=!1,this.auth=null}start(e,t){$t(this.o===void 0,42304);let r=this.i;const s=f=>this.i!==r?(r=this.i,t(f)):Promise.resolve();let a=new Ht;this.o=()=>{this.i++,this.currentUser=this.u(),a.resolve(),a=new Ht,e.enqueueRetryable((()=>s(this.currentUser)))};const l=()=>{const f=a;e.enqueueRetryable((async()=>{await f.promise,await s(this.currentUser)}))},u=f=>{de("FirebaseAuthCredentialsProvider","Auth detected"),this.auth=f,this.o&&(this.auth.addAuthTokenListener(this.o),l())};this.t.onInit((f=>u(f))),setTimeout((()=>{if(!this.auth){const f=this.t.getImmediate({optional:!0});f?u(f):(de("FirebaseAuthCredentialsProvider","Auth not yet detected"),a.resolve(),a=new Ht)}}),0),l()}getToken(){const e=this.i,t=this.forceRefresh;return this.forceRefresh=!1,this.auth?this.auth.getToken(t).then((r=>this.i!==e?(de("FirebaseAuthCredentialsProvider","getToken aborted due to token change."),this.getToken()):r?($t(typeof r.accessToken=="string",31837,{l:r}),new La(r.accessToken,this.currentUser)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.auth&&this.o&&this.auth.removeAuthTokenListener(this.o),this.o=void 0}u(){const e=this.auth&&this.auth.getUid();return $t(e===null||typeof e=="string",2055,{h:e}),new Q(e)}}class Of{constructor(e,t,r){this.P=e,this.T=t,this.I=r,this.type="FirstParty",this.user=Q.FIRST_PARTY,this.A=new Map}R(){return this.I?this.I():null}get headers(){this.A.set("X-Goog-AuthUser",this.P);const e=this.R();return e&&this.A.set("Authorization",e),this.T&&this.A.set("X-Goog-Iam-Authorization-Token",this.T),this.A}}class Nf{constructor(e,t,r){this.P=e,this.T=t,this.I=r}getToken(){return Promise.resolve(new Of(this.P,this.T,this.I))}start(e,t){e.enqueueRetryable((()=>t(Q.FIRST_PARTY)))}shutdown(){}invalidateToken(){}}class Ys{constructor(e){this.value=e,this.type="AppCheck",this.headers=new Map,e&&e.length>0&&this.headers.set("x-firebase-appcheck",this.value)}}class Df{constructor(e,t){this.V=t,this.forceRefresh=!1,this.appCheck=null,this.m=null,this.p=null,he(e)&&e.settings.appCheckToken&&(this.p=e.settings.appCheckToken)}start(e,t){$t(this.o===void 0,3512);const r=a=>{a.error!=null&&de("FirebaseAppCheckTokenProvider",`Error getting App Check token; using placeholder token instead. Error: ${a.error.message}`);const l=a.token!==this.m;return this.m=a.token,de("FirebaseAppCheckTokenProvider",`Received ${l?"new":"existing"} token.`),l?t(a.token):Promise.resolve()};this.o=a=>{e.enqueueRetryable((()=>r(a)))};const s=a=>{de("FirebaseAppCheckTokenProvider","AppCheck detected"),this.appCheck=a,this.o&&this.appCheck.addTokenListener(this.o)};this.V.onInit((a=>s(a))),setTimeout((()=>{if(!this.appCheck){const a=this.V.getImmediate({optional:!0});a?s(a):de("FirebaseAppCheckTokenProvider","AppCheck not yet detected")}}),0)}getToken(){if(this.p)return Promise.resolve(new Ys(this.p));const e=this.forceRefresh;return this.forceRefresh=!1,this.appCheck?this.appCheck.getToken(e).then((t=>t?($t(typeof t.token=="string",44558,{tokenResult:t}),this.m=t.token,new Ys(t.token)):null)):Promise.resolve(null)}invalidateToken(){this.forceRefresh=!0}shutdown(){this.appCheck&&this.o&&this.appCheck.removeTokenListener(this.o),this.o=void 0}}/**
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
 */function Lf(n){const e=typeof self<"u"&&(self.crypto||self.msCrypto),t=new Uint8Array(n);if(e&&typeof e.getRandomValues=="function")e.getRandomValues(t);else for(let r=0;r<n;r++)t[r]=Math.floor(256*Math.random());return t}/**
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
 */function Mf(){return new TextEncoder}/**
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
 */class Uf{static newId(){const e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",t=62*Math.floor(4.129032258064516);let r="";for(;r.length<20;){const s=Lf(40);for(let a=0;a<s.length;++a)r.length<20&&s[a]<t&&(r+=e.charAt(s[a]%62))}return r}}function pe(n,e){return n<e?-1:n>e?1:0}function xf(n,e){let t=0;for(;t<n.length&&t<e.length;){const r=n.codePointAt(t),s=e.codePointAt(t);if(r!==s){if(r<128&&s<128)return pe(r,s);{const a=Mf(),l=Ff(a.encode(Zs(n,t)),a.encode(Zs(e,t)));return l!==0?l:pe(r,s)}}t+=r>65535?2:1}return pe(n.length,e.length)}function Zs(n,e){return n.codePointAt(e)>65535?n.substring(e,e+2):n.substring(e,e+1)}function Ff(n,e){for(let t=0;t<n.length&&t<e.length;++t)if(n[t]!==e[t])return pe(n[t],e[t]);return pe(n.length,e.length)}/**
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
 */const Qs="__name__";class me{constructor(e,t,r){t===void 0?t=0:t>e.length&&Kt(637,{offset:t,range:e.length}),r===void 0?r=e.length-t:r>e.length-t&&Kt(1746,{length:r,range:e.length-t}),this.segments=e,this.offset=t,this.len=r}get length(){return this.len}isEqual(e){return me.comparator(this,e)===0}child(e){const t=this.segments.slice(this.offset,this.limit());return e instanceof me?e.forEach((r=>{t.push(r)})):t.push(e),this.construct(t)}limit(){return this.offset+this.length}popFirst(e){return e=e===void 0?1:e,this.construct(this.segments,this.offset+e,this.length-e)}popLast(){return this.construct(this.segments,this.offset,this.length-1)}firstSegment(){return this.segments[this.offset]}lastSegment(){return this.get(this.length-1)}get(e){return this.segments[this.offset+e]}isEmpty(){return this.length===0}isPrefixOf(e){if(e.length<this.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}isImmediateParentOf(e){if(this.length+1!==e.length)return!1;for(let t=0;t<this.length;t++)if(this.get(t)!==e.get(t))return!1;return!0}forEach(e){for(let t=this.offset,r=this.limit();t<r;t++)e(this.segments[t])}toArray(){return this.segments.slice(this.offset,this.limit())}static comparator(e,t){const r=Math.min(e.length,t.length);for(let s=0;s<r;s++){const a=me.compareSegments(e.get(s),t.get(s));if(a!==0)return a}return pe(e.length,t.length)}static compareSegments(e,t){const r=me.isNumericId(e),s=me.isNumericId(t);return r&&!s?-1:!r&&s?1:r&&s?me.extractNumericId(e).compare(me.extractNumericId(t)):xf(e,t)}static isNumericId(e){return e.startsWith("__id")&&e.endsWith("__")}static extractNumericId(e){return cr.fromString(e.substring(4,e.length-2))}}class le extends me{construct(e,t,r){return new le(e,t,r)}canonicalString(){return this.toArray().join("/")}toString(){return this.canonicalString()}toUriEncodedString(){return this.toArray().map(encodeURIComponent).join("/")}static fromString(...e){const t=[];for(const r of e){if(r.indexOf("//")>=0)throw new D(N.INVALID_ARGUMENT,`Invalid segment (${r}). Paths must not contain // in them.`);t.push(...r.split("/").filter((s=>s.length>0)))}return new le(t)}static emptyPath(){return new le([])}}const jf=/^[_a-zA-Z][_a-zA-Z0-9]*$/;class Xe extends me{construct(e,t,r){return new Xe(e,t,r)}static isValidIdentifier(e){return jf.test(e)}canonicalString(){return this.toArray().map((e=>(e=e.replace(/\\/g,"\\\\").replace(/`/g,"\\`"),Xe.isValidIdentifier(e)||(e="`"+e+"`"),e))).join(".")}toString(){return this.canonicalString()}isKeyField(){return this.length===1&&this.get(0)===Qs}static keyField(){return new Xe([Qs])}static fromServerFormat(e){const t=[];let r="",s=0;const a=()=>{if(r.length===0)throw new D(N.INVALID_ARGUMENT,`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`);t.push(r),r=""};let l=!1;for(;s<e.length;){const u=e[s];if(u==="\\"){if(s+1===e.length)throw new D(N.INVALID_ARGUMENT,"Path has trailing escape character: "+e);const f=e[s+1];if(f!=="\\"&&f!=="."&&f!=="`")throw new D(N.INVALID_ARGUMENT,"Path has invalid escape sequence: "+e);r+=f,s+=2}else u==="`"?(l=!l,s++):u!=="."||l?(r+=u,s++):(a(),s++)}if(a(),l)throw new D(N.INVALID_ARGUMENT,"Unterminated ` in path: "+e);return new Xe(t)}static emptyPath(){return new Xe([])}}/**
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
 */class Ze{constructor(e){this.path=e}static fromPath(e){return new Ze(le.fromString(e))}static fromName(e){return new Ze(le.fromString(e).popFirst(5))}static empty(){return new Ze(le.emptyPath())}get collectionGroup(){return this.path.popLast().lastSegment()}hasCollectionId(e){return this.path.length>=2&&this.path.get(this.path.length-2)===e}getCollectionGroup(){return this.path.get(this.path.length-2)}getCollectionPath(){return this.path.popLast()}isEqual(e){return e!==null&&le.comparator(this.path,e.path)===0}toString(){return this.path.toString()}static comparator(e,t){return le.comparator(e.path,t.path)}static isDocumentKey(e){return e.length%2==0}static fromSegments(e){return new Ze(new le(e.slice()))}}function Vf(n,e,t,r){if(e===!0&&r===!0)throw new D(N.INVALID_ARGUMENT,`${n} and ${t} cannot be used together.`)}function Bf(n){return typeof n=="object"&&n!==null&&(Object.getPrototypeOf(n)===Object.prototype||Object.getPrototypeOf(n)===null)}function $f(n){if(n===void 0)return"undefined";if(n===null)return"null";if(typeof n=="string")return n.length>20&&(n=`${n.substring(0,20)}...`),JSON.stringify(n);if(typeof n=="number"||typeof n=="boolean")return""+n;if(typeof n=="object"){if(n instanceof Array)return"an array";{const e=(function(r){return r.constructor?r.constructor.name:null})(n);return e?`a custom ${e} object`:"an object"}}return typeof n=="function"?"a function":Kt(12329,{type:typeof n})}function Hf(n,e){if("_delegate"in n&&(n=n._delegate),!(n instanceof e)){if(e.name===n.constructor.name)throw new D(N.INVALID_ARGUMENT,"Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?");{const t=$f(n);throw new D(N.INVALID_ARGUMENT,`Expected type '${e.name}', but it was: ${t}`)}}return n}/**
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
 */function H(n,e){const t={typeString:n};return e&&(t.value=e),t}function tn(n,e){if(!Bf(n))throw new D(N.INVALID_ARGUMENT,"JSON must be an object");let t;for(const r in e)if(e[r]){const s=e[r].typeString,a="value"in e[r]?{value:e[r].value}:void 0;if(!(r in n)){t=`JSON missing required field: '${r}'`;break}const l=n[r];if(s&&typeof l!==s){t=`JSON field '${r}' must be a ${s}.`;break}if(a!==void 0&&l!==a.value){t=`Expected '${r}' field to equal '${a.value}'`;break}}if(t)throw new D(N.INVALID_ARGUMENT,t);return!0}/**
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
 */const eo=-62135596800,to=1e6;class _e{static now(){return _e.fromMillis(Date.now())}static fromDate(e){return _e.fromMillis(e.getTime())}static fromMillis(e){const t=Math.floor(e/1e3),r=Math.floor((e-1e3*t)*to);return new _e(t,r)}constructor(e,t){if(this.seconds=e,this.nanoseconds=t,t<0)throw new D(N.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(t>=1e9)throw new D(N.INVALID_ARGUMENT,"Timestamp nanoseconds out of range: "+t);if(e<eo)throw new D(N.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e);if(e>=253402300800)throw new D(N.INVALID_ARGUMENT,"Timestamp seconds out of range: "+e)}toDate(){return new Date(this.toMillis())}toMillis(){return 1e3*this.seconds+this.nanoseconds/to}_compareTo(e){return this.seconds===e.seconds?pe(this.nanoseconds,e.nanoseconds):pe(this.seconds,e.seconds)}isEqual(e){return e.seconds===this.seconds&&e.nanoseconds===this.nanoseconds}toString(){return"Timestamp(seconds="+this.seconds+", nanoseconds="+this.nanoseconds+")"}toJSON(){return{type:_e._jsonSchemaVersion,seconds:this.seconds,nanoseconds:this.nanoseconds}}static fromJSON(e){if(tn(e,_e._jsonSchema))return new _e(e.seconds,e.nanoseconds)}valueOf(){const e=this.seconds-eo;return String(e).padStart(12,"0")+"."+String(this.nanoseconds).padStart(9,"0")}}_e._jsonSchemaVersion="firestore/timestamp/1.0",_e._jsonSchema={type:H("string",_e._jsonSchemaVersion),seconds:H("number"),nanoseconds:H("number")};function Wf(n){return n.name==="IndexedDbTransactionError"}/**
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
 */class zf extends Error{constructor(){super(...arguments),this.name="Base64DecodeError"}}/**
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
 */class st{constructor(e){this.binaryString=e}static fromBase64String(e){const t=(function(s){try{return atob(s)}catch(a){throw typeof DOMException<"u"&&a instanceof DOMException?new zf("Invalid base64 string: "+a):a}})(e);return new st(t)}static fromUint8Array(e){const t=(function(s){let a="";for(let l=0;l<s.length;++l)a+=String.fromCharCode(s[l]);return a})(e);return new st(t)}[Symbol.iterator](){let e=0;return{next:()=>e<this.binaryString.length?{value:this.binaryString.charCodeAt(e++),done:!1}:{value:void 0,done:!0}}}toBase64(){return(function(t){return btoa(t)})(this.binaryString)}toUint8Array(){return(function(t){const r=new Uint8Array(t.length);for(let s=0;s<t.length;s++)r[s]=t.charCodeAt(s);return r})(this.binaryString)}approximateByteSize(){return 2*this.binaryString.length}compareTo(e){return pe(this.binaryString,e.binaryString)}isEqual(e){return this.binaryString===e.binaryString}}st.EMPTY_BYTE_STRING=new st("");const ji="(default)";class xn{constructor(e,t){this.projectId=e,this.database=t||ji}static empty(){return new xn("","")}get isDefaultDatabase(){return this.database===ji}isEqual(e){return e instanceof xn&&e.projectId===this.projectId&&e.database===this.database}}/**
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
 */class Gf{constructor(e,t=null,r=[],s=[],a=null,l="F",u=null,f=null){this.path=e,this.collectionGroup=t,this.explicitOrderBy=r,this.filters=s,this.limit=a,this.limitType=l,this.startAt=u,this.endAt=f,this.Te=null,this.Ie=null,this.de=null,this.startAt,this.endAt}}function qf(n){return new Gf(n)}/**
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
 */var no,O;(O=no||(no={}))[O.OK=0]="OK",O[O.CANCELLED=1]="CANCELLED",O[O.UNKNOWN=2]="UNKNOWN",O[O.INVALID_ARGUMENT=3]="INVALID_ARGUMENT",O[O.DEADLINE_EXCEEDED=4]="DEADLINE_EXCEEDED",O[O.NOT_FOUND=5]="NOT_FOUND",O[O.ALREADY_EXISTS=6]="ALREADY_EXISTS",O[O.PERMISSION_DENIED=7]="PERMISSION_DENIED",O[O.UNAUTHENTICATED=16]="UNAUTHENTICATED",O[O.RESOURCE_EXHAUSTED=8]="RESOURCE_EXHAUSTED",O[O.FAILED_PRECONDITION=9]="FAILED_PRECONDITION",O[O.ABORTED=10]="ABORTED",O[O.OUT_OF_RANGE=11]="OUT_OF_RANGE",O[O.UNIMPLEMENTED=12]="UNIMPLEMENTED",O[O.INTERNAL=13]="INTERNAL",O[O.UNAVAILABLE=14]="UNAVAILABLE",O[O.DATA_LOSS=15]="DATA_LOSS";/**
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
 */new cr([4294967295,4294967295],0);/**
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
 */const Kf=41943040;/**
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
 */const Jf=1048576;function ki(){return typeof document<"u"?document:null}/**
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
 */class Xf{constructor(e,t,r=1e3,s=1.5,a=6e4){this.Fi=e,this.timerId=t,this.d_=r,this.E_=s,this.A_=a,this.R_=0,this.V_=null,this.m_=Date.now(),this.reset()}reset(){this.R_=0}f_(){this.R_=this.A_}g_(e){this.cancel();const t=Math.floor(this.R_+this.p_()),r=Math.max(0,Date.now()-this.m_),s=Math.max(0,t-r);s>0&&de("ExponentialBackoff",`Backing off for ${s} ms (base delay: ${this.R_} ms, delay with jitter: ${t} ms, last attempt: ${r} ms ago)`),this.V_=this.Fi.enqueueAfterDelay(this.timerId,s,(()=>(this.m_=Date.now(),e()))),this.R_*=this.E_,this.R_<this.d_&&(this.R_=this.d_),this.R_>this.A_&&(this.R_=this.A_)}y_(){this.V_!==null&&(this.V_.skipDelay(),this.V_=null)}cancel(){this.V_!==null&&(this.V_.cancel(),this.V_=null)}p_(){return(Math.random()-.5)*this.R_}}/**
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
 */class hr{constructor(e,t,r,s,a){this.asyncQueue=e,this.timerId=t,this.targetTimeMs=r,this.op=s,this.removalCallback=a,this.deferred=new Ht,this.then=this.deferred.promise.then.bind(this.deferred.promise),this.deferred.promise.catch((l=>{}))}get promise(){return this.deferred.promise}static createAndSchedule(e,t,r,s,a){const l=Date.now()+r,u=new hr(e,t,l,s,a);return u.start(r),u}start(e){this.timerHandle=setTimeout((()=>this.handleDelayElapsed()),e)}skipDelay(){return this.handleDelayElapsed()}cancel(e){this.timerHandle!==null&&(this.clearTimeout(),this.deferred.reject(new D(N.CANCELLED,"Operation cancelled"+(e?": "+e:""))))}handleDelayElapsed(){this.asyncQueue.enqueueAndForget((()=>this.timerHandle!==null?(this.clearTimeout(),this.op().then((e=>this.deferred.resolve(e)))):Promise.resolve()))}clearTimeout(){this.timerHandle!==null&&(this.removalCallback(this),clearTimeout(this.timerHandle),this.timerHandle=null)}}var io,ro;(ro=io||(io={})).Fa="default",ro.Cache="cache";/**
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
 */function Yf(n){const e={};return n.timeoutSeconds!==void 0&&(e.timeoutSeconds=n.timeoutSeconds),e}/**
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
 */const so=new Map;/**
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
 */const Ma="firestore.googleapis.com",oo=!0;class ao{constructor(e){var t,r;if(e.host===void 0){if(e.ssl!==void 0)throw new D(N.INVALID_ARGUMENT,"Can't provide ssl option if host option is not set");this.host=Ma,this.ssl=oo}else this.host=e.host,this.ssl=(t=e.ssl)!==null&&t!==void 0?t:oo;if(this.isUsingEmulator=e.emulatorOptions!==void 0,this.credentials=e.credentials,this.ignoreUndefinedProperties=!!e.ignoreUndefinedProperties,this.localCache=e.localCache,e.cacheSizeBytes===void 0)this.cacheSizeBytes=Kf;else{if(e.cacheSizeBytes!==-1&&e.cacheSizeBytes<Jf)throw new D(N.INVALID_ARGUMENT,"cacheSizeBytes must be at least 1048576");this.cacheSizeBytes=e.cacheSizeBytes}Vf("experimentalForceLongPolling",e.experimentalForceLongPolling,"experimentalAutoDetectLongPolling",e.experimentalAutoDetectLongPolling),this.experimentalForceLongPolling=!!e.experimentalForceLongPolling,this.experimentalForceLongPolling?this.experimentalAutoDetectLongPolling=!1:e.experimentalAutoDetectLongPolling===void 0?this.experimentalAutoDetectLongPolling=!0:this.experimentalAutoDetectLongPolling=!!e.experimentalAutoDetectLongPolling,this.experimentalLongPollingOptions=Yf((r=e.experimentalLongPollingOptions)!==null&&r!==void 0?r:{}),(function(a){if(a.timeoutSeconds!==void 0){if(isNaN(a.timeoutSeconds))throw new D(N.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (must not be NaN)`);if(a.timeoutSeconds<5)throw new D(N.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (minimum allowed value is 5)`);if(a.timeoutSeconds>30)throw new D(N.INVALID_ARGUMENT,`invalid long polling timeout: ${a.timeoutSeconds} (maximum allowed value is 30)`)}})(this.experimentalLongPollingOptions),this.useFetchStreams=!!e.useFetchStreams}isEqual(e){return this.host===e.host&&this.ssl===e.ssl&&this.credentials===e.credentials&&this.cacheSizeBytes===e.cacheSizeBytes&&this.experimentalForceLongPolling===e.experimentalForceLongPolling&&this.experimentalAutoDetectLongPolling===e.experimentalAutoDetectLongPolling&&(function(r,s){return r.timeoutSeconds===s.timeoutSeconds})(this.experimentalLongPollingOptions,e.experimentalLongPollingOptions)&&this.ignoreUndefinedProperties===e.ignoreUndefinedProperties&&this.useFetchStreams===e.useFetchStreams}}class Ua{constructor(e,t,r,s){this._authCredentials=e,this._appCheckCredentials=t,this._databaseId=r,this._app=s,this.type="firestore-lite",this._persistenceKey="(lite)",this._settings=new ao({}),this._settingsFrozen=!1,this._emulatorOptions={},this._terminateTask="notTerminated"}get app(){if(!this._app)throw new D(N.FAILED_PRECONDITION,"Firestore was not initialized using the Firebase SDK. 'app' is not available");return this._app}get _initialized(){return this._settingsFrozen}get _terminated(){return this._terminateTask!=="notTerminated"}_setSettings(e){if(this._settingsFrozen)throw new D(N.FAILED_PRECONDITION,"Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.");this._settings=new ao(e),this._emulatorOptions=e.emulatorOptions||{},e.credentials!==void 0&&(this._authCredentials=(function(r){if(!r)return new kf;switch(r.type){case"firstParty":return new Nf(r.sessionIndex||"0",r.iamToken||null,r.authTokenFactory||null);case"provider":return r.client;default:throw new D(N.INVALID_ARGUMENT,"makeAuthCredentialsProvider failed due to invalid credential type")}})(e.credentials))}_getSettings(){return this._settings}_getEmulatorOptions(){return this._emulatorOptions}_freezeSettings(){return this._settingsFrozen=!0,this._settings}_delete(){return this._terminateTask==="notTerminated"&&(this._terminateTask=this._terminate()),this._terminateTask}async _restart(){this._terminateTask==="notTerminated"?await this._terminate():this._terminateTask="notTerminated"}toJSON(){return{app:this._app,databaseId:this._databaseId,settings:this._settings}}_terminate(){return(function(t){const r=so.get(t);r&&(de("ComponentProvider","Removing Datastore"),so.delete(t),r.terminate())})(this),Promise.resolve()}}function Zf(n,e,t,r={}){var s;n=Hf(n,Ua);const a=It(e),l=n._getSettings(),u=Object.assign(Object.assign({},l),{emulatorOptions:n._getEmulatorOptions()}),f=`${e}:${t}`;a&&(Bi(`https://${f}`),$i("Firestore",!0)),l.host!==Ma&&l.host!==f&&Rf("Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.");const w=Object.assign(Object.assign({},l),{host:f,ssl:a,emulatorOptions:r});if(!We(w,u)&&(n._setSettings(w),r.mockUserToken)){let b,S;if(typeof r.mockUserToken=="string")b=r.mockUserToken,S=Q.MOCK_USER;else{b=bo(r.mockUserToken,(s=n._app)===null||s===void 0?void 0:s.options.projectId);const E=r.mockUserToken.sub||r.mockUserToken.user_id;if(!E)throw new D(N.INVALID_ARGUMENT,"mockUserToken must contain 'sub' or 'user_id' field!");S=new Q(E)}n._authCredentials=new Cf(new La(b,S))}}/**
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
 */class ur{constructor(e,t,r){this.converter=t,this._query=r,this.type="query",this.firestore=e}withConverter(e){return new ur(this.firestore,e,this._query)}}class ye{constructor(e,t,r){this.converter=t,this._key=r,this.type="document",this.firestore=e}get _path(){return this._key.path}get id(){return this._key.path.lastSegment()}get path(){return this._key.path.canonicalString()}get parent(){return new dr(this.firestore,this.converter,this._key.path.popLast())}withConverter(e){return new ye(this.firestore,e,this._key)}toJSON(){return{type:ye._jsonSchemaVersion,referencePath:this._key.toString()}}static fromJSON(e,t,r){if(tn(t,ye._jsonSchema))return new ye(e,r||null,new Ze(le.fromString(t.referencePath)))}}ye._jsonSchemaVersion="firestore/documentReference/1.0",ye._jsonSchema={type:H("string",ye._jsonSchemaVersion),referencePath:H("string")};class dr extends ur{constructor(e,t,r){super(e,t,qf(r)),this._path=r,this.type="collection"}get id(){return this._query.path.lastSegment()}get path(){return this._query.path.canonicalString()}get parent(){const e=this._path.popLast();return e.isEmpty()?null:new ye(this.firestore,null,new Ze(e))}withConverter(e){return new dr(this.firestore,e,this._path)}}/**
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
 */const co="AsyncQueue";class lo{constructor(e=Promise.resolve()){this.Zu=[],this.Xu=!1,this.ec=[],this.tc=null,this.nc=!1,this.rc=!1,this.sc=[],this.F_=new Xf(this,"async_queue_retry"),this.oc=()=>{const r=ki();r&&de(co,"Visibility state changed to "+r.visibilityState),this.F_.y_()},this._c=e;const t=ki();t&&typeof t.addEventListener=="function"&&t.addEventListener("visibilitychange",this.oc)}get isShuttingDown(){return this.Xu}enqueueAndForget(e){this.enqueue(e)}enqueueAndForgetEvenWhileRestricted(e){this.ac(),this.uc(e)}enterRestrictedMode(e){if(!this.Xu){this.Xu=!0,this.rc=e||!1;const t=ki();t&&typeof t.removeEventListener=="function"&&t.removeEventListener("visibilitychange",this.oc)}}enqueue(e){if(this.ac(),this.Xu)return new Promise((()=>{}));const t=new Ht;return this.uc((()=>this.Xu&&this.rc?Promise.resolve():(e().then(t.resolve,t.reject),t.promise))).then((()=>t.promise))}enqueueRetryable(e){this.enqueueAndForget((()=>(this.Zu.push(e),this.cc())))}async cc(){if(this.Zu.length!==0){try{await this.Zu[0](),this.Zu.shift(),this.F_.reset()}catch(e){if(!Wf(e))throw e;de(co,"Operation failed with retryable error: "+e)}this.Zu.length>0&&this.F_.g_((()=>this.cc()))}}uc(e){const t=this._c.then((()=>(this.nc=!0,e().catch((r=>{throw this.tc=r,this.nc=!1,Na("INTERNAL UNHANDLED ERROR: ",ho(r)),r})).then((r=>(this.nc=!1,r))))));return this._c=t,t}enqueueAfterDelay(e,t,r){this.ac(),this.sc.indexOf(e)>-1&&(t=0);const s=hr.createAndSchedule(this,e,t,r,(a=>this.lc(a)));return this.ec.push(s),s}ac(){this.tc&&Kt(47125,{hc:ho(this.tc)})}verifyOperationInProgress(){}async Pc(){let e;do e=this._c,await e;while(e!==this._c)}Tc(e){for(const t of this.ec)if(t.timerId===e)return!0;return!1}Ic(e){return this.Pc().then((()=>{this.ec.sort(((t,r)=>t.targetTimeMs-r.targetTimeMs));for(const t of this.ec)if(t.skipDelay(),e!=="all"&&t.timerId===e)break;return this.Pc()}))}dc(e){this.sc.push(e)}lc(e){const t=this.ec.indexOf(e);this.ec.splice(t,1)}}function ho(n){let e=n.message||"";return n.stack&&(e=n.stack.includes(n.message)?n.stack:n.message+`
`+n.stack),e}class Qf extends Ua{constructor(e,t,r,s){super(e,t,r,s),this.type="firestore",this._queue=new lo,this._persistenceKey=(s==null?void 0:s.name)||"[DEFAULT]"}async _terminate(){if(this._firestoreClient){const e=this._firestoreClient.terminate();this._queue=new lo(e),this._firestoreClient=void 0,await e}}}function ep(n,e){const t=typeof n=="object"?n:Xt(),r=typeof n=="string"?n:ji,s=ze(t,"firestore").getImmediate({identifier:r});if(!s._initialized){const a=To("firestore");a&&Zf(s,...a)}return s}/**
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
 */class Se{constructor(e){this._byteString=e}static fromBase64String(e){try{return new Se(st.fromBase64String(e))}catch(t){throw new D(N.INVALID_ARGUMENT,"Failed to construct data from Base64 string: "+t)}}static fromUint8Array(e){return new Se(st.fromUint8Array(e))}toBase64(){return this._byteString.toBase64()}toUint8Array(){return this._byteString.toUint8Array()}toString(){return"Bytes(base64: "+this.toBase64()+")"}isEqual(e){return this._byteString.isEqual(e._byteString)}toJSON(){return{type:Se._jsonSchemaVersion,bytes:this.toBase64()}}static fromJSON(e){if(tn(e,Se._jsonSchema))return Se.fromBase64String(e.bytes)}}Se._jsonSchemaVersion="firestore/bytes/1.0",Se._jsonSchema={type:H("string",Se._jsonSchemaVersion),bytes:H("string")};/**
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
 */class xa{constructor(...e){for(let t=0;t<e.length;++t)if(e[t].length===0)throw new D(N.INVALID_ARGUMENT,"Invalid field name at argument $(i + 1). Field names must not be empty.");this._internalPath=new Xe(e)}isEqual(e){return this._internalPath.isEqual(e._internalPath)}}/**
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
 */class et{constructor(e,t){if(!isFinite(e)||e<-90||e>90)throw new D(N.INVALID_ARGUMENT,"Latitude must be a number between -90 and 90, but was: "+e);if(!isFinite(t)||t<-180||t>180)throw new D(N.INVALID_ARGUMENT,"Longitude must be a number between -180 and 180, but was: "+t);this._lat=e,this._long=t}get latitude(){return this._lat}get longitude(){return this._long}isEqual(e){return this._lat===e._lat&&this._long===e._long}_compareTo(e){return pe(this._lat,e._lat)||pe(this._long,e._long)}toJSON(){return{latitude:this._lat,longitude:this._long,type:et._jsonSchemaVersion}}static fromJSON(e){if(tn(e,et._jsonSchema))return new et(e.latitude,e.longitude)}}et._jsonSchemaVersion="firestore/geoPoint/1.0",et._jsonSchema={type:H("string",et._jsonSchemaVersion),latitude:H("number"),longitude:H("number")};/**
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
 */class tt{constructor(e){this._values=(e||[]).map((t=>t))}toArray(){return this._values.map((e=>e))}isEqual(e){return(function(r,s){if(r.length!==s.length)return!1;for(let a=0;a<r.length;++a)if(r[a]!==s[a])return!1;return!0})(this._values,e._values)}toJSON(){return{type:tt._jsonSchemaVersion,vectorValues:this._values}}static fromJSON(e){if(tn(e,tt._jsonSchema)){if(Array.isArray(e.vectorValues)&&e.vectorValues.every((t=>typeof t=="number")))return new tt(e.vectorValues);throw new D(N.INVALID_ARGUMENT,"Expected 'vectorValues' field to be a number array")}}}tt._jsonSchemaVersion="firestore/vectorValue/1.0",tt._jsonSchema={type:H("string",tt._jsonSchemaVersion),vectorValues:H("object")};const tp=new RegExp("[~\\*/\\[\\]]");function np(n,e,t){if(e.search(tp)>=0)throw uo(`Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,n);try{return new xa(...e.split("."))._internalPath}catch{throw uo(`Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,n)}}function uo(n,e,t,r,s){let a=`Function ${e}() called with invalid data`;a+=". ";let l="";return new D(N.INVALID_ARGUMENT,a+n+l)}/**
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
 */class Fa{constructor(e,t,r,s,a){this._firestore=e,this._userDataWriter=t,this._key=r,this._document=s,this._converter=a}get id(){return this._key.path.lastSegment()}get ref(){return new ye(this._firestore,this._converter,this._key)}exists(){return this._document!==null}data(){if(this._document){if(this._converter){const e=new ip(this._firestore,this._userDataWriter,this._key,this._document,null);return this._converter.fromFirestore(e)}return this._userDataWriter.convertValue(this._document.data.value)}}get(e){if(this._document){const t=this._document.data.field(ja("DocumentSnapshot.get",e));if(t!==null)return this._userDataWriter.convertValue(t)}}}class ip extends Fa{data(){return super.data()}}function ja(n,e){return typeof e=="string"?np(n,e):e instanceof xa?e._internalPath:e._delegate._internalPath}class wn{constructor(e,t){this.hasPendingWrites=e,this.fromCache=t}isEqual(e){return this.hasPendingWrites===e.hasPendingWrites&&this.fromCache===e.fromCache}}class _t extends Fa{constructor(e,t,r,s,a,l){super(e,t,r,s,l),this._firestore=e,this._firestoreImpl=e,this.metadata=a}exists(){return super.exists()}data(e={}){if(this._document){if(this._converter){const t=new Rn(this._firestore,this._userDataWriter,this._key,this._document,this.metadata,null);return this._converter.fromFirestore(t,e)}return this._userDataWriter.convertValue(this._document.data.value,e.serverTimestamps)}}get(e,t={}){if(this._document){const r=this._document.data.field(ja("DocumentSnapshot.get",e));if(r!==null)return this._userDataWriter.convertValue(r,t.serverTimestamps)}}toJSON(){if(this.metadata.hasPendingWrites)throw new D(N.FAILED_PRECONDITION,"DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e=this._document,t={};return t.type=_t._jsonSchemaVersion,t.bundle="",t.bundleSource="DocumentSnapshot",t.bundleName=this._key.toString(),!e||!e.isValidDocument()||!e.isFoundDocument()?t:(this._userDataWriter.convertObjectMap(e.data.value.mapValue.fields,"previous"),t.bundle=(this._firestore,this.ref.path,"NOT SUPPORTED"),t)}}_t._jsonSchemaVersion="firestore/documentSnapshot/1.0",_t._jsonSchema={type:H("string",_t._jsonSchemaVersion),bundleSource:H("string","DocumentSnapshot"),bundleName:H("string"),bundle:H("string")};class Rn extends _t{data(e={}){return super.data(e)}}class Wt{constructor(e,t,r,s){this._firestore=e,this._userDataWriter=t,this._snapshot=s,this.metadata=new wn(s.hasPendingWrites,s.fromCache),this.query=r}get docs(){const e=[];return this.forEach((t=>e.push(t))),e}get size(){return this._snapshot.docs.size}get empty(){return this.size===0}forEach(e,t){this._snapshot.docs.forEach((r=>{e.call(t,new Rn(this._firestore,this._userDataWriter,r.key,r,new wn(this._snapshot.mutatedKeys.has(r.key),this._snapshot.fromCache),this.query.converter))}))}docChanges(e={}){const t=!!e.includeMetadataChanges;if(t&&this._snapshot.excludesMetadataChanges)throw new D(N.INVALID_ARGUMENT,"To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().");return this._cachedChanges&&this._cachedChangesIncludeMetadataChanges===t||(this._cachedChanges=(function(s,a){if(s._snapshot.oldDocs.isEmpty()){let l=0;return s._snapshot.docChanges.map((u=>{const f=new Rn(s._firestore,s._userDataWriter,u.doc.key,u.doc,new wn(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);return u.doc,{type:"added",doc:f,oldIndex:-1,newIndex:l++}}))}{let l=s._snapshot.oldDocs;return s._snapshot.docChanges.filter((u=>a||u.type!==3)).map((u=>{const f=new Rn(s._firestore,s._userDataWriter,u.doc.key,u.doc,new wn(s._snapshot.mutatedKeys.has(u.doc.key),s._snapshot.fromCache),s.query.converter);let w=-1,b=-1;return u.type!==0&&(w=l.indexOf(u.doc.key),l=l.delete(u.doc.key)),u.type!==1&&(l=l.add(u.doc),b=l.indexOf(u.doc.key)),{type:rp(u.type),doc:f,oldIndex:w,newIndex:b}}))}})(this,t),this._cachedChangesIncludeMetadataChanges=t),this._cachedChanges}toJSON(){if(this.metadata.hasPendingWrites)throw new D(N.FAILED_PRECONDITION,"QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().");const e={};e.type=Wt._jsonSchemaVersion,e.bundleSource="QuerySnapshot",e.bundleName=Uf.newId(),this._firestore._databaseId.database,this._firestore._databaseId.projectId;const t=[],r=[],s=[];return this.docs.forEach((a=>{a._document!==null&&(t.push(a._document),r.push(this._userDataWriter.convertObjectMap(a._document.data.value.mapValue.fields,"previous")),s.push(a.ref.path))})),e.bundle=(this._firestore,this.query._query,e.bundleName,"NOT SUPPORTED"),e}}function rp(n){switch(n){case 0:return"added";case 2:case 3:return"modified";case 1:return"removed";default:return Kt(61501,{type:n})}}Wt._jsonSchemaVersion="firestore/querySnapshot/1.0",Wt._jsonSchema={type:H("string",Wt._jsonSchemaVersion),bundleSource:H("string","QuerySnapshot"),bundleName:H("string"),bundle:H("string")};(function(e,t=!0){(function(s){en=s})(at),ge(new oe("firestore",((r,{instanceIdentifier:s,options:a})=>{const l=r.getProvider("app").getImmediate(),u=new Qf(new Pf(r.getProvider("auth-internal")),new Df(l,r.getProvider("app-check-internal")),(function(w,b){if(!Object.prototype.hasOwnProperty.apply(w.options,["projectId"]))throw new D(N.INVALID_ARGUMENT,'"projectId" not provided in firebase.initializeApp.');return new xn(w.options.projectId,b)})(l,s),l);return a=Object.assign({useFetchStreams:t},a),u._setSettings(a),u}),"PUBLIC").setMultipleInstances(!0)),te(Js,Xs,e),te(Js,Xs,"esm2017")})();/**
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
 */const Va="firebasestorage.googleapis.com",sp="storageBucket",op=120*1e3,ap=600*1e3;/**
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
 */class Te extends ae{constructor(e,t,r=0){super(Ci(e),`Firebase Storage: ${t} (${Ci(e)})`),this.status_=r,this.customData={serverResponse:null},this._baseMessage=this.message,Object.setPrototypeOf(this,Te.prototype)}get status(){return this.status_}set status(e){this.status_=e}_codeEquals(e){return Ci(e)===this.code}get serverResponse(){return this.customData.serverResponse}set serverResponse(e){this.customData.serverResponse=e,this.customData.serverResponse?this.message=`${this._baseMessage}
${this.customData.serverResponse}`:this.message=this._baseMessage}}var we;(function(n){n.UNKNOWN="unknown",n.OBJECT_NOT_FOUND="object-not-found",n.BUCKET_NOT_FOUND="bucket-not-found",n.PROJECT_NOT_FOUND="project-not-found",n.QUOTA_EXCEEDED="quota-exceeded",n.UNAUTHENTICATED="unauthenticated",n.UNAUTHORIZED="unauthorized",n.UNAUTHORIZED_APP="unauthorized-app",n.RETRY_LIMIT_EXCEEDED="retry-limit-exceeded",n.INVALID_CHECKSUM="invalid-checksum",n.CANCELED="canceled",n.INVALID_EVENT_NAME="invalid-event-name",n.INVALID_URL="invalid-url",n.INVALID_DEFAULT_BUCKET="invalid-default-bucket",n.NO_DEFAULT_BUCKET="no-default-bucket",n.CANNOT_SLICE_BLOB="cannot-slice-blob",n.SERVER_FILE_WRONG_SIZE="server-file-wrong-size",n.NO_DOWNLOAD_URL="no-download-url",n.INVALID_ARGUMENT="invalid-argument",n.INVALID_ARGUMENT_COUNT="invalid-argument-count",n.APP_DELETED="app-deleted",n.INVALID_ROOT_OPERATION="invalid-root-operation",n.INVALID_FORMAT="invalid-format",n.INTERNAL_ERROR="internal-error",n.UNSUPPORTED_ENVIRONMENT="unsupported-environment"})(we||(we={}));function Ci(n){return"storage/"+n}function cp(){const n="An unknown error occurred, please check the error payload for server response.";return new Te(we.UNKNOWN,n)}function lp(){return new Te(we.RETRY_LIMIT_EXCEEDED,"Max retry time for operation exceeded, please try again.")}function hp(){return new Te(we.CANCELED,"User canceled the upload/download.")}function up(n){return new Te(we.INVALID_URL,"Invalid URL '"+n+"'.")}function dp(n){return new Te(we.INVALID_DEFAULT_BUCKET,"Invalid default bucket '"+n+"'.")}function fo(n){return new Te(we.INVALID_ARGUMENT,n)}function Ba(){return new Te(we.APP_DELETED,"The Firebase app was deleted.")}function fp(n){return new Te(we.INVALID_ROOT_OPERATION,"The operation '"+n+"' cannot be performed on a root reference, create a non-root reference using child, such as .child('file.png').")}/**
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
 */class fe{constructor(e,t){this.bucket=e,this.path_=t}get path(){return this.path_}get isRoot(){return this.path.length===0}fullServerUrl(){const e=encodeURIComponent;return"/b/"+e(this.bucket)+"/o/"+e(this.path)}bucketOnlyServerUrl(){return"/b/"+encodeURIComponent(this.bucket)+"/o"}static makeFromBucketSpec(e,t){let r;try{r=fe.makeFromUrl(e,t)}catch{return new fe(e,"")}if(r.path==="")return r;throw dp(e)}static makeFromUrl(e,t){let r=null;const s="([A-Za-z0-9.\\-_]+)";function a(j){j.path.charAt(j.path.length-1)==="/"&&(j.path_=j.path_.slice(0,-1))}const l="(/(.*))?$",u=new RegExp("^gs://"+s+l,"i"),f={bucket:1,path:3};function w(j){j.path_=decodeURIComponent(j.path)}const b="v[A-Za-z0-9_]+",S=t.replace(/[.]/g,"\\."),E="(/([^?#]*).*)?$",P=new RegExp(`^https?://${S}/${b}/b/${s}/o${E}`,"i"),k={bucket:1,path:3},U=t===Va?"(?:storage.googleapis.com|storage.cloud.google.com)":t,C="([^?#]*)",z=new RegExp(`^https?://${U}/${s}/${C}`,"i"),x=[{regex:u,indices:f,postModify:a},{regex:P,indices:k,postModify:w},{regex:z,indices:{bucket:1,path:2},postModify:w}];for(let j=0;j<x.length;j++){const re=x[j],W=re.regex.exec(e);if(W){const y=W[re.indices.bucket];let d=W[re.indices.path];d||(d=""),r=new fe(y,d),re.postModify(r);break}}if(r==null)throw up(e);return r}}class pp{constructor(e){this.promise_=Promise.reject(e)}getPromise(){return this.promise_}cancel(e=!1){}}/**
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
 */function gp(n,e,t){let r=1,s=null,a=null,l=!1,u=0;function f(){return u===2}let w=!1;function b(...C){w||(w=!0,e.apply(null,C))}function S(C){s=setTimeout(()=>{s=null,n(P,f())},C)}function E(){a&&clearTimeout(a)}function P(C,...z){if(w){E();return}if(C){E(),b.call(null,C,...z);return}if(f()||l){E(),b.call(null,C,...z);return}r<64&&(r*=2);let x;u===1?(u=2,x=0):x=(r+Math.random())*1e3,S(x)}let k=!1;function U(C){k||(k=!0,E(),!w&&(s!==null?(C||(u=2),clearTimeout(s),S(0)):C||(u=1)))}return S(0),a=setTimeout(()=>{l=!0,U(!0)},t),U}function mp(n){n(!1)}/**
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
 */function _p(n){return n!==void 0}function po(n,e,t,r){if(r<e)throw fo(`Invalid value for '${n}'. Expected ${e} or greater.`);if(r>t)throw fo(`Invalid value for '${n}'. Expected ${t} or less.`)}function yp(n){const e=encodeURIComponent;let t="?";for(const r in n)if(n.hasOwnProperty(r)){const s=e(r)+"="+e(n[r]);t=t+s+"&"}return t=t.slice(0,-1),t}var Fn;(function(n){n[n.NO_ERROR=0]="NO_ERROR",n[n.NETWORK_ERROR=1]="NETWORK_ERROR",n[n.ABORT=2]="ABORT"})(Fn||(Fn={}));/**
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
 */function vp(n,e){const t=n>=500&&n<600,s=[408,429].indexOf(n)!==-1,a=e.indexOf(n)!==-1;return t||s||a}/**
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
 */class Ip{constructor(e,t,r,s,a,l,u,f,w,b,S,E=!0,P=!1){this.url_=e,this.method_=t,this.headers_=r,this.body_=s,this.successCodes_=a,this.additionalRetryCodes_=l,this.callback_=u,this.errorCallback_=f,this.timeout_=w,this.progressCallback_=b,this.connectionFactory_=S,this.retry=E,this.isUsingEmulator=P,this.pendingConnection_=null,this.backoffId_=null,this.canceled_=!1,this.appDelete_=!1,this.promise_=new Promise((k,U)=>{this.resolve_=k,this.reject_=U,this.start_()})}start_(){const e=(r,s)=>{if(s){r(!1,new Tn(!1,null,!0));return}const a=this.connectionFactory_();this.pendingConnection_=a;const l=u=>{const f=u.loaded,w=u.lengthComputable?u.total:-1;this.progressCallback_!==null&&this.progressCallback_(f,w)};this.progressCallback_!==null&&a.addUploadProgressListener(l),a.send(this.url_,this.method_,this.isUsingEmulator,this.body_,this.headers_).then(()=>{this.progressCallback_!==null&&a.removeUploadProgressListener(l),this.pendingConnection_=null;const u=a.getErrorCode()===Fn.NO_ERROR,f=a.getStatus();if(!u||vp(f,this.additionalRetryCodes_)&&this.retry){const b=a.getErrorCode()===Fn.ABORT;r(!1,new Tn(!1,null,b));return}const w=this.successCodes_.indexOf(f)!==-1;r(!0,new Tn(w,a))})},t=(r,s)=>{const a=this.resolve_,l=this.reject_,u=s.connection;if(s.wasSuccessCode)try{const f=this.callback_(u,u.getResponse());_p(f)?a(f):a()}catch(f){l(f)}else if(u!==null){const f=cp();f.serverResponse=u.getErrorText(),this.errorCallback_?l(this.errorCallback_(u,f)):l(f)}else if(s.canceled){const f=this.appDelete_?Ba():hp();l(f)}else{const f=lp();l(f)}};this.canceled_?t(!1,new Tn(!1,null,!0)):this.backoffId_=gp(e,t,this.timeout_)}getPromise(){return this.promise_}cancel(e){this.canceled_=!0,this.appDelete_=e||!1,this.backoffId_!==null&&mp(this.backoffId_),this.pendingConnection_!==null&&this.pendingConnection_.abort()}}class Tn{constructor(e,t,r){this.wasSuccessCode=e,this.connection=t,this.canceled=!!r}}function wp(n,e){e!==null&&e.length>0&&(n.Authorization="Firebase "+e)}function Tp(n,e){n["X-Firebase-Storage-Version"]="webjs/"+(e??"AppManager")}function Ep(n,e){e&&(n["X-Firebase-GMPID"]=e)}function Ap(n,e){e!==null&&(n["X-Firebase-AppCheck"]=e)}function bp(n,e,t,r,s,a,l=!0,u=!1){const f=yp(n.urlParams),w=n.url+f,b=Object.assign({},n.headers);return Ep(b,e),wp(b,t),Tp(b,a),Ap(b,r),new Ip(w,n.method,b,n.body,n.successCodes,n.additionalRetryCodes,n.handler,n.errorHandler,n.timeout,n.progressCallback,s,l,u)}/**
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
 */function Sp(n){if(n.length===0)return null;const e=n.lastIndexOf("/");return e===-1?"":n.slice(0,e)}function Rp(n){const e=n.lastIndexOf("/",n.length-2);return e===-1?n:n.slice(e+1)}/**
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
 */class jn{constructor(e,t){this._service=e,t instanceof fe?this._location=t:this._location=fe.makeFromUrl(t,e.host)}toString(){return"gs://"+this._location.bucket+"/"+this._location.path}_newRef(e,t){return new jn(e,t)}get root(){const e=new fe(this._location.bucket,"");return this._newRef(this._service,e)}get bucket(){return this._location.bucket}get fullPath(){return this._location.path}get name(){return Rp(this._location.path)}get storage(){return this._service}get parent(){const e=Sp(this._location.path);if(e===null)return null;const t=new fe(this._location.bucket,e);return new jn(this._service,t)}_throwIfRoot(e){if(this._location.path==="")throw fp(e)}}function go(n,e){const t=e==null?void 0:e[sp];return t==null?null:fe.makeFromBucketSpec(t,n)}function kp(n,e,t,r={}){n.host=`${e}:${t}`;const s=It(e);s&&(Bi(`https://${n.host}/b`),$i("Storage",!0)),n._isUsingEmulator=!0,n._protocol=s?"https":"http";const{mockUserToken:a}=r;a&&(n._overrideAuthToken=typeof a=="string"?a:bo(a,n.app.options.projectId))}class Cp{constructor(e,t,r,s,a,l=!1){this.app=e,this._authProvider=t,this._appCheckProvider=r,this._url=s,this._firebaseVersion=a,this._isUsingEmulator=l,this._bucket=null,this._host=Va,this._protocol="https",this._appId=null,this._deleted=!1,this._maxOperationRetryTime=op,this._maxUploadRetryTime=ap,this._requests=new Set,s!=null?this._bucket=fe.makeFromBucketSpec(s,this._host):this._bucket=go(this._host,this.app.options)}get host(){return this._host}set host(e){this._host=e,this._url!=null?this._bucket=fe.makeFromBucketSpec(this._url,e):this._bucket=go(e,this.app.options)}get maxUploadRetryTime(){return this._maxUploadRetryTime}set maxUploadRetryTime(e){po("time",0,Number.POSITIVE_INFINITY,e),this._maxUploadRetryTime=e}get maxOperationRetryTime(){return this._maxOperationRetryTime}set maxOperationRetryTime(e){po("time",0,Number.POSITIVE_INFINITY,e),this._maxOperationRetryTime=e}async _getAuthToken(){if(this._overrideAuthToken)return this._overrideAuthToken;const e=this._authProvider.getImmediate({optional:!0});if(e){const t=await e.getToken();if(t!==null)return t.accessToken}return null}async _getAppCheckToken(){if(he(this.app)&&this.app.settings.appCheckToken)return this.app.settings.appCheckToken;const e=this._appCheckProvider.getImmediate({optional:!0});return e?(await e.getToken()).token:null}_delete(){return this._deleted||(this._deleted=!0,this._requests.forEach(e=>e.cancel()),this._requests.clear()),Promise.resolve()}_makeStorageReference(e){return new jn(this,e)}_makeRequest(e,t,r,s,a=!0){if(this._deleted)return new pp(Ba());{const l=bp(e,this._appId,r,s,t,this._firebaseVersion,a,this._isUsingEmulator);return this._requests.add(l),l.getPromise().then(()=>this._requests.delete(l),()=>this._requests.delete(l)),l}}async makeRequestWithTokens(e,t){const[r,s]=await Promise.all([this._getAuthToken(),this._getAppCheckToken()]);return this._makeRequest(e,t,r,s).getPromise()}}const mo="@firebase/storage",_o="0.13.14";/**
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
 */const $a="storage";function Pp(n=Xt(),e){n=Ne(n);const r=ze(n,$a).getImmediate({identifier:e}),s=To("storage");return s&&Op(r,...s),r}function Op(n,e,t,r={}){kp(n,e,t,r)}function Np(n,{instanceIdentifier:e}){const t=n.getProvider("app").getImmediate(),r=n.getProvider("auth-internal"),s=n.getProvider("app-check-internal");return new Cp(t,r,s,e,at)}function Dp(){ge(new oe($a,Np,"PUBLIC").setMultipleInstances(!0)),te(mo,_o,""),te(mo,_o,"esm2017")}Dp();const Lp={apiKey:"AIzaSyAI1aPdvgqqYLiW3XHtnqNANVeo1S9piKg",authDomain:"kajok-65089.firebaseapp.com",projectId:"kajok-65089",storageBucket:"kajok-65089.firebasestorage.app",messagingSenderId:"902554080627",appId:"1:902554080627:web:90d9dbc67b54ce07ec6106",measurementId:"G-EKDXMLJ357"},zn=Jl().length?Xt():Po(Lp);nd(zn);ep(zn);Pp(zn);Af().then(n=>n?Tf(zn):null).catch(()=>null);
