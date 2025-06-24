
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { WasteSchedule } from '@/pages/Index';

interface AddScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (schedule: Omit<WasteSchedule, 'id'>) => void;
}

const wasteTypes = [
  { value: 'organic', label: 'Organico', color: 'bg-green-500', icon: '🗑️' },
  { value: 'plastic', label: 'Plastica', color: 'bg-blue-500', icon: '♻️' },
  { value: 'paper', label: 'Carta', color: 'bg-yellow-500', icon: '📄' },
  { value: 'glass', label: 'Vetro', color: 'bg-purple-500', icon: '🫙' },
  { value: 'mixed', label: 'Indifferenziato', color: 'bg-gray-500', icon: '🗑️' }
] as const;

const dayNames = [
  { value: 0, label: 'Domenica' },
  { value: 1, label: 'Lunedì' },
  { value: 2, label: 'Martedì' },
  { value: 3, label: 'Mercoledì' },
  { value: 4, label: 'Giovedì' },
  { value: 5, label: 'Venerdì' },
  { value: 6, label: 'Sabato' }
];

export const AddScheduleDialog = ({ open, onOpenChange, onAdd }: AddScheduleDialogProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<WasteSchedule['type']>('organic');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || selectedDays.length === 0) {
      return;
    }

    const wasteType = wasteTypes.find(w => w.value === type)!;
    
    onAdd({
      type,
      name: name.trim(),
      days: selectedDays,
      color: wasteType.color,
      icon: wasteType.icon
    });

    // Reset form
    setName('');
    setType('organic');
    setSelectedDays([]);
    onOpenChange(false);
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Aggiungi calendario raccolta</DialogTitle>
          <DialogDescription>
            Configura un nuovo tipo di raccolta con i giorni della settimana.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome raccolta</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Organico, Plastica..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo di rifiuto</Label>
            <Select value={type} onValueChange={(value: WasteSchedule['type']) => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {wasteTypes.map((wasteType) => (
                  <SelectItem key={wasteType.value} value={wasteType.value}>
                    <div className="flex items-center gap-2">
                      <span>{wasteType.icon}</span>
                      <span>{wasteType.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Giorni di raccolta</Label>
            <div className="grid grid-cols-2 gap-2">
              {dayNames.map((day) => (
                <div key={day.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.value}`}
                    checked={selectedDays.includes(day.value)}
                    onCheckedChange={() => toggleDay(day.value)}
                  />
                  <Label htmlFor={`day-${day.value}`} className="text-sm">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button 
              type="submit"
              disabled={!name.trim() || selectedDays.length === 0}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              Aggiungi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
