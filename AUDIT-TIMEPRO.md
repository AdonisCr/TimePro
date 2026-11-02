# Audit technique — Time Pro (branche `main`)

> **Nature du document** : audit en lecture seule.
> **Aucun fichier de code n'a été modifié, supprimé ou réinitialisé.**
> Les seules commandes exécutées sont des commandes de diagnostic (build, tests, audits de dépendances).
> Aucune valeur de secret n'est affichée dans ce rapport.

| Élément | Valeur |
|---|---|
| Dépôt | `/home/dev/Bureau/touch/TimePro` |
| Branche | `main` |
| Commit audité | `89508e8` — « aavancer sur l projet » |
| Remote | `origin https://github.com/AdonisCr/TimePro.git` |
| Date | 1er novembre 2026 |
| Stack | Frontend React 18 + TypeScript + Vite 5 + Tailwind 3 · Backend Laravel 12 + Sanctum + MySQL |
| Cible produit | PWA « offline-first » de gestion du temps |

**Vocabulaire utilisé dans ce rapport**
- **build** : compilation du frontend en fichiers optimisés pour la production.
- **endpoint** : adresse d'API (ex. `GET /api/tasks`).
- **token** : jeton d'authentification, sorte de mot de passe temporaire.
- **cascade** : suppression « en chaîne » en base (supprimer un projet supprime ses tâches).
- **soft delete** : suppression « douce » (la ligne reste en base, marquée supprimée).
- **N+1** : bug de performance où l'application fait 1 requête + N requêtes au lieu d'une seule.
- **IDOR** : accès à la ressource d'un autre utilisateur en changeant un identifiant dans l'URL.
- **PWA** : application web installable, capable de fonctionner hors ligne.

---

## 0. Résumé exécutif

Le projet est **bien plus avancé** que ce que décrivait l'ancien rapport (qui portait sur une autre branche). Il y a un vrai backend Laravel, une vraie API, 18 pages frontend, un début de PWA et une gestion d'équipe.

Mais l'application **n'est pas utilisable en production en l'état**, pour trois raisons de nature différente :

1. **Elle ne démarre pas** : il n'y a pas de `.env`, pas de `APP_KEY`, aucune base MySQL configurée. Le backend ne peut donc pas tourner.
2. **Le code frontend ne passe pas la vérification de types** : 33 erreurs TypeScript, dont un crash immédiat du tableau de bord (`useState` non importé).
3. **Plusieurs fonctions cœur donnent des résultats faux ou perdent des données** : chronomètre qui compte les pauses, rapport hebdomadaire en secondes affiché comme des minutes, suppression de projet qui efface l'historique de temps, mode hors ligne qui ne peut jamais synchroniser ses créations.

### Les 8 problèmes à traiter en premier

| # | Problème | Gravité | Effet concret |
|---|---|---|---|
| P0-1 | Backend non démarrable : aucun `.env`, `APP_KEY` vide, MySQL non configuré | Bloquant | Impossible de lancer l'API, les tests échouent |
| P0-2 | Un compte non vérifié est **définitivement bloqué** | Critique | L'utilisateur ne peut ni se connecter, ni redemander l'email |
| P0-3 | Changement d'email sans mot de passe ni re-vérification | Critique (sécurité) | Prise de contrôle persistante d'un compte |
| P0-4 | Suppression d'un projet / d'une tâche = **perte définitive de l'historique de temps** | Critique (données) | Le cœur de métier (le temps mesuré) disparaît |
| P0-5 | `useOffline` utilise `useState` sans l'importer | Critique (runtime) | Crash du dashboard et de l'en-tête |
| P0-6 | Le chronomètre compte les pauses et perd le temps au stop | Critique (métier) | Temps facturé faux |
| P0-7 | Cache et file d'attente hors ligne **non liés à l'utilisateur** | Élevée (sécurité) | Un utilisateur voit les données du précédent |
| P0-8 | Les créations hors ligne reçoivent un faux identifiant (`Date.now()`) | Élevée | Elles ne peuvent jamais être modifiées ni synchronisées |

**Bonne nouvelle** : les contrôleurs vérifient globalement `user_id` sur les ressources. Je n'ai trouvé **aucun IDOR inter-tenant confirmé** sur les routes CRUD principales, ni d'injection SQL. Le hachage des mots de passe, les règles de complexité, le rate limiting de connexion et les routes signées de vérification d'email sont correctement faits.

---

## 1. Architecture réelle

### 1.1 Ce qui existe

```
TimePro/
├── Frontend/                  React 18.3 + TypeScript 5.5 + Vite 5 + Tailwind 3
│   ├── public/                manifest.json, sw.js, 2 jeux d'icônes
│   └── src/
│       ├── pages/             18 pages (landing, auth, dashboard, focus, planning…)
│       ├── components/
│       │   ├── home/          sections de la landing
│       │   └── dashboard/     36 composants (Kanban, Gantt, équipe, focus…)
│       ├── hooks/             13 hooks (tasks, projects, timeEntries, offline…)
│       ├── context/           AuthContext, ThemeContext
│       └── lib/               axios, offlineStorage, export, focus, productivity
├── Backend/                   Laravel 12 + Sanctum 4 + Socialite 5
│   ├── app/Http/Controllers/Api/   16 contrôleurs
│   ├── app/Models/           17 modèles
│   ├── database/migrations/  32 migrations
│   └── routes/api.php        91 routes
├── docs/BACKEND-SPEC.md       69 Ko de spécification
├── docs/FRONTEND-SPEC.md      37 Ko de spécification
└── TODOS_FUTURS.txt           intentions produit
```

### 1.2 Flux d'authentification réel

1. Le frontend appelle `POST /api/login` (ou `/register`).
2. Le backend renvoie un **token Sanctum** en clair (`AuthController::login`).
3. Le frontend le stocke dans `localStorage` sous la clé `token`, et l'envoie dans l'en-tête `Authorization: Bearer …` à chaque requête (`Frontend/src/lib/axios.ts:17-22`).
4. `withCredentials: true` est aussi activé, donc les cookies de session partent également.
5. À la déconnexion, seul `token` est supprimé.

**Remarque** : deux systèmes d'authentification coexistent côté frontend — `context/AuthContext.tsx` (utilisé par `App.tsx`) et `hooks/useUser.ts` (utilisé par `Dashboard.tsx`). Ils lisent et écrivent le même `localStorage`, mais gardent chacun leur propre état. Cela provoque des états incohérents (par exemple après mise à jour du profil).

### 1.3 Configuration réseau

| Élément | Valeur constatée | Fichier |
|---|---|---|
| URL de l'API par défaut | `http://localhost:8000/api` | `Frontend/src/lib/axios.ts:4` |
| CORS autorisés | `localhost:5173/5174`, `127.0.0.1:5173/5174`, `FRONTEND_URL`, `APP_URL` | `Backend/config/cors.php:23-30` |
| `supports_credentials` | `true` | `Backend/config/cors.php:36` |
| Expiration Sanctum | `42300` s ≈ **11 h 45** | `Backend/config/sanctum.php:49` |
| Expiration token OAuth | **24 h** | `SocialiteAuthController.php:167` |
| Timezone applicative | `UTC` (codée en dur) | `Backend/config/app.php:70` |
| Timezone utilisateur | stockée en base, **jamais utilisée** | `user_preferences.timezone` |

