
import { Calendar, Clock, CheckCircle } from 'lucide-react';
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
        <h2 className="text-xl font-semibold text-gray-800">Oggi e domani</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Collections */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-green-800">Oggi</CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                {formatDate(today)}
              </Badge>
            </div>
            <CardDescription className="text-green-600">
              Cosa portare fuori oggi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaysCollections.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Nessuna raccolta oggi - riposa! 🌿</span>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-green-100"
                  >
                    <div className={`w-8 h-8 ${collection.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                      {collection.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{collection.name}</p>
                      <p className="text-sm text-gray-600">Da portare fuori oggi</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tomorrow's Collections */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-blue-800">Domani</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000))}
              </Badge>
            </div>
            <CardDescription className="text-blue-600">
              Preparati per domani
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tomorrowsCollections.length === 0 ? (
              <div className="flex items-center gap-2 text-blue-600">
                <Calendar className="h-5 w-5" />
                <span>Nessuna raccolta domani</span>
              </div>
            ) : (
              <div className="space-y-3">
                {tomorrowsCollections.map((collection) => (
                  <div
                    key={collection.id}
                    className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border border-blue-100"
                  >
                    <div className={`w-8 h-8 ${collection.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                      {collection.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{collection.name}</p>
                      <p className="text-sm text-gray-600">Preparati per domani</p>
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
