(()=>{
 const layer=document.getElementById("launch-screen"),app=document.getElementById("app");
 if(!layer||!app)return;
 let ready=false,replaying=false,endTimer,failTimer;
 const reduced=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 function release(){
  clearTimeout(failTimer);clearTimeout(endTimer);
  app.inert=false;app.removeAttribute("aria-busy");
  layer.classList.add("is-leaving");layer.setAttribute("aria-hidden","true");layer.inert=true;
  endTimer=setTimeout(()=>{layer.hidden=true;layer.classList.remove("is-leaving");},reduced()?0:260);
 }
 async function finish(){
  if(ready)return;ready=true;
  const pic=document.querySelector(".pia.hero,.pia.welcome-pia");
  if(pic&&typeof pic.decode==="function")await Promise.race([pic.decode().catch(()=>{}),new Promise(resolve=>setTimeout(resolve,2500))]);
  release();
 }
 function retry(){location.reload();}
 document.getElementById("launch-retry")?.addEventListener("click",retry);
 function failure(){
  if(ready)return;
  layer.classList.add("has-error");
  document.getElementById("launch-status").textContent="L’ouverture prend plus de temps que prévu.";
  document.getElementById("launch-retry").hidden=false;
 }
 failTimer=setTimeout(failure,12000);
 window.addEventListener("clair:ready",finish,{once:true});
 if(window.__clairAppReady)finish();
 window.addEventListener("clair:replay-intro",()=>{
  if(replaying)return;replaying=true;clearTimeout(endTimer);
  layer.hidden=false;layer.inert=false;layer.classList.remove("is-leaving","has-error");
  layer.removeAttribute("aria-hidden");document.getElementById("launch-retry").hidden=true;
  document.getElementById("launch-status").textContent="Votre ferme, au clair.";
  app.inert=true;
  const scene=layer.querySelector(".launch-inner");scene?.getAnimations({subtree:true}).forEach(animation=>{animation.cancel();animation.play();});
  endTimer=setTimeout(()=>{release();replaying=false;},reduced()?200:1700);
 });
})();