### 1.4 Ce qui n'existe pas (malgré la documentation)

- **Aucun package Web Push** (`minishlink/web-push`) dans `Backend/composer.json`. Le contrôleur contient un « stub » qui se contente d'écrire dans les logs.
- **Aucun moteur d'automatisation** : les règles sont stockées, mais rien ne les exécute.
- **Aucun partage public réel** : le frontend génère une URL aléatoire factice ; l'API publique existe mais les drapeaux `public_*` sont à `false` par défaut et jamais activés par l'interface.
- **Aucune persistance** pour les habitudes et les objectifs mensuels.
- **Aucun test de contrôleur, d'authentification ou d'autorisation** : 2 tests d'exemple + 1 test unitaire de règles Brain Dump.
- **Aucune CI** (pas de dossier `.github/`).

### 1.5 Écarts entre les specs et le code

`docs/BACKEND-SPEC.md` décrit une architecture en « service layer » (`BrainDumpService`, `ProductivityAnalyzer`, `CoachEngine`) avec 12 endpoints « Coach ». Le code réel contient un seul service (`DailyPlanBuilder`) et **aucun** endpoint de coach, d'insights, de badges ou d'habitudes.

`docs/FRONTEND-SPEC.md` décrit une PWA avec `vite-plugin-pwa` et des animations Framer Motion. La PWA existe, mais avec un `sw.js` écrit à la main et sans stratégie de version.

`TODOS_FUTURS.txt` liste l'export PDF/Excel, la synchronisation Google Calendar, Slack, les modèles de projets, la recherche globale. **Rien de tout cela n'est implémenté** (l'export CSV/Markdown existe déjà et n'est donc plus à faire).

---

## 2. État réel des fonctionnalités

Légende : ✅ fonctionne · 🟡 partiel / fragile · ❌ factice ou absent

| Fonctionnalité | Backend | Frontend | Verdict | Commentaire |
|---|---|---|---|---|
| Inscription / connexion | ✅ | ✅ | 🟡 | Compte non vérifié bloqué sans recours (P0-2) |
| Mot de passe oublié / reset | ✅ | ✅ | ✅ | Rate limité, réponse neutre |
| Vérification email | ✅ | ✅ | 🟡 | Le renvoi exige d'être connecté : incohérent |
| OAuth Google / Facebook | ✅ | ✅ | 🟡 | Token dans l'URL, liaison par email non vérifié |
| Profil / avatar | ✅ | ✅ | 🟡 | Changement d'email dangereux (P0-3) |
| Tâches (CRUD, sous-tâches) | ✅ | ✅ | ✅ | Limite à 100 tâches, pas de pagination UI |
| Kanban | ✅ | ✅ | 🟡 | Bug de types `onDragStart` |
| Gantt | ✅ | ✅ | 🟡 | Unités d'estimation incohérentes |
| Projets + budget | ✅ | ✅ | ✅ | `spent_seconds` calculé par N+1 |
| Suivi du temps | ✅ | ✅ | ❌ | Pause comptée, arrêt perd le temps |
| Rapport hebdomadaire | ✅ | ✅ | ❌ | Secondes affichées comme minutes |
| Focus / Pomodoro | ✅ | ✅ | 🟡 | Session perdue si le réseau échoue |
| Brain Dump | ✅ | ✅ | 🟡 | Confirmation irréversible, pas de retour arrière |
| Planning du jour | ✅ | ✅ | 🟡 | Dépend du Brain Dump, pas de vraie génération |
| Équipes / rôles | ✅ | ✅ | 🟡 | Projets d'équipe inutilisés, fuite d'invitations |
| Invitations | ✅ | ✅ | 🟡 | Envoi synchrone, échec = 500 |
| Charge de travail (workload) | ✅ | ✅ | ✅ | Non filtré par équipe (voir §3) |
| Commentaires de tâche | ✅ | ✅ | ✅ | — |
| Labels | ✅ | ✅ | ✅ | — |
| Notifications in-app | ✅ | ❌ | ❌ | Le hook est cassé et jamais branché |
| Push navigateur | ❌ (stub) | 🟡 | ❌ | Aucune librairie installée |
| Automatisations | ✅ (stockage) | ✅ | ❌ | Aucun moteur d'exécution |
| Partage public | ✅ (API) | ❌ | ❌ | URL factice côté frontend |
| Habitudes | ❌ | ✅ (local) | ❌ | Perdu à chaque rechargement |
| Objectifs mensuels | ❌ | ✅ (local) | ❌ | Perdu à chaque rechargement |
| Outils | ❌ | ❌ | ❌ | Boutons sans action |
| Analytics | ❌ | ❌ | ❌ | Noms de projets codés en dur |
| Export CSV / Markdown | ❌ | ✅ | ✅ | Fonctionne côté navigateur |
| PWA installable | — | ✅ | 🟡 | Hors ligne réel très limité |

---

## 3. Bugs confirmés (hors sécurité)

Chaque constat est vérifié dans le code. Format : **fichier:ligne** → effet.

### 3.1 Bloquants (crash ou app inutilisable)

**B-1 — `useOffline` ne compile pas et fait planter le dashboard**
`Frontend/src/hooks/useOffline.ts:1` importe seulement `useEffect` et `useCallback`, mais `12`, `13` et `14` appellent `useState`.
→ Erreur `TS2304: Cannot find name 'useState'`. Au runtime, `useOffline()` lève `ReferenceError`.
→ `Header` appelle `useOffline()` (`Header.tsx:35`), et le `Header` est rendu dans **toutes** les pages du dashboard (`Dashboard.tsx:337`). L'application entière tombe en écran blanc dès qu'on entre dans le dashboard.
→ Confirmé par `npx tsc -b` et par lecture.

**B-2 — 33 erreurs TypeScript**
`npx tsc -b` échoue. Répartition : `Dashboard.tsx` (13), `useNotifications.ts` (6), `useOffline.ts` (3), `App.tsx` (3), puis 1 chacun dans `KanbanBoard`, `Projects`, `Tracking`, `AddProjectModal`, `useHabits`, `usePomodoro`, `usePreferences`, `usePushNotifications`.
→ Le `build` Vite réussit uniquement parce que Vite **ne vérifie pas les types**. Une CI sérieuse échouerait.

**B-3 — `useNotifications` référence une variable inexistante**
`Frontend/src/hooks/useNotifications.ts:69`, `92`, `102` utilisent `tasks`, qui n'est ni un paramètre ni un état.
→ `ReferenceError` si le hook est appelé. Aujourd'hui il n'est appelé nulle part, donc c'est du code mort — mais il casse le build de types et donne l'illusion d'une fonctionnalité.

