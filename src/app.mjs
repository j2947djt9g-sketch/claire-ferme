import {CATEGORIES,KEYS,today,uid,sum,zero,blank,plan,metrics,farm,stock,feedCosts,validate,apply,alerts,csv,demo,addDays,daysBetween} from "./domain.mjs";
const $=s=>document.querySelector(s),esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money=n=>new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0}).format(n)+" F";
const qty=n=>new Intl.NumberFormat("fr-FR",{maximumFractionDigits:2}).format(n);
const niceDate=d=>new Intl.DateTimeFormat("fr-FR",{day:"numeric",month:"short",year:"numeric"}).format(new Date(d+"T12:00:00"));
const STORE="clair.ferme.v2",DEMO="clair.ferme.demo.v2";
let state=blank(),page="home",mode="real",loadError=null,lastSaved=null,pendingImport=null,toastTimer,savedRaw=null;
const icons={
home:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
journal:'<path d="M8 3H5v18h14V3h-3M8 3v4h8V3zM8 12h8M8 16h5"/>',
stock:'<path d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10M7 5l10 4"/>',
cycles:'<path d="M20 8a8 8 0 0 0-14-2L3 9m0-6v6h6M4 16a8 8 0 0 0 14 2l3-3m0 6v-6h-6"/>',
settings:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
leaf:'<path d="M20 3C8 1 1 8 6 15c7 5 14-2 14-12ZM4 21 16 9"/>',
check:'<path d="m5 12 4 4L19 6"/>',
close:'<path d="m6 6 12 12M18 6 6 18"/>'
};
const icon=(key,cls="")=>'<svg class="icon '+cls+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[key]||icons.journal)+'</svg>';
const btn=(text,action,cls="button",extra="")=>'<button type="button" class="'+cls+'" data-action="'+action+'" '+extra+'>'+text+'</button>';
const status=c=>c.closedAt?"Clôturé":today()<c.startDate?"À venir":"En cours";
const badge=(text,tone="")=>'<span class="badge '+tone+'">'+esc(text)+'</span>';
function toast(t){clearTimeout(toastTimer);$("#toast").textContent=t;$("#toast").classList.add("visible");toastTimer=setTimeout(()=>$("#toast").classList.remove("visible"),4500);}
function save(next){
 validate(next);
 const key=mode==="demo"?DEMO:STORE;
 let raw;
 try{raw=localStorage.getItem(key);}catch{throw Error("Le stockage de ce navigateur est indisponible. Autorisez le stockage local pour conserver vos saisies.");}
 if(raw!==savedRaw)throw Error("Les données ont changé dans un autre onglet. Rechargez la page avant de continuer pour conserver ces modifications.");
 const serialized=JSON.stringify(next);
 try{localStorage.setItem(key,serialized);}
 catch{throw Error("La sauvegarde sur cet appareil a échoué. Libérez de l’espace ou exportez vos données avant de continuer.");}
 savedRaw=serialized;loadError=null;state=next;lastSaved=new Date();render();
}
function perform(type,data){save(apply(state,{type,data}));toast("Enregistré sur cet appareil.");}
function load(){
 try{const raw=localStorage.getItem(STORE);savedRaw=raw;state=raw?validate(JSON.parse(raw)):blank();}
 catch(e){loadError=e.message;state=blank();}
}
const field=(label,name,value="",type="number",extra="")=>'<label class="field"><span>'+label+'</span><input name="'+name+'" type="'+type+'" value="'+esc(value)+'" '+(type==="number"?'min="0" step="1" inputmode="numeric" ':'')+extra+'></label>';
const dateField=(name="date",value=today())=>field("Date",name,value,"date",'required max="'+today()+'"');
const select=(label,name,options,extra="")=>'<label class="field"><span>'+label+'</span><select aria-label="'+esc(label)+'" name="'+name+'" '+extra+'>'+options+'</select></label>';
const option=(value,label,selected=false)=>'<option value="'+esc(value)+'"'+(selected?" selected":"")+'>'+esc(label)+'</option>';
const check=(name,text,checked=true)=>'<label class="check"><input type="checkbox" name="'+name+'" '+(checked?"checked":"")+'><span>'+text+'</span></label>';
const note=t=>'<p class="helper">'+t+'</p>';
const empty=(title,text,button="")=>'<div class="empty">'+icon("leaf")+'<h3>'+title+'</h3><p>'+text+'</p>'+button+'</div>';
const table=(headers,rows)=>'<div class="table-wrap" tabindex="0" role="region" aria-label="Tableau défilant"><table><thead><tr>'+headers.map(h=>'<th scope="col">'+h+'</th>').join("")+'</tr></thead><tbody>'+rows.join("")+'</tbody></table></div>';
const tr=cells=>"<tr>"+cells.map(c=>"<td>"+c+"</td>").join("")+"</tr>";
function header(eyebrow,title,subtitle,actions=""){
 return '<div class="page-head"><div><p class="eyebrow">'+eyebrow+'</p><h1>'+title+'</h1><p class="subtitle">'+subtitle+'</p></div><div class="head-actions">'+actions+'</div></div>';
}
function render(){
 const root=$("#app");
 if(loadError){root.innerHTML='<main class="welcome"><div class="welcome-card"><div class="brand-mark">c.</div><h1>Retrouvons vos données</h1><p>La sauvegarde présente ne peut pas être ouverte. Elle a été conservée.</p><p class="form-error">'+esc(loadError)+'</p><div class="actions">'+btn("Télécharger la sauvegarde présente","raw-backup")+btn("Importer une sauvegarde","import","button secondary")+btn("Recommencer","reset-corrupt","button text")+'</div></div></main>';return;}
 if(!state.cycles.length){root.innerHTML=welcome();return;}
 const c=state.cycles.find(c=>c.id===state.selectedCycleId)||state.cycles[0];
 const nav=[["home","Vue d’ensemble"],["journal","Opérations"],["stock","Aliments"],["cycles","Cycles et budgets"],["settings","Sauvegarde"]];
 root.innerHTML='<aside class="sidebar"><a href="#home" class="brand" data-page="home"><span class="brand-mark">c.</span><span>clair<span class="brand-sub">FERME</span></span></a><div class="farm-name">'+icon("leaf")+'<span>'+esc(state.settings.farmName)+'</span></div><p class="nav-label">MON EXPLOITATION</p><nav aria-label="Navigation principale">'+nav.map(([id,label])=>'<button class="nav-item '+(page===id?"active":"")+'" data-page="'+id+'" '+(page===id?'aria-current="page"':"")+'>'+icon(id)+'<span>'+label+'</span></button>').join("")+'</nav><div class="sidebar-bottom"><span class="live-dot"></span> '+(mode==="demo"?"Exemple fictif":"Vos données, sur cet appareil")+'<p>Un cycle après l’autre.<br>Une ferme au clair.</p></div></aside><div class="workspace"><header class="topbar"><span class="top-label">Votre ferme, au clair.</span><label class="cycle-picker"><span class="sr-only">Cycle affiché</span>'+icon("cycles")+'<select id="cycle-picker" aria-label="Cycle affiché">'+state.cycles.map(x=>option(x.id,x.name+" · "+status(x),x.id===c.id)).join("")+'</select></label><span class="saved">'+icon("check")+' '+(lastSaved?"Enregistré":"Sauvegarde locale")+'</span></header>'+(mode==="demo"?'<div class="demo-banner"><strong>Mode exemple</strong> · Ces chiffres sont fictifs. '+btn("Passer à mes données","real","button text")+'</div>':"")+'<main id="main" tabindex="-1">'+({home:home,journal:journal,stock:stockPage,cycles:cyclesPage,settings:settingsPage}[page]||home)(c)+'</main><footer class="footer">Clair Ferme <span>Montants en FCFA · '+esc(state.settings.farmName)+'</span></footer></div>';
}
function welcome(){
 return '<main id="main" class="welcome"><div class="welcome-intro"><a class="brand" href="#"><span class="brand-mark">c.</span><span>clair<span class="brand-sub">FERME</span></span></a><p class="eyebrow">MOINS DE FLOU. PLUS DE VISIBILITÉ.</p><h1>Votre ferme.<br>Vos chiffres.<br><em>Au clair.</em></h1><p>Préparez votre cycle, notez vos dépenses et gardez le cap sur votre objectif.</p><div class="welcome-proof"><span>01 · Prévoir</span><span>02 · Suivre</span><span>03 · Ajuster</span></div></div><div class="welcome-card"><span class="step-tag">BIENVENUE CHEZ VOUS</span><h2>Commençons par votre ferme.</h2><p>Choisissez la durée de votre premier cycle, votre effectif et votre budget. Rien n’est imposé.</p><div class="feature-line">'+icon("cycles")+'<div><strong>Un budget par cycle</strong><span>45 jours, 60 jours… à vous de choisir.</span></div></div><div class="feature-line">'+icon("journal")+'<div><strong>Le réel, au fil des jours</strong><span>Achats, aliments, pertes et ventes.</span></div></div><div class="feature-line">'+icon("check")+'<div><strong>Des saisies conservées</strong><span>Sur cet appareil, avec export de sauvegarde.</span></div></div>'+btn("Configurer mon premier cycle "+icon("arrow"),"setup","button full")+'<div class="welcome-links">'+btn("Voir un exemple","demo","button text")+btn("Importer mes données","import","button text")+'</div><small>Les hypothèses du budget n’enregistrent aucun achat réel.</small></div></main>';
}
function stat(label,value,detail,tone="",symbol=""){
 return '<article class="stat '+tone+'"><div class="stat-label">'+label+(symbol?icon(symbol):"")+'</div><strong>'+value+'</strong><span>'+detail+'</span></article>';
}
function home(c){
 const m=metrics(state,c.id),f=farm(state),a=alerts(state,c.id).slice(0,3),progress=Math.max(0,Math.min(100,m.day/c.targetDays*100));
 return header("TABLEAU DE BORD","Chaque cycle compte.","Vos décisions commencent avec des chiffres clairs.",btn(icon("plus")+" Saisir une opération","quick"))+
 '<section class="cycle-banner"><div><span class="eyebrow">LE CYCLE SÉLECTIONNÉ</span><h2>'+esc(c.name)+'</h2><p>'+niceDate(c.startDate)+' <span>→</span> '+niceDate(addDays(c.startDate,c.targetDays-1))+'</p></div><div class="cycle-progress"><div><strong>'+(c.closedAt?"Cycle clôturé":m.day<=0?"Démarre bientôt":"Jour "+m.day+' <span>/ '+c.targetDays+"</span>")+'</strong>'+badge(status(c),"green")+'</div><progress max="100" value="'+progress+'">'+qty(progress)+' %</progress><p>'+qty(m.present)+' poulets présents · '+qty(m.dead)+' pertes · '+qty(m.sold)+' vendus</p></div></section>'+
 '<section class="stats" aria-label="Chiffres clés">'+stat("Trésorerie de la ferme",money(f.cash),"Tous cycles · argent disponible",f.cash<0?"negative":"", "home")+stat("Coût engagé du cycle",money(m.cost),"Dont aliments consommés : "+money(m.actual.aliments),"","journal")+stat(c.closedAt?"Résultat du cycle":"Bénéfice final prévu",money(c.closedAt?m.margin:m.forecastMargin),c.closedAt?"Ventes − charges du cycle":"Objectif : "+money(c.targetMargin),m.forecastMargin<c.targetMargin?"warn":"accent","leaf")+stat("Poulets présents",qty(m.present),qty(m.sold)+" vendus · "+qty(m.dead)+" pertes","","cycles")+'</section>'+
 '<div class="dashboard-grid"><section class="card"><div class="card-head"><div><p class="eyebrow">LE CAP DU CYCLE</p><h2>Budget & réalité</h2></div>'+btn("Ajuster la suite "+icon("arrow"),"revise","button text")+'</div>'+budgetTable(c,m)+note("Le prévu à la fin = déjà engagé + reste à engager. Les aliments achetés entrent dans le coût du cycle lors de leur consommation.")+'</section><aside class="card"><p class="eyebrow">À GARDER EN VUE</p><h2>Vos repères</h2>'+(a.length?a.map(x=>'<div class="alert '+x.tone+'"><strong>'+esc(x.title)+'</strong><p>'+esc(x.text)+'</p></div>').join(""):'<div class="all-clear">'+icon("check")+'<h3>Vous gardez le cap.</h3><p>Aucune alerte sur vos chiffres actuels.</p></div>')+'<div class="mini-total"><span>À encaisser · ferme</span><strong>'+money(f.receivable)+'</strong></div><div class="mini-total"><span>À payer · ferme</span><strong>'+money(f.payable)+'</strong></div></aside></div>'+
 '<section class="card quick-card"><div><p class="eyebrow">AU FIL DES JOURS</p><h2>Une nouvelle opération ?</h2></div><div class="actions">'+btn("Dépense","expense","button secondary")+btn("Aliments consommés","use","button secondary")+btn("Vente","sale","button secondary")+btn("Perte","loss","button text")+'</div></section>'+
 '<section class="card"><div class="card-head"><h2>Dernières opérations</h2>'+btn("Tout voir "+icon("arrow"),"go-journal","button text")+'</div>'+operations(c,5)+'</section>';
}
function budgetTable(c,m){
 const rows=KEYS.filter(k=>c.budget[k]||m.actual[k]||c.remaining[k]).map(k=>tr([esc(CATEGORIES[k]),money(c.budget[k]),money(m.actual[k]),money(c.remaining[k]),'<strong>'+money(m.actual[k]+c.remaining[k])+'</strong>']));
 if(!rows.length)return empty("Votre budget commence ici","Ajustez les dépenses à venir pour construire votre prévision.",btn("Ajuster le budget","revise"));
 rows.push('<tr class="total"><td>Total charges</td><td>'+money(m.budget)+'</td><td>'+money(m.cost)+'</td><td>'+money(m.remaining)+'</td><td>'+money(m.forecastCost)+'</td></tr>');
 rows.push('<tr><td>Ventes</td><td>'+money(c.targetSales)+'</td><td>'+money(m.revenue)+'</td><td>'+money(c.remainingSales)+'</td><td>'+money(m.forecastSales)+'</td></tr>');
 return table(["Poste","Départ","Réel","Reste prévu","Fin prévue"],rows)+'<div class="budget-result"><span>Écart de charges au budget initial</span><strong class="'+(m.forecastCost>m.budget?"text-danger":"text-green")+'">'+(m.forecastCost>m.budget?"+":"")+money(m.forecastCost-m.budget)+'</strong></div>';
}
function operations(c,limit=200){
 const costs=feedCosts(state).costs;
 const rows=[
 ...state.expenses.filter(x=>x.cycleId===c.id).map(x=>({...x,list:"expenses",type:"Dépense",title:x.label,amount:x.amount,balance:x.amount-x.paid})),
 ...state.sales.filter(x=>x.cycleId===c.id).map(x=>({...x,list:"sales",type:"Vente",title:x.client+" · "+x.quantity+" poulets",amount:x.quantity*x.unitPrice,balance:x.quantity*x.unitPrice-x.received})),
 ...state.uses.filter(x=>x.cycleId===c.id).map(x=>({...x,list:"uses",type:"Consommation",title:qty(x.kg)+" kg · "+(state.lots.find(l=>l.id===x.lotId)?.name||""),amount:costs[x.id],balance:0})),
 ...state.losses.filter(x=>x.cycleId===c.id).map(x=>({...x,list:"losses",type:"Perte",title:x.count+" poulet(s) · "+x.reason,amount:null,balance:0}))
 ].sort((a,b)=>b.date.localeCompare(a.date));
 if(!rows.length)return empty("Le suivi commence avec vous","Saisissez votre première dépense ou la première opération de ce cycle.",btn("Ajouter une opération","quick"));
 return table(["Date","Opération","Détail","Montant","Règlement",""],rows.slice(0,limit).map(x=>tr([niceDate(x.date),badge(x.type),esc(x.title),x.amount===null?"—":money(x.amount),x.balance?'<span class="text-amber">'+money(x.balance)+' à '+(x.list==="sales"?"encaisser":"payer")+'</span>':x.list==="sales"||x.list==="expenses"?badge("Soldé","green"):"—",'<div class="row-actions">'+(x.balance?btn(x.list==="sales"?"Encaisser":"Payer","payment","button small secondary",'data-list="'+x.list+'" data-id="'+esc(x.id)+'"'):"")+(!c.closedAt?btn("Corriger","correct","button small text",'data-list="'+x.list+'" data-id="'+esc(x.id)+'"'):"")+'</div>'])));
}
function journal(c){
 const m=metrics(state,c.id);
 return header("OPÉRATIONS","Le réel, au jour le jour.","Chaque saisie met à jour votre trésorerie et votre cycle.",btn(icon("plus")+" Ajouter","quick"))+
 '<div class="actions action-strip">'+btn("Dépense","expense","button secondary")+btn("Vente","sale","button secondary")+btn("Perte de poulets","loss","button secondary")+btn("Apport de trésorerie","contribution","button text")+'</div>'+
 '<section class="stats three">'+stat("Charges engagées",money(m.cost),"Coût des aliments consommés inclus")+stat("Ventes réalisées",money(m.revenue),money(sum(m.sales.map(x=>x.received)))+" déjà encaissés")+stat("Résultat à date",money(m.margin),c.closedAt?"Cycle clôturé":"Provisoire · le cycle continue",m.margin<0?"warn":"")+'</section><section class="card"><div class="card-head"><h2>Journal du cycle</h2>'+badge(c.name)+'</div>'+operations(c)+'</section>';
}
function stockPage(){
 const lots=stock(state),f=farm(state);
 return header("STOCK COMMUN","De l’achat à la mangeoire.","Achetez pour la ferme, affectez les consommations à chaque cycle.",btn(icon("plus")+" Acheter des aliments","lot"))+
 '<section class="stats three">'+stat("Aliments disponibles",qty(f.stockKg)+" kg","Tous les lots de la ferme")+stat("Valeur du stock",money(f.stockValue),"Coût d’achat des aliments restants")+stat("Seuil d’alerte",qty(state.settings.stockThresholdKg)+" kg","Modifiable dans Sauvegarde")+'</section><section class="card"><div class="card-head"><div><p class="eyebrow">VOS LOTS</p><h2>Stock d’aliments</h2></div>'+btn("Enregistrer une consommation","use","button secondary")+'</div>'+(lots.length?table(["Lot / fournisseur","Achat","Disponible","Valeur restante","À payer",""],lots.map(l=>tr(['<strong>'+esc(l.name)+'</strong><small>'+esc(l.supplier)+'</small>',niceDate(l.date),qty(l.leftKg)+" / "+qty(l.kg)+" kg",money(l.leftValue),money(l.total-l.paid),l.paid<l.total?btn("Payer","payment","button small secondary",'data-list="lots" data-id="'+esc(l.id)+'"'):""]))):empty("Aucun aliment en stock","Enregistrez un achat, puis les quantités consommées par les poulets.",btn("Ajouter mon premier achat","lot")))+note("Un achat réduit la trésorerie pour sa part payée. Seuls les kilogrammes consommés deviennent une charge du cycle. Les lots sont valorisés à leur coût d’achat.")+'</section>'+
 '<section class="card"><h2>Consommations récentes</h2>'+(state.uses.length?table(["Date","Cycle","Lot","Quantité","Coût"],state.uses.slice().reverse().map(u=>tr([niceDate(u.date),esc(state.cycles.find(c=>c.id===u.cycleId)?.name),esc(state.lots.find(l=>l.id===u.lotId)?.name),qty(u.kg)+" kg",money(feedCosts(state).costs[u.id])]))):note("Vos consommations apparaîtront ici."))+'</section>';
}
function cyclesPage(c){
 const m=metrics(state,c.id);
 return header("CYCLES ET OBJECTIFS","Un cycle prépare le suivant.","Comparez vos résultats et construisez un budget adapté.",btn(icon("plus")+" Nouveau cycle","cycle"))+
 '<section class="cycle-cards">'+state.cycles.map(x=>{const z=metrics(state,x.id);return '<button class="cycle-tile '+(x.id===c.id?"selected":"")+'" data-action="select" data-id="'+esc(x.id)+'"><div>'+badge(status(x),x.closedAt?"":"green")+'<span>'+x.targetDays+' jours</span></div><h3>'+esc(x.name)+'</h3><p>'+niceDate(x.startDate)+'</p><div class="mini-total"><span>'+(x.closedAt?"Résultat":"Bénéfice prévu")+'</span><strong>'+money(x.closedAt?z.margin:z.forecastMargin)+'</strong></div></button>';}).join("")+'</section>'+
 '<section class="card"><div class="card-head"><div><p class="eyebrow">CYCLE SÉLECTIONNÉ</p><h2>'+esc(c.name)+'</h2></div><div class="actions">'+(!c.closedAt?btn("Ajuster les prévisions","revise","button secondary"):"")+btn("Préparer le suivant","next-cycle","button secondary")+'</div></div>'+budgetTable(c,m)+
 '<div class="result-grid"><div><span>Ventes réelles</span><strong>'+money(m.revenue)+'</strong></div><div><span>Charges réelles</span><strong>'+money(m.cost)+'</strong></div><div class="'+(m.margin<0?"text-danger":"text-green")+'"><span>Résultat à date</span><strong>'+money(m.margin)+'</strong></div><div><span>Objectif de bénéfice</span><strong>'+money(c.targetMargin)+'</strong></div></div>'+note("Les frais de location et autres frais fixes sont affectés au cycle choisi. Les investissements et amortissements restent en dehors de cette première version.")+
 (!c.closedAt?'<div class="close-row"><div><h3>Terminer ce cycle</h3><p>Après la dernière vente, soldez les prévisions restantes avant la clôture.</p></div>'+btn("Clôturer","close-cycle","button secondary")+'</div>':badge("Clôturé le "+niceDate(c.closedAt),"green"))+'</section>'+
 '<section class="card"><h2>Comparer les cycles</h2>'+table(["Cycle","Durée","Effectif initial","Pertes réelles","Ventes réelles","Charges réelles","Résultat réel"],state.cycles.map(x=>{const z=metrics(state,x.id);return tr([esc(x.name)+" "+badge(x.closedAt?"Final":"Provisoire"),x.targetDays+" j",qty(x.initialCount),qty(z.dead),money(z.revenue),money(z.cost),'<strong class="'+(z.margin<0?"text-danger":"")+'">'+money(z.margin)+'</strong>']);}))+'</section>';
}
function settingsPage(){
 const f=farm(state),debts=[...state.expenses.filter(x=>x.paid<x.amount).map(x=>({...x,list:"expenses",balance:x.amount-x.paid,title:x.label})),...state.lots.filter(x=>x.paid<x.total).map(x=>({...x,list:"lots",balance:x.total-x.paid,title:x.name})),...state.sales.filter(x=>x.received<x.quantity*x.unitPrice).map(x=>({...x,list:"sales",balance:x.quantity*x.unitPrice-x.received,title:x.client}))];
 return header("VOS DONNÉES","Tout garder, simplement.","Sauvegardez vos saisies et retrouvez ce qui reste à régler.")+
 '<div class="dashboard-grid"><section class="card"><p class="eyebrow">SAUVEGARDE ET TRANSFERT</p><h2>Vos données restent avec vous.</h2><p>Les saisies sont enregistrées dans ce navigateur, sur cet appareil. Exportez une sauvegarde pour les conserver ailleurs ou les transférer.</p><div class="actions">'+btn("Télécharger ma sauvegarde","backup")+btn("Importer une sauvegarde","import","button secondary")+btn("Exporter le journal CSV","csv","button text")+'</div><p class="helper">Le fichier JSON permet de restaurer l’application. Le CSV permet de consulter les opérations dans Excel. Pas de synchronisation entre appareils dans cette version.</p></section><section class="card"><h2>Ma ferme</h2><dl class="details"><dt>Nom</dt><dd>'+esc(state.settings.farmName)+'</dd><dt>Solde au départ</dt><dd>'+money(state.settings.openingCash)+'</dd><dt>Alerte aliments</dt><dd>'+qty(state.settings.stockThresholdKg)+' kg</dd></dl>'+btn("Modifier les paramètres","settings","button secondary")+'</section></div>'+
 '<section class="stats three">'+stat("Trésorerie actuelle",money(f.cash),"Solde de départ + encaissements − paiements")+stat("À encaisser",money(f.receivable),"Reste dû par les clients")+stat("À payer",money(f.payable),"Dépenses et achats d’aliments")+'</section>'+
 '<section class="card"><h2>Règlements à suivre</h2>'+(debts.length?table(["Opération","Échéance","Reste",""],debts.map(x=>tr([esc(x.title),x.dueDate?niceDate(x.dueDate):"Non renseignée",money(x.balance)+" "+(x.list==="sales"?"à encaisser":"à payer"),btn(x.list==="sales"?"Encaisser":"Payer","payment","button small secondary",'data-list="'+x.list+'" data-id="'+esc(x.id)+'"')]))):empty("Les règlements sont à jour.","Aucun paiement ni encaissement restant."))+'</section><section class="card"><div class="card-head"><h2>Apports de trésorerie</h2>'+btn("Ajouter un apport","contribution","button secondary")+'</div>'+note("Un apport augmente l’argent disponible. Il ne compte pas comme une vente ou un bénéfice.")+(state.contributions.length?table(["Date","Libellé","Montant"],state.contributions.slice().reverse().map(x=>tr([niceDate(x.date),esc(x.label),money(x.amount)]))):"")+'</section><div class="demo-link">'+(mode==="demo"?btn("Revenir à mes données","real","button text"):btn("Explorer un exemple fictif","demo","button text"))+'</div>';
}
function dialog(title,body,type,submit="Enregistrer"){
 const el=$("#dialog");el.innerHTML='<div class="dialog-head"><h2 id="dialog-title">'+title+'</h2>'+btn(icon("close"),"dismiss","icon-button",'aria-label="Fermer"')+'</div>'+(type?'<form data-form="'+type+'"><div class="dialog-body">'+body+'<p class="form-error" role="alert" hidden></p></div><div class="dialog-footer">'+btn("Annuler","dismiss","button text")+'<button type="submit" class="button">'+submit+'</button></div></form>':'<div class="dialog-body">'+body+'</div>');
 if(!el.open)el.showModal();
}
function closeDialog(){$("#dialog").close();}
function cycleBody(first=false,previous=null){
 const p=previous?.params||{},base=previous?.budget||zero();
 return (first?'<p class="intro">Vos hypothèses donnent un cap. Vous enregistrerez ensuite les achats, les pertes et les ventes réelles.</p><h3 class="form-section">Votre ferme</h3><div class="form-grid">'+field("Nom de la ferme","farmName",state.settings.farmName,"text",'required maxlength="200"')+field("Argent disponible au départ (FCFA)","openingCash",0,"number",'data-signed="true"')+'</div>':"")+
 '<h3 class="form-section">Le cycle</h3><div class="form-grid">'+field("Nom du cycle","name",previous?"Bande "+String(state.cycles.length+1).padStart(2,"0"):"Bande 01","text",'required maxlength="200"')+field("Date d’arrivée des poussins","startDate",previous?addDays(previous.startDate,previous.targetDays):today(),"date","required")+field("Durée du cycle (jours)","targetDays",previous?.targetDays||45,"number",'required max="730"')+field("Poussins au départ","initialCount",previous?.initialCount||"","number","required")+'</div>'+
 '<h3 class="form-section">Vos hypothèses de départ</h3><div class="form-grid">'+field("Prix d’un poussin (FCFA)","chickPrice",p.chickPrice??"","number","required")+field("Mortalité prévue (%)","expectedMortality",p.expectedMortality??3,"number",'required max="100" data-decimal="true"')+field("Prix de vente moyen / poulet (FCFA)","expectedPrice",p.expectedPrice??"","number","required")+field("Objectif de bénéfice (FCFA)","targetMargin",previous?.targetMargin??0,"number",'required data-signed="true"')+'</div>'+
 '<h3 class="form-section">Les aliments prévus</h3><div class="form-grid three">'+field("Nombre de sacs","feedBags",p.feedBags??"","number","required")+field("Prix du sac (FCFA)","bagPrice",p.bagPrice??"","number","required")+field("Poids d’un sac (kg)","bagKg",p.bagKg??50,"number",'required data-decimal="true"')+'</div>'+
 '<details class="budget-details" open><summary>Autres charges prévues pour ce cycle</summary><div class="form-grid">'+KEYS.filter(k=>!["poussin","aliments"].includes(k)).map(k=>field(CATEGORIES[k]+" (FCFA)","budget_"+k,base[k]||0,"number","required")).join("")+'</div></details>'+
 '<div id="plan-preview" class="plan-preview" aria-live="polite">Renseignez vos hypothèses pour calculer le budget.</div>'+note("Les montants sont des prévisions : aucune dépense ni vente réelle n’est créée. Vous pourrez ajuster le reste à engager pendant le cycle.");
}
function moneyPaid(totalLabel="Montant total (FCFA)",totalName="amount"){
 return field(totalLabel,totalName,"","number","required")+check("fullyPaid","Entièrement payé",true)+'<div class="conditional" data-if="fullyPaid" hidden>'+field("Déjà payé (FCFA)","paid",0,"number")+field("Échéance du reste (facultative)","dueDate","","date")+'</div>';
}
function actionForm(kind,data={}){
 const c=state.cycles.find(c=>c.id===state.selectedCycleId),m=c?metrics(state,c.id):null;
 if(["expense","use","sale","loss","revise"].includes(kind)&&(!c||c.closedAt)){toast(c?"Ce cycle est clôturé. Sélectionnez un cycle ouvert.":"Configurez d’abord un cycle.");return;}
 if(kind==="setup"||kind==="cycle"||kind==="next-cycle"){dialog(kind==="setup"?"Votre premier cycle":kind==="next-cycle"?"Préparer le cycle suivant":"Créer un cycle",cycleBody(kind==="setup",kind==="next-cycle"?c:null),kind==="setup"?"setup":"cycle","Créer mon cycle");fixNumberAttrs();updatePlan();return;}
 if(kind==="quick"){dialog("Qu’allez-vous enregistrer ?",'<div class="quick-options">'+[["expense","Dépense","Poussins, soins, énergie, location…"],["lot","Achat d’aliments","Ajouter un lot au stock commun"],["use","Aliments consommés","Affecter des kg à ce cycle"],["sale","Vente de poulets","Quantité, prix et encaissement"],["loss","Perte de poulets","Actualiser l’effectif présent"]].map(([a,t,d])=>'<button class="quick-option" data-action="'+a+'"><strong>'+t+'</strong><span>'+d+'</span>'+icon("arrow")+'</button>').join("")+'</div>');return;}
 if(kind==="expense"){
  dialog("Enregistrer une dépense",note("Cycle : "+esc(c.name))+'<div class="form-grid">'+field("Libellé","label","","text",'required maxlength="200"')+select("Poste","category",KEYS.filter(k=>k!=="aliments").map(k=>option(k,CATEGORIES[k])).join(""))+dateField()+field("Fournisseur (facultatif)","supplier","","text",'maxlength="200"')+'</div><div class="form-grid">'+moneyPaid()+'</div>'+check("planned","Cette dépense était déjà prévue dans le budget")+note("Si elle était prévue, elle réduit le reste à engager. Décochez pour une dépense imprévue."),"expense");return;
 }
 if(kind==="lot"){
  dialog("Acheter des aliments",note("Cet achat entre dans le stock commun à tous les cycles.")+'<div class="form-grid">'+field("Nom du lot","name","","text",'required maxlength="200"')+field("Fournisseur (facultatif)","supplier","","text",'maxlength="200"')+dateField()+field("Nombre de sacs","bags","","number","required")+field("Poids d’un sac (kg)","bagKg",c?.params?.bagKg||50,"number",'required data-decimal="true"')+field("Prix par sac (FCFA)","bagPrice","","number","required")+'</div><div id="lot-preview" class="plan-preview">Le total sera calculé automatiquement.</div>'+check("fullyPaid","Entièrement payé")+'<div class="conditional form-grid" data-if="fullyPaid" hidden>'+field("Déjà payé (FCFA)","paid",0)+field("Échéance du reste (facultative)","dueDate","","date")+'</div>',"lot");fixNumberAttrs();return;
 }
 if(kind==="use"){
  const available=stock(state).filter(l=>l.leftKg>0);
  if(!available.length){toast("Ajoutez d’abord un achat d’aliments au stock.");return;}
  dialog("Noter les aliments consommés",note("Cycle : "+esc(c.name))+'<div class="form-grid">'+select("Lot utilisé","lotId",available.map(l=>option(l.id,l.name+" · "+qty(l.leftKg)+" kg disponibles")).join(""))+field("Quantité consommée (kg)","kg","","number",'required data-decimal="true"')+dateField()+'</div>'+check("planned","Cette consommation était prévue dans le budget"),"use");fixNumberAttrs();return;
 }
 if(kind==="sale"){
  dialog("Enregistrer une vente",note(qty(m.present)+" poulets présents dans "+esc(c.name))+'<div class="form-grid">'+field("Client","client","","text",'required maxlength="200"')+dateField()+field("Nombre de poulets","quantity","","number",'required max="'+m.present+'"')+field("Prix par poulet (FCFA)","unitPrice",c.params?.expectedPrice||"","number","required")+'</div><div id="sale-preview" class="plan-preview">Le total sera calculé automatiquement.</div>'+check("fullyReceived","Entièrement encaissé")+'<div class="conditional" data-if="fullyReceived" hidden>'+field("Déjà encaissé (FCFA)","received",0)+'</div>'+check("planned","Cette vente fait partie du chiffre d’affaires prévu"),"sale");return;
 }
 if(kind==="loss"){
  dialog("Déclarer une perte",note(qty(m.present)+" poulets présents. Cette saisie met à jour l’effectif ; elle ne crée pas de dépense.")+'<div class="form-grid">'+dateField()+field("Nombre de poulets perdus","count","","number",'required max="'+m.present+'"')+field("Motif (facultatif)","reason","","text",'maxlength="200"')+'</div>',"loss");return;
 }
 if(kind==="contribution"){
  dialog("Ajouter de l’argent à la ferme",note("Un apport augmente la trésorerie sans augmenter les ventes ni le bénéfice.")+'<div class="form-grid">'+field("Libellé","label","","text",'required maxlength="200"')+field("Montant (FCFA)","amount","","number","required")+dateField()+'</div>',"contribution");return;
 }
 if(kind==="revise"){
  dialog("Ajuster la suite du cycle",note("Indiquez uniquement ce qui reste à engager et à vendre. Les opérations déjà saisies restent conservées.")+'<div class="form-grid">'+KEYS.map(k=>field(CATEGORIES[k]+" restant (FCFA)","remaining_"+k,c.remaining[k],"number","required")).join("")+'</div><h3 class="form-section">Ventes et objectif</h3><div class="form-grid">'+field("Ventes restant à réaliser (FCFA)","remainingSales",c.remainingSales,"number","required")+field("Objectif de bénéfice (FCFA)","targetMargin",c.targetMargin,"number",'required data-signed="true"')+'</div><div id="revision-preview" class="plan-preview"></div>'+note("Votre budget de départ reste visible pour mesurer l’écart. Mettez à zéro les prévisions annulées ou terminées."),"revise","Mettre à jour");fixNumberAttrs();updatePlan();return;
 }
 if(kind==="settings"){
  dialog("Paramètres de la ferme",'<div class="form-grid">'+field("Nom de la ferme","farmName",state.settings.farmName,"text",'required maxlength="200"')+field("Solde avant la première opération (FCFA)","openingCash",state.settings.openingCash,"number",'required data-signed="true"')+field("Alerte stock (kg)","stockThresholdKg",state.settings.stockThresholdKg,"number",'required data-decimal="true"')+'</div>'+note("Le solde de départ sert de base à tous vos mouvements. Pour un nouvel apport reçu aujourd’hui, utilisez « Ajouter un apport »."),"settings");fixNumberAttrs();return;
 }
 if(kind==="payment"){
  const x=state[data.list]?.find(x=>x.id===data.id);if(!x)return;
  const balance=data.list==="sales"?x.quantity*x.unitPrice-x.received:(x.amount??x.total)-x.paid;
  dialog(data.list==="sales"?"Encaisser le reste":"Enregistrer un paiement",'<input type="hidden" name="list" value="'+esc(data.list)+'"><input type="hidden" name="id" value="'+esc(data.id)+'">'+note(esc(x.label||x.name||x.client)+" · reste : "+money(balance))+field("Montant reçu / payé maintenant (FCFA)","amount",balance,"number",'required max="'+balance+'"'),"payment");return;
 }
 if(kind==="correct"){
  const x=state[data.list]?.find(x=>x.id===data.id);if(!x)return;
  const paid=x.paid||x.received||0;
  dialog("Corriger cette opération",'<input type="hidden" name="list" value="'+esc(data.list)+'"><input type="hidden" name="id" value="'+esc(data.id)+'"><p>Pour corriger une erreur, supprimez cette opération puis saisissez-la à nouveau.</p><p>La suppression annule ses effets sur le cycle, le stock et la trésorerie.'+(paid?" Elle retire aussi "+money(paid)+" de paiements ou encaissements enregistrés.":"")+'</p><strong>'+esc(x.label||x.client||x.reason||qty(x.kg)+" kg")+'</strong>',"delete","Supprimer cette opération");return;
 }
 if(kind==="close-cycle"){
  if(m.present>0){toast("Il reste "+m.present+" poulets : enregistrez les ventes ou les pertes avant de clôturer.");return;}
  if(m.remaining||c.remainingSales){toast("Ajustez à zéro les prévisions qui ne seront plus réalisées, puis clôturez le cycle.");actionForm("revise");return;}
  dialog("Clôturer le cycle",'<p>Le cycle '+esc(c.name)+' sera figé avec un résultat de <strong>'+money(m.margin)+'</strong>. Les règlements de dettes et de créances resteront possibles.</p>',"close","Clôturer le cycle");return;
 }
}
function fixNumberAttrs(){
 $("#dialog").querySelectorAll("[data-decimal]").forEach(x=>{x.step="0.01";x.inputMode="decimal";x.min=x.name==="bagKg"?"0.01":"0";});
 $("#dialog").querySelectorAll("[data-signed]").forEach(x=>x.min="-1000000000000");
 const duration=$("#dialog").querySelector('[name="targetDays"]');if(duration)duration.min="1";
 for(const k of ["initialCount","bags","quantity","count","amount","kg"]){const x=$("#dialog").querySelector('[name="'+k+'"]');if(x)x.min=k==="kg"?"0.01":"1";}
}
function values(form){
 const fd=new FormData(form),o={};for(const [k,v]of fd)o[k]=typeof v==="string"?v.trim():v;
 for(const input of form.querySelectorAll('input[type="number"]'))o[input.name]=input.value===""?0:Number(input.value);
 for(const input of form.querySelectorAll('input[type="checkbox"]'))o[input.name]=input.checked;
 return o;
}
function cycleData(d){return {...d,budget:Object.fromEntries(KEYS.map(k=>[k,d["budget_"+k]||0]))};}
function updatePlan(){
 const form=$("#dialog form");if(!form)return;const d=values(form);
 try{
 if(form.dataset.form==="cycle"||form.dataset.form==="setup"){
  if(!d.initialCount||!d.bagKg)return;const p=plan(cycleData(d)),cost=sum(Object.values(p.budget));
  $("#plan-preview").innerHTML='<div><span>Budget total</span><strong>'+money(cost)+'</strong></div><div><span>Ventes prévues · '+qty(p.expectedBirds)+' poulets</span><strong>'+money(p.targetSales)+'</strong></div><div><span>Bénéfice prévu</span><strong class="'+(p.targetSales-cost<0?"text-danger":"text-green")+'">'+money(p.targetSales-cost)+'</strong></div>';
 }
 if(form.dataset.form==="lot")$("#lot-preview").textContent=qty(d.bags*d.bagKg)+" kg · total "+money(d.bags*d.bagPrice);
 if(form.dataset.form==="sale")$("#sale-preview").textContent="Total de la vente : "+money(d.quantity*d.unitPrice);
 if(form.dataset.form==="revise"){const m=metrics(state,state.selectedCycleId),remaining=sum(KEYS.map(k=>d["remaining_"+k]||0));$("#revision-preview").innerHTML='<div><span>Coût final prévu</span><strong>'+money(m.cost+remaining)+'</strong></div><div><span>Bénéfice final prévu</span><strong>'+money(m.revenue+d.remainingSales-m.cost-remaining)+'</strong></div>';}
 }catch(e){const p=$("#plan-preview");if(p)p.textContent=e.message;}
}
document.addEventListener("submit",e=>{
 const form=e.target.closest("form[data-form]");if(!form)return;e.preventDefault();
 try{
  const type=form.dataset.form,d=values(form);
  if(type==="setup"){let s=apply(state,{type:"settings",data:{farmName:d.farmName,openingCash:d.openingCash}});s=apply(s,{type:"cycle",data:cycleData(d)});save(s);}
  else if(type==="cycle")perform("cycle",cycleData(d));
  else if(type==="expense")perform("expense",{...d,paid:d.fullyPaid?d.amount:d.paid});
  else if(type==="lot")perform("lot",{...d,kg:Math.round(d.bags*d.bagKg*100)/100,total:d.bags*d.bagPrice,paid:d.fullyPaid?d.bags*d.bagPrice:d.paid});
  else if(type==="sale")perform("sale",{...d,received:d.fullyReceived?d.quantity*d.unitPrice:d.received});
  else if(type==="revise")perform("revise",{...d,remaining:Object.fromEntries(KEYS.map(k=>[k,d["remaining_"+k]]))});
  else if(type==="import-confirm"){save(pendingImport);pendingImport=null;}
  else if(type==="reset-corrupt"){localStorage.removeItem(STORE);savedRaw=null;state=blank();loadError=null;render();}
  else perform(type,d);
  closeDialog();if(type==="setup"||type==="import-confirm")toast("Vos données sont enregistrées sur cet appareil.");
 }catch(err){const out=form.querySelector(".form-error");out.hidden=false;out.textContent=err.message;out.scrollIntoView({block:"nearest"});}
});
document.addEventListener("input",e=>{if(e.target.closest("#dialog"))updatePlan();});
document.addEventListener("change",e=>{
 if(e.target.id==="cycle-picker"){perform("select",{id:e.target.value});return;}
 if(e.target.type==="checkbox"&&e.target.closest("#dialog")){
  $("#dialog").querySelectorAll("[data-if]").forEach(el=>{const checked=$("#dialog").querySelector('[name="'+el.dataset.if+'"]').checked;el.hidden=checked;el.querySelectorAll("input").forEach(i=>i.disabled=checked);});
 }
});
document.addEventListener("click",async e=>{
 const link=e.target.closest("[data-page]");if(link){e.preventDefault();page=link.dataset.page;render();window.scrollTo({top:0});return;}
 const b=e.target.closest("[data-action]");if(!b)return;const a=b.dataset.action;
 try{
 if(a==="dismiss"){closeDialog();return;}
 if(a==="go-journal"){page="journal";render();return;}
 if(a==="select"){perform("select",{id:b.dataset.id});return;}
 if(a==="backup"){download(JSON.stringify(state,null,2),"clair-ferme-"+today()+".json","application/json");return;}
 if(a==="csv"){download(csv(state),"clair-ferme-journal-"+today()+".csv","text/csv;charset=utf-8");return;}
 if(a==="raw-backup"){download(localStorage.getItem(STORE)||"","clair-ferme-a-recuperer.json","application/json");return;}
 if(a==="reset-corrupt"){dialog("Recommencer sur cet appareil","<p>Téléchargez d’abord la sauvegarde présente. Recommencer efface cette copie locale.</p>","reset-corrupt","Effacer et recommencer");return;}
 if(a==="import"){$("#import-file").click();return;}
 if(a==="demo"||a==="real"){
  closeDialog();mode=a==="demo"?"demo":"real";loadError=null;
  if(mode==="demo"){try{const raw=localStorage.getItem(DEMO);savedRaw=raw;state=raw?validate(JSON.parse(raw)):demo();}catch{state=demo();}}
  else load();
  page="home";render();return;
 }
 actionForm(a,b.dataset);fixNumberAttrs();
 }catch(err){toast(err.message);}
});
function download(content,filename,type){
 const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement("a");a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
$("#import-file").addEventListener("change",async e=>{
 const file=e.target.files[0];e.target.value="";if(!file)return;
 try{
  if(file.size>2000000)throw Error("Fichier trop volumineux (2 Mo maximum).");
  const next=validate(JSON.parse(await file.text()));
  if(mode==="real"&&next.demo)throw Error("Ce fichier contient des données d’exemple. Ouvrez le mode exemple pour l’importer.");
  if(mode==="demo"&&!next.demo)throw Error("Revenez à vos données avant d’importer votre ferme.");
  pendingImport=next;
  const f=farm(next);
  dialog("Vérifier la sauvegarde",'<p><strong>'+esc(next.settings.farmName)+'</strong> · '+next.cycles.length+' cycle(s)</p><p>Trésorerie : '+money(f.cash)+' · '+next.expenses.length+' dépense(s) · '+next.sales.length+' vente(s).</p><p>Cette importation remplace les données du mode '+(mode==="demo"?"exemple":"personnel")+' sur cet appareil. Téléchargez votre sauvegarde actuelle avant de continuer.</p>',"import-confirm","Remplacer mes données");
 }catch(err){toast("Import refusé : "+err.message);}
});
window.addEventListener("storage",e=>{
 if(e.key===(mode==="demo"?DEMO:STORE)){
  try{if(e.newValue){state=validate(JSON.parse(e.newValue));savedRaw=e.newValue;closeDialog();render();toast("Données mises à jour depuis un autre onglet.");}}
  catch{toast("Une sauvegarde modifiée dans un autre onglet est invalide. Rechargez avant de continuer.");}
 }
});
load();render();
