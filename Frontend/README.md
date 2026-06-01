# TimePro - Frontend

Application React pour la gestion du temps et des tâches.

## 🛠️ Stack Technique

- **React 18**
- **TypeScript**
- **Vite** (Build tool)
- **Tailwind CSS**
- **React Router**
- **Axios**

## ⚡ Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Builder pour production
npm run build

# Aperçu production
npm run preview
```

## ⚙️ Configuration

Créer un fichier `.env.local` à la racine :

```env
VITE_API_URL=http://localhost:8000/api
```

## 🔧 Scripts

| Commande | Description |
|---------|------------|
| `npm run dev` | Serveur développement |
| `npm run build` | Build production |
| `npm run lint` | Vérifier le code |
| `npm run preview` | Tester le build |

## 📁 Structure

```
src/
├── components/
│   └── dashboard/
│       ├── AddTaskModal.tsx
│       ├── TaskDetailModal.tsx
│       ├── TaskList.tsx
│       ├── KanbanBoard.tsx
│       ├── Calendar.tsx
│       └── ...
├── hooks/
│   ├── useTasks.ts
│   ├── useProjects.ts
│   └── useTimeEntries.ts
├── pages/
│   └── Dashboard.tsx
└── lib/
    └── axios.ts
```

## 🎨 Personnalisation

Couleurs dans `tailwind.config.js` :

```js
colors: {
  primary: '#00B4DB',
  'primary-hover': '#087c95',
  'text-dark': '#1A2A49',
  'text-soft': '#64748B',
}
```

## 🔐 Authentification

- Token stocké dans `localStorage`
- Bearer token dans les headers
- Auto-refresh sur erreur 401

## 🌐 API Backend

Pointer vers `http://localhost:8000/api` (défaut)

Configurer via `VITE_API_URL` dans .env.

## 🚀 Déploiement

```bash
# Build
npm run build

# output dans dist/
# Déployer dist/ sur serveur web
```

## 📦 Dépendances principales

```json
{
  "react": "^18.3.1",
  "react-router-dom": "^6.26.1",
  "@hello-pangea/dnd": "^16.6.0",
  "axios": "^1.13.6",
  "lucide-react": "^0.344.0",
  "tailwindcss": "^3.4.1"
}
```

## 🧪 Tests

```bash
# À implémenter
npm run test
```

---

**TimePro** - Gestion intelligente du temps 🕐