**B-4 — Le backend ne démarre pas**
- Aucun fichier `Backend/.env`.
- `APP_KEY` vide dans `.env.example` et `.env.staging`.
- MySQL non configuré.
→ `php artisan test` : **24 tests passent, 1 échoue** (`Tests\Feature\ExampleTest`, `MissingAppKeyException`).
→ `php artisan route:list` fonctionne car il ne touche ni la base ni le chiffrement.

### 3.2 Perte de données et calculs faux

**B-5 — Supprimer un projet efface l'historique de temps**
`Backend/database/migrations/2026_04_14_000003_create_time_entries_table.php:14-15` :
```php
$table->foreignId('task_id')->nullable()->constrained()->cascadeOnDelete();
$table->foreignId('project_id')->nullable()->constrained()->cascadeOnDelete();
```
`2026_04_14_000002_create_tasks_table.php:13-14` fait de même entre projet → tâche → sous-tâche.

Scénario : l'utilisateur supprime un projet terminé → **toutes les entrées de temps associées sont supprimées**, donc les statistiques, le budget consommé et les rapports changent rétroactivement.
→ C'est le pire bug du produit : le temps mesuré est la valeur centrale de l'application.
→ Correctif attendu : `nullOnDelete()` + conservation de l'historique, ou soft delete.

**B-6 — Le chronomètre compte les pauses**
`Frontend/src/components/dashboard/Tracking.tsx:60-68`
```tsx
const handlePause = () => { setIsTracking(false); };        // arrête juste l'affichage
const handleStop = async () => {
  const duration = Math.floor((endTime - startTimeRef.current) / 1000); // pause incluse
```
- `startTimeRef` n'est jamais modifié à la pause.
- À la reprise, l'intervalle recalcule depuis `startTimeRef` (`:26-28`) : l'affichage **saute** du temps de la pause.
- Au stop, la durée envoyée inclut les pauses.
→ Le temps enregistré est faux à chaque pause.

**B-7 — Le rapport hebdomadaire affiche des secondes comme des minutes**
`Frontend/src/pages/WeeklyReport.tsx:48`, `:77`, `:97-99`
```tsx
const totalTimeMinutes = weekEntries.reduce((acc, e) => acc + e.duration, 0); // duration est en SECONDES
const formatMinutes = (minutes) => `${Math.floor(minutes / 60)}h ${minutes % 60}`; // puis divisé par 60
```
→ 1 h de travail (3600 s) est affiché « 60 h 0 ». Tous les totaux, moyennes et graphiques sont faux.

**B-8 — Le rapport hebdomadaire filtre mal les tâches**
`WeeklyReport.tsx:40-41`
```tsx
new Date(t.due_date || t.id.toString()) >= weekAgo
```
→ Utilise l'**identifiant** de la tâche comme date quand `due_date` est vide : `new Date("42")` donne une date en 2042. Le taux de complétion est donc arbitraire.
→ `:72` compare `updated_at` (mise à jour) au lieu d'une date de complétion réelle : modifier le titre d'une vieille tâche la fait compter comme « terminée cette semaine ».

**B-9 — Les sessions de focus ne sont pas sauvegardées si le réseau échoue**
`Frontend/src/components/dashboard/focus/FocusMode.tsx:130-141`, `:146-183`
```tsx
try { const session = await startFocusSession(taskId, method); setSessionId(session.id); }
catch { setSessionId(null); /* session locale */ }
```
→ Au stop, si `sessionId` est `null`, la durée est calculée localement puis **abandonnée** : rien n'est stocké, ni en base, ni en local, ni dans la file d'attente hors ligne.
→ Une session de 50 minutes hors ligne disparaît.

**B-10 — Les créations hors ligne sont impossibles à synchroniser**
`Frontend/src/lib/offlineStorage.ts:75`
```ts
return `offline_${Date.now()}_${Math.random()...}`;
```
`useTasks.ts` et `useProjects.ts` créent l'élément avec `id: Date.now()`.
→ Si l'utilisateur modifie ou supprime cet élément avant la reconnexion, l'action `PUT /tasks/1730000000000` ou `DELETE /projects/...` renvoie **404**.
→ `syncPendingActions` (`offlineStorage.ts:182-208`) attrape l'erreur, la log, et **garde l'action en attente pour toujours**. La file ne se vide jamais, le compteur reste bloqué, et rien n'indique l'échec à l'utilisateur.
→ Aucun mécanisme d'idempotence (clé client) n'existe côté backend.

**B-11 — Les données mises en cache ne sont pas rattachées à l'utilisateur**
`Frontend/src/lib/offlineStorage.ts:103`
```ts
localStorage.setItem(`timepro_cache_${key}`, ...);
```
Clés fixes : `timepro_cache_tasks`, `timepro_cache_projects`. La file : `timepro_pending_actions` (`:57`).

`AuthContext.tsx:60-70` et `hooks/useUser.ts:34-49` suppriment uniquement `token`.
→ Sur un poste partagé, l'utilisateur B qui se connecte voit les tâches et projets de A (via le cache hors ligne), et surtout **les actions en attente de A sont rejouées avec le token de B**, créant des données dans le compte de B.
→ `offlineStorage.clearUser()` existe (`:231-236`) mais n'est **jamais appelé**.

**B-12 — Les habitudes et objectifs sont perdus au rechargement**
- `hooks/useHabits.ts:1-3` : `useState` local uniquement, aucune trace de `localStorage` ni d'appel API.
- `pages/MonthlyGoals.tsx:14` : liste de départ codée en dur, mutations locales (`:25`, `:32`, `:36`).
→ Toute la page « Habitudes » et « Objectifs mensuels » est une démo. Les données disparaissent en quittant l'onglet.

### 3.3 Incohérences métier

**B-13 — Unités d'estimation contradictoires**
- `Backend/database/migrations/2026_06_01_141204_add_gantt_fields_to_tasks_table.php:15` : `comment('Durée estimée en heures')`.
- `2026_10_07_100200_change_estimated_duration_comment_on_tasks_table.php:12` : `comment('Durée estimée en minutes')`.
- `Frontend/src/components/dashboard/GanttChart.tsx:92-94` : `task.estimated_duration * dayWidth` → traité comme des **jours**.
→ Trois unités différentes pour un même champ. Les barres du Gantt sont fausses dès qu'une estimation existe.

**B-14 — Le calendrier invente des horaires**
`Frontend/src/components/dashboard/Calendar.tsx:22-25`
```tsx
const taskDate = task.dueDate ? new Date(task.dueDate) : new Date(); // tâche sans date = aujourd'hui
const endTime = ... + (90 * 60 * 1000);                              // durée inventée : 1 h 30
```
→ Toute tâche sans échéance apparaît aujourd'hui, avec une durée de 1 h 30 qui n'existe pas.

**B-15 — Analytics affiche des projets qui n'existent pas**
`Frontend/src/components/dashboard/Analytics.tsx:32-40` : `Dashboard Design`, `Website Redesign`, `Team Sync` sont codés en dur, avec des pourcentages issus de clés qui ne correspondent à aucun projet réel (`projectStats['dashboard-design']`).
→ L'écran « Analytique » est un décor.

