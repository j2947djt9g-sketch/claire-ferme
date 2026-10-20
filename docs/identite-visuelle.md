# Clair Ferme · identité 0.2

Clair Ferme appartient à la famille Clair : typographie système, solde mis en avant, carte en dégradé, surfaces translucides, boutons arrondis et présence d’une mascotte à côté du montant. Le langage visuel est adapté à une ferme avicole et à un usage sur téléphone.

## Signature
Votre ferme, au clair.
Une ferme dans la poche : l’argent disponible, le cycle en cours et le cap du budget.

## Pia
Pia est le nom provisoire de la mascotte : une petite poussine jaune, en salopette verte, avec une feuille dans les cheveux. Le personnage est un poussin féminin, sans corps humain. Son rôle est d’accompagner la lecture des chiffres, avec calme.
Le message dépend de données réelles : trésorerie négative, cycle terminé, prévision sous l’objectif, règlements en attente, premier mouvement ou suivi en cours. La mascotte ne promet aucun bénéfice et n’invente pas de conseil d’élevage.
Illustration originale créée pour ce projet ; elle reste indépendante des visuels de Clair personnel.

## Couleurs
- Nuit forêt : #091511, fond du thème sombre.
- Vert de la carte de trésorerie : #234e32 vers #397044.
- Menthe : #b9ef9c, actions et repères.
- Jaune poussin : #f4ce70, chaleur et points à surveiller.
- Ivoire : #f4f8f1, texte principal du thème sombre.
- Fond clair : #f3f6f1 ; actions en vert #245f39.

Le jaune marque une vigilance. Le rouge indique une situation défavorable ; il n’efface jamais la valeur réelle affichée.

## Téléphone en premier
L’accueil présente la trésorerie, le message de Pia, quatre actions courantes, la progression du cycle et deux indicateurs. Le détail du budget se déplie.
Navigation fixe translucide en bas ; cinq destinations : Accueil, Journal, Aliments, Cycles, Plus. Les noms accessibles restent explicites.
Les formulaires s’ouvrent depuis le bas sur téléphone. Les champs utilisent une taille lisible sans zoom automatique sur iPhone. Le bas de l’écran tient compte de la zone de sécurité.
La version bureau développe ces mêmes composants en colonnes ; elle ne dicte pas l’organisation du téléphone.

## Texte et chiffres
Employer des mots concrets : argent disponible, à payer, à encaisser, déjà engagé, bénéfice prévu.
Distinguer la trésorerie de la ferme et les résultats du cycle. Toujours qualifier un résultat prévisionnel.
Les données d’exemple sont fictives et dans un espace séparé. Aucun message ne suppose un paiement ou une opération qui n’a pas été saisi.

## Mouvement et installation
Transitions courtes sur boutons et ouverture des formulaires, désactivables avec le réglage système de réduction des animations.
Manifeste et service worker pour l’écran d’accueil et la réouverture hors connexion après un premier chargement complet.
Le mode clair ou sombre est mémorisé séparément des données financières.
