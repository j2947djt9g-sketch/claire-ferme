import {test,expect} from "@playwright/test";
const D=page=>page.getByRole("dialog");
async function setup(page){
 await page.goto("/");
 await page.getByRole("button",{name:/Configurer mon premier cycle/}).click();
 const d=D(page);
 await d.getByLabel("Nom de la ferme",{exact:true}).fill("Ferme Test");
 await d.getByLabel("Argent disponible au départ (FCFA)",{exact:true}).fill("500000");
 await d.getByLabel("Nom du cycle",{exact:true}).fill("Bande test");
 await d.getByLabel("Durée du cycle (jours)",{exact:true}).fill("60");
 await d.getByLabel("Poussins au départ",{exact:true}).fill("100");
 await d.getByLabel("Prix d’un poussin (FCFA)",{exact:true}).fill("500");
 await d.getByLabel("Prix de vente moyen / poulet (FCFA)",{exact:true}).fill("3000");
 await d.getByLabel("Nombre de sacs",{exact:true}).fill("10");
 await d.getByLabel("Prix du sac (FCFA)",{exact:true}).fill("20000");
 await d.getByRole("button",{name:"Créer mon cycle",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Votre ferme, au clair."})).toBeVisible();
}
async function data(page){return page.evaluate(()=>JSON.parse(localStorage.getItem("clair.ferme.v2")));}
async function nav(page,name){await page.getByRole("button",{name,exact:true}).click();}
test("premier lancement, durée personnalisée et persistance après rechargement",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await setup(page);
 let s=await data(page);expect(s.cycles[0].targetDays).toBe(60);expect(s.expenses).toHaveLength(0);
 expect(s.settings.openingCash).toBe(500000);
 await page.reload();await expect(page.getByRole("heading",{name:"Votre ferme, au clair."})).toBeVisible();
 expect((await data(page)).cycles[0].name).toBe("Bande test");expect(errors).toEqual([]);
});
test("achat, consommation, vente partielle et conservation des soldes",async({page})=>{
 await setup(page);await nav(page,"Aliments");
 await page.getByRole("button",{name:/Acheter des aliments/}).click();let d=D(page);
 await d.getByLabel("Nom du lot",{exact:true}).fill("Croissance");
 await d.getByLabel("Nombre de sacs",{exact:true}).fill("10");
 await d.getByLabel("Prix par sac (FCFA)",{exact:true}).fill("20000");
 await d.getByLabel("Entièrement payé",{exact:true}).uncheck();
 await d.getByLabel("Déjà payé (FCFA)",{exact:true}).fill("150000");
 await d.getByRole("button",{name:"Enregistrer",exact:true}).click();
 expect((await data(page)).lots[0].paid).toBe(150000);
 await page.getByRole("button",{name:"Enregistrer une consommation",exact:true}).click();d=D(page);
 await d.getByLabel("Quantité consommée (kg)",{exact:true}).fill("100");
 await d.getByRole("button",{name:"Enregistrer",exact:true}).click();
 await nav(page,"Vue d’ensemble");
 await page.getByRole("button",{name:"Vente",exact:true}).click();d=D(page);
 await d.getByLabel("Client",{exact:true}).fill("Client test");
 await d.getByLabel("Nombre de poulets",{exact:true}).fill("10");
 await d.getByLabel("Entièrement encaissé",{exact:true}).uncheck();
 await d.getByLabel("Déjà encaissé (FCFA)",{exact:true}).fill("10000");
 await d.getByRole("button",{name:"Enregistrer",exact:true}).click();
 const result=await page.evaluate(async()=>{const E=await import("/src/domain.mjs"),s=JSON.parse(localStorage.getItem("clair.ferme.v2"));return {f:E.farm(s),m:E.metrics(s,s.selectedCycleId)};});
 expect(result.f.cash).toBe(360000);expect(result.f.payable).toBe(50000);expect(result.f.receivable).toBe(20000);
 expect(result.f.stockKg).toBe(400);expect(result.m.cost).toBe(40000);expect(result.m.present).toBe(90);
 await page.reload();expect((await data(page)).sales).toHaveLength(1);
});
test("une dépense se corrige avec annulation de ses effets",async({page})=>{
 await setup(page);await page.getByRole("button",{name:"Dépense",exact:true}).click();let d=D(page);
 await d.getByLabel("Libellé",{exact:true}).fill("Soins à corriger");
 await d.getByLabel("Poste",{exact:true}).selectOption("sante");
 await d.getByLabel("Montant total (FCFA)",{exact:true}).fill("12000");
 await d.getByRole("button",{name:"Enregistrer",exact:true}).click();
 expect((await data(page)).expenses).toHaveLength(1);
 await nav(page,"Opérations");await page.getByRole("button",{name:"Corriger",exact:true}).click();
 await D(page).getByRole("button",{name:"Supprimer cette opération",exact:true}).click();
 expect((await data(page)).expenses).toHaveLength(0);
});
test("export JSON puis import contrôlé conserve le cycle",async({page})=>{
 await setup(page);const original=await data(page);await nav(page,"Sauvegarde");
 const promise=page.waitForEvent("download");await page.getByRole("button",{name:"Télécharger ma sauvegarde",exact:true}).click();
 const dl=await promise;expect(dl.suggestedFilename()).toMatch(/clair-ferme-.*\.json/);
 await page.locator("#import-file").setInputFiles({name:"sauvegarde.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(original))});
 await expect(D(page).getByRole("heading",{name:"Vérifier la sauvegarde"})).toBeVisible();
 await D(page).getByRole("button",{name:"Remplacer mes données",exact:true}).click();
 expect((await data(page)).cycles[0].id).toBe(original.cycles[0].id);
});
test("la démonstration reste séparée des données personnelles",async({page})=>{
 await setup(page);const before=await data(page);await nav(page,"Sauvegarde");
 await page.getByRole("button",{name:"Explorer un exemple fictif",exact:true}).click();
 await expect(page.locator(".demo-banner")).toBeVisible();expect(await page.evaluate(()=>scrollY)).toBe(0);expect((await data(page)).cycles[0].id).toBe(before.cycles[0].id);
 await page.getByRole("button",{name:"Passer à mes données",exact:true}).click();
 await expect(page.locator(".demo-banner")).toHaveCount(0);expect((await data(page)).settings.farmName).toBe("Ferme Test");
});
test("les pages et formulaires restent dans la largeur de l’écran",async({page},testInfo)=>{
 await setup(page);
 for(const name of ["Vue d’ensemble","Opérations","Aliments","Cycles et budgets","Sauvegarde"]){
  await nav(page,name);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
 }
 await nav(page,"Vue d’ensemble");
 await nav(page,"Sauvegarde");
 await page.getByRole("button",{name:"Explorer un exemple fictif",exact:true}).click();
 await expect(page.locator(".pia.hero")).toBeVisible();
 await page.waitForFunction(()=>{const img=document.querySelector(".pia.hero");return img?.complete&&img.naturalWidth>0;});
 await page.screenshot({path:testInfo.outputPath("dashboard.png"),fullPage:true});
 await page.evaluate(()=>window.scrollTo({top:0,left:0}));
 const jpg=await page.screenshot({type:"jpeg",quality:70,fullPage:false,scale:"css"});
 const encoded=jpg.toString("base64");
 for(let i=0;i<encoded.length;i+=6000)console.log("CF_PREVIEW_"+testInfo.project.name+"_"+Math.floor(i/6000)+":"+encoded.slice(i,i+6000));
 await page.getByRole("button",{name:"Dépense",exact:true}).click();
 expect(await D(page).evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await D(page).getByRole("button",{name:"Fermer",exact:true}).click();
});
test("une nouvelle bande reprend les hypothèses sans recopier les opérations",async({page})=>{
 await setup(page);await nav(page,"Cycles et budgets");
 await page.getByRole("button",{name:"Préparer le suivant",exact:true}).click();
 await D(page).getByRole("button",{name:"Créer mon cycle",exact:true}).click();
 const s=await data(page);expect(s.cycles).toHaveLength(2);expect(s.cycles[1].targetDays).toBe(60);
 expect(s.expenses).toHaveLength(0);expect(s.cycles[1].params.chickPrice).toBe(500);
});

test("un échec de sauvegarde garde le formulaire et les données précédentes",async({page})=>{
 await setup(page);
 await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException("quota","QuotaExceededError");};});
 await page.getByRole("button",{name:"Dépense",exact:true}).click();const d=D(page);
 await d.getByLabel("Libellé",{exact:true}).fill("Saisie non sauvée");
 await d.getByLabel("Montant total (FCFA)",{exact:true}).fill("1000");
 await d.getByRole("button",{name:"Enregistrer",exact:true}).click();
 await expect(d.locator(".form-error")).toContainText("La sauvegarde sur cet appareil a échoué");
 await expect(d).toBeVisible();expect((await data(page)).expenses).toHaveLength(0);
});
test("une sauvegarde illisible est conservée et peut être remplacée par un import valide",async({page})=>{
 await setup(page);const valid=await data(page);
 await page.evaluate(()=>localStorage.setItem("clair.ferme.v2","invalide"));await page.reload();
 await expect(page.getByRole("heading",{name:"Retrouvons vos données"})).toBeVisible();
 await page.locator("#import-file").setInputFiles({name:"restauration.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(valid))});
 await D(page).getByRole("button",{name:"Remplacer mes données",exact:true}).click();
 await expect(page.getByRole("heading",{name:"Votre ferme, au clair."})).toBeVisible();
 expect((await data(page)).cycles[0].name).toBe("Bande test");
});

test("la mascotte et les thèmes suivent les vrais chiffres sans modifier les données",async({page})=>{
 await setup(page);
 await expect(page.locator(".pia.hero")).toBeVisible();
 await page.waitForFunction(()=>document.querySelector(".pia.hero")?.naturalWidth>0);
 const before=JSON.stringify(await data(page));
 expect(await page.locator("html").getAttribute("data-theme")).toBe("light");
 await page.getByRole("button",{name:"Passer au thème sombre",exact:true}).click();
 expect(await page.locator("html").getAttribute("data-theme")).toBe("dark");
 expect(JSON.stringify(await data(page))).toBe(before);
 await page.reload();expect(await page.locator("html").getAttribute("data-theme")).toBe("dark");
 await page.getByRole("button",{name:"Passer au thème clair",exact:true}).click();
 await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content","#fbf9f2");
 await page.getByRole("button",{name:"Dépense",exact:true}).click();
 await D(page).getByLabel("Libellé",{exact:true}).fill("Dépense importante");
 await D(page).getByLabel("Montant total (FCFA)",{exact:true}).fill("600000");
 await D(page).getByRole("button",{name:"Enregistrer",exact:true}).click();
 await expect(page.locator(".pia-note")).toHaveAttribute("data-mood","danger");
 await expect(page.locator(".pia-note")).toContainText("Les paiements dépassent la trésorerie");
});
test("la navigation reste disponible sur les petits téléphones",async({page})=>{
 await setup(page);
 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:844});
  for(const name of ["Vue d’ensemble","Aliments","Cycles et budgets","Sauvegarde"]){
   await nav(page,name);
   const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:Array.from(document.querySelectorAll("body *")).filter(el=>el.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(el=>({tag:el.tagName,cls:el.className,right:el.getBoundingClientRect().right,text:el.textContent.slice(0,65)}))}));
   if(layout.scroll>layout.width+1)console.log("LAYOUT_DIAGNOSTIC",JSON.stringify({screen:name,...layout}));
   expect(layout.scroll<=layout.width+1).toBe(true);
  }
  const navBox=await page.getByRole("navigation",{name:"Navigation principale"}).boundingBox();
  expect(navBox.y+navBox.height).toBeLessThanOrEqual(844);
 }
});
test("les données et l’accueil se retrouvent hors connexion après la première ouverture",async({page,context})=>{
 await setup(page);
 await page.evaluate(()=>navigator.serviceWorker.ready);
 await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
 const before=await data(page);
 await context.setOffline(true);
 await page.reload();
 await expect(page.getByRole("heading",{name:"Votre ferme, au clair."})).toBeVisible();
 expect((await data(page)).cycles[0].id).toBe(before.cycles[0].id);
 await page.getByRole("button",{name:"Perte",exact:true}).click();
 await D(page).getByLabel("Nombre de poulets perdus",{exact:true}).fill("1");
 await D(page).getByRole("button",{name:"Enregistrer",exact:true}).click();
 expect((await data(page)).losses).toHaveLength(1);
 await context.setOffline(false);
});

