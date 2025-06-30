
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cloud, CloudRain, Sun, Wind, Thermometer } from 'lucide-react';

export const WeatherWidget = () => {
  const [weatherTip, setWeatherTip] = useState('');
  const [temperature, setTemperature] = useState<number | null>(null);
  const [condition, setCondition] = useState('');

  // Simulazione meteo (in un'app reale useresti API come OpenWeatherMap)
  useEffect(() => {
    const generateMockWeather = () => {
      const conditions = ['sunny', 'rainy', 'cloudy', 'windy'];
      const temps = [15, 18, 22, 25, 28];
      
      const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
      const randomTemp = temps[Math.floor(Math.random() * temps.length)];
      
      setCondition(randomCondition);
      setTemperature(randomTemp);
      
      // Genera consigli basati sul "meteo"
      let tip = '';
      switch (randomCondition) {
        case 'rainy':
          tip = '🌧️ Piove! Considera di rimandare il conferimento della carta per evitare che si bagni.';
          break;
        case 'windy':
          tip = '💨 Vento forte! Assicurati che i sacchi siano ben chiusi e posizionati al riparo.';
          break;
        case 'sunny':
          if (randomTemp > 25) {
            tip = '☀️ Giornata calda! L\'organico potrebbe deteriorarsi velocemente, portalo fuori poco prima del ritiro.';
          } else {
            tip = '☀️ Bella giornata per il conferimento! Perfetta per tutti i tipi di raccolta.';
          }
          break;
        case 'cloudy':
          tip = '⛅ Giornata nuvolosa, condizioni ideali per il conferimento della raccolta differenziata.';
          break;
        default:
          tip = '🌡️ Controlla sempre le condizioni meteo prima di portare fuori i rifiuti!';
      }
      
      setWeatherTip(tip);
    };

    generateMockWeather();
    
    // Aggiorna ogni ora
    const interval = setInterval(generateMockWeather, 3600000);
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = () => {
    switch (condition) {
      case 'sunny': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'rainy': return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'cloudy': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'windy': return <Wind className="h-6 w-6 text-green-500" />;
      default: return <Thermometer className="h-6 w-6 text-orange-500" />;
    }
  };

  const getConditionText = () => {
    switch (condition) {
      case 'sunny': return 'Soleggiato';
      case 'rainy': return 'Piovoso';
      case 'cloudy': return 'Nuvoloso';
      case 'windy': return 'Ventoso';
      default: return 'Variabile';
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getWeatherIcon()}
          🌤️ Meteo & Consigli
        </CardTitle>
        <CardDescription>
          Suggerimenti basati sulle condizioni atmosferiche
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {getConditionText()}
            </Badge>
            {temperature && (
              <Badge variant="outline">
                {temperature}°C
              </Badge>
            )}
          </div>
        </div>
        
        {weatherTip && (
          <div className="bg-white/60 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">
              {weatherTip}
            </p>
          </div>
        )}
        
        <div className="text-xs text-blue-600 italic">
          💡 I consigli si aggiornano automaticamente ogni ora
        </div>
      </CardContent>
    </Card>
  );
};
