
import { useState, useEffect } from 'react';
import { Calendar, Trash, Plus, Settings, Bell, Home, Users, BarChart3, Save, Info, Flame } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WasteTypeCard } from '@/components/WasteTypeCard';
import { AddScheduleDialog } from '@/components/AddScheduleDialog';
import { TodayOverview } from '@/components/TodayOverview';
import { OnboardingWizard } from '@/components/OnboardingWizard';
import { NotificationSettings } from '@/components/NotificationSettings';
import { EmojiCustomizer } from '@/components/EmojiCustomizer';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { CalendarView } from '@/components/CalendarView';
import { VacationMode } from '@/components/VacationMode';
import { ImprovedFamilySharing } from '@/components/ImprovedFamilySharing';
import { Gamification } from '@/components/Gamification';
import { BackupManager } from '@/components/BackupManager';
import { AuthWrapper } from '@/components/AuthWrapper';
import { ImprovedWeatherWidget } from '@/components/ImprovedWeatherWidget';
import { AppInfo } from '@/components/AppInfo';
import { StreakPage } from '@/components/StreakPage';
import { User, Session } from '@supabase/supabase-js';

export interface WasteSchedule {
  id: string;
  type: 'organic' | 'plastic' | 'paper' | 'glass' | 'mixed';
  name: string;
  days: number[]; // 0 = Sunday, 1 = Monday, etc.
  color: string;
  icon: string;
  nextCollection?: Date;
}

interface UserStats {
  totalCollections: number;
  streak: number;
  lastCollection: string;
  achievements: string[];
  level: number;
  points: number;
}

interface IndexProps {
  user?: User | null;
  session?: Session | null;
  onShowAuth?: () => void;
  onSignOut?: () => void;
}

