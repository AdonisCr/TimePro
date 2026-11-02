import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { PageTransition } from "./components/ui/Animations";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OnboardingPage from "./pages/OnboardingPage";
import Dashboard from "./pages/Dashboard";
import BrainDumpPage from "./pages/BrainDumpPage";
import FocusPage from "./pages/FocusPage";
import PlanningPage from "./pages/PlanningPage";
import HabitsPage from "./pages/HabitsPage";
import WeeklyReport from "./pages/WeeklyReport";
import MonthlyGoals from "./pages/MonthlyGoals";
import InvitationPage from "./pages/InvitationPage";
import CalendarPage from "./pages/CalendarPage";
import SharePlanningPage from "./pages/SharePlanningPage";
import ExportPage from "./pages/ExportPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
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

const toWeeklyTask = (t: ApiTask): { id: number; title: string; project?: string; status: string; priority: string; due_date?: string; estimated_duration?: number } => ({
  id: t.id,
  title: t.title,
  project: t.project?.name,
  status: t.status,
  priority: t.priority,
  due_date: t.due_date ?? undefined,
  estimated_duration: t.estimated_duration ?? undefined,
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
        <Routes location={location}>
          {/* Pages publiques */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/invitation/:token" element={<InvitationPage />} />
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
