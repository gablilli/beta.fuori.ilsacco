
import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, TestTube } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

export const NotificationSettings = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [reminderTime, setReminderTime] = useState(19);
  const [customHour, setCustomHour] = useState('');
  const { 
    requestPermission, 
    hasPermission: checkPermission, 
    getSavedReminderTime, 
    saveReminderTime,
    testNotification,
    clearExistingSchedule
  } = useNotifications();
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
    clearExistingSchedule(); // Cancella il programma precedente
    saveReminderTime(hour);
    toast({
      title: "Orario aggiornato! ⏰",
      description: `Promemoria riprogrammati per le ${hour}:00.`,
    });
  };

  const handleCustomTimeSet = () => {
    const hour = parseInt(customHour);
    if (hour >= 0 && hour <= 23) {
      setReminderTime(hour);
      clearExistingSchedule();
      saveReminderTime(hour);
      setCustomHour('');
      toast({
        title: "Orario personalizzato impostato! ⏰",
        description: `Promemoria riprogrammati per le ${hour}:00.`,
      });
    } else {
      toast({
        title: "Orario non valido",
        description: "Inserisci un'ora tra 0 e 23.",
        variant: "destructive"
      });
    }
  };

  const handleTestNotification = () => {
    if (hasPermission) {
      testNotification();
      toast({
        title: "Test inviato! 🧪",
        description: "Controlla se hai ricevuto la notifica di test.",
      });
    } else {
      toast({
        title: "Permessi mancanti",
        description: "Attiva prima le notifiche per testare.",
        variant: "destructive"
      });
    }
  };

  const timeOptions = [
    { value: "6", label: "6:00 (Mattina presto)" },
    { value: "7", label: "7:00 (Mattina)" },
    { value: "8", label: "8:00 (Mattina)" },
    { value: "18", label: "18:00 (Sera)" },
    { value: "19", label: "19:00 (Sera)" },
    { value: "20", label: "20:00 (Sera)" },
    { value: "21", label: "21:00 (Sera tardi)" },
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
              
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Orario promemoria predefiniti
                </Label>
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

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Orario personalizzato (0-23)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={customHour}
                    onChange={(e) => setCustomHour(e.target.value)}
                    placeholder="es. 15"
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleCustomTimeSet}
                    disabled={!customHour}
                    variant="outline"
                  >
                    Imposta
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleTestNotification}
                variant="outline"
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Testa Notifica
              </Button>
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
