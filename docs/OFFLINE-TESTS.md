# Mode hors ligne — tests manuels

Ce document décrit les vérifications à faire dans un navigateur avant de
considérer le mode hors ligne comme fiable. Il complète les tests automatiques :

- `Frontend/tests/offlineQueue.test.ts` : règles des identifiants locaux, de la
  file d'attente et des nouvelles tentatives ;
- `Backend/tests/Feature/IdempotencyTest.php` : non-doublon côté API.

**Vocabulaire**
- **service worker** : petit programme du navigateur qui garde une copie des
  fichiers pour ouvrir l'application sans réseau.
- **cache** : copie locale des fichiers de l'application.
- **idempotence** : rejouer la même action ne crée pas de deuxième élément.
- **file d'attente** : liste des actions faites hors ligne, en attente d'envoi.

---

## 1. Préparation

1. Construire l'application (le service worker n'est actif qu'avec un build) :

   ```bash
   cd Frontend
   npm run build
   npm run preview
   ```

2. Ouvrir l'adresse affichée (par défaut `http://localhost:4173`).
3. Se connecter, puis **recharger une fois** : le service worker s'installe au
   premier chargement et prend le relais au suivant.
4. Dans les outils de développement du navigateur :
   - onglet **Application → Service Workers** : `sw.js` doit être « activated » ;
   - onglet **Application → Cache Storage** : un cache `timepro-<empreinte>` doit
     apparaître (l'empreinte change à chaque nouveau build).

> En développement (`npm run dev`), le service worker est volontairement
> désactivé : sinon il servirait d'anciens fichiers.

---

## 2. Création hors ligne puis reconnexion

**But** : aucune perte, aucun doublon.

1. Ouvrir l'application en ligne et attendre le chargement du tableau de bord.
2. Passer en mode avion (ou cocher « Offline » dans l'onglet **Network** des
   outils de développement).
3. Créer un **projet**, une **tâche** dans ce projet, puis une **entrée de
   temps**.
4. Vérifier que :
   - le bandeau affiche « Hors ligne » ;
   - les trois éléments apparaissent immédiatement dans l'interface ;
   - le compteur du bandeau indique **3** actions en attente.
5. Recharger la page **en restant hors ligne** :
   - l'application doit se rouvrir (service worker) ;
   - l'utilisateur doit rester connecté ;
   - les trois éléments doivent toujours être visibles.
6. Rétablir le réseau.
7. Vérifier que :
   - le compteur revient à **0** ;
   - les identifiants des éléments changent (les identifiants négatifs sont
     remplacés par ceux du serveur) ;
   - le rechargement de la page affiche toujours exactement trois éléments.
8. Contrôler en base qu'il n'y a **qu'une** ligne par élément :

   ```sql
   SELECT COUNT(*) FROM projects WHERE name = 'Mon projet hors ligne';
   SELECT COUNT(*) FROM tasks    WHERE title = 'Ma tâche hors ligne';
   SELECT COUNT(*) FROM time_entries ORDER BY id DESC LIMIT 5;
   ```

**Attendu** : 1, 1, et une seule entrée de temps.

---

## 3. Modification et suppression d'un élément créé hors ligne

1. Repasser hors ligne.
2. Créer une tâche, la renommer, puis la supprimer **avant** de revenir en
   ligne.
3. Revenir en ligne.
4. Vérifier :
   - aucune erreur affichée ;
   - la tâche n'existe pas côté serveur ;
   - le compteur revient à 0.

**Attendu** : la création puis la suppression locale s'annulent, sans laisser
d'élément fantôme.

---

## 4. Réponse perdue (le cas qui crée les doublons)

**But** : simuler un envoi arrivé au serveur mais dont la réponse est perdue.

1. Être en ligne, avec l'onglet **Network** ouvert.
2. Créer une tâche hors ligne, puis revenir en ligne.
3. Pendant l'envoi, repasser brutalement hors ligne (ou utiliser « Block request
   URL » sur `POST /api/tasks`).
4. Revenir en ligne pour déclencher une nouvelle tentative.
5. Vérifier :
   - une seule tâche existe dans l'interface ;
   - une seule ligne en base ;
   - la requête rejouée porte l'en-tête `X-Idempotency-Replayed: true` dans
     l'onglet **Network**.

**Attendu** : le serveur renvoie la réponse mémorisée au lieu de recréer
l'élément.

---

## 5. Échec définitif (validation refusée)

1. Hors ligne, créer une entrée de temps invalide (par exemple une durée
   négative) si l'interface le permet, ou modifier les données dans le
   `localStorage` pour rendre une action invalide.
2. Revenir en ligne.
3. Vérifier :
   - un badge rouge « Échec sync » apparaît dans l'en-tête ;
   - un clic sur ce badge liste les messages d'erreur ;
   - l'action fautive ne bloque pas les autres actions ;
   - un second clic efface les messages.

**Attendu** : une erreur 422/403 ne reste pas indéfiniment dans la file.

---

## 6. Changement de compte

1. Se connecter avec le compte A, passer hors ligne, créer une tâche.
2. Se reconnecter en ligne avec le compte B.
3. Vérifier que la tâche du compte A **n'apparaît pas** chez B.
4. Se reconnecter avec le compte A :
   - la tâche en attente doit être envoyée ;
   - elle doit réapparaître.

**Attendu** : chaque compte garde sa propre file et son propre cache.

---

## 7. Page de repli

1. Ouvrir l'application en ligne (pour installer le cache).
2. Couper le réseau.
3. Ouvrir une URL jamais visitée de l'application (par exemple `/reglages`).
4. Vérifier que l'application s'ouvre normalement (pas la page `offline.html`).
5. Dans les outils de développement, vider **Cache Storage**, puis rouvrir
   hors ligne :
   - la page `offline.html` doit s'afficher avec un bouton « Réessayer ».

---

## 8. Limites connues

- Un même compte ouvert dans **deux onglets** partage la même file
  `localStorage` : le dernier onglet qui écrit gagne. Éviter de créer hors ligne
  dans deux onglets en même temps.
- Le cache local est effacé à la déconnexion (protection des données). La file
  d'attente, elle, est conservée et rejouée à la reconnexion du même compte.
- Les fichiers du build sont mis en cache à l'installation du service worker.
  Un déploiement crée un nouveau cache et supprime l'ancien.
- L'API n'est jamais mise en cache par le service worker : c'est la file
  applicative qui gère les écritures hors ligne.
