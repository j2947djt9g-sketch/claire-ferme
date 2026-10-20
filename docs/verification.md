# Vérification · Clair Ferme 0.2.2

Version publiée sur https://j2947djt9g-sketch.github.io/claire-ferme/

## Résultat
**48 tests de calcul et 26 essais navigateur réussis.**

Code testé : `ab3cace9cc8eac737bdb5fabdd62a2886f50591b`.
Workflow : https://github.com/j2947djt9g-sketch/claire-ferme/actions/runs/39484207012
Rapport et captures : https://github.com/j2947djt9g-sketch/claire-ferme/actions/runs/39484207012/artifacts/12291719727

Le déploiement GitHub Pages du même commit est réussi :
https://github.com/j2947djt9g-sketch/claire-ferme/actions/runs/39484206154

## Comportements vérifiés
- Configuration d’un cycle de 60 jours, hypothèses distinctes des opérations.
- Conservation des saisies après rechargement.
- Achat d’aliments, consommation par cycle et conservation du coût du lot.
- Ventes et paiements partiels, créances, dettes, trésorerie distincte du résultat.
- Correction d’une opération et annulation de ses effets.
- Sauvegarde JSON, import contrôlé et restauration d’une copie illisible.
- Échec de stockage : le formulaire et les données antérieures sont conservés.
- Séparation du mode exemple et des données personnelles.
- Nouveau cycle reprenant les hypothèses sans recopier les mouvements.
- Thèmes clair et sombre mémorisés sans modifier les données financières.
- Présence et chargement de Pia ; message défavorable quand la trésorerie est négative.
- Pages et formulaires contenus dans la largeur ; navigation utilisable à 320, 390 et 430 pixels.
- Quatre actions courantes accessibles dans le premier écran de 390 × 664 pixels.
- Réouverture et saisie d’une perte hors connexion après le premier chargement complet.

Les essais sont exécutés dans Chromium, avec un profil ordinateur et un profil téléphone. Ils ne remplacent pas une vérification matérielle dans Safari sur iPhone.
Les captures de l’accueil mobile et bureau ont également servi à la revue visuelle : hauteur de la carte, accès aux actions, position de défilement et débordement des en-têtes ont été corrigés.

## Identité
[Guide visuel](identite-visuelle.md). Le style reprend la famille Clair et l’adapte à la ferme : typographie système, cartes arrondies, dégradé de trésorerie, surfaces translucides, vert forêt et menthe, mascotte jaune.
Le cycle sélectionné et son jour sont visibles dès l’en-tête. Sur téléphone, le message de Pia est intégré à la carte financière et les formulaires s’ouvrent depuis le bas.

## Données et limites
Le moteur et les clés de sauvegarde financière sont conservés. La refonte ne migre ni ne réinitialise les saisies existantes.
Stockage dans le navigateur ; export JSON nécessaire pour une copie séparée ou un transfert. Pas de synchronisation cloud ni de compte dans cette version.
Les règlements modifient le montant cumulé payé/encaissé ; aucun journal de paiements datés distinct.
Les investissements, amortissements et bilans réglementaires ne sont pas inclus. Les frais fixes sont affectés au cycle, sans annualisation automatique.
Une correction passe par une suppression confirmée puis une nouvelle saisie. Les cycles clôturés restent figés.

## Reprise prévue
Un point de vérification est programmé pour le 24 octobre 2026. Conserver l’identité et la priorité au téléphone lors des corrections suivantes.
