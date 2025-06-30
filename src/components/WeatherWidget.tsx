
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Cloud, CloudRain, Sun, Wind, Thermometer, MapPin, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeatherData {
  temperature: number;
  condition: string;
  description: string;
  city: string;
}

export const WeatherWidget = () => {
  const [weatherTip, setWeatherTip] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [customCity, setCustomCity] = useState('');
  const { toast } = useToast();

  const generateWeatherTip = (condition: string, temperature: number) => {
    let tip = '';
    switch (condition.toLowerCase()) {
      case 'rain':
        tip = '🌧️ Piove! Considera di rimandare il conferimento della carta per evitare che si bagni.';
        break;
      case 'wind':
        tip = '💨 Vento forte! Assicurati che i sacchi siano ben chiusi e posizionati al riparo.';
        break;
      case 'clear':
        if (temperature > 25) {
          tip = '☀️ Giornata calda! L\'organico potrebbe deteriorarsi velocemente, portalo fuori poco prima del ritiro.';
        } else {
          tip = '☀️ Bella giornata per il conferimento! Perfetta per tutti i tipi di raccolta.';
        }
        break;
      case 'clouds':
        tip = '⛅ Giornata nuvolosa, condizioni ideali per il conferimento della raccolta differenziata.';
        break;
      default:
        tip = '🌡️ Controlla sempre le condizioni meteo prima di portare fuori i rifiuti!';
    }
    return tip;
  };

  const fetchWeather = async (city?: string) => {
    setLoading(true);
    try {
      let url = '';
      
      if (city) {
        url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=demo&units=metric&lang=it`;
      } else {
        // Usa geolocalizzazione
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        
        url = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=demo&units=metric&lang=it`;
      }

      // Simulazione dati (API demo)
      const mockData: WeatherData = {
        temperature: Math.round(15 + Math.random() * 15),
        condition: ['clear', 'clouds', 'rain', 'wind'][Math.floor(Math.random() * 4)],
        description: 'Condizioni simulate',
        city: city || 'La tua posizione'
      };

      setWeatherData(mockData);
      setWeatherTip(generateWeatherTip(mockData.condition, mockData.temperature));
      
      toast({
        title: "🌤️ Meteo Aggiornato",
        description: `Dati meteo per ${mockData.city}`
      });
      
    } catch (error) {
      console.error('Errore meteo:', error);
      toast({
        title: "Errore Meteo",
        description: "Impossibile ottenere i dati meteo. Usando dati simulati.",
        variant: "destructive"
      });
      
      // Fallback ai dati simulati
      const mockData: WeatherData = {
        temperature: 20,
        condition: 'clear',
        description: 'Dati simulati',
        city: 'Simulazione'
      };
      
      setWeatherData(mockData);
      setWeatherTip(generateWeatherTip(mockData.condition, mockData.temperature));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'rain': return <CloudRain className="h-6 w-6 text-blue-500" />;
      case 'clouds': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'wind': return <Wind className="h-6 w-6 text-green-500" />;
      default: return <Thermometer className="h-6 w-6 text-orange-500" />;
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear': return 'Soleggiato';
      case 'rain': return 'Piovoso';
      case 'clouds': return 'Nuvoloso';
      case 'wind': return 'Ventoso';
      default: return 'Variabile';
    }
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {weatherData ? getWeatherIcon(weatherData.condition) : <Thermometer className="h-6 w-6" />}
          🌤️ Meteo & Consigli
        </CardTitle>
        <CardDescription>
          Suggerimenti basati sulle condizioni atmosferiche
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {weatherData && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {getConditionText(weatherData.condition)}
              </Badge>
              <Badge variant="outline">
                {weatherData.temperature}°C
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <MapPin className="h-3 w-3" />
              {weatherData.city}
            </div>
          </div>
        )}
        
        {weatherTip && (
          <div className="bg-white/60 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">
              {weatherTip}
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="city" className="text-xs">Cambia città (opzionale):</Label>
          <div className="flex gap-2">
            <Input
              id="city"
              placeholder="Es: Milano, Roma..."
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              className="text-sm"
            />
            <Button 
              onClick={() => customCity ? fetchWeather(customCity) : fetchWeather()}
              disabled={loading}
              size="sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-blue-600 italic">
          💡 Aggiorna automaticamente la posizione o inserisci una città
        </div>
      </CardContent>
    </Card>
  );
};
