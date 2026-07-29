import type { Activity } from '../types';

/**
  PWA Notification Manager for Step Reminders
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

export function sendActivityReminderNotification(activity: Activity) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const title = `⏰ Prochaine étape : ${activity.title}`;
  const options: NotificationOptions = {
    body: `À ${activity.time} — 📍 ${activity.locationName}. Préparez-vous !`,
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: `activity-${activity.id}`
  };

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification(title, options);
    });
  } else {
    new Notification(title, options);
  }
}

/**
  Check today's activities and schedule reminders 15 min before activity time
 */
export function checkAndScheduleTodayReminders(activities: Activity[]) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const nowTotalMinutes = currentHours * 60 + currentMinutes;

  activities.forEach(act => {
    if (act.completed) return;
    const parts = act.time.split(':');
    if (parts.length !== 2) return;
    
    const actHours = parseInt(parts[0]);
    const actMinutes = parseInt(parts[1]);
    const actTotalMinutes = actHours * 60 + actMinutes;

    // Check if activity is in 15 minutes
    const diff = actTotalMinutes - nowTotalMinutes;
    if (diff > 0 && diff <= 15) {
      sendActivityReminderNotification(act);
    }
  });
}
