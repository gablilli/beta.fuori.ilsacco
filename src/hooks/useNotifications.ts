
import { useEffect } from 'react';

let notificationScheduled = false; // Flag per evitare duplicati

export const useNotifications = () => {
  const requestPermission = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return Notification.permission === 'granted';
    }
    return false;
  };

  const scheduleNotification = (title: string, body: string, when: Date) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const now = new Date();
      const delay = when.getTime() - now.getTime();

      if (delay > 0) {
        setTimeout(() => {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'waste-reminder' // Usato per evitare notifiche visive duplicate
          });
        }, delay);
      }
    }
  };

  const scheduleTomorrowReminders = (schedules: any[]) => {
    if (notificationScheduled) return; // Evita pianificazioni multiple
    notificationScheduled = true;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDay();

    const tomorrowSchedules = schedules.filter(schedule =>
      schedule.days.includes(tomorrowDay)
    );

    if (tomorrowSchedules.length > 0) {
      const reminderTime = new Date();
      reminderTime.setHours(19, 0, 0, 0);

      if (reminderTime.getTime() < Date.now()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
        reminderTime.setHours(8, 0, 0, 0);
      }

      const wasteTypes = tomorrowSchedules.map(s => s.name).join(', ');
      scheduleNotification(
        '♻️ Promemoria Raccolta Differenziata',
        `Ricordati di portare fuori: ${wasteTypes}`,
        reminderTime
      );
    }
  };

  return {
    requestPermission,
    scheduleNotification,
    scheduleTomorrowReminders,
    hasPermission: () =>
      'Notification' in window && Notification.permission === 'granted'
  };
};