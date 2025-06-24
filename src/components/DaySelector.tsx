
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DaySelectorProps {
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
}

export const DaySelector = ({ selectedDays, onDaysChange }: DaySelectorProps) => {
  const dayNames = [
    { label: 'Dom', value: 0 },
    { label: 'Lun', value: 1 },
    { label: 'Mar', value: 2 },
    { label: 'Mer', value: 3 },
    { label: 'Gio', value: 4 },
    { label: 'Ven', value: 5 },
    { label: 'Sab', value: 6 }
  ];

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter(d => d !== day));
    } else {
      onDaysChange([...selectedDays, day]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        Giorni di raccolta (seleziona uno o più giorni)
      </label>
      <div className="flex flex-wrap gap-2">
        {dayNames.map((day) => (
          <Button
            key={day.value}
            type="button"
            variant={selectedDays.includes(day.value) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleDay(day.value)}
            className={selectedDays.includes(day.value) 
              ? "bg-green-500 hover:bg-green-600 text-white" 
              : "border-green-200 hover:bg-green-50"
            }
          >
            {day.label}
          </Button>
        ))}
      </div>
      {selectedDays.length > 0 && (
        <div className="flex flex-wrap gap-1">
          <span className="text-xs text-gray-500">Selezionati:</span>
          {selectedDays.sort().map(day => (
            <Badge key={day} variant="secondary" className="text-xs">
              {dayNames[day].label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
