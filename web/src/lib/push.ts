import { api } from './api';
import { firebaseApp } from './firebase';

export const pushKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
const localKey = 'kujuk.push.token';
export const isPushEnabled = () => Boolean(localStorage.getItem(localKey));
export async function enablePush(lang: 'en' | 'ar') {
  const { getMessaging, getToken, isSupported } = await import('@firebase/messaging');
  if (!pushKey || !(await isSupported())) throw new Error('Push is not supported in this browser');
  const registration = await navigator.serviceWorker.register('/kujuk-push-sw.js', { scope: '/kujuk-push/' });
  const activeRegistration = registration.active ? registration : await new Promise<ServiceWorkerRegistration>((resolve, reject) => {
    const worker = registration.installing || registration.waiting;
    if (!worker) { reject(new Error('Service worker is not ready')); return; }
    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') resolve(registration);
      if (worker.state === 'redundant') reject(new Error('Service worker did not start'));
    });
  });
  const token = await getToken(getMessaging(firebaseApp()), { vapidKey: pushKey, serviceWorkerRegistration: activeRegistration });
  await api('/notifications/device', { method: 'PUT', body: { token, lang } });
  localStorage.setItem(localKey, token);
}
export async function disablePush() {
  const token = localStorage.getItem(localKey);
  if (!token) return;
  await api('/notifications/device', { method: 'DELETE', body: { token } });
  localStorage.removeItem(localKey);
}
