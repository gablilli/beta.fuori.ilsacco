import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import type { WasteSchedule } from '@/pages/Index';

interface CompactCalendarWidgetProps {
  schedules: WasteSchedule[];
}

export const CompactCalendarWidget = ({ schedules }: CompactCalendarWidgetProps) => {
  const dayNames = ['D', 'L', 'M', 'M', 'G', 'V', 'S'];
  
  // Get collection days for each day of the week
  const getCollectionsForDay = (dayIndex: number) => {
    return schedules.filter(schedule => schedule.days.includes(dayIndex));
  };

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-green-600" />
          📅 Giorni di Raccolta
        </CardTitle>
        <CardDescription>
          Calendario settimanale delle raccolte
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {dayNames.map((dayName, dayIndex) => {
            const collections = getCollectionsForDay(dayIndex);
            const hasCollection = collections.length > 0;
            
            return (
              <div
                key={dayIndex}
                className="flex flex-col items-center"
              >
                <div className={`text-xs font-medium mb-2 ${
                  hasCollection ? 'text-green-700' : 'text-gray-500'
                }`}>
                  {dayName}
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                  hasCollection 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {hasCollection ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-xs">{collections[0].icon}</div>
                      {collections.length > 1 && (
                        <div className="text-[8px] leading-none">+{collections.length - 1}</div>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {schedules.length > 0 && (
          <div className="mt-4 pt-4 border-t border-green-200">
            <div className="text-xs text-gray-600 mb-2">Legenda:</div>
            <div className="flex flex-wrap gap-2">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center gap-1 text-xs">
                  <span>{schedule.icon}</span>
                  <span className="text-gray-700">{schedule.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
