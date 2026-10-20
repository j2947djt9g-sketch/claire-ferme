# Vérification de Clair Ferme

## Périmètre livré
Configuration initiale (durée libre entre 1 et 730 jours, effectif, prix, mortalité prévue, budget et objectif), cycles multiples, dépenses, achats d’aliments, consommation par cycle, ventes et encaissements partiels, pertes, apports, paiements des reliquats, ajustement du budget restant, préparation du cycle suivant, comparaison des résultats, export CSV et sauvegarde/import JSON.

Le stockage est local au navigateur. Une sauvegarde JSON reste nécessaire pour conserver une copie extérieure ou changer d’appareil. Il n’y a pas de compte ni de synchronisation cloud.

## Contrôles exécutés
- 48 scénarios de calcul réussis dans le moteur JavaScript V8.
- Les mêmes 48 tests passent dans Node 24 sur GitHub Actions (premier workflow).
- Les cinq écrans produisent un rendu HTML sans exception, NaN ou valeur undefined avec les données d’exemple.
- Vérifications de syntaxe JavaScript réussies.

## Parcours dans un navigateur
GitHub Actions exécute Playwright dans Chromium, sur une largeur d’ordinateur et un profil de téléphone.
Premier passage : 12 parcours réussis sur 14. Le libellé accessible du sélecteur de poste empêchait la sélection par son nom exact ; correction du nom accessible, puis nouvelle exécution.
Deuxième passage : **18 essais réussis sur 18**, soit 9 parcours sur ordinateur et 9 sur téléphone. Il couvre aussi l’échec de sauvegarde et la restauration d’un fichier illisible.

Code vérifié : `b4b7032e04d6606a9ad2aa67ecf5a38e435af499`.
Résultat : https://github.com/j2947djt9g-sketch/claire-ferme/actions/runs/39481059883
Captures et rapport : https://github.com/j2947djt9g-sketch/claire-ferme/actions/runs/39481059883/artifacts/12291696360

## Points de calcul essentiels
Les hypothèses sont distinctes des opérations réelles. Les prévisions de poulets vendables sont arrondies à l’entier inférieur. Les montants sont des FCFA entiers.
Le coût du stock est distribué par arrondi cumulatif pour conserver le montant total du lot.
Le budget de départ est conservé lors des ajustements. Une charge prévue réduit le reste à engager ; une charge imprévue s’ajoute.
Le résultat à date d’un cycle ouvert est provisoire. Les frais fixes sont saisis par cycle, sans multiplication automatique par un nombre théorique de cycles annuels.

## Limites
Pas de banque connectée, de stock de poussins partagé, d’immobilisations/amortissements ou de bilan comptable réglementaire.
Les règlements partiels modifient le montant cumulé payé/encaissé ; ils n’ont pas encore un journal d’échéanciers datés distinct.
Les charges d’aliments doivent passer par un achat de stock puis une consommation, pour éviter un double comptage.
Une correction consiste à supprimer puis ressaisir une opération, avec confirmation. Les cycles clôturés sont figés.
GitHub Pages n’était pas activé lors de la préparation de cette version. Le connecteur ne permet pas de modifier ce réglage d’administration.

## Prochain point
Reprise de vérification programmée le 24 octobre 2026. Vérifier la publication, lire les résultats des tests, corriger les défauts observés et rester centré sur les parcours simples et utiles.
