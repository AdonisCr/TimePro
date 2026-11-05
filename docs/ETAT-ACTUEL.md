# Time Pro — état actuel

> Dernière mise à jour : 5 novembre 2026 (fin de la phase 7).
> Ce document décrit **ce que fait réellement le code**, pas ce qui était prévu.
> Les fichiers `BACKEND-SPEC.md` et `FRONTEND-SPEC.md` restent des documents de
> conception : ils peuvent décrire des fonctions non livrées.

## Comment lancer le projet en local

```bash
# 1. Base MySQL locale (port 3307, données dans Backend/.mysql-data)
cd Backend && ./scripts/dev-db.sh start

# 2. API Laravel (http://127.0.0.1:8000)
cd Backend && php artisan serve --host=127.0.0.1 --port=8000

# 3. Frontend (http://127.0.0.1:5173)
cd Frontend && npm run dev
```

## Vérifications automatiques

| Commande | Contenu |
|---|---|
| `cd Frontend && npm run check` | types, lint, 33 tests, build |
| `cd Backend && ./scripts/test.sh` | 81 tests Laravel sur SQLite en mémoire |

Une CI GitHub Actions (`.github/workflows/ci.yml`) exécute les deux à chaque
`push` sur `main` et à chaque pull request.

## Ce qui fonctionne

### Comptes et sécurité
- inscription, connexion, déconnexion ;
- vérification d'email, mot de passe oublié et réinitialisation ;
- limitation du nombre de tentatives de connexion ;
- chaque donnée est rattachée à son utilisateur (tâches, projets, temps,
  notifications, équipes).

### Travail au quotidien
- projets, tâches, sous-tâches, priorités, échéances, récurrence ;
- planning du jour calculé à partir des tâches (durées estimées, priorités) ;
- chronomètre avec pauses, durée active conservée ;
- bilan hebdomadaire et rapport du jour ;
- habitudes et objectifs mensuels ;
- export des données en JSON, CSV et Markdown.

### Hors ligne
- les pages déjà visitées s'ouvrent sans réseau ;
- les créations sont mises en file d'attente, par utilisateur ;
- la file est rejouée au retour de la connexion.

### Partage, notifications, push
- partage d'un planning par lien public ;
- notifications en base (invitation, acceptation, échéance) ;
- notifications push réelles via `minishlink/web-push` quand les clés VAPID
  sont configurées ; le bouton est masqué sinon.

### Performance (phase 7)
- découpage du JavaScript par page (`React.lazy`) : le fichier initial passe
  d'environ 875 Ko à environ 99 Ko, plus les bibliothèques partagées ;
- sommes de temps des projets chargées en une requête (`withSum`) au lieu
  d'une requête par projet ;
- charge de travail d'équipe calculée en une requête agrégée ;
- index composites sur `tasks(user_id, status)`, `tasks(user_id, due_date)`
  et `time_entries(user_id, start_time)`.

## Ce qui n'est pas livré (à ne pas promettre)

- **paiement** : aucune offre payante, aucun prestataire de paiement ;
- **intégrations tierces** : pas de Google Calendar, Slack, Outlook ;
- **automatisations** : les règles sont enregistrées et listées, mais aucun
  moteur ne les exécute encore ;
- **application mobile native** : le site est utilisable sur téléphone (PWA),
  il n'y a pas d'application à installer depuis un store ;
- **déploiement** : pas encore de configuration de production ni de sauvegarde
  automatique de la base.

## Limites connues

- `composer audit` ne signale plus aucune vulnérabilité ; `npm audit` signale
  encore 9 avis modérés, uniquement dans des outils de développement (lint,
  build), sans impact sur le site envoyé au navigateur.
- `Backend/.env.staging` est encore suivi par Git (à retirer en phase 8).
- Le nom « Time Pro » et le logo sont provisoires.
- La page `/planning` a été remise en état sur téléphone (marges, titre,
  blocs courts) mais n'a pas encore été refondue visuellement.
