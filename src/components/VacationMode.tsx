
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plane, Play, Pause } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const VacationMode = () => {
  const [isVacationMode, setIsVacationMode] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vacationPeriod, setVacationPeriod] = useState<{start: string, end: string} | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('vacation-mode');
    if (saved) {
      const data = JSON.parse(saved);
      const now = new Date();
      const end = new Date(data.end);
      
      if (now <= end) {
        setIsVacationMode(true);
        setVacationPeriod(data);
      } else {
        localStorage.removeItem('vacation-mode');
      }
    }
  }, []);

  const activateVacationMode = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Date mancanti",
        description: "Seleziona le date di inizio e fine vacanza",
        variant: "destructive"
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      toast({
        title: "Date non valide",
        description: "La data di fine deve essere successiva a quella di inizio",
        variant: "destructive"
      });
      return;
    }

    const vacationData = { start: startDate, end: endDate };
    localStorage.setItem('vacation-mode', JSON.stringify(vacationData));
    
    setIsVacationMode(true);
    setVacationPeriod(vacationData);
    
    toast({
      title: "🏖️ Modalità Vacanza Attivata",
      description: `Le notifiche sono sospese fino al ${new Date(endDate).toLocaleDateString('it-IT')}`
    });
  };

  const deactivateVacationMode = () => {
    localStorage.removeItem('vacation-mode');
    setIsVacationMode(false);
    setVacationPeriod(null);
    setStartDate('');
    setEndDate('');
    
    toast({
      title: "🏠 Modalità Vacanza Disattivata",
      description: "Le notifiche sono state riattivate"
    });
  };

  const isVacationActive = () => {
    if (!vacationPeriod) return false;
    const now = new Date();
    const start = new Date(vacationPeriod.start);
    const end = new Date(vacationPeriod.end);
    return now >= start && now <= end;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          🏖️ Modalità Vacanza
        </CardTitle>
        <CardDescription>
          Sospendi temporaneamente le notifiche durante le vacanze
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isVacationMode && vacationPeriod ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge 
                variant={isVacationActive() ? "default" : "secondary"}
                className={isVacationActive() ? "bg-orange-500" : "bg-blue-500"}
              >
                <Pause className="h-3 w-3 mr-1" />
                {isVacationActive() ? "Vacanza in corso" : "Vacanza programmata"}
              </Badge>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-orange-800">
                <strong>Periodo:</strong> {new Date(vacationPeriod.start).toLocaleDateString('it-IT')} - {new Date(vacationPeriod.end).toLocaleDateString('it-IT')}
              </p>
              <p className="text-sm text-orange-700 mt-1">
                Le notifiche sono sospese durante questo periodo
              </p>
            </div>
            
            <Button 
              onClick={deactivateVacationMode}
              variant="outline"
              className="w-full"
            >
              <Play className="h-4 w-4 mr-2" />
              Disattiva Modalità Vacanza
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Data Inizio</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="end-date">Data Fine</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            
            <Button 
              onClick={activateVacationMode}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              <Plane className="h-4 w-4 mr-2" />
              Attiva Modalità Vacanza
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Hook per verificare se siamo in modalità vacanza
export const useVacationMode = () => {
  const [isInVacation, setIsInVacation] = useState(false);

  useEffect(() => {
    const checkVacationMode = () => {
      const saved = localStorage.getItem('vacation-mode');
      if (saved) {
        const data = JSON.parse(saved);
        const now = new Date();
        const start = new Date(data.start);
        const end = new Date(data.end);
        
        setIsInVacation(now >= start && now <= end);
      } else {
        setIsInVacation(false);
      }
    };

    checkVacationMode();
    const interval = setInterval(checkVacationMode, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  return isInVacation;
};
