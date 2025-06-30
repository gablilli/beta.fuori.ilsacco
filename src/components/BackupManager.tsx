
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Save, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { WasteSchedule } from '@/pages/Index';

interface BackupManagerProps {
  schedules: WasteSchedule[];
  onImportSchedules: (schedules: WasteSchedule[]) => void;
}

export const BackupManager = ({ schedules, onImportSchedules }: BackupManagerProps) => {
  const { toast } = useToast();

  const exportToFile = () => {
    const data = {
      schedules,
      exportDate: new Date().toISOString(),
      appVersion: "1.0"
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fuori-il-sacco-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "💾 Backup Esportato",
      description: "File scaricato con successo"
    });
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.schedules && Array.isArray(data.schedules)) {
          const importedSchedules: WasteSchedule[] = data.schedules.map((s: any, index: number) => ({
            id: Date.now().toString() + index,
            type: s.type,
            name: s.name,
            days: s.days,
            color: s.color,
            icon: s.icon
          }));

          onImportSchedules(importedSchedules);
          
          toast({
            title: "📁 Backup Importato",
            description: `${importedSchedules.length} calendari ripristinati`
          });
        }
      } catch (error) {
        toast({
          title: "Errore File",
          description: "File di backup non valido",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    event.target.value = '';
  };

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem('waste-schedules-backup', JSON.stringify({
        schedules,
        backupDate: new Date().toISOString()
      }));
      toast({
        title: "💾 Backup Locale Salvato",
        description: "Dati salvati nel browser"
      });
    } catch (error) {
      toast({
        title: "Errore Salvataggio",
        description: "Impossibile salvare nel browser",
        variant: "destructive"
      });
    }
  };

  const restoreFromLocalStorage = () => {
    try {
      const backup = localStorage.getItem('waste-schedules-backup');
      if (backup) {
        const data = JSON.parse(backup);
        if (data.schedules && Array.isArray(data.schedules)) {
          const importedSchedules: WasteSchedule[] = data.schedules.map((s: any, index: number) => ({
            id: Date.now().toString() + index,
            type: s.type,
            name: s.name,
            days: s.days,
            color: s.color,
            icon: s.icon
          }));

          onImportSchedules(importedSchedules);
          
          toast({
            title: "🔄 Backup Ripristinato",
            description: `${importedSchedules.length} calendari ripristinati`
          });
        }
      } else {
        toast({
          title: "Nessun Backup",
          description: "Non è stato trovato nessun backup locale",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Errore Ripristino",
        description: "Impossibile ripristinare il backup",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            💾 Backup & Ripristino
          </CardTitle>
          <CardDescription>
            Salva e ripristina i tuoi calendari di raccolta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={exportToFile}
              variant="outline"
              disabled={schedules.length === 0}
              className="h-16 flex flex-col gap-1"
            >
              <Download className="h-5 w-5" />
              <span className="text-sm">Esporta File</span>
            </Button>
            
            <div className="h-16">
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
                id="file-import"
              />
              <Button 
                onClick={() => document.getElementById('file-import')?.click()}
                variant="outline"
                className="w-full h-full flex flex-col gap-1"
              >
                <Upload className="h-5 w-5" />
                <span className="text-sm">Importa File</span>
              </Button>
            </div>

            <Button 
              onClick={saveToLocalStorage}
              variant="outline"
              disabled={schedules.length === 0}
              className="h-16 flex flex-col gap-1"
            >
              <Save className="h-5 w-5" />
              <span className="text-sm">Salva Locale</span>
            </Button>

            <Button 
              onClick={restoreFromLocalStorage}
              variant="outline"
              className="h-16 flex flex-col gap-1"
            >
              <RotateCcw className="h-5 w-5" />
              <span className="text-sm">Ripristina Locale</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
