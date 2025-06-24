
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
import { DaySelector } from './DaySelector';
import type { WasteSchedule } from '@/pages/Index';

interface AddScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (schedule: Omit<WasteSchedule, 'id'>) => void;
}

const wasteTypes = [
  { value: 'organic', label: 'Organico', icon: '🗑️', color: 'bg-green-500' },
  { value: 'plastic', label: 'Plastica e Lattine', icon: '♻️', color: 'bg-blue-500' },
  { value: 'paper', label: 'Carta e Cartone', icon: '📄', color: 'bg-yellow-500' },
  { value: 'glass', label: 'Vetro', icon: '🫙', color: 'bg-green-600' },
  { value: 'mixed', label: 'Indifferenziata', icon: '🗑️', color: 'bg-gray-500' }
];

export const AddScheduleDialog = ({ open, onOpenChange, onAdd }: AddScheduleDialogProps) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || selectedDays.length === 0) return;

    const wasteType = wasteTypes.find(type => type.value === selectedType);
    if (!wasteType) return;

    const schedule: Omit<WasteSchedule, 'id'> = {
      type: selectedType as any,
      name: customName || wasteType.label,
      days: selectedDays,
      color: wasteType.color,
      icon: wasteType.icon
    };

    onAdd(schedule);
    
    // Reset form
    setSelectedType('');
    setCustomName('');
    setSelectedDays([]);
    onOpenChange(false);
  };

  const selectedWasteType = wasteTypes.find(type => type.value === selectedType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">♻️</span>
            </div>
            Aggiungi Raccolta
          </DialogTitle>
          <DialogDescription>
            Configura i giorni di raccolta per un tipo di rifiuto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo di rifiuto</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona il tipo di rifiuto" />
              </SelectTrigger>
              <SelectContent>
                {wasteTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.icon}</span>
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedType && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome personalizzato (opzionale)</Label>
              <Input
                id="name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={selectedWasteType?.label || ''}
              />
            </div>
          )}

          <DaySelector 
            selectedDays={selectedDays}
            onDaysChange={setSelectedDays}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={!selectedType || selectedDays.length === 0}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              Aggiungi Raccolta
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
