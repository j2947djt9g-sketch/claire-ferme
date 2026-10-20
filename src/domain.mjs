export const CATEGORIES = {
 poussin:"Poussins", aliments:"Aliments consommés", sante:"Santé", litiere:"Litière",
 energie:"Eau et énergie", transport:"Transport", travail:"Main-d’œuvre",
 location:"Location", fixes:"Autres frais fixes", autres:"Autres charges"
};
export const KEYS=Object.keys(CATEGORIES);
export const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
export const uid=()=>globalThis.crypto?.randomUUID?.() || "id-"+Date.now()+"-"+Math.random().toString(36).slice(2);
export const sum=a=>a.reduce((s,n)=>s+n,0);
export const zero=()=>Object.fromEntries(KEYS.map(k=>[k,0]));
const clone=o=>JSON.parse(JSON.stringify(o));
const must=(v,m)=>{if(!v)throw Error(m)};
const num=(n,label,min=0,integer=true)=>must(typeof n==="number"&&Number.isFinite(n)&&n>=min&&n<=1e12&&(!integer||Number.isSafeInteger(n)),label+" invalide.");
const name=(s,label)=>must(typeof s==="string"&&s.trim().length>0&&s.length<=200,label+" requis (200 caractères maximum).");
const date=(s,label)=>must(typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s+"T12:00:00Z"))&&new Date(s+"T12:00:00Z").toISOString().slice(0,10)===s,label+" invalide.");
export const daysBetween=(a,b)=>Math.round((Date.parse(b+"T12:00:00Z")-Date.parse(a+"T12:00:00Z"))/86400000);
export const addDays=(d,n)=>new Date(Date.parse(d+"T12:00:00Z")+n*86400000).toISOString().slice(0,10);
export function blank(){return {version:2,demo:false,settings:{farmName:"Ma ferme",openingCash:0,stockThresholdKg:100},selectedCycleId:null,cycles:[],expenses:[],lots:[],uses:[],sales:[],losses:[],contributions:[]};}
export function plan(p){
 num(p.initialCount,"Nombre de poussins",1); num(p.expectedMortality,"Mortalité prévue",0,false);must(p.expectedMortality<=100,"Mortalité supérieure à 100 %.");
 for(const k of ["expectedPrice","chickPrice","feedBags","bagPrice"])num(p[k],k);
 num(p.bagKg,"Poids du sac",0.01,false);
 const budget={...zero(),...p.budget,poussin:p.initialCount*p.chickPrice,aliments:p.feedBags*p.bagPrice};
 const expectedBirds=Math.floor(p.initialCount*(1-p.expectedMortality/100));
 return {budget,expectedBirds,targetSales:expectedBirds*p.expectedPrice};
}
export function feedCosts(s){
 const cumulative={}, costs={};
 for(const u of s.uses){
  const lot=s.lots.find(l=>l.id===u.lotId);
  if(!lot)continue;
  const before=cumulative[lot.id]||0,after=Math.round((before+u.kg)*100)/100;
  costs[u.id]=Math.round(after/lot.kg*lot.total)-Math.round(before/lot.kg*lot.total);cumulative[lot.id]=after;
 }
 return {costs,cumulative};
}
export function stock(s){
 const {cumulative}=feedCosts(s);
 return s.lots.map(l=>{const used=cumulative[l.id]||0;return {...l,leftKg:Math.round((l.kg-used)*100)/100,leftValue:l.total-Math.round(used/l.kg*l.total)};});
}
export function metrics(s,id,at=today()){
 const c=s.cycles.find(c=>c.id===id);if(!c)return null;
 const expenses=s.expenses.filter(x=>x.cycleId===id),sales=s.sales.filter(x=>x.cycleId===id),uses=s.uses.filter(x=>x.cycleId===id),losses=s.losses.filter(x=>x.cycleId===id);
 const {costs}=feedCosts(s);const actual=zero();
 expenses.forEach(x=>actual[x.category]+=x.amount);uses.forEach(x=>actual.aliments+=costs[x.id]);
 const cost=sum(Object.values(actual)),revenue=sum(sales.map(x=>x.quantity*x.unitPrice));
 const sold=sum(sales.map(x=>x.quantity)),dead=sum(losses.map(x=>x.count)),forecastCost=cost+sum(Object.values(c.remaining));
 const forecastSales=revenue+c.remainingSales;
 return {cycle:c,actual,cost,revenue,sold,dead,present:c.initialCount-sold-dead,
   margin:revenue-cost,forecastCost,forecastSales,forecastMargin:forecastSales-forecastCost,
   budget:sum(Object.values(c.budget)),remaining:sum(Object.values(c.remaining)),
   day:daysBetween(c.startDate,at)+1,expenses,sales,uses,losses};
}
export function farm(s){
 const paid=sum(s.expenses.map(x=>x.paid))+sum(s.lots.map(x=>x.paid));
 const receipts=sum(s.sales.map(x=>x.received)),funding=sum(s.contributions.map(x=>x.amount));
 return {cash:s.settings.openingCash+funding+receipts-paid,
  payable:sum(s.expenses.map(x=>x.amount-x.paid))+sum(s.lots.map(x=>x.total-x.paid)),
  receivable:sum(s.sales.map(x=>x.quantity*x.unitPrice-x.received)),
  stockKg:sum(stock(s).map(x=>x.leftKg)),stockValue:sum(stock(s).map(x=>x.leftValue)),paid,receipts,funding};
}
export function validate(s,at=today()){
 must(s&&s.version===2,"Format de sauvegarde incompatible.");
 must(typeof s.demo==="boolean","Mode de données invalide.");
 must(s.settings&&typeof s.settings==="object","Paramètres absents.");
 name(s.settings.farmName,"Nom de la ferme");num(s.settings.openingCash,"Trésorerie initiale", -1e12);num(s.settings.stockThresholdKg,"Seuil de stock",0,false);
 const lists=["cycles","expenses","lots","uses","sales","losses","contributions"],ids=new Set();
 for(const k of lists){must(Array.isArray(s[k])&&s[k].length<=20000,"Liste "+k+" invalide.");for(const x of s[k]){must(x&&typeof x==="object","Ligne invalide.");name(x.id,"Identifiant");must(!ids.has(x.id),"Identifiant en double.");ids.add(x.id);}}
 must(s.selectedCycleId===null||s.cycles.some(c=>c.id===s.selectedCycleId),"Cycle sélectionné inconnu.");
 for(const c of s.cycles){
  name(c.name,"Nom du cycle");date(c.startDate,"Début");num(c.targetDays,"Durée",1);must(c.targetDays<=730,"Durée maximale : 730 jours.");num(c.initialCount,"Effectif",1);
  for(const key of ["budget","remaining"]){must(c[key]&&typeof c[key]==="object","Budget absent.");for(const k of KEYS)num(c[key][k],CATEGORIES[k]);}
  for(const k of ["targetSales","remainingSales","targetMargin"])num(c[k],k,k==="targetMargin"?-1e12:0);
  if(c.params){plan({...c.params,initialCount:c.initialCount,budget:c.budget});}
  must(c.closedAt===null||typeof c.closedAt==="string","Statut du cycle invalide.");
  if(c.closedAt){date(c.closedAt,"Clôture");must(c.closedAt<=at&&c.closedAt>=c.startDate,"Date de clôture invalide.");}
 }
 const actualDate=x=>{date(x.date,"Date");must(x.date<=at,"Une opération réelle ne peut pas être datée dans le futur.");};
 const linked=(x,afterStart=true)=>{
  actualDate(x);const c=s.cycles.find(c=>c.id===x.cycleId);must(c,"Cycle introuvable.");
  if(afterStart)must(x.date>=c.startDate,"Date antérieure au début du cycle.");
  if(c.closedAt)must(x.date<=c.closedAt,"Opération après la clôture.");return c;
 };
 for(const x of s.expenses){linked(x,false);must(KEYS.includes(x.category)&&x.category!=="aliments","Pour les aliments, utilisez le stock puis la consommation.");name(x.label,"Libellé");num(x.amount,"Montant",1);num(x.paid,"Montant payé");must(x.paid<=x.amount,"Paiement supérieur à la dépense.");num(x.forecastUsed,"Part du budget consommée");if(x.dueDate)date(x.dueDate,"Échéance");}
 for(const l of s.lots){actualDate(l);name(l.name,"Nom du lot");num(l.kg,"Quantité",0.01,false);must(Math.abs(l.kg*100-Math.round(l.kg*100))<1e-5,"Deux décimales maximum pour les kg.");num(l.total,"Coût du lot",1);num(l.paid,"Paiement");must(l.paid<=l.total,"Paiement supérieur à l’achat.");if(l.dueDate)date(l.dueDate,"Échéance");}
 for(const u of s.uses){linked(u);const l=s.lots.find(l=>l.id===u.lotId);must(l,"Lot introuvable.");must(u.date>=l.date,"Consommation avant l’achat.");num(u.kg,"Quantité",0.01,false);must(Math.abs(u.kg*100-Math.round(u.kg*100))<1e-5,"Deux décimales maximum pour les kg.");num(u.forecastUsed,"Part du budget consommée");}
 for(const x of s.sales){linked(x);name(x.client,"Client");num(x.quantity,"Nombre vendu",1);num(x.unitPrice,"Prix unitaire",1);num(x.received,"Montant encaissé");num(x.forecastUsed,"Prévision réalisée");must(x.received<=x.quantity*x.unitPrice,"Encaissement supérieur à la vente.");}
 for(const x of s.losses){linked(x);num(x.count,"Nombre de pertes",1);must(typeof x.reason==="string"&&x.reason.length<=200,"Motif invalide.");}
 for(const x of s.contributions){actualDate(x);num(x.amount,"Apport",1);name(x.label,"Libellé");}
 for(const l of stock(s))must(l.leftKg>=-0.001,"Consommation supérieure au stock du lot.");
 for(const c of s.cycles){
  const m=metrics(s,c.id,at);must(m.present>=0,"Ventes et pertes supérieures à l’effectif.");
  if(c.closedAt){must(m.present===0,"Des poulets sont encore présents.");must(c.remainingSales===0&&m.remaining===0,"Les prévisions restantes doivent être soldées avant clôture.");}
 }
 return s;
}
export function apply(s,action,at=today()){
 const n=clone(s),d=clone(action.data||{}),c=n.cycles.find(x=>x.id===(d.cycleId||n.selectedCycleId));
 const open=()=>{must(c,"Créez ou sélectionnez un cycle.");must(!c.closedAt,"Ce cycle est clôturé.");};
 const base=()=>({id:d.id||uid(),cycleId:c.id,date:d.date||at});
 const take=(k,amount,enabled)=>{const used=enabled?Math.min(c.remaining[k],amount):0;c.remaining[k]-=used;return used;};
 switch(action.type){
 case "settings":n.settings={...n.settings,...d};break;
 case "select":must(n.cycles.some(x=>x.id===d.id),"Cycle inconnu.");n.selectedCycleId=d.id;break;
 case "cycle":{
  const p=plan(d);const x={id:d.id||uid(),name:d.name,startDate:d.startDate,targetDays:d.targetDays,initialCount:d.initialCount,
    params:{expectedMortality:d.expectedMortality,expectedPrice:d.expectedPrice,chickPrice:d.chickPrice,feedBags:d.feedBags,bagPrice:d.bagPrice,bagKg:d.bagKg},
    budget:p.budget,remaining:clone(p.budget),targetSales:p.targetSales,remainingSales:p.targetSales,targetMargin:d.targetMargin,closedAt:null};
  n.cycles.push(x);n.selectedCycleId=x.id;break;
 }
 case "revise":open();c.remaining=d.remaining;c.remainingSales=d.remainingSales;c.targetMargin=d.targetMargin;break;
 case "expense":open();n.expenses.push({...base(),category:d.category,label:d.label,supplier:d.supplier||"",amount:d.amount,paid:d.paid,dueDate:d.dueDate||null,forecastUsed:take(d.category,d.amount,d.planned)});break;
 case "lot":n.lots.push({id:d.id||uid(),date:d.date||at,name:d.name,supplier:d.supplier||"",kg:d.kg,total:d.total,paid:d.paid,dueDate:d.dueDate||null});break;
 case "use":{
  open();const u={...base(),lotId:d.lotId,kg:d.kg,forecastUsed:0};n.uses.push(u);
  const cost=feedCosts(n).costs[u.id];u.forecastUsed=take("aliments",cost,d.planned);break;
 }
 case "sale":{
  open();const total=d.quantity*d.unitPrice,used=d.planned?Math.min(c.remainingSales,total):0;c.remainingSales-=used;
  n.sales.push({...base(),client:d.client,quantity:d.quantity,unitPrice:d.unitPrice,received:d.received,forecastUsed:used});break;
 }
 case "loss":open();n.losses.push({...base(),count:d.count,reason:d.reason||""});break;
 case "contribution":n.contributions.push({id:d.id||uid(),date:d.date||at,label:d.label,amount:d.amount});break;
 case "payment":{
  must(["expenses","lots","sales"].includes(d.list),"Type de paiement invalide.");
  const x=n[d.list].find(x=>x.id===d.id);must(x,"Opération inconnue.");num(d.amount,"Paiement",1);
  if(d.list==="sales")x.received+=d.amount;else x.paid+=d.amount;break;
 }
 case "close":open();c.closedAt=at;break;
 case "delete":{
  must(["expenses","sales","losses","uses"].includes(d.list),"Suppression non prise en charge.");
  const x=n[d.list].find(x=>x.id===d.id);must(x,"Opération inconnue.");const owner=n.cycles.find(c=>c.id===x.cycleId);must(!owner.closedAt,"Ce cycle est clôturé.");
  if(d.list==="expenses")owner.remaining[x.category]+=x.forecastUsed;
  if(d.list==="uses")owner.remaining.aliments+=x.forecastUsed;
  if(d.list==="sales")owner.remainingSales+=x.forecastUsed;
  n[d.list]=n[d.list].filter(y=>y.id!==x.id);break;
 }
 default:throw Error("Action inconnue.");
 }
 return validate(n,at);
}
export function alerts(s,id,at=today()){
 const a=[],m=metrics(s,id,at),f=farm(s);
 if(m){
  if(m.forecastCost>m.budget)a.push({tone:"warn",title:"Budget à revoir",text:"Le coût final prévu dépasse le budget de départ."});
  if(m.forecastMargin<m.cycle.targetMargin)a.push({tone:"warn",title:"Objectif de bénéfice",text:"Le bénéfice prévu est inférieur à votre objectif."});
  if(m.day>m.cycle.targetDays&&!m.cycle.closedAt)a.push({tone:"warn",title:"Cycle arrivé à terme",text:"Vérifiez les ventes et les charges restant à engager."});
 }
 if(f.cash<0)a.push({tone:"danger",title:"Trésorerie négative",text:"Les décaissements dépassent l’argent disponible."});
 if(f.stockKg<=s.settings.stockThresholdKg)a.push({tone:"warn",title:"Stock à surveiller",text:"Le stock d’aliments a atteint votre seuil."});
 for(const x of [...s.expenses,...s.lots])if((x.amount??x.total)>x.paid&&x.dueDate&&daysBetween(at,x.dueDate)<=2)a.push({tone:"warn",title:"Paiement à prévoir",text:(x.label||x.name)+" · échéance "+x.dueDate});
 return a;
}
export function csv(s){
 const cell=v=>{let t=String(v??"");if(/^[\s]*[=+\-@]/.test(t))t="'"+t;return '"'+t.replaceAll('"','""')+'"';};
 const rows=[["Type","Date","Cycle","Libellé","Montant FCFA","Payé / encaissé FCFA","Quantité","Unité"]];
 const cname=id=>s.cycles.find(c=>c.id===id)?.name||"Stock commun";
 s.expenses.forEach(x=>rows.push(["Dépense",x.date,cname(x.cycleId),x.label,x.amount,x.paid,"",""]));
 s.lots.forEach(x=>rows.push(["Achat aliments",x.date,"Stock commun",x.name,x.total,x.paid,x.kg,"kg"]));
 const {costs}=feedCosts(s);s.uses.forEach(x=>rows.push(["Consommation",x.date,cname(x.cycleId),s.lots.find(l=>l.id===x.lotId)?.name,costs[x.id],"",x.kg,"kg"]));
 s.sales.forEach(x=>rows.push(["Vente",x.date,cname(x.cycleId),x.client,x.quantity*x.unitPrice,x.received,x.quantity,"poulets"]));
 s.losses.forEach(x=>rows.push(["Perte",x.date,cname(x.cycleId),x.reason,"","",x.count,"poulets"]));
 s.contributions.forEach(x=>rows.push(["Apport",x.date,"Ferme",x.label,x.amount,x.amount,"",""]));
 return "\uFEFF"+rows.map(r=>r.map(cell).join(";")).join("\r\n");
}
export function demo(at=today()){
 let s=blank();s.demo=true;s.settings={farmName:"Ferme des Acacias · exemple",openingCash:1000000,stockThresholdKg:100};
 s=apply(s,{type:"cycle",data:{id:"demo-cycle",name:"Bande 01 · exemple",startDate:addDays(at,-22),targetDays:45,initialCount:300,expectedMortality:3,expectedPrice:4000,chickPrice:700,feedBags:20,bagPrice:20000,bagKg:50,targetMargin:300000,budget:{sante:35000,litiere:20000,energie:40000,transport:25000,travail:50000}}},at);
 for(const d of [{id:"demo-chicks",category:"poussin",label:"300 poussins",amount:210000,paid:210000},{id:"demo-health",category:"sante",label:"Premier suivi sanitaire",amount:25000,paid:25000},{id:"demo-energy",category:"energie",label:"Eau et chauffage",amount:15000,paid:15000}])s=apply(s,{type:"expense",data:{...d,planned:true,date:addDays(at,-20)}},at);
 s=apply(s,{type:"lot",data:{id:"demo-feed",name:"Aliment croissance · 10 sacs",kg:500,total:200000,paid:150000,date:addDays(at,-20),dueDate:addDays(at,2)}},at);
 s=apply(s,{type:"use",data:{id:"demo-use",lotId:"demo-feed",kg:250,planned:true,date:addDays(at,-1)}},at);
 s=apply(s,{type:"loss",data:{id:"demo-loss",count:6,reason:"Exemple",date:addDays(at,-2)}},at);
 return s;
}
