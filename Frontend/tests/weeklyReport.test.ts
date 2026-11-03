import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWeeklyReport,
  formatSecondsAsHours,
  localDayKey,
  type WeeklyTask,
  type WeeklyTimeEntry,
} from '../src/lib/weeklyReport.ts';

const now = new Date(2026, 10, 3, 12, 0, 0); // 3 novembre 2026, midi (heure locale)

const at = (dayOffset: number, hour = 10): string => {
  const date = new Date(now);
  date.setDate(now.getDate() + dayOffset);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const task = (overrides: Partial<WeeklyTask> = {}): WeeklyTask => ({
  id: 1,
  title: 'Tâche',
  status: 'todo',
  priority: 'medium',
  created_at: at(-1),
  completed_at: null,
  updated_at: at(-1),
  ...overrides,
});

const entry = (durationSeconds: number, startTime = at(0)): WeeklyTimeEntry => ({
  id: 1,
  duration: durationSeconds,
  start_time: startTime,
});

test('les secondes sont converties en heures et minutes', () => {
  assert.equal(formatSecondsAsHours(3600), '1h00');
  assert.equal(formatSecondsAsHours(5400), '1h30');
  assert.equal(formatSecondsAsHours(3599), '0h59');
  assert.equal(formatSecondsAsHours(0), '0h00');
  assert.equal(formatSecondsAsHours(-10), '0h00');
});

test('une heure de travail n’est pas affichée comme 60 heures', () => {
  const report = buildWeeklyReport([], [entry(3600)], now);

  assert.equal(report.totalTimeSeconds, 3600);
  assert.equal(formatSecondsAsHours(report.totalTimeSeconds), '1h00');
});

test('les durées de plusieurs entrées s’additionnent en secondes', () => {
  const report = buildWeeklyReport([], [entry(3600), entry(1800)], now);

  assert.equal(report.totalTimeSeconds, 5400);
  assert.equal(formatSecondsAsHours(report.totalTimeSeconds), '1h30');
});

test('les tâches créées cette semaine viennent de created_at, pas de l’identifiant', () => {
  const createdThisWeek = task({ id: 999, created_at: at(-2) });
  const createdLongAgo = task({ id: 5, created_at: at(-30), due_date: at(0) });
  const withoutCreationDate = task({ id: 1000, created_at: null, due_date: at(0) });

  const report = buildWeeklyReport(
    [createdThisWeek, createdLongAgo, withoutCreationDate],
    [],
    now
  );

  assert.equal(report.totalCount, 1);
});

test('les tâches terminées cette semaine viennent de completed_at', () => {
  const doneToday = task({
    id: 1,
    status: 'done',
    completed_at: at(0),
    updated_at: at(-20),
  });
  const doneLongAgoButEdited = task({
    id: 2,
    status: 'done',
    completed_at: at(-20),
    updated_at: at(0),
  });

  const report = buildWeeklyReport([doneToday, doneLongAgoButEdited], [], now);

  assert.equal(report.completedCount, 1);
  assert.equal(report.dailyBreakdown[6].tasks, 1);
});

test('ancienne tâche terminée sans completed_at : updated_at sert de secours', () => {
  const report = buildWeeklyReport(
    [task({ status: 'done', completed_at: null, updated_at: at(-1) })],
    [],
    now
  );

  assert.equal(report.completedCount, 1);
});

test('le taux de complétion et la moyenne par tâche sont cohérents', () => {
  const tasks = [
    task({ id: 1, status: 'done', completed_at: at(0) }),
    task({ id: 2, status: 'done', completed_at: at(-1) }),
    task({ id: 3, status: 'todo' }),
    task({ id: 4, status: 'todo' }),
  ];

  const report = buildWeeklyReport(tasks, [entry(3600)], now);

  assert.equal(report.totalCount, 4);
  assert.equal(report.completedCount, 2);
  assert.equal(report.completionRate, 50);
  assert.equal(report.avgTimePerTaskSeconds, 1800);
});

test('l’activité par jour est ventilée sur le bon jour local', () => {
  const report = buildWeeklyReport(
    [task({ status: 'done', completed_at: at(0) })],
    [entry(1800, at(0, 9)), entry(900, at(-1, 18))],
    now
  );

  const today = report.dailyBreakdown[6];
  const yesterday = report.dailyBreakdown[5];

  assert.equal(today.date, localDayKey(now));
  assert.equal(today.timeSeconds, 1800);
  assert.equal(today.tasks, 1);
  assert.equal(yesterday.timeSeconds, 900);
  assert.equal(report.dailyBreakdown.length, 7);
});

test('une entrée hors des 7 derniers jours est ignorée', () => {
  const report = buildWeeklyReport([], [entry(3600, at(-30))], now);

  assert.equal(report.totalTimeSeconds, 0);
  assert.equal(report.dailyBreakdown.every((day) => day.timeSeconds === 0), true);
});
