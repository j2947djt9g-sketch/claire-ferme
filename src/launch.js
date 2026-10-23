(()=>{
 const layer=document.getElementById("launch-screen"),app=document.getElementById("app");
 if(!layer||!app)return;
 const started=performance.now();
 let ready=false,replaying=false,endTimer,failTimer,returnFocus;
 const reduced=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 function release(){
  clearTimeout(failTimer);clearTimeout(endTimer);
  app.inert=false;app.removeAttribute("aria-busy");
  layer.classList.add("is-leaving");layer.setAttribute("aria-hidden","true");layer.inert=true;
  endTimer=setTimeout(()=>{
   layer.hidden=true;layer.classList.remove("is-leaving");replaying=false;
   if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});returnFocus=null;
  },reduced()?0:700);
 }
 async function finish(){
  if(ready)return;ready=true;
  const pic=document.querySelector(".pia.hero,.pia.welcome-pia");
  if(pic&&typeof pic.decode==="function")await Promise.race([pic.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,2500))]);
  const remaining=reduced()?0:Math.max(0,400-(performance.now()-started));
  endTimer=setTimeout(release,remaining);
 }
 document.getElementById("launch-retry")?.addEventListener("click",()=>location.reload());
 failTimer=setTimeout(()=>{
  if(ready)return;
  layer.classList.add("has-error");
  document.getElementById("launch-status").textContent="L’ouverture prend plus de temps que prévu.";
  document.getElementById("launch-retry").hidden=false;
 },12000);
 window.addEventListener("clair:ready",finish,{once:true});
 if(window.__clairAppReady)finish();
 window.addEventListener("clair:replay-intro",()=>{
  if(replaying)return;replaying=true;clearTimeout(endTimer);
  returnFocus=document.activeElement;
  layer.hidden=false;layer.inert=false;layer.classList.remove("is-leaving","has-error");
  layer.removeAttribute("aria-hidden");document.getElementById("launch-retry").hidden=true;
  document.getElementById("launch-status").textContent="Votre ferme, au clair.";
  app.inert=true;
  layer.querySelectorAll(".launch-brand,.launch-dots i").forEach(el=>el.getAnimations().forEach(animation=>{animation.cancel();animation.play();}));
  endTimer=setTimeout(release,reduced()?300:850);
 });
})();
