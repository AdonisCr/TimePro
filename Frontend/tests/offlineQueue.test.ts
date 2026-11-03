import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cacheKeyPrefix,
  cacheStorageKey,
  failuresStorageKey,
  idMapStorageKey,
  isDefinitiveFailure,
  isLocalId,
  isRetryableStatus,
  nextLocalId,
  pendingLocalIds,
  queueStorageKey,
  registerMapping,
  resolveLocalId,
  resolveLocalReferences,
  scopeSuffix,
  userDataStorageKey,
  type OfflineActionLike,
} from '../src/lib/offlineQueue.ts';

const NOW = new Date(2026, 10, 3, 10, 0, 0).getTime();

// ─── Identifiants locaux ────────────────────────────────────────
test('un identifiant local est négatif et détectable', () => {
  const id = nextLocalId(NOW);

  assert.ok(id < 0);
  assert.equal(isLocalId(id), true);
  assert.equal(isLocalId(-1), true);
  assert.equal(isLocalId(0), false);
  assert.equal(isLocalId(42), false);
  assert.equal(isLocalId(null), false);
  assert.equal(isLocalId(undefined), false);
  assert.equal(isLocalId(1.5), false);
});

test('deux identifiants locaux créés au même instant restent différents', () => {
  const ids = new Set<number>();

  for (let index = 0; index < 200; index += 1) {
    ids.add(nextLocalId(NOW));
  }

  assert.equal(ids.size, 200);
});

// ─── Séparation par utilisateur ─────────────────────────────────
test('chaque utilisateur possède ses propres clés de stockage', () => {
  assert.equal(scopeSuffix(7), '7');
  assert.equal(scopeSuffix(null), 'anonymous');

  assert.equal(cacheStorageKey(7, 'tasks'), 'timepro_u7_cache_tasks');
  assert.equal(cacheStorageKey(8, 'tasks'), 'timepro_u8_cache_tasks');
  assert.notEqual(cacheStorageKey(7, 'tasks'), cacheStorageKey(8, 'tasks'));

  assert.equal(cacheKeyPrefix(7), 'timepro_u7_cache_');
  assert.equal(queueStorageKey(7), 'timepro_u7_pending');
  assert.equal(failuresStorageKey(7), 'timepro_u7_failures');
  assert.equal(idMapStorageKey(7), 'timepro_u7_idmap');
  assert.equal(userDataStorageKey(7, 'draft'), 'timepro_u7_user_draft');
});

// ─── Correspondance local → serveur ────────────────────────────
test('un identifiant serveur reste inchangé', () => {
  assert.equal(resolveLocalId(42, {}), 42);
});

test('un identifiant local non encore synchronisé ne se résout pas', () => {
  const localId = nextLocalId(NOW);
  assert.equal(resolveLocalId(localId, {}), null);
});

test('après enregistrement, un identifiant local pointe vers le serveur', () => {
  const localId = nextLocalId(NOW);
  const mapping = registerMapping({}, localId, 512);

  assert.deepEqual(mapping, { [String(localId)]: 512 });
  assert.equal(resolveLocalId(localId, mapping), 512);
});

test('une correspondance invalide est ignorée', () => {
  const localId = nextLocalId(NOW);

  assert.deepEqual(registerMapping({}, localId, 0), {});
  assert.deepEqual(registerMapping({}, 12, 34), {});
});

test('les créations en attente sont listées pour bloquer leurs dépendances', () => {
  const localTask = nextLocalId(NOW);
  const localProject = nextLocalId(NOW);
  const actions: OfflineActionLike[] = [
    { id: 'a', type: 'create', endpoint: '/tasks', localId: localTask },
    { id: 'b', type: 'create', endpoint: '/projects', localId: localProject },
    { id: 'c', type: 'update', endpoint: '/tasks', resourceId: localTask },
    { id: 'd', type: 'create', endpoint: '/labels' },
  ];

  const pending = pendingLocalIds(actions);

  assert.equal(pending.size, 2);
  assert.equal(pending.has(localTask), true);
  assert.equal(pending.has(localProject), true);
});

// ─── Références entre éléments ─────────────────────────────────
test('une référence déjà synchronisée est remplacée par l’identifiant serveur', () => {
  const localProject = nextLocalId(NOW);
  const mapping = registerMapping({}, localProject, 33);

  const result = resolveLocalReferences(
    { title: 'Écrire', project_id: localProject },
    mapping,
    new Set()
  );

  assert.equal(result.blocked, false);
  assert.deepEqual(result.data, { title: 'Écrire', project_id: 33 });
});

test('une référence pas encore créée bloque l’action', () => {
  const localProject = nextLocalId(NOW);

  const result = resolveLocalReferences(
    { title: 'Écrire', project_id: localProject },
    {},
    new Set([localProject])
  );

  assert.equal(result.blocked, true);
  assert.equal(result.data?.project_id, localProject);
});

test('une référence abandonnée est détachée proprement', () => {
  const localProject = nextLocalId(NOW);

  const result = resolveLocalReferences(
    { title: 'Écrire', project_id: localProject },
    {},
    new Set()
  );

  assert.equal(result.blocked, false);
  assert.equal(result.data?.project_id, null);
});

test('les champs qui ne sont pas des références sont conservés', () => {
  const result = resolveLocalReferences(
    { title: 'Titre', notes: 'Texte', duration: 1200, id: 5 },
    {},
    new Set()
  );

  assert.equal(result.blocked, false);
  assert.deepEqual(result.data, {
    title: 'Titre',
    notes: 'Texte',
    duration: 1200,
    id: 5,
  });
});

test('les dépendances multiples (depends_on) sont traitées comme des références', () => {
  const first = nextLocalId(NOW);
  const second = nextLocalId(NOW);
  const mapping = { [String(first)]: 101, [String(second)]: 102 };

  const result = resolveLocalReferences(
    { depends_on: first, parent_id: second },
    mapping,
    new Set()
  );

  assert.equal(result.blocked, false);
  assert.deepEqual(result.data, { depends_on: 101, parent_id: 102 });
});

test('sans données, rien n’est bloqué', () => {
  const result = resolveLocalReferences(undefined, {}, new Set());
  assert.equal(result.blocked, false);
  assert.equal(result.data, undefined);
});

// ─── Politique de nouvelle tentative ───────────────────────────
test('une coupure réseau ou une erreur serveur est réessayée', () => {
  assert.equal(isRetryableStatus(undefined), true);
  assert.equal(isRetryableStatus(401), true);
  assert.equal(isRetryableStatus(408), true);
  assert.equal(isRetryableStatus(409), true);
  assert.equal(isRetryableStatus(425), true);
  assert.equal(isRetryableStatus(429), true);
  assert.equal(isRetryableStatus(500), true);
  assert.equal(isRetryableStatus(503), true);
});

test('une erreur de validation ou de droits est définitive', () => {
  assert.equal(isRetryableStatus(400), false);
  assert.equal(isRetryableStatus(403), false);
  assert.equal(isRetryableStatus(404), false);
  assert.equal(isRetryableStatus(422), false);

  assert.equal(isDefinitiveFailure(422), true);
  assert.equal(isDefinitiveFailure(503), false);
});
