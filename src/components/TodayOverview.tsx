
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WasteSchedule } from '@/pages/Index';

interface TodayOverviewProps {
  schedules: WasteSchedule[];
}

export const TodayOverview = ({ schedules }: TodayOverviewProps) => {
  const today = new Date();
  const currentDay = today.getDay();
  
  // Get today's collections
  const todaysCollections = schedules.filter(schedule => 
    schedule.days.includes(currentDay)
  );

  // Get tomorrow's collections
  const tomorrowDay = (currentDay + 1) % 7;
  const tomorrowsCollections = schedules.filter(schedule => 
    schedule.days.includes(tomorrowDay)
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('it-IT', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-green-600" />
        <h2 className="text-xl font-semibold text-gray-800">Raccolta differenziata</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tomorrow's Collections - PRIORITY */}
        <Card className="border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50 ring-2 ring-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Domani
              </CardTitle>
              <Badge variant="default" className="bg-blue-600 text-white">
                {formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000))}
              </Badge>
            </div>
            <CardDescription className="text-blue-700 font-medium">
              Prepara questi rifiuti per la raccolta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tomorrowsCollections.length === 0 ? (
              <div className="flex items-center gap-2 text-blue-600">
                <CheckCircle className="h-5 w-5" />
                <span>Nessuna raccolta domani - riposa! 🌿</span>
              </div>
            ) : (
              <div className="space-y-3">
                {tomorrowsCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center gap-3 p-4 bg-white/80 rounded-lg border-2 border-blue-200 shadow-sm"
                  >
                    <div className={`w-10 h-10 ${collection.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                      {collection.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-lg">{collection.name}</p>
                      <p className="text-blue-700 font-medium">Da preparare per domani</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Collections - What was supposed to go out */}
        <Card className="border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-700">Oggi</CardTitle>
              <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                {formatDate(today)}
              </Badge>
            </div>
            <CardDescription className="text-gray-600">
              Cosa andava portato fuori oggi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaysCollections.length === 0 ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="h-5 w-5" />
                <span>Nessuna raccolta oggi</span>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-gray-200"
                  >
                    <div className={`w-8 h-8 ${collection.color} rounded-lg flex items-center justify-center text-white font-bold opacity-75`}>
                      {collection.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-700">{collection.name}</p>
                      <p className="text-sm text-gray-500">Raccolta di oggi</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