**B-16 — Les outils ne font rien**
`Frontend/src/components/dashboard/Tools.tsx:111-182` : tous les `<button>` n'ont aucun `onClick`, aucun `href`. Le catalogue (Pomodoro, calculatrice, notes, palette…) est purement visuel.

**B-17 — Le partage de planning est factice**
`Frontend/src/pages/SharePlanningPage.tsx:11`
```tsx
const url = `https://timepro.app/shared/planning/${Math.random().toString(36).slice(2, 10)}`;
```
→ L'URL change à chaque rechargement, ne correspond à aucune donnée, et pointe vers un domaine qui n'existe pas. Aucun appel à l'API publique.

**B-18 — L'API publique est inutilisable**
`Backend/app/Http/Controllers/Api/PublicApiController.php:33-36`, `:113-116`, `:179-182` : chaque endpoint renvoie `403` si le drapeau `public_*` est faux. Les drapeaux sont créés à `false` (`2026_07_25_000001_add_public_sharing_to_user_preferences_table.php`) et **aucune interface ne permet de les activer**.
→ Le partage public ne peut pas fonctionner, même en branchant le frontend.
→ Le cache est de 1 h sans invalidation (`:43`, `:121`, `:187`) : après désactivation du partage, les données restent exposées jusqu'à 1 h.
→ `404` (utilisateur inexistant) vs `403` (existant mais non partagé) permet d'**énumérer les comptes** (`:28` vs `:36`).

**B-19 — Les automatisations ne se déclenchent jamais**
`Backend/app/Http/Controllers/Api/AutomationRuleController.php` : CRUD complet, champ `last_triggered_at` présent, mais **aucun observer, job, middleware ou service** ne lit `automation_rules` (vérifié par recherche globale dans `app/`).
→ L'écran « Automatisations » enregistre des règles inertes.

**B-20 — Les notifications in-app ne sont jamais alimentées**
- `Frontend/src/pages/Dashboard.tsx:337` : `<Header onLogout={logout} onMenuClick={…} />` — aucune prop `notifications`.
- `Header.tsx:26-33` : `notifications = []` par défaut.
→ La cloche affiche toujours zéro. Le backend expose pourtant `GET /notifications`, utilisé seulement par la page `Inbox`.

**B-21 — Le suivi du temps ignore les modifications partielles**
`Backend/app/Http/Controllers/Api/TimeEntryController.php:126-131` : la durée n'est recalculée que si `start_time` **et** `end_time` sont fournis.
→ `PUT /time-entries/{id}` avec seulement `end_time` laisse l'ancienne `duration` : l'entrée devient incohérente.
→ `:58` / `:108` : `duration` fourni par le client est accepté sans vérifier qu'il correspond à `end_time - start_time`.
→ `:79` : `abs($end->diffInSeconds($start))` masque une inversion de dates au lieu de la refuser.

**B-22 — La limite de 100 tâches est silencieuse**
`Backend/app/Http/Controllers/Api/TaskController.php:27` : `->limit(100)->get()` sans pagination.
→ Au-delà de 100 tâches, les plus anciennes disparaissent de l'interface **sans message**. Les statistiques du dashboard ne portent que sur ces 100 tâches.

**B-23 — Les projets d'équipe sont inutilisables**
`Backend/app/Http/Controllers/Api/ProjectController.php:13-18` : `$request->user()->projects()` uniquement. `store` (`:35`) ne renseigne jamais `team_id`.
→ Le champ `team_id` existe (`2026_04_14_151226_add_team_id_to_projects_table.php`) et `Team::projects()` est chargé (`TeamController.php:60`), mais la liste est toujours vide.
→ Les membres d'une équipe ne partagent donc aucun projet.

**B-24 — Échec d'envoi d'email = erreur 500 et invitation fantôme**
`Backend/app/Http/Controllers/Api/TeamController.php:134` : `Mail::to(...)->send(...)` en synchrone, sans `try/catch` ni `queue`.
→ Si le SMTP est mal configuré (c'est le cas : `MAIL_USERNAME` et `MAIL_PASSWORD` vides), l'invitation est créée en base mais la requête renvoie 500. L'admin croit avoir échoué, réessaie, et reçoit « invitation déjà envoyée ».
→ À l'inscription, `AuthController.php:51-73` accepte automatiquement **toutes** les invitations en attente pour l'email, même anciennes.

**B-25 — Deux sources d'authentification côté frontend**
`Frontend/src/context/AuthContext.tsx` et `Frontend/src/hooks/useUser.ts` maintiennent chacun un état `user`. `Settings` reçoit `user` de `useUser`, tandis que `ProtectedRoute` utilise `AuthContext`.
→ Après modification du profil, l'un des deux affiche encore l'ancien nom. Risque de bug difficile à reproduire.

**B-26 — Le zoom est bloqué sur mobile**
`Frontend/index.html:6` : `maximum-scale=1.0, user-scalable=no`.
→ Accessibilité dégradée (WCAG 1.4.4). Sur une PWA, c'est un vrai problème.

---

## 4. Sécurité

### 4.1 Authentification et sessions

**S-1 — Prise de contrôle persistante via changement d'email** — *Critique*
`Backend/app/Http/Controllers/Api/AuthController.php:225-238`
```php
$validated = $request->validate([
  'name' => [...],
  'email' => ['required','email','unique:users,email,'.$request->user()->id],
]);
$request->user()->update($validated);
```
Trois défauts cumulés :
1. Aucun mot de passe actuel demandé.
2. `email_verified_at` n'est pas remis à `null`.
3. Aucun email n'est envoyé à l'ancienne adresse pour prévenir.

Scénario : un jeton volé (XSS, poste partagé, token en `localStorage`) suffit à changer l'email vers une adresse attaquant. Le compte reste « vérifié », donc l'attaquant se connecte normalement, et le propriétaire légitime peut réinitialiser son mot de passe… sans jamais récupérer le compte (l'email de reset part vers l'attaquant).

**S-2 — Compte non vérifié définitivement bloqué** — *Critique (disponibilité)*
`AuthController.php:96-105` : en production, `login` renvoie `403` si l'email n'est pas vérifié, **sans créer de token**.
`Backend/routes/api.php:62-64` : `POST /email/resend` est dans le groupe `auth:sanctum`.
→ Sans token, impossible de renvoyer l'email. Sans email vérifié, impossible d'obtenir un token. **Boucle fermée.** Un utilisateur qui perd l'email de vérification (spam, expiration, changement d'adresse) perd son compte. En local, le problème est masqué par `markEmailAsVerified()` (`:96-98`), donc il n'apparaît pas pendant le développement.

**S-3 — OAuth : token dans l'URL et liaison de compte non vérifiée** — *Élevée*
`SocialiteAuthController.php:161-171` : redirection vers `/auth/callback?token=…&user=…`.
→ Le token apparaît dans l'historique du navigateur, les logs du serveur web, l'en-tête `Referer` et les proxies. Il devrait être dans un fragment `#` ou, mieux, échangé contre un code à usage unique.
`SocialiteAuthController.php:63-79` : si un compte existe avec le même email, le fournisseur est lié **sans vérifier que l'email du fournisseur est vérifié** ni que le compte local l'est. Un fournisseur qui renverrait un email non vérifié permettrait une prise de contrôle.
`SocialiteAuthController.php:84` : `'email' => $socialUser->getEmail()` peut être `null` (Facebook sans email) → violation `NOT NULL` → erreur 500.
`Backend/routes/api.php:31-32` : les routes `redirect` et `callback` n'ont **aucun `throttle`**.
`SocialiteAuthController.php:66-73` : les `access_token` / `refresh_token` des fournisseurs sont stockés **en clair** dans `user_providers`.

