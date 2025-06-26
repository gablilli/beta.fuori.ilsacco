
import { useEffect } from 'react';

let notificationScheduled = false; // Flag per evitare duplicati
let currentTimeoutId: NodeJS.Timeout | null = null; // Per cancellare timeout precedenti

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
            tag: 'waste-reminder', // Previene notifiche duplicate
            requireInteraction: false, // Non richiede interazione per chiudersi
            silent: false
          });
        }, delay);
      }
    }
  };

  const scheduleTomorrowReminders = (schedules: any[], reminderHour: number = 19) => {
    // Cancella timeout precedente se esiste
    if (currentTimeoutId) {
      clearTimeout(currentTimeoutId);
      currentTimeoutId = null;
    }

    // Reset del flag ogni 24 ore
    const resetScheduleFlag = () => {
      notificationScheduled = false;
    };

    if (notificationScheduled) return; // Evita pianificazioni multiple
    notificationScheduled = true;

    // Reset del flag dopo 24 ore
    setTimeout(resetScheduleFlag, 24 * 60 * 60 * 1000);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDay();

    const tomorrowSchedules = schedules.filter(schedule =>
      schedule.days.includes(tomorrowDay)
    );

    if (tomorrowSchedules.length > 0) {
      const reminderTime = new Date();
      reminderTime.setHours(reminderHour, 0, 0, 0);

      // Se l'orario è già passato oggi, programma per domani mattina
      if (reminderTime.getTime() < Date.now()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
        reminderTime.setHours(8, 0, 0, 0);
      }

      const wasteTypes = tomorrowSchedules.map(s => s.name).join(', ');
      
      currentTimeoutId = setTimeout(() => {
        scheduleNotification(
          '♻️ Promemoria Raccolta Differenziata',
          `Ricordati di portare fuori: ${wasteTypes}`,
          reminderTime
        );
      }, 1000) as NodeJS.Timeout; // Piccolo delay per evitare spam
    }
  };

  // Funzione per ottenere l'orario salvato
  const getSavedReminderTime = (): number => {
    const saved = localStorage.getItem('reminder-time');
    return saved ? parseInt(saved) : 19;
  };

  // Funzione per salvare l'orario
  const saveReminderTime = (hour: number) => {
    localStorage.setItem('reminder-time', hour.toString());
    // Reset del flag per permettere riprogrammazione
    notificationScheduled = false;
  };

  return {
    requestPermission,
    scheduleNotification,
    scheduleTomorrowReminders,
    getSavedReminderTime,
    saveReminderTime,
    hasPermission: () =>
      'Notification' in window && Notification.permission === 'granted'
  };
};
