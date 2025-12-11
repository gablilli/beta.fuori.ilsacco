
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Github, Heart } from 'lucide-react';

export const AppInfo = () => {
  const appVersion = 'Early Beta 1.2';
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          ℹ️ Informazioni App
        </CardTitle>
        <CardDescription>
          Dettagli sulla versione e informazioni sull'applicazione
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Versione</span>
            <Badge variant="secondary" className="text-sm">
              {appVersion}
            </Badge>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Informazioni sul Progetto</h4>
            <p className="text-sm text-gray-600 mb-3">
              Fuori il sacco è un'applicazione web gratuita e open source per tracciare i giorni di raccolta differenziata.
            </p>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Github className="h-4 w-4" />
                <a 
                  href="https://github.com/gablilli/beta.fuori.ilsacco" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Repository GitHub
                </a>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Realizzato con passione per l'ambiente</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Caratteristiche</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Promemoria personalizzati</li>
              <li>✅ Sincronizzazione calendario</li>
              <li>✅ Statistiche e gamification</li>
              <li>✅ Condivisione familiare</li>
              <li>✅ Completamente offline-first</li>
              <li>✅ Self-hostable</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
