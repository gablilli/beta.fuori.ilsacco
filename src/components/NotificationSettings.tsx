
import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

export const NotificationSettings = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [reminderTime, setReminderTime] = useState(19);
  const { requestPermission, hasPermission: checkPermission, getSavedReminderTime, saveReminderTime } = useNotifications();
  const { toast } = useToast();

  useEffect(() => {
    setHasPermission(checkPermission());
    setReminderTime(getSavedReminderTime());
  }, [checkPermission, getSavedReminderTime]);

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPermission();
      setHasPermission(granted);
      
      if (granted) {
        toast({
          title: "Notifiche attivate! 🔔",
          description: `Riceverai promemoria alle ${reminderTime}:00 per la raccolta di domani.`,
        });
      } else {
        toast({
          title: "Permesso negato",
          description: "Non potrai ricevere notifiche per i promemoria.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile attivare le notifiche.",
        variant: "destructive"
      });
    }
  };

  const handleTimeChange = (value: string) => {
    const hour = parseInt(value);
    setReminderTime(hour);
    saveReminderTime(hour);
    toast({
      title: "Orario aggiornato! ⏰",
      description: `Promemoria programmati per le ${hour}:00.`,
    });
  };

  const timeOptions = [
    { value: "8", label: "8:00" },
    { value: "9", label: "9:00" },
    { value: "17", label: "17:00" },
    { value: "18", label: "18:00" },
    { value: "19", label: "19:00" },
    { value: "20", label: "20:00" },
    { value: "21", label: "21:00" },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            {hasPermission ? <Bell className="h-5 w-5 text-green-600" /> : <BellOff className="h-5 w-5 text-gray-400" />}
            Notifiche Promemoria
          </CardTitle>
          <CardDescription>
            Ricevi promemoria per non dimenticare la raccolta di domani
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasPermission ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-700 font-medium">
                  Notifiche attive • Promemoria alle {reminderTime}:00
                </span>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Orario promemoria
                </label>
                <Select value={reminderTime.toString()} onValueChange={handleTimeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Attiva le notifiche per ricevere promemoria automatici quando domani c'è una raccolta.
              </p>
              <Button
                onClick={handleRequestPermission}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Bell className="h-4 w-4 mr-2" />
                Attiva Notifiche
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
