# TimePro - Backend

API RESTful Laravel pour la gestion du temps et des tâches.

## 🛠️ Stack Technique

- **PHP 8.2+**
- **Laravel 12**
- **Laravel Sanctum** (Auth)
- **MySQL/PostgreSQL/SQLite**

## ⚡ Installation

```bash
# 1. Installer les dépendances
composer install

# 2. Créer le fichier .env
cp .env.example .env

# 3. Générer la clé API
php artisan key:generate

# 4. Configurer la base de données dans .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=timepro
# DB_USERNAME=root
# DB_PASSWORD=

# 5. Lancer les migrations
php artisan migrate

# 6. Servir l'API
php artisan serve
```

## 🔧 Configuration .env

```env
APP_NAME=TimePro
APP_ENV=local
APP_URL=http://localhost:8000

FRONTEND_URL=http://localhost:5173

DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database/database.sqlite

SANCTUM_STATEFUL_DOMAINS=localhost:5173
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## 🗄️ Base de données locale (sans sudo)

Si aucun serveur MySQL n'est disponible sur la machine, le script
`scripts/dev-db.sh` démarre une instance MySQL dédiée, stockée dans
`Backend/.mysql-data/` (ignoré par Git).

```bash
./scripts/dev-db.sh start   # démarre MySQL sur 127.0.0.1:3307
./scripts/dev-db.sh status  # vérifie que ça répond
./scripts/dev-db.sh stop    # arrête proprement
./scripts/dev-db.sh shell   # ouvre le client mysql
```

Le fichier `.env` doit alors contenir `DB_PORT=3307`, `DB_USERNAME=root`
et `DB_PASSWORD=` (vide). Le script crée automatiquement la base
`time_tracking` ; il reste à lancer `php artisan migrate`.

> Note : le script copie le binaire `mysqld` dans `/tmp`, car AppArmor
> (sécurité Ubuntu) interdit au binaire système d'écrire dans le projet.
> C'est un contournement réservé au développement local.

## 🚀 Commandes Utiles

```bash
# Migrations
php artisan migrate
php artisan migrate:fresh

# Seeder la DB
php artisan db:seed

# Clear cache
php artisan config:clear
php artisan cache:clear

# Routes API
php artisan route:list --path=api
```

## 🔐 API Endpoints

| Méthode | Route | Description |
|--------|-------|------------|
| POST | `/api/register` | Inscription |
| POST | `/api/login` | Connexion |
| POST | `/api/logout` | Déconnexion |
| GET | `/api/user` | Profil utilisateur |
| GET | `/api/tasks` | Liste des tâches |
| POST | `/api/tasks` | Créer une tâche |
| PUT | `/api/tasks/{id}` | Modifier tâche |
| DELETE | `/api/tasks/{id}` | Supprimer tâche |
| GET | `/api/projects` | Liste des projets |
| POST | `/api/projects` | Créer projet |
| GET | `/api/time-entries` | Suivi du temps |
| POST | `/api/time-entries` | Ajouter temps |

Voir `routes/api.php` pour tutti gli endpoint.

## 📁 Structure

```
app/
├── Http/Controllers/Api/
│   ├── AuthController.php
│   ├── TaskController.php
│   ├── ProjectController.php
│   └── TimeEntryController.php
├── Models/
│   ├── User.php
│   ├── Task.php
│   ├── Project.php
│   └── TimeEntry.php
routes/
└── api.php
```

## 🔒 Sécurité

- Rate limiting sur routes publiques
- Tokens Short-lived (24h)
- CORS configuré
- Headers sécurité (CSP, X-Frame, etc.)

## 🧪 Tests

```bash
./scripts/test.sh
```

Le script utilise `php artisan test` et charge automatiquement l'extension
`pdo_sqlite` depuis `Backend/.php-ext/` si elle n'est pas installée sur la
machine (les tests utilisent SQLite en mémoire, jamais la base de dev).

## 📦 Déploiement

```bash
# Production
composer install --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

---

**TimePro** - Gestion intelligente du temps 🕐