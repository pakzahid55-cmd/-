// FCM sends webpush.notification. Only show generic lock-screen information.
self.addEventListener('push', event => {
  let payload;
  try { payload = event.data?.json(); } catch { return; }
  const message = payload?.notification;
  if (!message) return;
  event.waitUntil(self.registration.showNotification('KUJUK – كجوك', {
    body: message.body, icon: '/kujuk-emblem.png', tag: message.tag || 'kujuk-notification',
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    const existing = clients.find(client => new URL(client.url).pathname === '/notifications');
    return existing ? existing.focus() : self.clients.openWindow('/notifications');
  }));
});
