# IPP A4P – package GitHub prêt à tester

## Contenu
- `index.html` : interface du test
- `styles.css` : style
- `app.js` : moteur de scoring et génération du rapport
- `questions_ipp_18_25.json` : 60 vignettes forced-choice
- `phase_items_ipp.json` : 12 items d’énergie de phase
- `profiles_36_ipp.json` : 36 profils principaux

## Mise en ligne GitHub Pages
1. Crée un dépôt GitHub.
2. Dépose tous les fichiers à la racine.
3. Active GitHub Pages sur la branche principale.
4. Ouvre l’URL du site générée par GitHub.

## Ce que calcule le moteur
- scores bruts des 6 énergies
- pourcentages internes
- scores centrés (base théorique = 10)
- profil principal = énergie dominante + secondaire
- énergie de phase actuelle
- indice simple de tension interne
- rapport long imprimable en PDF

## Limites honnêtes
Cette version est opérationnelle pour un test terrain et un pilote utilisateur.
Elle n’est pas encore validée psychométriquement sur échantillon réel.
Pour passer au niveau scientifique supérieur, il faudra ensuite :
- recueillir des données
- analyser la discrimination des vignettes
- recalibrer les seuils
- tester la cohérence interne
- stabiliser les interprétations

## Test local
Si ton navigateur bloque `fetch()` en ouvrant simplement le fichier `index.html`, lance un petit serveur local :
- Python : `python3 -m http.server`
- puis ouvre `http://localhost:8000/`
