# Vérification · Clair Ferme 0.4.0
## Passage du 28 octobre 2026

Code testé : `64e42ff99749e44d841457316b60e1695bf05a72`.
Résultats : https://github.com/j2947djt9g-sketch/claire-ferme/actions/runs/40701160336

48 tests de calcul et 75 parcours navigateur réussis : 25 parcours sur chacun des profils Chromium ordinateur, Chromium téléphone et WebKit au format iPhone. Les téléphones de 320 à 430 pixels et les tablettes portrait/paysage sont couverts. Les appareils sont simulés ; aucun essai matériel sur iPhone/iPad n’est revendiqué.

## Changements vérifiés
- Scène d’entrée : Pia descend, ferme progressive, vague lente, bouton Passer après préparation, relecture et restitution du focus.
- Réduction des animations : pas de mouvement ni de délai imposé pour la scène. Le test vérifie la disparition et la disponibilité de l’app sans exiger un affichage fugitif.
- Retour contextuel : écran précédent, position de lecture et bouton d’origine.
- Choix rapide : retour au menu puis réouverture conservant champs, cases et état conditionnel dans la fenêtre en cours.
- Stock vide : achat accessible puis reprise de la consommation.
- Règlements : destination directe depuis les raccourcis de trésorerie.
- Calculs, stocks, paiements partiels, sauvegarde/import, persistance, séparation du mode exemple, mise en page et hors connexion.

Les tests de calcul et la clé `clair.ferme.v2` sont conservés. Les tests métiers utilisent la réduction des mouvements pour ne pas attendre une animation qu’ils ne vérifient pas ; des essais dédiés exécutent réellement la scène complète.

## Relecture et corrections
Une relecture indépendante a relevé la perte de saisie au retour d’un formulaire ainsi que deux défauts de restitution du focus. Trois régressions ont été reproduites en échec, puis corrigées et vérifiées. La scène entière a été contrôlée visuellement sur téléphone et tablette.

## Environnement et limites
GitHub Actions utilise `mcr.microsoft.com/playwright:v1.56.1-noble` et la même version de `@playwright/test`. Le test hors connexion WebKit arrête un serveur isolé puis vérifie son inaccessibilité, avant de recharger les ressources de l’application mises en cache.

Les données restent sur ce navigateur et cet appareil. Cette livraison porte sur animation et ergonomie ; elle n’ajoute pas encore de comptes ni de synchronisation. L’export JSON reste nécessaire pour une copie séparée. Les captures et traces CI sont disponibles sept jours dans les artefacts du passage cité.
