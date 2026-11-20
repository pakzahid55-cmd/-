import { test } from 'node:test';
import assert from 'node:assert/strict';

// Tests the environment gate without reaching a live project.
test('KUJUK does not fall back to a hardcoded Firebase project', async () => {
  for (const key of Object.keys(process.env)) if (key.startsWith('NEXT_PUBLIC_FIREBASE_')) delete process.env[key];
  const firebase = await import('./firebase');
  assert.equal(firebase.firebaseEnabled, false);
  assert.throws(firebase.firebaseApp, /not been configured/);
});
