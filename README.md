# Clair Ferme

Application mobile web pour suivre des bandes de poulets, leurs dépenses et leur budget, en FCFA. Elle reprend les codes visuels de Clair et possède son propre code et son propre espace de données. Aucun Firebase.

## Identité
Version 0.4.0 : prairie, crème et ciel doux ; cartes claires, typographie système, navigation au pouce et formulaires adaptés au téléphone. **Pia**, petite poussine en salopette verte et barrette feuille, accompagne les chiffres avec des messages issus des données réelles. L’accueil conserve une ferme illustrée originale ; l’entrée reprend une transition fluide en courbe dans la même palette verte.
[Guide de l’identité visuelle](docs/identite-visuelle.md).
Le thème clair est proposé au premier lancement ; le thème sombre reste disponible. L’apparence est mémorisée séparément des données financières.

## Ouverture et appareils
L’ouverture présente le logo sur fond vert profond, Pia descend avec un léger rebond, la ferme apparaît, puis un panneau vert remonte en courbe pour révéler l’application. La scène dure environ 3,75 secondes après préparation et peut être passée. La signature initiale dure brièvement et attend la préparation des données et le décodage de Pia, sans faux pourcentage de progression. Si le démarrage échoue, un bouton permet de réessayer. Dans Plus, « Revoir l’ouverture animée » rejoue cette séquence. Le réglage système de réduction des animations est respecté.

Téléphone en priorité, dont le format iPhone 13 ; tablette en portrait et paysage avec une navigation en bas jusqu’à 1 199 pixels. Sur grand écran, la navigation passe sur le côté. Champs de saisie à 16 pixels, zones tactiles et marges de sécurité de l’iPhone. Application web installable depuis Safari ou Chrome.

## Priorité produit
Configurer la durée et les hypothèses du cycle, enregistrer le réel, comprendre trésorerie et résultat, puis préparer la bande suivante. Les références Excel fournies sont indicatives ; elles ne deviennent pas les données de la ferme. Les montants de démonstration sont fictifs et explicitement signalés.

## Règles de calcul
- Trésorerie = solde de départ + apports + ventes encaissées − dépenses payées − achats d’aliments payés.
- Coût du cycle = charges engagées + aliments consommés. L’achat de stock n’est pas compté deux fois.
- Résultat réel à date = ventes réalisées − charges engagées. Il ne représente pas le bénéfice final tant que le cycle est ouvert.
- Prévision = réel + reste à engager / vendre. Une opération prévue réduit le reste à faire ; un imprévu s’y ajoute.
- Les créances et dettes restent visibles avec les paiements partiels.
- Les effectifs et les stocks ne peuvent pas devenir négatifs.
- La mortalité prévue sert uniquement aux hypothèses, les pertes réelles se saisissent en nombres entiers.
- Charges fixes saisies par cycle ; pas d’annualisation automatique, de bilan légal ou de répartition des pertes entre associés.
- Les actifs et amortissements ne sont pas inclus dans cette première version.

## Données et sauvegarde
Stockage dans le navigateur de cet appareil. Export JSON pour sauvegarder et transférer, CSV pour consulter les opérations. Aucune synchronisation entre appareils et aucun compte utilisateur dans cette version. Les données ne sont pas envoyées au dépôt GitHub.

## Développement
JavaScript natif sans compilation. `node --test tests/domain.test.mjs`.
Servir le dossier en HTTP (par exemple `python3 -m http.server 8080`) : les modules ES ne se lancent pas par double clic sur un fichier.
GitHub Pages : branche main, dossier racine.

## Utilisation
1. Ouvrir l’application et choisir « Configurer mon premier cycle ».
2. Saisir durée, effectif, prix, mortalité prévue, aliments et autres charges.
3. Enregistrer les mouvements réels dans Opérations et Aliments.
4. Ajuster les prévisions restantes, puis préparer le cycle suivant.
5. Exporter régulièrement une sauvegarde JSON dans Sauvegarde.

Le mode exemple utilise un stockage séparé. Il n’écrase pas les données personnelles.

## Vérification
48 cas de calcul dans `tests/cases.mjs`. Les mêmes cas s’exécutent avec Node dans GitHub Actions.
Les parcours Playwright couvrent ordinateur et téléphone : configuration, persistance, opérations, paiements partiels, stock, correction, import/export, séparation du mode exemple, largeur des écrans, thèmes, messages de Pia, accès aux actions dès l’ouverture et saisie hors connexion.
Pour les lancer : `npm install`, `npx playwright install --with-deps chromium webkit`, `npm run test:browser`.

Dernier passage vérifié : **48 tests de calcul et 75 essais navigateur réussis** (Chromium ordinateur et téléphone, WebKit au format iPhone).
[Voir les vérifications réussies](https://github.com/j2947djt9g-sketch/claire-ferme/actions/runs/40701160336).
Résultats et limites dans [docs/verification.md](docs/verification.md).
Les captures et traces des essais sont dans les artefacts GitHub Actions (7 jours).

## Ouvrir l’application
https://j2947djt9g-sketch.github.io/claire-ferme/

La publication GitHub Pages est activée sur la branche main. Les fichiers sont servis sans compilation.
Sur iPhone : ouvrir dans Safari → Partager → Sur l’écran d’accueil. Sur Android : menu du navigateur → Ajouter à l’écran d’accueil / Installer.
Après un premier chargement complet, l’application se rouvre hors connexion. Les exports JSON restent indispensables pour conserver une copie séparée des données du navigateur.

## Des actions plus directes
Un retour contextuel retrouve l’écran précédent, sa position de lecture et le bouton d’origine. Depuis le choix rapide, le retour garde les champs saisis tant que la fenêtre n’est pas fermée ou annulée. Les montants À payer et À encaisser amènent directement à la liste des règlements. Si les aliments manquent, l’achat peut se faire depuis la consommation puis reprendre celle-ci immédiatement. Les cartes et boutons gagnent du relief sans nouvelle barre d’outils.