**S-4 — Énumération de comptes** — *Moyenne*
- `POST /forgot-password` est bien neutre (`AuthController.php:174`).
- En revanche, `PublicApiController` renvoie `404` si l'utilisateur n'existe pas et `403` s'il existe mais ne partage pas (`:28`/`:36`, `:109`/`:116`, `:175`/`:182`).
→ Un attaquant peut distinguer « compte inexistant » de « compte existant ».

### 4.2 Autorisation et cloisonnement

**S-5 — `depends_on` peut pointer vers la tâche d'un autre utilisateur** — *Élevée (intégrité)*
`TaskController.php:47` : `'depends_on' => ['nullable','exists:tasks,id']`.
Contrairement à `project_id` (`:54-58`) et `parent_id` (`:60-65`), aucune vérification de `user_id` n'est faite au `store`.
→ L'attaquant crée une tâche dépendant de la tâche privée d'un autre utilisateur. Il ne lit pas son contenu, mais :
  - il obtient un **oracle d'existence** (`201` vs `403/422` selon l'id) ;
  - si la tâche cible est supprimée, **sa propre tâche est supprimée par cascade** (`2026_04_15_000002…:12`) ;
  - les statistiques de dépendances sont polluées.
→ `update` fait la vérification (`:135-145`) : la faille est propre au `store`.

**S-6 — Cycles de dépendances possibles** — *Moyenne*
`update` vérifie `depends_on !== $task->id` (`:140-142`) mais pas les cycles indirects (A→B→A) ni `parent_id` formant une boucle.
→ Un cycle peut provoquer une récursion infinie côté client qui parcourt les dépendances.

**S-7 — Fuite des emails et jetons d'invitation** — *Moyenne*
`TeamController.php:60` : `$team->load(['owner','members','projects','invitations'])` est renvoyé à **tout membre**, y compris `viewer`.
→ `invitations` contient `email`, `token`, `role`, `expires_at`. N'importe quel membre voit qui a été invité (PII) et le jeton.
→ Le jeton seul ne permet pas d'accepter (il faut le bon email, `InvitationController.php:43-45`), donc ce n'est pas une escalade directe — mais c'est une fuite de données et un moyen de bloquer une invitation (en l'acceptant depuis le bon compte, ou en la signalant).

**S-8 — Un admin peut promouvoir n'importe qui** — *Moyenne*
`TeamController.php:164-182` : `updateMemberRole` ne vérifie pas que `$user` est membre de l'équipe, ni que l'appelant est propriétaire. Un admin peut donc tenter de modifier le rôle d'un non-membre (sans effet) et surtout **rétrograder un autre admin**, y compris celui qui l'a nommé.
→ Pas d'escalade, mais un admin peut neutraliser les autres admins (dont le propriétaire reste protégé par `owner_id`).

**S-9 — `workload` ignore le périmètre de l'équipe** — *Moyenne*
`TeamController.php:205-214` : pour chaque membre, `TimeEntry::where('user_id', $user->id)` **sans filtrer par équipe**.
→ Les heures affichées incluent le travail privé du membre sur d'autres projets, y compris personnels.
→ `where('start_time','>=',$dateStart)` puis, si `project_id` est fourni, aucun contrôle que ce projet appartient à l'équipe : un membre peut consulter le temps de tous les membres sur **n'importe quel projet** dont il connaît l'id.
→ N+1 : 2 requêtes par membre (`:213-214`).

**S-10 — Absence de politiques centralisées** — *Moyenne (dette)*
Aucun `app/Policies`. Les contrôles sont répétés dans chaque contrôleur, parfois oubliés (S-5). C'est ce qui rend S-5 possible.

### 4.3 Configuration, secrets et dépendances

**S-11 — `.env.staging` est versionné** — *Moyenne*
`Backend/.env.staging` est suivi par Git (`git ls-files` le confirme).
Bonne nouvelle : il ne contient **pas de vrais secrets**, uniquement des placeholders (`${DB_HOST}`, `${DB_PASSWORD}`…) et un `APP_KEY` **vide**.
→ Le fichier est néanmoins inutilisable tel quel et crée un faux sentiment de configuration. Il devrait être supprimé du dépôt et remplacé par un exemple anonymisé.

**S-12 — `CORS` trop permissif pour la production** — *Moyenne*
`Backend/config/cors.php:23-30` inclut `APP_URL` et `FRONTEND_URL` avec `supports_credentials: true`, `allowed_headers: ['*']`, `allowed_methods: ['*']`.
→ Acceptable en local, **dangereux** si `APP_URL` est mal défini en production (une origine arbitraire devient de confiance avec cookies).

**S-13 — Le CSP est appliqué au mauvais endroit** — *Basse/Moyenne*
`SecurityHeaders.php:20` applique un `Content-Security-Policy` très strict à toutes les réponses **API**. Or le SPA est servi par un autre serveur (Vite/Nginx) : il ne reçoit jamais cet en-tête.
→ La protection est donc inefficace là où elle compte, et inutile là où elle s'applique. `connect-src 'self'` casserait même l'API si elle était servie sur un autre domaine.
→ `X-XSS-Protection` est obsolète et ignoré par les navigateurs modernes.

**S-14 — Sessions et cookies** — *Moyenne*
`config/session.php` : `SESSION_DRIVER=database` par défaut, `secure` non forcé (`env('SESSION_SECURE_COOKIE')`), `same_site=lax`.
`.env.example` déclare **deux fois** `SESSION_DOMAIN` (`localhost` puis `null`) : la seconde valeur l'emporte, ce qui annule la première.
→ En production, il faut `secure=true`, `same_site=lax` ou `strict`, et un domaine explicite.

**S-15 — Dépendances vulnérables** — *Élevée*
- `npm audit` : **25 vulnérabilités** (2 basses, 6 moyennes, **17 hautes**, 0 critique).
  - `axios` (direct) : SSRF, pollution de prototype, injection d'en-têtes, contournement `maxBodyLength`.
  - `@remix-run/router` (via `react-router-dom`) : XSS par redirection ouverte.
  - `vite`, `esbuild`, `rollup`, `tar`, `micromatch`, `cross-spawn`… (outils de build).
