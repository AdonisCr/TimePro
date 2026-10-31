# Time Pro — Spécification Frontend Complète

> **Objectif** : Transformer Time Pro d'un gestionnaire de tâches en un coach de temps intelligent.
> **Promesse** : "Comprends ton temps avant d'essayer de le gérer."

---

## TABLE DES MATIÈRES

1. [Identité Produit](#1-identité-produit)
2. [Landing Page — Copywriting Professionnel](#2-landing-page)
3. [Dashboard — Coach Intelligent](#3-dashboard)
4. [Brain Dump — Le Killer Feature](#4-brain-dump)
5. [Planning Intelligent](#5-planning-intelligent)
6. [Focus Mode](#6-focus-mode)
7. [Animations & Micro-interactions](#7-animations)
8. [Dark Mode Adaptatif](#8-dark-mode)
9. [PWA — Offline First](#9-pwa)
10. [Gamification Légère](#10-gamification)
11. [Empty States & Onboarding](#11-empty-states)
12. [Notifications intelligentes](#12-notifications)
13. [Liste Complète des Tâches](#13-liste-taches)
14. [Checklist d'Optimisation](#14-checklist)

---

## 1. IDENTITÉ PRODUIT

### Le problème qu'on résout

> Les gens ne gèrent pas mal leur temps parce qu'ils n'ont pas le bon outil.
> Ils le gèrent mal parce qu'ils ne savent pas où il va.

### Notre différence

| Concurrence | Time Pro |
|-------------|----------|
| "Organise tes tâches" | "Comprends ton temps" |
| L'utilisateur remplit des formulaires | L'application observe et conseille |
| Outil passif | Coach actif |
| Tu planifies, tu oublies | Tu planifies, on te suit |

### Le ton

- **Pas corporate**. Pas de jargon management.
- **Direct**. Comme un ami qui te dit la vérité.
- **Bienveillant**. On ne juge pas, on aide.
- **Concret**. Chaque mot a un sens, pas de remplissage.

### Les 3 piliers

1. **Conscience** — "Où va mon temps ?"
2. **Action** — "Que dois-je faire maintenant ?"
3. **Progrès** — "Est-ce que j'avance ?"

---

## 2. LANDING PAGE

### Structure

```
┌─────────────────────────────────────────────────┐
│ HEADER                                          │
│ Logo + Navigation + CTA "Commencer"             │
├─────────────────────────────────────────────────┤
│ HERO                                            │
│ Headline + Sous-headline + CTA + Visuel         │
├─────────────────────────────────────────────────┤
│ PREUVE SOCIALE                                  │
│ Chiffres clés + Témoignages                     │
├─────────────────────────────────────────────────┤
│ PROBLÈME                                        │
│ "Tu reconnais ça ?" → 4 douleurs                │
├─────────────────────────────────────────────────┤
│ SOLUTION                                        │
│ 3 étapes comment ça marche                      │
├─────────────────────────────────────────────────┤
│ FONCTIONNALITÉS                                 │
│ Cards avec bénéfices (pas features)             │
├─────────────────────────────────────────────────┤
│ AVANT / APRÈS                                   │
│ Comparaison visuelle                            │
├─────────────────────────────────────────────────┤
│ CTA FINAL                                       │
│ "Tu veux reprendre le contrôle ?"               │
├─────────────────────────────────────────────────┤
│ FOOTER                                          │
│ Liens légaux + Contact                          │
└─────────────────────────────────────────────────┘
```

### Copywriting — Hero Section

**Headline (H1) :**

> # Chaque minute raconte une histoire. Time Pro t'aide à la comprendre.

**Sous-headline :**

> Tu ne sais pas où va ton temps. Time Pro observe, mesure, et te montre exactement ce que tu fais — avant de t'aider à faire mieux.

**CTA :**

> [Reprendre le contrôle →]

**Sous-CTA :**

> Gratuit. Sans carte bancaire. Installation en 30 secondes.

**Pourquoi ça marche :**
- Pas de promesse vide ("la meilleure app")
- Curiosité : "il observe ?" → l'utilisateur veut savoir
- Urgence douce : "avant de t'aider à faire mieux"
- Zéro friction : pas de CB, 30 secondes

---

### Copywriting — Section Problème

**Titre :**

> ## Tu reconnais ça ?

**Card 1 :**

> ### "Je travaille tout le jour et je ne sais pas où va mon temps."
> Tu passes de réunion en email en tâche. Le soir, tu n'as rien de concret à montrer.

**Card 2 :**

> ### "Je planifie toujours trop et je termine jamais."
> Ta to-do list fait peur. Tu commences 5 choses. Tu n'en finis aucune.

**Card 3 :**

> ### "Je suis toujours en retard sur mes deadlines."
> Pas parce que tu es lent. Parce que tu ne savais pas que c'était urgent.

**Card 4 :**

> ### "J'utilise 5 outils différents et je n'avance toujours pas."
> Un calendrier, un bloc-notes, un trello, un timer... Rien ne parle aux autres.

---

### Copywriting — Section Solution (Comment ça marche)

**Titre :**

> ## Trois étapes. Pas de configuration compliquée.

**Étape 1 :**

> ### 1. Tu vides ton esprit
> Écris tout ce que tu dois faire. Sans réfléchir. Sans trier. Juste sortir.

**Étape 2 :**

> ### 2. Time Pro réfléchit pour toi
> L'application analyse chaque tâche, la classe, et te propose un plan optimal.

**Étape 3 :**

> ### 3. Tu exécutes. On te suit.
> On mesure ton temps réel, on te dit si tu avances, et on t'aide à t'améliorer chaque jour.

---

### Copywriting — Section Fonctionnalités

> ## Ce n'est pas un agenda. C'est un miroir.

**Card 1 — Brain Dump :**

> ### "Vide ton esprit"
> Écris tout ce qui te passe par la tête. Time Pro classe automatiquement selon l'urgence et l'importance.

**Card 2 — Planning :**

> ### "Ton planning, optimisé"
> Pas un calendrier vide. Un plan intelligent qui sait que tu es plus productif le matin, que tu as une réunion à 14h, et que tu as besoin de pauses.

**Card 3 — Focus :**

> ### "Entre en zone"
> Mode concentration avec timer Pomodoro. On bloque les distractions. On mesure ta progression.

**Card 4 — Insights :**

> ### "Comprends-toi"
> "Tu perds 2h/jour sur des emails." "Tu es 3x plus productif le mardi matin." Des chiffres réels, pas des suppositions.

**Card 5 — Coach :**

> ### "Un coach, pas un outil"
> "Tu as 18 tâches. Tu en finiras 7. Veux-tu que je t'aide à choisir ?" L'application te parle. Tu n'as pas à chercher.

**Card 6 — PWA :**

> ### "Partout, tout le temps"
> Installable sur ton téléphone. Fonctionne hors ligne. Pas besoin de télécharger une app.

---

### Copywriting — Section Avant/Après

> ## La différence entre gérer et comprendre.

| | Avant (gestionnaire) | Après (Time Pro) |
|---|---|---|
| **Tu sais** | Que tu as des tâches | Où va ton temps |
| **Tu planifies** | Un agenda vide | Un plan optimisé |
| **Tu travailles** | Sans mesure | Avec un timer intelligent |
| **Tu progresses** | Au feeling | Avec des données réelles |
| **Tu apprends** | Rien | Sur tes habitudes |

---

### Copywriting — CTA Final

> ## Prêt à comprendre ton temps ?

> Tu n'as pas besoin d'un autre outil de productivité. Tu as besoin de savoir où va ton temps. Time Pro te le montre. Puis t'aide à mieux le dépenser.

> [Commencer maintenant — c'est gratuit]

---

## 3. DASHBOARD — COACH INTELLIGENT

### Principe

Le dashboard ne montre pas des stats. Il **parle à l'utilisateur**.

### Layout

```
┌──────────────────────────────────────────────────────┐
│  Sidebar          │  Header (recherche + profil)     │
│                   │                                   │
│  📊 Tableau de    │  ┌─────────────────────────────┐ │
│     bord          │  │  Coach Card                  │ │
│                   │  │  "Bonjour Sarah. Tu as 3     │ │
│  ⏱️ Suivi         │  │   tâches urgentes..."       │ │
│                   │  └─────────────────────────────┘ │
│  📁 Projets       │                                   │
│  📅 Planning      │  ┌──────────┐ ┌──────────────┐  │
│  🎯 Focus         │  │ Stats    │ │ Tâches du    │  │
│                   │  │ du jour  │ │ jour (MIT)   │  │
│  👥 Équipe        │  └──────────┘ └──────────────┘  │
│  🧠 Brain Dump    │                                   │
│                   │  ┌─────────────────────────────┐ │
│  🔧 Outils        │  │  Planning visuel             │ │
│  📬 Inbox         │  │  (time blocking)             │ │
│  ⚙️ Réglages      │  └─────────────────────────────┘ │
│                   │                                   │
│  ──────────────  │  ┌──────────┐ ┌──────────────┐  │
│  [Nouvelle tâche] │  │ Focus    │ │ Insights     │  │
│                   │  │ Mode     │ │ de la        │  │
│                   │  │          │ │ semaine      │  │
│                   │  └──────────┘ └──────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Coach Card (composant principal)

**État par défaut :**

```tsx
<CoachCard>
  <Greeting>
    Bonjour {firstName}. 👋
  </Greeting>
  
  <Insight type="urgent">
    Tu as {urgentCount} tâche(s) urgente(s) aujourd'hui.
    La plus importante : "{topTask.title}" — échéance {topTask.dueDate}.
    {topTask.isOverdue ? "Elle est déjà en retard." : ""}
  </Insight>
  
  <Action>
    <Button onClick={startBrainDump}>
      Commencer ma journée →
    </Button>
  </Action>
</CoachCard>
```

**État avec données :**

```tsx
<CoachCard>
  <Greeting>
    Bonjour Sarah. 👋
  </Greeting>
  
  <Insight type="positive">
    📈 Cette semaine tu as gagné 2h par rapport à la semaine dernière.
  </Insight>
  
  <Insight type="warning">
    ⚠️ Tu as 18 tâches en attente. Statistiquement, tu en finiras 7.
    Veux-tu que je t'aide à prioriser ?
  </Insight>
  
  <Actions>
    <Button onClick={optimizePlanning}>
      Optimiser mon planning
    </Button>
    <Button onClick={viewInsights} variant="ghost">
      Voir mes insights
    </Button>
  </Actions>
</CoachCard>
```

### Stats Cards (remplacent les actuelles)

**Avant :** Chiffres froids
```
Temps total : 6h 23m
Sessions : 4
Projets : 3
```

**Après :** Chiffres avec contexte
```
Aujourd'hui : 6h 23m
↑ 21% vs hier

Sessions : 4
🎯 Tu es dans ta zone

Projets actifs : 3
⚠️ 1 en retard
```

### Planning Visuel (remplace Calendar)

Pas un calendrier mensuel. Un **time blocking journalier** :

```tsx
<DayPlan date={today}>
  <TimeBlock 
    start="09:00" 
    end="10:30"
    task={rapportQ3}
    method="eat_that_frog"
    color="red"
  />
  <Break start="10:30" end="10:45" />
  <TimeBlock 
    start="10:45" 
    end="11:30"
    task={reunion}
    method="time_blocking"
    color="blue"
  />
  <CapacityBar 
    used={6} 
    total={8}
    message="Tu as 2h libres. Parfait pour de l'imprévu."
  />
</DayPlan>
```

---

## 4. BRAIN DUMP — LE KILLER FEATURE

### Parcours utilisateur

```
Étape 1          Étape 2           Étape 3          Étape 4
Input libre  →   Questions     →   Classement   →   Planning
"textarea"       rapides (5)       auto IE          optimisé
```

### Étape 1 : Input Libre

```tsx
<BrainDumpPage>
  <Header>
    <h1>Qu'est-ce que tu dois faire ?</h1>
    <p>Écris tout. Sans réfléchir. Sans trier.</p>
  </Header>
  
  <TextArea
    placeholder={"Répondre aux emails\nFinir le rapport Q3\nAller à la banque\nAppeler maman\nFaire du sport..."}
    autoSave
  />
  
  <Footer>
    <Button onClick={validateDump} disabled={items.length === 0}>
      Classer mes tâches →
    </Button>
    <Hint>
      Tip : 2-Minute Rule — si ça prend moins de 2 minutes, fais-le maintenant.
    </Hint>
  </Footer>
</BrainDumpPage>
```

### Étape 2 : Questions Rapides

Pour chaque tâche, 5 questions en **< 10 secondes** :

```tsx
<ClassificationWizard task={currentTask}>
  <Question
    text="A-t-il une deadline ?"
    options={[
      { label: "Oui", value: "yes", icon: "⏰" },
      { label: "Non", value: "no", icon: "🕐" }
    ]}
  />
  
  <Question
    text="Conséquence si non fait ?"
    options={[
      { label: "Grave", value: "serious", icon: "🔴" },
      { label: "Néant", value: "none", icon: "⚪" }
    ]}
  />
  
  <Question
    text="Important pour toi ?"
    options={[
      { label: "Oui", value: "yes", icon: "⭐" },
      { label: "Non", value: "no", icon: "📌" }
    ]}
  />
  
  <Question
    text="Déléguable ?"
    options={[
      { label: "Oui", value: "yes", icon: "👥" },
      { label: "Non", value: "no", icon: "🙋" }
    ]}
  />
  
  <Question
    text="Temps estimé ?"
    options={[
      { label: "< 2min", value: "tiny", icon: "⚡" },
      { label: "30min", value: "short", icon: "⏱️" },
      { label: "1-2h", value: "medium", icon: "🕐" },
      { label: "2h+", value: "long", icon: "📅" }
    ]}
  />
  
  <ProgressBar current={currentIndex} total={totalTasks} />
</ClassificationWizard>
```

### Étape 3 : Résultat Visuel

La matrice d'Eisenhower se remplit en temps réel :

```tsx
<EisenhowerMatrix>
  <Quadrant
    title="🔴 Faire maintenant"
    subtitle="Urgent + Important"
    tasks={urgentImportant}
    color="red"
    animation="shake" // attire l'attention
  />
  <Quadrant
    title="🟡 Planifier"
    subtitle="Important + Pas urgent"
    tasks={importantNotUrgent}
    color="yellow"
  />
  <Quadrant
    title="🔵 Déléguer"
    subtitle="Urgent + Pas important"
    tasks={urgentNotImportant}
    color="blue"
  />
  <Quadrant
    title="⚪ Éliminer"
    subtitle="Ni urgent ni important"
    tasks={neither}
    color="gray"
  />
</EisenhowerMatrix>
```

### Étape 4 : Génération du Planning

```tsx
<PlanningGenerator>
  <h2>Voici ton plan optimal pour aujourd'hui</h2>
  
  <OptimizedSchedule>
    <TimeBlock task={frogTask} method="eat_that_frog" />
    <TimeBlock task={meetings} method="time_blocking" />
    <TimeBlock task={emails} method="2min_rule" />
  </OptimizedSchedule>
  
  <CapacityWarning>
    Tu as 6h de travail sur 8h disponibles. ✅
    2h de marge pour l'imprévu.
  </CapacityWarning>
  
  <Actions>
    <Button onClick={startDay}>Commencer ma journée</Button>
    <Button onClick={adjustManually} variant="ghost">Ajuster manuellement</Button>
  </Actions>
</PlanningGenerator>
```

---

## 5. PLANNING INTELLIGENT

### Time Blocking Visual

```tsx
<DayView date={selectedDate}>
  <HourAxis>
    {/* 6h → 22h, chaque ligne = 30min */}
  </HourAxis>
  
  <TimeBlocks>
    {blocks.map(block => (
      <DraggableBlock
        key={block.id}
        task={block.task}
        start={block.start}
        end={block.end}
        color={block.priorityColor}
        method={block.method}
        onDragEnd={handleReorder}
      >
        <BlockHeader>
          <span>{block.task.title}</span>
          <span>{block.method}</span>
        </BlockHeader>
        <ProgressBar progress={block.completionPercent} />
      </DraggableBlock>
    ))}
  </TimeBlocks>
  
  <EmptySlots>
    {emptySlots.map(slot => (
      <EmptyBlock
        key={slot.start}
        start={slot.start}
        end={slot.end}
        suggestion={slot.aiSuggestion}
        onClick={addTaskToSlot}
      />
    ))}
  </EmptySlots>
  
  <CapacityIndicator
    total={8} // heures
    used={totalBlockHours}
    message={capacityMessage}
  />
</DayView>
```

### Méthodes intégrées

| Méthode | UI | Quand |
|---------|-----|-------|
| **Eat That Frog** | 🐸 Badge rouge sur la 1ère tâche | Tâche haute priorité le matin |
| **Pomodoro** | 🍅 Timer 25/5 intégré | Tâche > 1h |
| **Time Blocking** | 📦 Blocs colorés dans le planning | Toutes les tâches |
| **2-Minute Rule** | ⚡ Tâche < 2min → faire maintenant | Classification auto |
| **MIT** | ⭐ 3 étoiles sur les tâches clés | Chaque jour |
| **Ivy Lee** | 📋 Numérotation 1-6 | 6+ tâches |

---

## 6. FOCUS MODE

### Layout

```tsx
<FocusMode task={selectedTask}>
  {/* Fond qui s'assombrit progressivement */}
  <Backdrop blur={20} opacity={0.8} />
  
  <FocusContainer>
    {/* En-tête */}
    <TaskBadge priority={task.priority} />
    <h2>{task.title}</h2>
    
    {/* Timer central */}
    <PomodoroTimer
      duration={25 * 60}
      breaks={[5, 5, 5, 20]}
      onComplete={onSessionComplete}
    >
      {/* Cercle SVG animé */}
      <TimerDisplay seconds={remaining} />
      <SessionIndicator current={1} total={4} />
    </PomodoroTimer>
    
    {/* Méthode appliquée */}
    <MethodBadge method="eat_that_frog" />
    
    {/* Estimation vs réel */}
    <TimeComparison
      estimated={task.estimated_duration}
      actual={elapsed}
    />
    
    {/* Conseil du coach */}
    <CoachTip>
      💡 "Tu es plus productif le matin. Cette tâche serait mieux
      placée à 9h."
    </CoachTip>
    
    {/* Actions */}
    <Actions>
      <Button onClick={pause} icon="⏸️">Pause</Button>
      <Button onClick={stop} icon="⏹️" variant="danger">Arrêter</Button>
      <Button onClick={postpone} icon="⏭️" variant="ghost">Reporter</Button>
    </Actions>
  </FocusContainer>
</FocusMode>
```

---

## 7. ANIMATIONS & MICRO-INTERACTIONS

### Librairie : Framer Motion

```bash
npm install framer-motion
```

### Animations à implémenter

| Élément | Animation | CSS/Framer | Durée |
|---------|-----------|------------|-------|
| **Page transition** | Slide horizontal + fade | Framer `AnimatePresence` | 300ms |
| **Card apparition** | Slide up + fade | Framer `motion.div` | 200ms |
| **Tâche complétée** | Confettis + scale down | canvas-confetti | 500ms |
| **Stats compteur** | Compteur animé | Framer `useMotionValue` | 800ms |
| **Drag & drop** | Scale + ombre | Framer `layout` | 200ms |
| **Coach card** | Typewriter effect | Custom hook | 2s |
| **Focus mode** | Fond assombri progressif | CSS transition | 500ms |
| **Brain Dump items** | Slide in + bounce | Framer `stagger` | 100ms/item |
| **Eisenhower matrix** | Items qui "tombent" dans les cases | Framer `layout` | 300ms |
| **Skeleton loading** | Shimmer effect | CSS animation | 1.5s loop |
| **Toast notification** | Slide from right + auto-dismiss | Framer | 300ms |
| **Sidebar active** | Indicator bar slide | Framer `motion.div` | 200ms |
| **Hover effects** | Scale 1.02 + shadow | CSS transition | 150ms |
| **Focus ring** | Border pulse | CSS animation | 200ms |

### Code — Page Transition

```tsx
// App.tsx
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.3
};

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <Routes location={location}>
          {/* routes */}
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}
```

### Code — Confettis sur tâche complétée

```tsx
import confetti from 'canvas-confetti';

const triggerConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#00B4DB', '#16213e', '#FFD700']
  });
};

// Utilisation
const handleTaskComplete = (taskId: number) => {
  updateTask(taskId, { is_completed: true });
  triggerConfetti();
};
```

### Code — Compteur animé

```tsx
import { useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, latest => Math.round(latest));
  const display = useTransform(rounded, latest => `${latest}${suffix}`);

  useEffect(() => {
    animate(count, value, { duration: 0.8, ease: "easeOut" });
  }, [value]);

  return <motion.span>{display}</motion.span>;
}
```

### Code — Skeleton Loading

```tsx
function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-4 p-6 bg-white rounded-2xl">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-8 bg-gray-200 rounded w-1/4 mt-6"></div>
    </div>
  );
}

// CSS
// .animate-pulse { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
```

### Code — Toast Notifications

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'warning' | 'info';
  message: string;
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="flex items-center gap-3 bg-white shadow-lg rounded-xl px-4 py-3 min-w-[300px]"
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-500" />}
            <span className="flex-1 text-sm">{toast.message}</span>
            <button onClick={() => onDismiss(toast.id)}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
```

---

## 8. DARK MODE ADAPTATIF

### Logique

```tsx
// ThemeContext.tsx
const getAutoTheme = (): 'light' | 'dark' => {
  const hour = new Date().getHours();
  if (hour >= 22 || hour < 6) return 'dark';    // Nuit → sombre
  if (hour >= 18) return 'dark';                 // Soirée → sombre
  return 'light';                                 // Matin/Après-midi → clair
};

// Toggle avec 3 options
type ThemeMode = 'light' | 'dark' | 'auto';
```

### Palette Dark Mode

```css
/* Dark mode - pas juste inverser */
:root.dark {
  --bg-primary: #0f172a;        /* Slate 900 */
  --bg-secondary: #1e293b;      /* Slate 800 */
  --bg-card: #1e293b;
  --text-primary: #f1f5f9;      /* Slate 100 */
  --text-secondary: #94a3b8;    /* Slate 400 */
  --border: #334155;            /* Slate 700 */
  --accent: #00B4DB;            /* Identique */
  --accent-hover: #0097bc;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}
```

### Composant Toggle

```tsx
<ThemeToggle>
  <Option icon="☀️" value="light" label="Clair" />
  <Option icon="🌙" value="dark" label="Sombre" />
  <Option icon="🔄" value="auto" label="Auto" />
</ThemeToggle>
```

---

## 9. PWA — OFFLINE FIRST

### Configuration

```json
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Time Pro',
        short_name: 'TimePro',
        description: 'Comprends ton temps avant de le gérer.',
        theme_color: '#00B4DB',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/icons/192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/localhost:8000\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 3600 }
            }
          }
        ]
      }
    })
  ]
});
```

### Offline Indicator

```tsx
function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  if (isOnline) return null;
  
  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50"
    >
      📡 Mode hors ligne — Tes données seront synchronisées dès la reconnexion.
    </motion.div>
  );
}
```

---

## 10. GAMIFICATION LÉGÈRE

### Système de Badges

```tsx
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

const BADGES: Badge[] = [
  { id: 'first_task', name: 'Premier pas', description: 'Créer ta première tâche', icon: '🎯' },
  { id: 'planner_7', name: 'Régulier', description: 'Planifier 7 jours consécutifs', icon: '📅' },
  { id: 'focus_4h', name: 'Concentré', description: '4h de deep work en une journée', icon: '🧠' },
  { id: 'productive_80', name: 'Efficace', description: '>80% tâches complétées', icon: '⚡' },
  { id: 'early_bird', name: 'Prévoyant', description: 'Planifier la veille au soir', icon: '🐦' },
  { id: 'brain_dump', name: 'Vide esprit', description: '10 brain dumps réalisés', icon: '💭' },
  { id: 'week_master', name: 'Maître de la semaine', description: 'Terminer toutes les tâches de la semaine', icon: '👑' },
];
```

### Affichage des badges

```tsx
<BadgeShelf badges={unlockedBadges} />
// Affiche les badges déverrouillés avec animation de glow
// Les badges non déverrouillés sont grisés avec un tooltip "Continue comme ça !"
```

### Séries (Streaks)

```tsx
<StreakCounter
  currentStreak={7}
  bestStreak={12}
  message="7 jours consécutifs à planifier ! 🔥"
/>
```

---

## 11. EMPTY STATES & ONBOARDING

### Empty States

**Pas de tâches :**

```tsx
<EmptyState
  icon="🧠"
  title="Ton esprit est vide. C'est bien."
  description="Maintenant, remplis-le. Écris tout ce que tu dois faire. On s'occupe du reste."
  action={{ label: 'Commencer le Brain Dump →', onClick: startBrainDump }}
/>
```

**Pas de projets :**

```tsx
<EmptyState
  icon="📁"
  title="Aucun projet pour l'instant."
  description="Les projets aident à grouper tes tâches. Commence par en créer un."
  action={{ label: 'Créer un projet', onClick: createProject }}
/>
```

**Pas de temps tracké :**

```tsx
<EmptyState
  icon="⏱️"
  title="Tu n'as pas encore tracké de temps."
  description="Le suivi du temps t'aide à comprendre où il va. Commence une session."
  action={{ label: 'Démarrer un timer', onClick: startTimer }}
/>
```

**Pas de notifications :**

```tsx
<EmptyState
  icon="📬"
  title="Boîte de réception vide."
  description="C'est calme ici. Les notifications de ton équipe apparaîtront ici."
/>
```

### Onboarding Simplifié

**Avant :** 10 étapes de formulaire → taux d'abandon élevé

**Après :** 3 étapes Maximum

```
Étape 1 : Brain Dump (30 secondes)
"Qu'est-ce que tu dois faire ?"
→ L'utilisateur écrit ses tâches

Étape 2 : Classification rapide (1 minute)
5 questions pour la tâche la plus importante
→ L'utilisateur comprend le concept

Étape 3 : Premier planning (30 secondes)
"Voici ton premier plan optimisé."
→ L'utilisateur voit la valeur immédiatement
```

---

## 12. NOTIFICATIONS INTELLIGENTES

### Types de notifications

```tsx
interface Notification {
  id: string;
  type: 'morning_brief' | 'deadline_warning' | 'end_of_day' | 'weekly_report' | 'coach_tip';
  title: string;
  message: string;
  action?: { label: string; onClick: string };
  priority: 'low' | 'medium' | 'high';
}

// Exemples
const notifications: Notification[] = [
  {
    type: 'morning_brief',
    title: '🌅 Résumé de la journée',
    message: "Tu as 3 tâches aujourd'hui. La plus importante : Rapport Q3 (échéance demain).",
    action: { label: 'Commencer', onClick: 'start_day' },
    priority: 'high'
  },
  {
    type: 'deadline_warning',
    title: '⏰ Bientôt en retard',
    message: '"Réunion préparation" est due dans 2h.',
    action: { label: 'Voir', onClick: 'view_task' },
    priority: 'high'
  },
  {
    type: 'coach_tip',
    title: '💡 Conseil du coach',
    message: "Tu es 3x plus productif le mardi matin. Place tes tâches importantes à ce moment-là.",
    priority: 'low'
  },
  {
    type: 'end_of_day',
    title: '🌙 Résumé de la journée',
    message: "Aujourd'hui : 6h23 de travail, 4 tâches terminées. +21% vs la moyenne.",
    priority: 'medium'
  },
  {
    type: 'weekly_report',
    title: '📊 Rapport hebdomadaire',
    message: "Cette semaine : 23 tâches terminées, 4 en retard. Tu progresses bien !",
    action: { label: 'Voir le rapport', onClick: 'view_report' },
    priority: 'medium'
  }
];
```

---

## 13. LISTE COMPLÈTE DES TÂCHES

### Phase 1 : Fondations (Semaine 1-2)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 1 | Refactorer Dashboard.tsx en modules séparés | Haute | 4h |
| 2 | Créer Service Layer (Services/, Repositories/) | Haute | 6h |
| 3 | Ajouter Redis pour le caching | Haute | 3h |
| 4 | Créer les migrations (brain_dump, daily_plans, insights) | Haute | 2h |
| 5 | Installer Framer Motion + canvas-confetti | Moyenne | 0.5h |
| 6 | Créer le composant Toast global | Moyenne | 2h |
| 7 | Implémenter Skeleton Loading | Moyenne | 2h |
| 8 | Configurer PWA (vite-plugin-pwa) | Moyenne | 3h |
| 9 | Créer le composant EmptyState universel | Basse | 1.5h |
| 10 | Ajouter les types TypeScript stricts | Haute | 4h |

### Phase 2 : Brain Dump (Semaine 3)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 11 | BrainDumpService (Backend) | Haute | 4h |
| 12 | EisenhowerClassifier (Backend) | Haute | 3h |
| 13 | API endpoints brain-dump | Haute | 3h |
| 14 | Composant BrainDumpPage (Frontend) | Haute | 6h |
| 15 | Composant ClassificationWizard | Haute | 4h |
| 16 | Composant EisenhowerMatrix | Haute | 3h |
| 17 | Animations Brain Dump (stagger, slide) | Moyenne | 2h |
| 18 | Intégration Brain Dump → Tasks | Haute | 2h |

### Phase 3 : Planning Intelligent (Semaine 4)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 19 | DailyPlanBuilder (Backend) | Haute | 5h |
| 20 | API endpoints plans | Haute | 3h |
| 21 | Composant DayPlanner (time blocking) | Haute | 6h |
| 22 | Drag & drop sur les time blocks | Haute | 4h |
| 23 | Intégration Pomodoro dans le planning | Moyenne | 3h |
| 24 | Capacité quotidienne (barre de progression) | Moyenne | 2h |
| 25 | Méthodes : Eat That Frog, MIT, Ivy Lee | Moyenne | 3h |

### Phase 4 : Focus Mode (Semaine 5)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 26 | Composant FocusMode (overlay plein écran) | Haute | 4h |
| 27 | PomodoroTimer (cercle SVG animé) | Haute | 3h |
| 28 | Session tracking (temps réel) | Haute | 2h |
| 29 | Comparaison estimé vs réel | Moyenne | 2h |
| 30 | CoachTip intégré au focus | Basse | 1.5h |

### Phase 5 : Dashboard Coach (Semaine 6)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 31 | Composant CoachCard (remplace WelcomeSection) | Haute | 4h |
| 32 | Stats animées (compteurs) | Moyenne | 2h |
| 33 | Notifications intelligentes | Haute | 4h |
| 34 | Insights hebdomadaires | Moyenne | 3h |
| 35 | TimeInsightGenerator (Backend) | Haute | 4h |

### Phase 6 : Dark Mode + Polish (Semaine 7)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 36 | Dark mode adaptatif (auto par heure) | Moyenne | 2h |
| 37 | Palette dark mode complète | Moyenne | 2h |
| 38 | Page transitions (Framer Motion) | Moyenne | 2h |
| 39 | Micro-interactions (hover, focus, click) | Basse | 3h |
| 40 | Confettis sur tâche complétée | Basse | 0.5h |

### Phase 7 : Gamification + Empty States (Semaine 8)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 41 | Système de badges | Basse | 3h |
| 42 | Système de streaks | Basse | 2h |
| 43 | Empty states (4 composants) | Moyenne | 2h |
| 44 | Onboarding simplifié (3 étapes) | Haute | 4h |
| 45 | Toast notifications | Moyenne | 2h |

### Phase 8 : Tests + Production (Semaine 9)

| # | Tâche | Priorité | Estimation |
|---|-------|----------|------------|
| 46 | Tests unitaires (components) | Haute | 6h |
| 47 | Tests E2E (Playwright) | Haute | 4h |
| 48 | Optimisation bundle (tree shaking) | Moyenne | 2h |
| 49 | Lighthouse audit (score > 90) | Haute | 3h |
| 50 | CI/CD pipeline | Haute | 3h |

---

## 14. CHECKLIST D'OPTIMISATION

### Performance

- [ ] Lazy loading des routes (`React.lazy`)
- [ ] Code splitting par composant
- [ ] Image optimization (WebP, lazy load)
- [ ] Font optimization (subset, preload)
- [ ] Bundle analysis (< 200KB gzipped)
- [ ] Service Worker pour le cache
- [ ] Virtual scrolling pour les longues listes
- [ ] Debounce sur les recherches
- [ ] Memoization (`useMemo`, `useCallback`)
- [ ] Preconnect aux domaines externes

### Accessibilité

- [ ] Keyboard navigation complète
- [ ] Screen reader labels (aria-label)
- [ ] Focus visible sur tous les éléments interactifs
- [ ] Contraste WCAG AA minimum
- [ ] Textes alternatifs pour les images
- [ ] Skip navigation link
- [ ] Reduced motion media query
- [ ] Error messages associés aux champs

### UX

- [ ] Loading states (skeletons, pas de spinners)
- [ ] Error states avec actions de retry
- [ ] Empty states avec CTA
- [ ] Toast notifications (pas d'alert())
- [ ] Confirmation avant suppression
- [ ] Undo pour les actions destructives
- [ ] Autosave pour le Brain Dump
- [ ] Keyboard shortcuts (Ctrl+K pour recherche)
- [ ] Responsive mobile-first
- [ ] Offline indicator

### Code Quality

- [ ] TypeScript strict mode
- [ ] ESLint + Prettier configurés
- [ ] Pas de `any` dans le code
- [ ] Components < 200 lignes
- [ ] Custom hooks pour la logique métier
- [ ] Tests pour chaque composant
- [ ] Storybook pour les composants UI
- [ ] Props typées (pas de `{...any}`)

---

## RÉSUMÉ

| Catégorie | Avant | Après |
|-----------|-------|-------|
| **Landing** | Présentation générique | Copywriting psychologiquement conçu |
| **Dashboard** | Stats froides | Coach intelligent qui parle |
| **Brain Dump** | Formulaire de création | Flux conversationnel |
| **Planning** | Calendrier mensuel | Time blocking intelligent |
| **Focus** | Timer basique | Mode concentration + Pomodoro |
| **Animations** | Aucune | Framer Motion partout |
| **Dark Mode** | Toggle manuel | Adaptatif selon l'heure |
| **Offline** | Non | PWA complète |
| **Gamification** | Aucune | Badges + streaks |
| **Empty States** | "Aucun élément" | Messages incitatifs |
| **Notifications** | Basiques | Contextuelles + coach |
