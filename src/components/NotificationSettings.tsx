
import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

export const NotificationSettings = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const { requestPermission, hasPermission: checkPermission } = useNotifications();
  const { toast } = useToast();

  useEffect(() => {
    setHasPermission(checkPermission());
  }, [checkPermission]);

  const handleRequestPermission = async () => {
    try {
      const granted = await requestPermission();
      setHasPermission(granted);
      
      if (granted) {
        toast({
          title: "Notifiche attivate! 🔔",
          description: "Riceverai promemoria serali per la raccolta di domani.",
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

  return (
    <Card className="border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {hasPermission ? <Bell className="h-5 w-5 text-green-600" /> : <BellOff className="h-5 w-5 text-gray-400" />}
          Notifiche Promemoria
        </CardTitle>
        <CardDescription>
          Ricevi promemoria serali per non dimenticare la raccolta di domani
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasPermission ? (
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">
              Notifiche attive • Promemoria alle 19:00
            </span>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Attiva le notifiche per ricevere promemoria automatici alle 19:00 quando domani c'è una raccolta.
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
  );
};
