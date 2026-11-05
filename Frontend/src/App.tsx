import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { PageTransition } from "./components/ui/Animations";

// La page d'accueil reste chargée tout de suite : c'est la première chose
// que voit un visiteur. Les autres pages sont chargées à la demande, ce qui
// allège le fichier JavaScript initial.
import HomePage from "./pages/HomePage";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BrainDumpPage = lazy(() => import("./pages/BrainDumpPage"));
const FocusPage = lazy(() => import("./pages/FocusPage"));
const PlanningPage = lazy(() => import("./pages/PlanningPage"));
const HabitsPage = lazy(() => import("./pages/HabitsPage"));
const WeeklyReport = lazy(() => import("./pages/WeeklyReport"));
const MonthlyGoals = lazy(() => import("./pages/MonthlyGoals"));
const InvitationPage = lazy(() => import("./pages/InvitationPage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const SharePlanningPage = lazy(() => import("./pages/SharePlanningPage"));
const SharedPlanningPage = lazy(() => import("./pages/SharedPlanningPage"));
const ExportPage = lazy(() => import("./pages/ExportPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));

const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div
      className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
      role="status"
      aria-label="Chargement de la page"
    />
  </div>
);
import { useTasks, type Task as ApiTask } from "./hooks/useTasks";
import { useTimeEntries, type TimeEntry as ApiTimeEntry } from "./hooks/useTimeEntries";
import type { Task as ProdTask } from "./lib/productivity";

const toProdTask = (t: ApiTask): ProdTask => ({
  id: t.id,
  title: t.title,
  description: t.description ?? undefined,
  priority: t.priority,
  status: t.status,
  due_date: t.due_date ?? undefined,
  estimated_duration: t.estimated_duration ?? undefined,
  project: t.project ? { name: t.project.name, color: t.project.color } : undefined,
});

const toWeeklyTask = (t: ApiTask): { id: number; title: string; project?: string; status: string; priority: string; due_date?: string; estimated_duration?: number; created_at: string | null; completed_at: string | null; updated_at: string | null } => ({
  id: t.id,
  title: t.title,
  project: t.project?.name,
  status: t.status,
  priority: t.priority,
  due_date: t.due_date ?? undefined,
  estimated_duration: t.estimated_duration ?? undefined,
  created_at: t.created_at ?? null,
  completed_at: t.completed_at ?? null,
  updated_at: t.updated_at ?? null,
});

const toWeeklyEntry = (e: ApiTimeEntry): { id: number; description?: string; start_time: string; end_time?: string; duration: number; project_id?: number; task_id?: number } => ({
  id: e.id,
  description: e.description ?? undefined,
  start_time: e.start_time,
  end_time: e.end_time ?? undefined,
  duration: e.duration ?? 0,
  project_id: e.project_id ?? undefined,
  task_id: e.task_id ?? undefined,
});

const PlanningRoute = () => {
  const { tasks } = useTasks();
  return <PlanningPage tasks={tasks.map(toProdTask)} />;
};

const WeeklyReportRoute = () => {
  const { tasks } = useTasks();
  const { entries } = useTimeEntries();
  return <WeeklyReport tasks={tasks.map(toWeeklyTask)} timeEntries={entries.map(toWeeklyEntry)} />;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            {/* Pages publiques */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/invitation/:token" element={<InvitationPage />} />
            <Route path="/shared/planning/:userId" element={<SharedPlanningPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Pages protégées — redirect vers /login si non connecté */}
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<OnboardingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/brain-dump" element={<BrainDumpPage />} />
              <Route path="/focus" element={<FocusPage />} />
              <Route path="/planning" element={<PlanningRoute />} />
              <Route path="/habits" element={<HabitsPage />} />
              <Route path="/weekly-report" element={<WeeklyReportRoute />} />
              <Route path="/monthly-goals" element={<MonthlyGoals />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/share-planning" element={<SharePlanningPage />} />
              <Route path="/export" element={<ExportPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </PageTransition>
    </AnimatePresence>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
