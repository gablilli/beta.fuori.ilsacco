
import { Trash, Calendar, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WasteSchedule } from '@/pages/Index';

interface WasteTypeCardProps {
  schedule: WasteSchedule;
  onRemove: () => void;
}

export const WasteTypeCard = ({ schedule, onRemove }: WasteTypeCardProps) => {
  const today = new Date();
  const currentDay = today.getDay();
  
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  
  const isToday = schedule.days.includes(currentDay);
  const isTomorrow = schedule.days.includes((currentDay + 1) % 7);
  
  const getDaysUntilNext = () => {
    let minDays = 7;
    for (const day of schedule.days) {
      let daysUntil = day - currentDay;
      if (daysUntil <= 0) {
        daysUntil += 7;
      }
      minDays = Math.min(minDays, daysUntil);
    }
    return minDays;
  };

  const daysUntilNext = getDaysUntilNext();

  const getNextCollectionText = () => {
    if (isToday) return 'Oggi!';
    if (isTomorrow) return 'Domani';
    if (daysUntilNext === 1) return 'Domani';
    return `Tra ${daysUntilNext} giorni`;
  };

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${
      isToday 
        ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50 ring-2 ring-green-200' 
        : 'border-gray-200 hover:border-green-300'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${schedule.color} rounded-xl flex items-center justify-center text-white text-lg`}>
              {schedule.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{schedule.name}</CardTitle>
              <CardDescription>
                {schedule.days.map(day => dayNames[day]).join(', ')}
              </CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onRemove} className="text-red-600">
                <Trash className="h-4 w-4 mr-2" />
                Rimuovi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Prossima raccolta:</span>
          </div>
          <Badge 
            variant={isToday ? "default" : "secondary"}
            className={isToday ? 'bg-green-500 hover:bg-green-600' : ''}
          >
            {getNextCollectionText()}
          </Badge>
        </div>
        
        {schedule.nextCollection && (
          <div className="mt-2 text-xs text-gray-500">
            {schedule.nextCollection.toLocaleDateString('it-IT', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
