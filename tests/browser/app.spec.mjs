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
 await expect(page.getByRole("heading",{name:"Chaque cycle compte."})).toBeVisible();
}
async function data(page){return page.evaluate(()=>JSON.parse(localStorage.getItem("clair.ferme.v2")));}
async function nav(page,name){await page.getByRole("button",{name,exact:true}).click();}
test("premier lancement, durée personnalisée et persistance après rechargement",async({page})=>{
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await setup(page);
 let s=await data(page);expect(s.cycles[0].targetDays).toBe(60);expect(s.expenses).toHaveLength(0);
 expect(s.settings.openingCash).toBe(500000);
 await page.reload();await expect(page.getByRole("heading",{name:"Chaque cycle compte."})).toBeVisible();
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
 await expect(page.locator(".demo-banner")).toBeVisible();expect((await data(page)).cycles[0].id).toBe(before.cycles[0].id);
 await page.getByRole("button",{name:"Passer à mes données",exact:true}).click();
 await expect(page.locator(".demo-banner")).toHaveCount(0);expect((await data(page)).settings.farmName).toBe("Ferme Test");
});
test("les pages et formulaires restent dans la largeur de l’écran",async({page},testInfo)=>{
 await setup(page);
 for(const name of ["Vue d’ensemble","Opérations","Aliments","Cycles et budgets","Sauvegarde"]){
  await nav(page,name);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
 }
 await nav(page,"Vue d’ensemble");
 await page.screenshot({path:testInfo.outputPath("dashboard.png"),fullPage:true});
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
 await expect(page.getByRole("heading",{name:"Chaque cycle compte."})).toBeVisible();
 expect((await data(page)).cycles[0].name).toBe("Bande test");
});
