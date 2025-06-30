import { useEffect } from 'react';

// Gestione globale per evitare duplicati
let globalNotificationState = {
  isScheduled: false,
  currentTimeoutId: null as NodeJS.Timeout | null,
  lastScheduleDate: null as string | null
};

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

      console.log('Scheduling notification for:', when, 'delay:', delay);

      if (delay > 0) {
        return setTimeout(() => {
          console.log('Showing notification:', title, body);
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'waste-reminder',
            requireInteraction: true,
            silent: false
          });
        }, delay);
      }
    }
    return null;
  };

  const isInVacationMode = () => {
    const vacation = localStorage.getItem('vacation-mode');
    if (!vacation) return false;
    
    const data = JSON.parse(vacation);
    const now = new Date();
    const start = new Date(data.start);
    const end = new Date(data.end);
    
    return now >= start && now <= end;
  };

  const clearExistingSchedule = () => {
    if (globalNotificationState.currentTimeoutId) {
      clearTimeout(globalNotificationState.currentTimeoutId);
      globalNotificationState.currentTimeoutId = null;
    }
    globalNotificationState.isScheduled = false;
    console.log('Cleared existing notification schedule');
  };

  const scheduleTomorrowReminders = (schedules: any[], reminderHour: number = 19) => {
    // Controlla modalità vacanza
    if (isInVacationMode()) {
      console.log('Vacation mode active, skipping notifications');
      clearExistingSchedule();
      return;
    }

    const today = new Date().toDateString();
    
    // Evita di riprogrammare se già fatto oggi
    if (globalNotificationState.isScheduled && globalNotificationState.lastScheduleDate === today) {
      console.log('Notifications already scheduled for today');
      return;
    }

    // Cancella programma precedente
    clearExistingSchedule();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDay();
    const tomorrowDateString = tomorrow.toDateString();

    console.log('Checking schedules for tomorrow:', tomorrowDateString, 'day:', tomorrowDay);

    const tomorrowSchedules = schedules.filter(schedule =>
      schedule.days.includes(tomorrowDay)
    );

    console.log('Tomorrow schedules found:', tomorrowSchedules);

    if (tomorrowSchedules.length > 0) {
      const now = new Date();
      const reminderTime = new Date();
      
      // Imposta l'orario di promemoria
      reminderTime.setHours(reminderHour, 0, 0, 0);
      
      // Se l'orario è già passato oggi, programma per domani alle 8:00
      if (reminderTime.getTime() <= now.getTime()) {
        reminderTime.setDate(reminderTime.getDate() + 1);
        reminderTime.setHours(8, 0, 0, 0);
      }

      const wasteTypes = tomorrowSchedules.map(s => `${s.icon} ${s.name}`).join(', ');
      
      console.log('Scheduling reminder for:', reminderTime);
      
      globalNotificationState.currentTimeoutId = scheduleNotification(
        '♻️ Promemoria Raccolta Differenziata',
        `Domani ${tomorrowDateString.split(' ')[0]} porta fuori: ${wasteTypes}`,
        reminderTime
      );

      if (globalNotificationState.currentTimeoutId) {
        globalNotificationState.isScheduled = true;
        globalNotificationState.lastScheduleDate = today;
        console.log('Notification scheduled successfully');
      }
    } else {
      console.log('No waste collection tomorrow');
    }
  };

  const getSavedReminderTime = (): number => {
    const saved = localStorage.getItem('reminder-time');
    return saved ? parseInt(saved) : 19;
  };

  const saveReminderTime = (hour: number) => {
    localStorage.setItem('reminder-time', hour.toString());
    // Reset per permettere riprogrammazione con nuovo orario
    globalNotificationState.isScheduled = false;
    globalNotificationState.lastScheduleDate = null;
    console.log('Reminder time saved:', hour);
  };

  // Test notifica immediata
  const testNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('🧪 Test Notifica', {
        body: 'Le notifiche funzionano correttamente!',
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
    }
  };

  return {
    requestPermission,
    scheduleNotification,
    scheduleTomorrowReminders,
    getSavedReminderTime,
    saveReminderTime,
    clearExistingSchedule,
    testNotification,
    hasPermission: () =>
      'Notification' in window && Notification.permission === 'granted'
  };
};
