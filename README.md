# Clair Ferme

Application mobile web pour suivre des bandes de poulets, leurs dépenses et leur budget, en FCFA. Elle reprend les codes visuels de Clair et possède son propre code et son propre espace de données. Aucun Firebase.

## Identité
Version 0.2.2 : forêt, menthe et jaune poussin ; carte de trésorerie en dégradé, surfaces translucides, typographie système, navigation au pouce et formulaires en feuilles sur téléphone. **Pia**, petite poussine en salopette verte, accompagne les chiffres avec des messages issus des données réelles.
[Guide de l’identité visuelle](docs/identite-visuelle.md).
Les thèmes clair et sombre sont mémorisés séparément des données financières.

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
Les parcours Playwright couvrent ordinateur et téléphone : configuration, persistance, opérations, paiements partiels, stock, correction, import/export, séparation du mode exemple largeur des écrans, thèmes, messages de Pia, accès aux actions dès l’ouverture et saisie hors connexion.
Pour les lancer : `npm install`, `npx playwright install chromium`, `npm run test:browser`.

Dernier passage vérifié : **48 tests de calcul et 26 essais navigateur réussis** (Chromium ordinateur et téléphone).
[Voir les vérifications réussies](https://github.com/j2947djt9g-sketch/claire-ferme/actions/runs/39484207012).
Résultats et limites dans [docs/verification.md](docs/verification.md).
Les captures et traces des essais sont dans les artefacts GitHub Actions (7 jours).

## Ouvrir l’application
https://j2947djt9g-sketch.github.io/claire-ferme/

La publication GitHub Pages est activée sur la branche main. Les fichiers sont servis sans compilation.
Sur iPhone : ouvrir dans Safari → Partager → Sur l’écran d’accueil. Sur Android : menu du navigateur → Ajouter à l’écran d’accueil / Installer.
Après un premier chargement complet, l’application se rouvre hors connexion. Les exports JSON restent indispensables pour conserver une copie séparée des données du navigateur.
