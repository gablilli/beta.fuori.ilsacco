
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Recycle } from "lucide-react";
import { DaySelector } from './DaySelector';
import type { WasteSchedule } from '@/pages/Index';

interface OnboardingWizardProps {
  onComplete: (schedules: Omit<WasteSchedule, 'id'>[]) => void;
}

const wasteTypes = [
  { value: 'organic', label: 'Organico', icon: '🗑️', color: 'bg-green-500', description: 'Scarti alimentari, avanzi' },
  { value: 'plastic', label: 'Plastica e Lattine', icon: '♻️', color: 'bg-blue-500', description: 'Bottiglie, contenitori, lattine' },
  { value: 'paper', label: 'Carta e Cartone', icon: '📄', color: 'bg-yellow-500', description: 'Giornali, scatole, riviste' },
  { value: 'glass', label: 'Vetro', icon: '🫙', color: 'bg-green-600', description: 'Bottiglie, vasetti, contenitori' },
  { value: 'mixed', label: 'Indifferenziata', icon: '🗑️', color: 'bg-gray-500', description: 'Tutto il resto' }
];

export const OnboardingWizard = ({ onComplete }: OnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWastes, setSelectedWastes] = useState<Array<{
    type: string;
    name: string;
    icon: string;
    color: string;
    days: number[];
  }>>([]);

  const [currentWasteConfig, setCurrentWasteConfig] = useState<{
    type: string;
    name: string;
    icon: string;
    color: string;
    days: number[];
  } | null>(null);

  const handleWasteTypeSelect = (wasteType: typeof wasteTypes[0]) => {
    setCurrentWasteConfig({
      type: wasteType.value,
      name: wasteType.label,
      icon: wasteType.icon,
      color: wasteType.color,
      days: []
    });
    setCurrentStep(1);
  };

  const handleDaysSelect = (days: number[]) => {
    if (currentWasteConfig) {
      setCurrentWasteConfig({
        ...currentWasteConfig,
        days
      });
    }
  };

  const handleSaveCurrentWaste = () => {
    if (currentWasteConfig && currentWasteConfig.days.length > 0) {
      setSelectedWastes(prev => [...prev, currentWasteConfig]);
      setCurrentWasteConfig(null);
      setCurrentStep(0);
    }
  };

  const handleFinishOnboarding = () => {
    const schedules = selectedWastes.map(waste => ({
      type: waste.type as any,
      name: waste.name,
      days: waste.days,
      color: waste.color,
      icon: waste.icon
    }));
    onComplete(schedules);
  };

  const getDayNames = () => {
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
    return currentWasteConfig?.days.map(day => dayNames[day]).join(', ') || '';
  };

  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Recycle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Benvenuto in EcoTracker!
            </h1>
            <p className="text-gray-600 text-lg">
              Configuriamo insieme la raccolta differenziata della tua zona
            </p>
          </div>

          {selectedWastes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Raccolte configurate:</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedWastes.map((waste, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {waste.icon} {waste.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {wasteTypes.map((wasteType) => {
              const isSelected = selectedWastes.some(w => w.type === wasteType.value);
              return (
                <Card 
                  key={wasteType.value}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${
                    isSelected ? 'ring-2 ring-green-400 bg-green-50' : 'hover:border-green-300'
                  }`}
                  onClick={() => !isSelected && handleWasteTypeSelect(wasteType)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${wasteType.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                        {wasteType.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{wasteType.label}</CardTitle>
                        <CardDescription className="text-sm">
                          {wasteType.description}
                        </CardDescription>
                      </div>
                      {isSelected && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <div className="text-center">
            {selectedWastes.length > 0 && (
              <Button
                onClick={handleFinishOnboarding}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Completa configurazione
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
            {selectedWastes.length === 0 && (
              <p className="text-gray-500">Seleziona i tipi di rifiuto raccolti nella tua zona</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 1 && currentWasteConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className={`w-10 h-10 ${currentWasteConfig.color} rounded-xl flex items-center justify-center text-white`}>
                {currentWasteConfig.icon}
              </div>
              {currentWasteConfig.name}
            </CardTitle>
            <CardDescription>
              Seleziona i giorni di raccolta per questo tipo di rifiuto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DaySelector 
              selectedDays={currentWasteConfig.days}
              onDaysChange={handleDaysSelect}
            />
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep(0);
                  setCurrentWasteConfig(null);
                }}
                className="flex-1"
              >
                Indietro
              </Button>
              <Button
                onClick={handleSaveCurrentWaste}
                disabled={currentWasteConfig.days.length === 0}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                Salva
              </Button>
            </div>
            
            {currentWasteConfig.days.length > 0 && (
              <p className="text-sm text-gray-600 text-center">
                Giorni selezionati: {getDayNames()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};
