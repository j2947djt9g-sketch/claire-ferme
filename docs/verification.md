# Vérification · Clair Ferme 0.3.0

## Passage du 23 octobre 2026

48 tests de calcul et 54 parcours navigateur réussis.
Code testé : `e3d8cf5d8219b8a4da803a248da26f37116a4b51`.
Résultats : https://github.com/j2947djt9g-sketch/claire-ferme/actions/runs/40012283442

Les 18 parcours sont exécutés dans trois profils : Chromium ordinateur, Chromium au format iPhone 13 et WebKit au format iPhone 13. Ils incluent les téléphones de 320 à 430 pixels, les tablettes en portrait et paysage et le téléphone en paysage. Ces essais ne remplacent pas une vérification matérielle sur un véritable iPhone ou iPad.

## Couverture

- Configuration du cycle, durée personnalisée et prévisions distinctes du réel.
- Conservation des saisies après rechargement.
- Achat d’aliments, stock partagé et consommation affectée au cycle sans double décaissement.
- Dépenses, ventes et paiements partiels ; créances, dettes et effectifs.
- Correction d’une opération et annulation de ses effets.
- Export/import JSON, copie illisible et échec de stockage sans perte du formulaire.
- Séparation du mode exemple et des données personnelles.
- Cycle suivant reprenant les hypothèses sans les opérations réelles.
- Thèmes clair et sombre sans modification des données financières.
- Image de Pia et messages liés aux chiffres.
- Navigation, formulaires et tableaux contenus dans leur cadre, dont le budget replié puis déplié dans WebKit.
- Quatre saisies visibles dès l’ouverture au format 390 × 664.
- Ouverture verte en courbe, libération de l’application après préparation, relecture et réduction des animations.
- Réouverture et saisie d’une perte après coupure réseau.

Le moteur financier est conservé. La limite globale de la suite est de six minutes ; les limites individuelles des essais restent identiques. Le passage précédent avait réussi 53 parcours avant d’atteindre sa limite globale de quatre minutes.

## Hors connexion

Chromium utilise la simulation réseau. Le test WebKit utilise un serveur isolé sans cache HTTP : il prépare le cache de l’application, arrête le serveur et vérifie d’abord qu’un appel réseau échoue. L’accueil, l’image de Pia et les données restent disponibles après réouverture, puis une perte est enregistrée.

Cette méthode évite la limite de la simulation réseau WebKit de Playwright : https://github.com/microsoft/playwright/issues/42775. L’essai n’est ni ignoré ni marqué comme échec attendu.

## Données et limites

La refonte conserve la clé `clair.ferme.v2` et ne réinitialise pas les saisies. Les données restent dans ce navigateur sur cet appareil. L’export JSON fournit une copie séparée et permet un transfert ; aucun compte et aucune synchronisation cloud ne sont ajoutés.

Les paiements modifient les cumuls payés ou encaissés, sans journal de règlements datés distinct. Les investissements, amortissements et bilans réglementaires restent exclus. Les frais fixes sont affectés au cycle. Une correction passe par une suppression confirmée puis une nouvelle saisie. Les cycles clôturés restent figés.

## Environnement des essais

GitHub Actions utilise l’image officielle `mcr.microsoft.com/playwright:v1.56.1-noble`, avec la même version que `@playwright/test`. Les navigateurs et leurs dépendances système sont préinstallés. Cette configuration évite les blocages de téléchargement des dépendances lors d’une nouvelle exécution.
