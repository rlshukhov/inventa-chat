var ge=Object.defineProperty;var w=(e,i)=>{
for(var n in i){
ge(e,n,{get:i[n],enumerable:!0});
}
};var G={};w(G,{Application:()=>$,Browser:()=>I,Call:()=>ee,Clipboard:()=>ie,Create:()=>ne,Dialogs:()=>B,Events:()=>N,Flags:()=>Q,Screens:()=>oe,System:()=>X,WML:()=>j,Window:()=>E});var j={};w(j,{Enable:()=>Z,Reload:()=>me});var I={};w(I,{OpenURL:()=>P});var fe="useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";var D=(e=21)=>{
let i="",n=e;for(;n--;){
i+=fe[Math.random()*64|0];
}return i;
};var De=window.location.origin+"/wails/runtime",l={Call:0,Clipboard:1,Application:2,Events:3,ContextMenu:4,Dialog:5,Window:6,Screens:7,System:8,Browser:9,CancelCall:10},Me=D();function d(e,i){
return function(n,t=null){
return Ce(e,n,i,t);
};
}function Ce(e,i,n,t){
let r=new URL(De);r.searchParams.append("object",e),r.searchParams.append("method",i);let s={headers:{}};return n&&(s.headers["x-wails-window-name"]=n),t&&r.searchParams.append("args",JSON.stringify(t)),s.headers["x-wails-client-id"]=Me,new Promise((c,m)=>{
fetch(r,s).then(a=>{
if(a.ok){
return a.headers.get("Content-Type")&&a.headers.get("Content-Type").indexOf("application/json")!==-1?a.json():a.text();
}m(Error(a.statusText));
}).then(a=>c(a)).catch(a=>m(a));
});
}var Se=d(l.Browser,""),xe=0;function P(e){
return Se(xe,{url:e});
}var B={};w(B,{Error:()=>Be,Info:()=>Ie,OpenFile:()=>ze,Question:()=>T,SaveFile:()=>ke,Warning:()=>Te});window._wails=window._wails||{};window._wails.dialogErrorCallback=Pe;window._wails.dialogResultCallback=Oe;var Ae=0,ve=1,be=2,Re=3,Ee=4,ye=5,Ue=d(l.Dialog,""),h=new Map;function Fe(){
let e;do {
e=D();
}while(h.has(e));return e;
}function M(e,i={}){
let n=Fe();return i["dialog-id"]=n,new Promise((t,r)=>{
h.set(n,{resolve:t,reject:r}),Ue(e,i).catch(s=>{
r(s),h.delete(n);
});
});
}function Oe(e,i,n){
let t=h.get(e);t&&(n?t.resolve(JSON.parse(i)):t.resolve(i),h.delete(e));
}function Pe(e,i){
let n=h.get(e);n&&(n.reject(i),h.delete(e));
}var Ie=e=>M(Ae,e),Te=e=>M(ve,e),Be=e=>M(be,e),T=e=>M(Re,e),ze=e=>M(Ee,e),ke=e=>M(ye,e);var N={};w(N,{Emit:()=>L,Off:()=>Ye,OffAll:()=>Ke,On:()=>Ze,OnMultiple:()=>k,Once:()=>je,Types:()=>Le,WailsEvent:()=>A,setup:()=>Ve});var ae={Windows:{SystemThemeChanged:"windows:SystemThemeChanged",APMPowerStatusChange:"windows:APMPowerStatusChange",APMSuspend:"windows:APMSuspend",APMResumeAutomatic:"windows:APMResumeAutomatic",APMResumeSuspend:"windows:APMResumeSuspend",APMPowerSettingChange:"windows:APMPowerSettingChange",ApplicationStarted:"windows:ApplicationStarted",WebViewNavigationCompleted:"windows:WebViewNavigationCompleted",WindowInactive:"windows:WindowInactive",WindowActive:"windows:WindowActive",WindowClickActive:"windows:WindowClickActive",WindowMaximise:"windows:WindowMaximise",WindowUnMaximise:"windows:WindowUnMaximise",WindowFullscreen:"windows:WindowFullscreen",WindowUnFullscreen:"windows:WindowUnFullscreen",WindowRestore:"windows:WindowRestore",WindowMinimise:"windows:WindowMinimise",WindowUnMinimise:"windows:WindowUnMinimise",WindowClose:"windows:WindowClose",WindowSetFocus:"windows:WindowSetFocus",WindowKillFocus:"windows:WindowKillFocus",WindowDragDrop:"windows:WindowDragDrop",WindowDragEnter:"windows:WindowDragEnter",WindowDragLeave:"windows:WindowDragLeave",WindowDragOver:"windows:WindowDragOver",WindowDidMove:"windows:WindowDidMove",WindowDidResize:"windows:WindowDidResize"},Mac:{ApplicationDidBecomeActive:"mac:ApplicationDidBecomeActive",ApplicationDidChangeBackingProperties:"mac:ApplicationDidChangeBackingProperties",ApplicationDidChangeEffectiveAppearance:"mac:ApplicationDidChangeEffectiveAppearance",ApplicationDidChangeIcon:"mac:ApplicationDidChangeIcon",ApplicationDidChangeOcclusionState:"mac:ApplicationDidChangeOcclusionState",ApplicationDidChangeScreenParameters:"mac:ApplicationDidChangeScreenParameters",ApplicationDidChangeStatusBarFrame:"mac:ApplicationDidChangeStatusBarFrame",ApplicationDidChangeStatusBarOrientation:"mac:ApplicationDidChangeStatusBarOrientation",ApplicationDidFinishLaunching:"mac:ApplicationDidFinishLaunching",ApplicationDidHide:"mac:ApplicationDidHide",ApplicationDidResignActiveNotification:"mac:ApplicationDidResignActiveNotification",ApplicationDidUnhide:"mac:ApplicationDidUnhide",ApplicationDidUpdate:"mac:ApplicationDidUpdate",ApplicationWillBecomeActive:"mac:ApplicationWillBecomeActive",ApplicationWillFinishLaunching:"mac:ApplicationWillFinishLaunching",ApplicationWillHide:"mac:ApplicationWillHide",ApplicationWillResignActive:"mac:ApplicationWillResignActive",ApplicationWillTerminate:"mac:ApplicationWillTerminate",ApplicationWillUnhide:"mac:ApplicationWillUnhide",ApplicationWillUpdate:"mac:ApplicationWillUpdate",ApplicationDidChangeTheme:"mac:ApplicationDidChangeTheme!",ApplicationShouldHandleReopen:"mac:ApplicationShouldHandleReopen!",WindowDidBecomeKey:"mac:WindowDidBecomeKey",WindowDidBecomeMain:"mac:WindowDidBecomeMain",WindowDidBeginSheet:"mac:WindowDidBeginSheet",WindowDidChangeAlpha:"mac:WindowDidChangeAlpha",WindowDidChangeBackingLocation:"mac:WindowDidChangeBackingLocation",WindowDidChangeBackingProperties:"mac:WindowDidChangeBackingProperties",WindowDidChangeCollectionBehavior:"mac:WindowDidChangeCollectionBehavior",WindowDidChangeEffectiveAppearance:"mac:WindowDidChangeEffectiveAppearance",WindowDidChangeOcclusionState:"mac:WindowDidChangeOcclusionState",WindowDidChangeOrderingMode:"mac:WindowDidChangeOrderingMode",WindowDidChangeScreen:"mac:WindowDidChangeScreen",WindowDidChangeScreenParameters:"mac:WindowDidChangeScreenParameters",WindowDidChangeScreenProfile:"mac:WindowDidChangeScreenProfile",WindowDidChangeScreenSpace:"mac:WindowDidChangeScreenSpace",WindowDidChangeScreenSpaceProperties:"mac:WindowDidChangeScreenSpaceProperties",WindowDidChangeSharingType:"mac:WindowDidChangeSharingType",WindowDidChangeSpace:"mac:WindowDidChangeSpace",WindowDidChangeSpaceOrderingMode:"mac:WindowDidChangeSpaceOrderingMode",WindowDidChangeTitle:"mac:WindowDidChangeTitle",WindowDidChangeToolbar:"mac:WindowDidChangeToolbar",WindowDidChangeVisibility:"mac:WindowDidChangeVisibility",WindowDidDeminiaturize:"mac:WindowDidDeminiaturize",WindowDidEndSheet:"mac:WindowDidEndSheet",WindowDidEnterFullScreen:"mac:WindowDidEnterFullScreen",WindowDidEnterVersionBrowser:"mac:WindowDidEnterVersionBrowser",WindowDidExitFullScreen:"mac:WindowDidExitFullScreen",WindowDidExitVersionBrowser:"mac:WindowDidExitVersionBrowser",WindowDidExpose:"mac:WindowDidExpose",WindowDidFocus:"mac:WindowDidFocus",WindowDidMiniaturize:"mac:WindowDidMiniaturize",WindowDidMove:"mac:WindowDidMove",WindowDidOrderOffScreen:"mac:WindowDidOrderOffScreen",WindowDidOrderOnScreen:"mac:WindowDidOrderOnScreen",WindowDidResignKey:"mac:WindowDidResignKey",WindowDidResignMain:"mac:WindowDidResignMain",WindowDidResize:"mac:WindowDidResize",WindowDidUpdate:"mac:WindowDidUpdate",WindowDidUpdateAlpha:"mac:WindowDidUpdateAlpha",WindowDidUpdateCollectionBehavior:"mac:WindowDidUpdateCollectionBehavior",WindowDidUpdateCollectionProperties:"mac:WindowDidUpdateCollectionProperties",WindowDidUpdateShadow:"mac:WindowDidUpdateShadow",WindowDidUpdateTitle:"mac:WindowDidUpdateTitle",WindowDidUpdateToolbar:"mac:WindowDidUpdateToolbar",WindowDidUpdateVisibility:"mac:WindowDidUpdateVisibility",WindowShouldClose:"mac:WindowShouldClose!",WindowWillBecomeKey:"mac:WindowWillBecomeKey",WindowWillBecomeMain:"mac:WindowWillBecomeMain",WindowWillBeginSheet:"mac:WindowWillBeginSheet",WindowWillChangeOrderingMode:"mac:WindowWillChangeOrderingMode",WindowWillClose:"mac:WindowWillClose",WindowWillDeminiaturize:"mac:WindowWillDeminiaturize",WindowWillEnterFullScreen:"mac:WindowWillEnterFullScreen",WindowWillEnterVersionBrowser:"mac:WindowWillEnterVersionBrowser",WindowWillExitFullScreen:"mac:WindowWillExitFullScreen",WindowWillExitVersionBrowser:"mac:WindowWillExitVersionBrowser",WindowWillFocus:"mac:WindowWillFocus",WindowWillMiniaturize:"mac:WindowWillMiniaturize",WindowWillMove:"mac:WindowWillMove",WindowWillOrderOffScreen:"mac:WindowWillOrderOffScreen",WindowWillOrderOnScreen:"mac:WindowWillOrderOnScreen",WindowWillResignMain:"mac:WindowWillResignMain",WindowWillResize:"mac:WindowWillResize",WindowWillUnfocus:"mac:WindowWillUnfocus",WindowWillUpdate:"mac:WindowWillUpdate",WindowWillUpdateAlpha:"mac:WindowWillUpdateAlpha",WindowWillUpdateCollectionBehavior:"mac:WindowWillUpdateCollectionBehavior",WindowWillUpdateCollectionProperties:"mac:WindowWillUpdateCollectionProperties",WindowWillUpdateShadow:"mac:WindowWillUpdateShadow",WindowWillUpdateTitle:"mac:WindowWillUpdateTitle",WindowWillUpdateToolbar:"mac:WindowWillUpdateToolbar",WindowWillUpdateVisibility:"mac:WindowWillUpdateVisibility",WindowWillUseStandardFrame:"mac:WindowWillUseStandardFrame",MenuWillOpen:"mac:MenuWillOpen",MenuDidOpen:"mac:MenuDidOpen",MenuDidClose:"mac:MenuDidClose",MenuWillSendAction:"mac:MenuWillSendAction",MenuDidSendAction:"mac:MenuDidSendAction",MenuWillHighlightItem:"mac:MenuWillHighlightItem",MenuDidHighlightItem:"mac:MenuDidHighlightItem",MenuWillDisplayItem:"mac:MenuWillDisplayItem",MenuDidDisplayItem:"mac:MenuDidDisplayItem",MenuWillAddItem:"mac:MenuWillAddItem",MenuDidAddItem:"mac:MenuDidAddItem",MenuWillRemoveItem:"mac:MenuWillRemoveItem",MenuDidRemoveItem:"mac:MenuDidRemoveItem",MenuWillBeginTracking:"mac:MenuWillBeginTracking",MenuDidBeginTracking:"mac:MenuDidBeginTracking",MenuWillEndTracking:"mac:MenuWillEndTracking",MenuDidEndTracking:"mac:MenuDidEndTracking",MenuWillUpdate:"mac:MenuWillUpdate",MenuDidUpdate:"mac:MenuDidUpdate",MenuWillPopUp:"mac:MenuWillPopUp",MenuDidPopUp:"mac:MenuDidPopUp",MenuWillSendActionToItem:"mac:MenuWillSendActionToItem",MenuDidSendActionToItem:"mac:MenuDidSendActionToItem",WebViewDidStartProvisionalNavigation:"mac:WebViewDidStartProvisionalNavigation",WebViewDidReceiveServerRedirectForProvisionalNavigation:"mac:WebViewDidReceiveServerRedirectForProvisionalNavigation",WebViewDidFinishNavigation:"mac:WebViewDidFinishNavigation",WebViewDidCommitNavigation:"mac:WebViewDidCommitNavigation",WindowFileDraggingEntered:"mac:WindowFileDraggingEntered",WindowFileDraggingPerformed:"mac:WindowFileDraggingPerformed",WindowFileDraggingExited:"mac:WindowFileDraggingExited"},Linux:{SystemThemeChanged:"linux:SystemThemeChanged",WindowLoadChanged:"linux:WindowLoadChanged",WindowDeleteEvent:"linux:WindowDeleteEvent",WindowDidMove:"linux:WindowDidMove",WindowDidResize:"linux:WindowDidResize",WindowFocusIn:"linux:WindowFocusIn",WindowFocusOut:"linux:WindowFocusOut",ApplicationStartup:"linux:ApplicationStartup"},Common:{ApplicationStarted:"common:ApplicationStarted",WindowMaximise:"common:WindowMaximise",WindowUnMaximise:"common:WindowUnMaximise",WindowFullscreen:"common:WindowFullscreen",WindowUnFullscreen:"common:WindowUnFullscreen",WindowRestore:"common:WindowRestore",WindowMinimise:"common:WindowMinimise",WindowUnMinimise:"common:WindowUnMinimise",WindowClosing:"common:WindowClosing",WindowZoom:"common:WindowZoom",WindowZoomIn:"common:WindowZoomIn",WindowZoomOut:"common:WindowZoomOut",WindowZoomReset:"common:WindowZoomReset",WindowFocus:"common:WindowFocus",WindowLostFocus:"common:WindowLostFocus",WindowShow:"common:WindowShow",WindowHide:"common:WindowHide",WindowDPIChanged:"common:WindowDPIChanged",WindowFilesDropped:"common:WindowFilesDropped",WindowRuntimeReady:"common:WindowRuntimeReady",ThemeChanged:"common:ThemeChanged",WindowDidMove:"common:WindowDidMove",WindowDidResize:"common:WindowDidResize"}};var Le=ae;window._wails=window._wails||{};window._wails.dispatchWailsEvent=_e;var Ne=d(l.Events,""),He=0,u=new Map,z=class{
constructor(i,n,t){
this.eventName=i,this.maxCallbacks=t||-1,this.Callback=r=>(n(r),this.maxCallbacks===-1?!1:(this.maxCallbacks-=1,this.maxCallbacks===0));
}
},A=class{
constructor(i,n=null){
this.name=i,this.data=n;
}
};function Ve(){}function _e(e){
let i=u.get(e.name);if(i){
let n=i.filter(t=>{
if(t.Callback(e)){
return!0;
}
});n.length>0&&(i=i.filter(t=>!n.includes(t)),i.length===0?u.delete(e.name):u.set(e.name,i));
}
}function k(e,i,n){
let t=u.get(e)||[],r=new z(e,i,n);return t.push(r),u.set(e,t),()=>Ge(r);
}function Ze(e,i){
return k(e,i,-1);
}function je(e,i){
return k(e,i,1);
}function Ge(e){
let i=e.eventName,n=u.get(i).filter(t=>t!==e);n.length===0?u.delete(i):u.set(i,n);
}function Ye(e,...i){
[e,...i].forEach(t=>u.delete(t));
}function Ke(){
u.clear();
}function L(e){
return Ne(He,e);
}function le(){
if(!EventTarget||!AbortSignal||!AbortController){
return!1;
}let e=!0,i=new EventTarget,n=new AbortController;return i.addEventListener("test",()=>{
e=!1;
},{signal:n.signal}),n.abort(),i.dispatchEvent(new CustomEvent("test")),e;
}var de=!1;document.addEventListener("DOMContentLoaded",()=>de=!0);function se(e){
de||document.readyState==="complete"?e():document.addEventListener("DOMContentLoaded",e);
}var Xe=0,Qe=1,Je=2,qe=3,$e=4,ei=5,ii=6,ni=7,ti=8,oi=9,ri=10,ai=11,li=12,di=13,si=14,ci=15,wi=16,mi=17,ui=18,pi=19,Wi=20,hi=21,gi=22,fi=23,Di=24,Mi=25,Ci=26,Si=27,xi=28,Ai=29,vi=30,bi=31,Ri=32,Ei=33,yi=34,Ui=35,Fi=36,Oi=37,Pi=38,Ii=39,Ti=40,Bi=41,zi=42,ki=43,Li=44,Ni=45,Hi=46,Vi=47,o=Symbol(),H=class e{
constructor(i=""){
this[o]=d(l.Window,i);for(let n of Object.getOwnPropertyNames(e.prototype)){
n!=="constructor"&&typeof this[n]=="function"&&(this[n]=this[n].bind(this));
}
}Get(i){
return new e(i);
}Position(){
return this[o](Xe);
}Center(){
return this[o](Qe);
}Close(){
return this[o](Je);
}DisableSizeConstraints(){
return this[o](qe);
}EnableSizeConstraints(){
return this[o]($e);
}Focus(){
return this[o](ei);
}ForceReload(){
return this[o](ii);
}Fullscreen(){
return this[o](ni);
}GetScreen(){
return this[o](ti);
}GetZoom(){
return this[o](oi);
}Height(){
return this[o](ri);
}Hide(){
return this[o](ai);
}IsFocused(){
return this[o](li);
}IsFullscreen(){
return this[o](di);
}IsMaximised(){
return this[o](si);
}IsMinimised(){
return this[o](ci);
}Maximise(){
return this[o](wi);
}Minimise(){
return this[o](mi);
}Name(){
return this[o](ui);
}OpenDevTools(){
return this[o](pi);
}RelativePosition(){
return this[o](Wi);
}Reload(){
return this[o](hi);
}Resizable(){
return this[o](gi);
}Restore(){
return this[o](fi);
}SetPosition(i,n){
return this[o](Di,{x:i,y:n});
}SetAlwaysOnTop(i){
return this[o](Mi,{alwaysOnTop:i});
}SetBackgroundColour(i,n,t,r){
return this[o](Ci,{r:i,g:n,b:t,a:r});
}SetFrameless(i){
return this[o](Si,{frameless:i});
}SetFullscreenButtonEnabled(i){
return this[o](xi,{enabled:i});
}SetMaxSize(i,n){
return this[o](Ai,{width:i,height:n});
}SetMinSize(i,n){
return this[o](vi,{width:i,height:n});
}SetRelativePosition(i,n){
return this[o](bi,{x:i,y:n});
}SetResizable(i){
return this[o](Ri,{resizable:i});
}SetSize(i,n){
return this[o](Ei,{width:i,height:n});
}SetTitle(i){
return this[o](yi,{title:i});
}SetZoom(i){
return this[o](Ui,{zoom:i});
}Show(){
return this[o](Fi);
}Size(){
return this[o](Oi);
}ToggleFullscreen(){
return this[o](Pi);
}ToggleMaximise(){
return this[o](Ii);
}UnFullscreen(){
return this[o](Ti);
}UnMaximise(){
return this[o](Bi);
}UnMinimise(){
return this[o](zi);
}Width(){
return this[o](ki);
}Zoom(){
return this[o](Li);
}ZoomIn(){
return this[o](Ni);
}ZoomOut(){
return this[o](Hi);
}ZoomReset(){
return this[o](Vi);
}
},_i=new H(""),E=_i;function Zi(e,i=null){
L(new A(e,i));
}function ji(e,i){
let n=E.Get(e),t=n[i];if(typeof t=="function"){
try{
t.call(n);
}catch{}
}
}function ce(e){
let i=e.currentTarget;function n(r="Yes"){
if(r!=="Yes"){
return;
}let s=i.getAttribute("wml-event"),c=i.getAttribute("wml-target-window")||"",m=i.getAttribute("wml-window"),a=i.getAttribute("wml-openurl");s!==null&&Zi(s),m!==null&&ji(c,m),a!==null&&P(a);
}let t=i.getAttribute("wml-confirm");t?T({Title:"Confirm",Message:t,Detached:!1,Buttons:[{Label:"Yes"},{Label:"No",IsDefault:!0}]}).then(n):n();
}var y=Symbol(),V=class{
constructor(){
this[y]=new AbortController;
}set(i,n){
return{signal:this[y].signal};
}reset(){
this[y].abort(),this[y]=new AbortController;
}
},v=Symbol(),C=Symbol(),_=class{
constructor(){
this[v]=new WeakMap,this[C]=0;
}set(i,n){
return this[C]+=!this[v].has(i),this[v].set(i,n),{};
}reset(){
if(!(this[C]<=0)){
for(let i of document.body.querySelectorAll("*")){
if(this[C]<=0){
break;
}let n=this[v].get(i);this[C]-=typeof n<"u";for(let t of n||[]){
i.removeEventListener(t,ce);
}
}this[v]=new WeakMap,this[C]=0;
}
}
},we=le()?new V:new _;function Gi(e){
let i=/\S+/g,n=e.getAttribute("wml-trigger")||"click",t=[],r;for(;(r=i.exec(n))!==null;){
t.push(r[0]);
}let s=we.set(e,t);for(let c of t){
e.addEventListener(c,ce,s);
}
}function Z(){
se(me);
}function me(){
we.reset(),document.body.querySelectorAll("[wml-event], [wml-window], [wml-openurl]").forEach(Gi);
}window.wails=G;Z();var X={};w(X,{Capabilities:()=>Qi,Environment:()=>Ji,IsAMD64:()=>en,IsARM:()=>nn,IsARM64:()=>tn,IsDarkMode:()=>Xi,IsDebug:()=>K,IsLinux:()=>qi,IsMac:()=>$i,IsWindows:()=>Y,invoke:()=>g});var ue=d(l.System,""),Yi=0,Ki=1;function g(e){
return window.chrome?window.chrome.webview.postMessage(e):window.webkit.messageHandlers.external.postMessage(e);
}function Xi(){
return ue(Yi);
}function Qi(){
return fetch("/wails/capabilities").json();
}function Ji(){
return ue(Ki);
}function Y(){
return window._wails.environment.OS==="windows";
}function qi(){
return window._wails.environment.OS==="linux";
}function $i(){
return window._wails.environment.OS==="darwin";
}function en(){
return window._wails.environment.Arch==="amd64";
}function nn(){
return window._wails.environment.Arch==="arm";
}function tn(){
return window._wails.environment.Arch==="arm64";
}function K(){
return window._wails.environment.Debug===!0;
}window.addEventListener("contextmenu",ln);var on=d(l.ContextMenu,""),rn=0;function an(e,i,n,t){
on(rn,{id:e,x:i,y:n,data:t});
}function ln(e){
let i=e.target,n=window.getComputedStyle(i).getPropertyValue("--custom-contextmenu");if(n=n?n.trim():"",n){
e.preventDefault();let t=window.getComputedStyle(i).getPropertyValue("--custom-contextmenu-data");an(n,e.clientX,e.clientY,t);return;
}dn(e);
}function dn(e){
if(K()){
return;
}let i=e.target;switch(window.getComputedStyle(i).getPropertyValue("--default-contextmenu").trim()){
case"show":return;case"hide":e.preventDefault();return;default:if(i.isContentEditable){
return;
}let r=window.getSelection(),s=r.toString().length>0;if(s){
for(let c=0;c<r.rangeCount;c++){
let a=r.getRangeAt(c).getClientRects();for(let p=0;p<a.length;p++){
let x=a[p];if(document.elementFromPoint(x.left,x.top)===i){
return;
}
}
}
}if((i.tagName==="INPUT"||i.tagName==="TEXTAREA")&&(s||!i.readOnly&&!i.disabled)){
return;
}e.preventDefault();
}
}var Q={};w(Q,{GetFlag:()=>b});function b(e){
try{
return window._wails.flags[e];
}catch(i){
throw new Error("Unable to retrieve flag '"+e+"': "+i);
}
}var S=!1,pe=!1,U=null,J="auto";window._wails=window._wails||{};window._wails.setResizable=function(e){
pe=e;
};window._wails.endDrag=function(){
document.body.style.cursor="default",S=!1;
};window.addEventListener("mousedown",cn);window.addEventListener("mousemove",mn);window.addEventListener("mouseup",wn);function sn(e){
let i=window.getComputedStyle(e.target).getPropertyValue("--wails-draggable"),n=e.buttons!==void 0?e.buttons:e.which;return!i||i===""||i.trim()!=="drag"||n===0?!1:e.detail===1;
}function cn(e){
if(U){
g("wails:resize:"+U),e.preventDefault();return;
}if(sn(e)){
if(e.offsetX>e.target.clientWidth||e.offsetY>e.target.clientHeight){
return;
}S=!0;
}else {
S=!1;
}
}function wn(){
S=!1;
}function W(e){
document.documentElement.style.cursor=e||J,U=e;
}function mn(e){
if(S&&(S=!1,(e.buttons!==void 0?e.buttons:e.which)>0)){
g("wails:drag");return;
}if(!pe||!Y()){
return;
}J==null&&(J=document.documentElement.style.cursor);let i=b("system.resizeHandleHeight")||5,n=b("system.resizeHandleWidth")||5,t=b("resizeCornerExtra")||10,r=window.outerWidth-e.clientX<n,s=e.clientX<n,c=e.clientY<i,m=window.outerHeight-e.clientY<i,a=window.outerWidth-e.clientX<n+t,p=e.clientX<n+t,x=e.clientY<i+t,re=window.outerHeight-e.clientY<i+t;!s&&!r&&!c&&!m&&U!==void 0?W():a&&re?W("se-resize"):p&&re?W("sw-resize"):p&&x?W("nw-resize"):x&&a?W("ne-resize"):s?W("w-resize"):c?W("n-resize"):m?W("s-resize"):r&&W("e-resize");
}var $={};w($,{Hide:()=>hn,Quit:()=>fn,Show:()=>gn});var q=d(l.Application,""),un=0,pn=1,Wn=2;function hn(){
return q(un);
}function gn(){
return q(pn);
}function fn(){
return q(Wn);
}var ee={};w(ee,{ByID:()=>bn,ByName:()=>vn,Call:()=>An,Plugin:()=>Rn});window._wails=window._wails||{};window._wails.callResultHandler=Sn;window._wails.callErrorHandler=xn;var F=0,Dn=d(l.Call,""),Mn=d(l.CancelCall,""),R=new Map;function Cn(){
let e;do {
e=D();
}while(R.has(e));return e;
}function Sn(e,i,n){
let t=We(e);t&&t.resolve(n?JSON.parse(i):i);
}function xn(e,i){
let n=We(e);n&&n.reject(i);
}function We(e){
let i=R.get(e);return R.delete(e),i;
}function O(e,i={}){
let n=Cn(),t=()=>Mn(e,{"call-id":n}),r=!1,s=!1,c=new Promise((m,a)=>{
i["call-id"]=n,R.set(n,{resolve:m,reject:a}),Dn(e,i).then(p=>{
if(s=!0,r){
return t();
}
}).catch(p=>{
a(p),R.delete(n);
});
});return c.cancel=()=>{
if(s){
return t();
}r=!0;
},c;
}function An(e){
return O(F,e);
}function vn(e,...i){
return O(F,{methodName:e,args:i});
}function bn(e,...i){
return O(F,{methodID:e,args:i});
}function Rn(e,i,...n){
return O(F,{packageName:"wails-plugins",structName:e,methodName:i,args:n});
}var ie={};w(ie,{SetText:()=>Un,Text:()=>Fn});var he=d(l.Clipboard,""),En=0,yn=1;function Un(e){
return he(En,{text:e});
}function Fn(){
return he(yn);
}var ne={};w(ne,{Any:()=>f,Array:()=>Pn,ByteSlice:()=>On,Map:()=>In,Nullable:()=>Tn,Struct:()=>Bn});function f(e){
return e;
}function On(e){
return e??"";
}function Pn(e){
return e===f?i=>i===null?[]:i:i=>{
if(i===null){
return[];
}for(let n=0;n<i.length;n++){
i[n]=e(i[n]);
}return i;
};
}function In(e,i){
return i===f?n=>n===null?{}:n:n=>{
if(n===null){
return{};
}for(let t in n){
n[t]=i(n[t]);
}return n;
};
}function Tn(e){
return e===f?f:i=>i===null?null:e(i);
}function Bn(e){
let i=!0;for(let n in e){
if(e[n]!==f){
i=!1;break;
}
}return i?f:n=>{
for(let t in e){
t in n&&(n[t]=e[t](n[t]));
}return n;
};
}var oe={};w(oe,{GetAll:()=>Nn,GetCurrent:()=>Vn,GetPrimary:()=>Hn});var te=d(l.Screens,""),zn=0,kn=1,Ln=2;function Nn(){
return te(zn);
}function Hn(){
return te(kn);
}function Vn(){
return te(Ln);
}window._wails=window._wails||{};window._wails.invoke=g;g("wails:runtime:ready");export{$ as Application,I as Browser,ee as Call,ie as Clipboard,ne as Create,B as Dialogs,N as Events,Q as Flags,oe as Screens,X as System,j as WML,E as Window};
