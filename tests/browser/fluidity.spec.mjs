import {test,expect} from "@playwright/test";
async function demo(page){
 await page.goto("/");
 await page.getByRole("button",{name:"Voir un exemple",exact:true}).click();
}
test("la scène prend le temps de vivre et peut être passée dès que la ferme est prête",async({page})=>{
 await page.goto("/");
 const layer=page.locator("#launch-screen");
 await expect(layer).toBeVisible();
 await expect(page.locator(".launch-pia")).toBeVisible();
 await expect(page.locator(".launch-landscape .farm-scene")).toBeVisible();
 const skip=page.getByRole("button",{name:"Passer l’animation",exact:true});
 await expect(skip).toBeVisible();
 await page.waitForTimeout(1000);
 await expect(layer).toBeVisible();
 await skip.click();
 await expect(layer).toBeHidden({timeout:1500});
 await expect(page.locator("#app")).not.toHaveAttribute("inert","");
 await expect(page.getByRole("button",{name:/Configurer mon premier cycle/})).toBeVisible();
});
test("le retour retrouve la page et la position de lecture",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await demo(page);
 const all=page.getByRole("button",{name:/Tout voir/});await all.scrollIntoViewIfNeeded();
 const before=await page.evaluate(()=>scrollY);
 await all.click();
 await expect(page.locator('main h1')).toContainText("Dépenses et ventes");
 await page.getByRole("button",{name:/Retour à l’accueil/i}).click();
 await expect(page.locator(".balance-section")).toBeVisible();
 await expect.poll(()=>page.evaluate(()=>scrollY)).toBeCloseTo(before,0);
 await expect(all).toBeFocused();
});
test("les raccourcis de trésorerie amènent directement aux règlements",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await demo(page);
 await page.locator(".balance-summary button").first().click();
 const heading=page.getByRole("heading",{name:"Règlements à suivre",exact:true});
 await expect(heading).toBeInViewport();
 await expect(heading).toBeFocused();
});
test("le choix rapide possède un retour et restaure le focus après fermeture",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await demo(page);
 await page.getByRole("navigation").getByRole("button",{name:"Opérations",exact:true}).click();
 await page.getByRole("button",{name:"Ajouter",exact:true}).click();
 const d=page.getByRole("dialog");
 await d.getByRole("button",{name:/Vente de poulets/}).click();
 await d.getByRole("button",{name:"Retour",exact:true}).click();
 await expect(d.getByRole("heading",{name:"Qu’allez-vous enregistrer ?"})).toBeVisible();
 await d.getByRole("button",{name:"Fermer",exact:true}).click();
 await expect(d).toBeHidden();
 await expect(page.getByRole("button",{name:"Ajouter",exact:true})).toBeFocused();
});

test("sans stock on peut acheter puis reprendre la consommation",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await page.goto("/");
 await page.evaluate(async()=>{const {demo}=await import("/src/domain.mjs");const s=demo();s.uses=[];s.lots=[];localStorage.setItem("clair.ferme.demo.v2",JSON.stringify(s));});
 await page.getByRole("button",{name:"Voir un exemple",exact:true}).click();
 await page.getByRole("button",{name:"Aliments consommés",exact:true}).click();
 const d=page.getByRole("dialog");await expect(d).toBeVisible();
 await d.getByRole("button",{name:"Acheter des aliments",exact:true}).click();
 await d.getByLabel("Nom du lot",{exact:true}).fill("Premier stock");
 await d.getByLabel("Nombre de sacs",{exact:true}).fill("2");
 await d.getByLabel("Prix par sac (FCFA)",{exact:true}).fill("10000");
 await d.getByRole("button",{name:"Enregistrer",exact:true}).click();
 await expect(d.getByRole("heading",{name:"Noter les aliments consommés",exact:true})).toBeVisible();
 await expect(d.getByLabel("Lot utilisé",{exact:true})).toContainText("Premier stock");
 await d.getByRole("button",{name:"Fermer",exact:true}).click();
 await expect(page.getByRole("button",{name:"Aliments consommés",exact:true})).toBeFocused();
});

test("la relecture déroule la scène entière puis retrouve son bouton",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await demo(page);
 await page.getByRole("navigation").getByRole("button",{name:"Sauvegarde",exact:true}).click();
 await page.emulateMedia({reducedMotion:"no-preference"});
 const replay=page.getByRole("button",{name:"Revoir l’ouverture animée",exact:true});
 const start=Date.now();await replay.click();
 await expect(page.locator(".launch-pia")).toBeVisible();
 await page.waitForTimeout(1800);await expect(page.locator("#launch-screen")).toBeVisible();
 await expect(page.locator("#launch-screen")).toBeHidden({timeout:6000});
 expect(Date.now()-start).toBeGreaterThanOrEqual(3400);
 await expect(replay).toBeFocused();
});

test("revenir au choix rapide conserve les champs déjà saisis",async({page})=>{
 await page.emulateMedia({reducedMotion:"reduce"});await demo(page);
 await page.getByRole("navigation").getByRole("button",{name:"Opérations",exact:true}).click();
 await page.getByRole("button",{name:"Ajouter",exact:true}).click();
 const d=page.getByRole("dialog");await d.getByRole("button",{name:/Dépense/}).click();
 await d.getByLabel("Libellé",{exact:true}).fill("Transport en cours");
 await d.getByLabel("Montant total (FCFA)",{exact:true}).fill("12345");
 await d.getByLabel("Entièrement payé",{exact:true}).uncheck();
 await d.getByLabel("Déjà payé (FCFA)",{exact:true}).fill("3000");
 await d.getByRole("button",{name:"Retour",exact:true}).click();
 await d.getByRole("button",{name:/Dépense/}).click();
 await expect(d.getByLabel("Libellé",{exact:true})).toHaveValue("Transport en cours");
 await expect(d.getByLabel("Montant total (FCFA)",{exact:true})).toHaveValue("12345");
 await expect(d.getByLabel("Entièrement payé",{exact:true})).not.toBeChecked();
 await expect(d.getByLabel("Déjà payé (FCFA)",{exact:true})).toHaveValue("3000");
});
