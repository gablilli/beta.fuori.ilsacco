
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Share2, QrCode, Download, Upload, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { WasteSchedule } from '@/pages/Index';

interface FamilySharingProps {
  schedules: WasteSchedule[];
  onImportSchedules: (schedules: WasteSchedule[]) => void;
}

export const FamilySharing = ({ schedules, onImportSchedules }: FamilySharingProps) => {
  const [shareCode, setShareCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const { toast } = useToast();

  const generateShareCode = () => {
    const data = {
      schedules: schedules.map(s => ({
        type: s.type,
        name: s.name,
        days: s.days,
        color: s.color,
        icon: s.icon
      })),
      timestamp: Date.now()
    };
    
    const encoded = btoa(JSON.stringify(data));
    setShareCode(encoded);
    
    // Salva anche in localStorage per un eventuale QR code
    localStorage.setItem('share-code', encoded);
    
    toast({
      title: "📤 Codice di Condivisione Generato",
      description: "Condividi questo codice con la tua famiglia!"
    });
  };

  const copyShareCode = async () => {
    try {
      await navigator.clipboard.writeText(shareCode);
      toast({
        title: "📋 Copiato!",
        description: "Codice copiato negli appunti"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile copiare il codice",
        variant: "destructive"
      });
    }
  };

  const importSchedules = () => {
    if (!importCode.trim()) {
      toast({
        title: "Codice mancante",
        description: "Inserisci un codice di condivisione valido",
        variant: "destructive"
      });
      return;
    }

    try {
      const decoded = JSON.parse(atob(importCode.trim()));
      
      if (!decoded.schedules || !Array.isArray(decoded.schedules)) {
        throw new Error('Formato non valido');
      }

      const importedSchedules: WasteSchedule[] = decoded.schedules.map((s: any, index: number) => ({
        id: Date.now().toString() + index,
        type: s.type,
        name: s.name,
        days: s.days,
        color: s.color,
        icon: s.icon
      }));

      onImportSchedules(importedSchedules);
      setImportCode('');
      
      toast({
        title: "📥 Calendari Importati!",
        description: `${importedSchedules.length} calendari aggiunti con successo`
      });
    } catch (error) {
      toast({
        title: "Errore di Importazione",
        description: "Codice non valido o corrotto",
        variant: "destructive"
      });
    }
  };

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
    
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            👨‍👩‍👧‍👦 Condivisione Famiglia
          </CardTitle>
          <CardDescription>
            Condividi i tuoi calendari con la famiglia tramite codice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button 
                onClick={generateShareCode}
                className="flex-1"
                disabled={schedules.length === 0}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Genera Codice
              </Button>
              {shareCode && (
                <Button onClick={copyShareCode} variant="outline">
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {shareCode && (
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <Label className="text-sm font-medium">Codice di Condivisione:</Label>
                <p className="text-xs font-mono bg-white p-2 rounded mt-1 break-all">
                  {shareCode}
                </p>
              </div>
            )}
          </div>
          
          <div className="border-t pt-4">
            <Label htmlFor="import-code">Importa da Codice Famiglia</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="import-code"
                placeholder="Incolla qui il codice ricevuto..."
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
              />
              <Button onClick={importSchedules}>
                <Upload className="h-4 w-4 mr-2" />
                Importa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            ☁️ Backup & Ripristino
          </CardTitle>
          <CardDescription>
            Esporta e importa i tuoi calendari via file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={exportToFile}
              variant="outline"
              disabled={schedules.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Esporta Backup
            </Button>
            
            <div>
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
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Importa Backup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
