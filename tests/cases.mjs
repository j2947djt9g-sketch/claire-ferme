export function cases(E){
 const {blank,apply,metrics,farm,stock,validate,zero,plan,demo,csv,alerts,addDays,daysBetween}=E;
 const at="2026-10-20";
 const eq=(a,b)=>{if(a!==b)throw Error("Attendu "+JSON.stringify(b)+", obtenu "+JSON.stringify(a));};
 const ok=(v,m="Condition fausse")=>{if(!v)throw Error(m)};
 const throws=(fn,part="")=>{try{fn()}catch(e){if(part&&!e.message.includes(part))throw Error("Erreur inattendue : "+e.message);return;}throw Error("Une erreur était attendue.");};
 const copy=s=>JSON.parse(JSON.stringify(s));
 const cycle=(s=blank(),extra={})=>apply(s,{type:"cycle",data:{id:"c1",name:"Bande 1",startDate:"2026-10-01",targetDays:45,initialCount:100,expectedMortality:3,expectedPrice:3000,chickPrice:500,feedBags:10,bagPrice:20000,bagKg:50,budget:{sante:10000,location:5000},targetMargin:30000,...extra}},at);
 const act=(s,type,data)=>apply(s,{type,data},at);
 const expense=(s,extra={})=>act(s,"expense",{id:"e1",label:"Soins",category:"sante",amount:10000,paid:10000,planned:true,date:"2026-10-10",...extra});
 const lot=(s,extra={})=>act(s,"lot",{id:"l1",name:"Aliments",kg:500,total:200000,paid:150000,date:"2026-10-02",...extra});
 const use=(s,extra={})=>act(s,"use",{id:"u1",lotId:"l1",kg:100,planned:true,date:"2026-10-10",...extra});
 const sale=(s,extra={})=>act(s,"sale",{id:"s1",client:"Client A",quantity:10,unitPrice:3000,received:10000,planned:true,date:"2026-10-10",...extra});
 return [
 ["un cycle personnalisable ne crée pas de mouvements réels",()=>{const s=cycle(blank(),{targetDays:60});eq(s.cycles[0].targetDays,60);eq(farm(s).cash,0);eq(metrics(s,"c1",at).cost,0);eq(s.expenses.length,0);}],
 ["la mortalité prévue ne crée pas de perte réelle",()=>{const s=cycle();eq(metrics(s,"c1",at).dead,0);eq(metrics(s,"c1",at).present,100);eq(s.cycles[0].targetSales,291000);}],
 ["les effectifs prévus restent entiers",()=>{const p=plan({initialCount:1100,expectedMortality:2.5,expectedPrice:2300,chickPrice:650,feedBags:60,bagPrice:20500,bagKg:50,budget:{}});eq(p.expectedBirds,1072);eq(p.targetSales,2465600);}],
 ["charge prévue : réel augmente, prévision finale inchangée",()=>{const s=cycle(),before=metrics(s,"c1",at),after=metrics(expense(s),"c1",at);eq(after.cost,10000);eq(after.forecastCost,before.forecastCost);eq(after.remaining,before.remaining-10000);eq(s.expenses.length,0);}],
 ["charge imprévue : coût final augmente",()=>{const s=cycle();eq(metrics(expense(s,{planned:false}),"c1",at).forecastCost,metrics(s,"c1",at).forecastCost+10000);}],
 ["une charge à crédit est engagée sans sortie de caisse",()=>{const s=expense(cycle(),{paid:0});eq(farm(s).cash,0);eq(farm(s).payable,10000);eq(metrics(s,"c1",at).cost,10000);}],
 ["paiement partiel et solde fournisseur",()=>{let s=expense(cycle(),{paid:2000});s=act(s,"payment",{list:"expenses",id:"e1",amount:3000});eq(farm(s).cash,-5000);eq(farm(s).payable,5000);throws(()=>act(s,"payment",{list:"expenses",id:"e1",amount:5001}));}],
 ["un achat d’aliments ne charge pas le cycle",()=>{const s=lot(cycle());eq(farm(s).cash,-150000);eq(metrics(s,"c1",at).cost,0);eq(farm(s).stockValue,200000);eq(farm(s).payable,50000);}],
 ["consommation : coût au cycle sans second décaissement",()=>{const s=use(lot(cycle()));eq(metrics(s,"c1",at).cost,40000);eq(farm(s).cash,-150000);eq(stock(s)[0].leftKg,400);eq(stock(s)[0].leftValue,160000);eq(metrics(s,"c1",at).forecastCost,metrics(cycle(),"c1",at).forecastCost);}],
 ["les kilogrammes du lot ne peuvent pas devenir négatifs",()=>throws(()=>use(lot(cycle()),{kg:501}),"stock")],
 ["la consommation ne peut pas précéder l’achat",()=>throws(()=>use(lot(cycle()),{date:"2026-10-01"}),"avant l’achat")],
 ["la consommation ne peut pas précéder le cycle",()=>throws(()=>use(lot(cycle(),{date:"2026-09-01"}),{date:"2026-09-30"}),"début")],
 ["les centimes de kg sont validés",()=>throws(()=>use(lot(cycle()),{kg:1.001}),"décimales")],
 ["l’arrondi conserve le coût total d’un lot",()=>{let s=lot(cycle(),{kg:3,total:100,paid:100});for(let i=0;i<3;i++)s=use(s,{id:"u"+i,kg:1});eq(metrics(s,"c1",at).cost,100);eq(stock(s)[0].leftValue,0);}],
 ["stock partagé : chaque cycle porte sa consommation",()=>{let s=lot(cycle());s=use(s,{kg:100});s=cycle(s,{id:"c2",name:"Bande 2"});s=use(s,{id:"u2",kg:50});eq(metrics(s,"c1",at).cost,40000);eq(metrics(s,"c2",at).cost,20000);eq(farm(s).stockKg,350);}],
 ["vente partielle : oiseaux, chiffre d’affaires et créance",()=>{const s=sale(cycle()),m=metrics(s,"c1",at);eq(m.present,90);eq(m.revenue,30000);eq(farm(s).cash,10000);eq(farm(s).receivable,20000);eq(m.forecastSales,291000);}],
 ["encaisser une créance ne crée pas une nouvelle vente",()=>{const s=act(sale(cycle()),"payment",{list:"sales",id:"s1",amount:20000});eq(farm(s).receivable,0);eq(farm(s).cash,30000);eq(metrics(s,"c1",at).revenue,30000);}],
 ["encaissement supérieur au montant refusé",()=>throws(()=>sale(cycle(),{received:30001}))],
 ["vendre plus de poulets que présents est refusé",()=>throws(()=>sale(cycle(),{quantity:101,received:0}),"effectif")],
 ["les pertes réduisent les présents sans charge fictive",()=>{const s=act(cycle(),"loss",{id:"p1",count:4,reason:"Suivi",date:"2026-10-11"});eq(metrics(s,"c1",at).present,96);eq(metrics(s,"c1",at).cost,0);eq(farm(s).cash,0);}],
 ["vente et mortalité cumulées ne dépassent pas l’effectif",()=>throws(()=>act(sale(cycle()),"loss",{count:91,reason:"",date:"2026-10-12"}),"effectif")],
 ["les apports augmentent la caisse sans créer de bénéfice",()=>{const s=act(cycle(),"contribution",{id:"a1",amount:80000,label:"Capital",date:at});eq(farm(s).cash,80000);eq(metrics(s,"c1",at).revenue,0);eq(metrics(s,"c1",at).margin,0);}],
 ["un apport négatif est refusé",()=>throws(()=>act(cycle(),"contribution",{amount:-10,label:"Apport",date:at}))],
 ["révision : budget initial conservé",()=>{const s=expense(cycle()),remaining={...zero(),sante:15000};const n=act(s,"revise",{remaining,remainingSales:250000,targetMargin:20000});eq(n.cycles[0].budget.sante,10000);eq(metrics(n,"c1",at).forecastCost,25000);eq(metrics(n,"c1",at).forecastSales,250000);}],
 ["supprimer une dépense restaure caisse et prévision",()=>{const a=cycle(),s=act(expense(a),"delete",{list:"expenses",id:"e1"});eq(farm(s).cash,0);eq(metrics(s,"c1",at).forecastCost,metrics(a,"c1",at).forecastCost);}],
 ["supprimer une vente restaure oiseaux et créance",()=>{const s=act(sale(cycle()),"delete",{list:"sales",id:"s1"});eq(metrics(s,"c1",at).present,100);eq(farm(s).receivable,0);eq(farm(s).cash,0);eq(s.cycles[0].remainingSales,291000);}],
 ["supprimer une consommation restaure le stock",()=>{const s=act(use(lot(cycle())),"delete",{list:"uses",id:"u1"});eq(farm(s).stockKg,500);eq(metrics(s,"c1",at).cost,0);eq(s.cycles[0].remaining.aliments,200000);}],
 ["un cycle avec des poulets ne peut pas être clôturé",()=>throws(()=>act(cycle(),"close",{}),"présents")],
 ["un cycle avec des prévisions ne peut pas être clôturé",()=>{const s=sale(cycle(),{quantity:100,received:0});throws(()=>act(s,"close",{}),"prévisions");}],
 ["clôture : charges figées, règlement toujours possible",()=>{let s=expense(sale(cycle(),{quantity:100,received:0}),{paid:0});s=act(s,"revise",{remaining:zero(),remainingSales:0,targetMargin:30000});s=act(s,"close",{});eq(s.cycles[0].closedAt,at);throws(()=>expense(s,{id:"e2"}),"clôturé");s=act(s,"payment",{list:"expenses",id:"e1",amount:10000});eq(farm(s).payable,0);}],
 ["les opérations réelles futures sont refusées",()=>throws(()=>expense(cycle(),{date:"2026-10-21"}),"futur")],
 ["les achats préparatoires avant le cycle sont permis",()=>{const s=expense(cycle(),{date:"2026-09-20"});eq(metrics(s,"c1",at).cost,10000);}],
 ["les dates inexistantes sont refusées",()=>throws(()=>expense(cycle(),{date:"2026-02-30"}),"invalide")],
 ["les montants NaN ou fractionnaires sont refusés",()=>{throws(()=>expense(cycle(),{amount:NaN}));throws(()=>expense(cycle(),{amount:10.5}));}],
 ["les identifiants en double sont refusés à l’import",()=>{const s=expense(cycle()),n=copy(s);n.expenses.push(copy(n.expenses[0]));throws(()=>validate(n,at),"double");}],
 ["les références étrangères sont refusées à l’import",()=>{const n=copy(expense(cycle()));n.expenses[0].cycleId="inconnu";throws(()=>validate(n,at),"introuvable");}],
 ["cycle de durée nulle ou mortalité impossible refusés",()=>{throws(()=>cycle(blank(),{targetDays:0}));throws(()=>cycle(blank(),{expectedMortality:101}));}],
 ["les aliments ne peuvent pas être saisis deux fois en charges",()=>throws(()=>expense(cycle(),{category:"aliments"}),"stock")],
 ["alerte fournisseur à deux jours et alerte budget",()=>{let s=expense(cycle(),{paid:0,dueDate:"2026-10-22",planned:false});const a=alerts(s,"c1",at);ok(a.some(x=>x.title==="Paiement à prévoir"));ok(a.some(x=>x.title==="Budget à revoir"));}],
 ["la trésorerie peut être négative et reste exacte",()=>{const s=expense(cycle());eq(farm(s).cash,-10000);ok(alerts(s,"c1",at).some(x=>x.title==="Trésorerie négative"));}],
 ["la marge peut être négative sans être masquée",()=>{const s=expense(cycle());eq(metrics(s,"c1",at).margin,-10000);}],
 ["les écarts de jours traversent années bissextiles et changement d’heure",()=>{eq(daysBetween("2024-02-28","2024-03-01"),2);eq(daysBetween("2026-03-28","2026-03-30"),2);eq(addDays("2026-10-20",44),"2026-12-03");}],
 ["export CSV : BOM, séparateur, guillemets et formule neutralisée",()=>{const s=expense(cycle(),{label:'=HYPERLINK("x";"y")'}),out=csv(s);ok(out.startsWith("\uFEFF"));ok(out.includes('"\u0027=HYPERLINK(""x"";""y"")"'));ok(out.includes(";"));}],
 ["JSON : aller-retour sans perte de calcul",()=>{const s=sale(use(lot(expense(cycle()))));const n=validate(JSON.parse(JSON.stringify(s)),at);eq(farm(n).cash,farm(s).cash);eq(metrics(n,"c1",at).cost,metrics(s,"c1",at).cost);}],
 ["le mode exemple est explicitement identifié",()=>{const s=demo(at);ok(s.demo);ok(s.settings.farmName.includes("exemple"));eq(farm(s).cash,600000);eq(metrics(s,s.selectedCycleId,at).present,294);}],
 ["une seconde bande conserve les données de la première",()=>{let s=expense(cycle());s=cycle(s,{id:"c2",name:"Bande 2",targetDays:50});eq(s.cycles.length,2);eq(s.selectedCycleId,"c2");eq(metrics(s,"c1",at).cost,10000);eq(farm(s).cash,-10000);}],
 ["un import de stock surconsommé est refusé",()=>{const s=use(lot(cycle()));s.uses[0].kg=501;throws(()=>validate(s,at),"stock");}],
 ["les frais fixes appartiennent au coût du cycle",()=>{const s=expense(cycle(),{category:"location",amount:5000,paid:5000});eq(metrics(s,"c1",at).actual.location,5000);eq(metrics(s,"c1",at).cost,5000);}]
 ];
}
