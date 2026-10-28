(()=>{
 const layer=document.getElementById("launch-screen"),app=document.getElementById("app");
 if(!layer||!app)return;
 const skip=document.getElementById("launch-skip"),retry=document.getElementById("launch-retry");
 const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
 let ready=false,preparing=false,endTimer,failTimer,returnFocus;
 function release(skipped=false){
  if(!ready||layer.hidden||layer.classList.contains("is-leaving"))return;
  clearTimeout(failTimer);clearTimeout(endTimer);
  const focusInside=layer.contains(document.activeElement);
  app.inert=false;app.removeAttribute("aria-busy");
  layer.classList.toggle("is-skipped",skipped);layer.classList.add("is-leaving");
  layer.setAttribute("aria-hidden","true");layer.inert=true;
  endTimer=setTimeout(()=>{
   layer.hidden=true;layer.classList.remove("is-playing","is-leaving","is-skipped");
   if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
   else if(focusInside)document.querySelector("#main")?.focus({preventScroll:true});
   returnFocus=null;
  },motion.matches?0:skipped?180:1150);
 }
 function play(){
  layer.classList.add("is-playing");skip.hidden=false;
  endTimer=setTimeout(()=>release(),motion.matches?0:2600);
 }
 async function finish(){
  if(preparing)return;preparing=true;
  const images=[layer.querySelector(".launch-pia"),document.querySelector(".pia.hero,.pia.welcome-pia")].filter(Boolean);
  await Promise.race([Promise.all(images.map(pic=>typeof pic.decode==="function"?pic.decode().catch(()=>{}):Promise.resolve())),new Promise(resolve=>setTimeout(resolve,2500))]);
  ready=true;clearTimeout(failTimer);layer.classList.remove("has-error");retry.hidden=true;
  document.getElementById("launch-status").textContent="Votre ferme prend vie.";
  play();
 }
 skip?.addEventListener("click",()=>release(true));
 retry?.addEventListener("click",()=>location.reload());
 failTimer=setTimeout(()=>{
  if(ready)return;
  layer.classList.add("has-error");
  document.getElementById("launch-status").textContent="L’ouverture prend plus de temps que prévu.";
  retry.hidden=false;
 },12000);
 window.addEventListener("clair:ready",finish,{once:true});
 if(window.__clairAppReady)finish();
 window.addEventListener("clair:replay-intro",()=>{
  if(!ready||!layer.hidden)return;
  returnFocus=document.activeElement;clearTimeout(endTimer);
  layer.hidden=false;layer.inert=false;layer.removeAttribute("aria-hidden");
  layer.classList.remove("is-playing","is-leaving","is-skipped","has-error");retry.hidden=true;skip.hidden=true;
  app.inert=true;
  // Commit the reset before replaying the same CSS scene.
  void layer.offsetWidth;
  document.getElementById("launch-status").textContent="Votre ferme prend vie.";
  play();
 });
 motion.addEventListener("change",()=>{if(motion.matches)release(true);});
})();
