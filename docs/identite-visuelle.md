# Clair Ferme · identité 0.3

Clair Ferme conserve les repères de Clair : typographie système, argent disponible mis en avant, cartes arrondies, navigation au pouce et mascotte proche du solde. L’univers agricole prend la forme d’une ferme illustrée, avec un ciel doux, des collines vertes, des arbres, une grange et une jeune pousse. Les références fournies guident l’harmonie générale ; les illustrations et le code du projet sont propres à Clair Ferme.

## Signature
Votre ferme, au clair.
Un cycle après l’autre.

## Pia
Petite poussine jaune, salopette verte, barrette feuille, geste d’accueil. La nouvelle illustration en deux dimensions s’accorde au paysage. Son image est servie depuis `assets/pia-flat.png` ; le paysage et la pousse sont des SVG natifs dans `src/scenes.mjs`.
Son message dépend des données : trésorerie négative, cycle terminé, prévision sous l’objectif, règlements en attente, premier mouvement ou suivi en cours. Pia ne promet aucun bénéfice et n’invente aucun conseil d’élevage.

## Couleurs
- Crème : `#fbf9f2`, fond clair.
- Papier : `#fffefa`, cartes et panneaux.
- Ciel doux : `#dff1f8`, décor d’accueil.
- Vert prairie et sauge : collines `#c2dcaa`, `#99c681`, `#76b36c`, `#5b9b58`.
- Vert principal : `#2c6d4c`, actions et repères.
- Encre : `#253b2c`, chiffres et titres.
- Jaune poussin : `#f2d280`, chaleur et points à surveiller.
- Terre cuite : grange et petits accents.
- Rouge : `#ae5344`, situation défavorable.

Le jaune signale une vigilance ; le rouge n’efface jamais une valeur réelle. Le thème clair est proposé par défaut. Le thème sombre optionnel conserve des surfaces vert forêt et des textes clairs.

## Téléphone et tablette
L’accueil présente la trésorerie, Pia, les quatre saisies courantes, la progression du cycle et les indicateurs utiles. Le détail du budget se déplie. Navigation fixe en bas : Accueil, Journal, Aliments, Cycles, Plus. Sur tablette, les cartes passent en deux colonnes et la navigation reste en bas. À partir de 1 200 pixels, une barre latérale développe ces mêmes destinations.
Les formulaires s’ouvrent depuis le bas sur téléphone et en dialogue centré sur les formats plus larges. Champs à 16 pixels, actions tactiles lisibles, marges de sécurité de l’iPhone. Le décor d’accueil reste ancré en bas et les textes restent sur le ciel.

## Ouverture et mouvement
Une jeune pousse se déploie devant le paysage et le nom Clair Ferme. L’écran disparaît lorsque l’application est initialisée et Pia décodée, sans durée minimale artificielle. Un démarrage long propose Réessayer. Plus permet de revoir l’animation. Les animations et transitions respectent le réglage système de réduction des mouvements.

## Texte et données
Employer des mots concrets : argent disponible, à payer, à encaisser, déjà engagé, bénéfice prévu. Distinguer la trésorerie de la ferme et le résultat du cycle. Toujours qualifier les prévisions. Les exemples sont fictifs et séparés des données personnelles.
Les données financières restent dans `clair.ferme.v2`. L’apparence utilise `clair.ferme.appearance.v3`, sans migration ni réinitialisation des chiffres.
