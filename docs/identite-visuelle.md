# Clair Ferme · identité 0.4.1

Clair Ferme conserve le vert, les tons crème et l’univers agricole. Les références de mouvement inspirent uniquement l’entrée : un logo centré, puis une transition douce en courbe. Pia et les repères de Clair restent présents.

## Palette et mascotte

Ouverture : #12613f. Actions : #126c3c. Fond crème : #f5f8f3. Cartes : #ffffff. Ciel doux : #dff1f8. Encre : #163c28. Jaune poussin : #f2d280. Collines : #c2dcaa, #99c681, #76b36c et #5b9b58. Le thème sombre utilise un fond vert forêt #122d24.

Pia est une petite poussine jaune en salopette verte avec une barrette feuille. Ses messages suivent les données du cycle et la trésorerie. Elle ne promet aucun bénéfice et ne donne pas de conseil d’élevage inventé. Son illustration se trouve dans assets/pia-flat.png ; les décors vectoriels sont dans src/scenes.mjs.

## Ouverture

Le monogramme clair et le nom clair ferme apparaissent au centre d’un fond vert profond. Une fois l’application préparée et Pia décodée, le panneau vert remonte avec un bord courbe et dévoile l’écran réel. La scène se déroule pendant 2 600 ms après préparation puis la transition dure 1 100 ms (masquage à 1 150 ms). Pia descend du ciel avec un léger rebond pendant que le décor apparaît en plusieurs plans. Le bouton « Passer l’animation » est disponible une fois l’application prête. Un démarrage long propose Réessayer. Aucun pourcentage de progression fictif n’est affiché.

Le bouton « Revoir l’ouverture animée » dans Plus rejoue la séquence. Le réglage système de réduction des animations supprime les mouvements et l’attente de la scène. Le clavier retrouve le bouton d’origine après la relecture.

Les captures de référence sont fixes : la vitesse et l’accélération du mouvement sont une interprétation du style demandé.

## Téléphone et tablette

L’accueil présente le cycle et son jour, la trésorerie avec Pia, quatre saisies accessibles au pouce et les cartes du cycle. Les données sont lisibles dans des cartes claires arrondies ; la navigation translucide garde ses repères verts.

Sur tablette, les cartes s’organisent en colonnes et la navigation reste en bas. À partir de 1 200 pixels, elle passe sur le côté. Les champs sont à 16 pixels, les marges de sécurité de l’iPhone sont prises en compte et les tableaux défilent dans leur propre cadre.

## Données

Distinguer argent disponible, coût engagé, résultat provisoire et prévision. Les données d’exemple sont fictives et séparées des données personnelles. Le moteur et la clé financière `clair.ferme.v2` sont conservés ; l’apparence reste dans `clair.ferme.appearance.v3`.

## Lisibilité renforcée
Le solde est sur fond vert uni #0b6239, avec des montants blancs et des sous-textes #d7f0df. Le texte courant utilise #163c28 et les explications #405b48 sur des surfaces claires. Les petits textes utiles sont agrandis ; les champs restent à 16 pixels. Les titres poétiques sont remplacés par des noms de fonctions : Dépenses et ventes, Stock d’aliments, Cycles et budgets, Ma ferme et mes données. Les effets de dégradé sont retirés des surfaces de l’interface ; le décor illustré conserve ses couleurs.
