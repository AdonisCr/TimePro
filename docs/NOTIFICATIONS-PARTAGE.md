# Notifications et partage public

Ce document décrit la mise en place des deux fonctionnalités branchées en Phase 6.

## 1. Notifications dans l'application

### Ce qui crée une notification

| Événement | Destinataire | Type |
|---|---|---|
| Invitation à rejoindre une équipe | Personne invitée (si elle a déjà un compte) | `team_invitation` |
| Acceptation d'une invitation | Administrateurs de l'équipe (sauf le nouvel arrivant) | `team_member_joined` |
| Tâche arrivant à échéance dans les 24 h | Propriétaire de la tâche | `task_due` |

Les notifications sont visibles dans la cloche de l'en-tête et dans la Boîte de réception.

### Rappels d'échéance

La commande suivante crée les rappels (une seule fois par tâche et par jour) :

```bash
cd Backend
php artisan notifications:due-soon
```

Elle est planifiée chaque jour à 08:00 dans `routes/console.php`.

En production, le planificateur Laravel doit être lancé par une tâche cron :

```cron
* * * * * cd /chemin/vers/Backend && php artisan schedule:run >> /dev/null 2>&1
```

Le réglage « Rappels de tâches » (Paramètres → Notifications) permet de les désactiver.

## 2. Notifications push (Web Push)

### Générer les clés VAPID

```bash
cd Backend
php artisan push:generate-keys --write
```

La commande écrit les clés dans :

- `Backend/.env` : `VAPID_PUBLIC_KEY` et `VAPID_PRIVATE_KEY`
- `Frontend/.env` : `VITE_VAPID_PUBLIC_KEY`

Ces fichiers ne sont jamais commités. Les variables attendues sont documentées dans
`Backend/.env.example` et `Frontend/.env.example`.

### Activation

Le bouton d'activation apparaît dans l'en-tête uniquement :

1. si une clé VAPID publique est configurée,
2. et en production (le service worker n'est pas actif en développement).

Le navigateur enregistre l'abonnement via `POST /api/notifications/subscribe`.
L'envoi réel utilise la bibliothèque `minishlink/web-push`.

Sans clés VAPID, le bouton est masqué : aucune promesse non tenue.

## 3. Partage public du planning

### Réglages

Paramètres → Partage, ou page « Partager le planning » :

- `public_planning` : planning du jour (tâches et temps travaillé) ;
- `public_stats` : statistiques globales ;
- `public_projects` : liste des projets et avancement.

Tout est désactivé par défaut.

### Lien public

Une fois `public_planning` activé :

```text
https://<ton-domaine>/shared/planning/<userId>
```

La page publique est accessible sans connexion et interroge :

- `GET /api/public/planning/{userId}?date=YYYY-MM-DD`
- `GET /api/public/stats/{userId}` (si activé)
- `GET /api/public/projects/{userId}` (si activé)

La désactivation est immédiate : le contrôle du réglage est fait avant la lecture du cache.

### Confidentialité

- Le lien ne contient que l'identifiant numérique de l'utilisateur.
- Aucun email, mot de passe ou description de temps n'est exposé.
- Seules les tâches **du jour** sont publiées, pas les tâches sans échéance.