- `composer audit` : **48 avis** touchant **13 paquets**, dont `guzzlehttp/guzzle` (SSRF, cookies), `laravel/framework`, `symfony/*`.
→ Rien n'est forcément exploitable dans ce contexte, mais `axios` est utilisé sur **toutes** les requêtes et `guzzle` est utilisé par Socialite.

**S-16 — Rate limiting : bonnes bases, trous** — *Moyenne*
- Bien : `login` 5/min, `register` 10/min, `forgot-password` 3/min, `resend` 3/min, API publique 100/min.
- Manquant : OAuth `redirect`/`callback` (`routes/api.php:31-32`), `PUT /user` (changement d'email), `POST /user/password`, invitations.
→ Le changement d'email n'est pas limité, ce qui aggrave S-1.

**S-17 — Upload d'avatar** — *Basse*
`AuthController.php:240-258` : `image|mimes:jpeg,png,jpg,gif,webp|max:2048`, stocké sur le disque `public`, ancien fichier supprimé. C'est correct. Point d'attention : `Storage::disk('public')` doit être servi avec un type MIME forcé (sinon un SVG renommé pourrait poser problème — mais `mimes` l'exclut).

### 4.4 Ce qui est correctement fait

- Mots de passe : `PasswordRule::min(8)->mixedCase()->numbers()->symbols()` (`AuthController.php:25-32`).
- Hachage via `Hash::make` / `Hash::check`.
- Retour neutre de `forgot-password` pour éviter l'énumération.
- Routes de vérification signées (`signed`).
- Jetons Sanctum : le jeton courant est supprimé à la déconnexion (`AuthController.php:219`), et tous les jetons sont supprimés à chaque connexion OAuth (`SocialiteAuthController.php:164`).
- `user_id` vérifié sur la majorité des ressources (`show`, `update`, `destroy`).
- Validation systématique par `$request->validate()` + `$fillable` sur les modèles (pas de mass assignment évident).
- Requêtes Eloquent paramétrées (pas d'injection SQL trouvée).

---

## 5. Offline / PWA

### 5.1 Ce qui fonctionne

- `manifest.json` complet (icônes, `standalone`, `theme_color`).
- Service worker enregistré (`src/main.tsx:7-17`).
- `offlineStorage` : détection de connectivité, cache `localStorage` avec expiration, file d'actions (`create`/`update`/`delete`), abonnés (`subscribe`).
- Cache des tâches et projets, avec repli sur le cache en cas d'erreur réseau (`useTasks.ts`, `useProjects.ts`).
- Indicateur « hors ligne » dans l'en-tête.
- Synchronisation automatique au retour en ligne (`useOffline.ts:37-41`).

C'est une base réelle, pas une maquette. Mais elle n'est pas fiable.

### 5.2 Failles confirmées

| # | Problème | Fichier | Conséquence |
|---|---|---|---|
| O-1 | Le service worker sert **le cache d'abord** pour tout, y compris `index.html` | `public/sw.js:44-84` | Après un déploiement, l'application reste bloquée sur l'ancienne version tant que `CACHE_NAME` n'est pas changé manuellement |
| O-2 | Aucune version de build dans le nom du cache | `sw.js:1` (`time-pro-v2`) | Risque de mélange anciens/nouveaux fichiers |
| O-3 | Les requêtes API ne sont **pas** mises en cache par le SW | `sw.js:51` | Le « offline » dépend entièrement du `localStorage`, pas du cache HTTP |
| O-4 | Les créations hors ligne ont un faux id | `offlineStorage.ts:75`, `useTasks.ts` | Modification/suppression impossible (B-10) |
| O-5 | Aucune résolution d'id après synchro | `offlineStorage.ts:182-208` | L'élément local garde `id: Date.now()` alors que le serveur en a créé un vrai : doublons à la prochaine synchro |
| O-6 | File d'actions **globale**, non liée à l'utilisateur | `offlineStorage.ts:57` | Fuite inter-comptes et rejeu sous le mauvais compte (B-11) |
| O-7 | Aucune purge des actions définitivement en échec | `offlineStorage.ts:182-208` | Compteur bloqué à vie, aucun message |
| O-8 | Les actions ne sont jamais purgées à la déconnexion | `AuthContext.tsx:60-70`, `useUser.ts:41-49` | Idem O-6 |
| O-9 | Aucun conflit géré (dernier écrivain gagne) | `syncPendingActions` | Écrasement silencieux de modifications faites sur un autre appareil |
| O-10 | Pas de Background Sync | `sw.js` | La synchro ne se fait que si l'onglet est ouvert |
| O-11 | Les polices Google Fonts ne sont pas en cache | `index.html:20-22` | Rendu dégradé hors ligne |
| O-12 | Pas de page de repli hors ligne | `sw.js:78` | `caches.match('/')` renvoie souvent `undefined` si l'installation a échoué |

**Scénario catastrophe confirmé** : utilisateur hors ligne → crée 3 tâches → se reconnecte → les 3 `POST` partent → succès serveur → `markActionSynced` → mais les ids locaux restent `Date.now()`. Il modifie une de ces tâches → `PUT /tasks/1730…` → 404 → l'action reste en attente pour toujours. Au prochain chargement, `GET /tasks` renvoie les vraies tâches **plus** les copies locales en cache → doublons visibles.

### 5.3 Ce qu'il faudra décider

Deux stratégies possibles, à trancher avant de coder :

1. **Cache + file d'attente améliorée** (plus simple) : ids temporaires côté client, table de correspondance id temporaire → id serveur, clé d'idempotence envoyée au backend, purge à la déconnexion, actions rattachées à `user_id`.
2. **Vraie base locale** (IndexedDB + Dexie) avec synchronisation différentielle : plus lourd, mais c'est ce que promet la spec « offline-first ».

Le code actuel est à mi-chemin et ne tient aucune des deux promesses.

---

## 6. Qualité, performance, exploitation

### 6.1 Résultats des commandes

| Commande | Résultat |
|---|---|
| `npx tsc -b` | **Échec — 33 erreurs** dans 12 fichiers |
| `npm run build` | **Succès** — 2 899 modules, JS **851,84 kB** (gzip 235,74 kB), alerte chunk > 500 kB |
| `npm run lint` | 0 erreur, 3 avertissements |
| `php artisan test` | **24 passent, 1 échoue** (`MissingAppKeyException`) |
| `php artisan route:list` | Fonctionne (91 routes) |
| `php -l` (contrôleurs) | Aucune erreur de syntaxe |
| `npm audit` | 25 vulnérabilités (17 hautes) |
| `composer audit` | 48 avis / 13 paquets |
| Tests frontend | **Aucun** (pas de Vitest, pas de Playwright, pas de script `test`) |

### 6.2 Performance

- **Bundle 851 kB** : `framer-motion`, `@hello-pangea/dnd`, `date-fns` et `lucide-react` sont tous dans le chunk principal. Aucun découpage par route (`React.lazy` absent).
- **N+1 confirmés** :
  - `Project::getSpentSecondsAttribute()` fait `timeEntries()->sum()` **par projet** → 20 projets = 20 requêtes (`app/Models/Project.php:61-63`).
  - `TeamController::workload` : 2 requêtes par membre (`:213-214`).
  - `FocusController::dailyReport` : plusieurs requêtes successives, acceptable à cette échelle.
- **Absence d'index** sur les colonnes filtrées : `tasks.user_id` (indexé par la clé étrangère), mais pas de composite `(user_id, status)`, pas d'index sur `time_entries.start_time`, ni sur `notifications.is_read`.
- **`limit(100)`** sur les tâches (B-22), `paginate(20)` sur les projets mais l'UI ne pagine pas.
- **Cache** : `CACHE_STORE=database` par défaut. Le cache public de 1 h n'est jamais invalidé (B-18).
- **Le backend n'utilise pas de queue pour les emails** (`QUEUE_CONNECTION=database` mais `Mail::send` en synchrone).

### 6.3 Contraintes de base manquantes

| Table | Manque | Effet |
|---|---|---|
| `user_preferences` | pas de `UNIQUE(user_id)` | Deux lignes possibles → préférences incohérentes (course entre `index` et `store`) |
| `push_subscriptions` | pas de `UNIQUE(user_id, endpoint)` | Doublons d'abonnements → notifications push en double |
| `team_invitations` | pas de `UNIQUE(team_id, email, accepted_at)` | Invitations multiples |
| `time_entries` | pas d'index sur `start_time` | Stats lentes |
| `notifications` | pas d'index sur `(user_id, is_read)` | Compteur non lu lent |

### 6.4 Exploitation

- Aucun fichier `.env` → impossible de lancer l'API.
- Aucun `Dockerfile`, `docker-compose`, script de déploiement.
- Aucune CI/CD.
- `.gitignore` du backend n'exclut pas `.env.staging` (il est suivi).
- `Frontend/tsconfig.app.tsbuildinfo` et `Frontend/tsconfig.node.tsbuildinfo` sont apparus non suivis après `tsc` : ils doivent être ajoutés au `.gitignore` (ou supprimés avec votre accord).
- `docs/` décrit des fonctionnalités qui n'existent pas : un nouveau développeur sera induit en erreur.

### 6.5 Tests

- `tests/Unit/BrainDumpRulesTest.php` : bon test unitaire des règles d'estimation et de priorité.
- `tests/Feature/ExampleTest.php` : test d'exemple qui échoue.
- **Aucun test** sur : authentification, autorisation, isolation entre utilisateurs, chronomètre, calcul du budget, offline, invitations.
→ Les bugs P0-2, P0-3, P0-4, S-5 auraient tous été attrapés par un test d'intégration basique.

---

## 7. Ce qui manque (écarts avec les specs et les TODO)

### 7.1 Promis par `docs/` et absent

| Spec | Attendu | Réalité |
|---|---|---|
| BACKEND §4 | 6 services (BrainDump, Eisenhower, DailyPlan, ProductivityAnalyzer, CoachEngine, Insight) | 1 seul (`DailyPlanBuilder`) |
| BACKEND §5 | Endpoints `/insights`, `/coach`, `/badges`, `/habits` | Absents |
| BACKEND §3 | Tables `daily_plans`, `time_insights`, `user_habits`, `user_badges` | Absentes (seules `brain_dumps`, `brain_dump_items`, `focus_sessions` existent) |
| FRONTEND §3 | Coach Card alimentée par le backend | `generateInsights()` local, heuristique côté client |
| FRONTEND §10 | Onboarding complet | Existe mais les réponses ne pilotent presque rien |
| FRONTEND §12 | Notifications intelligentes | Boîte de réception vide, hook cassé |
| TODOS §1 | Google Calendar, Slack, Outlook | Absents |
| TODOS §2 | Export **PDF** et **Excel** | CSV et Markdown seulement |
| TODOS §3 | Templates de projets, clone | Absents |
| TODOS §4 | Recherche globale, filtres sauvegardés | Absents (la barre de recherche de l'en-tête ne fait rien) |

### 7.2 Promis par l'interface et absent

- « Analytics » (données factices).
- « Outils » (décor).
- « Objectifs mensuels » (perdus au rechargement).
- « Habitudes » (perdues au rechargement).
- « Partage public » (URL factice).
- « Automatisations » (règles inertes).
- « Notifications » (cloche toujours vide).
- « Push » (stub).
- « Recherche » dans l'en-tête.

### 7.3 Manques techniques

- Pas de gestion d'erreur globale (aucun `<ErrorBoundary>`, aucun toast ; beaucoup de `console.error`).
- Pas d'états de chargement homogènes.
- Pas de mode sombre persistant côté serveur (`dark_mode` existe dans les préférences mais n'est pas synchronisé avec `ThemeContext`).
- Pas de limite de taille / pagination côté UI.
- Pas d'accessibilité : `user-scalable=no`, boutons sans `aria-label`, modales sans focus trap.
- Pas de versionnement d'API (`/api/v1`).
- Pas de `soft deletes` sur les entités métier.

---

## 8. Priorités

### P0 — À faire avant toute démonstration (bloquant)

| ID | Action | Réf. | Estimation |
|---|---|---|---|
| P0-1 | Créer un `.env` local, générer `APP_KEY`, configurer MySQL, lancer les migrations | B-4, S-11 | 0,5 j |
| P0-2 | Corriger le blocage des comptes non vérifiés (route `resend` publique + rate limit, ou autoriser un token restreint) | S-2 | 0,5 j |
| P0-3 | Exiger le mot de passe actuel + re-vérifier l'email au changement d'adresse | S-1 | 0,5 j |
| P0-4 | Remplacer les cascades destructrices par `nullOnDelete()` / soft delete | B-5 | 1 j |
| P0-5 | Réparer `useOffline` et les 33 erreurs TypeScript | B-1, B-2 | 1 j |
| P0-6 | Rendre le chronomètre exact (cumul de segments, pause réelle) | B-6 | 1 j |
| P0-7 | Scoper cache et file d'attente par utilisateur, purger à la déconnexion | B-11, O-6, O-8 | 1 j |
| P0-8 | Corriger la synchronisation hors ligne (ids, résolution, purge) | B-10, O-4, O-5, O-7 | 2 j |

**Total P0 : environ 7,5 jours.**

### P1 — Nécessaire pour un produit crédible

| ID | Action | Réf. |
|---|---|---|
| P1-1 | Vérifier `depends_on` au `store` + détecter les cycles | S-5, S-6 |
| P1-2 | Corriger le rapport hebdomadaire (unités + dates) | B-7, B-8 |
| P1-3 | Persister les sessions de focus, même hors ligne | B-9 |
| P1-4 | Brancher ou supprimer les notifications in-app | B-20, B-3 |
| P1-5 | Soit installer `web-push` + VAPID, soit retirer l'UI push | B-2, §1.4 |
| P1-6 | Implémenter un moteur d'automatisation minimal ou masquer l'écran | B-19 |
| P1-7 | Rendre le partage public réel (UI des drapeaux, invalidation du cache, anti-énumération) | B-17, B-18, S-4 |
| P1-8 | Corriger les invitations (queue, `try/catch`, fuite des jetons) | B-24, S-7 |
| P1-9 | Sécuriser OAuth (token hors URL, email vérifié, throttle, stockage chiffré) | S-3 |
| P1-10 | Mettre à jour les dépendances vulnérables | S-15 |
| P1-11 | Corriger `workload` (périmètre équipe, N+1) | S-9 |

**Total P1 : environ 6 à 8 jours.**

### P2 — Qualité et cohérence

- Choisir **une** unité pour `estimated_duration` et l'appliquer partout (B-13).
- Corriger le calendrier (B-14) et Analytics (B-15).
- Persister habitudes et objectifs, ou les retirer (B-12).
- Brancher les outils ou les retirer (B-16).
- Corriger `TimeEntry::update` (B-21).
- Pagination des tâches (B-22).
- Projets d'équipe (B-23).
- Contraintes `UNIQUE` manquantes (§6.3).
- Timezone : utiliser `user_preferences.timezone` ou passer l'app en `Europe/Paris`.
- Découper le bundle (`React.lazy`, import dynamique de `framer-motion`).
- Corriger la PWA (versioning, `index.html` network-first, page de repli).
- `secure`/`same_site`/`SESSION_DOMAIN` dupliqué (§S-14).
- CSP au bon endroit (§S-13).
- Accessibilité : retirer `user-scalable=no` (B-26).
- Fusionner `AuthContext` et `useUser` (B-25).
- Réécrire `docs/` pour refléter le réel.

### P3 — Confort

- `tsbuildinfo` dans `.gitignore`.
- Supprimer `.env.staging` du dépôt.
- Exporter en PDF/Excel.
- Recherche globale, filtres sauvegardés.
- Templates de projets.

---

## 9. Plan de travail proposé

### Phase 1 — Remettre le projet en état de marche (2 jours)

1. Créer `Backend/.env` à partir de `.env.example` (avec votre accord : c'est un fichier local, non versionné).
2. `php artisan key:generate`.
3. Configurer MySQL, `php artisan migrate`, vérifier `php artisan test` → 25/25.
4. Corriger `useOffline.ts` + les 33 erreurs TypeScript.
5. Ajouter `npm run typecheck` et le brancher dans un script `check`.

**Critère de sortie** : `tsc` = 0 erreur, `php artisan test` = 100 % vert, l'application se lance.

### Phase 2 — Sécuriser l'authentification (1,5 jour)

1. `resend` accessible sans token mais limité par email + IP, avec réponse neutre.
2. Changement d'email : mot de passe actuel + `email_verified_at = null` + notification à l'ancienne adresse.
3. OAuth : code d'échange à usage unique au lieu du token dans l'URL, vérification de l'email fournisseur, `email` obligatoire, throttle.
4. Tests d'intégration sur ces trois parcours.

**Critère de sortie** : tests de non-régression sur S-1, S-2, S-3.

### Phase 3 — Protéger les données (1,5 jour)

1. Auditer toutes les clés étrangères et remplacer les `cascadeOnDelete` destructrices par `nullOnDelete` (ou soft delete).
2. Ajouter les `UNIQUE` manquants.
3. Ajouter `depends_on` au contrôle d'appartenance + détection de cycles.
4. Migration de sauvegarde : vérifier qu'aucune donnée de temps n'est perdue sur une base de test.

**Critère de sortie** : test « supprimer un projet conserve ses entrées de temps ».

### Phase 4 — Fiabiliser le temps mesuré (2 jours)

1. Chronomètre : segments `start`/`pause`/`resume`/`stop`, temps cumulé = somme des segments actifs.
2. Focus : persistance locale + envoi différé.
3. Rapport hebdomadaire : secondes → minutes, dates de complétion réelles.
4. Tests unitaires sur les calculs.

**Critère de sortie** : un scénario « 25 min travail, 5 min pause, 10 min travail » produit 35 min, pas 40.

### Phase 5 — Offline fiable (3 jours)

1. Trancher la stratégie (cache amélioré vs IndexedDB).
2. Ids temporaires + table de correspondance + clé d'idempotence côté API.
3. File scopée par `user_id`, purge à la déconnexion, purge des échecs définitifs.
4. Service worker : `index.html` en network-first, cache versionné par build, page de repli.
5. Tests manuels documentés (avion, retour réseau, changement de compte).

**Critère de sortie** : création hors ligne → reconnexion → modification → tout est cohérent, aucun doublon.

### Phase 6 — Fonctionnalités factices (3 jours)

Décision produit nécessaire, fonctionnalité par fonctionnalité :
- **brancher** (notifications, partage public, automatisations, push),
- ou **retirer** (outils, analytics, objectifs/habitudes si non priorisés).

Mon avis : brancher les notifications et le partage (peu coûteux, forte valeur), retirer « Outils » et « Analytics » tant qu'ils n'ont pas de contenu réel.

### Phase 7 — Qualité et performance (2 jours)

1. Découpage du bundle, `React.lazy`.
2. Index de base, correction des N+1.
3. Contraintes et validations restantes.
4. `docs/` réécrits.
5. CI minimale (lint + types + tests).

### Phase 8 — Finalisation (1 jour)

1. `.env.staging` retiré du dépôt.
2. `.gitignore` complété.
3. `npm audit` / `composer audit` traités.
4. Checklist de déploiement.

**Estimation totale : 15 à 17 jours de travail.**
Les phases 1 à 4 (7 jours) suffisent à rendre l'application **démonstrable et sûre**. Les phases 5 à 8 la rendent **vendable**.

---

## Ce que je n'ai pas fait

- Je n'ai modifié, supprimé ou renommé **aucun** fichier de code.
- Je n'ai pas créé de `.env` ni touché à la base de données.
- Je n'ai pas lancé `npm install` ni `composer install` (les dépendances étaient déjà présentes).
- Je n'ai pas exécuté le serveur de développement ni le serveur Laravel.
- Je n'ai pas corrigé les 33 erreurs TypeScript : elles sont listées, pas réparées.

## Artefacts non suivis présents dans le dépôt

- `AUDIT-TIMEPRO.md` (ce document).
- `Frontend/tsconfig.app.tsbuildinfo` et `Frontend/tsconfig.node.tsbuildinfo`, générés par `npx tsc -b`.
- Le stash `npm install lock markers (master)` est conservé, non touché.

---

## Décision demandée

**Je ne corrige rien avant votre accord explicite.**

Trois options :

1. **Démarrer par la phase 1 seule** (remettre le projet en marche : `.env`, `APP_KEY`, MySQL, 33 erreurs TypeScript). C'est le prérequis à tout le reste. *Recommandé.*
2. **Démarrer par la sécurité** (phase 2 : P0-2 et P0-3), sans toucher au reste.
3. **Suivre le plan complet** phase par phase, avec un point de validation après chaque phase.

Dites-moi laquelle vous choisissez, et si vous m'autorisez à créer un fichier `Backend/.env` local (non versionné) pour la phase 1.
