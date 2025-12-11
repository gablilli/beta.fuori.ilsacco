
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
  { value: 'mixed', label: 'Indifferenziata', icon: '🗑️', color: 'bg-gray-500' },
  { value: 'custom', label: 'Personalizzato', icon: '🔧', color: 'bg-purple-500' }
];

const colorOptions = [
  { value: 'bg-green-500', label: 'Verde' },
  { value: 'bg-blue-500', label: 'Blu' },
  { value: 'bg-yellow-500', label: 'Giallo' },
  { value: 'bg-red-500', label: 'Rosso' },
  { value: 'bg-purple-500', label: 'Viola' },
  { value: 'bg-pink-500', label: 'Rosa' },
  { value: 'bg-orange-500', label: 'Arancione' },
  { value: 'bg-teal-500', label: 'Teal' },
  { value: 'bg-gray-500', label: 'Grigio' }
];

export const AddScheduleDialog = ({ open, onOpenChange, onAdd }: AddScheduleDialogProps) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [customIcon, setCustomIcon] = useState('');
  const [customColor, setCustomColor] = useState('bg-purple-500');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType || selectedDays.length === 0) return;

    // Check if custom type and validate required fields
    if (selectedType === 'custom' && (!customName || !customIcon)) return;

    const wasteType = wasteTypes.find(type => type.value === selectedType);
    if (!wasteType) return;

    const schedule: Omit<WasteSchedule, 'id'> = {
      type: selectedType as any,
      name: selectedType === 'custom' ? customName : (customName || wasteType.label),
      days: selectedDays,
      color: selectedType === 'custom' ? customColor : wasteType.color,
      icon: selectedType === 'custom' ? customIcon : wasteType.icon
    };

    onAdd(schedule);
    
    // Reset form
    setSelectedType('');
    setCustomName('');
    setCustomIcon('');
    setCustomColor('bg-purple-500');
    setSelectedDays([]);
    onOpenChange(false);
  };

  const selectedWasteType = wasteTypes.find(type => type.value === selectedType);
  const isCustomType = selectedType === 'custom';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
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

          {selectedType && !isCustomType && (
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

          {isCustomType && (
            <>
              <div className="space-y-2">
                <Label htmlFor="customName">Nome *</Label>
                <Input
                  id="customName"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="es. Pile, Farmaci, RAEE..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customIcon">Emoji *</Label>
                <Input
                  id="customIcon"
                  value={customIcon}
                  onChange={(e) => setCustomIcon(e.target.value)}
                  placeholder="es. 🔋, 💊, 🖥️"
                  maxLength={4}
                  required
                />
                <p className="text-xs text-gray-500">
                  Inserisci un'emoji per rappresentare questo tipo di rifiuto
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customColor">Colore</Label>
                <Select value={customColor} onValueChange={setCustomColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.value}`}></div>
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
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
              disabled={!selectedType || selectedDays.length === 0 || (isCustomType && (!customName || !customIcon))}
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
