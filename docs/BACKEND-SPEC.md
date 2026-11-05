# Time Pro — Spécification Backend Complète

> **Document de conception, pas un état des lieux.**
> Il décrit la cible imaginée au départ et peut mentionner des fonctions qui ne sont
> pas encore livrées. Pour savoir ce qui existe réellement aujourd'hui, voir
> [`ETAT-ACTUEL.md`](./ETAT-ACTUEL.md).


> **Architecture** : Laravel 12 + PHP 8.2 + Sanctum + MySQL + Redis
> **Objectif** : Backend scalable, maintainable, prêt pour millions d'utilisateurs.

---

## TABLE DES MATIÈRES

1. [Architecture Système](#1-architecture-système)
2. [Structure de Fichiers](#2-structure-de-fichiers)
3. [Schéma de Base de Données](#3-schéma-de-base-de-données)
4. [Service Layer](#4-service-layer)
5. [Endpoints API](#5-endpoints-api)
6. [Jobs & Queues](#6-jobs--queues)
7. [Scheduler (Cron)](#7-scheduler-cron)
8. [Sécurité](#8-sécurité)
9. [Cache Strategy](#9-cache-strategy)
10. [Tests](#10-tests)
11. [Déploiement](#11-déploiement)
12. [Liste des Tâches Backend](#12-liste-tâches)

---

## 1. ARCHITECTURE SYSTÈME

### Principe

```
Couche Presentation  →  Couche API  →  Couche Service  →  Couche Data
     (Frontend)          (Controllers)    (Business Logic)    (Models/DB)
```

### Séparation des responsabilités

| Couche | Rôle | Fichiers |
|--------|------|----------|
| **Controllers** | Recevoir la requête, valider, retourner la réponse | `app/Http/Controllers/Api/` |
| **Services** | Logique métier, règles de décision | `app/Services/` |
| **Repositories** | Accès données, requêtes complexes | `app/Repositories/` |
| **Models** | Relations, scopes, accessors | `app/Models/` |
| **Jobs** | Tâches asynchrones (email, calcul, sync) | `app/Jobs/` |
| **Events** | Découplage entre composants | `app/Events/` |
| **Listeners** | Réaction aux événements | `app/Listeners/` |

### Flux de données

```
HTTP Request
    │
    ▼
Route (api.php)
    │
    ▼
Controller@index
    │
    ▼
Service@process
    │
    ├──▶ Repository@query (data)
    │
    ├──▶ Validation (FormRequest)
    │
    └──▶ Response (JsonResource)
```

---

## 2. STRUCTURE DE FICHIERS

```
Backend/
├── app/
│   ├── Console/
│   │   └── Commands/
│   │       ├── GenerateDailyInsights.php
│   │       ├── ProcessRecurringTasks.php
│   │       └── SendMorningBrief.php
│   ├── Events/
│   │   ├── TaskCompleted.php
│   │   ├── TaskCreated.php
│   │   ├── DailyPlanCreated.php
│   │   └── BrainDumpCompleted.php
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── BrainDumpController.php
│   │   │   ├── DailyPlanController.php
│   │   │   ├── FocusSessionController.php
│   │   │   ├── InsightController.php
│   │   │   ├── LabelController.php
│   │   │   ├── NotificationController.php
│   │   │   ├── ProjectController.php
│   │   │   ├── TaskCommentController.php
│   │   │   ├── TaskController.php
│   │   │   ├── TeamController.php
│   │   │   ├── TimeEntryController.php
│   │   │   └── UserPreferenceController.php
│   │   ├── Middleware/
│   │   │   ├── SecurityHeaders.php
│   │   │   └── EnsureTeamMember.php
│   │   └── Resources/
│   │       ├── TaskResource.php
│   │       ├── ProjectResource.php
│   │       ├── DailyPlanResource.php
│   │       ├── InsightResource.php
│   │       └── BrainDumpResource.php
│   ├── Jobs/
│   │   ├── ClassifyBrainDumpItems.php
│   │   ├── GenerateDailyPlan.php
│   │   ├── CalculateProductivityScore.php
│   │   ├── SendSmartNotification.php
│   │   └── ProcessRecurringTask.php
│   ├── Listeners/
│   │   ├── SendTaskCompletedNotification.php
│   │   └── UpdateUserHabits.php
│   ├── Mail/
│   │   ├── TeamInvitationMail.php
│   │   └── WeeklyReportMail.php
│   ├── Models/
│   │   ├── BrainDumpItem.php
│   │   ├── BrainDumpSession.php
│   │   ├── DailyPlan.php
│   │   ├── DailyPlanItem.php
│   │   ├── FocusSession.php
│   │   ├── Label.php
│   │   ├── Notification.php
│   │   ├── Project.php
│   │   ├── Task.php
│   │   ├── TaskComment.php
│   │   ├── Team.php
│   │   ├── TeamInvitation.php
│   │   ├── TeamMember.php
│   │   ├── TimeEntry.php
│   │   ├── TimeInsight.php
│   │   ├── User.php
│   │   ├── UserHabit.php
│   │   └── UserPreference.php
│   ├── Providers/
│   │   ├── AppServiceProvider.php
│   │   └── EventServiceProvider.php
│   └── Repositories/
│       ├── BrainDumpRepository.php
│       ├── DailyPlanRepository.php
│       ├── InsightRepository.php
│       ├── ProjectRepository.php
│       ├── TaskRepository.php
│       └── TimeEntryRepository.php
├── database/
│   ├── factories/
│   │   ├── TaskFactory.php
│   │   ├── ProjectFactory.php
│   │   └── TimeEntryFactory.php
│   ├── migrations/
│   │   └── (voir schéma complet ci-dessous)
│   └── seeders/
│       ├── DatabaseSeeder.php
│       └── TaskSeeder.php
├── routes/
│   └── api.php
├── config/
│   ├── app.php
│   ├── cache.php        ← Redis
│   ├── database.php
│   ├── queue.php        ← Redis/database
│   └── sanctum.php
└── tests/
    ├── Unit/
    │   ├── Services/
    │   │   ├── EisenhowerClassifierTest.php
    │   │   ├── DailyPlanBuilderTest.php
    │   │   └── BrainDumpServiceTest.php
    │   └── Models/
    │       ├── TaskTest.php
    │       └── ProjectTest.php
    └── Feature/
        ├── Api/
        │   ├── BrainDumpTest.php
        │   ├── DailyPlanTest.php
        │   ├── TaskTest.php
        │   └── AuthTest.php
        └──TestCase.php
```

---

## 3. SCHÉMA DE BASE DE DONNÉES

### Tables Existantes (déjà en production)

#### users
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    profile_photo_url VARCHAR(500) NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

#### projects
```sql
CREATE TABLE projects (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    team_id BIGINT UNSIGNED NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    color VARCHAR(7) DEFAULT '#00B4DB',
    status ENUM('active', 'completed', 'archived') DEFAULT 'active',
    deadline DATE NULL,
    time_budget INT UNSIGNED NULL,        -- secondes
    time_budget_warning INT UNSIGNED NULL, -- pourcentage
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);
```

#### tasks
```sql
CREATE TABLE tasks (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    project_id BIGINT UNSIGNED NULL,
    parent_id BIGINT UNSIGNED NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('todo', 'in_progress', 'done') DEFAULT 'todo',
    due_date DATE NULL,
    start_date DATE NULL,
    estimated_duration INT UNSIGNED NULL, -- secondes
    is_completed BOOLEAN DEFAULT FALSE,
    `order` INT DEFAULT 0,
    recurrence ENUM('none', 'daily', 'weekly', 'monthly') DEFAULT 'none',
    recurrence_end_date DATE NULL,
    recurrence_count INT NULL,
    depends_on BIGINT UNSIGNED NULL,
    eisenhower_quadrant ENUM(
        'urgent_important', 
        'important_not_urgent', 
        'urgent_not_important', 
        'neither'
    ) NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (parent_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (depends_on) REFERENCES tasks(id) ON DELETE SET NULL,
    INDEX idx_user_status (user_id, status),
    INDEX idx_user_due_date (user_id, due_date),
    INDEX idx_project (project_id)
);
```

#### time_entries
```sql
CREATE TABLE time_entries (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    task_id BIGINT UNSIGNED NULL,
    project_id BIGINT UNSIGNED NULL,
    description TEXT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NULL,
    duration INT UNSIGNED NULL, -- secondes
    is_manual BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, start_time)
);
```

#### labels
```sql
CREATE TABLE labels (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#00B4DB',
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### label_task (pivot)
```sql
CREATE TABLE label_task (
    label_id BIGINT UNSIGNED NOT NULL,
    task_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (label_id, task_id),
    FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

#### notifications
```sql
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'morning_brief', 'deadline_warning', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSON NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_read (user_id, is_read)
);
```

#### user_preferences
```sql
CREATE TABLE user_preferences (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED UNIQUE NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Europe/Paris',
    work_start_time TIME DEFAULT '09:00:00',
    work_end_time TIME DEFAULT '18:00:00',
    peak_productivity_hours JSON,      -- ["morning", "afternoon"]
    task_duration_preference VARCHAR(20), -- 'pomodoro', 'long_blocks', 'flexible'
    work_style VARCHAR(20),            -- 'structured', 'flexible'
    has_recurring_tasks BOOLEAN DEFAULT FALSE,
    goals JSON,                        -- ["finish_project", "improve_productivity"]
    daily_time_dedication VARCHAR(20), -- '1_2h', '3_4h', '4h_plus'
    planning_style VARCHAR(20),        -- 'strict', 'flexible'
    receive_reminders BOOLEAN DEFAULT TRUE,
    unplanned_tasks_handling VARCHAR(20), -- 'immediate', 'later', 'ignore'
    works_in_team BOOLEAN DEFAULT FALSE,
    needs_to_share BOOLEAN DEFAULT FALSE,
    use_labels BOOLEAN DEFAULT TRUE,
    interface_preference VARCHAR(20),  -- 'visual', 'list'
    dark_mode VARCHAR(10) DEFAULT 'auto', -- 'light', 'dark', 'auto'
    personal_development_goals JSON,
    personal_dev_time VARCHAR(20),
    habits_to_develop JSON,
    productivity_challenges JSON,
    has_routines BOOLEAN DEFAULT FALSE,
    life_priorities JSON,
    success_definition VARCHAR(50),
    main_time_challenge VARCHAR(50),
    app_expectations TEXT,
    has_hobbies_to_plan BOOLEAN DEFAULT FALSE,
    other_tools_used JSON,
    specific_constraints TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### teams
```sql
CREATE TABLE teams (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    owner_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### team_members
```sql
CREATE TABLE team_members (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    team_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    role ENUM('admin', 'member', 'viewer') DEFAULT 'member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE KEY unique_member (team_id, user_id),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### task_comments
```sql
CREATE TABLE task_comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### automation_rules
```sql
CREATE TABLE automation_rules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(50) NOT NULL, -- 'status_change', 'due_date_passed', etc.
    trigger_config JSON NULL,
    action_type VARCHAR(50) NOT NULL,  -- 'move_to_status', 'add_label', etc.
    action_config JSON NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### team_invitations
```sql
CREATE TABLE team_invitations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    team_id BIGINT UNSIGNED NOT NULL,
    email VARCHAR(255) NOT NULL,
    role ENUM('admin', 'member', 'viewer') DEFAULT 'member',
    token VARCHAR(64) UNIQUE NOT NULL,
    invited_by BIGINT UNSIGNED NOT NULL,
    accepted_at TIMESTAMP NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### Tables Nouvelles (Phase 2 : Coach Intelligent)

#### brain_dump_sessions
```sql
CREATE TABLE brain_dump_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
    raw_thoughts JSON,           -- ["répondre aux emails", "finir le rapport", ...]
    total_items INT DEFAULT 0,
    classified_items INT DEFAULT 0,
    created_at TIMESTAMP,
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_status (user_id, status)
);
```

#### brain_dump_items
```sql
CREATE TABLE brain_dump_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT UNSIGNED NOT NULL,
    raw_text VARCHAR(500) NOT NULL,
    task_id BIGINT UNSIGNED NULL,        -- liée si convertie en tâche
    classified_as ENUM(
        'urgent_important', 
        'important_not_urgent', 
        'urgent_not_important', 
        'neither'
    ) NULL,
    classification_answers JSON,         -- réponses aux 5 questions
    time_estimate VARCHAR(20),           -- 'tiny', 'short', 'medium', 'long'
    is_delegable BOOLEAN DEFAULT FALSE,
    is_converted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES brain_dump_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
);
```

#### daily_plans
```sql
CREATE TABLE daily_plans (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    plan_date DATE NOT NULL,
    status ENUM('draft', 'active', 'completed') DEFAULT 'draft',
    ai_suggestions JSON,                 -- suggestions d'optimisation
    methods_applied JSON,                -- ['eisenhower', 'mit', 'eat_that_frog']
    total_tasks INT DEFAULT 0,
    completed_tasks INT DEFAULT 0,
    skipped_tasks INT DEFAULT 0,
    total_estimated_seconds INT DEFAULT 0,
    total_actual_seconds INT DEFAULT 0,
    productivity_score DECIMAL(3,1) NULL, -- 0-10
    user_feedback JSON,                  -- retour utilisateur
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE KEY unique_user_date (user_id, plan_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### daily_plan_items
```sql
CREATE TABLE daily_plan_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    plan_id BIGINT UNSIGNED NOT NULL,
    task_id BIGINT UNSIGNED NOT NULL,
    suggested_start TIME NULL,
    suggested_end TIME NULL,
    priority_rank INT DEFAULT 0,
    method_applied VARCHAR(50),          -- 'eisenhower', 'mit', 'eat_that_frog', '2min_rule'
    is_completed BOOLEAN DEFAULT FALSE,
    is_skipped BOOLEAN DEFAULT FALSE,
    actual_start_time TIMESTAMP NULL,
    actual_end_time TIMESTAMP NULL,
    actual_duration INT UNSIGNED NULL,   -- secondes
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES daily_plans(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
```

#### focus_sessions
```sql
CREATE TABLE focus_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    task_id BIGINT UNSIGNED NULL,
    plan_item_id BIGINT UNSIGNED NULL,
    status ENUM('active', 'paused', 'completed', 'cancelled') DEFAULT 'active',
    method VARCHAR(50),                  -- 'pomodoro', 'deep_work', '2min_rule'
    planned_duration INT UNSIGNED,       -- secondes (25*60 pour pomodoro)
    actual_duration INT UNSIGNED NULL,   -- secondes réelles
    break_duration INT UNSIGNED DEFAULT 300, -- 5 min
    pomodoro_session INT DEFAULT 1,      -- 1/4
    pomodoro_total INT DEFAULT 4,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paused_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
    FOREIGN KEY (plan_item_id) REFERENCES daily_plan_items(id) ON DELETE SET NULL,
    INDEX idx_user_date (user_id, started_at)
);
```

#### time_insights
```sql
CREATE TABLE time_insights (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    insight_date DATE NOT NULL,
    total_tracked_seconds INT DEFAULT 0,
    productivity_score DECIMAL(3,1),     -- 0-10
    focus_hours DECIMAL(3,1),
    interruption_count INT DEFAULT 0,
    completed_tasks INT DEFAULT 0,
    overdue_tasks INT DEFAULT 0,
    peak_productivity_hour INT,          -- 0-23
    tasks_by_priority JSON,              -- {"high": 3, "medium": 5, "low": 2}
    tasks_by_project JSON,               -- {"1": 5, "3": 2}
    time_by_project JSON,                -- {"1": 3600, "3": 1800}
    insights_json JSON,                  -- conseils personnalisés
    comparison_with_previous JSON,       -- comparaison avec hier/semaine dernière
    created_at TIMESTAMP,
    UNIQUE KEY unique_user_date (user_id, insight_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### user_habits
```sql
CREATE TABLE user_habits (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    habit_type VARCHAR(50) NOT NULL,     -- 'morning_person', 'post_lunch_dip', etc.
    confidence DECIMAL(3,2) DEFAULT 0.50, -- 0-1
    data JSON,                           -- données calculées
    sample_size INT DEFAULT 0,
    last_calculated_at TIMESTAMP NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE KEY unique_user_habit (user_id, habit_type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### user_badges
```sql
CREATE TABLE user_badges (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    badge_id VARCHAR(50) NOT NULL,       -- 'first_task', 'planner_7', etc.
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_badge (user_id, badge_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 4. SERVICE LAYER

### BrainDumpService

```php
<?php

namespace App\Services;

use App\Models\BrainDumpSession;
use App\Models\BrainDumpItem;
use App\Models\Task;
use Illuminate\Support\Facades\DB;

class BrainDumpService
{
    /**
     * Créer une session Brain Dump
     */
    public function createSession($user): BrainDumpSession
    {
        // Fermer les sessions actives
        BrainDumpSession::where('user_id', $user->id)
            ->where('status', 'active')
            ->update(['status' => 'abandoned']);

        return BrainDumpSession::create([
            'user_id' => $user->id,
            'status' => 'active',
        ]);
    }

    /**
     * Ajouter des items en bulk
     */
    public function addItems(BrainDumpSession $session, array $rawTexts): array
    {
        $items = [];
        foreach ($rawTexts as $text) {
            $items[] = BrainDumpItem::create([
                'session_id' => $session->id,
                'raw_text' => trim($text),
            ]);
        }

        $session->update(['total_items' => count($items)]);
        return $items;
    }

    /**
     * Classifier une tâche selon la matrice d'Eisenhower
     */
    public function classifyItem(BrainDumpItem $item, array $answers): string
    {
        $hasDeadline = $answers['has_deadline'] ?? false;
        $consequence = $answers['consequence'] ?? 'none';
        $isImportant = $answers['is_important'] ?? false;
        $isDelegable = $answers['is_delegable'] ?? false;

        // Eisenhower Matrix
        if ($hasDeadline && $isImportant) {
            return 'urgent_important';
        }
        if ($isImportant && !$hasDeadline) {
            return 'important_not_urgent';
        }
        if ($hasDeadline && !$isImportant) {
            return 'urgent_not_important';
        }
        return 'neither';
    }

    /**
     * Convertir les items classifiés en tâches
     */
    public function convertToTasks(BrainDumpSession $session, $user): array
    {
        $tasks = [];

        DB::transaction(function () use ($session, $user, &$tasks) {
            $items = BrainDumpItem::where('session_id', $session->id)
                ->whereNotNull('classified_as')
                ->get();

            foreach ($items as $item) {
                $task = Task::create([
                    'user_id' => $user->id,
                    'title' => $item->raw_text,
                    'priority' => $this->mapPriority($item->classified_as),
                    'status' => 'todo',
                    'eisenhower_quadrant' => $item->classified_as,
                    'estimated_duration' => $this->mapDuration($item->time_estimate),
                ]);

                $item->update([
                    'task_id' => $task->id,
                    'is_converted' => true,
                ]);

                $tasks[] = $task;
            }

            $session->update([
                'status' => 'completed',
                'classified_items' => $items->count(),
                'completed_at' => now(),
            ]);
        });

        return $tasks;
    }

    private function mapPriority(string $quadrant): string
    {
        return match ($quadrant) {
            'urgent_important' => 'high',
            'important_not_urgent' => 'medium',
            'urgent_not_important' => 'medium',
            'neither' => 'low',
        };
    }

    private function mapDuration(?string $estimate): ?int
    {
        return match ($estimate) {
            'tiny' => 120,        // 2 min
            'short' => 1800,      // 30 min
            'medium' => 5400,     // 1h30
            'long' => 10800,      // 3h
            default => null,
        };
    }
}
```

### EisenhowerClassifier

```php
<?php

namespace App\Services;

class EisenhowerClassifier
{
    /**
     * Classifier automatiquement sans questions utilisateur
     * Basé sur les propriétés de la tâche
     */
    public function classifyAuto(array $taskData): string
    {
        $hasDeadline = !empty($taskData['due_date']);
        $isOverdue = $hasDeadline && strtotime($taskData['due_date']) < time();
        $hasHighPriority = ($taskData['priority'] ?? 'medium') === 'high';
        $hasEstimatedLongDuration = ($taskData['estimated_duration'] ?? 0) > 3600;

        if ($hasDeadline && $hasHighPriority) {
            return 'urgent_important';
        }

        if ($hasHighPriority && !$hasDeadline) {
            return 'important_not_urgent';
        }

        if ($hasDeadline && !$hasHighPriority) {
            return 'urgent_not_important';
        }

        return 'neither';
    }

    /**
     * Reclassifier toutes les tâches d'un utilisateur
     */
    public function reclassifyUserTasks($user): array
    {
        $tasks = $user->tasks()
            ->where('status', '!=', 'done')
            ->whereNull('eisenhower_quadrant')
            ->get();

        foreach ($tasks as $task) {
            $quadrant = $this->classifyAuto([
                'due_date' => $task->due_date,
                'priority' => $task->priority,
                'estimated_duration' => $task->estimated_duration,
            ]);

            $task->update(['eisenhower_quadrant' => $quadrant]);
        }

        return $tasks->pluck('eisenhower_quadrant', 'id')->toArray();
    }
}
```

### DailyPlanBuilder

```php
<?php

namespace App\Services;

use App\Models\DailyPlan;
use App\Models\DailyPlanItem;
use App\Models\Task;
use Carbon\Carbon;

class DailyPlanBuilder
{
    private BrainDumpService $brainDumpService;
    private EisenhowerClassifier $classifier;

    public function __construct(
        BrainDumpService $brainDumpService,
        EisenhowerClassifier $classifier
    ) {
        $this->brainDumpService = $brainDumpService;
        $this->classifier = $classifier;
    }

    /**
     * Construire le planning optimal pour un jour
     */
    public function buildForDate($user, Carbon $date): DailyPlan
    {
        // 1. Récupérer les tâches à planifier
        $tasks = $this->getTasksToPlan($user, $date);

        // 2. Classifier si pas encore fait
        $this->ensureClassified($tasks);

        // 3. Appliquer les méthodes
        $scheduled = $this->applyMethods($tasks, $user);

        // 4. Créer le plan
        $plan = DailyPlan::create([
            'user_id' => $user->id,
            'plan_date' => $date->toDateString(),
            'status' => 'draft',
            'methods_applied' => $scheduled['methods'],
            'total_tasks' => count($scheduled['items']),
            'total_estimated_seconds' => $scheduled['total_seconds'],
        ]);

        // 5. Créer les items du plan
        foreach ($scheduled['items'] as $index => $item) {
            DailyPlanItem::create([
                'plan_id' => $plan->id,
                'task_id' => $item['task_id'],
                'suggested_start' => $item['start'],
                'suggested_end' => $item['end'],
                'priority_rank' => $index + 1,
                'method_applied' => $item['method'],
            ]);
        }

        return $plan;
    }

    /**
     * Appliquer les méthodes de planification
     */
    private function applyMethods($tasks, $user): array
    {
        $methods = [];
        $items = [];
        $currentTime = $this->getStartTime($user);
        $totalSeconds = 0;

        // 1. Eat That Frog : tâche haute priorité en premier
        $frog = $tasks->where('priority', 'high')->first();
        if ($frog) {
            $methods[] = 'eat_that_frog';
            $duration = $frog->estimated_duration ?? 3600;
            $items[] = [
                'task_id' => $frog->id,
                'start' => $currentTime,
                'end' => $currentTime->copy()->addSeconds($duration)->format('H:i:s'),
                'method' => 'eat_that_frog',
            ];
            $currentTime->addSeconds($duration + 900); // +15min pause
            $totalSeconds += $duration;
            $tasks = $tasks->reject(fn($t) => $t->id === $frog->id);
        }

        // 2. 2-Minute Rule : tâches < 2min
        $quickTasks = $tasks->filter(fn($t) => ($t->estimated_duration ?? 0) <= 120);
        if ($quickTasks->count() > 0) {
            $methods[] = '2min_rule';
            foreach ($quickTasks as $quick) {
                $items[] = [
                    'task_id' => $quick->id,
                    'start' => $currentTime,
                    'end' => $currentTime->copy()->addSeconds(120)->format('H:i:s'),
                    'method' => '2min_rule',
                ];
                $currentTime->addSeconds(180); // 3min total
                $totalSeconds += 120;
            }
            $tasks = $tasks->reject(fn($t) => $quickTasks->contains('id', $t->id));
        }

        // 3. MIT : 3 tâches les plus importantes
        $mitTasks = $tasks->sortByDesc('priority')->take(3);
        if ($mitTasks->count() > 0) {
            $methods[] = 'mit';
            foreach ($mitTasks as $mit) {
                $duration = $mit->estimated_duration ?? 3600;
                $items[] = [
                    'task_id' => $mit->id,
                    'start' => $currentTime,
                    'end' => $currentTime->copy()->addSeconds($duration)->format('H:i:s'),
                    'method' => 'mit',
                ];
                $currentTime->addSeconds($duration + 900);
                $totalSeconds += $duration;
            }
        }

        // 4. Time Blocking : le reste
        $remaining = $tasks->reject(fn($t) => 
            collect($items)->pluck('task_id')->contains($t->id)
        );
        if ($remaining->count() > 0) {
            $methods[] = 'time_blocking';
            foreach ($remaining as $block) {
                $duration = $block->estimated_duration ?? 1800;
                $items[] = [
                    'task_id' => $block->id,
                    'start' => $currentTime,
                    'end' => $currentTime->copy()->addSeconds($duration)->format('H:i:s'),
                    'method' => 'time_blocking',
                ];
                $currentTime->addSeconds($duration + 600); // +10min pause
                $totalSeconds += $duration;
            }
        }

        return [
            'methods' => $methods,
            'items' => $items,
            'total_seconds' => $totalSeconds,
        ];
    }

    private function getTasksToPlan($user, Carbon $date)
    {
        return $user->tasks()
            ->with('project')
            ->where('status', '!=', 'done')
            ->where(function ($query) use ($date) {
                $query->whereNull('due_date')
                    ->orWhere('due_date', '<=', $date->toDateString());
            })
            ->get();
    }

    private function ensureClassified($tasks)
    {
        foreach ($tasks->whereNull('eisenhower_quadrant') as $task) {
            $quadrant = $this->classifier->classifyAuto([
                'due_date' => $task->due_date,
                'priority' => $task->priority,
                'estimated_duration' => $task->estimated_duration,
            ]);
            $task->update(['eisenhower_quadrant' => $quadrant]);
        }
    }

    private function getStartTime($user): Carbon
    {
        $prefs = $user->preferences;
        $startTime = $prefs?->work_start_time ?? '09:00:00';
        return Carbon::now()->setTimeFromTimeString($startTime);
    }
}
```

### ProductivityAnalyzer

```php
<?php

namespace App\Services;

use App\Models\TimeInsight;
use App\Models\UserHabit;
use Carbon\Carbon;

class ProductivityAnalyzer
{
    /**
     * Générer les insights quotidiens
     */
    public function generateDailyInsight($user, Carbon $date): TimeInsight
    {
        $startOfDay = $date->copy()->startOfDay();
        $endOfDay = $date->copy()->endOfDay();

        // Stats de la journée
        $entries = $user->timeEntries()
            ->whereBetween('start_time', [$startOfDay, $endOfDay])
            ->get();

        $tasksCompleted = $user->tasks()
            ->whereDate('updated_at', $date)
            ->where('status', 'done')
            ->count();

        $tasksOverdue = $user->tasks()
            ->where('due_date', '<', $date->toDateString())
            ->where('status', '!=', 'done')
            ->count();

        $totalSeconds = $entries->sum('duration');
        $focusSeconds = $entries->where('is_manual', false)->sum('duration');

        // Heure de productivité peak
        $hourlyProductivity = $entries
            ->groupBy(fn($e) => Carbon::parse($e->start_time)->hour)
            ->map(fn($group) => $group->sum('duration'));

        $peakHour = $hourlyProductivity->keys()->first();
        $peakHour = $peakHour ?? $this->getDefaultPeakHour($user);

        // Score de productivité (0-10)
        $score = $this->calculateProductivityScore(
            $totalSeconds,
            $tasksCompleted,
            $tasksOverdue,
            count($entries)
        );

        // Insights textuels
        $insights = $this->generateInsights(
            $user,
            $totalSeconds,
            $tasksCompleted,
            $tasksOverdue,
            $peakHour
        );

        return TimeInsight::updateOrCreate(
            ['user_id' => $user->id, 'insight_date' => $date->toDateString()],
            [
                'total_tracked_seconds' => $totalSeconds,
                'productivity_score' => $score,
                'focus_hours' => round($focusSeconds / 3600, 1),
                'completed_tasks' => $tasksCompleted,
                'overdue_tasks' => $tasksOverdue,
                'peak_productivity_hour' => $peakHour,
                'tasks_by_priority' => $this->getTasksByPriority($user),
                'time_by_project' => $this->getTimeByProject($entries),
                'insights_json' => $insights,
                'comparison_with_previous' => $this->compareWithPrevious($user, $date),
            ]
        );
    }

    /**
     * Calculer le score de productivité
     */
    private function calculateProductivityScore(
        int $totalSeconds,
        int $tasksCompleted,
        int $tasksOverdue,
        int $entriesCount
    ): float {
        $score = 5.0; // Base

        // Temps tracké (bonus jusqu'à 8h)
        $hours = $totalSeconds / 3600;
        $score += min(2, $hours * 0.25);

        // Tâches complétées (bonus)
        $score += min(2, $tasksCompleted * 0.4);

        // Pénalité pour retards
        $score -= min(2, $tasksOverdue * 0.5);

        // Bonus régularité (plus de sessions = mieux)
        $score += min(1, $entriesCount * 0.1);

        return max(0, min(10, round($score, 1)));
    }

    /**
     * Générer des insights textuels
     */
    private function generateInsights(
        $user,
        int $totalSeconds,
        int $completed,
        int $overdue,
        ?int $peakHour
    ): array {
        $insights = [];

        // Productivité
        $hours = round($totalSeconds / 3600, 1);
        if ($hours > 6) {
            $insights[] = "Tu as travaillé {$hours}h aujourd'hui. Bravo !";
        } elseif ($hours < 2) {
            $insights[] = "Seulement {$hours}h trackées. Tu as oublié de lancer le timer ?";
        }

        // Retards
        if ($overdue > 0) {
            $insights[] = "Tu as {$overdue} tâche(s) en retard. Veux-tu que je t'aide à les prioriser ?";
        }

        // Peak hour
        if ($peakHour !== null) {
            $peakHourFormatted = str_pad($peakHour, 2, '0', STR_PAD_LEFT) . 'h';
            $insights[] = "Tu es plus productif vers {$peakHourFormatted}. Place tes tâches importantes à ce moment.";
        }

        // Tâches
        if ($completed >= 5) {
            $insights[] = "{$completed} tâches terminées aujourd'hui. Tu es en forme !";
        }

        return $insights;
    }

    /**
     * Comparer avec la période précédente
     */
    private function compareWithPrevious($user, Carbon $date): array
    {
        $previous = $date->copy()->subDay();

        $todayInsight = $user->insights()->where('insight_date', $date->toDateString())->first();
        $yesterdayInsight = $user->insights()->where('insight_date', $previous->toDateString())->first();

        if (!$yesterdayInsight) {
            return ['has_previous' => false];
        }

        $timeDiff = $todayInsight->total_tracked_seconds - $yesterdayInsight->total_tracked_seconds;
        $percentChange = $yesterdayInsight->total_tracked_seconds > 0
            ? round(($timeDiff / $yesterdayInsight->total_tracked_seconds) * 100)
            : 0;

        return [
            'has_previous' => true,
            'time_change_seconds' => $timeDiff,
            'time_change_percent' => $percentChange,
            'tasks_change' => $todayInsight->completed_tasks - $yesterdayInsight->completed_tasks,
            'score_change' => $todayInsight->productivity_score - $yesterdayInsight->productivity_score,
        ];
    }

    private function getDefaultPeakHour($user): int
    {
        $prefs = $user->preferences;
        if ($prefs && str_contains($prefs->peak_productivity_hours ?? '', 'morning')) {
            return 10;
        }
        return 14;
    }

    private function getTasksByPriority($user): array
    {
        return $user->tasks()
            ->selectRaw('priority, count(*) as count')
            ->where('status', '!=', 'done')
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->toArray();
    }

    private function getTimeByProject($entries): array
    {
        return $entries
            ->groupBy('project_id')
            ->map(fn($group) => $group->sum('duration'))
            ->toArray();
    }
}
```

### CoachEngine

```php
<?php

namespace App\Services;

use Carbon\Carbon;

class CoachEngine
{
    private ProductivityAnalyzer $analyzer;
    private DailyPlanBuilder $planBuilder;

    public function __construct(
        ProductivityAnalyzer $analyzer,
        DailyPlanBuilder $planBuilder
    ) {
        $this->analyzer = $analyzer;
        $this->planBuilder = $planBuilder;
    }

    /**
     * Obtenir le conseil du jour
     */
    public function getDailyAdvice($user): array
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        // Insights d'hier
        $yesterdayInsight = $user->insights()
            ->where('insight_date', $yesterday->toDateString())
            ->first();

        // Habitudes
        $habits = $user->habits()->get();

        $advice = [];

        // 1. Résumé matinal
        $urgentTasks = $user->tasks()
            ->where('status', '!=', 'done')
            ->where('eisenhower_quadrant', 'urgent_important')
            ->count();

        if ($urgentTasks > 0) {
            $advice[] = [
                'type' => 'urgent',
                'title' => 'Tâches urgentes',
                'message' => "Tu as {$urgentTasks} tâche(s) urgente(s) aujourd'hui.",
                'action' => 'view_urgent',
            ];
        }

        // 2. Comparaison
        if ($yesterdayInsight) {
            $todayTracked = $user->timeEntries()
                ->whereDate('start_time', $today)
                ->sum('duration');

            if ($yesterdayInsight->total_tracked_seconds > 0) {
                $diff = $todayTracked - $yesterdayInsight->total_tracked_seconds;
                if ($diff > 0) {
                    $advice[] = [
                        'type' => 'positive',
                        'title' => 'En progrès',
                        'message' => "Tu as déjà tracké plus qu'hier à la même heure.",
                    ];
                }
            }
        }

        // 3. Alerte procrastination
        $overdueCount = $user->tasks()
            ->where('due_date', '<', $today->toDateString())
            ->where('status', '!=', 'done')
            ->count();

        if ($overdueCount > 3) {
            $advice[] = [
                'type' => 'warning',
                'title' => 'Tâches en retard',
                'message' => "{$overdueCount} tâches sont en retard. Tu veux que je t'aide à les prioriser ?",
                'action' => 'prioritize',
            ];
        }

        // 4. Habitude détectée
        $morningHabit = $habits->where('habit_type', 'morning_person')->first();
        if ($morningHabit && $morningHabit->confidence > 0.7) {
            $advice[] = [
                'type' => 'tip',
                'title' => 'Conseil du coach',
                'message' => "Tu es plus productif le matin. Planifie tes tâches difficiles avant 12h.",
            ];
        }

        return $advice;
    }

    /**
     * Obtenir les insights hebdomadaires
     */
    public function getWeeklyReport($user): array
    {
        $weekStart = Carbon::now()->startOfWeek();
        $weekEnd = Carbon::now()->endOfWeek();

        $insights = $user->insights()
            ->whereBetween('insight_date', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->get();

        $totalSeconds = $insights->sum('total_tracked_seconds');
        $totalTasks = $insights->sum('completed_tasks');
        $avgScore = $insights->avg('productivity_score');

        $bestDay = $insights->sortByDesc('productivity_score')->first();
        $worstDay = $insights->sortBy('productivity_score')->first();

        return [
            'total_hours' => round($totalSeconds / 3600, 1),
            'total_tasks_completed' => $totalTasks,
            'average_productivity_score' => round($avgScore, 1),
            'best_day' => $bestDay?->insight_date,
            'worst_day' => $worstDay?->insight_date,
            'daily_breakdown' => $insights->map(fn($i) => [
                'date' => $i->insight_date,
                'hours' => round($i->total_tracked_seconds / 3600, 1),
                'tasks' => $i->completed_tasks,
                'score' => $i->productivity_score,
            ]),
        ];
    }
}
```

---

## 5. ENDPOINTS API

### Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/register` | Inscription | Non |
| POST | `/api/login` | Connexion | Non |
| POST | `/api/logout` | Déconnexion | Oui |
| GET | `/api/user` | Profil utilisateur | Oui |
| PUT | `/api/user` | Modifier profil | Oui |
| POST | `/api/user/password` | Changer mot de passe | Oui |
| POST | `/api/user/avatar` | Upload avatar | Oui |
| DELETE | `/api/user/avatar` | Supprimer avatar | Oui |
| POST | `/api/forgot-password` | Demander reset | Non |
| POST | `/api/reset-password` | Reset password | Non |
| GET | `/api/email/verify/{id}/{hash}` | Vérifier email | Lien signé |
| POST | `/api/email/resend` | Renvoyer vérification | Oui |

### Brain Dump

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/brain-dump` | Créer session | Oui |
| GET | `/api/brain-dump` | Lister sessions | Oui |
| GET | `/api/brain-dump/{session}` | Détail session | Oui |
| POST | `/api/brain-dump/{session}/items` | Ajouter items (bulk) | Oui |
| POST | `/api/brain-dump/items/{item}/classify` | Classifier 1 item | Oui |
| POST | `/api/brain-dump/{session}/classify-all` | Classifier tout | Oui |
| POST | `/api/brain-dump/{session}/convert` | Convertir en tâches | Oui |
| DELETE | `/api/brain-dump/{session}` | Supprimer session | Oui |

### Tasks

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/tasks` | Lister tâches | Oui |
| POST | `/api/tasks` | Créer tâche | Oui |
| GET | `/api/tasks/{task}` | Détail tâche | Oui |
| PUT | `/api/tasks/{task}` | Modifier tâche | Oui |
| DELETE | `/api/tasks/{task}` | Supprimer tâche | Oui |
| POST | `/api/tasks/reorder` | Réorganiser | Oui |
| GET | `/api/tasks/{task}/subtasks` | Sous-tâches | Oui |
| GET | `/api/tasks/{task}/comments` | Commentaires | Oui |
| POST | `/api/tasks/{task}/comments` | Ajouter commentaire | Oui |

### Daily Plans

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/plans` | Lister les plans | Oui |
| POST | `/api/plans` | Créer plan | Oui |
| GET | `/api/plans/today` | Plan du jour | Oui |
| GET | `/api/plans/{plan}` | Détail plan | Oui |
| PUT | `/api/plans/{plan}` | Modifier plan | Oui |
| POST | `/api/plans/{plan}/optimize` | Optimiser (IA) | Oui |
| PATCH | `/api/plans/{plan}/complete` | Marquer terminé | Oui |
| DELETE | `/api/plans/{plan}` | Supprimer plan | Oui |
| PATCH | `/api/plans/{plan}/items/{item}/toggle` | Toggle complétion | Oui |

### Focus Sessions

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/focus/start` | Démarrer session | Oui |
| PATCH | `/api/focus/{session}/pause` | Pause | Oui |
| PATCH | `/api/focus/{session}/resume` | Reprendre | Oui |
| PATCH | `/api/focus/{session}/complete` | Terminer | Oui |
| PATCH | `/api/focus/{session}/cancel` | Annuler | Oui |
| GET | `/api/focus/active` | Session en cours | Oui |
| GET | `/api/focus/history` | Historique | Oui |

### Insights

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/insights/today` | Insight du jour | Oui |
| GET | `/api/insights/weekly` | Rapport hebdo | Oui |
| GET | `/api/insights/trends` | Tendances (30j) | Oui |
| GET | `/api/insights/habits` | Habitudes détectées | Oui |

### Coach

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/coach/daily` | Conseil du jour | Oui |
| GET | `/api/coach/weekly` | Rapport coach | Oui |
| POST | `/api/coach/feedback` | Retour sur suggestion | Oui |

### Projects

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/projects` | Lister projets | Oui |
| POST | `/api/projects` | Créer projet | Oui |
| GET | `/api/projects/{project}` | Détail projet | Oui |
| PUT | `/api/projects/{project}` | Modifier projet | Oui |
| DELETE | `/api/projects/{project}` | Supprimer projet | Oui |
| GET | `/api/projects/{project}/stats` | Stats projet | Oui |

### Time Entries

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/time-entries` | Lister entrées (paginé) | Oui |
| POST | `/api/time-entries` | Créer entrée | Oui |
| GET | `/api/time-entries/{entry}` | Détail entrée | Oui |
| PUT | `/api/time-entries/{entry}` | Modifier entrée | Oui |
| DELETE | `/api/time-entries/{entry}` | Supprimer entrée | Oui |
| GET | `/api/time-entries/stats` | Statistiques | Oui |
| GET | `/api/time-entries/export` | Export CSV/PDF | Oui |

### Teams

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/teams` | Lister équipes | Oui |
| POST | `/api/teams` | Créer équipe | Oui |
| GET | `/api/teams/{team}` | Détail équipe | Oui |
| PUT | `/api/teams/{team}` | Modifier équipe | Oui |
| DELETE | `/api/teams/{team}` | Supprimer équipe | Oui |
| POST | `/api/teams/{team}/members` | Ajouter membre | Oui |
| DELETE | `/api/teams/{team}/members/{user}` | Retirer membre | Oui |
| PATCH | `/api/teams/{team}/members/{user}` | Changer rôle | Oui |
| GET | `/api/teams/{team}/workload` | Charge de travail | Oui |

### Notifications

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/notifications` | Lister notifications | Oui |
| POST | `/api/notifications` | Créer notification | Oui |
| GET | `/api/notifications/unread-count` | Nombre non lues | Oui |
| PATCH | `/api/notifications/{notification}/read` | Marquer lu | Oui |
| PATCH | `/api/notifications/read-all` | Tout marquer lu | Oui |
| DELETE | `/api/notifications/{notification}` | Supprimer | Oui |

### Labels

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/labels` | Lister labels | Oui |
| POST | `/api/labels` | Créer label | Oui |
| PUT | `/api/labels/{label}` | Modifier label | Oui |
| DELETE | `/api/labels/{label}` | Supprimer label | Oui |
| POST | `/api/labels/{label}/assign` | Assigner à tâche | Oui |
| DELETE | `/api/labels/{label}/remove` | Retirer de tâche | Oui |

### User Preferences

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/preferences` | Récupérer préférences | Oui |
| PUT | `/api/preferences` | Modifier préférences | Oui |
| POST | `/api/preferences` | Créer préférences | Oui |

### Automation Rules

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/automation-rules` | Lister règles | Oui |
| POST | `/api/automation-rules` | Créer règle | Oui |
| PUT | `/api/automation-rules/{rule}` | Modifier règle | Oui |
| DELETE | `/api/automation-rules/{rule}` | Supprimer règle | Oui |
| PATCH | `/api/automation-rules/{rule}/toggle` | Activer/Désactiver | Oui |

### Health Check

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/health` | État du serveur | Non |

---

## 6. JOBS & QUEUES

### Configuration

```php
// config/queue.php
'default' => env('QUEUE_CONNECTION', 'redis'),

'connections' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'queue' => env('REDIS_QUEUE', 'default'),
        'retry_after' => 90,
        'block_for' => null,
    ],
],
```

### Jobs

#### ClassifyBrainDumpItems

```php
<?php

namespace App\Jobs;

use App\Models\BrainDumpSession;
use App\Services\EisenhowerClassifier;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ClassifyBrainDumpItems implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public BrainDumpSession $session
    ) {}

    public function handle(EisenhowerClassifier $classifier): void
    {
        $items = $this->session->items()->whereNull('classified_as')->get();

        foreach ($items as $item) {
            $answers = json_decode($item->classification_answers, true) ?? [];
            $quadrant = $classifier->classifyAuto([
                'has_deadline' => $answers['has_deadline'] ?? false,
                'is_important' => $answers['is_important'] ?? false,
                'priority' => 'medium',
            ]);
            $item->update(['classified_as' => $quadrant]);
        }

        $this->session->update([
            'classified_items' => $items->count(),
        ]);
    }
}
```

#### GenerateDailyPlan

```php
<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\DailyPlanBuilder;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;

class GenerateDailyPlan implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public function __construct(
        public int $userId,
        public ?string $date = null
    ) {}

    public function handle(DailyPlanBuilder $builder): void
    {
        $user = User::find($this->userId);
        if (!$user) return;

        $date = $this->date ? Carbon::parse($this->date) : Carbon::tomorrow();
        $builder->buildForDate($user, $date);
    }
}
```

#### CalculateProductivityScore

```php
<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\ProductivityAnalyzer;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;

class CalculateProductivityScore implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public function __construct(
        public int $userId,
        public ?string $date = null
    ) {}

    public function handle(ProductivityAnalyzer $analyzer): void
    {
        $user = User::find($this->userId);
        if (!$user) return;

        $date = $this->date ? Carbon::parse($this->date) : Carbon::yesterday();
        $analyzer->generateDailyInsight($user, $date);
    }
}
```

#### SendSmartNotification

```php
<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;

class SendSmartNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public function __construct(
        public int $userId,
        public string $type,
        public string $title,
        public string $message,
        public array $data = [],
        public string $priority = 'medium'
    ) {}

    public function handle(): void
    {
        Notification::create([
            'user_id' => $this->userId,
            'type' => $this->type,
            'title' => $this->title,
            'message' => $this->message,
            'data' => $this->data,
        ]);
    }
}
```

---

## 7. SCHEDULER (CRON)

```php
// app/Console/Kernel.php (ou routes/console.php)

use Illuminate\Support\Facades\Schedule;

// Chaque jour à 6h : Générer les plans pour demain
Schedule::job(new \App\Jobs\GenerateDailyPlan(0, now()->addDay()->toDateString()))
    ->dailyAt('18:00')
    ->timezone('Europe/Paris');

// Chaque jour à 23h : Calculer les insights d'hier
Schedule::job(new \App\Jobs\CalculateProductivityScore(0, now()->subDay()->toDateString()))
    ->dailyAt('23:00')
    ->timezone('Europe/Paris');

// Chaque lundi à 8h : Rapport hebdomadaire
Schedule::command('insights:weekly-report')
    ->weekly()
    ->mondays()
    ->at('08:00')
    ->timezone('Europe/Paris');

// Chaque heure : Récurrence des tâches
Schedule::command('tasks:process-recurring')
    ->hourly();

// Toutes les 15 minutes : Notifications intelligentes
Schedule::command('notifications:smart-check')
    ->everyFifteenMinutes();
```

---

## 8. SÉCURITÉ

### Rate Limiting

```php
// routes/api.php
Route::post('/register', [AuthController::class, 'register'])
    ->middleware('throttle:10,1');  // 10/min

Route::post('/login', [AuthController::class, 'login'])
    ->middleware('throttle:5,1');   // 5/min

Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])
    ->middleware('throttle:3,1');   // 3/min
```

### Validation

```php
// App/Http/Requests/StoreTaskRequest.php
class StoreTaskRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'project_id' => ['nullable', 'exists:projects,id'],
            'parent_id' => ['nullable', 'exists:tasks,id'],
            'priority' => ['nullable', 'in:low,medium,high'],
            'status' => ['nullable', 'in:todo,in_progress,done'],
            'due_date' => ['nullable', 'date', 'after_or_equal:today'],
            'estimated_duration' => ['nullable', 'integer', 'min:0'],
        ];
    }

    public function authorize(): bool
    {
        return true; // Authorization handled in controller
    }
}
```

### Middleware

```php
// SecurityHeaders Middleware
public function handle($request, Closure $next)
{
    $response = $next($request);
    
    $response->headers->set('X-Content-Type-Options', 'nosniff');
    $response->headers->set('X-Frame-Options', 'DENY');
    $response->headers->set('X-XSS-Protection', '1; mode=block');
    $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
    $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    if (config('app.env') === 'production') {
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        $response->headers->set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'");
    }
    
    return $response;
}
```

### Sanctum Configuration

```php
// config/sanctum.php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),

'expiration' => 60 * 24, // 24 heures en minutes
```

---

## 9. CACHE STRATEGY

### Redis Configuration

```php
// config/database.php
'redis' => [
    'client' => env('REDIS_CLIENT', 'phpredis'),
    'default' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', 6379),
        'database' => env('REDIS_DB', 0),
    ],
],
```

### Cache Keys

```php
// Patterns de cache
"user:{id}:tasks"           → 5 minutes
"user:{id}:projects"        → 5 minutes
"user:{id}:stats"           → 1 minute
"user:{id}:insights:{date}" → 1 heure
"user:{id}:habits"          → 1 heure
"team:{id}:workload"        → 5 minutes
"plan:{id}"                 → 5 minutes
```

### Utilisation

```php
// Dans les repositories
public function getUserTasks($userId)
{
    return Cache::remember("user:{$userId}:tasks", 300, function () use ($userId) {
        return Task::where('user_id', $userId)
            ->with('project')
            ->whereNull('parent_id')
            ->orderBy('created_at', 'desc')
            ->get();
    });
}

// Invalidation
public function invalidateUserCache($userId)
{
    Cache::forget("user:{$userId}:tasks");
    Cache::forget("user:{$userId}:projects");
    Cache::forget("user:{$userId}:stats");
}
```

---

## 10. TESTS

### Unit Tests

```php
// tests/Unit/Services/EisenhowerClassifierTest.php
class EisenhowerClassifierTest extends TestCase
{
    private EisenhowerClassifier $classifier;

    protected function setUp(): void
    {
        parent::setUp();
        $this->classifier = new EisenhowerClassifier();
    }

    public function test_classifies_urgent_and_important(): void
    {
        $result = $this->classifier->classifyAuto([
            'due_date' => now()->toDateString(),
            'priority' => 'high',
        ]);

        $this->assertEquals('urgent_important', $result);
    }

    public function test_classifies_important_not_urgent(): void
    {
        $result = $this->classifier->classifyAuto([
            'due_date' => null,
            'priority' => 'high',
        ]);

        $this->assertEquals('important_not_urgent', $result);
    }

    public function test_classifies_neither(): void
    {
        $result = $this->classifier->classifyAuto([
            'due_date' => null,
            'priority' => 'low',
        ]);

        $this->assertEquals('neither', $result);
    }
}
```

### Feature Tests

```php
// tests/Feature/Api/BrainDumpTest.php
class BrainDumpTest extends TestCase
{
    use RefreshDatabase;

    private $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_create_brain_dump_session(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/brain-dump');

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'status',
                'created_at',
            ]);

        $this->assertDatabaseHas('brain_dump_sessions', [
            'user_id' => $this->user->id,
            'status' => 'active',
        ]);
    }

    public function test_add_items_to_session(): void
    {
        $session = BrainDumpSession::create([
            'user_id' => $this->user->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/brain-dump/{$session->id}/items", [
                'items' => [
                    'Répondre aux emails',
                    'Finir le rapport Q3',
                    'Aller à la banque',
                ],
            ]);

        $response->assertStatus(201);

        $this->assertDatabaseHas('brain_dump_items', [
            'session_id' => $session->id,
            'raw_text' => 'Répondre aux emails',
        ]);
    }

    public function test_convert_to_tasks(): void
    {
        $session = BrainDumpSession::create([
            'user_id' => $this->user->id,
            'status' => 'active',
        ]);

        BrainDumpItem::create([
            'session_id' => $session->id,
            'raw_text' => 'Finir le rapport',
            'classified_as' => 'urgent_important',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/brain-dump/{$session->id}/convert");

        $response->assertStatus(200);

        $this->assertDatabaseHas('tasks', [
            'user_id' => $this->user->id,
            'title' => 'Finir le rapport',
            'eisenhower_quadrant' => 'urgent_important',
        ]);
    }
}
```

### Exécution

```bash
# Tous les tests
php artisan test

# Un fichier spécifique
php artisan test --filter=BrainDumpTest

# Avec coverage
php artisan test --coverage --min=80
```

---

## 11. DÉPLOIEMENT

### Docker Compose (Production)

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
      - DB_CONNECTION=mysql
      - DB_HOST=db
      - DB_DATABASE=timepro
      - REDIS_HOST=redis
    depends_on:
      - db
      - redis
    volumes:
      - ./storage:/var/www/html/storage

  queue:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    command: php artisan queue:work --sleep=3 --tries=3 --max-time=3600
    environment:
      - QUEUE_CONNECTION=redis
    depends_on:
      - redis

  scheduler:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    command: >
      sh -c "while true; do php artisan schedule:run --verbose --no-interaction & sleep 60; done"
    depends_on:
      - app

  db:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: timepro
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./public:/var/www/html/public
    depends_on:
      - app

volumes:
  mysql_data:
  redis_data:
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
      - name: Install Dependencies
        run: composer install --no-progress
      - name: Run Tests
        run: php artisan test
      - name: Run Pint
        run: ./vendor/bin/pint --test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/timepro
            git pull origin main
            composer install --no-dev
            php artisan migrate --force
            php artisan config:cache
            php artisan route:cache
            php artisan view:cache
            sudo systemctl restart php-fpm
            sudo systemctl restart nginx
```

---

## 12. LISTE DES TÂCHES BACKEND

### Phase 1 : Architecture (Semaine 1)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 1 | Créer les dossiers Services/, Repositories/, Jobs/ | Haute | 1h |
| 2 | Configurer Redis (cache + queue) | Haute | 2h |
| 3 | Refactorer Controllers vers Service Layer | Haute | 6h |
| 4 | Créer TaskRepository + ProjectRepository | Haute | 4h |
| 5 | Ajouter Resources (TaskResource, etc.) | Moyenne | 3h |
| 6 | Ajouter FormRequest validation | Moyenne | 3h |
| 7 | Configurer Events + Listeners | Moyenne | 2h |

### Phase 2 : Brain Dump (Semaine 2)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 8 | Migrations brain_dump_sessions + items | Haute | 1h |
| 9 | Model BrainDumpSession + BrainDumpItem | Haute | 1h |
| 10 | BrainDumpService | Haute | 4h |
| 11 | EisenhowerClassifier | Haute | 3h |
| 12 | BrainDumpController | Haute | 3h |
| 13 | Routes API brain-dump | Haute | 1h |
| 14 | Tests BrainDump | Haute | 3h |

### Phase 3 : Daily Plans (Semaine 3)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 15 | Migrations daily_plans + items | Haute | 1h |
| 16 | Model DailyPlan + DailyPlanItem | Haute | 1h |
| 17 | DailyPlanBuilder | Haute | 5h |
| 18 | DailyPlanController | Haute | 3h |
| 19 | Routes API plans | Haute | 1h |
| 20 | Tests DailyPlan | Haute | 3h |

### Phase 4 : Focus Sessions (Semaine 4)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 21 | Migration focus_sessions | Haute | 1h |
| 22 | Model FocusSession | Haute | 1h |
| 23 | FocusSessionService | Haute | 3h |
| 24 | FocusSessionController | Haute | 2h |
| 25 | Routes API focus | Haute | 1h |
| 26 | Tests Focus | Haute | 2h |

### Phase 5 : Insights + Coach (Semaine 5)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 27 | Migrations time_insights + user_habits | Haute | 1h |
| 28 | Model TimeInsight + UserHabit | Haute | 1h |
| 29 | ProductivityAnalyzer | Haute | 5h |
| 30 | CoachEngine | Haute | 4h |
| 31 | InsightController | Haute | 2h |
| 32 | Routes API insights + coach | Haute | 1h |
| 33 | Tests Insights + Coach | Haute | 3h |

### Phase 6 : Notifications + Scheduler (Semaine 6)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 34 | Jobs (ClassifyBrainDump, GenerateDailyPlan, etc.) | Haute | 4h |
| 35 | Scheduler (cron jobs) | Haute | 2h |
| 36 | Notifications intelligentes | Haute | 3h |
| 37 | SendSmartNotification Job | Moyenne | 2h |
| 38 | Tests Jobs + Scheduler | Haute | 3h |

### Phase 7 : Gamification + Polish (Semaine 7)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 39 | Migration user_badges | Basse | 0.5h |
| 40 | BadgeService (déverrouillage) | Basse | 3h |
| 41 | StreakService | Basse | 2h |
| 42 | Optimisation cache queries | Haute | 3h |
| 43 | Indexation BDD (performance) | Haute | 2h |

### Phase 8 : Tests + Production (Semaine 8)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 44 | Tests unitaires complets | Haute | 6h |
| 45 | Tests feature complets | Haute | 6h |
| 46 | Docker Compose production | Haute | 3h |
| 47 | CI/CD pipeline | Haute | 3h |
| 48 | Monitoring (logs + métriques) | Moyenne | 2h |
| 49 | Documentation API (Swagger) | Moyenne | 3h |
| 50 | Load testing (k6/artillery) | Basse | 2h |

---

## RÉSUMÉ

| Catégorie | Avant | Après |
|-----------|-------|-------|
| **Architecture** | Controllers-only | Service + Repository + Jobs |
| **Base de données** | 10 tables | 18 tables |
| **API** | 30 endpoints | 60+ endpoints |
| **Cache** | Aucun | Redis (queries + sessions) |
| **Queue** | Synchronous | Redis async jobs |
| **Tests** | 0 | 50+ tests |
| **Sécurité** | Basique | Rate limiting + validation + middleware |
| **Déploiement** | Manuel | Docker + CI/CD |
| **Scalabilité** | 1 serveur | Horizontal (queue + workers) |
