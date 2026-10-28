# Vérification · Clair Ferme 0.4.1

## Passage du 28 octobre 2026
Code testé : `28bfa73fe2e9344445fe9c2d18985622d8686eaf`.
Résultats : https://github.com/j2947djt9g-sketch/claire-ferme/actions/runs/40748335664

48 tests de calcul et 75 parcours navigateur réussis : 25 parcours par profil, sur Chromium ordinateur, Chromium téléphone et WebKit au format iPhone. La suite couvre les écrans de 320 à 430 pixels, les tablettes en portrait/paysage et les formulaires. Il s’agit d’appareils simulés.

## Lisibilité
- Solde sur fond vert uni #0b6239 et montants blancs ; retrait des dégradés des surfaces de l’interface.
- Libellés, textes secondaires, tableaux et formulaires agrandis et renforcés.
- Noms de pages explicites : Dépenses et ventes, Stock d’aliments, Cycles et budgets, Ma ferme et mes données.
- Lien du solde affichant directement son action ; accueil de configuration allégé.
- Mesure locale sur 68 échantillons de textes dans les cinq pages et les deux thèmes : contraste minimal 6,49:1 et taille minimale 12 pixels pour les éléments contrôlés. Ce contrôle ciblé ne constitue pas un audit exhaustif d’accessibilité.
- Vérification visuelle des écrans téléphone, tablette et formulaire.
- Relecture indépendante : barre de progression sombre corrigée avec un remplissage clair #b9d998.

## Fonctionnement conservé
Les calculs, la clé `clair.ferme.v2`, les retours conservant les saisies, les raccourcis, l’animation d’entrée, les thèmes et le fonctionnement hors connexion restent couverts. Aucun changement du moteur financier.

## Limites
Les données restent dans ce navigateur sur cet appareil, avec export JSON pour une copie séparée. Les comptes et la synchronisation ne sont pas ajoutés dans cette livraison.
