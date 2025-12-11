import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Share2, QrCode, Upload, Copy, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { WasteSchedule } from '@/pages/Index';
import { User } from '@supabase/supabase-js';

interface ImprovedFamilySharingProps {
  schedules: WasteSchedule[];
  onImportSchedules: (schedules: WasteSchedule[]) => void;
  user?: User | null;
}

export const ImprovedFamilySharing = ({ schedules, onImportSchedules, user }: ImprovedFamilySharingProps) => {
  const [shareCode, setShareCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateShareCode = async () => {
    if (schedules.length === 0) {
      toast({
        title: "Nessun calendario",
        description: "Aggiungi prima qualche promemoria spazzatura",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Genera un codice univoco di 6 caratteri alfanumerici
      const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };
      const code = generateCode();
      
      // Salva nel database se l'utente è loggato
      if (user) {
        const { error: calendarError } = await supabase
          .from('shared_calendars')
          .insert({
            name: 'I miei promemoria spazzatura',
            description: 'Calendario condiviso con la famiglia',
            owner_id: user.id,
            share_code: code
          })
          .select()
          .single();

        if (calendarError) {
          console.error('Errore creazione calendario:', calendarError);
          // Fallback locale se il database non funziona
          return generateLocalShareCode(code);
        }

        // Salva gli schedule
        const schedulesToShare = schedules.map(s => ({
          calendar_id: null, // Verrà aggiornato dopo
          type: s.type,
          name: s.name,
          days: s.days,
          color: s.color,
          icon: s.icon
        }));

        // Prima ottieni l'ID del calendario appena creato
        const { data: calendar } = await supabase
          .from('shared_calendars')
          .select('id')
          .eq('share_code', code)
          .single();

        if (calendar) {
          const { error: schedulesError } = await supabase
            .from('shared_schedules')
            .insert(
              schedulesToShare.map(s => ({ ...s, calendar_id: calendar.id }))
            );

          if (schedulesError) {
            console.error('Errore salvataggio schedule:', schedulesError);
          }
        }
      } else {
        // Se non è loggato, usa il sistema locale
        return generateLocalShareCode(code);
      }

      setShareCode(code);
      setIsDialogOpen(true);
      
      toast({
        title: "📤 Codice Creato!",
        description: "Condividi questo codice con la famiglia!"
      });

    } catch (error) {
      console.error('Errore:', error);
      toast({
        title: "Errore",
        description: "Impossibile creare il codice. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateLocalShareCode = (code: string) => {
    const data = {
      schedules: schedules.map(s => ({
        type: s.type,
        name: s.name,
        days: s.days,
        color: s.color,
        icon: s.icon
      })),
      timestamp: Date.now(),
      code: code
    };
    
    const encoded = btoa(JSON.stringify(data));
    localStorage.setItem(`share-code-${code}`, encoded);
    setShareCode(code);
    setIsDialogOpen(true);
  };

  const importSchedules = async () => {
    if (!importCode.trim()) {
      toast({
        title: "Codice mancante",
        description: "Inserisci un codice di condivisione",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Prima prova a cercare nel database
      const { data: calendar } = await supabase
        .from('shared_calendars')
        .select(`
          *,
          shared_schedules (*)
        `)
        .eq('share_code', importCode.trim().toUpperCase())
        .single();

      if (calendar && calendar.shared_schedules) {
        const importedSchedules: WasteSchedule[] = calendar.shared_schedules.map((s: any, index: number) => ({
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
          title: "📥 Importazione Riuscita!",
          description: `${importedSchedules.length} promemoria aggiunti`
        });
        
        setLoading(false);
        return;
      }
    } catch (error) {
      console.log('Codice non trovato nel database, provo in locale');
    }

    // Fallback: prova con il sistema locale
    try {
      const localData = localStorage.getItem(`share-code-${importCode.trim().toUpperCase()}`);
      if (localData) {
        const decoded = JSON.parse(atob(localData));
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
          title: "📥 Importazione Riuscita!",
          description: `${importedSchedules.length} promemoria aggiunti`
        });
      } else {
        // Prova decodifica diretta (vecchio sistema)
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
          title: "📥 Importazione Riuscita!",
          description: `${importedSchedules.length} promemoria aggiunti`
        });
      }
    } catch (error) {
      toast({
        title: "Codice Non Valido",
        description: "Controlla che il codice sia corretto",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            👨‍👩‍👧‍👦 Condividi con la Famiglia
          </CardTitle>
          <CardDescription>
            Condividi i tuoi promemoria spazzatura con tutta la famiglia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Button 
              onClick={generateShareCode}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              disabled={schedules.length === 0 || loading}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {loading ? 'Creazione...' : 'Crea Codice Condivisione'}
            </Button>
            {user && (
              <p className="text-xs text-green-600 text-center">
                ✅ Sincronizzazione attiva - I codici vengono salvati online
              </p>
            )}
          </div>
          
          <div className="border-t pt-4">
            <Label htmlFor="import-code">Importa Promemoria Famiglia</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="import-code"
                placeholder="Inserisci qui il codice..."
                value={importCode}
                onChange={(e) => setImportCode(e.target.value.toUpperCase())}
              />
              <Button onClick={importSchedules} disabled={loading}>
                <Upload className="h-4 w-4 mr-2" />
                {loading ? 'Importo...' : 'Importa'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Codice di Condivisione Creato! 🎉</DialogTitle>
            <DialogDescription>
              Condividi questo codice con la tua famiglia
            </DialogDescription>
          </DialogHeader>
          {shareCode && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <Label className="text-sm font-medium text-green-800">Codice Famiglia:</Label>
                <p className="text-2xl font-bold bg-white p-3 rounded mt-2 text-center tracking-wider text-green-700 border-2 border-green-300">
                  {shareCode}
                </p>
              </div>
              <Button onClick={copyShareCode} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                <Copy className="h-4 w-4 mr-2" />
                Copia Codice
              </Button>
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-1">Come funziona:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Copia il codice sopra</li>
                  <li>Invialo alla tua famiglia (WhatsApp, SMS, ecc.)</li>
                  <li>Loro lo inseriscono nella sezione "Importa"</li>
                  <li>I promemoria verranno aggiunti automaticamente! 🎯</li>
                </ol>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};