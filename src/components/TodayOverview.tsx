
import { Calendar, Clock, CheckCircle, AlertCircle, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WeatherWidget } from './WeatherWidget';
import { useToast } from '@/hooks/use-toast';
import type { WasteSchedule } from '@/pages/Index';

interface TodayOverviewProps {
  schedules: WasteSchedule[];
  onMarkCollectionDone?: (collectionId: string, collectionName: string) => void;
}

export const TodayOverview = ({ schedules, onMarkCollectionDone }: TodayOverviewProps) => {
  const today = new Date();
  const currentDay = today.getDay();
  const { toast } = useToast();
  
  // Get collections for the next 7 days
  const getCollectionsForDay = (daysFromToday: number) => {
    const targetDay = (currentDay + daysFromToday) % 7;
    return schedules.filter(schedule => schedule.days.includes(targetDay));
  };

  const formatDate = (daysFromToday: number) => {
    const date = new Date(today.getTime() + daysFromToday * 24 * 60 * 60 * 1000);
    return date.toLocaleDateString('it-IT', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const getDayLabel = (daysFromToday: number) => {
    if (daysFromToday === 0) return 'Oggi';
    if (daysFromToday === 1) return 'Domani';
    if (daysFromToday === 2) return 'Dopodomani';
    return formatDate(daysFromToday);
  };

  // Find next collections (skip today, start from tomorrow)
  const nextCollections = [];
  for (let i = 1; i <= 7; i++) {
    const collections = getCollectionsForDay(i);
    if (collections.length > 0) {
      nextCollections.push({
        day: i,
        collections,
        label: getDayLabel(i),
        date: formatDate(i)
      });
    }
  }

  // Get today's collections (what was supposed to go out)
  const todaysCollections = getCollectionsForDay(0);

  const handleMarkDone = (collection: WasteSchedule) => {
    if (onMarkCollectionDone) {
      onMarkCollectionDone(collection.id, collection.name);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-800">Raccolta differenziata</h2>
      </div>

      {/* Layout principale: Raccolta + Meteo */}
      {nextCollections.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Raccolta principale - 2 colonne */}
          <div className="lg:col-span-2">
            <Card className="border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 ring-2 ring-blue-200 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {nextCollections[0].label}
                  </CardTitle>
                  <Badge variant="default" className="bg-blue-600 text-white">
                    {nextCollections[0].date}
                  </Badge>
                </div>
                <CardDescription className="text-blue-700 font-medium">
                  Prepara questi rifiuti per la raccolta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nextCollections[0].collections.map((collection) => (
                    <div
                      key={collection.id}
                      className="flex items-center gap-3 p-4 bg-white/80 rounded-lg border-2 border-blue-200 shadow-sm"
                    >
                      <div className={`w-10 h-10 ${collection.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                        {collection.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-lg">{collection.name}</p>
                        <p className="text-blue-700 font-medium">Da preparare per {nextCollections[0].label.toLowerCase()}</p>
                      </div>
                      <Button 
                        onClick={() => handleMarkDone(collection)}
                        size="sm"
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Target className="h-4 w-4 mr-1" />
                        Fatto!
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Meteo - 1 colonna */}
          <div className="lg:col-span-1">
            <WeatherWidget />
          </div>
        </div>
      )}

      {/* Altre raccolte future */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {nextCollections.slice(1, 3).map((dayCollection) => (
          <Card key={dayCollection.day} className="border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-green-700">{dayCollection.label}</CardTitle>
                <Badge variant="secondary" className="bg-green-200 text-green-700">
                  {dayCollection.date}
                </Badge>
              </div>
              <CardDescription className="text-green-600">
                Prossime raccolte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dayCollection.collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-green-200"
                  >
                    <div className={`w-8 h-8 ${collection.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                      {collection.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">{collection.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Raccolte di oggi (meno prominenti) */}
      {todaysCollections.length > 0 && (
        <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 opacity-75">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-gray-600">Oggi</CardTitle>
              <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                {formatDate(0)}
              </Badge>
            </div>
            <CardDescription className="text-gray-500 text-sm">
              Cosa andava portato fuori oggi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todaysCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center gap-2 p-2 bg-white/40 rounded border border-gray-100"
                >
                  <div className={`w-6 h-6 ${collection.color} rounded flex items-center justify-center text-white text-sm font-bold opacity-60`}>
                    {collection.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">{collection.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nessuna raccolta */}
      {nextCollections.length === 0 && todaysCollections.length === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Card className="border-gray-200 h-full">
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-600">Nessuna raccolta nei prossimi giorni</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <WeatherWidget />
          </div>
        </div>
      )}
    </div>
  );
};