const Index = ({ user, session, onShowAuth, onSignOut }: IndexProps = {}) => {
  const [schedules, setSchedules] = useState<WasteSchedule[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalCollections: 0,
    streak: 0,
    lastCollection: '',
    achievements: [],
    level: 1,
    points: 0
  });
  const { toast } = useToast();
  const { scheduleTomorrowReminders, getSavedReminderTime } = useNotifications();

  // Load schedules from localStorage
  useEffect(() => {
    console.log('Loading schedules from localStorage...');
    const saved = localStorage.getItem('waste-schedules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        console.log('Found schedules:', parsed);
        setSchedules(parsed.map((s: any) => ({
          ...s,
          nextCollection: s.nextCollection ? new Date(s.nextCollection) : undefined
        })));
      } catch (error) {
        console.error('Error parsing schedules:', error);
        setShowOnboarding(true);
      }
    } else {
      console.log('No schedules found, showing onboarding');
      setShowOnboarding(true);
    }
    setIsLoading(false);
  }, []);

  // Save schedules to localStorage
  useEffect(() => {
    if (schedules.length > 0 && !isLoading) {
      console.log('Saving schedules to localStorage:', schedules);
      localStorage.setItem('waste-schedules', JSON.stringify(schedules));
    }
  }, [schedules, isLoading]);

  // Calculate next collection dates
  useEffect(() => {
    const updatedSchedules = schedules.map(schedule => {
      const today = new Date();
      const currentDay = today.getDay();
      
      let nextCollection = new Date(today);
      let daysUntilNext = 7;
      
      for (const day of schedule.days) {
        let daysUntil = day - currentDay;
        if (daysUntil <= 0) {
          daysUntil += 7;
        }
        if (daysUntil < daysUntilNext) {
          daysUntilNext = daysUntil;
        }
      }
      
      nextCollection.setDate(today.getDate() + daysUntilNext);
      
      return {
        ...schedule,
        nextCollection
      };
    });
    
    if (JSON.stringify(updatedSchedules) !== JSON.stringify(schedules)) {
      setSchedules(updatedSchedules);
    }
  }, [schedules]);

  // Programma reminder quando cambiano gli schedule o l'orario
  useEffect(() => {
    if (schedules.length > 0) {
      const reminderHour = getSavedReminderTime();
      console.log('Scheduling reminders with hour:', reminderHour);
      scheduleTomorrowReminders(schedules, reminderHour);
    }
  }, [schedules, scheduleTomorrowReminders, getSavedReminderTime]);

  // Load stats
  useEffect(() => {
    const saved = localStorage.getItem('user-stats');
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('user-stats', JSON.stringify(stats));
  }, [stats]);

  const handleOnboardingComplete = (newSchedules: Omit<WasteSchedule, 'id'>[]) => {
    console.log('Onboarding completed with schedules:', newSchedules);
    const schedulesWithIds = newSchedules.map(schedule => ({
      ...schedule,
      id: Date.now().toString() + Math.random().toString()
    }));
    setSchedules(schedulesWithIds);
    setShowOnboarding(false);
    toast({
      title: "Tutto pronto! ♻️",
      description: "I tuoi promemoria spazzatura sono attivi.",
    });
  };

  const addSchedule = (newSchedule: Omit<WasteSchedule, 'id'>) => {
    const schedule: WasteSchedule = {
      ...newSchedule,
      id: Date.now().toString() + Math.random().toString()
    };
    setSchedules(prev => [...prev, schedule]);
    toast({
      title: "Raccolta aggiunta! ♻️",
      description: `${schedule.name} è stata aggiunta al calendario.`,
    });
  };

  const removeSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    toast({
      title: "Raccolta rimossa",
      description: "La raccolta è stata rimossa dal calendario.",
    });
  };

  const updateSchedule = (id: string, updates: Partial<WasteSchedule>) => {
    setSchedules(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };

  const importSchedules = (newSchedules: WasteSchedule[]) => {
    setSchedules(prev => [...prev, ...newSchedules]);
  };

  const handleMarkCollectionDone = (collectionId: string, collectionName: string) => {
    const today = new Date().toISOString().split('T')[0]; // Use ISO date format
    const todayDisplay = new Date().toDateString();
    const points = 10;
    
    if (stats.lastCollection === todayDisplay) {
      toast({
        title: "Già fatto oggi! 🎯",
        description: "Hai già segnato una raccolta per oggi"
      });
      return;
    }

    const newStats = {
      ...stats,
      totalCollections: stats.totalCollections + 1,
      streak: stats.lastCollection === new Date(Date.now() - 86400000).toDateString() 
        ? stats.streak + 1 
        : 1,
      lastCollection: todayDisplay,
      points: stats.points + points,
      level: Math.floor((stats.points + points) / 100) + 1
    };

    // Update best streak
    const currentBestStreak = localStorage.getItem('best-streak');
    const bestStreak = currentBestStreak ? parseInt(currentBestStreak, 10) : 0;
    if (newStats.streak > bestStreak) {
      localStorage.setItem('best-streak', newStats.streak.toString());
    }

    // Update collection history
    const savedHistory = localStorage.getItem('collection-history');
    const history = savedHistory ? JSON.parse(savedHistory) : [];
    const todayHistory = history.find((h: any) => h.date === today);
    
    if (todayHistory) {
      todayHistory.count += 1;
      todayHistory.types.push(collectionName);
    } else {
      history.push({
        date: today,
        count: 1,
        types: [collectionName]
      });
    }
    localStorage.setItem('collection-history', JSON.stringify(history));

    const newAchievements = [...stats.achievements];
    
    if (newStats.totalCollections === 1 && !newAchievements.includes('first-collection')) {
      newAchievements.push('first-collection');
      toast({
        title: "🏆 Primo Conferimento!",
        description: "Hai segnato la tua prima raccolta!"
      });
    }
    
    if (newStats.streak === 7 && !newAchievements.includes('week-streak')) {
      newAchievements.push('week-streak');
      toast({
        title: "🔥 Una Settimana di Fila!",
        description: "7 giorni consecutivi di raccolta differenziata!"
      });
    }
    
    if (newStats.totalCollections === 50 && !newAchievements.includes('eco-warrior')) {
      newAchievements.push('eco-warrior');
      toast({
        title: "🌱 Guerriero dell'Ambiente!",
        description: "50 raccolte completate!"
      });
    }

    setStats({
      ...newStats,
      achievements: newAchievements
    });

    toast({
      title: `✅ ${collectionName} Conferito!`,
      description: `+${points} punti! Streak: ${newStats.streak} giorni`
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding || schedules.length === 0) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'calendar':
        return <CalendarView schedules={schedules} />;
      case 'settings':
        return (
          <div className="space-y-6">
            <NotificationSettings />
            <VacationMode />
            <EmojiCustomizer 
              schedules={schedules} 
              onUpdateSchedule={updateSchedule}
            />
            <AppInfo />
          </div>
        );
      case 'sharing':
        return <ImprovedFamilySharing schedules={schedules} onImportSchedules={importSchedules} user={user} />;
      case 'stats':
        return <Gamification schedules={schedules} />;
      case 'streak':
        return <StreakPage />;
      case 'backup':
        return <BackupManager schedules={schedules} onImportSchedules={importSchedules} />;
      default:
        return (
          <div className="space-y-6">
            <TodayOverview 
              schedules={schedules} 
              onMarkCollectionDone={handleMarkCollectionDone}
            />
            <ImprovedWeatherWidget />
          </div>
        );
    }
  };

  const tabs = [
    { key: 'overview', label: 'Home', icon: Home, emoji: '🏠' },
    { key: 'calendar', label: 'Calendario', icon: Calendar, emoji: '📅' },
    { key: 'streak', label: 'Streak', icon: Flame, emoji: '🔥' },
    { key: 'stats', label: 'Statistiche', icon: BarChart3, emoji: '🎮' },
    { key: 'sharing', label: 'Famiglia', icon: Users, emoji: '👨‍👩‍👧‍👦' },
    { key: 'backup', label: 'Backup', icon: Save, emoji: '💾' },
    { key: 'settings', label: 'Impostazioni', icon: Settings, emoji: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-24">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent truncate">
                  Fuori il sacco
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate hidden sm:block">Ricordati di portare fuori la spazzatura!</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Aggiungi</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {renderContent()}
      </div>

      {/* Mobile Bottom Navigation - Fluttuante */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white/95 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-2xl shadow-black/10">
          <div className="flex justify-around items-center py-3 px-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 ease-out ${
                    isActive 
                      ? 'text-green-600 bg-green-50 transform scale-110 shadow-lg shadow-green-200/50' 
                      : 'text-gray-500 hover:text-green-600 hover:bg-green-50/50 hover:scale-105'
                  }`}
                  style={{
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <div className="hidden sm:block">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="sm:hidden text-xl">
                    {tab.emoji}
                  </div>
                  <span className="text-xs font-medium mt-1 hidden sm:block">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <AddScheduleDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={addSchedule}
      />
    </div>
  );
};

export default Index;