test("les quatre saisies courantes restent accessibles dès l’ouverture sur téléphone",async({page})=>{
 await setup(page);
 await page.setViewportSize({width:390,height:664});
 const dock=await page.getByRole("navigation",{name:"Navigation principale"}).boundingBox();
 for(const action of ["Dépense","Aliments consommés","Vente","Perte"]){
  const box=await page.getByRole("button",{name:action,exact:true}).boundingBox();
  expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThan(dock.y);
 }
 await expect(page.getByRole("button",{name:"Voir le cycle sélectionné",exact:true})).toContainText("/ 60");
});

async function preview(page,testInfo,key){
 await page.screenshot({path:testInfo.outputPath(key+".png"),fullPage:true});
 const encoded=(await page.screenshot({type:"jpeg",quality:65,fullPage:false,scale:"css"})).toString("base64");
 for(let i=0;i<encoded.length;i+=6000)console.log("CF_"+key+"_"+Math.floor(i/6000)+":"+encoded.slice(i,i+6000));
}
test("une ouverture illustrée accompagne le chargement réel puis libère l’application",async({page},testInfo)=>{
 await page.route("**/src/app.mjs*",async route=>{await new Promise(resolve=>setTimeout(resolve,1100));await route.continue();});
 await page.goto("/",{waitUntil:"commit"});
 const splash=page.getByRole("status",{name:"Ouverture de Clair Ferme",exact:true});
 await expect(splash).toBeVisible();
 await expect(page.locator("#app")).toHaveAttribute("inert","");
 if(testInfo.project.name==="mobile"){await page.waitForTimeout(650);await preview(page,testInfo,"LAUNCH");}
 await expect(splash).toBeHidden({timeout:8000});
 await expect(page.locator("#app")).not.toHaveAttribute("inert","");
 await expect(page.getByRole("button",{name:/Configurer mon premier cycle/})).toBeVisible();
});
test("l’animation peut être revue et respecte la réduction des mouvements",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await setup(page);await nav(page,"Sauvegarde");
 await page.getByRole("button",{name:"Revoir l’ouverture animée",exact:true}).click();
 await expect(page.locator("#launch-screen")).toBeVisible();
 expect(await page.locator(".sprout-stem").evaluate(el=>getComputedStyle(el).animationName)).toBe("none");
 await expect(page.locator("#launch-screen")).toBeHidden({timeout:4000});
 await expect(page.locator("#app")).not.toHaveAttribute("inert","");
});
test("tablettes et téléphone en paysage gardent une navigation et des formulaires utilisables",async({page},testInfo)=>{
 test.setTimeout(60000);await setup(page);
 for(const [width,height]of [[768,1024],[1024,768],[820,1180],[1180,820],[844,390]]){
  await page.setViewportSize({width,height});
  for(const screen of ["Vue d’ensemble","Opérations","Aliments","Cycles et budgets","Sauvegarde"]){
   await nav(page,screen);
   const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,overflow:Array.from(document.querySelectorAll("body *")).filter(el=>el.getBoundingClientRect().right>innerWidth+1).slice(0,10).map(el=>({tag:el.tagName,cls:el.className,right:el.getBoundingClientRect().right}))}));
   if(layout.scroll>layout.width+1)console.log("TABLET_LAYOUT",JSON.stringify({screen,width,height,...layout}));
   expect(layout.scroll).toBeLessThanOrEqual(layout.width+1);
  }
  await nav(page,"Vue d’ensemble");await page.getByRole("button",{name:"Dépense",exact:true}).click();
  const box=await D(page).boundingBox();expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width+1);
  expect(await D(page).evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
  expect(await D(page).getByLabel("Libellé",{exact:true}).evaluate(el=>parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(16);
  await D(page).getByRole("button",{name:"Fermer",exact:true}).click();
 }
 if(testInfo.project.name==="desktop"){await page.setViewportSize({width:768,height:1024});await nav(page,"Vue d’ensemble");await preview(page,testInfo,"TABLET");}
});
test("les saisies existantes restent intactes avec le nouveau thème par défaut",async({page})=>{
 await setup(page);const before=await data(page);
 await page.evaluate(()=>{localStorage.setItem("clair.ferme.theme","dark");localStorage.removeItem("clair.ferme.appearance.v3");});
 await page.reload();await expect(page.locator("#launch-screen")).toBeHidden();
 expect(await page.locator("html").getAttribute("data-theme")).toBe("light");
 expect(await data(page)).toEqual(before);
});
test("l’accueil illustré et le premier bouton restent utilisables sur les formats mobiles",async({page},testInfo)=>{
 for(const [width,height]of [[390,844],[768,1024],[1024,768],[844,390]]){
  await page.setViewportSize({width,height});await page.goto("/");
  await expect(page.locator("#launch-screen")).toBeHidden();
  await expect(page.locator(".welcome-world .farm-scene")).toBeVisible();
  const button=page.getByRole("button",{name:/Configurer mon premier cycle/});await expect(button).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
 if(testInfo.project.name==="mobile"){await page.setViewportSize({width:390,height:844});await page.goto("/");await expect(page.locator("#launch-screen")).toBeHidden();await preview(page,testInfo,"WELCOME");}
});
