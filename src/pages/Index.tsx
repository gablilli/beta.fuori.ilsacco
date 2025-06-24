
import { useState, useEffect } from 'react';
import { Calendar, Trash, Plus, Settings, Bell } from 'lucide-react';
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
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

export interface WasteSchedule {
  id: string;
  type: 'organic' | 'plastic' | 'paper' | 'glass' | 'mixed';
  name: string;
  days: number[]; // 0 = Sunday, 1 = Monday, etc.
  color: string;
  icon: string;
  nextCollection?: Date;
}

const Index = () => {
  const [schedules, setSchedules] = useState<WasteSchedule[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { scheduleTomorrowReminders } = useNotifications();

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
      let daysUntilNext = 7; // Default to a week from now
      
      for (const day of schedule.days) {
        let daysUntil = day - currentDay;
        if (daysUntil <= 0) {
          daysUntil += 7; // Next week
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

  // Programma reminder quando cambiano gli schedule
  useEffect(() => {
    if (schedules.length > 0) {
      scheduleTomorrowReminders(schedules);
    }
  }, [schedules, scheduleTomorrowReminders]);

  const handleOnboardingComplete = (newSchedules: Omit<WasteSchedule, 'id'>[]) => {
    console.log('Onboarding completed with schedules:', newSchedules);
    const schedulesWithIds = newSchedules.map(schedule => ({
      ...schedule,
      id: Date.now().toString() + Math.random().toString()
    }));
    setSchedules(schedulesWithIds);
    setShowOnboarding(false);
    toast({
      title: "Configurazione completata! ♻️",
      description: "Le tue raccolte sono state configurate con successo.",
    });
  };

  const addSchedule = (newSchedule: Omit<WasteSchedule, 'id'>) => {
    const schedule: WasteSchedule = {
      ...newSchedule,
      id: Date.now().toString()
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

  // Show loading state
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

  // Show onboarding if no schedules or explicitly requested
  if (showOnboarding || schedules.length === 0) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Trash className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Fuori il sacco
                </h1>
                <p className="text-sm text-gray-600">Ricordati di portare fuori la spazzatura!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-200 hover:bg-green-50"
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Impostazioni Notifiche</DialogTitle>
                    <DialogDescription>
                      Configura i promemoria per la raccolta differenziata
                    </DialogDescription>
                  </DialogHeader>
                  <NotificationSettings />
                </DialogContent>
              </Dialog>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Today's Overview */}
        <TodayOverview schedules={schedules} />

        {/* Waste Types Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">I tuoi calendari di raccolta</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedules.map((schedule) => (
              <WasteTypeCard
                key={schedule.id}
                schedule={schedule}
                onRemove={() => removeSchedule(schedule.id)}
              />
            ))}
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
