const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();

// The durable in-app inbox is authoritative. Push is best effort and contains
// no delivery address, customer's name, amount or order ID on the lock screen.
exports.kujukNotifyDevice = onDocumentCreated({ document: 'kujuk_notifications/{notificationId}', region: 'europe-west1' }, async event => {
  const row = event.data?.data();
  if (!row || !Number.isSafeInteger(row.userId) || row.userId < 1) return;
  const devices = await getFirestore().collection('kujuk_devices').where('userId', '==', row.userId).limit(50).get();
  if (devices.empty) return;
  const result = await getMessaging().sendEach(devices.docs.map(doc => {
    const { token, lang } = doc.data();
    return {
      token,
      webpush: { notification: { title: 'KUJUK – كجوك', body: lang === 'ar' ? 'لديك تحديث جديد. افتح كجوك للاطّلاع عليه.' : 'You have an update. Open KUJUK to view it.', tag: event.params.notificationId, icon: '/kujuk-emblem.png' } },
    };
  }));
  await Promise.all(result.responses.map((reply, i) => {
    if (['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(reply.error?.code)) return devices.docs[i].ref.delete({ lastUpdateTime: devices.docs[i].updateTime }).catch(() => undefined);
    return undefined;
  }));
});
