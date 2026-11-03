import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createIdleTimer,
  getElapsedSeconds,
  getFirstStart,
  getStatus,
  parseTimerState,
  pauseTimer,
  resumeTimer,
  serializeTimer,
  startTimer,
} from '../src/lib/timer.ts';

const MINUTE = 60 * 1000;
const t0 = new Date(2026, 10, 3, 9, 0, 0).getTime();

test('25 min de travail + 5 min de pause + 10 min de travail = 35 min', () => {
  let timer = startTimer(t0);
  assert.equal(getStatus(timer), 'running');

  timer = pauseTimer(timer, t0 + 25 * MINUTE);
  assert.equal(getStatus(timer), 'paused');

  timer = resumeTimer(timer, t0 + 30 * MINUTE);
  assert.equal(getStatus(timer), 'running');

  const stopAt = t0 + 40 * MINUTE;
  assert.equal(getElapsedSeconds(timer, stopAt), 35 * 60);
});

test('le temps affiché n’avance plus pendant la pause', () => {
  let timer = startTimer(t0);
  timer = pauseTimer(timer, t0 + 10 * MINUTE);

  assert.equal(getElapsedSeconds(timer, t0 + 10 * MINUTE), 600);
  assert.equal(getElapsedSeconds(timer, t0 + 60 * MINUTE), 600);
});

test('mettre en pause deux fois ne change rien', () => {
  const paused = pauseTimer(startTimer(t0), t0 + 5 * MINUTE);
  const pausedAgain = pauseTimer(paused, t0 + 20 * MINUTE);

  assert.deepEqual(pausedAgain, paused);
  assert.equal(getElapsedSeconds(pausedAgain, t0 + 20 * MINUTE), 300);
});

test('reprendre une session déjà en cours ne crée pas de segment', () => {
  const timer = startTimer(t0);
  assert.deepEqual(resumeTimer(timer, t0 + MINUTE), timer);
  assert.equal(timer.segments.length, 1);
});

test('un chronomètre vide vaut zéro seconde', () => {
  const timer = createIdleTimer();
  assert.equal(getStatus(timer), 'idle');
  assert.equal(getElapsedSeconds(timer, t0), 0);
  assert.equal(getFirstStart(timer), null);
});

test('le début enregistré est celui du tout premier segment', () => {
  let timer = startTimer(t0);
  timer = pauseTimer(timer, t0 + 10 * MINUTE);
  timer = resumeTimer(timer, t0 + 20 * MINUTE);

  assert.equal(getFirstStart(timer), t0);
});

test('le chronomètre survit à un aller-retour de sérialisation', () => {
  let timer = startTimer(t0);
  timer = pauseTimer(timer, t0 + 15 * MINUTE);
  timer = resumeTimer(timer, t0 + 25 * MINUTE);

  const restored = parseTimerState(serializeTimer(timer));

  assert.notEqual(restored, null);
  assert.deepEqual(restored, timer);
  assert.equal(getElapsedSeconds(restored!, t0 + 35 * MINUTE), 25 * 60);
});

test('une sauvegarde incohérente est ignorée', () => {
  assert.equal(parseTimerState(null), null);
  assert.equal(parseTimerState('pas du json'), null);
  assert.equal(parseTimerState('{}'), null);
  assert.equal(parseTimerState('{"segments":[]}'), null);
  assert.equal(parseTimerState('{"segments":[{"start":100,"end":50}]}'), null);
  assert.equal(
    parseTimerState('{"segments":[{"start":100,"end":null},{"start":200,"end":300}]}'),
    null
  );
  assert.equal(
    parseTimerState(`{"segments":[{"start":${Date.now() + 60000},"end":null}]}`),
    null
  );
});
