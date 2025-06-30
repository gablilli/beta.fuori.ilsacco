
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import type { WasteSchedule } from '@/pages/Index';

interface CalendarViewProps {
  schedules: WasteSchedule[];
}

export const CalendarView = ({ schedules }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getCollectionsForDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    return schedules.filter(schedule => 
      schedule.days.includes(dayOfWeek)
    );
  };

  const getDaysWithCollections = () => {
    const days: Date[] = [];
    const today = new Date();
    
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      if (getCollectionsForDate(date).length > 0) {
        days.push(date);
      }
    }
    
    return days;
  };

  const selectedCollections = getCollectionsForDate(selectedDate);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📅 Calendario delle Raccolte
          </CardTitle>
          <CardDescription>
            Visualizza tutte le raccolte del mese
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                modifiers={{
                  collection: getDaysWithCollections()
                }}
                modifiersStyles={{
                  collection: { 
                    backgroundColor: '#10b981', 
                    color: 'white',
                    fontWeight: 'bold'
                  }
                }}
                locale={it}
                className="rounded-md border"
              />
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale: it })}
              </h3>
              
              {selectedCollections.length > 0 ? (
                <div className="space-y-3">
                  {selectedCollections.map((collection) => (
                    <div
                      key={collection.id}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <div className={`w-10 h-10 ${collection.color} rounded-lg flex items-center justify-center text-white text-lg`}>
                        {collection.icon}
                      </div>
                      <div>
                        <p className="font-medium">{collection.name}</p>
                        <p className="text-sm text-gray-600">Raccolta prevista</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Nessuna raccolta prevista</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
